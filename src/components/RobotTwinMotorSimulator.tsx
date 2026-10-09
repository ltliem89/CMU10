import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Compass, Gauge, Shield, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';

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

  // Synchronize with external speeds if controlled externally
  useEffect(() => {
    if (isExternalControlled && externalLeftSpeed !== undefined && externalRightSpeed !== undefined) {
      setLeftSpeed(externalLeftSpeed);
      setRightSpeed(externalRightSpeed);
    }
  }, [isExternalControlled, externalLeftSpeed, externalRightSpeed]);

  // Differential drive physical constants (scaled for visual educational clarity)
  const WHEEL_BASE = 40; // b: distance between wheels in pixels
  const SPEED_SCALE = 2.4; // mapping motor value [-1, 1] to simulation pixel steps

  // Computed kinematics
  const linearVel = ((rightSpeed + leftSpeed) / 2) * SPEED_SCALE;
  const angularVel = ((rightSpeed - leftSpeed) / WHEEL_BASE) * SPEED_SCALE;

  // Kinetic state description in Vietnamese with Vibrant STEM Badges
  const getMotionExplanation = () => {
    const l = parseFloat(leftSpeed.toFixed(2));
    const r = parseFloat(rightSpeed.toFixed(2));

    if (Math.abs(l) < 0.03 && Math.abs(r) < 0.03) {
      return {
        title: 'Robot Dừng Yên (Stop)',
        desc: 'Cả hai động cơ nhận giá trị 0.0. Không có lực kéo vi sai, robot đứng yên an toàn.',
        badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
      };
    }
    if (Math.abs(l - r) < 0.04) {
      if (l > 0) {
        return {
          title: 'Đi Thẳng Về Phía Trước (Forward)',
          desc: `Hai bánh cùng tốc độ và cùng chiều tiến (vL = ${l}, vR = ${r}) → Vận tốc góc ω ≈ 0, robot tịnh tiến thẳng.`,
          badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
        };
      } else {
        return {
          title: 'Lùi Thẳng Về Phía Sau (Backward)',
          desc: `Hai bánh cùng tốc độ và cùng chiều lùi (vL = ${l}, vR = ${r}) → Robot lùi thẳng.`,
          badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-700'
        };
      }
    }
    if (Math.abs(l + r) < 0.04) {
      if (r > l) {
        return {
          title: 'Xoay Tròn Tại Chỗ Ngược Chiều Kim Đồng Hồ (Spin Left)',
          desc: `Bánh phải tiến (${r}), bánh trái lùi (${l}) → Vận tốc tiến v ≈ 0, tâm quay trùng với tâm xe.`,
          badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-200 border-teal-300 dark:border-teal-700'
        };
      } else {
        return {
          title: 'Xoay Tròn Tại Chỗ Cùng Chiều Kim Đồng Hồ (Spin Right)',
          desc: `Bánh trái tiến (${l}), bánh phải lùi (${r}) → Robot xoay tròn tại chỗ sang phải.`,
          badgeColor: 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-200 border-teal-300 dark:border-teal-700'
        };
      }
    }
    if (Math.abs(l) < 0.05 && r > 0) {
      return {
        title: 'Xoay Quanh Bánh Trái (Pivot Left)',
        desc: `Bánh trái đứng yên (0.0), bánh phải đẩy (${r}) → Robot bẻ lái gấp sang trái quanh bánh trái.`,
        badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      };
    }
    if (Math.abs(r) < 0.05 && l > 0) {
      return {
        title: 'Xoay Quanh Bánh Phải (Pivot Right)',
        desc: `Bánh phải đứng yên (0.0), bánh trái đẩy (${l}) → Robot bẻ lái gấp sang phải quanh bánh phải.`,
        badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      };
    }
    if (r > l) {
      return {
        title: 'Rẽ Vòng Cung Sang Trái (Curve Left)',
        desc: `Bánh phải chạy nhanh hơn bánh trái (${r} > ${l}) → Tạo mô-men quay làm robot bẻ cung sang trái.`,
        badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border-purple-300 dark:border-purple-700'
      };
    } else {
      return {
        title: 'Rẽ Vòng Cung Sang Phải (Curve Right)',
        desc: `Bánh trái chạy nhanh hơn bánh phải (${l} > ${r}) → Tạo mô-men quay làm robot bẻ cung sang phải.`,
        badgeColor: 'bg-pink-100 text-pink-900 dark:bg-pink-950/60 dark:text-pink-200 border-pink-300 dark:border-pink-700'
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

        // Keep inside bounds (soft bounce at walls)
        const margin = 26;
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
    setIsRunning(false);
    if (onEmergencyStop) onEmergencyStop();
  };

  const setPreset = (l: number, r: number) => {
    setLeftSpeed(l);
    setRightSpeed(r);
    setIsRunning(true);
  };

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Vibrant STEM Header bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#2563EB] via-indigo-900 to-[#8B5CF6] text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Mô Phỏng Robot Vi Sai (Differential Drive)
              </h2>
              <span className="px-3 py-0.5 text-xs font-black rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                AN TOÀN TRÌNH DUYỆT
              </span>
            </div>
            <p className="text-sm text-cyan-100 mt-0.5">
              Mô hình hóa động học hai bánh xe độc lập: v_L và v_R từ -1.0 đến +1.0
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition shadow-sm ${
              isRunning ? 'bg-amber-400 text-amber-950 hover:bg-amber-300' : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
            {isRunning ? 'Tạm Dừng' : 'Chạy Mô Phỏng'}
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-sm font-bold bg-white/15 text-white hover:bg-white/25 flex items-center gap-2 transition border border-white/20"
          >
            <RotateCcw className="w-4.5 h-4.5" /> Đặt Lại Xe
          </button>
          <button
            onClick={handleEmergencyStop}
            className="px-4 py-2 rounded-xl text-sm font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-2 shadow-md transition border border-red-400/40"
          >
            <AlertTriangle className="w-4.5 h-4.5 animate-bounce" /> DỪNG KHẨN CẤP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: 2D Simulation Arena - High-tech Dark Science Lab Deck */}
        <div className="lg:col-span-7 p-4 sm:p-6 bg-[#0A101F] flex flex-col items-center justify-center relative select-none">
          {/* Visual Track Arena Container */}
          <div className="relative w-full max-w-[600px] h-[440px] bg-[#0E172E] rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl">
            {/* Background Track Grid and Demo Road */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="arenaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                </pattern>
                {/* Robot body glow */}
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid */}
              <rect width="100%" height="100%" fill="url(#arenaGrid)" />

              {/* Educational Road Circuit Outline */}
              <path
                d="M 120 100 C 300 40, 480 80, 500 200 C 520 340, 380 380, 240 370 C 100 360, 60 220, 120 100 Z"
                fill="none"
                stroke="#1E293B"
                strokeWidth="52"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <path
                d="M 120 100 C 300 40, 480 80, 500 200 C 520 340, 380 380, 240 370 C 100 360, 60 220, 120 100 Z"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3"
                strokeDasharray="12 10"
                opacity="0.8"
              />

              {/* Trajectory Breadcrumbs */}
              {showTrail && trail.length > 1 && (
                <polyline
                  points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeDasharray="5 3"
                  opacity="0.85"
                />
              )}

              {/* Dynamic JetBot SVG Model */}
              <g transform={`translate(${pos.x}, ${pos.y}) rotate(${(pos.theta * 180) / Math.PI + 90})`}>
                {/* Camera Field of View (FOV) cone with yellow laser light */}
                {showCameraCone && (
                  <path
                    d="M 0 -22 L -48 -115 L 48 -115 Z"
                    fill="rgba(250, 204, 21, 0.15)"
                    stroke="rgba(250, 204, 21, 0.6)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Robot Main Chassis (Body) */}
                <rect
                  x="-21"
                  y="-27"
                  width="42"
                  height="54"
                  rx="10"
                  fill="#172554"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />

                {/* Jetson Nano Micro-Controller Board */}
                <rect x="-15" y="-13" width="30" height="26" rx="4" fill="#0B1120" stroke="#3B82F6" strokeWidth="1" />
                <path d="M -11 -9 L 11 -9 M -11 -4 L 11 -4 M -11 1 L 11 1 M -11 6 L 11 6 M -11 10 L 11 10" stroke="#60A5FA" strokeWidth="1" />

                {/* Front Camera Mount */}
                <rect x="-8" y="-30" width="16" height="7" rx="3" fill="#0284C7" />
                <circle cx="0" cy="-30" r="3" fill="#22D3EE" />

                {/* Front Heading Arrow */}
                <polygon points="0,-45 -7,-34 7,-34" fill="#FACC15" />

                {/* Left Motor / Track (Left side of robot) */}
                <g transform="translate(-27, 0)">
                  <rect
                    x="-6"
                    y="-19"
                    width="10"
                    height="38"
                    rx="4"
                    fill={leftSpeed > 0 ? '#10B981' : leftSpeed < 0 ? '#EC4899' : '#475569'}
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  {/* Wheel ribs (animated spinning indicator) */}
                  <line x1="-5" y1="-10" x2="3" y2="-10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                  <line x1="-5" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                  <line x1="-5" y1="10" x2="3" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                </g>

                {/* Right Motor / Track (Right side of robot) */}
                <g transform="translate(27, 0)">
                  <rect
                    x="-4"
                    y="-19"
                    width="10"
                    height="38"
                    rx="4"
                    fill={rightSpeed > 0 ? '#10B981' : rightSpeed < 0 ? '#EC4899' : '#475569'}
                    stroke="#F97316"
                    strokeWidth="2"
                  />
                  {/* Wheel ribs */}
                  <line x1="-3" y1="-10" x2="5" y2="-10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                  <line x1="-3" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                  <line x1="-3" y1="10" x2="5" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                </g>

                {/* Velocity Vector Arrow */}
                {showVectors && (
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={-linearVel * 14}
                    stroke="#F43F5E"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Left & Right Motor Labels */}
                <text x="-37" y="3" fill="#38BDF8" fontSize="9" fontWeight="900" textAnchor="end">L</text>
                <text x="37" y="3" fill="#FB923C" fontSize="9" fontWeight="900" textAnchor="start">R</text>
              </g>
            </svg>

            {/* In-canvas telemetry overlay */}
            <div className="absolute bottom-3 left-3 bg-[#0B1120]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] font-mono text-cyan-200 shadow-lg">
              <div className="flex items-center gap-3">
                <span>X: <strong className="text-white">{pos.x.toFixed(0)}px</strong></span>
                <span>Y: <strong className="text-white">{pos.y.toFixed(0)}px</strong></span>
                <span>Góc: <strong className="text-yellow-300">{(((pos.theta * 180) / Math.PI + 360) % 360).toFixed(0)}°</strong></span>
              </div>
            </div>

            {/* Viewport visual toggles */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0B1120]/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40 text-[11px] text-slate-300 shadow-md">
              <button
                onClick={() => setShowTrail(!showTrail)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${showTrail ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Vệt đường
              </button>
              <button
                onClick={() => setShowVectors(!showVectors)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${showVectors ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Vector v
              </button>
              <button
                onClick={() => setShowCameraCone(!showCameraCone)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${showCameraCone ? 'bg-yellow-500 text-black' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                FOV Camera
              </button>
            </div>
          </div>
        </div>

        {/* Right: Kinematic Controls & Live Code Binding */}
        <div className="lg:col-span-5 p-6 bg-slate-50 dark:bg-[#131E36] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
          <div>
            {/* Live motion diagnosis card */}
            <div className={`p-4.5 rounded-2xl border-2 mb-5 ${explanation.badgeColor} shadow-2xs`}>
              <div className="flex items-center gap-2.5 font-black text-base mb-1.5">
                <Gauge className="w-5 h-5 shrink-0" />
                <span>{explanation.title}</span>
              </div>
              <p className="text-sm leading-relaxed opacity-95 font-medium">{explanation.desc}</p>
            </div>

            {/* Motor Dual Sliders with Vibrant STEM Colors */}
            <div className="space-y-4 mb-6">
              {/* Left Motor Control (Electric Blue / Cyan) */}
              <div className="bg-white dark:bg-[#182442] p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-800/80 shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm"></span>
                    <label className="text-sm font-black text-slate-900 dark:text-white">
                      robot.left_motor.value (Bánh Trái)
                    </label>
                  </div>
                  <span className={`text-sm font-mono font-black px-2.5 py-0.5 rounded-lg ${
                    leftSpeed > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : leftSpeed < 0 ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                  <span>-1.0 (Lùi)</span>
                  <span>0.0 (Dừng)</span>
                  <span>+1.0 (Tiến)</span>
                </div>
              </div>

              {/* Right Motor Control (Energy Orange / Amber) */}
              <div className="bg-white dark:bg-[#182442] p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-800/80 shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-sm"></span>
                    <label className="text-sm font-black text-slate-900 dark:text-white">
                      robot.right_motor.value (Bánh Phải)
                    </label>
                  </div>
                  <span className={`text-sm font-mono font-black px-2.5 py-0.5 rounded-lg ${
                    rightSpeed > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : rightSpeed < 0 ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                  <span>-1.0 (Lùi)</span>
                  <span>0.0 (Dừng)</span>
                  <span>+1.0 (Tiến)</span>
                </div>
              </div>
            </div>

            {/* Quick Presets from Specification (Section 5.4) */}
            <div className="mb-5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center justify-between">
                <span>Kịch bản thử nghiệm nhanh:</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">Mục 5.4 Đặc tả</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPreset(0.6, 0.6)}
                  className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-[#182442] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium transition shadow-2xs stem-card-interactive"
                >
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block">1. Tiến thẳng:</span> +0.6, +0.6
                </button>
                <button
                  onClick={() => setPreset(-0.5, -0.5)}
                  className="p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-[#182442] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium transition shadow-2xs stem-card-interactive"
                >
                  <span className="font-black text-amber-600 dark:text-amber-400 block">2. Lùi thẳng:</span> -0.5, -0.5
                </button>
                <button
                  onClick={() => setPreset(0.2, 0.8)}
                  className="p-3 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-[#182442] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium transition shadow-2xs stem-card-interactive"
                >
                  <span className="font-black text-blue-600 dark:text-blue-400 block">3. Bẻ cong trái:</span> +0.2, +0.8
                </button>
                <button
                  onClick={() => setPreset(0.0, 0.7)}
                  className="p-3 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#182442] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium transition shadow-2xs stem-card-interactive"
                >
                  <span className="font-black text-purple-600 dark:text-purple-400 block">4. Quanh bánh trái:</span> 0.0, +0.7
                </button>
                <button
                  onClick={() => setPreset(-0.5, 0.5)}
                  className="p-3 rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-white dark:bg-[#182442] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium transition shadow-2xs stem-card-interactive"
                >
                  <span className="font-black text-teal-600 dark:text-teal-400 block">5. Xoay tròn tại chỗ:</span> -0.5, +0.5
                </button>
                <button
                  onClick={() => setPreset(0.0, 0.0)}
                  className="p-3 rounded-2xl border-2 border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 text-left text-xs sm:text-sm text-red-700 dark:text-red-300 font-black transition shadow-2xs stem-card-interactive"
                >
                  <span className="block">6. Dừng an toàn:</span> 0.0, 0.0
                </button>
              </div>
            </div>

            {/* Differential Drive Math Box */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 font-mono space-y-1.5 shadow-2xs">
              <div className="font-sans font-black text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                Mô hình Toán học Động học Vi sai:
              </div>
              <div>Vận tốc tiến: v = (v_R + v_L) / 2 = <strong className="text-blue-600 dark:text-blue-400">{((rightSpeed + leftSpeed) / 2).toFixed(2)}</strong></div>
              <div>Vận tốc góc: ω = (v_R - v_L) / b = <strong className="text-purple-600 dark:text-purple-400">{((rightSpeed - leftSpeed) / WHEEL_BASE * 10).toFixed(2)} rad/s</strong></div>
            </div>
          </div>

          {/* Educational Code Mapping note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" /> Giới hạn xung an toàn: [-1.0, +1.0]
            </span>
            <span className="font-mono text-slate-500">teleoperation.ipynb &amp; live_demo.ipynb</span>
          </div>
        </div>
      </div>
    </div>
  );
};
