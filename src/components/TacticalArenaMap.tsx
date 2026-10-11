import React, { useEffect, useRef, useState } from 'react';
import { simulationStore, SimulationState } from '../stores/useSimulationStore';
import { Compass, Flag, MapPin, ShieldAlert, Target, Navigation } from 'lucide-react';

interface TacticalArenaMapProps {
  className?: string;
}

export const TacticalArenaMap: React.FC<TacticalArenaMapProps> = ({ className = '' }) => {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [showPlannedPath, setShowPlannedPath] = useState<boolean>(true);
  const [showActualTrail, setShowActualTrail] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSensorRays, setShowSensorRays] = useState<boolean>(true);

  // Subscribe to simulation store
  useEffect(() => {
    const unsub = simulationStore.subscribe(() => {
      setSimState(simulationStore.getState());
    });
    return unsub;
  }, []);

  // Map coordinate conversion:
  // World: X: -1.5m .. 1.5m (width 3.0m), Z: -1.0m .. 1.0m (length 2.0m)
  // SVG Canvas: viewBox 0 0 600 400
  const worldToSvgX = (x: number) => ((x + 1.5) / 3.0) * 600;
  const worldToSvgY = (z: number) => ((z + 1.0) / 2.0) * 400;

  const robotSvgX = worldToSvgX(simState.x);
  const robotSvgY = worldToSvgY(simState.z);
  // Yaw: 0 is facing +X (angle in radians) -> in SVG degrees:
  const robotAngleDeg = (simState.yaw * 180) / Math.PI;

  return (
    <div className={`relative flex flex-col h-full w-full bg-[#070D1B] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-xl select-none ${className}`}>
      {/* Floating Arena Badges & Layer Visibility Toggles */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-auto">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-sm select-none">
          3.0m × 2.0m
        </span>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 p-1 bg-slate-950/80 backdrop-blur-md rounded-xl border border-cyan-500/30 text-[11px] shadow-sm pointer-events-auto">
        <button
          onClick={() => setShowPlannedPath(!showPlannedPath)}
          className={`px-2 py-0.5 rounded font-bold border transition ${
            showPlannedPath
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Quỹ Đạo Dự Kiến"
        >
          Quỹ Đạo Mẫu
        </button>
        <button
          onClick={() => setShowActualTrail(!showActualTrail)}
          className={`px-2 py-0.5 rounded font-bold border transition ${
            showActualTrail
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Vệt Đường Đi Thực Tế"
        >
          Vết Thực Tế
        </button>
        <button
          onClick={() => setShowSensorRays(!showSensorRays)}
          className={`px-2 py-0.5 rounded font-bold border transition ${
            showSensorRays
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Bật/Tắt Tia Cảm Biến"
        >
          Tia Quét
        </button>
      </div>

      {/* SVG Vector Arena Map Canvas */}
      <div className="relative w-full h-full flex-1 min-h-0 bg-[#050914] flex items-center justify-center p-2">
        <svg
          className="w-full h-full rounded-xl border border-slate-800"
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
          </defs>

          {/* Grid Background */}
          {showGrid && <rect width="100%" height="100%" fill="url(#tacticalGrid)" />}

          {/* Arena Coordinate Axes (X: Red, Z: Blue) */}
          <line x1="300" y1="20" x2="300" y2="380" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20" y1="200" x2="580" y2="200" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="560" y="215" fill="#64748B" fontSize="10" fontFamily="monospace">X (m)</text>
          <text x="310" y="35" fill="#64748B" fontSize="10" fontFamily="monospace">Z (m)</text>

          {/* Outer Boundary Wall with Real Dimensions */}
          <rect x="15" y="15" width="570" height="370" fill="none" stroke="#0284C7" strokeWidth="3" rx="8" />

          {/* Race Track Circuit (Road with asphalt texture & yellow center dashed line) */}
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

          {/* Planned Trajectory Waypoints (Chế độ đường dẫn dự kiến) */}
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

          {/* Actual Trajectory History Trail (Vệt thực tế robot đã đi) */}
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
          {simState.obstacles.map((obs) => {
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

          {/* Robot Representation (Oriented with yaw angle) */}
          <g transform={`translate(${robotSvgX}, ${robotSvgY}) rotate(${robotAngleDeg})`}>
            {/* Ultrasonic & Camera Sensor Rays */}
            {showSensorRays && (
              <g>
                {/* Camera Vision Cone (60 deg FOV, yellow transparent) */}
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

            {/* Left Wheel (Blue, Top) */}
            <rect x="-14" y="-22" width="28" height="8" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
            {/* Right Wheel (Orange, Bottom) */}
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
        </svg>

        {/* Real-Time Telemetry Badge */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xs border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 shadow-xl space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">TỌA ĐỘ THỰC:</span>
            <span>X: {simState.x.toFixed(2)}m</span>
            <span>Z: {simState.z.toFixed(2)}m</span>
            <span>Yaw: {((simState.yaw * 180) / Math.PI).toFixed(1)}°</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Vận tốc v: {(simState.linearVel * 100).toFixed(1)} cm/s</span>
            <span>|</span>
            <span>Vận tốc góc ω: {simState.angularVel.toFixed(2)} rad/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
