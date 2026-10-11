import React, { useEffect, useRef, useState } from 'react';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';
import { 
  Compass, 
  MapPin, 
  Target, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Move, 
  Crosshair, 
  Layers, 
  Check, 
  X, 
  LocateFixed, 
  Radio, 
  Eye, 
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  worldToSvg,
  svgToWorld,
  screenToWorld,
  worldToScreen,
  zoomAtPoint,
  zoomAtCenter,
  panByScreenDelta,
  focusWorldPoint,
  fitAllBounds,
  validateGoalPoint,
  Point2D,
  ViewportTransform
} from '../utils/coordinateTransforms';

export interface TacticalArenaMapProps {
  className?: string;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
}

export type MapInteractionMode = 'inspect' | 'goal' | 'pan' | 'waypoint';
export type ObservationState = 'FREE' | 'FOLLOW_ROBOT' | 'FOCUS_ROBOT' | 'FOCUS_GOAL' | 'FIT_ALL';
export type GoalExecutionStatus = 'IDLE' | 'CONFIRMING' | 'RUNNING' | 'REACHED' | 'BLOCKED' | 'FAILED';

export const TacticalArenaMap: React.FC<TacticalArenaMapProps> = ({ 
  className = '',
  onToggleMaximize,
  isMaximized = false
}) => {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  
  // Map Layer Visibility
  const [showPlannedPath, setShowPlannedPath] = useState<boolean>(true);
  const [showActualTrail, setShowActualTrail] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSensorRays, setShowSensorRays] = useState<boolean>(true);
  const [showObstacles, setShowObstacles] = useState<boolean>(true);

  // View Transformation State (Map Interaction Controller)
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [observationState, setObservationState] = useState<ObservationState>('FREE');
  const [interactionMode, setInteractionMode] = useState<MapInteractionMode>('inspect');

  // Fullscreen & Container Resize State
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);

  // Cursor & Hover Tracking (World coordinates)
  const [cursorWorldPos, setCursorWorldPos] = useState<Point2D | null>(null);
  
  // Click-to-Goal Lifecycle State
  const [pendingGoal, setPendingGoal] = useState<Point2D | null>(null);
  const [goalStatus, setGoalStatus] = useState<GoalExecutionStatus>('IDLE');
  const [goalFeedbackMessage, setGoalFeedbackMessage] = useState<string | null>(null);

  // DOM Refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fresh-value refs to eliminate closure stale-state during high-frequency events
  const currentTransformRef = useRef<ViewportTransform>({ zoom: 1.0, panX: 0, panY: 0 });
  const interactionModeRef = useRef<MapInteractionMode>('inspect');
  const observationStateRef = useRef<ObservationState>('FREE');
  const isSpacePressedRef = useRef<boolean>(false);
  const isMouseOverMapRef = useRef<boolean>(false);

  // Pointer drag state
  const isPointerDownRef = useRef<boolean>(false);
  const isPanDragRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const dragStartTransformRef = useRef<ViewportTransform>({ zoom: 1.0, panX: 0, panY: 0 });
  const hasExceededDragThresholdRef = useRef<boolean>(false);
  
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isActivelyPanning, setIsActivelyPanning] = useState<boolean>(false);

  // Synchronize refs with state
  useEffect(() => {
    currentTransformRef.current = { zoom, panX, panY };
  }, [zoom, panX, panY]);

  useEffect(() => {
    interactionModeRef.current = interactionMode;
  }, [interactionMode]);

  useEffect(() => {
    observationStateRef.current = observationState;
  }, [observationState]);

  // Subscribe to simulation store
  useEffect(() => {
    const unsub = simulationStore.subscribe(() => {
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  // Real-time Robot coordinates in SVG space
  const robotSvg = worldToSvg({ x: simState.x, z: simState.z });
  const robotAngleDeg = (simState.yaw * 180) / Math.PI;

  // Follow Robot camera logic: continuously centers on robot when state is FOLLOW_ROBOT
  useEffect(() => {
    if (observationState !== 'FOLLOW_ROBOT') return;
    const targetPanX = 300 - zoom * robotSvg.u;
    const targetPanY = 200 - zoom * robotSvg.v;
    currentTransformRef.current = { zoom, panX: targetPanX, panY: targetPanY };
    setPanX(targetPanX);
    setPanY(targetPanY);
  }, [observationState, robotSvg.u, robotSvg.v, zoom]);

  // Non-passive wheel event listener on SVG: enables e.preventDefault() without console warnings
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const nextTransform = zoomAtPoint(
        { clientX: e.clientX, clientY: e.clientY },
        currentTransformRef.current,
        zoomFactor,
        svg
      );

      if (observationStateRef.current === 'FOLLOW_ROBOT') {
        setObservationState('FREE');
      }

      currentTransformRef.current = nextTransform;
      setZoom(nextTransform.zoom);
      setPanX(nextTransform.panX);
      setPanY(nextTransform.panY);
    };

    svg.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      svg.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // Spacebar listener with event capture: intercepts Space over the map for panning without triggering emergency modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === 'Escape') {
        setPendingGoal(null);
        setGoalStatus('IDLE');
        setGoalFeedbackMessage(null);
        if (interactionModeRef.current === 'goal') {
          setInteractionMode('inspect');
        }
      }
      if (e.code === 'Space') {
        if (isMouseOverMapRef.current) {
          e.stopPropagation();
          e.preventDefault();
          isSpacePressedRef.current = true;
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (isMouseOverMapRef.current) {
          e.stopPropagation();
        }
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };

    const handleWindowBlur = () => {
      isSpacePressedRef.current = false;
      setIsSpacePressed(false);
      isPointerDownRef.current = false;
      isPanDragRef.current = false;
      setIsActivelyPanning(false);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Monitor arrival at pending goal
  useEffect(() => {
    if (goalStatus !== 'RUNNING' || !pendingGoal) return;
    const dist = Math.hypot(pendingGoal.x - simState.x, pendingGoal.z - simState.z);
    
    // Arrival threshold: 0.08 meters (8 cm)
    if (dist <= 0.08) {
      setGoalStatus('REACHED');
      simulationStore.setMotorSpeeds(0, 0, `Đích Đến Thành Công: Đã tới (${pendingGoal.x.toFixed(2)}, ${pendingGoal.z.toFixed(2)})m`);
      simulationStore.addLog({
        type: 'event',
        source: 'Click-to-Goal',
        pythonCode: `# Target reached at (${pendingGoal.x.toFixed(2)}, ${pendingGoal.z.toFixed(2)})m`,
        leftVal: 0,
        rightVal: 0,
        linearVel: 0,
        angularVel: 0,
        actionText: `Mục tiêu đã đạt: (${pendingGoal.x.toFixed(2)}, ${pendingGoal.z.toFixed(2)})m`,
        explanation: 'Robot đã tiến vào bán kính mục tiêu thành công.',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400'
      });
    } else if (simState.sensors.isObstacleDetected && simState.sensors.obstacleDistanceM < 0.15) {
      setGoalStatus('BLOCKED');
      simulationStore.setMotorSpeeds(0, 0, 'Cảnh báo chướng ngại vật cản đường mục tiêu!');
    }
  }, [simState.x, simState.z, simState.sensors, goalStatus, pendingGoal]);

  // Fullscreen change & ResizeObserver handling
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      // Trigger smooth re-render without tearing or resetting state
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --------------------------------------------------------------------------
  // ZOOM ACTIONS
  // --------------------------------------------------------------------------
  const handleZoomCenter = (factor: number) => {
    const nextTransform = zoomAtCenter(currentTransformRef.current, factor);
    if (observationStateRef.current === 'FOLLOW_ROBOT') {
      setObservationState('FREE');
    }
    currentTransformRef.current = nextTransform;
    setZoom(nextTransform.zoom);
    setPanX(nextTransform.panX);
    setPanY(nextTransform.panY);
  };

  // --------------------------------------------------------------------------
  // CAMERA OBSERVATION MODES
  // --------------------------------------------------------------------------
  const handleFocusRobot = () => {
    const nextTransform = focusWorldPoint({ x: simState.x, z: simState.z }, zoom);
    currentTransformRef.current = nextTransform;
    setPanX(nextTransform.panX);
    setPanY(nextTransform.panY);
    setObservationState('FOCUS_ROBOT');
  };

  const handleToggleFollowRobot = () => {
    if (observationState === 'FOLLOW_ROBOT') {
      setObservationState('FREE');
    } else {
      setObservationState('FOLLOW_ROBOT');
      const nextTransform = focusWorldPoint({ x: simState.x, z: simState.z }, zoom);
      currentTransformRef.current = nextTransform;
      setPanX(nextTransform.panX);
      setPanY(nextTransform.panY);
    }
  };

  const handleFocusGoal = () => {
    const targetPoint = pendingGoal || (
      simState.plannedTrajectory.length > 0
        ? { x: simState.plannedTrajectory[simState.plannedTrajectory.length - 1].x, z: simState.plannedTrajectory[simState.plannedTrajectory.length - 1].z }
        : null
    );

    if (targetPoint) {
      const nextTransform = focusWorldPoint(targetPoint, zoom);
      currentTransformRef.current = nextTransform;
      setPanX(nextTransform.panX);
      setPanY(nextTransform.panY);
      setObservationState('FOCUS_GOAL');
    }
  };

  const handleFitAll = () => {
    const nextTransform = fitAllBounds();
    currentTransformRef.current = nextTransform;
    setZoom(nextTransform.zoom);
    setPanX(nextTransform.panX);
    setPanY(nextTransform.panY);
    setObservationState('FIT_ALL');
  };

  // --------------------------------------------------------------------------
  // POINTER EVENT HANDLERS (POINTER CAPTURE & DRAG THRESHOLD)
  // --------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking on any interactive overlay button, do not capture or start map drag
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('[role="button"]')) {
      return;
    }

    // Only handle primary left click (0) or middle click (1)
    if (e.button !== 0 && e.button !== 1) return;

    if (e.button === 1) {
      e.preventDefault();
    }

    isPointerDownRef.current = true;
    activePointerIdRef.current = e.pointerId;
    pointerDownPosRef.current = { clientX: e.clientX, clientY: e.clientY };
    dragStartTransformRef.current = { ...currentTransformRef.current };
    hasExceededDragThresholdRef.current = false;

    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    const isPanIntent = isMiddleClick || (isLeftClick && (isSpacePressedRef.current || interactionModeRef.current === 'pan'));

    isPanDragRef.current = isPanIntent;

    if (isPanIntent) {
      setIsActivelyPanning(true);
      if (observationStateRef.current === 'FOLLOW_ROBOT') {
        setObservationState('FREE');
      }
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Track cursor in World coordinates for HUD
    if (svgRef.current) {
      const worldPos = screenToWorld(
        { clientX: e.clientX, clientY: e.clientY },
        svgRef.current,
        currentTransformRef.current
      );
      setCursorWorldPos(worldPos);
    }

    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - pointerDownPosRef.current.clientX;
    const deltaY = e.clientY - pointerDownPosRef.current.clientY;
    const distanceMoved = Math.hypot(deltaX, deltaY);

    // Enforce 5px drag threshold
    if (distanceMoved > 5) {
      hasExceededDragThresholdRef.current = true;
    }

    if (isPanDragRef.current && hasExceededDragThresholdRef.current && svgRef.current) {
      const nextTransform = panByScreenDelta(
        deltaX,
        deltaY,
        dragStartTransformRef.current,
        svgRef.current
      );
      currentTransformRef.current = nextTransform;
      setPanX(nextTransform.panX);
      setPanY(nextTransform.panY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('[role="button"]')) {
      isPointerDownRef.current = false;
      isPanDragRef.current = false;
      setIsActivelyPanning(false);
      return;
    }

    const wasDragging = hasExceededDragThresholdRef.current;
    isPointerDownRef.current = false;
    isPanDragRef.current = false;
    setIsActivelyPanning(false);

    try {
      if (activePointerIdRef.current !== null && e.currentTarget.hasPointerCapture(activePointerIdRef.current)) {
        e.currentTarget.releasePointerCapture(activePointerIdRef.current);
      }
    } catch {
      // Ignore
    }
    activePointerIdRef.current = null;

    // Strict Rule: If user dragged (> 5px), DO NOT place Goal or Waypoint!
    if (wasDragging) {
      return;
    }

    // Only handle primary left click for placement
    if (e.button !== 0 || interactionModeRef.current === 'pan') {
      return;
    }

    if (!svgRef.current) return;
    const clickedWorld = screenToWorld(
      { clientX: e.clientX, clientY: e.clientY },
      svgRef.current,
      currentTransformRef.current
    );

    if (interactionModeRef.current === 'goal') {
      // Validate candidate goal position
      const validation = validateGoalPoint(clickedWorld, simState.obstacles);
      if (!validation.isValid) {
        setGoalFeedbackMessage(validation.reason || 'Vị trí mục tiêu không hợp lệ');
        setPendingGoal(null);
        setGoalStatus('BLOCKED');
        setTimeout(() => setGoalFeedbackMessage(null), 4000);
        return;
      }

      setPendingGoal(clickedWorld);
      setGoalStatus('CONFIRMING');
      setGoalFeedbackMessage(null);
    } else if (interactionModeRef.current === 'waypoint') {
      const newWp = {
        id: `wp_${Date.now()}`,
        x: clickedWorld.x,
        z: clickedWorld.z,
        speed: 0.35
      };
      const updatedTrajectory = [...simState.plannedTrajectory, newWp];
      simulationStore.addLog({
        type: 'command',
        source: 'Bản Đồ Sa Bàn',
        pythonCode: `add_waypoint(${newWp.x.toFixed(2)}, ${newWp.z.toFixed(2)})`,
        leftVal: 0,
        rightVal: 0,
        linearVel: simState.linearVel,
        angularVel: simState.angularVel,
        actionText: `Thêm Waypoint WP${updatedTrajectory.length} tại (${newWp.x.toFixed(2)}, ${newWp.z.toFixed(2)})m`,
        explanation: 'Tọa độ tính toán từ phép biến đổi nghịch đảo chính xác của Coordinate Engine.',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-400'
      });
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    isPanDragRef.current = false;
    setIsActivelyPanning(false);
    try {
      if (activePointerIdRef.current !== null && e.currentTarget.hasPointerCapture(activePointerIdRef.current)) {
        e.currentTarget.releasePointerCapture(activePointerIdRef.current);
      }
    } catch {
      // Ignore
    }
    activePointerIdRef.current = null;
  };

  // --------------------------------------------------------------------------
  // CLICK-TO-GOAL EXECUTION
  // --------------------------------------------------------------------------
  const handleStartNavigationToGoal = () => {
    if (!pendingGoal) return;
    setGoalStatus('RUNNING');

    const dx = pendingGoal.x - simState.x;
    const dz = pendingGoal.z - simState.z;
    const dist = Math.hypot(dx, dz);
    const targetAngle = Math.atan2(dz, dx);
    const angleDiff = targetAngle - simState.yaw;
    const normAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    let left = 0.35;
    let right = 0.35;
    if (Math.abs(normAngle) > 0.2) {
      if (normAngle > 0) {
        left = 0.15;
        right = 0.45;
      } else {
        left = 0.45;
        right = 0.15;
      }
    }

    simulationStore.setMotorSpeeds(
      left, 
      right, 
      `Click-to-Goal: Điều hướng tới (${pendingGoal.x.toFixed(2)}, ${pendingGoal.z.toFixed(2)})m [Khoảng cách: ${dist.toFixed(2)}m]`
    );

    if (simState.executionState !== 'RUNNING') {
      simulationStore.run();
    }
  };

  const handleCancelGoal = () => {
    setPendingGoal(null);
    setGoalStatus('IDLE');
    setGoalFeedbackMessage(null);
  };

  const getCursorClass = () => {
    if (isActivelyPanning) return 'cursor-grabbing';
    if (isSpacePressed || interactionMode === 'pan') return 'cursor-grab';
    if (interactionMode === 'goal' || interactionMode === 'waypoint') return 'cursor-crosshair';
    return 'cursor-default';
  };

  const isFollowing = observationState === 'FOLLOW_ROBOT';

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col h-full w-full bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl select-none transition-all ${
        isFullscreenMap ? 'fixed inset-0 z-50 rounded-none border-none p-2 bg-[#050914]' : ''
      } ${className}`}
    >
      {/* ============================================================================== */}
      {/* 1. TOP FLOATING OSD: ARENA BADGE & CURSOR COORDINATES                         */}
      {/* ============================================================================== */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-sm">
          3.0m × 2.0m
        </span>

        {cursorWorldPos && (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60 shadow-sm hidden sm:inline-block">
            X: <strong className="text-cyan-300">{cursorWorldPos.x.toFixed(2)}m</strong> | Z: <strong className="text-cyan-300">{cursorWorldPos.z.toFixed(2)}m</strong>
          </span>
        )}
      </div>

      {/* ============================================================================== */}
      {/* 2. TOP RIGHT FLOATING OSD: LAYER TOGGLES & FULLSCREEN                         */}
      {/* ============================================================================== */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 p-1 bg-slate-950/85 backdrop-blur-md rounded-xl border border-cyan-500/30 text-[11px] shadow-sm pointer-events-auto">
        <button
          onClick={() => setShowPlannedPath(!showPlannedPath)}
          className={`min-h-[24px] min-w-[24px] px-2 py-0.5 rounded-lg font-bold border transition ${
            showPlannedPath
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Quỹ Đạo Dự Kiến"
          aria-label="Toggle Planned Path"
        >
          Mẫu
        </button>

        <button
          onClick={() => setShowActualTrail(!showActualTrail)}
          className={`min-h-[24px] min-w-[24px] px-2 py-0.5 rounded-lg font-bold border transition ${
            showActualTrail
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Vết Đường Đi Thực Tế"
          aria-label="Toggle Actual Trail"
        >
          Vết
        </button>

        <button
          onClick={() => setShowSensorRays(!showSensorRays)}
          className={`min-h-[24px] min-w-[24px] px-2 py-0.5 rounded-lg font-bold border transition ${
            showSensorRays
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Tia Cảm Biến"
          aria-label="Toggle Sensor Rays"
        >
          Tia
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`min-h-[24px] min-w-[24px] px-2 py-0.5 rounded-lg font-bold border transition ${
            showGrid
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Lưới Tọa Độ"
          aria-label="Toggle Grid"
        >
          Lưới
        </button>

        <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

        <button
          data-testid="fullscreen-map-btn"
          onClick={() => setIsFullscreenMap(!isFullscreenMap)}
          className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white transition flex items-center justify-center"
          title={isFullscreenMap ? "Thoát toàn màn hình bản đồ" : "Toàn màn hình bản đồ"}
          aria-label="Toggle Fullscreen Map"
        >
          {isFullscreenMap ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ============================================================================== */}
      {/* 3. SVG VECTOR ARENA MAP CANVAS (POINTER EVENTS ENGINE)                          */}
      {/* ============================================================================== */}
      <div 
        className="relative w-full h-full flex-1 min-h-0 bg-[#050914] flex items-center justify-center p-1 sm:p-2 overflow-hidden touch-none"
        onPointerEnter={() => { isMouseOverMapRef.current = true; }}
        onPointerLeave={() => { isMouseOverMapRef.current = false; setCursorWorldPos(null); }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <svg
          ref={svgRef}
          data-testid="tactical-map-svg"
          className={`w-full h-full rounded-xl border border-slate-800/80 ${getCursorClass()}`}
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16233B" strokeWidth="0.8" />
            </pattern>
            {/* Arrow Marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8" />
            </marker>
            {/* Target Beacon Glow */}
            <radialGradient id="targetBeacon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#EC4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Fixed Grid Background when grid layer active */}
          {showGrid && <rect width="100%" height="100%" fill="url(#tacticalGrid)" />}

          {/* ========================================================================== */}
          {/* TRANSFORMED MAP SCENE GRAPH (PAN & ZOOM APPLIED)                           */}
          {/* ========================================================================== */}
          <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
            {/* Arena Coordinate Axes (X: 300, Z: 200 center) */}
            <line x1="300" y1="20" x2="300" y2="380" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="20" y1="200" x2="580" y2="200" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="560" y="215" fill="#64748B" fontSize="10" fontFamily="monospace">X (m)</text>
            <text x="310" y="35" fill="#64748B" fontSize="10" fontFamily="monospace">Z (m)</text>

            {/* Outer Boundary Wall with Real Dimensions */}
            <rect x="15" y="15" width="570" height="370" fill="none" stroke="#0284C7" strokeWidth="3" rx="8" />

            {/* Race Track Circuit */}
            <path
              d="M 120 100 C 300 40, 480 80, 500 200 C 520 320, 380 350, 240 340 C 100 330, 60 220, 120 100 Z"
              fill="none"
              stroke="#1E293B"
              strokeWidth="52"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 120 100 C 300 40, 480 80, 500 200 C 520 320, 380 350, 240 340 C 100 330, 60 220, 120 100 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="46"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 120 100 C 300 40, 480 80, 500 200 C 520 320, 380 350, 240 340 C 100 330, 60 220, 120 100 Z"
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.5"
              strokeDasharray="12 10"
              strokeLinecap="round"
            />

            {/* Planned Trajectory Waypoints */}
            {showPlannedPath && (
              <g>
                <polyline
                  points={simState.plannedTrajectory
                    .map((wp) => {
                      const svgPt = worldToSvg({ x: wp.x, z: wp.z });
                      return `${svgPt.u},${svgPt.v}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.8"
                />
                {simState.plannedTrajectory.map((wp, idx) => {
                  const svgPt = worldToSvg({ x: wp.x, z: wp.z });
                  return (
                    <g key={wp.id} transform={`translate(${svgPt.u}, ${svgPt.v})`}>
                      <circle r="5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
                      <text y="-8" textAnchor="middle" fill="#FDE68A" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        WP{idx + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Actual Trajectory History Trail */}
            {showActualTrail && simState.actualTrajectory.length > 1 && (
              <polyline
                points={simState.actualTrajectory
                  .map((p) => {
                    const svgPt = worldToSvg({ x: p.x, z: p.z });
                    return `${svgPt.u},${svgPt.v}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            )}

            {/* Obstacles on Arena with Real Physics Bounds */}
            {showObstacles && simState.obstacles.map((obs) => {
              const svgPt = worldToSvg({ x: obs.x, z: obs.z });
              const rPx = (obs.radius / 3.0) * 600;

              return (
                <g key={obs.id}>
                  {/* Physical collision bounding radius */}
                  <circle cx={svgPt.u} cy={svgPt.v} r={rPx + 15} fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  {obs.type === 'cylinder' ? (
                    <circle cx={svgPt.u} cy={svgPt.v} r={rPx} fill={obs.color} stroke="#7F1D1D" strokeWidth="2" />
                  ) : (
                    <rect
                      x={svgPt.u - rPx}
                      y={svgPt.v - rPx}
                      width={rPx * 2}
                      height={rPx * 2}
                      fill={obs.color}
                      stroke="#1E293B"
                      strokeWidth="1.5"
                      rx="3"
                    />
                  )}
                  <text x={svgPt.u} y={svgPt.v + rPx + 12} textAnchor="middle" fill="#CBD5E1" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {obs.nameVi}
                  </text>
                </g>
              );
            })}

            {/* Pending Click-to-Goal Target Pin Indicator */}
            {pendingGoal && (
              <g transform={`translate(${worldToSvg(pendingGoal).u}, ${worldToSvg(pendingGoal).v})`}>
                <circle r="22" fill="url(#targetBeacon)" className="animate-ping" opacity="0.75" />
                <circle r="8" fill="#EC4899" stroke="#FFF" strokeWidth="2" />
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#FFF" strokeWidth="1.5" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#FFF" strokeWidth="1.5" />
                <text y="-14" textAnchor="middle" fill="#F472B6" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  MỤC TIÊU
                </text>
              </g>
            )}

            {/* Robot Representation */}
            <g transform={`translate(${robotSvg.u}, ${robotSvg.v}) rotate(${robotAngleDeg})`}>
              {/* Ultrasonic & Camera Sensor Rays */}
              {showSensorRays && (
                <g>
                  {/* Camera Vision Cone */}
                  <path
                    d="M 0 0 L 80 -45 L 80 45 Z"
                    fill="rgba(250, 204, 21, 0.15)"
                    stroke="rgba(250, 204, 21, 0.45)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  {/* Ultrasonic forward beam */}
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.min(120, (simState.sensors.ultrasonicDistCm / 300) * 600)}
                    y2="0"
                    stroke={simState.sensors.isObstacleDetected ? '#EF4444' : '#10B981'}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </g>
              )}

              {/* Left Wheel */}
              <rect x="-14" y="-22" width="28" height="8" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
              {/* Right Wheel */}
              <rect x="-14" y="14" width="28" height="8" rx="2" fill="#EA580C" stroke="#FB923C" strokeWidth="1.5" />

              {/* JetBot Chassis Body */}
              <rect x="-16" y="-14" width="32" height="28" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.8" />

              {/* Jetson Nano Heatsink */}
              <rect x="-10" y="-9" width="18" height="18" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1" />

              {/* CSI Camera Front Marker */}
              <circle cx="16" cy="0" r="4" fill="#10B981" stroke="#047857" strokeWidth="1.5" />

              {/* Heading Arrow */}
              <line x1="0" y1="0" x2="28" y2="0" stroke="#38BDF8" strokeWidth="2.5" markerEnd="url(#arrow)" />
            </g>
          </g>
        </svg>

        {/* ============================================================================== */}
        {/* 4. BOTTOM FLOATING INTERACTIVE CONTROLLER: ZOOM, PAN, FOCUS & MODES           */}
        {/* ============================================================================== */}
        <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 text-[11px] shadow-lg pointer-events-auto">
          {/* Interaction Modes */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/60">
            <button
              data-testid="mode-inspect-btn"
              onClick={() => setInteractionMode('inspect')}
              className={`min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'inspect' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Quan Sát (Inspect) - Xem vị trí và đo tọa độ"
              aria-label="Mode Inspect"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quan Sát</span>
            </button>

            <button
              data-testid="mode-pan-btn"
              onClick={() => setInteractionMode('pan')}
              className={`min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'pan' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Kéo Bản Đồ (Pan) - Có thể kéo chuột hoặc Space + chuột trái"
              aria-label="Mode Pan"
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kéo</span>
            </button>

            <button
              data-testid="mode-goal-btn"
              onClick={() => setInteractionMode('goal')}
              className={`min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'goal' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Click-to-Goal: Bấm lên bản đồ để đặt mục tiêu"
              aria-label="Mode Goal"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mục Tiêu</span>
            </button>
          </div>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Camera Centering & Follow Actions */}
          <div className="flex items-center gap-0.5">
            <button
              data-testid="focus-robot-btn"
              onClick={handleFocusRobot}
              className="min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
              title="Đưa Robot vào trung tâm tầm nhìn (Focus Robot)"
              aria-label="Focus Robot"
            >
              <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Tâm Robot</span>
            </button>

            <button
              data-testid="follow-robot-btn"
              onClick={handleToggleFollowRobot}
              className={`min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold border transition flex items-center gap-1 ${
                isFollowing
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isFollowing ? "Đang khóa camera theo robot (Bấm để hủy)" : "Tự động di chuyển camera theo Robot (Follow Robot)"}
              aria-label="Toggle Follow Robot"
            >
              <Radio className={`w-3.5 h-3.5 ${isFollowing ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span className="hidden md:inline">{isFollowing ? 'Đang Theo' : 'Theo Robot'}</span>
            </button>

            <button
              data-testid="focus-goal-btn"
              onClick={handleFocusGoal}
              className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center"
              title="Căn tâm theo mục tiêu (Focus Goal)"
              aria-label="Focus Goal"
            >
              <Target className="w-3.5 h-3.5 text-pink-400" />
            </button>

            <button
              data-testid="fit-all-btn"
              onClick={handleFitAll}
              className="min-h-[24px] min-w-[24px] px-2 py-1 rounded-lg font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-[10px]"
              title="Vừa khung hình toàn bộ bản đồ (Fit to Frame / Fit All)"
              aria-label="Fit All"
            >
              Vừa Khung
            </button>
          </div>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Zoom Controller */}
          <div className="flex items-center gap-1">
            <button
              data-testid="zoom-out-btn"
              onClick={() => handleZoomCenter(0.8)}
              className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition flex items-center justify-center"
              title="Thu nhỏ bản đồ (-)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              data-testid="zoom-badge"
              onClick={handleFitAll}
              className="min-h-[24px] px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-[10px] text-cyan-300 font-bold hover:border-cyan-400 transition"
              title="Mức phóng to hiện tại (Bấm để đặt lại 100%)"
              aria-label="Current Zoom Percentage"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              data-testid="zoom-in-btn"
              onClick={() => handleZoomCenter(1.25)}
              className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition flex items-center justify-center"
              title="Phóng to bản đồ (+)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 5. FLOATING BOTTOM-LEFT TELEMETRY BADGE                                        */}
        {/* ============================================================================== */}
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-black/85 backdrop-blur-md border border-cyan-500/25 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-300 shadow-xl space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">ROBOT:</span>
            <span>X: {simState.x.toFixed(2)}m</span>
            <span>Z: {simState.z.toFixed(2)}m</span>
            <span>Yaw: {((simState.yaw * 180) / Math.PI).toFixed(0)}°</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>v: {(simState.linearVel * 100).toFixed(1)} cm/s</span>
            <span>|</span>
            <span>ω: {simState.angularVel.toFixed(2)} rad/s</span>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 6. GOAL CONFIRMATION PILL & FEEDBACK BANNER                                   */}
        {/* ============================================================================== */}
        {pendingGoal && (
          <div data-testid="goal-confirmation-pill" className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/95 backdrop-blur-lg border border-pink-500/50 rounded-2xl shadow-2xl pointer-events-auto animate-bounce-subtle">
            <Target className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-xs font-mono text-white">
              Đích: X=<strong className="text-pink-300">{pendingGoal.x.toFixed(2)}m</strong>, Z=<strong className="text-pink-300">{pendingGoal.z.toFixed(2)}m</strong>
              <span className="text-slate-400 ml-1">
                ({Math.hypot(pendingGoal.x - simState.x, pendingGoal.z - simState.z).toFixed(2)}m)
              </span>
            </span>

            {goalStatus === 'RUNNING' ? (
              <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-400/40 text-[10px] font-bold animate-pulse">
                Đang Chạy...
              </span>
            ) : goalStatus === 'REACHED' ? (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã Đến!
              </span>
            ) : (
              <button
                onClick={handleStartNavigationToGoal}
                className="min-h-[24px] px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition"
                title="Bắt đầu điều hướng robot tới mục tiêu đã chọn"
                aria-label="Start Navigation to Goal"
              >
                <Check className="w-3.5 h-3.5" /> Bắt Đầu
              </button>
            )}

            <button
              onClick={handleCancelGoal}
              className="min-h-[24px] min-w-[24px] p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
              title="Hủy chọn mục tiêu"
              aria-label="Cancel Goal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Validation Warning Feedback Toast */}
        {goalFeedbackMessage && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 bg-red-950/90 backdrop-blur-md border border-red-500/60 rounded-xl shadow-xl text-red-200 text-xs font-mono animate-fade-in pointer-events-auto">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{goalFeedbackMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
