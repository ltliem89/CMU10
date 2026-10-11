import React, { useState, useEffect } from 'react';
import {
  Car,
  Radar,
  Gamepad2,
  BatteryCharging,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Activity,
  Sliders
} from 'lucide-react';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';

export const RobotStatusPanel: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>(() => simulationStore.getState());
  const [controlMode, setControlMode] = useState<'keyboard' | 'gamepad' | 'click'>('keyboard');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.8);

  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const state = simulationStore.getState();
      const now = performance.now();
      if (state.executionState === 'RUNNING' && now - lastTime < 50) return; // Throttle UI only during high-frequency RUNNING
      lastTime = now;
      setSimState(state);
    });
    return unsub;
  }, []);

  const isRunning = simState.executionState === 'RUNNING';
  const isEmergency = simState.executionState === 'EMERGENCY_STOP';

  // D-Pad command triggers
  const handleMove = (direction: 'forward' | 'backward' | 'left' | 'right' | 'stop') => {
    switch (direction) {
      case 'forward':
        simulationStore.setMotorSpeeds(speedMultiplier, speedMultiplier, 'D-Pad: Tiến');
        if (simulationStore.getState().executionState !== 'RUNNING') simulationStore.run();
        break;
      case 'backward':
        simulationStore.setMotorSpeeds(-speedMultiplier * 0.8, -speedMultiplier * 0.8, 'D-Pad: Lùi');
        if (simulationStore.getState().executionState !== 'RUNNING') simulationStore.run();
        break;
      case 'left':
        simulationStore.setMotorSpeeds(-speedMultiplier * 0.6, speedMultiplier * 0.6, 'D-Pad: Rẽ Trái');
        if (simulationStore.getState().executionState !== 'RUNNING') simulationStore.run();
        break;
      case 'right':
        simulationStore.setMotorSpeeds(speedMultiplier * 0.6, -speedMultiplier * 0.6, 'D-Pad: Rẽ Phải');
        if (simulationStore.getState().executionState !== 'RUNNING') simulationStore.run();
        break;
      case 'stop':
        simulationStore.setMotorSpeeds(0, 0, 'D-Pad: Dừng');
        break;
    }
  };

  // Keyboard navigation listener (Arrow keys and WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('forward');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('backward');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('right');
      } else if (e.key === ' ' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleMove('stop');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speedMultiplier]);

  const yawDeg = ((simState.yaw * 180) / Math.PI + 360) % 360;
  const ultrasonicM = (simState.sensors.ultrasonicDistCm / 100).toFixed(2);
  const leftDistM = Math.max(0.2, (simState.z + 1.0) * 0.65).toFixed(2);
  const rightDistM = Math.max(0.2, (1.0 - simState.z) * 0.70).toFixed(2);

  return (
    <aside
      data-testid="robot-status-panel"
      className="w-full lg:w-[270px] bg-white rounded-2xl border border-[#D6E3F2] shadow-xs flex flex-col select-none overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-[#D6E3F2] flex items-center justify-between gap-2 bg-[#F8FAFD]">
        <h2 className="text-[13.5px] font-bold text-[#102B52] truncate">
          Trạng thái &amp; cảm biến
        </h2>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
            isEmergency
              ? 'bg-red-100 text-red-700'
              : isRunning
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEmergency
                ? 'bg-red-600 animate-ping'
                : isRunning
                ? 'bg-emerald-600 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
          {isEmergency ? 'Khẩn cấp' : isRunning ? 'Đang chạy' : 'Tạm dừng'}
        </span>
      </div>

      <div className="p-3 space-y-3.5 flex-1 overflow-y-auto">
        {/* Section 1: Trạng thái xe */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B52]">
            <Car className="w-4 h-4 text-[#1677FF]" />
            <span>Trạng thái xe</span>
          </div>

          <div className="bg-[#F8FAFD] rounded-xl border border-[#D6E3F2]/70 p-2.5 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A] font-sans">Vị trí (x, y)</span>
              <span className="font-bold text-[#102B52]">
                ({simState.x.toFixed(2)}, {simState.z.toFixed(2)}) m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A] font-sans">Hướng</span>
              <span className="font-bold text-[#102B52]">{yawDeg.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A] font-sans">Vận tốc</span>
              <span className="font-bold text-[#1677FF]">
                {simState.linearVel.toFixed(2)} m/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A] font-sans">Gia tốc</span>
              <span className="font-bold text-emerald-600">
                {(Math.abs(simState.linearVel) * 0.15).toFixed(2)} m/s²
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A] font-sans">Thời gian</span>
              <span className="font-bold text-[#102B52]">
                {simState.simTimeSec.toFixed(1)} s
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Cảm biến */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B52]">
            <Radar className="w-4 h-4 text-[#0D9488]" />
            <span>Cảm biến</span>
          </div>

          <div className="bg-[#F8FAFD] rounded-xl border border-[#D6E3F2]/70 p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A]">Khoảng cách trước</span>
              <span className="font-mono font-bold text-[#102B52]">
                {ultrasonicM} m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A]">Khoảng cách trái</span>
              <span className="font-mono font-bold text-[#102B52]">
                {leftDistM} m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A]">Khoảng cách phải</span>
              <span className="font-mono font-bold text-[#102B52]">
                {rightDistM} m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#526B8A]">Khoảng cách sau</span>
              <span className="font-mono font-bold text-[#102B52]">&gt; 2.00 m</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#D6E3F2]/50">
              <span className="text-[#526B8A] flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                Điện áp pin
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-700">
                <div className="w-7 h-2.5 rounded-sm border border-emerald-600 p-0.5 flex">
                  <div className="w-[85%] h-full bg-emerald-500 rounded-2xs" />
                </div>
                <span>7.4 V (85%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Điều khiển nhanh */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B52]">
            <Gamepad2 className="w-4 h-4 text-[#F59E0B]" />
            <span>Điều khiển nhanh</span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#EEF5FC] p-0.5 rounded-xl border border-[#D6E3F2] text-[10.5px] font-bold">
            <button
              onClick={() => setControlMode('keyboard')}
              className={`py-1 rounded-lg transition text-center ${
                controlMode === 'keyboard'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              Bàn phím
            </button>
            <button
              onClick={() => setControlMode('gamepad')}
              className={`py-1 rounded-lg transition text-center ${
                controlMode === 'gamepad'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              Tay cầm
            </button>
            <button
              onClick={() => setControlMode('click')}
              className={`py-1 rounded-lg transition text-center ${
                controlMode === 'click'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              Click đi
            </button>
          </div>

          {/* D-Pad Matrix */}
          <div className="flex items-center justify-center py-1">
            <div className="grid grid-cols-3 gap-1.5 w-32">
              <div />
              <button
                data-testid="dpad-forward-btn"
                onClick={() => handleMove('forward')}
                className="w-10 h-10 rounded-xl bg-[#1677FF] hover:bg-[#318BFF] active:scale-95 text-white flex items-center justify-center shadow-xs transition"
                title="Tiến (Mũi tên Lên)"
                aria-label="Move Forward"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />

              <button
                onClick={() => handleMove('left')}
                className="w-10 h-10 rounded-xl bg-[#E8F2FF] hover:bg-[#D6E3F2] active:scale-95 text-[#102B52] flex items-center justify-center shadow-xs transition"
                title="Xoay Trái (Mũi tên Trái)"
                aria-label="Turn Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove('stop')}
                className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 flex items-center justify-center shadow-xs transition"
                title="Dừng xe"
                aria-label="Stop Motor"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => handleMove('right')}
                className="w-10 h-10 rounded-xl bg-[#E8F2FF] hover:bg-[#D6E3F2] active:scale-95 text-[#102B52] flex items-center justify-center shadow-xs transition"
                title="Xoay Phải (Mũi tên Phải)"
                aria-label="Turn Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div />
              <button
                onClick={() => handleMove('backward')}
                className="w-10 h-10 rounded-xl bg-[#E8F2FF] hover:bg-[#D6E3F2] active:scale-95 text-[#102B52] flex items-center justify-center shadow-xs transition"
                title="Lùi (Mũi tên Xuống)"
                aria-label="Move Backward"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <div />
            </div>
          </div>

          {/* Speed Throttle Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#526B8A]">
              <span>Tốc độ</span>
              <span className="font-mono text-[#1677FF]">
                {(speedMultiplier * 1.0).toFixed(1)} m/s
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#1677FF] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
