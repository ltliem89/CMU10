import React, { useEffect, useState } from 'react';
import { Clock, Route, Activity, Gauge } from 'lucide-react';
import { simulationStore } from '../stores/useSimulationStore';

export const SimulationHUD: React.FC = () => {
  const [hudData, setHudData] = useState(() => {
    const s = simulationStore.getState();
    return {
      v: s.linearVel,
      t: s.simTimeSec,
      s: Math.abs(s.x + 0.8) + Math.abs(s.z), // approximate distance
      a: Math.abs(s.linearVel) * 0.15
    };
  });

  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const s = simulationStore.getState();
      const now = performance.now();
      if (s.executionState === 'RUNNING' && now - lastTime < 50) return; // 20 FPS throttle only during continuous RUNNING
      lastTime = now;
      // calculate cumulative distance from trajectory
      let dist = 0;
      for (let i = 1; i < s.actualTrajectory.length; i++) {
        const dx = s.actualTrajectory[i].x - s.actualTrajectory[i - 1].x;
        const dz = s.actualTrajectory[i].z - s.actualTrajectory[i - 1].z;
        dist += Math.sqrt(dx * dx + dz * dz);
      }
      setHudData({
        v: s.linearVel,
        t: s.simTimeSec,
        s: dist,
        a: Math.abs(s.linearVel) * 0.15
      });
    });
    return unsub;
  }, []);

  // Calculate arc path for speedometer gauge
  const maxV = 1.0;
  const speedRatio = Math.min(1.0, Math.max(0, Math.abs(hudData.v) / maxV));
  const strokeDashoffset = 126 - 126 * speedRatio; // circumference for r=20 is ~126

  return (
    <div data-testid="simulation-hud" className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
      <div className="flex items-center gap-3 sm:gap-5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#061830]/90 backdrop-blur-md border border-cyan-500/30 shadow-2xl text-white font-mono pointer-events-none">
        {/* Speedometer Circular Gauge */}
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-cyan-500/30">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="126"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] sm:text-[15px] font-black leading-none text-white">
                {Math.abs(hudData.v).toFixed(2)}
              </span>
              <span className="text-[9px] text-cyan-300 font-sans leading-none pt-0.5">
                m/s
              </span>
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-200/80 font-sans leading-none">
              Thời gian
            </span>
            <span className="text-sm sm:text-base font-black text-white leading-tight">
              {hudData.t.toFixed(1)} <span className="text-xs font-normal text-cyan-300">s</span>
            </span>
          </div>
        </div>

        {/* Quãng đường */}
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-200/80 font-sans leading-none">
              Quãng đường
            </span>
            <span className="text-sm sm:text-base font-black text-white leading-tight">
              {hudData.s.toFixed(1)} <span className="text-xs font-normal text-cyan-300">m</span>
            </span>
          </div>
        </div>

        {/* Gia tốc */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-200/80 font-sans leading-none">
              Gia tốc
            </span>
            <span className="text-sm sm:text-base font-black text-white leading-tight">
              {hudData.a.toFixed(2)} <span className="text-xs font-normal text-cyan-300">m/s²</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
