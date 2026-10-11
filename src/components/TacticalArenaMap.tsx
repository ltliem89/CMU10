import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Sparkles 
} from 'lucide-react';

export interface TacticalArenaMapProps {
  className?: string;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
}

export type MapInteractionMode = 'inspect' | 'goal' | 'pan' | 'waypoint';

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
  const [isFollowingRobot, setIsFollowingRobot] = useState<boolean>(false);
  const [interactionMode, setInteractionMode] = useState<MapInteractionMode>('inspect');

  // Fullscreen Map State
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);

  // Cursor & Hover Tracking
  const [cursorWorldPos, setCursorWorldPos] = useState<{ x: number; z: number } | null>(null);
  const [pendingGoal, setPendingGoal] = useState<{ x: number; z: number } | null>(null);
  const [activeGoalConfirmed, setActiveGoalConfirmed] = useState<boolean>(false);

  // Drag / Pan interaction refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startPanX: number; startPanY: number }>({
    clientX: 0,
    clientY: 0,
    startPanX: 0,
    startPanY: 0
  });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isActivelyPanning, setIsActivelyPanning] = useState<boolean>(false);

  // Subscribe to simulation store
  useEffect(() => {
    const unsub = simulationStore.subscribe(() => {
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  // Map coordinate conversion rules:
  // World: X: -1.5m .. 1.5m (width 3.0m), Z: -1.0m .. 1.0m (length 2.0m)
  // Base SVG Canvas: viewBox 0 0 600 400
  const worldToSvgX = useCallback((x: number) => ((x + 1.5) / 3.0) * 600, []);
  const worldToSvgY = useCallback((z: number) => ((z + 1.0) / 2.0) * 400, []);
  const svgToWorldX = useCallback((u: number) => (u / 600) * 3.0 - 1.5, []);
  const svgToWorldZ = useCallback((v: number) => (v / 400) * 2.0 - 1.0, []);

  const robotSvgX = worldToSvgX(simState.x);
  const robotSvgY = worldToSvgY(simState.z);
  const robotAngleDeg = (simState.yaw * 180) / Math.PI;

  // Follow Robot Camera Logic
  useEffect(() => {
    if (!isFollowingRobot) return;
    // Keep robot at SVG center (300, 200)
    setPanX(300 - zoom * robotSvgX);
    setPanY(200 - zoom * robotSvgY);
  }, [isFollowingRobot, robotSvgX, robotSvgY, zoom]);

  // Spacebar tracking for Pan interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Convert client mouse event to base SVG and World coordinates
  const getCoordinatesFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    // View coordinates inside SVG viewport [0, 600] x [0, 400]
    const uSvg = ((clientX - rect.left) / rect.width) * 600;
    const vSvg = ((clientY - rect.top) / rect.height) * 400;

    // Inverse display transform: uBase = (uSvg - panX) / zoom
    const uBase = (uSvg - panX) / zoom;
    const vBase = (vSvg - panY) / zoom;

    // World coordinates in meters
    const worldX = Math.max(-1.5, Math.min(1.5, parseFloat(svgToWorldX(uBase).toFixed(3))));
    const worldZ = Math.max(-1.0, Math.min(1.0, parseFloat(svgToWorldZ(vBase).toFixed(3))));

    return { uSvg, vSvg, uBase, vBase, worldX, worldZ };
  }, [panX, zoom, svgToWorldX, svgToWorldZ]);

  // Zoom Handler with Focal Point Anchoring
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(0.5, Math.min(5.0, zoom * zoomFactor));
    if (Math.abs(newZoom - zoom) < 0.001) return;

    // Focal point preservation formula:
    // P = uSvg; newPan = P - (newZoom / zoom) * (P - pan)
    const ratio = newZoom / zoom;
    const newPanX = coords.uSvg - ratio * (coords.uSvg - panX);
    const newPanY = coords.vSvg - ratio * (coords.vSvg - panY);

    if (isFollowingRobot) setIsFollowingRobot(false);
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  // Zoom Button Handlers (Centered on Viewport Center 300, 200)
  const zoomAtCenter = (factor: number) => {
    const newZoom = Math.max(0.5, Math.min(5.0, zoom * factor));
    const ratio = newZoom / zoom;
    const centerX = 300;
    const centerY = 200;
    const newPanX = centerX - ratio * (centerX - panX);
    const newPanY = centerY - ratio * (centerY - panY);

    if (isFollowingRobot) setIsFollowingRobot(false);
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  // Focus Modes
  const handleFocusRobot = () => {
    setPanX(300 - zoom * robotSvgX);
    setPanY(200 - zoom * robotSvgY);
  };

  const handleToggleFollowRobot = () => {
    const next = !isFollowingRobot;
    setIsFollowingRobot(next);
    if (next) {
      setPanX(300 - zoom * robotSvgX);
      setPanY(200 - zoom * robotSvgY);
    }
  };

  const handleFocusGoal = () => {
    if (pendingGoal) {
      const gx = worldToSvgX(pendingGoal.x);
      const gz = worldToSvgY(pendingGoal.z);
      setPanX(300 - zoom * gx);
      setPanY(200 - zoom * gz);
      if (isFollowingRobot) setIsFollowingRobot(false);
    } else if (simState.plannedTrajectory.length > 0) {
      const wp = simState.plannedTrajectory[simState.plannedTrajectory.length - 1];
      const gx = worldToSvgX(wp.x);
      const gz = worldToSvgY(wp.z);
      setPanX(300 - zoom * gx);
      setPanY(200 - zoom * gz);
      if (isFollowingRobot) setIsFollowingRobot(false);
    }
  };

  const handleFitAll = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setIsFollowingRobot(false);
  };

  // Pointer / Mouse Down (Start Pan or Goal Selection)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    const shouldPan = isMiddleClick || (isLeftClick && (isSpacePressed || interactionMode === 'pan'));

    if (shouldPan) {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsActivelyPanning(true);
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startPanX: panX,
        startPanY: panY
      };
      if (isFollowingRobot) setIsFollowingRobot(false);
      return;
    }

    // Goal or Waypoint placement on primary left click
    if (isLeftClick && !isSpacePressed) {
      const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
      if (!coords) return;

      if (interactionMode === 'goal') {
        setPendingGoal({ x: coords.worldX, z: coords.worldZ });
        setActiveGoalConfirmed(false);
      } else if (interactionMode === 'waypoint') {
        const newWp = {
          id: `wp_${Date.now()}`,
          x: coords.worldX,
          z: coords.worldZ,
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
          explanation: 'Tọa độ thế giới tính từ phép biến đổi nghịch đảo chính xác của Map Controller.',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-400'
        });
      }
    }
  };

  // Mouse Move: Pan update or cursor coordinate hover calculation
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingRef.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const deltaScreenX = e.clientX - dragStartRef.current.clientX;
      const deltaScreenY = e.clientY - dragStartRef.current.clientY;

      const deltaSvgX = (deltaScreenX / rect.width) * 600;
      const deltaSvgY = (deltaScreenY / rect.height) * 400;

      setPanX(dragStartRef.current.startPanX + deltaSvgX);
      setPanY(dragStartRef.current.startPanY + deltaSvgY);
      return;
    }

    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (coords) {
      setCursorWorldPos({ x: coords.worldX, z: coords.worldZ });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsActivelyPanning(false);
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsActivelyPanning(false);
    }
    setCursorWorldPos(null);
  };

  // Start Navigation to Pending Goal
  const handleStartNavigationToGoal = () => {
    if (!pendingGoal) return;
    setActiveGoalConfirmed(true);

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

  // Cancel Goal
  const handleCancelGoal = () => {
    setPendingGoal(null);
    setActiveGoalConfirmed(false);
  };

  // Cursor style determination
  const getCursorClass = () => {
    if (isActivelyPanning) return 'cursor-grabbing';
    if (isSpacePressed || interactionMode === 'pan') return 'cursor-grab';
    if (interactionMode === 'goal' || interactionMode === 'waypoint') return 'cursor-crosshair';
    return 'cursor-default';
  };

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
          className={`px-2 py-0.5 rounded-lg font-bold border transition ${
            showPlannedPath
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Quỹ Đạo Dự Kiến"
        >
          Mẫu
        </button>

        <button
          onClick={() => setShowActualTrail(!showActualTrail)}
          className={`px-2 py-0.5 rounded-lg font-bold border transition ${
            showActualTrail
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Vết Đường Đi Thực Tế"
        >
          Vết
        </button>

        <button
          onClick={() => setShowSensorRays(!showSensorRays)}
          className={`px-2 py-0.5 rounded-lg font-bold border transition ${
            showSensorRays
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Tia Cảm Biến"
        >
          Tia
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-0.5 rounded-lg font-bold border transition ${
            showGrid
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Lưới Tọa Độ"
        >
          Lưới
        </button>

        <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

        <button
          data-testid="fullscreen-map-btn"
          onClick={() => setIsFullscreenMap(!isFullscreenMap)}
          className="p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
          title={isFullscreenMap ? "Thoát toàn màn hình bản đồ" : "Toàn màn hình bản đồ"}
        >
          {isFullscreenMap ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ============================================================================== */}
      {/* 3. SVG VECTOR ARENA MAP CANVAS                                                 */}
      {/* ============================================================================== */}
      <div className="relative w-full h-full flex-1 min-h-0 bg-[#050914] flex items-center justify-center p-1 sm:p-2 overflow-hidden">
        <svg
          ref={svgRef}
          className={`w-full h-full rounded-xl border border-slate-800/80 ${getCursorClass()}`}
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
                    .map((wp) => `${worldToSvgX(wp.x)},${worldToSvgY(wp.z)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.8"
                />
                {simState.plannedTrajectory.map((wp, idx) => (
                  <g key={wp.id} transform={`translate(${worldToSvgX(wp.x)}, ${worldToSvgY(wp.z)})`}>
                    <circle r="5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
                    <text y="-8" textAnchor="middle" fill="#FDE68A" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      WP{idx + 1}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Actual Trajectory History Trail */}
            {showActualTrail && simState.actualTrajectory.length > 1 && (
              <polyline
                points={simState.actualTrajectory
                  .map((p) => `${worldToSvgX(p.x)},${worldToSvgY(p.z)}`)
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
              const ox = worldToSvgX(obs.x);
              const oy = worldToSvgY(obs.z);
              const rPx = (obs.radius / 3.0) * 600;

              return (
                <g key={obs.id}>
                  {/* Physical collision bounding radius */}
                  <circle cx={ox} cy={oy} r={rPx + 15} fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  {obs.type === 'cylinder' ? (
                    <circle cx={ox} cy={oy} r={rPx} fill={obs.color} stroke="#7F1D1D" strokeWidth="2" />
                  ) : (
                    <rect
                      x={ox - rPx}
                      y={oy - rPx}
                      width={rPx * 2}
                      height={rPx * 2}
                      fill={obs.color}
                      stroke="#1E293B"
                      strokeWidth="1.5"
                      rx="3"
                    />
                  )}
                  <text x={ox} y={oy + rPx + 12} textAnchor="middle" fill="#CBD5E1" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {obs.nameVi}
                  </text>
                </g>
              );
            })}

            {/* Pending Click-to-Goal Target Pin Indicator */}
            {pendingGoal && (
              <g transform={`translate(${worldToSvgX(pendingGoal.x)}, ${worldToSvgY(pendingGoal.z)})`}>
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
            <g transform={`translate(${robotSvgX}, ${robotSvgY}) rotate(${robotAngleDeg})`}>
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
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'inspect' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Quan Sát (Inspect)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quan Sát</span>
            </button>

            <button
              data-testid="mode-pan-btn"
              onClick={() => setInteractionMode('pan')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'pan' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Kéo Bản Đồ (Pan) - Có thể giữ chuột giữa hoặc Space + chuột trái"
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kéo</span>
            </button>

            <button
              data-testid="mode-goal-btn"
              onClick={() => setInteractionMode('goal')}
              className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                interactionMode === 'goal' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Click-to-Goal: Bấm lên bản đồ để đặt mục tiêu"
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
              className="px-2 py-1 rounded-lg font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
              title="Đưa Robot vào trung tâm tầm nhìn (Focus Robot)"
            >
              <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Tâm Robot</span>
            </button>

            <button
              data-testid="follow-robot-btn"
              onClick={handleToggleFollowRobot}
              className={`px-2 py-1 rounded-lg font-bold border transition flex items-center gap-1 ${
                isFollowingRobot
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isFollowingRobot ? "Đang khóa camera theo robot (Bấm để hủy)" : "Tự động di chuyển camera theo Robot (Follow Robot)"}
            >
              <Radio className={`w-3.5 h-3.5 ${isFollowingRobot ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span className="hidden md:inline">{isFollowingRobot ? 'Đang Theo' : 'Theo Robot'}</span>
            </button>

            <button
              data-testid="focus-goal-btn"
              onClick={handleFocusGoal}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Căn tâm theo mục tiêu (Focus Goal)"
            >
              <Target className="w-3.5 h-3.5 text-pink-400" />
            </button>

            <button
              data-testid="fit-all-btn"
              onClick={handleFitAll}
              className="px-2 py-1 rounded-lg font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-[10px]"
              title="Vừa khung hình toàn bộ bản đồ (Fit to Frame / Fit All)"
            >
              Vừa Khung
            </button>
          </div>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Zoom Controller */}
          <div className="flex items-center gap-1">
            <button
              data-testid="zoom-out-btn"
              onClick={() => zoomAtCenter(0.8)}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition"
              title="Thu nhỏ bản đồ (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              data-testid="zoom-badge"
              onClick={handleFitAll}
              className="px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-[10px] text-cyan-300 font-bold hover:border-cyan-400 transition"
              title="Mức phóng to hiện tại (Bấm để đặt lại 100%)"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              data-testid="zoom-in-btn"
              onClick={() => zoomAtCenter(1.25)}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition"
              title="Phóng to bản đồ (+)"
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
        {/* 6. GOAL CONFIRMATION PILL (WHEN PENDING GOAL IS SET)                          */}
        {/* ============================================================================== */}
        {pendingGoal && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/95 backdrop-blur-lg border border-pink-500/50 rounded-2xl shadow-2xl pointer-events-auto animate-bounce-subtle">
            <Target className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-xs font-mono text-white">
              Đích: X=<strong className="text-pink-300">{pendingGoal.x.toFixed(2)}m</strong>, Z=<strong className="text-pink-300">{pendingGoal.z.toFixed(2)}m</strong>
            </span>
            <button
              onClick={handleStartNavigationToGoal}
              className="px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition"
              title="Bắt đầu điều hướng robot tới mục tiêu đã chọn"
            >
              <Check className="w-3.5 h-3.5" /> Bắt Đầu
            </button>
            <button
              onClick={handleCancelGoal}
              className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Hủy chọn mục tiêu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
