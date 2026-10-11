import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  Focus,
  Target,
  Orbit,
  ZoomIn,
  ZoomOut,
  Compass,
  ChevronDown,
  ChevronUp,
  Layers,
  Camera
} from 'lucide-react';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';
import { Robot3DCanvas } from './Robot3DCanvas';
import { TacticalArenaMap } from './TacticalArenaMap';
import { DynamicCameraFPV } from './DynamicCameraFPV';
import { SimulationHUD } from './SimulationHUD';
import { LessonSidebar } from './LessonSidebar';
import { RobotStatusPanel } from './RobotStatusPanel';
import { PhysicsChartPanel } from './PhysicsChartPanel';
import { RealtimeDataTable } from './RealtimeDataTable';
import { CameraViewGallery, CameraGalleryView } from './CameraViewGallery';
import { TripleViewCockpit } from './TripleViewCockpit';
import { PHYSICS_10_LESSONS, Physics10Lesson } from '../data/physics10LessonsData';
import { ModuleMeta } from '../types/jetbot';

interface CMUSimulationWorkspaceProps {
  onEmergencyStop?: () => void;
  selectedLesson: Physics10Lesson;
  onSelectLesson: (lesson: Physics10Lesson) => void;
  selectedModuleId?: string;
  onSelectModule?: (module: ModuleMeta) => void;
}

export type ViewMode = '2D' | '3D' | 'FPV' | 'TRIPLE';

export const CMUSimulationWorkspace: React.FC<CMUSimulationWorkspaceProps> = ({
  onEmergencyStop,
  selectedLesson,
  onSelectLesson,
  selectedModuleId,
  onSelectModule
}) => {
  const [simState, setSimState] = useState<SimulationState>(() => simulationStore.getState());
  const [viewMode, setViewMode] = useState<ViewMode>('3D');
  const [cameraMode, setCameraMode] = useState<'fit' | 'follow' | 'free'>('fit');
  const [isMinimapOpen, setIsMinimapOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeGalleryView, setActiveGalleryView] = useState<CameraGalleryView>('overview');

  const viewportContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to simulation store with selective throttle
  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const now = performance.now();
      if (now - lastTime < 50) return;
      lastTime = now;
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  const isRunning = simState.executionState === 'RUNNING';

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewportContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle gallery view selection
  const handleSelectGalleryView = (v: CameraGalleryView) => {
    setActiveGalleryView(v);
    if (v === 'topdown') {
      setViewMode('2D');
    } else {
      setViewMode('3D');
      if (v === 'follow') setCameraMode('follow');
      else if (v === 'overview') setCameraMode('fit');
      else if (v === 'close') setCameraMode('free');
    }
  };

  // Compass heading rotation angle
  const compassHeadingDeg = -((simState.yaw * 180) / Math.PI);

  return (
    <div
      data-testid="cmu-simulation-workspace"
      className="w-full max-w-[1920px] mx-auto p-2 sm:p-3 flex flex-col space-y-3 font-sans"
    >
      {/* ========================================================================= */}
      {/* MAIN THREE-COLUMN ROW (SIDEBAR - VIEWPORT - STATUS PANEL)                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch min-h-[580px] xl:min-h-[640px]">
        {/* 1. Left Sidebar: Lesson Workspace */}
        <LessonSidebar
          selectedLessonId={selectedLesson.id}
          onSelectLesson={onSelectLesson}
          selectedModuleId={selectedModuleId}
          onSelectModule={onSelectModule}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* 2. Center Column: Main Simulation Viewport & Toolbar */}
        <div className="flex-1 min-w-0 flex flex-col space-y-2">
          {/* Simulation Toolbar (Above Viewport) */}
          <div className="bg-white rounded-2xl border border-[#D6E3F2] shadow-xs px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5">
            {/* Primary Simulation Controls (Run / Pause / Step / Reset) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isRunning ? (
                <button
                  onClick={() => simulationStore.pause()}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] bg-[#FFB020] hover:bg-[#F59E0B] text-[#102B52] flex items-center gap-1.5 shadow-xs transition"
                  title="Tạm dừng mô phỏng"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm dừng</span>
                </button>
              ) : (
                <button
                  onClick={() => simulationStore.run()}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] bg-[#009E66] hover:bg-[#059669] text-white flex items-center gap-1.5 shadow-xs transition"
                  title="Chạy mô phỏng liên tục"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Chạy</span>
                </button>
              )}

              <button
                onClick={() => simulationStore.step()}
                className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] bg-[#0B356B] hover:bg-[#124A8A] text-white flex items-center gap-1.5 shadow-xs transition"
                title="Thực hiện từng bước thời gian (+0.1s)"
              >
                <StepForward className="w-4 h-4" />
                <span>Từng bước</span>
              </button>

              <button
                onClick={() => simulationStore.reset()}
                className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] bg-[#6828D9] hover:bg-[#7C3AED] text-white flex items-center gap-1.5 shadow-xs transition"
                title="Đặt lại vị trí ban đầu của robot"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* View Mode Switcher (2D / 3D / FPV & Fullscreen) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#526B8A] hidden md:inline">
                Chế độ quan sát:
              </span>

              <div className="flex items-center bg-[#EEF5FC] p-0.5 rounded-xl border border-[#D6E3F2] text-xs font-bold">
                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-3 py-1 rounded-lg transition ${
                    viewMode === '2D'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] hover:bg-white/60'
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-3 py-1 rounded-lg transition ${
                    viewMode === '3D'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] hover:bg-white/60'
                  }`}
                >
                  3D
                </button>
                <button
                  onClick={() => setViewMode('FPV')}
                  className={`px-3 py-1 rounded-lg transition ${
                    viewMode === 'FPV'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] hover:bg-white/60'
                  }`}
                >
                  FPV
                </button>
                <button
                  onClick={() => setViewMode('TRIPLE')}
                  className={`px-3 py-1 rounded-lg transition ${
                    viewMode === 'TRIPLE'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] hover:bg-white/60'
                  }`}
                  title="Chế độ Cockpit 3 màn hình lồng nhau"
                >
                  Triple
                </button>
              </div>

              <button
                onClick={handleToggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102B52] transition border border-[#D6E3F2]"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở rộng toàn màn hình'}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Simulation Viewport Area */}
          <div
            ref={viewportContainerRef}
            className={`relative flex-1 min-h-[460px] xl:min-h-[520px] rounded-2xl overflow-hidden border border-[#D6E3F2] shadow-sm bg-[#091122] flex flex-col ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}
          >
            {/* Viewport Content according to viewMode */}
            <div className="flex-1 w-full h-full relative">
              {viewMode === '3D' && (
                <Robot3DCanvas
                  leftSpeed={simState.actualLeftSpeed}
                  rightSpeed={simState.actualRightSpeed}
                  className="w-full h-full"
                />
              )}

              {viewMode === '2D' && (
                <TacticalArenaMap className="w-full h-full rounded-none border-none shadow-none" />
              )}

              {viewMode === 'FPV' && (
                <DynamicCameraFPV className="w-full h-full rounded-none border-none shadow-none" />
              )}

              {viewMode === 'TRIPLE' && (
                <TripleViewCockpit
                  onEmergencyStop={onEmergencyStop}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                />
              )}
            </div>

            {/* Floating Camera Controls on Left */}
            <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 select-none pointer-events-auto">
              <button
                onClick={() => setCameraMode('fit')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition shadow-md ${
                  cameraMode === 'fit'
                    ? 'bg-[#1677FF] text-white'
                    : 'bg-[#061830]/80 text-white/90 hover:bg-[#061830] border border-white/15'
                }`}
                title="Căn vừa toàn cảnh sa bàn"
              >
                <Focus className="w-4 h-4" />
                <span className="hidden sm:inline">Fit cảnh</span>
              </button>

              <button
                onClick={() => setCameraMode('follow')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition shadow-md ${
                  cameraMode === 'follow'
                    ? 'bg-[#1677FF] text-white'
                    : 'bg-[#061830]/80 text-white/90 hover:bg-[#061830] border border-white/15'
                }`}
                title="Bám góc nhìn theo chuyển động của xe"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Theo xe</span>
              </button>

              <button
                onClick={() => setCameraMode('free')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition shadow-md ${
                  cameraMode === 'free'
                    ? 'bg-[#1677FF] text-white'
                    : 'bg-[#061830]/80 text-white/90 hover:bg-[#061830] border border-white/15'
                }`}
                title="Góc nhìn tự do (Kéo chuột xoay quanh xe)"
              >
                <Orbit className="w-4 h-4" />
                <span className="hidden sm:inline">Góc tự do</span>
              </button>

              <div className="pt-1 flex flex-col space-y-1">
                <button
                  onClick={() => {
                    // Trigger zoom in
                    const svg = document.querySelector('svg');
                    if (svg) svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
                  }}
                  className="w-8 h-8 rounded-xl bg-[#061830]/80 hover:bg-[#061830] text-white flex items-center justify-center border border-white/15 shadow-md transition"
                  title="Phóng to (+)"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const svg = document.querySelector('svg');
                    if (svg) svg.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
                  }}
                  className="w-8 h-8 rounded-xl bg-[#061830]/80 hover:bg-[#061830] text-white flex items-center justify-center border border-white/15 shadow-md transition"
                  title="Thu nhỏ (-)"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compass Rose in Bottom-Left Corner */}
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none select-none">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#061830]/80 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center shadow-xl">
                {/* Fixed Cardinal Directions */}
                <span className="absolute top-1 text-[10px] font-bold text-cyan-300 font-mono">N</span>
                <span className="absolute bottom-1 text-[10px] font-bold text-cyan-300 font-mono">S</span>
                <span className="absolute left-1.5 text-[10px] font-bold text-cyan-300 font-mono">W</span>
                <span className="absolute right-1.5 text-[10px] font-bold text-cyan-300 font-mono">E</span>

                {/* Rotating Needle */}
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-100 ease-out"
                  style={{ transform: `rotate(${compassHeadingDeg}deg)` }}
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-md">
                    <polygon points="20,4 25,20 20,17 15,20" fill="#38BDF8" />
                    <polygon points="20,36 25,20 20,23 15,20" fill="#64748B" />
                    <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating Minimap on Top-Right of Viewport */}
            {viewMode === '3D' && (
              <div className="absolute top-3 right-3 z-20 select-none pointer-events-auto">
                <div className="bg-[#061830]/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col transition-all">
                  {/* Minimap Header */}
                  <div className="px-3 py-1.5 bg-[#0C1B33]/80 border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Bản đồ tổng quan</span>
                    </div>
                    <button
                      onClick={() => setIsMinimapOpen(!isMinimapOpen)}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition"
                      title={isMinimapOpen ? 'Thu gọn bản đồ' : 'Mở rộng bản đồ'}
                    >
                      {isMinimapOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Minimap Body */}
                  {isMinimapOpen && (
                    <div className="w-[260px] sm:w-[280px] h-[175px] sm:h-[190px] relative bg-[#070D1B]">
                      <TacticalArenaMap className="w-full h-full rounded-none border-none shadow-none" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Floating Speedometer & Metrics HUD on Bottom Center */}
            <SimulationHUD />
          </div>
        </div>

        {/* 3. Right Status Panel */}
        <RobotStatusPanel />
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM ANALYTICS ROW (3 PANELS: CHART | REALTIME TABLE | CAMERA GALLERY)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Panel A: Đồ thị đại lượng vật lí (~40% = 5 cols out of 12) */}
        <div className="lg:col-span-5 flex flex-col">
          <PhysicsChartPanel />
        </div>

        {/* Panel B: Bảng số liệu thời gian thực (~30% = 4 cols out of 12) */}
        <div className="lg:col-span-4 flex flex-col">
          <RealtimeDataTable />
        </div>

        {/* Panel C: Góc quan sát khác (~30% = 3 cols out of 12) */}
        <div className="lg:col-span-3 flex flex-col">
          <CameraViewGallery
            activeView={activeGalleryView}
            onSelectView={handleSelectGalleryView}
          />
        </div>
      </div>
    </div>
  );
};
