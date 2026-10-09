import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Compass, Gauge, Shield, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface RobotTwinMotorSimulatorProps {
  onEmergencyStop?: () => void;
  externalLeftSpeed?: number;
  externalRightSpeed?: number;
  isExternalControlled?: boolean;
}

export const RobotTwinMotorSimulator: React.FC<RobotTwinMotorSimulatorProps> = ({
  onEmergencyStop,
  externalLeftSpeed,
  externalRightSpeed,
  isExternalControlled = false
}) => {
  // Motor speeds [-1.0, 1.0]
  const [leftSpeed, setLeftSpeed] = useState<number>(0.0);
  const [rightSpeed, setRightSpeed] = useState<number>(0.0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showCameraCone, setShowCameraCone] = useState<boolean>(true);

  // Robot physical state in 2D space (arena is 600x440)
  const [pos, setPos] = useState<{ x: number; y: number; theta: number }>({
    x: 300,
    y: 240,
    theta: -Math.PI / 2 // facing up
  });

  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize with external speeds if controlled externally
  useEffect(() => {
    if (isExternalControlled && externalLeftSpeed !== undefined && externalRightSpeed !== undefined) {
      setLeftSpeed(externalLeftSpeed);
      setRightSpeed(externalRightSpeed);
    }
  }, [isExternalControlled, externalLeftSpeed, externalRightSpeed]);

  // Differential drive physical constants (scaled for visual educational clarity)
  const WHEEL_BASE = 40; // b: distance between wheels in pixels
  const SPEED_SCALE = 2.2; // mapping motor value [-1, 1] to simulation pixel steps

  // Computed kinematics
  const linearVel = ((rightSpeed + leftSpeed) / 2) * SPEED_SCALE;
  const angularVel = ((rightSpeed - leftSpeed) / WHEEL_BASE) * SPEED_SCALE;

  // Kinetic state description in Vietnamese
  const getMotionExplanation = () => {
    const l = parseFloat(leftSpeed.toFixed(2));
    const r = parseFloat(rightSpeed.toFixed(2));

    if (Math.abs(l) < 0.03 && Math.abs(r) < 0.03) {
      return {
        title: 'Robot Dừng Yên (Stop)',
        desc: 'Cả hai động cơ nhận giá trị 0.0. Không có lực kéo, robot đứng yên an toàn.',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-300'
      };
    }
    if (Math.abs(l - r) < 0.04) {
      if (l > 0) {
        return {
          title: 'Đi Thẳng Về Phía Trước (Forward)',
          desc: `Hai bánh cùng tốc độ và cùng chiều tiến (vL = ${l}, vR = ${r}) → Vận tốc góc ω ≈ 0, robot tịnh tiến thẳng.`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300'
        };
      } else {
        return {
          title: 'Lùi Thẳng Về Phía Sau (Backward)',
          desc: `Hai bánh cùng tốc độ và cùng chiều lùi (vL = ${l}, vR = ${r}) → Robot lùi thẳng.`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-300'
        };
      }
    }
    if (Math.abs(l + r) < 0.04) {
      if (r > l) {
        return {
          title: 'Xoay Tròn Tại Chỗ Ngược Chiều Kim Đồng Hồ (Spin Left)',
          desc: `Bánh phải tiến (${r}), bánh trái lùi (${l}) → Vận tốc tiến v ≈ 0, tâm quay trùng với tâm robot.`,
          badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-300'
        };
      } else {
        return {
          title: 'Xoay Tròn Tại Chỗ Cùng Chiều Kim Đồng Hồ (Spin Right)',
          desc: `Bánh trái tiến (${l}), bánh phải lùi (${r}) → Robot xoay tròn tại chỗ sang phải.`,
          badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-300'
        };
      }
    }
    if (Math.abs(l) < 0.05 && r > 0) {
      return {
        title: 'Xoay Quanh Bánh Trái (Pivot Left)',
        desc: `Bánh trái đứng yên (0.0), bánh phải đẩy (${r}) → Robot bẻ lái gấp sang trái quanh bánh trái.`,
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300'
      };
    }
    if (Math.abs(r) < 0.05 && l > 0) {
      return {
        title: 'Xoay Quanh Bánh Phải (Pivot Right)',
        desc: `Bánh phải đứng yên (0.0), bánh trái đẩy (${l}) → Robot bẻ lái gấp sang phải quanh bánh phải.`,
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300'
      };
    }
    if (r > l) {
      return {
        title: 'Rẽ Vòng Cung Sang Trái (Curve Left)',
        desc: `Bánh phải chạy nhanh hơn bánh trái (${r} > ${l}) → Tạo mô-men quay làm robot bẻ cung sang trái.`,
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-300'
      };
    } else {
      return {
        title: 'Rẽ Vòng Cung Sang Phải (Curve Right)',
        desc: `Bánh trái chạy nhanh hơn bánh phải (${l} > ${r}) → Tạo mô-men quay làm robot bẻ cung sang phải.`,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-300'
      };
    }
  };

  const explanation = getMotionExplanation();

  // Animation simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPos((prev) => {
        // Differential drive integration:
        const v = ((rightSpeed + leftSpeed) / 2) * SPEED_SCALE;
        const omega = ((rightSpeed - leftSpeed) / WHEEL_BASE) * SPEED_SCALE;

        const newTheta = prev.theta + omega;
        let newX = prev.x + v * Math.cos(newTheta);
        let newY = prev.y + v * Math.sin(newTheta);

        // Keep inside bounds (with wrap-around or soft bounce)
        const margin = 25;
        if (newX < margin) newX = margin;
        if (newX > 600 - margin) newX = 600 - margin;
        if (newY < margin) newY = margin;
        if (newY > 440 - margin) newY = 440 - margin;

        return { x: newX, y: newY, theta: newTheta };
      });

      // Update trajectory trail if moved
      if (Math.abs(leftSpeed) > 0.01 || Math.abs(rightSpeed) > 0.01) {
        setTrail((prev) => {
          const next = [...prev, { x: pos.x, y: pos.y }];
          if (next.length > 250) return next.slice(next.length - 250);
          return next;
        });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isRunning, leftSpeed, rightSpeed, pos.x, pos.y]);

  const handleReset = () => {
    setPos({ x: 300, y: 240, theta: -Math.PI / 2 });
    setTrail([]);
    setLeftSpeed(0.0);
    setRightSpeed(0.0);
  };

  const handleEmergencyStop = () => {
    setLeftSpeed(0.0);
    setRightSpeed(0.0);
    if (onEmergencyStop) onEmergencyStop();
  };

  const setPreset = (l: number, r: number) => {
    setLeftSpeed(l);
    setRightSpeed(r);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Mô Phỏng Robot Hai Động Cơ (Differential Drive)</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                MÔ PHỎNG AN TOÀN
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Mô hình hóa động học vi sai của JetBot: hai bánh xe điều khiển độc lập (-1.0 đến +1.0)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isRunning ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Tạm Dừng' : 'Tiếp Tục'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" /> Đặt Lại Vị Trí
          </button>
          <button
            onClick={handleEmergencyStop}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <AlertTriangle className="w-4 h-4" /> DỪNG KHẨN CẤP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: 2D Simulation Arena */}
        <div className="lg:col-span-7 p-4 bg-slate-950 flex flex-col items-center justify-center relative select-none">
          {/* Visual Track Arena Container */}
          <div className="relative w-full max-w-[600px] h-[440px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
            {/* Background Track Grid and Demo Road */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="arenaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                {/* Road curve gradient */}
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Grid */}
              <rect width="100%" height="100%" fill="url(#arenaGrid)" />

              {/* Educational Road Circuit Outline */}
              <path
                d="M 120 100 C 300 40, 480 80, 500 200 C 520 340, 380 380, 240 370 C 100 360, 60 220, 120 100 Z"
                fill="none"
                stroke="#475569"
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />
              <path
                d="M 120 100 C 300 40, 480 80, 500 200 C 520 340, 380 380, 240 370 C 100 360, 60 220, 120 100 Z"
                fill="none"
                stroke="#facc15"
                strokeWidth="2.5"
                strokeDasharray="10 10"
                opacity="0.5"
              />

              {/* Trajectory Breadcrumbs */}
              {showTrail && trail.length > 1 && (
                <polyline
                  points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
              )}

              {/* Dynamic Robot SVG Representation */}
              <g transform={`translate(${pos.x}, ${pos.y}) rotate(${(pos.theta * 180) / Math.PI + 90})`}>
                {/* Camera Field of View (FOV) cone */}
                {showCameraCone && (
                  <path
                    d="M 0 -22 L -45 -110 L 45 -110 Z"
                    fill="rgba(56, 189, 248, 0.12)"
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Robot Main Chassis (Body) */}
                <rect
                  x="-20"
                  y="-26"
                  width="40"
                  height="52"
                  rx="8"
                  fill="#1e293b"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />

                {/* Jetson Nano Heat-sink / Board detail */}
                <rect x="-14" y="-12" width="28" height="24" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <path d="M -10 -8 L 10 -8 M -10 -4 L 10 -4 M -10 0 L 10 0 M -10 4 L 10 4 M -10 8 L 10 8" stroke="#0284c7" strokeWidth="1" />

                {/* Front Camera Mount */}
                <rect x="-7" y="-28" width="14" height="6" rx="2" fill="#0284c7" />
                <circle cx="0" cy="-28" r="2.5" fill="#38bdf8" />

                {/* Front Heading Arrow */}
                <polygon points="0,-42 -6,-32 6,-32" fill="#38bdf8" />

                {/* Left Motor / Track (Left side of robot) */}
                <g transform="translate(-25, 0)">
                  <rect
                    x="-6"
                    y="-18"
                    width="9"
                    height="36"
                    rx="3"
                    fill={leftSpeed > 0 ? '#10b981' : leftSpeed < 0 ? '#f43f5e' : '#475569'}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  {/* Wheel ribs (animated spinning indicator) */}
                  <line x1="-5" y1="-10" x2="2" y2="-10" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                  <line x1="-5" y1="0" x2="2" y2="0" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                  <line x1="-5" y1="10" x2="2" y2="10" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                </g>

                {/* Right Motor / Track (Right side of robot) */}
                <g transform="translate(25, 0)">
                  <rect
                    x="-3"
                    y="-18"
                    width="9"
                    height="36"
                    rx="3"
                    fill={rightSpeed > 0 ? '#10b981' : rightSpeed < 0 ? '#f43f5e' : '#475569'}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  {/* Wheel ribs */}
                  <line x1="-2" y1="-10" x2="5" y2="-10" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                  <line x1="-2" y1="0" x2="5" y2="0" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                  <line x1="-2" y1="10" x2="5" y2="10" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                </g>

                {/* Velocity Vector Arrow */}
                {showVectors && (
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={-linearVel * 12}
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Left & Right Labels */}
                <text x="-34" y="2" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">L</text>
                <text x="34" y="2" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">R</text>
              </g>
            </svg>

            {/* In-canvas telemetry overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-200 shadow-md">
              <div className="flex items-center gap-3">
                <span>X: {pos.x.toFixed(0)}px</span>
                <span>Y: {pos.y.toFixed(0)}px</span>
                <span>Góc: {(((pos.theta * 180) / Math.PI + 360) % 360).toFixed(0)}°</span>
              </div>
            </div>

            {/* Viewport toggles */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300">
              <button
                onClick={() => setShowTrail(!showTrail)}
                className={`px-2 py-0.5 rounded ${showTrail ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Vệt đường
              </button>
              <button
                onClick={() => setShowVectors(!showVectors)}
                className={`px-2 py-0.5 rounded ${showVectors ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Vector
              </button>
              <button
                onClick={() => setShowCameraCone(!showCameraCone)}
                className={`px-2 py-0.5 rounded ${showCameraCone ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Tầm Camera
              </button>
            </div>
          </div>
        </div>

        {/* Right: Kinematic Controls & Live Code Binding */}
        <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200">
          <div>
            {/* Live motion diagnosis card */}
            <div className={`p-4 rounded-xl border mb-5 ${explanation.badgeColor}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <Gauge className="w-4 h-4" />
                <span>{explanation.title}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{explanation.desc}</p>
            </div>

            {/* Motor Dual Sliders */}
            <div className="space-y-4 mb-6">
              {/* Left Motor Control */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <label className="text-xs font-bold text-slate-700">robot.left_motor.value</label>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    leftSpeed > 0 ? 'bg-emerald-100 text-emerald-800' : leftSpeed < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {leftSpeed > 0 ? `+${leftSpeed.toFixed(2)}` : leftSpeed.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={leftSpeed}
                  onChange={(e) => setLeftSpeed(parseFloat(e.target.value))}
                  disabled={isExternalControlled}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>-1.0 (Lùi tối đa)</span>
                  <span>0.0 (Dừng)</span>
                  <span>+1.0 (Tiến tối đa)</span>
                </div>
              </div>

              {/* Right Motor Control */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <label className="text-xs font-bold text-slate-700">robot.right_motor.value</label>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    rightSpeed > 0 ? 'bg-emerald-100 text-emerald-800' : rightSpeed < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rightSpeed > 0 ? `+${rightSpeed.toFixed(2)}` : rightSpeed.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={rightSpeed}
                  onChange={(e) => setRightSpeed(parseFloat(e.target.value))}
                  disabled={isExternalControlled}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>-1.0 (Lùi tối đa)</span>
                  <span>0.0 (Dừng)</span>
                  <span>+1.0 (Tiến tối đa)</span>
                </div>
              </div>
            </div>

            {/* Quick Presets from Specification (Section 5.4) */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Kịch bản thử nghiệm nhanh (Mục 5.4 Đặc tả):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPreset(0.6, 0.6)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs text-slate-700 font-medium transition shadow-2xs"
                >
                  <span className="font-bold text-emerald-600">1. Tiến:</span> +0.6, +0.6
                </button>
                <button
                  onClick={() => setPreset(-0.5, -0.5)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs text-slate-700 font-medium transition shadow-2xs"
                >
                  <span className="font-bold text-amber-600">2. Lùi:</span> -0.5, -0.5
                </button>
                <button
                  onClick={() => setPreset(0.2, 0.8)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs text-slate-700 font-medium transition shadow-2xs"
                >
                  <span className="font-bold text-blue-600">3. Rẽ cong:</span> +0.2, +0.8
                </button>
                <button
                  onClick={() => setPreset(0.0, 0.7)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs text-slate-700 font-medium transition shadow-2xs"
                >
                  <span className="font-bold text-indigo-600">4. Quanh bánh trái:</span> 0.0, +0.7
                </button>
                <button
                  onClick={() => setPreset(-0.5, 0.5)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs text-slate-700 font-medium transition shadow-2xs"
                >
                  <span className="font-bold text-cyan-600">5. Xoay tại chỗ:</span> -0.5, +0.5
                </button>
                <button
                  onClick={() => setPreset(0.0, 0.0)}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-left text-xs text-rose-700 font-bold transition shadow-2xs"
                >
                  6. Dừng an toàn: 0.0, 0.0
                </button>
              </div>
            </div>

            {/* Differential Drive Math Box */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-mono space-y-1">
              <div className="font-sans font-bold text-indigo-900 text-[11px] uppercase tracking-wide">
                Mô hình Toán học Vi sai:
              </div>
              <div>Vận tốc tiến: v = (v_R + v_L) / 2 = <span className="font-bold">{((rightSpeed + leftSpeed) / 2).toFixed(2)}</span></div>
              <div>Vận tốc góc: ω = (v_R - v_L) / b = <span className="font-bold">{((rightSpeed - leftSpeed) / WHEEL_BASE * 10).toFixed(2)} rad/s</span></div>
            </div>
          </div>

          {/* Educational Code Mapping note */}
          <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Giới hạn an toàn mô phỏng: [-1.0, +1.0]
            </span>
            <span className="text-slate-400">Notebook: teleoperation.ipynb & live_demo.ipynb</span>
          </div>
        </div>
      </div>
    </div>
  );
};
