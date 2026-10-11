import React, { useEffect, useState, useRef } from 'react';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  AlertTriangle,
  Compass,
  Gauge,
  Terminal,
  Activity,
  Code,
  Zap,
  Sliders,
  Copy,
  Check,
  SplitSquareVertical,
  Maximize2,
  Minimize2,
  Box,
  Eye,
  Camera,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Move,
  RotateCw,
  RefreshCw,
  Monitor,
  Columns,
  LayoutGrid,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  Focus,
  Maximize,
  Pipette,
  GripHorizontal
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TacticalArenaMap } from './TacticalArenaMap';
import { Robot3DCanvas } from './Robot3DCanvas';
import { DynamicCameraFPV } from './DynamicCameraFPV';
import { ErrorBoundary } from './ErrorBoundary';
import { InspectionMode, ComponentSpec } from '../types/robotGeometry';

export interface TripleViewCockpitProps {
  onEmergencyStop?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export type CockpitLayout = 'standard' | 'focus' | 'split' | 'triple' | 'pip' | 'fullscreen';
export type ViewportId = 'map' | '3d' | 'fpv';

/**
 * Isolated Telemetry HUD Strip: subscribes independently to simulation store
 * to display high-frequency metrics (t, pos, yaw, pwm) without triggering
 * re-renders of the entire Cockpit layout tree.
 */
export const CockpitTelemetryStrip: React.FC = React.memo(() => {
  const [telemetry, setTelemetry] = useState(() => {
    const s = simulationStore.getState();
    return {
      t: s.simTimeSec,
      x: s.x,
      z: s.z,
      yaw: s.yaw,
      pwmL: s.pwmL,
      pwmR: s.pwmR
    };
  });

  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const now = performance.now();
      // Throttle display updates to ~15-20 FPS for silky DOM rendering without micro-jank
      if (now - lastTime < 50) return;
      lastTime = now;
      const s = simulationStore.getState();
      setTelemetry({
        t: s.simTimeSec,
        x: s.x,
        z: s.z,
        yaw: s.yaw,
        pwmL: s.pwmL,
        pwmR: s.pwmR
      });
    });
    return unsub;
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-cyan-300 bg-[#090F1E] px-3 py-1 rounded-xl border border-cyan-500/20">
      <span>T: {telemetry.t.toFixed(1)}s</span>
      <span>|</span>
      <span className="text-emerald-400 font-bold">POS: ({telemetry.x.toFixed(2)}, {telemetry.z.toFixed(2)})m</span>
      <span>|</span>
      <span className="text-amber-400">YAW: {((telemetry.yaw * 180) / Math.PI).toFixed(0)}°</span>
      <span>|</span>
      <span className="text-blue-400">PWM: {telemetry.pwmL}% / {telemetry.pwmR}%</span>
    </div>
  );
});

export const TripleViewCockpit: React.FC<TripleViewCockpitProps> = ({
  onEmergencyStop,
  isSidebarCollapsed = false,
  onToggleSidebar,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [layout, setLayout] = useState<CockpitLayout>('standard');
  const [inspectionMode, setInspectionMode] = useState<InspectionMode>('realistic');
  const [selectedComp, setSelectedComp] = useState<ComponentSpec | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTabConsole, setActiveTabConsole] = useState<'telemetry' | 'python' | 'flow'>('telemetry');

  // Sub-panel visibility states for flexible workspace customization
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const [showFpv, setShowFpv] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);

  // Individual viewport maximize state ('map' | '3d' | 'fpv' | null)
  const [maximizedViewport, setMaximizedViewport] = useState<ViewportId | null>(null);

  // Viewport slot configuration: 3D Twin is the main simulation focal point (Simulation-First)
  const [slotAssignments, setSlotAssignments] = useState<{
    main: ViewportId;
    sub1: ViewportId;
    sub2: ViewportId;
  }>({
    main: '3d',
    sub1: 'map',
    sub2: 'fpv'
  });

  const [draggedViewport, setDraggedViewport] = useState<ViewportId | null>(null);

  // Picture-in-Picture floating window position
  const [pipPos, setPipPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const [isDraggingPip, setIsDraggingPip] = useState<boolean>(false);
  const pipDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pipContainerRef = useRef<HTMLDivElement>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Selective subscription: re-render cockpit only when state structure or interactive parameters change
  useEffect(() => {
    let lastState = simulationStore.getState();
    const unsub = simulationStore.subscribe(() => {
      const curr = simulationStore.getState();
      if (
        curr.executionState !== lastState.executionState ||
        curr.targetLeftSpeed !== lastState.targetLeftSpeed ||
        curr.targetRightSpeed !== lastState.targetRightSpeed ||
        curr.activePythonCode !== lastState.activePythonCode ||
        curr.logs.length !== lastState.logs.length
      ) {
        lastState = curr;
        setSimState(curr);
      }
    });
    return unsub;
  }, []);

  // Synchronize layout with external fullscreen toggle
  useEffect(() => {
    if (isFullscreen && layout !== 'fullscreen') {
      setLayout('fullscreen');
    } else if (!isFullscreen && layout === 'fullscreen') {
      setLayout('standard');
    }
  }, [isFullscreen]);

  // Handle Focus mode: auto-collapse sidebar to maximize simulation space
  useEffect(() => {
    if (layout === 'focus') {
      if (!isSidebarCollapsed && onToggleSidebar) {
        onToggleSidebar();
      }
      setShowControls(false);
      setShowConsole(false);
    }
  }, [layout]);

  // Keyboard shortcut listener for Emergency Stop (Spacebar) and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut interception when user is typing in inputs or textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        simulationStore.emergencyStop();
        if (onEmergencyStop) onEmergencyStop();
      } else if (e.key === 'Escape') {
        if (maximizedViewport) {
          setMaximizedViewport(null);
        } else if (layout === 'fullscreen' || isFullscreen) {
          selectLayout('standard');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(0.5, 0.5, 'Bàn Phím: Phím Lên (Tiến)');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(-0.4, -0.4, 'Bàn Phím: Phím Xuống (Lùi)');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(-0.4, 0.4, 'Bàn Phím: Phím Trái (Xoay Trái)');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(0.4, -0.4, 'Bàn Phím: Phím Phải (Xoay Phải)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEmergencyStop, maximizedViewport, layout, isFullscreen]);

  const handleCopyPython = () => {
    navigator.clipboard.writeText(simState.activePythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Reset entire layout to default standard state
  const handleResetLayout = () => {
    setLayout('standard');
    setMaximizedViewport(null);
    setShowControls(true);
    setShowConsole(true);
    setShowFpv(true);
    setShowTelemetry(true);
    setSlotAssignments({ main: '3d', sub1: 'map', sub2: 'fpv' });
    setPipPos({ x: 24, y: 24 });
    if (isFullscreen && onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  // Drag and drop viewport slot reordering
  const handleDragStart = (e: React.DragEvent, id: ViewportId) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedViewport(id);
  };

  const handleDropSlot = (targetSlot: 'main' | 'sub1' | 'sub2') => {
    if (!draggedViewport) return;
    const currentSourceSlot = Object.keys(slotAssignments).find(
      (k) => slotAssignments[k as keyof typeof slotAssignments] === draggedViewport
    ) as keyof typeof slotAssignments;

    if (currentSourceSlot && currentSourceSlot !== targetSlot) {
      const targetViewport = slotAssignments[targetSlot];
      setSlotAssignments({
        ...slotAssignments,
        [targetSlot]: draggedViewport,
        [currentSourceSlot]: targetViewport
      });
    }
    setDraggedViewport(null);
  };

  // Floating PiP drag handling
  const handlePipMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPip(true);
    pipDragOffsetRef.current = {
      x: e.clientX - pipPos.x,
      y: e.clientY - pipPos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPip) return;
      setPipPos({
        x: Math.max(10, Math.min(window.innerWidth - 340, e.clientX - pipDragOffsetRef.current.x)),
        y: Math.max(10, Math.min(window.innerHeight - 260, e.clientY - pipDragOffsetRef.current.y))
      });
    };

    const handleMouseUp = () => {
      if (isDraggingPip) setIsDraggingPip(false);
    };

    if (isDraggingPip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPip]);

  const isRunning = simState.executionState === 'RUNNING';

  // Render individual viewports by ID
  const renderViewport = (id: ViewportId, isPipMode: boolean = false) => {
    const isMax = maximizedViewport === id;
    const toggleMaximize = () => {
      setMaximizedViewport(isMax ? null : id);
    };

    if (id === 'map') {
      return (
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'map')}
          className="relative flex flex-col h-full w-full min-w-0 min-h-0 bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl group"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-[#0C152B] to-[#122347] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="cursor-grab active:cursor-grabbing text-cyan-400/60 hover:text-cyan-300">
                <GripHorizontal className="w-4 h-4" />
              </span>
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Bản Đồ Sa Bàn Đua 2D/3D</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMaximize}
                title={isMax ? 'Thu nhỏ khung' : 'Phóng to riêng khung bản đồ'}
                className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Toggle Maximize Map Viewport"
              >
                {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden relative">
            <TacticalArenaMap 
              className="w-full h-full border-none shadow-none rounded-none" 
              onToggleMaximize={toggleMaximize}
              isMaximized={isMax}
            />
          </div>
        </div>
      );
    }

    if (id === '3d') {
      return (
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, '3d')}
          className="relative flex flex-col h-full w-full min-w-0 min-h-0 bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl group"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-[#0C152B] to-[#122347] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="cursor-grab active:cursor-grabbing text-cyan-400/60 hover:text-cyan-300">
                <GripHorizontal className="w-4 h-4" />
              </span>
              <Box className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Robot JetBot 3D Twin</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={inspectionMode}
                onChange={(e) => setInspectionMode(e.target.value as InspectionMode)}
                className="bg-[#050812] border border-cyan-500/30 text-cyan-200 text-[11px] font-bold rounded-lg px-2 py-0.5"
              >
                <option value="realistic">Thực Tế (PBR)</option>
                <option value="wireframe">Khung Dây</option>
                <option value="components">Linh Kiện</option>
                <option value="collision">Va Chạm</option>
                <option value="coordinates">Tọa Độ XYZ</option>
                <option value="sensors">Góc FOV</option>
                <option value="dimensions">CAD</option>
              </select>
              <button
                onClick={toggleMaximize}
                title={isMax ? 'Thu nhỏ khung' : 'Phóng to riêng khung 3D'}
                className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Toggle Maximize 3D Viewport"
              >
                {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-0 min-h-0 relative">
            <ErrorBoundary fallbackTitle="Lỗi Khởi Tạo 3D Canvas">
              <Robot3DCanvas
                leftSpeed={simState.actualLeftSpeed}
                rightSpeed={simState.actualRightSpeed}
                inspectionMode={inspectionMode}
                onInspectionModeChange={setInspectionMode}
                selectedComponentId={selectedComp?.id}
                onSelectComponent={setSelectedComp}
              />
            </ErrorBoundary>
          </div>
        </div>
      );
    }

    if (id === 'fpv') {
      return (
        <div
          draggable={!isPipMode}
          onDragStart={(e) => !isPipMode && handleDragStart(e, 'fpv')}
          className="relative flex flex-col h-full w-full min-w-0 min-h-0 bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl group"
        >
          <div
            onMouseDown={isPipMode ? handlePipMouseDown : undefined}
            className={`px-3 py-2 bg-gradient-to-r from-[#0C152B] to-[#122347] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs select-none ${
              isPipMode ? 'cursor-move' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {!isPipMode && (
                <span className="cursor-grab active:cursor-grabbing text-cyan-400/60 hover:text-cyan-300">
                  <GripHorizontal className="w-4 h-4" />
                </span>
              )}
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Camera FPV Thực Tế</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMaximize}
                title={isMax ? 'Thu nhỏ khung' : 'Phóng to riêng FPV Camera'}
                className="min-h-[24px] min-w-[24px] p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Toggle Maximize FPV Viewport"
              >
                {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-0 min-h-0 relative">
            <DynamicCameraFPV className="w-full h-full border-none shadow-none rounded-none" />
          </div>
        </div>
      );
    }

    return null;
  };

  // Switch layout mode and update fullscreen if necessary
  const selectLayout = (newLayout: CockpitLayout) => {
    setLayout(newLayout);
    setMaximizedViewport(null);
    if (newLayout === 'fullscreen') {
      if (!isFullscreen && onToggleFullscreen) onToggleFullscreen();
    } else {
      if (isFullscreen && onToggleFullscreen) onToggleFullscreen();
    }
  };

  return (
    <div
      className={`bg-[#050914] text-white flex flex-col space-y-3 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 h-screen w-screen overflow-hidden'
          : 'rounded-3xl border border-cyan-500/30 shadow-2xl p-4 sm:p-5 h-[calc(100vh-140px)] min-h-[720px]'
      }`}
    >
      {/* ============================================================================== */}
      {/* 1. MISSION CONTROL HEADER                                                      */}
      {/* ============================================================================== */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#122347] to-[#1E3A8A] px-3.5 py-2 rounded-2xl border border-cyan-500/25 flex flex-wrap items-center justify-between gap-2.5 shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
            <Compass className="w-4.5 h-4.5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
                JetBot Virtual Lab • Simulation Workspace
              </h1>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Lớp 11 STEM
              </span>
            </div>
            <p className="text-[10px] text-cyan-200/80">
              Vùng làm việc lấy khung mô phỏng làm trung tâm • Phân bổ linh hoạt 70–80% diện tích
            </p>
          </div>
        </div>

        {/* Primary Command Actions: RUN, PAUSE, STEP, RESET, E-STOP */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isRunning ? (
            <button
              onClick={() => simulationStore.pause()}
              className="px-2.5 py-1 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md transition"
              title="Tạm dừng mô phỏng"
            >
              <Pause className="w-3.5 h-3.5 fill-current" /> Tạm Dừng
            </button>
          ) : (
            <button
              onClick={() => simulationStore.run()}
              className="px-2.5 py-1 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-md transition"
              title="Chạy mô phỏng liên tục"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Chạy (Run)
            </button>
          )}

          <button
            onClick={() => simulationStore.step()}
            className="px-2.5 py-1 rounded-xl font-bold text-xs bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-400/40 flex items-center gap-1 transition"
            title="Thực thi từng bước thời gian (+0.1 giây)"
          >
            <StepForward className="w-3.5 h-3.5" /> Bước (Step)
          </button>

          <button
            onClick={() => simulationStore.reset()}
            className="px-2.5 py-1 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
            title="Đặt lại vị trí ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại
          </button>

          <button
            onClick={() => {
              simulationStore.emergencyStop();
              if (onEmergencyStop) onEmergencyStop();
            }}
            className="px-3.5 py-1 rounded-xl font-black text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-lg transition border border-red-400 animate-pulse"
            title="Dừng khẩn cấp toàn bộ hệ thống (Spacebar)"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> E-STOP
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. ADVANCED WORKSPACE TOOLBAR: 6 LAYOUTS & PANEL TOGGLES                      */}
      {/* ============================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs select-none shrink-0">
        {/* Layout Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#090F1E] p-1 rounded-xl border border-cyan-500/20">
          <span className="text-slate-400 px-2 font-bold hidden sm:inline">Chế độ xem:</span>

          {/* 1. Standard */}
          <button
            onClick={() => selectLayout('standard')}
            title="Bố cục Chuẩn: mô phỏng lớn, các bảng điều khiển và console bên dưới"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'standard' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Standard
          </button>

          {/* 2. Focus */}
          <button
            onClick={() => selectLayout('focus')}
            title="Bố cục Tập Trung (Focus): ưu tiên 75-80% diện tích cho mô phỏng, thu gọn sidebar và panel phụ"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'focus' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Focus className="w-3.5 h-3.5" /> Focus
          </button>

          {/* 3. Split View */}
          <button
            onClick={() => selectLayout('split')}
            title="Bố cục Chia Đôi (Split View): mô phỏng và code/bản đồ chia đều 50:50"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'split' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" /> Split View
          </button>

          {/* 4. Triple View */}
          <button
            onClick={() => selectLayout('triple')}
            title="Bố cục Ba Khung Nhìn (Triple View): Bản đồ đua, Robot 3D Twin và FPV Camera đồng thời"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'triple' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Triple View
          </button>

          {/* 5. Picture-in-Picture */}
          <button
            onClick={() => selectLayout('pip')}
            title="Hình trong Hình (Picture-in-Picture): Khung chính cực đại, camera FPV nổi di chuyển được"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'pip' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> PiP
          </button>

          {/* 6. Fullscreen */}
          <button
            onClick={() => selectLayout(layout === 'fullscreen' ? 'standard' : 'fullscreen')}
            title="Toàn Màn Hình (Fullscreen): Khung mô phỏng chiếm toàn bộ màn hình làm việc"
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'fullscreen' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize className="w-3.5 h-3.5" /> Fullscreen
          </button>
        </div>

        {/* Panel Visibility & Customization Tools */}
        <div className="flex items-center gap-1.5 bg-[#090F1E] p-1 rounded-xl border border-cyan-500/20">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? 'Mở rộng Thanh điều hướng' : 'Thu gọn Thanh điều hướng'}
              className={`min-h-[24px] min-w-[24px] p-1.5 rounded-lg transition flex items-center justify-center ${
                isSidebarCollapsed ? 'bg-purple-600/50 text-purple-200' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Toggle Sidebar Navigation"
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setShowControls(!showControls)}
            title={showControls ? 'Ẩn bảng điều khiển D-Pad' : 'Hiện bảng điều khiển D-Pad'}
            className={`min-h-[24px] px-2 py-1 rounded-lg font-semibold transition ${
              showControls ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle D-Pad Controls"
          >
            D-Pad
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            title={showConsole ? 'Ẩn bảng code & nhật ký' : 'Hiện bảng code & nhật ký'}
            className={`min-h-[24px] px-2 py-1 rounded-lg font-semibold transition ${
              showConsole ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle Code & Log Console"
          >
            Code/Log
          </button>

          <button
            onClick={() => setShowFpv(!showFpv)}
            title={showFpv ? 'Ẩn camera FPV' : 'Hiện camera FPV'}
            className={`min-h-[24px] px-2 py-1 rounded-lg font-semibold transition ${
              showFpv ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle FPV Camera"
          >
            FPV
          </button>

          <button
            onClick={handleResetLayout}
            title="Khôi phục lại bố cục mặc định ban đầu"
            className="min-h-[24px] min-w-[24px] p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition flex items-center gap-1"
            aria-label="Reset Workspace Layout"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-bold">Reset Layout</span>
          </button>
        </div>

        {/* Global Telemetry Monitor Strip (Isolated from parent re-renders) */}
        {showTelemetry && <CockpitTelemetryStrip />}
      </div>

      {/* ============================================================================== */}
      {/* 3. RESIZABLE SIMULATION WORKSPACE STAGE                                        */}
      {/* ============================================================================== */}
      <div className="flex-1 min-h-0 min-w-0 relative flex flex-col overflow-hidden">
        {/* If any viewport is maximized, display it full-stage */}
        {maximizedViewport ? (
          <div className="w-full h-full min-h-0 min-w-0 p-1">
            {renderViewport(maximizedViewport)}
          </div>
        ) : (
          <PanelGroup direction="vertical" className="flex-1 min-h-0 min-w-0">
            {/* TOP SIMULATION STAGE PANEL */}
            <Panel
              defaultSize={layout === 'fullscreen' ? 100 : layout === 'focus' ? 82 : layout === 'split' ? 50 : 66}
              minSize={30}
              className="flex flex-col min-h-0 min-w-0"
            >
              {/* Picture-in-Picture Layout */}
              {layout === 'pip' ? (
                <div className="relative w-full h-full min-h-0 min-w-0 rounded-2xl overflow-hidden border border-cyan-500/30">
                  {/* Primary Stage */}
                  <div className="w-full h-full">
                    {renderViewport(slotAssignments.main)}
                  </div>

                  {/* Floating Draggable PiP Window */}
                  <div
                    ref={pipContainerRef}
                    style={{ left: `${pipPos.x}px`, top: `${pipPos.y}px` }}
                    className="absolute w-72 sm:w-80 h-52 z-30 shadow-2xl rounded-2xl overflow-hidden border-2 border-cyan-400 backdrop-blur-md transition-shadow"
                  >
                    {renderViewport(slotAssignments.sub2, true)}
                  </div>
                </div>
              ) : layout === 'split' ? (
                /* Split View Layout: 50% Simulation, 50% Code/Auxiliary or Map vs 3D */
                <PanelGroup direction="horizontal" className="w-full h-full min-h-0 min-w-0 gap-2">
                  <Panel
                    defaultSize={50}
                    minSize={25}
                    onDrop={() => handleDropSlot('main')}
                    onDragOver={(e) => e.preventDefault()}
                    className="min-h-0 min-w-0"
                  >
                    {renderViewport(slotAssignments.main)}
                  </Panel>
                  <PanelResizeHandle className="w-2 rounded bg-cyan-950/60 hover:bg-cyan-500/70 cursor-col-resize transition flex items-center justify-center">
                    <div className="w-0.5 h-6 bg-cyan-400/50 rounded-full"></div>
                  </PanelResizeHandle>
                  <Panel
                    defaultSize={50}
                    minSize={25}
                    onDrop={() => handleDropSlot('sub1')}
                    onDragOver={(e) => e.preventDefault()}
                    className="min-h-0 min-w-0"
                  >
                    {renderViewport(slotAssignments.sub1)}
                  </Panel>
                </PanelGroup>
              ) : (
                /* Standard, Focus, Triple & Fullscreen Layouts */
                <PanelGroup direction="horizontal" className="w-full h-full min-h-0 min-w-0 gap-2">
                  {/* Left Main Viewport (Arena Map) */}
                  <Panel
                    defaultSize={showFpv ? 62 : 100}
                    minSize={30}
                    onDrop={() => handleDropSlot('main')}
                    onDragOver={(e) => e.preventDefault()}
                    className="min-h-0 min-w-0"
                  >
                    {renderViewport(slotAssignments.main)}
                  </Panel>

                  {/* Vertical Splitter Handle */}
                  {showFpv && (
                    <>
                      <PanelResizeHandle className="w-2 rounded bg-cyan-950/60 hover:bg-cyan-500/70 cursor-col-resize transition flex items-center justify-center">
                        <div className="w-0.5 h-8 bg-cyan-400/50 rounded-full"></div>
                      </PanelResizeHandle>

                      {/* Right Sub-Viewports (3D Twin & FPV Camera) */}
                      <Panel defaultSize={38} minSize={20} className="min-h-0 min-w-0 flex flex-col">
                        <PanelGroup direction="vertical" className="w-full h-full min-h-0 min-w-0 gap-2">
                          {/* Sub Viewport 1 (3D Robot) */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            onDrop={() => handleDropSlot('sub1')}
                            onDragOver={(e) => e.preventDefault()}
                            className="min-h-0 min-w-0"
                          >
                            {renderViewport(slotAssignments.sub1)}
                          </Panel>

                          <PanelResizeHandle className="h-2 rounded bg-cyan-950/60 hover:bg-cyan-500/70 cursor-row-resize transition flex items-center justify-center">
                            <div className="h-0.5 w-8 bg-cyan-400/50 rounded-full"></div>
                          </PanelResizeHandle>

                          {/* Sub Viewport 2 (Dynamic Camera FPV) */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            onDrop={() => handleDropSlot('sub2')}
                            onDragOver={(e) => e.preventDefault()}
                            className="min-h-0 min-w-0"
                          >
                            {renderViewport(slotAssignments.sub2)}
                          </Panel>
                        </PanelGroup>
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              )}
            </Panel>

            {/* Horizontal Splitter between Simulation and Auxiliary Panels */}
            {(showControls || showConsole) && layout !== 'fullscreen' && (
              <>
                <PanelResizeHandle className="h-2 rounded bg-cyan-950/60 hover:bg-cyan-500/70 cursor-row-resize transition flex items-center justify-center my-1">
                  <div className="h-0.5 w-12 bg-cyan-400/50 rounded-full"></div>
                </PanelResizeHandle>

                {/* BOTTOM AUXILIARY PANELS (CONTROLS & CODE/LOG CONSOLE) */}
                <Panel
                  defaultSize={layout === 'focus' ? 18 : 34}
                  minSize={12}
                  className="min-h-0 min-w-0 overflow-y-auto pr-1"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
                    {/* Manual Controls & D-Pad */}
                    {showControls && (
                      <div className={`${showConsole ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col gap-2 bg-[#070D1A] p-3 rounded-2xl border border-cyan-500/20`}>
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                            Bảng Điều Khiển Động Cơ Vi Sai
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300">
                            v_L={simState.targetLeftSpeed.toFixed(2)} | v_R={simState.targetRightSpeed.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center justify-around flex-1">
                          {/* D-Pad Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 w-32 shrink-0">
                            <div></div>
                            <button
                              onClick={() => simulationStore.setMotorSpeeds(0.5, 0.5, 'D-Pad: Tiến')}
                              className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition active:scale-95"
                              title="Tiến thẳng"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <div></div>

                            <button
                              onClick={() => simulationStore.setMotorSpeeds(-0.4, 0.4, 'D-Pad: Xoay Trái')}
                              className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition active:scale-95"
                              title="Xoay trái"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => simulationStore.setMotorSpeeds(0.0, 0.0, 'D-Pad: Dừng')}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition active:scale-95"
                              title="Dừng khẩn cấp"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => simulationStore.setMotorSpeeds(0.4, -0.4, 'D-Pad: Xoay Phải')}
                              className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition active:scale-95"
                              title="Xoay phải"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>

                            <div></div>
                            <button
                              onClick={() => simulationStore.setMotorSpeeds(-0.4, -0.4, 'D-Pad: Lùi')}
                              className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition active:scale-95"
                              title="Lùi lại"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <div></div>
                          </div>

                          {/* Dual Motor Speed Sliders */}
                          <div className="flex-1 flex flex-col justify-center space-y-2 w-full">
                            <div>
                              <div className="flex justify-between text-[11px] font-mono text-blue-400">
                                <span>Động Cơ Trái (v_L):</span>
                                <span className="font-bold">{simState.targetLeftSpeed.toFixed(2)}</span>
                              </div>
                              <input
                                type="range"
                                min="-1.0"
                                max="1.0"
                                step="0.05"
                                value={simState.targetLeftSpeed}
                                onChange={(e) => simulationStore.setMotorSpeeds(parseFloat(e.target.value), simState.targetRightSpeed, 'Thanh trượt v_L')}
                                className="w-full accent-blue-500 cursor-pointer h-1.5"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] font-mono text-orange-400">
                                <span>Động Cơ Phải (v_R):</span>
                                <span className="font-bold">{simState.targetRightSpeed.toFixed(2)}</span>
                              </div>
                              <input
                                type="range"
                                min="-1.0"
                                max="1.0"
                                step="0.05"
                                value={simState.targetRightSpeed}
                                onChange={(e) => simulationStore.setMotorSpeeds(simState.targetLeftSpeed, parseFloat(e.target.value), 'Thanh trượt v_R')}
                                className="w-full accent-orange-500 cursor-pointer h-1.5"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Console & Code Logs */}
                    {showConsole && (
                      <div className={`${showControls ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col bg-[#070D1B] rounded-2xl border border-cyan-500/25 overflow-hidden`}>
                        <div className="px-3 py-1.5 bg-[#0C152B] border-b border-cyan-500/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-bold text-white text-[11px]">Bảng Lệnh &amp; Sự Kiện</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setActiveTabConsole('telemetry')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                activeTabConsole === 'telemetry' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Nhật Ký ({simState.logs.length})
                            </button>
                            <button
                              onClick={() => setActiveTabConsole('flow')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                activeTabConsole === 'flow' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Phần Cứng
                            </button>
                          </div>
                        </div>

                        {/* Active Python Command Ribbon */}
                        <div className="px-3 py-1 bg-[#02050D] border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 truncate">&gt;&gt;&gt; {simState.activePythonCode}</span>
                          <button
                            onClick={handleCopyPython}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                            title="Sao chép lệnh"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Log Output Content */}
                        <div ref={logContainerRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] bg-[#050812] max-h-36">
                          {activeTabConsole === 'telemetry' &&
                            simState.logs.slice(-10).map((log) => (
                              <div
                                key={log.id}
                                className={`p-1.5 rounded border flex items-center justify-between gap-1 ${
                                  log.type === 'safety'
                                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                                    : log.type === 'command'
                                    ? 'bg-[#0B1528] border-cyan-500/30 text-slate-200'
                                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                                }`}
                              >
                                <span className="font-bold">{log.actionText}: {log.pythonCode}</span>
                                <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                              </div>
                            ))}

                          {activeTabConsole === 'flow' && (
                            <div className="p-2 text-center text-cyan-300 text-xs">
                              JetBot Code &rarr; I2C 0x60 &rarr; PCA9685 PWM 50Hz &rarr; TT Motor &rarr; 30 FPS Camera
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </div>
    </div>
  );
};
