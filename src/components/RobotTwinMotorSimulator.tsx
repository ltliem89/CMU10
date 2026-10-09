import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Compass,
  Gauge,
  Shield,
  Zap,
  Terminal,
  FileText,
  Trash2,
  Copy,
  Check,
  Filter,
  Activity,
  Cpu,
  ArrowDown,
  Clock,
  Code,
  Radio,
  Sliders,
  Sparkles,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Square,
  Lock,
  Unlock,
  LineChart,
  SplitSquareVertical,
  Maximize2,
  FileCheck,
  Eye,
  Box,
  Ruler
} from 'lucide-react';
import { Robot3DCanvas } from './Robot3DCanvas';
import { MechanicalAcceptanceModal } from './MechanicalAcceptanceModal';
import {
  ROBOT_GEOMETRY_CONFIG,
  InspectionMode,
  ComponentSpec
} from '../types/robotGeometry';

export interface RobotLogEntry {
  id: string;
  timestamp: string;
  type: 'command' | 'telemetry' | 'safety' | 'event';
  source: string;
  pythonCode: string;
  leftVal: number;
  rightVal: number;
  linearVel: number;
  angularVel: number;
  actionText: string;
  explanation: string;
  badgeColor: string;
}

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
  const [isSyncLocked, setIsSyncLocked] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showCameraCone, setShowCameraCone] = useState<boolean>(true);

  // Visual Simulation Modes: '3d-mechanical' | '2d-arena'
  const [visualMode, setVisualMode] = useState<'3d-mechanical' | '2d-arena'>('3d-mechanical');
  const [isAcceptanceModalOpen, setIsAcceptanceModalOpen] = useState<boolean>(false);
  const [selected3DComponent, setSelected3DComponent] = useState<ComponentSpec | null>(null);
  const [inspectionMode, setInspectionMode] = useState<InspectionMode>('realistic');

  // Deck view modes: 'tabs' or 'split'
  const [deckViewMode, setDeckViewMode] = useState<'tabs' | 'split'>('tabs');
  // Active Tab when in tabs mode: 'control' | 'log' | 'graph'
  const [activeTab, setActiveTab] = useState<'control' | 'log' | 'graph'>('control');

  // Robot physical state in 2D space (arena is 600x400)
  const [pos, setPos] = useState<{ x: number; y: number; theta: number }>({
    x: 300,
    y: 200,
    theta: -Math.PI / 2 // facing up
  });

  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  // Differential drive physical constants
  const WHEEL_BASE = 40; // b: distance between wheels in pixels
  const SPEED_SCALE = 2.4; // mapping motor value [-1, 1] to simulation pixel steps

  // Computed kinematics
  const linearVel = ((rightSpeed + leftSpeed) / 2) * SPEED_SCALE;
  const angularVel = ((rightSpeed - leftSpeed) / WHEEL_BASE) * SPEED_SCALE;

  // History for live graphing (last 35 points)
  const [telemetryHistory, setTelemetryHistory] = useState<{ t: number; left: number; right: number; v: number }[]>([]);

  // Real-time Robot Telemetry & Command Log State
  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const [logs, setLogs] = useState<RobotLogEntry[]>(() => [
    {
      id: 'boot-1',
      timestamp: formatTime(),
      type: 'event',
      source: 'JetBot OS',
      pythonCode: 'from jetbot import Robot\nrobot = Robot()',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'Khởi tạo Kết nối Robot JetBot (NVIDIA Jetson)',
      explanation: 'Khởi tạo đối tượng Robot, nhận diện thành công bus I2C (địa chỉ 0x60) điều khiển 2 kênh động cơ vi sai.',
      badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-cyan-300 border-blue-400'
    },
    {
      id: 'boot-2',
      timestamp: formatTime(),
      type: 'safety',
      source: 'Driver PCA9685',
      pythonCode: 'robot.stop()',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'Trạng thái Chờ Ban đầu: Dừng An Toàn',
      explanation: 'Đặt cả hai kênh xung PWM (trái & phải) về 0.0 để giữ robot đứng yên an toàn.',
      badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-400'
    }
  ]);

  const [logFilter, setLogFilter] = useState<'all' | 'command' | 'telemetry' | 'safety'>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedItemIndex, setCopiedItemIndex] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const telemetryTickRef = useRef<number>(0);
  const debounceSliderRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoggedSpeeds = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  const addLog = useCallback((entry: Omit<RobotLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: RobotLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formatTime()
    };
    setLogs((prev) => {
      const updated = [...prev, newEntry];
      if (updated.length > 120) return updated.slice(updated.length - 120);
      return updated;
    });
  }, []);

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

  // Helper to log explicit motor commands
  const logMotorCommand = useCallback((l: number, r: number, source: string = 'Điều khiển') => {
    const lVal = parseFloat(l.toFixed(2));
    const rVal = parseFloat(r.toFixed(2));

    // Avoid logging duplicate identical states
    if (lastLoggedSpeeds.current.left === lVal && lastLoggedSpeeds.current.right === rVal) {
      return;
    }
    lastLoggedSpeeds.current = { left: lVal, right: rVal };

    let pyCode = `robot.set_motors(${lVal}, ${rVal})`;
    let actionTitle = 'Cập nhật tốc độ động cơ';
    let badgeCol = 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-cyan-300 border-blue-400';
    let exp = `Xung PWM: Trái = ${Math.round(lVal * 100)}%, Phải = ${Math.round(rVal * 100)}% (I2C 0x60)`;

    if (Math.abs(lVal) < 0.02 && Math.abs(rVal) < 0.02) {
      pyCode = 'robot.stop()';
      actionTitle = 'Dừng động cơ (robot.stop)';
      badgeCol = 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-400';
      exp = 'Cả hai kênh PWM về 0.0. Robot dừng di chuyển hoàn toàn.';
    } else if (Math.abs(lVal - rVal) < 0.04) {
      if (lVal > 0) {
        pyCode = `robot.forward(speed=${lVal})`;
        actionTitle = 'Tiến thẳng (robot.forward)';
        badgeCol = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-400';
        exp = `Hai bánh quay cùng chiều (+${lVal}). Robot tịnh tiến thẳng đều theo hướng hiện tại.`;
      } else {
        pyCode = `robot.backward(speed=${Math.abs(lVal)})`;
        actionTitle = 'Lùi thẳng (robot.backward)';
        badgeCol = 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-400';
        exp = `Hai bánh quay lùi (-${Math.abs(lVal)}). Robot tịnh tiến lùi thẳng về phía sau.`;
      }
    } else if (Math.abs(lVal + rVal) < 0.04) {
      if (rVal > lVal) {
        pyCode = `robot.left(speed=${rVal})`;
        actionTitle = 'Quay trái tại chỗ (robot.left)';
        badgeCol = 'bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border-teal-400';
        exp = `Bánh phải tiến (+${rVal}), bánh trái lùi (${lVal}). Vận tốc góc ω đạt cực đại ngược chiều kim đồng hồ.`;
      } else {
        pyCode = `robot.right(speed=${lVal})`;
        actionTitle = 'Quay phải tại chỗ (robot.right)';
        badgeCol = 'bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border-teal-400';
        exp = `Bánh trái tiến (+${lVal}), bánh phải lùi (${rVal}). Robot xoay tròn quanh tâm sang phải.`;
      }
    } else if (Math.abs(lVal) < 0.05 && rVal > 0) {
      pyCode = `robot.set_motors(0.0, ${rVal})  # Bẻ lái quanh bánh trái`;
      actionTitle = 'Quay quanh bánh trái (Pivot Left)';
      badgeCol = 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-400';
      exp = `Bánh trái khóa 0.0, bánh phải đẩy +${rVal}. Bán kính quay R = b/2.`;
    } else if (Math.abs(rVal) < 0.05 && lVal > 0) {
      pyCode = `robot.set_motors(${lVal}, 0.0)  # Bẻ lái quanh bánh phải`;
      actionTitle = 'Quay quanh bánh phải (Pivot Right)';
      badgeCol = 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-400';
      exp = `Bánh phải khóa 0.0, bánh trái đẩy +${lVal}. Bán kính quay R = b/2.`;
    } else if (rVal > lVal) {
      pyCode = `robot.set_motors(${lVal}, ${rVal})  # Rẽ cong trái`;
      actionTitle = 'Bẻ cung sang trái (Curve Left)';
      badgeCol = 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-400';
      exp = `Bánh phải nhanh hơn (${rVal} > ${lVal}). Robot ôm cua sang trái.`;
    } else {
      pyCode = `robot.set_motors(${lVal}, ${rVal})  # Rẽ cong phải`;
      actionTitle = 'Bẻ cung sang phải (Curve Right)';
      badgeCol = 'bg-pink-100 text-pink-900 dark:bg-pink-950/80 dark:text-pink-300 border-pink-400';
      exp = `Bánh trái nhanh hơn (${lVal} > ${rVal}). Robot ôm cua sang phải.`;
    }

    const newLin = ((rVal + lVal) / 2) * SPEED_SCALE;
    const newAng = ((rVal - lVal) / WHEEL_BASE) * SPEED_SCALE;

    addLog({
      type: 'command',
      source,
      pythonCode: pyCode,
      leftVal: lVal,
      rightVal: rVal,
      linearVel: newLin,
      angularVel: newAng,
      actionText: actionTitle,
      explanation: exp,
      badgeColor: badgeCol
    });
  }, [SPEED_SCALE, WHEEL_BASE, addLog]);

  // Synchronize with external speeds if controlled externally
  useEffect(() => {
    if (isExternalControlled && externalLeftSpeed !== undefined && externalRightSpeed !== undefined) {
      setLeftSpeed(externalLeftSpeed);
      setRightSpeed(externalRightSpeed);
      logMotorCommand(externalLeftSpeed, externalRightSpeed, 'Chương Trình Ngoài (AI/Runtime)');
    }
  }, [isExternalControlled, externalLeftSpeed, externalRightSpeed, logMotorCommand]);

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
        if (newY > 400 - margin) newY = 400 - margin;

        // Periodic Telemetry Odometry Heartbeat (~2.2s when moving)
        if (Math.abs(leftSpeed) > 0.02 || Math.abs(rightSpeed) > 0.02) {
          telemetryTickRef.current += 1;
          if (telemetryTickRef.current >= 75) {
            telemetryTickRef.current = 0;
            const headingDeg = Math.round((((newTheta * 180) / Math.PI + 360) % 360));
            addLog({
              type: 'telemetry',
              source: 'Odometry Động Cơ',
              pythonCode: `# Telemetry: x=${newX.toFixed(1)}, y=${newY.toFixed(1)}, theta=${headingDeg}°`,
              leftVal: leftSpeed,
              rightVal: rightSpeed,
              linearVel: v,
              angularVel: omega,
              actionText: `Cập nhật Vị Trí: (${newX.toFixed(0)}px, ${newY.toFixed(0)}px) | Hướng ${headingDeg}°`,
              explanation: `Vận tốc dài v = ${v.toFixed(2)} px/bước | Tốc độ góc ω = ${(omega * 10).toFixed(2)} rad/s | PWM L: ${(leftSpeed * 100).toFixed(0)}%, R: ${(rightSpeed * 100).toFixed(0)}%`,
              badgeColor: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-400'
            });
          }
        }

        return { x: newX, y: newY, theta: newTheta };
      });

      // Update trajectory trail if moved
      if (Math.abs(leftSpeed) > 0.01 || Math.abs(rightSpeed) > 0.01) {
        setTrail((prev) => {
          const next = [...prev, { x: pos.x, y: pos.y }];
          if (next.length > 200) return next.slice(next.length - 200);
          return next;
        });
      }

      // Record telemetry history for live graphing
      setTelemetryHistory((prev) => {
        const next = [
          ...prev,
          {
            t: Date.now(),
            left: leftSpeed,
            right: rightSpeed,
            v: linearVel
          }
        ];
        if (next.length > 35) return next.slice(next.length - 35);
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isRunning, leftSpeed, rightSpeed, pos.x, pos.y, SPEED_SCALE, WHEEL_BASE, linearVel, addLog]);

  // Auto-scroll log console
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll, activeTab, deckViewMode]);

  const handleReset = () => {
    setPos({ x: 300, y: 200, theta: -Math.PI / 2 });
    setTrail([]);
    setLeftSpeed(0.0);
    setRightSpeed(0.0);
    lastLoggedSpeeds.current = { left: 0, right: 0 };
    addLog({
      type: 'event',
      source: 'Nút Đặt Lại Xe',
      pythonCode: 'robot.stop()  # Đặt lại vị trí ban đầu (x=300, y=200)',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'Đặt Lại Tọa Độ Robot (Reset Odometry)',
      explanation: 'Robot đưa về tọa độ trung tâm sàn thi đấu (300px, 200px, -90°), xóa vệt quỹ đạo di chuyển cũ.',
      badgeColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-400'
    });
  };

  const handleEmergencyStop = () => {
    setLeftSpeed(0.0);
    setRightSpeed(0.0);
    setIsRunning(false);
    lastLoggedSpeeds.current = { left: 0, right: 0 };
    addLog({
      type: 'safety',
      source: 'Nút Dừng Khẩn Cấp (E-STOP)',
      pythonCode: 'robot.stop()  # DỪNG KHẨN CẤP AN TOÀN!',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'KÍCH HOẠT DỪNG KHẨN CẤP (E-STOP)',
      explanation: 'Ngắt xung PWM tức thời trên mạch cầu H TB6612FNG để triệt tiêu quán tính và chống va chạm.',
      badgeColor: 'bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-300 border-red-500'
    });
    if (onEmergencyStop) onEmergencyStop();
  };

  const setPreset = (l: number, r: number, presetName: string) => {
    setLeftSpeed(l);
    setRightSpeed(r);
    setIsRunning(true);
    logMotorCommand(l, r, presetName);
  };

  const handleLeftSliderChange = (newVal: number) => {
    setLeftSpeed(newVal);
    if (isSyncLocked) {
      setRightSpeed(newVal);
    }
    if (debounceSliderRef.current) clearTimeout(debounceSliderRef.current);
    debounceSliderRef.current = setTimeout(() => {
      logMotorCommand(newVal, isSyncLocked ? newVal : rightSpeed, 'Thanh Trượt Bánh Trái');
    }, 200);
  };

  const handleRightSliderChange = (newVal: number) => {
    setRightSpeed(newVal);
    if (isSyncLocked) {
      setLeftSpeed(newVal);
    }
    if (debounceSliderRef.current) clearTimeout(debounceSliderRef.current);
    debounceSliderRef.current = setTimeout(() => {
      logMotorCommand(isSyncLocked ? newVal : leftSpeed, newVal, 'Thanh Trượt Bánh Phải');
    }, 200);
  };

  const handleDpadControl = (action: 'forward' | 'backward' | 'spinLeft' | 'spinRight' | 'stop') => {
    setIsRunning(true);
    switch (action) {
      case 'forward':
        setPreset(0.6, 0.6, 'D-Pad: Tiến Thẳng');
        break;
      case 'backward':
        setPreset(-0.5, -0.5, 'D-Pad: Lùi Thẳng');
        break;
      case 'spinLeft':
        setPreset(-0.5, 0.5, 'D-Pad: Xoay Trái Tại Chỗ');
        break;
      case 'spinRight':
        setPreset(0.5, -0.5, 'D-Pad: Xoay Phải Tại Chỗ');
        break;
      case 'stop':
        setPreset(0.0, 0.0, 'D-Pad: Dừng Lại');
        break;
    }
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: formatTime(),
        type: 'event',
        source: 'Nhật Ký Robot',
        pythonCode: '# Đã xóa lịch sử hiển thị - Tiếp tục lắng nghe bus I2C...',
        leftVal: leftSpeed,
        rightVal: rightSpeed,
        linearVel: linearVel,
        angularVel: angularVel,
        actionText: 'Làm Sạch Nhật Ký Ghi Nhận',
        explanation: 'Bộ đệm hiển thị nhật ký đã được làm mới. Các lệnh tiếp theo sẽ được lưu trữ tự động.',
        badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-400'
      }
    ]);
  };

  const handleCopyPythonScript = () => {
    const validCommands = logs
      .filter((l) => l.type === 'command' || l.type === 'safety')
      .map((l) => `    ${l.pythonCode.split('\n')[0]}\n    time.sleep(1.0)`)
      .slice(-15);

    const script = `# ==============================================================================
# NHẬT KÝ ĐIỀU KHIỂN ROBOT JETBOT (CMU STEM LAB LỚP 11)
# Thời gian ghi: ${new Date().toLocaleString('vi-VN')}
# Phần cứng: NVIDIA Jetson Nano + Motor Driver I2C (0x60)
# ==============================================================================
from jetbot import Robot
import time

robot = Robot()
print("Bắt đầu chuỗi lệnh điều khiển thực tế:")

try:
${validCommands.length > 0 ? validCommands.join('\n') : '    robot.forward(0.5)\n    time.sleep(1.0)\n    robot.stop()'}
finally:
    robot.stop()
    print("Hoàn tất chuỗi lệnh an toàn.")
`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2200);
  };

  const handleCopySingleCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedItemIndex(id);
    setTimeout(() => setCopiedItemIndex(null), 1800);
  };

  // Filter logs based on active tab
  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'command') return l.type === 'command';
    if (logFilter === 'telemetry') return l.type === 'telemetry';
    if (logFilter === 'safety') return l.type === 'safety' || l.type === 'event';
    return true;
  });

  const commandCount = logs.filter((l) => l.type === 'command').length;
  const telemetryCount = logs.filter((l) => l.type === 'telemetry').length;
  const safetyCount = logs.filter((l) => l.type === 'safety' || l.type === 'event').length;

  // Render Log Console UI
  const renderLogConsole = (isCompact = false) => (
    <div className="flex flex-col h-full bg-[#060B16] text-white rounded-2xl overflow-hidden border border-cyan-500/20">
      {/* Log Header Toolbar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#0B1528] via-[#0F1C36] to-[#122345] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span className="font-black text-white text-xs sm:text-sm tracking-wide">
            Nhật Ký Lệnh &amp; Telemetry
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            I2C: 0x60
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
              autoScroll
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Tự động cuộn theo lệnh mới"
          >
            <ArrowDown className={`w-3 h-3 ${autoScroll ? 'animate-bounce' : ''}`} />
            <span>{autoScroll ? 'Tự Cuộn' : 'Dừng Cuộn'}</span>
          </button>

          <button
            onClick={handleCopyPythonScript}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 flex items-center gap-1 transition"
            title="Sao chép toàn bộ lệnh dưới dạng Python script"
          >
            {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copiedScript ? 'Đã chép' : 'Python'}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 flex items-center gap-1 transition"
            title="Làm sạch danh sách"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 bg-[#091224] border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLogFilter('all')}
            className={`px-2 py-0.5 rounded-md font-mono font-bold transition ${
              logFilter === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setLogFilter('command')}
            className={`px-2 py-0.5 rounded-md font-mono font-bold transition ${
              logFilter === 'command'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Lệnh ({commandCount})
          </button>
          <button
            onClick={() => setLogFilter('telemetry')}
            className={`px-2 py-0.5 rounded-md font-mono font-bold transition ${
              logFilter === 'telemetry'
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Vị trí ({telemetryCount})
          </button>
          <button
            onClick={() => setLogFilter('safety')}
            className={`px-2 py-0.5 rounded-md font-mono font-bold transition ${
              logFilter === 'safety'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            An toàn ({safetyCount})
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
          PCA9685 @ 50Hz
        </div>
      </div>

      {/* Log entries scroll stream */}
      <div
        ref={logContainerRef}
        className={`${isCompact ? 'h-56' : 'h-[380px]'} overflow-y-auto p-3 space-y-2 font-mono text-xs scroll-smooth bg-[#050913]`}
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
            <Terminal className="w-7 h-7 text-slate-600" />
            <p className="text-xs">Không có dữ liệu trong bộ lọc này.</p>
            <button
              onClick={() => setLogFilter('all')}
              className="px-2.5 py-1 rounded bg-cyan-600/30 text-cyan-300 text-xs font-bold hover:bg-cyan-600/50"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isCommand = entry.type === 'command';
            const isSafety = entry.type === 'safety';
            const isTelemetry = entry.type === 'telemetry';

            return (
              <div
                key={entry.id}
                className={`p-2.5 rounded-xl border transition-all duration-150 ${
                  isSafety
                    ? 'bg-red-950/35 border-red-500/50 text-red-100'
                    : isCommand
                    ? 'bg-[#0B1528] border-cyan-500/30 text-slate-100'
                    : isTelemetry
                    ? 'bg-[#081826] border-teal-500/30 text-slate-200'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {entry.timestamp.split('.')[0]}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border ${
                        isSafety
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isCommand
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : isTelemetry
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      {isSafety ? 'E-STOP' : isCommand ? 'LỆNH' : isTelemetry ? 'ODO' : 'SYS'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {entry.source}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopySingleCode(entry.pythonCode, entry.id)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Chép mã dòng này"
                  >
                    {copiedItemIndex === entry.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Code Block */}
                <div className="bg-[#02050D] px-2 py-1.5 rounded-lg border border-slate-800/90 mb-1.5 font-mono flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold truncate">
                    <span className="text-cyan-400 select-none">&gt;&gt;&gt;</span>
                    <span className="truncate">{entry.pythonCode.split('\n')[0]}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 px-1 py-0.5 rounded shrink-0 ml-1">
                    ACK
                  </span>
                </div>

                {/* Pedagogical Explanation */}
                <div className="text-[11px] text-slate-300 font-sans leading-snug">
                  <strong className="text-white">{entry.actionText}: </strong>
                  <span>{entry.explanation}</span>
                </div>

                {/* Motor metrics */}
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-800/60 font-mono text-[9px] text-slate-400">
                  <span className="text-blue-300">L: {Math.round(entry.leftVal * 100)}%</span>
                  <span>|</span>
                  <span className="text-orange-300">R: {Math.round(entry.rightVal * 100)}%</span>
                  <span>|</span>
                  <span>v: {entry.linearVel.toFixed(1)}</span>
                  <span>|</span>
                  <span>ω: {(entry.angularVel * 10).toFixed(1)} rad/s</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* ============================================================================== */}
      {/* 1. UNIFIED COCKPIT HEADER BAR */}
      {/* ============================================================================== */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#1E40AF] via-[#312E81] to-[#6D28D9] text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-cyan-300 shadow-xs shrink-0">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Mô Phỏng Robot Vi Sai (Differential Drive)
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-400 text-emerald-950 shadow-xs uppercase">
                JetBot STEM v2
              </span>
            </div>
            <p className="text-xs text-cyan-100 mt-0.5 hidden sm:block">
              Điều khiển động lực học 2 kênh motor vi sai v_L &amp; v_R qua giao thức I2C 0x60
            </p>
          </div>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Deck View Mode Switcher: Tabs vs Split View */}
          <div className="hidden md:flex items-center bg-black/20 p-1 rounded-xl border border-white/15 text-xs">
            <button
              onClick={() => setDeckViewMode('tabs')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                deckViewMode === 'tabs' ? 'bg-white text-indigo-950 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
              title="Chế độ chuyển tab"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Tab Độc Lập
            </button>
            <button
              onClick={() => setDeckViewMode('split')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                deckViewMode === 'split' ? 'bg-white text-indigo-950 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
              title="Chế độ chia đôi: Xem điều khiển & nhật ký song song"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Chia Đôi (Split)
            </button>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition shadow-xs ${
              isRunning ? 'bg-amber-400 text-amber-950 hover:bg-amber-300' : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Tạm Dừng' : 'Chạy'}
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 flex items-center gap-1.5 transition border border-white/20"
            title="Đặt lại vị trí ban đầu"
          >
            <RotateCcw className="w-4 h-4" /> Đặt Lại
          </button>

          <button
            onClick={() => setIsAcceptanceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 flex items-center gap-1.5 transition border border-cyan-400/40 shadow-xs"
            title="Xem biên bản nghiệm thu 10 tiêu chí chuẩn cơ khí CMU10"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Nghiệm Thu (Mục 9)</span>
          </button>

          <button
            onClick={handleEmergencyStop}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-1.5 shadow-md transition border border-red-400/40"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" /> E-STOP
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. MAIN 2-COLUMN BALANCED COCKPIT GRID */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* -------------------------------------------------------------------------- */}
        {/* LEFT COLUMN: SIMULATION ARENA & REALTIME GAUGES (7 COLS) */}
        {/* -------------------------------------------------------------------------- */}
        <div className="lg:col-span-7 p-4 sm:p-5 bg-[#090F1E] flex flex-col justify-between select-none border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          <div>
            {/* View Mode Switcher: 3D Mechanical Twin vs 2D Track Circuit */}
            <div className="flex items-center justify-between mb-3 bg-[#0C152B] p-1.5 rounded-2xl border border-cyan-500/20 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVisualMode('3d-mechanical')}
                  className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition ${
                    visualMode === '3d-mechanical'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Mô Hình 3D Chuẩn Cơ Khí CMU10</span>
                </button>
                <button
                  onClick={() => setVisualMode('2d-arena')}
                  className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition ${
                    visualMode === '2d-arena'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Sân Đua Bám Đường 2D</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-cyan-300/80 mr-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ISO CMU10-V2.4 (138×125×130mm)</span>
              </div>
            </div>

            {/* Visual Viewport: Either 3D Mechanical Canvas or 2D Arena */}
            {visualMode === '3d-mechanical' ? (
              <div className="relative w-full aspect-[4/3] max-h-[420px] rounded-2xl overflow-hidden shadow-2xl mx-auto">
                <Robot3DCanvas
                  leftSpeed={leftSpeed}
                  rightSpeed={rightSpeed}
                  selectedComponentId={selected3DComponent?.id}
                  onSelectComponent={setSelected3DComponent}
                  inspectionMode={inspectionMode}
                  onInspectionModeChange={setInspectionMode}
                />
              </div>
            ) : (
              /* Arena Viewport Container (2D) */
              <div className="relative w-full aspect-[4/3] max-h-[380px] bg-[#0C152B] rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl mx-auto flex items-center justify-center">
                {/* Background Track Circuit & Grid */}
                <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="arenaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                    </pattern>
                    <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284C7" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>

                  {/* Grid */}
                  <rect width="100%" height="100%" fill="url(#arenaGrid)" />

                  {/* Race Track Outline */}
                  <path
                    d="M 120 100 C 300 40, 480 80, 500 200 C 520 320, 380 350, 240 340 C 100 330, 60 220, 120 100 Z"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="52"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
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
                    strokeDasharray="14 12"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* Trajectory Trail */}
                  {showTrail && trail.length > 1 && (
                    <polyline
                      points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      opacity="0.65"
                    />
                  )}

                  {/* Robot Body */}
                  <g transform={`translate(${pos.x}, ${pos.y}) rotate(${(pos.theta * 180) / Math.PI + 90})`}>
                    {/* FOV Camera */}
                    {showCameraCone && (
                      <path
                        d="M 0 -18 L -48 -95 L 48 -95 Z"
                        fill="rgba(250, 204, 21, 0.16)"
                        stroke="rgba(250, 204, 21, 0.5)"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Left Wheel (Blue) */}
                    <rect
                      x="-28"
                      y="-14"
                      width="8"
                      height="28"
                      rx="3"
                      fill="#0284C7"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                    />
                    {/* Right Wheel (Orange) */}
                    <rect
                      x="20"
                      y="-14"
                      width="8"
                      height="28"
                      rx="3"
                      fill="#EA580C"
                      stroke="#FB923C"
                      strokeWidth="1.5"
                    />

                    {/* Rear Caster Wheel */}
                    <circle cx="0" cy="18" r="4.5" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />

                    {/* Chassis Body */}
                    <rect
                      x="-20"
                      y="-22"
                      width="40"
                      height="44"
                      rx="8"
                      fill="#0F172A"
                      stroke="#22D3EE"
                      strokeWidth="2.5"
                    />

                    {/* Jetson Nano Heat Sink */}
                    <rect x="-14" y="-14" width="28" height="24" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
                    <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#475569" strokeWidth="1.5" />
                    <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#475569" strokeWidth="1.5" />
                    <line x1="-10" y1="4" x2="10" y2="4" stroke="#475569" strokeWidth="1.5" />

                    {/* Front Camera Mount */}
                    <rect x="-8" y="-27" width="16" height="8" rx="2" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.2" />
                    <circle cx="0" cy="-23" r="3" fill="#10B981" />

                    {/* Differential Drive Wheel Vector Arrows */}
                    {showVectors && (
                      <g>
                        {/* Left vector */}
                        <line
                          x1="-24"
                          y1="0"
                          x2="-24"
                          y2={-leftSpeed * 28}
                          stroke="#38BDF8"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Right vector */}
                        <line
                          x1="24"
                          y1="0"
                          x2="24"
                          y2={-rightSpeed * 28}
                          stroke="#FB923C"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Combined linear velocity vector */}
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2={-linearVel * 14}
                          stroke="#F43F5E"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Motor Wheel Labels */}
                    <text x="-36" y="3" fill="#38BDF8" fontSize="9" fontWeight="900" textAnchor="end">L</text>
                    <text x="36" y="3" fill="#FB923C" fontSize="9" fontWeight="900" textAnchor="start">R</text>
                  </g>
                </svg>

                {/* In-canvas telemetry overlay */}
                <div className="absolute bottom-2.5 left-2.5 bg-[#0B1120]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-[11px] font-mono text-cyan-200 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span>X: <strong className="text-white">{pos.x.toFixed(0)}px</strong></span>
                    <span>Y: <strong className="text-white">{pos.y.toFixed(0)}px</strong></span>
                    <span>Hướng: <strong className="text-yellow-300">{(((pos.theta * 180) / Math.PI + 360) % 360).toFixed(0)}°</strong></span>
                  </div>
                </div>

                {/* Viewport visual toggles */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#0B1120]/90 backdrop-blur-md p-1 rounded-xl border border-cyan-500/40 text-[10px] text-slate-300 shadow-md">
                  <button
                    onClick={() => setShowTrail(!showTrail)}
                    className={`px-2 py-0.5 rounded font-bold transition ${showTrail ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                  >
                    Vệt
                  </button>
                  <button
                    onClick={() => setShowVectors(!showVectors)}
                    className={`px-2 py-0.5 rounded font-bold transition ${showVectors ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                  >
                    Vector
                  </button>
                  <button
                    onClick={() => setShowCameraCone(!showCameraCone)}
                    className={`px-2 py-0.5 rounded font-bold transition ${showCameraCone ? 'bg-yellow-500 text-black' : 'hover:bg-slate-800 text-slate-400'}`}
                  >
                    FOV
                  </button>
                </div>
              </div>
            )}

            {/* Live Motor Dynamics HUD Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              <div className="p-2.5 rounded-xl bg-[#0E172E] border border-blue-500/30 text-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
                  <span>BÁNH TRÁI (L)</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-lg font-mono font-black text-white mt-1">
                  {leftSpeed > 0 ? `+${leftSpeed.toFixed(2)}` : leftSpeed.toFixed(2)}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-75"
                    style={{ width: `${Math.abs(leftSpeed) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E172E] border border-orange-500/30 text-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-orange-300 font-bold">
                  <span>BÁNH PHẢI (R)</span>
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                </div>
                <div className="text-lg font-mono font-black text-white mt-1">
                  {rightSpeed > 0 ? `+${rightSpeed.toFixed(2)}` : rightSpeed.toFixed(2)}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-75"
                    style={{ width: `${Math.abs(rightSpeed) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E172E] border border-cyan-500/30 text-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                  <span>VẬN TỐC TIẾN (v)</span>
                  <Zap className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-lg font-mono font-black text-cyan-200 mt-1">
                  {linearVel.toFixed(2)} <span className="text-xs text-slate-400">px/s</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  (v_R + v_L) / 2
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E172E] border border-purple-500/30 text-white flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                  <span>VẬN TỐC GÓC (ω)</span>
                  <Compass className="w-3 h-3 text-purple-400" />
                </div>
                <div className="text-lg font-mono font-black text-purple-200 mt-1">
                  {(angularVel * 10).toFixed(1)} <span className="text-xs text-slate-400">rad/s</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  (v_R - v_L) / b
                </div>
              </div>
            </div>

            {/* Live Pedagogical Motion Explanation Card */}
            <div className={`mt-3 p-3.5 rounded-2xl border-2 ${explanation.badgeColor} shadow-xs`}>
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                <Gauge className="w-4 h-4 shrink-0" />
                <span>{explanation.title}</span>
              </div>
              <p className="text-xs leading-relaxed font-medium opacity-95">
                {explanation.desc}
              </p>
            </div>
          </div>

          {/* Quick Hardware Diagnostic Footer */}
          <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Radio className="w-3 h-3 text-cyan-400" />
              Bus Jetson: <code className="text-cyan-300 font-mono">/dev/i2c-1 (SDA/SCL)</code>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Shield className="w-3 h-3" />
              Giới hạn xung PWM: [-1.0, +1.0]
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: UNIFIED MISSION DECK (TABS OR SPLIT VIEW) (5 COLS) */}
        {/* -------------------------------------------------------------------------- */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50 dark:bg-[#131E36] flex flex-col justify-between overflow-hidden">
          {/* Deck Header & Tab Navigator (When in Tab mode) */}
          {deckViewMode === 'tabs' ? (
            <div className="flex flex-col gap-3 mb-3">
              {/* Tab navigation pills */}
              <div className="flex items-center bg-slate-200 dark:bg-[#1A2644] p-1 rounded-2xl border border-slate-300 dark:border-slate-700/80">
                <button
                  onClick={() => setActiveTab('control')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'control'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Điều Khiển</span>
                </button>

                <button
                  onClick={() => setActiveTab('log')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'log'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Nhật Ký</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                    {logs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('graph')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'graph'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  <span>Đồ Thị &amp; Toán</span>
                </button>
              </div>
            </div>
          ) : (
            /* Split View Mode Indicator */
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Chế độ Chia Đôi (Split Cockpit)
              </span>
              <button
                onClick={() => setDeckViewMode('tabs')}
                className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Chuyển về Tab độc lập
              </button>
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 flex flex-col justify-between">
            {deckViewMode === 'tabs' ? (
              /* ================== TABBED VIEW ================== */
              <div>
                {/* 1. CONTROL TAB */}
                {activeTab === 'control' && (
                  <div className="space-y-4">
                    {/* Direction D-Pad + Sync Lock Bar */}
                    <div className="bg-white dark:bg-[#182442] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">
                          Điều Hướng Nhanh (D-Pad)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Thao tác 1 chạm cho học sinh
                        </div>
                      </div>

                      {/* D-Pad Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDpadControl('spinLeft')}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition"
                          title="Xoay Trái"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleDpadControl('forward')}
                            className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition"
                            title="Tiến Thẳng"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDpadControl('backward')}
                            className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 hover:bg-amber-500 hover:text-white flex items-center justify-center transition"
                            title="Lùi Thẳng"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleDpadControl('spinRight')}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition"
                          title="Xoay Phải"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDpadControl('stop')}
                          className="w-8 h-8 ml-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white flex items-center justify-center transition"
                          title="Dừng"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sync Lock Toggle */}
                      <button
                        onClick={() => setIsSyncLocked(!isSyncLocked)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                          isSyncLocked
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Khóa đồng bộ 2 bánh để tiến/lùi thẳng tuyệt đối"
                      >
                        {isSyncLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{isSyncLocked ? 'Khóa 2 Bánh (Đồng bộ)' : 'Mở Khóa Vi Sai'}</span>
                      </button>
                    </div>

                    {/* Dual Precision Sliders */}
                    <div className="space-y-3">
                      {/* Left Motor Slider */}
                      <div className="bg-white dark:bg-[#182442] p-3.5 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                            <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              robot.left_motor.value (Bánh Trái)
                            </label>
                          </div>
                          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
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
                          onChange={(e) => handleLeftSliderChange(parseFloat(e.target.value))}
                          disabled={isExternalControlled}
                          className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          <span>-1.0 (Lùi)</span>
                          <span>0.0 (Dừng)</span>
                          <span>+1.0 (Tiến)</span>
                        </div>
                      </div>

                      {/* Right Motor Slider */}
                      <div className="bg-white dark:bg-[#182442] p-3.5 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 shadow-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              robot.right_motor.value (Bánh Phải)
                            </label>
                          </div>
                          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
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
                          onChange={(e) => handleRightSliderChange(parseFloat(e.target.value))}
                          disabled={isExternalControlled}
                          className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          <span>-1.0 (Lùi)</span>
                          <span>0.0 (Dừng)</span>
                          <span>+1.0 (Tiến)</span>
                        </div>
                      </div>
                    </div>

                    {/* 6 Specification Presets (Mục 5.4) */}
                    <div>
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 flex items-center justify-between">
                        <span>Kịch bản mẫu theo đặc tả (Mục 5.4):</span>
                        <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold">1-Click Test</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => setPreset(0.6, 0.6, 'Kịch bản 1: Tiến thẳng (+0.6, +0.6)')}
                          className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-[#182442] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition shadow-2xs font-medium"
                        >
                          <span className="font-black text-emerald-600 dark:text-emerald-400 block">1. Tiến thẳng</span>
                          <span className="text-slate-600 dark:text-slate-400 font-mono">+0.6, +0.6</span>
                        </button>

                        <button
                          onClick={() => setPreset(-0.5, -0.5, 'Kịch bản 2: Lùi thẳng (-0.5, -0.5)')}
                          className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-[#182442] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition shadow-2xs font-medium"
                        >
                          <span className="font-black text-amber-600 dark:text-amber-400 block">2. Lùi thẳng</span>
                          <span className="text-slate-600 dark:text-slate-400 font-mono">-0.5, -0.5</span>
                        </button>

                        <button
                          onClick={() => setPreset(0.2, 0.8, 'Kịch bản 3: Bẻ cong trái (+0.2, +0.8)')}
                          className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-[#182442] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition shadow-2xs font-medium"
                        >
                          <span className="font-black text-blue-600 dark:text-blue-400 block">3. Bẻ cong trái</span>
                          <span className="text-slate-600 dark:text-slate-400 font-mono">+0.2, +0.8</span>
                        </button>

                        <button
                          onClick={() => setPreset(0.0, 0.7, 'Kịch bản 4: Quanh bánh trái (0.0, +0.7)')}
                          className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#182442] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition shadow-2xs font-medium"
                        >
                          <span className="font-black text-purple-600 dark:text-purple-400 block">4. Quanh bánh trái</span>
                          <span className="text-slate-600 dark:text-slate-400 font-mono">0.0, +0.7</span>
                        </button>

                        <button
                          onClick={() => setPreset(-0.5, 0.5, 'Kịch bản 5: Xoay tại chỗ (-0.5, +0.5)')}
                          className="p-2.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-white dark:bg-[#182442] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition shadow-2xs font-medium"
                        >
                          <span className="font-black text-teal-600 dark:text-teal-400 block">5. Xoay tại chỗ</span>
                          <span className="text-slate-600 dark:text-slate-400 font-mono">-0.5, +0.5</span>
                        </button>

                        <button
                          onClick={() => setPreset(0.0, 0.0, 'Kịch bản 6: Dừng an toàn (0.0, 0.0)')}
                          className="p-2.5 rounded-xl border-2 border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 text-left transition shadow-2xs font-black text-red-700 dark:text-red-300"
                        >
                          <span className="block">6. Dừng an toàn</span>
                          <span className="font-mono">0.0, 0.0</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LOG TAB */}
                {activeTab === 'log' && renderLogConsole(false)}

                {/* 3. GRAPH & MATH TAB */}
                {activeTab === 'graph' && (
                  <div className="space-y-3.5">
                    {/* Live Waveform Mini-Chart */}
                    <div className="p-3.5 rounded-2xl bg-[#081021] border border-cyan-500/30 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          Đồ Thị Xung PWM Thời Gian Thực
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-blue-400">■ Trái (L)</span>
                          <span className="text-orange-400">■ Phải (R)</span>
                        </div>
                      </div>

                      {/* SVG Live Chart */}
                      <div className="w-full h-32 bg-[#040814] rounded-xl border border-slate-800 p-1 relative overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          {/* Zero axis line */}
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                          {/* Left motor line */}
                          {telemetryHistory.length > 1 && (
                            <polyline
                              points={telemetryHistory
                                .map((pt, idx) => {
                                  const x = (idx / (telemetryHistory.length - 1)) * 300;
                                  const y = 50 - pt.left * 40;
                                  return `${x},${y}`;
                                })
                                .join(' ')}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          )}

                          {/* Right motor line */}
                          {telemetryHistory.length > 1 && (
                            <polyline
                              points={telemetryHistory
                                .map((pt, idx) => {
                                  const x = (idx / (telemetryHistory.length - 1)) * 300;
                                  const y = 50 - pt.right * 40;
                                  return `${x},${y}`;
                                })
                                .join(' ')}
                              fill="none"
                              stroke="#FB923C"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          )}
                        </svg>

                        <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-500">+1.0</div>
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 text-[9px] font-mono text-slate-500">0.0</div>
                        <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-500">-1.0</div>
                      </div>
                    </div>

                    {/* Kinematic Differential Equations Box */}
                    <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 font-mono space-y-2">
                      <div className="font-sans font-black text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        Phương Trình Động Học Vi Sai:
                      </div>
                      <div className="bg-white/70 dark:bg-black/30 p-2.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40 space-y-1">
                        <div>Vận tốc tịnh tiến: <strong>v = (v_R + v_L) / 2</strong> = <span className="text-blue-600 dark:text-blue-400 font-bold">{((rightSpeed + leftSpeed) / 2).toFixed(2)}</span></div>
                        <div>Vận tốc góc: <strong>ω = (v_R - v_L) / b</strong> = <span className="text-purple-600 dark:text-purple-400 font-bold">{((rightSpeed - leftSpeed) / WHEEL_BASE * 10).toFixed(2)} rad/s</span></div>
                        <div>Bán kính quay cong: <strong>R = (b / 2) * (v_R + v_L) / (v_R - v_L)</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================== SPLIT VIEW (DUAL DECK) ================== */
              <div className="space-y-3 flex-1 flex flex-col">
                {/* Upper Half: Compact Controls */}
                <div className="bg-white dark:bg-[#182442] p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase">
                      Điều Khiển Trực Tiếp
                    </span>
                    <button
                      onClick={() => setIsSyncLocked(!isSyncLocked)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                    >
                      {isSyncLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {isSyncLocked ? 'Khóa đồng bộ' : 'Mở khóa vi sai'}
                    </button>
                  </div>

                  {/* Compact Dual Sliders */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-0.5">
                        <span className="text-blue-600 dark:text-blue-400">Trái:</span>
                        <span className="font-mono">{leftSpeed.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.0"
                        max="1.0"
                        step="0.05"
                        value={leftSpeed}
                        onChange={(e) => handleLeftSliderChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-0.5">
                        <span className="text-orange-600 dark:text-orange-400">Phải:</span>
                        <span className="font-mono">{rightSpeed.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.0"
                        max="1.0"
                        step="0.05"
                        value={rightSpeed}
                        onChange={(e) => handleRightSliderChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[11px] pt-1">
                    <button
                      onClick={() => setPreset(0.6, 0.6, 'Tiến thẳng')}
                      className="py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-center"
                    >
                      Tiến
                    </button>
                    <button
                      onClick={() => setPreset(-0.5, -0.5, 'Lùi thẳng')}
                      className="py-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-center"
                    >
                      Lùi
                    </button>
                    <button
                      onClick={() => setPreset(-0.5, 0.5, 'Xoay tròn')}
                      className="py-1 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 text-center"
                    >
                      Xoay
                    </button>
                    <button
                      onClick={() => setPreset(0.0, 0.0, 'Dừng an toàn')}
                      className="py-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 text-center"
                    >
                      Dừng
                    </button>
                  </div>
                </div>

                {/* Lower Half: Compact Log Stream */}
                <div className="flex-1 min-h-[220px]">
                  {renderLogConsole(true)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10-Criteria Mechanical & Geometric Acceptance Modal (Mục 9) */}
      <MechanicalAcceptanceModal
        isOpen={isAcceptanceModalOpen}
        onClose={() => setIsAcceptanceModalOpen(false)}
      />
    </div>
  );
};
