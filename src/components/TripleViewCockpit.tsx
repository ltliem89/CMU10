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
  Square
} from 'lucide-react';
import { TacticalArenaMap } from './TacticalArenaMap';
import { Robot3DCanvas } from './Robot3DCanvas';
import { DynamicCameraFPV } from './DynamicCameraFPV';
import { ErrorBoundary } from './ErrorBoundary';
import { InspectionMode, ComponentSpec } from '../types/robotGeometry';

interface TripleViewCockpitProps {
  onEmergencyStop?: () => void;
}

export type CockpitLayout = 'triple' | 'split-map-3d' | 'split-fpv-3d' | 'pip-fpv' | 'full-map' | 'full-3d';

export const TripleViewCockpit: React.FC<TripleViewCockpitProps> = ({ onEmergencyStop }) => {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [layout, setLayout] = useState<CockpitLayout>('triple');
  const [inspectionMode, setInspectionMode] = useState<InspectionMode>('realistic');
  const [selectedComp, setSelectedComp] = useState<ComponentSpec | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTabConsole, setActiveTabConsole] = useState<'telemetry' | 'python' | 'flow'>('telemetry');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to simulation store
  useEffect(() => {
    const unsub = simulationStore.subscribe(() => {
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  // Keyboard shortcut listener for Emergency Stop (Spacebar) and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        simulationStore.emergencyStop();
        if (onEmergencyStop) onEmergencyStop();
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
  }, [onEmergencyStop]);

  const handleCopyPython = () => {
    navigator.clipboard.writeText(simState.activePythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isRunning = simState.executionState === 'RUNNING';

  return (
    <div className="bg-[#050914] text-white rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col space-y-4 p-4 sm:p-5">
      {/* ============================================================================== */}
      {/* 1. MISSION CONTROL HEADER */}
      {/* ============================================================================== */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#122347] to-[#1E3A8A] px-4 py-3.5 rounded-2xl border border-cyan-500/25 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                TRIPLE-VIEW COCKPIT &amp; ROBOTICS TELEMETRY
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CMU10 STEM
              </span>
            </div>
            <p className="text-xs text-cyan-200/80">
              Phòng điều khiển 3 khung nhìn đồng bộ: Sa Bàn 2D/3D • Robot 3D Twin • FPV Camera Thật
            </p>
          </div>
        </div>

        {/* Primary Command Actions: RUN, PAUSE, STEP, RESET, EMERGENCY STOP */}
        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => simulationStore.pause()}
              className="px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md transition"
            >
              <Pause className="w-4 h-4 fill-current" /> Tạm Dừng
            </button>
          ) : (
            <button
              onClick={() => simulationStore.run()}
              className="px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md transition"
            >
              <Play className="w-4 h-4 fill-current" /> Chạy (Run)
            </button>
          )}

          <button
            onClick={() => simulationStore.step()}
            className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-400/40 flex items-center gap-1.5 transition"
            title="Thực thi từng bước thời gian (+0.1 giây)"
          >
            <StepForward className="w-4 h-4" /> Bước (Step)
          </button>

          <button
            onClick={() => simulationStore.reset()}
            className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Đặt lại vị trí xuất phát"
          >
            <RotateCcw className="w-4 h-4" /> Đặt Lại
          </button>

          <button
            onClick={() => {
              simulationStore.emergencyStop();
              if (onEmergencyStop) onEmergencyStop();
            }}
            className="px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-lg transition border border-red-400 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" /> E-STOP
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. LAYOUT SWITCHER TOOLBAR */}
      {/* ============================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs select-none">
        <div className="flex items-center gap-1 bg-[#090F1E] p-1 rounded-xl border border-cyan-500/20">
          <span className="text-slate-400 px-2 font-bold hidden sm:inline">Bố cục:</span>
          <button
            onClick={() => setLayout('triple')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'triple' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 3 Khung Nhìn (Triple)
          </button>
          <button
            onClick={() => setLayout('split-map-3d')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'split-map-3d' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" /> Bản Đồ + Robot 3D
          </button>
          <button
            onClick={() => setLayout('pip-fpv')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              layout === 'pip-fpv' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> PiP (Hình Trong Hình)
          </button>
        </div>

        {/* Global Simulation Heartbeat Telemetry */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-cyan-300 bg-[#090F1E] px-3 py-1 rounded-xl border border-cyan-500/20">
          <span>T: {simState.simTimeSec.toFixed(1)}s</span>
          <span>|</span>
          <span className="text-emerald-400 font-bold">POS: ({simState.x.toFixed(2)}, {simState.z.toFixed(2)})m</span>
          <span>|</span>
          <span className="text-amber-400">YAW: {((simState.yaw * 180) / Math.PI).toFixed(0)}°</span>
          <span>|</span>
          <span className="text-blue-400">PWM: {simState.pwmL}% / {simState.pwmR}%</span>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 3. MULTI-VIEWPORT WORKSPACE */}
      {/* ============================================================================== */}
      {layout === 'triple' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* VIEWPORT A: TACTICAL ARENA MAP (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col">
            <TacticalArenaMap className="h-full min-h-[380px]" />
          </div>

          {/* RIGHT COLUMN: VIEWPORT B (3D ROBOT) & VIEWPORT C (FPV CAMERA) (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* VIEWPORT B: 3D MECHANICAL TWIN */}
            <div className="flex flex-col bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl">
              <div className="px-3 py-2 bg-gradient-to-r from-[#0C152B] to-[#122347] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">Khung B: Robot JetBot 3D Twin</span>
                </div>
                {/* 3D Inspection Mode Selector */}
                <select
                  value={inspectionMode}
                  onChange={(e) => setInspectionMode(e.target.value as InspectionMode)}
                  className="bg-[#050812] border border-cyan-500/30 text-cyan-200 text-[11px] font-bold rounded-lg px-2 py-0.5"
                >
                  <option value="realistic">Thực Tế (PBR)</option>
                  <option value="wireframe">Khung Dây (Wireframe)</option>
                  <option value="components">Linh Kiện (Parts)</option>
                  <option value="collision">Va Chạm (Hull)</option>
                  <option value="coordinates">Tọa Độ XYZ (0,0)</option>
                  <option value="sensors">Cảm Biến FOV</option>
                  <option value="dimensions">Kích Thước CAD</option>
                </select>
              </div>

              <div className="relative w-full h-[220px]">
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

            {/* VIEWPORT C: DYNAMIC FPV CAMERA */}
            <div className="flex-1">
              <DynamicCameraFPV className="h-full min-h-[220px]" />
            </div>
          </div>
        </div>
      )}

      {layout === 'split-map-3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <TacticalArenaMap className="h-[460px]" />
          <div className="bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 flex flex-col h-[460px]">
            <div className="px-3.5 py-2.5 bg-[#0C152B] border-b border-cyan-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" /> Khung B: Mô Hình Cơ Khí 3D Chuẩn CMU10
              </span>
            </div>
            <div className="flex-1 relative">
              <Robot3DCanvas
                leftSpeed={simState.actualLeftSpeed}
                rightSpeed={simState.actualRightSpeed}
                inspectionMode={inspectionMode}
                onInspectionModeChange={setInspectionMode}
              />
            </div>
          </div>
        </div>
      )}

      {layout === 'pip-fpv' && (
        <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-cyan-500/30">
          <TacticalArenaMap className="w-full h-full" />
          {/* Floating Picture-in-Picture FPV Window */}
          <div className="absolute top-4 right-4 w-72 sm:w-80 shadow-2xl rounded-2xl overflow-hidden border-2 border-cyan-400 z-20 backdrop-blur-md">
            <DynamicCameraFPV className="h-48" />
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 4. MANUAL D-PAD & MOTOR PRESET CONTROLS */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#070D1A] p-4 rounded-2xl border border-cyan-500/20">
        {/* D-Pad Manual Steering */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 bg-[#0B1528] rounded-xl border border-cyan-500/20">
          <span className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Điều Khiển Hướng Di Chuyển (D-Pad)
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-44">
            <div></div>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.5, 0.5, 'D-Pad: Tiến')}
              className="p-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition"
              title="Tiến thẳng (robot.forward)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div></div>

            <button
              onClick={() => simulationStore.setMotorSpeeds(-0.4, 0.4, 'D-Pad: Xoay Trái')}
              className="p-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition"
              title="Xoay tròn trái (robot.left)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.0, 0.0, 'D-Pad: Dừng')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 transition"
              title="Dừng khẩn cấp (robot.stop)"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.4, -0.4, 'D-Pad: Xoay Phải')}
              className="p-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition"
              title="Xoay tròn phải (robot.right)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div></div>
            <button
              onClick={() => simulationStore.setMotorSpeeds(-0.4, -0.4, 'D-Pad: Lùi')}
              className="p-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white flex items-center justify-center border border-cyan-400/40 transition"
              title="Lùi thẳng (robot.backward)"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <div></div>
          </div>
        </div>

        {/* Sliders for Direct Left & Right Motor Speeds */}
        <div className="lg:col-span-8 flex flex-col justify-between p-3 bg-[#0B1528] rounded-xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Điều Chỉnh Tốc Độ Động Cơ Trái &amp; Phải
            </span>
            <span className="text-[11px] font-mono text-cyan-300">
              PWM Kép 8-Bit (0x60 / PCA9685)
            </span>
          </div>

          {/* Left Motor Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-blue-400 font-bold">Động Cơ Trái (v_L):</span>
              <span className="text-white font-bold">{simState.targetLeftSpeed.toFixed(2)} ({simState.pwmL}%)</span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={simState.targetLeftSpeed}
              onChange={(e) => simulationStore.setMotorSpeeds(parseFloat(e.target.value), simState.targetRightSpeed, 'Thanh trượt v_L')}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Right Motor Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-orange-400 font-bold">Động Cơ Phải (v_R):</span>
              <span className="text-white font-bold">{simState.targetRightSpeed.toFixed(2)} ({simState.pwmR}%)</span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={simState.targetRightSpeed}
              onChange={(e) => simulationStore.setMotorSpeeds(simState.targetLeftSpeed, parseFloat(e.target.value), 'Thanh trượt v_R')}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Speed Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-bold mr-1">Mẫu nhanh:</span>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.5, 0.5, 'Tiến 50%')}
              className="px-2.5 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800 text-blue-200 border border-blue-500/30"
            >
              Tiến 0.5
            </button>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.3, 0.6, 'Rẽ Cong Phải')}
              className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-500/30"
            >
              Rẽ Cong Phải
            </button>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.6, 0.3, 'Rẽ Cong Trái')}
              className="px-2.5 py-1 rounded-lg bg-pink-900/40 hover:bg-pink-800 text-pink-200 border border-pink-500/30"
            >
              Rẽ Cong Trái
            </button>
            <button
              onClick={() => simulationStore.setMotorSpeeds(0.0, 0.0, 'Dừng')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
            >
              Dừng 0.0
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 5. CODE EXECUTION, HARDWARE FLOW & EVENT LOG CONSOLE */}
      {/* ============================================================================== */}
      <div className="bg-[#070D1B] rounded-2xl border border-cyan-500/25 overflow-hidden flex flex-col">
        {/* Console Header Tabs */}
        <div className="px-4 py-2 bg-gradient-to-r from-[#0C152B] to-[#122347] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Bảng Lệnh Python &amp; Luồng Tín Hiệu Phần Cứng</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTabConsole('telemetry')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeTabConsole === 'telemetry' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nhật Ký Sự Kiện ({simState.logs.length})
            </button>
            <button
              onClick={() => setActiveTabConsole('flow')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeTabConsole === 'flow' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Luồng Phần Cứng
            </button>
          </div>
        </div>

        {/* Active Line Display Strip */}
        <div className="px-4 py-2.5 bg-[#02050D] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="text-cyan-400 font-bold">&gt;&gt;&gt; ACTIVE:</span>
            <span className="font-bold">{simState.activePythonCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-sans">{simState.activeCommandSummary}</span>
            <button
              onClick={handleCopyPython}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Sao chép lệnh"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab 1: Event Log Stream */}
        {activeTabConsole === 'telemetry' && (
          <div
            ref={logContainerRef}
            className="h-48 overflow-y-auto p-3 space-y-1.5 font-mono text-xs bg-[#050812]"
          >
            {simState.logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                  log.type === 'safety'
                    ? 'bg-red-950/40 border-red-500/50 text-red-100'
                    : log.type === 'command'
                    ? 'bg-[#0B1528] border-cyan-500/30 text-slate-100'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  <span className="font-bold text-white">{log.actionText}:</span>
                  <span className="text-emerald-300">{log.pythonCode}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  L={Math.round(log.leftVal * 100)}% | R={Math.round(log.rightVal * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Hardware Signal Flow Diagram */}
        {activeTabConsole === 'flow' && (
          <div className="p-4 bg-[#050812] flex flex-wrap items-center justify-around gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-center min-w-[110px]">
              <div className="font-bold text-cyan-300">1. Python Code</div>
              <div className="text-[10px] text-slate-400">jetbot.Robot()</div>
            </div>
            <span className="text-cyan-400 font-bold">&rarr;</span>

            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-center min-w-[110px]">
              <div className="font-bold text-purple-300">2. I2C Bus</div>
              <div className="text-[10px] text-slate-400">Địa chỉ 0x60</div>
            </div>
            <span className="text-cyan-400 font-bold">&rarr;</span>

            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center min-w-[110px]">
              <div className="font-bold text-amber-300">3. PCA9685 PWM</div>
              <div className="text-[10px] text-slate-400">50Hz Clock</div>
            </div>
            <span className="text-cyan-400 font-bold">&rarr;</span>

            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center min-w-[110px]">
              <div className="font-bold text-emerald-300">4. Động Cơ TT DC</div>
              <div className="text-[10px] text-slate-400">Tỉ số truyền 1:48</div>
            </div>
            <span className="text-cyan-400 font-bold">&rarr;</span>

            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-center min-w-[110px]">
              <div className="font-bold text-teal-300">5. Cảm Biến &amp; FPV</div>
              <div className="text-[10px] text-slate-400">Phản hồi 30 FPS</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
