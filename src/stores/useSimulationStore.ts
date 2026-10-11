/**
 * SIMULATION STORE — SINGLE SOURCE OF TRUTH (CMU10 JETBOT)
 * ========================================================
 * Quản lý trạng thái mô phỏng tập trung cho toàn bộ ứng dụng:
 * - Pose thời gian thực (x, z trong mặt phẳng sa bàn, yaw góc xoay rad)
 * - Tốc độ động cơ vi sai: target & actual (leftSpeed, rightSpeed [-1.0 .. 1.0])
 * - Góc quay bánh xe tích lũy (leftWheelAngle, rightWheelAngle)
 * - Vận tốc dài v (m/s) và vận tốc góc omega (rad/s)
 * - Trạng thái thực thi: RUNNING | PAUSED | STEPPING | STOPPED | EMERGENCY_STOP
 * - Dòng mã Python đang thực thi (Active Line) & Luồng tín hiệu phần cứng
 * - Cảm biến: Ultrasonic (cm), Camera Target Aiming Point (x, y), Obstacle Detection
 * - Quỹ đạo đã đi (actualTrajectory) & Quỹ đạo dự kiến (plannedTrajectory)
 * - Vật cản trên sa bàn với tọa độ và va chạm thực tế (AABB/Circle)
 * - Hệ thống sự kiện & Telemetry log stream
 */

export type ExecutionState = 'RUNNING' | 'PAUSED' | 'STEPPING' | 'STOPPED' | 'EMERGENCY_STOP';

export interface TrajectoryPoint {
  x: number;
  z: number;
  yaw: number;
  time: number;
}

export interface Waypoint {
  id: string;
  x: number;
  z: number;
  speed: number;
}

export interface Obstacle {
  id: string;
  nameVi: string;
  x: number;
  z: number;
  radius: number; // radius in meters
  height: number;
  color: string;
  type: 'lego' | 'box' | 'cylinder' | 'wall';
}

export interface TelemetryLogEntry {
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

export interface SensorState {
  ultrasonicDistCm: number;
  isObstacleDetected: boolean;
  obstacleDistanceM: number;
  cameraAimX: number; // normalized [-1.0 .. 1.0]
  cameraAimY: number; // normalized [-1.0 .. 1.0]
  cameraAimPixelX: number; // [0 .. 224]
  cameraAimPixelY: number; // [0 .. 224]
  probBlocked: number;
  isCollisionImminent: boolean;
}

export interface SimulationState {
  // Execution Control
  executionState: ExecutionState;
  simTimeSec: number;
  simDeltaTime: number; // default 0.033s (~30Hz update)
  isStepping: boolean;

  // Pose & Kinematics (in World metric coordinates, arena: x: -1.5m .. 1.5m, z: -1.0m .. 1.0m)
  x: number;
  z: number;
  yaw: number; // radians (0 = facing +X)
  linearVel: number; // m/s
  angularVel: number; // rad/s

  // Motors & Drivetrain
  targetLeftSpeed: number; // [-1.0 .. 1.0]
  targetRightSpeed: number; // [-1.0 .. 1.0]
  actualLeftSpeed: number;
  actualRightSpeed: number;
  pwmL: number; // [0 .. 100]%
  pwmR: number; // [0 .. 100]%
  leftWheelAngle: number; // radians
  rightWheelAngle: number; // radians

  // Sensors & Perception
  sensors: SensorState;

  // Trajectories
  actualTrajectory: TrajectoryPoint[];
  plannedTrajectory: Waypoint[];

  // World Environment
  arenaWidthM: number; // 3.0 meters (-1.5 to 1.5)
  arenaLengthM: number; // 2.0 meters (-1.0 to 1.0)
  obstacles: Obstacle[];

  // Code Execution & Hardware Pipeline Status
  activePythonCode: string;
  activeCommandSummary: string;
  hardwareStage: 'PYTHON_RUNTIME' | 'I2C_BUS' | 'PCA9685_PWM' | 'TB6612_HBRIDGE' | 'TT_MOTOR' | 'ODOMETRY';

  // Event Logs
  logs: TelemetryLogEntry[];
}

// Initial Default State
export const INITIAL_SIM_STATE: SimulationState = {
  executionState: 'STOPPED',
  simTimeSec: 0,
  simDeltaTime: 0.03,
  isStepping: false,

  x: -0.8,
  z: 0.0,
  yaw: 0,
  linearVel: 0,
  angularVel: 0,

  targetLeftSpeed: 0.0,
  targetRightSpeed: 0.0,
  actualLeftSpeed: 0.0,
  actualRightSpeed: 0.0,
  pwmL: 0,
  pwmR: 0,
  leftWheelAngle: 0,
  rightWheelAngle: 0,

  sensors: {
    ultrasonicDistCm: 150,
    isObstacleDetected: false,
    obstacleDistanceM: 1.5,
    cameraAimX: 0,
    cameraAimY: 0.2,
    cameraAimPixelX: 112,
    cameraAimPixelY: 134,
    probBlocked: 0.05,
    isCollisionImminent: false
  },

  actualTrajectory: [{ x: -0.8, z: 0.0, yaw: 0, time: 0 }],
  plannedTrajectory: [
    { id: 'wp-1', x: -0.8, z: 0.0, speed: 0.4 },
    { id: 'wp-2', x: -0.2, z: 0.0, speed: 0.5 },
    { id: 'wp-3', x: 0.4, z: 0.4, speed: 0.4 },
    { id: 'wp-4', x: 0.8, z: 0.0, speed: 0.4 },
    { id: 'wp-5', x: 0.2, z: -0.5, speed: 0.5 },
    { id: 'wp-6', x: -0.8, z: 0.0, speed: 0.4 }
  ],

  arenaWidthM: 3.0,
  arenaLengthM: 2.0,
  obstacles: [
    { id: 'obs-1', nameVi: 'Khối LEGO Vàng', x: 0.35, z: 0.15, radius: 0.12, height: 0.18, color: '#FACC15', type: 'lego' },
    { id: 'obs-2', nameVi: 'Hộp Gỗ Trở Ngại', x: -0.2, z: -0.45, radius: 0.15, height: 0.22, color: '#F97316', type: 'box' },
    { id: 'obs-3', nameVi: 'Trụ Tiêu Đỏ', x: 0.7, z: -0.2, radius: 0.1, height: 0.25, color: '#EF4444', type: 'cylinder' },
    { id: 'obs-4', nameVi: 'Khối Rào Chắn Xanh', x: -0.5, z: 0.5, radius: 0.14, height: 0.2, color: '#3B82F6', type: 'lego' }
  ],

  activePythonCode: 'robot.stop()',
  activeCommandSummary: 'Động cơ dừng hoạt động',
  hardwareStage: 'PYTHON_RUNTIME',

  logs: [
    {
      id: 'init-0',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'event',
      source: 'Hệ Thống CMU10',
      pythonCode: 'from jetbot import Robot\nrobot = Robot()',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'Khởi Tạo Phòng Thí Nghiệm Ảo JetBot',
      explanation: 'Sẵn sàng kết nối Triple-View Cockpit (Bản đồ 2D/3D + Robot 3D Twin + Camera FPV).',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-400'
    }
  ]
};

// Singleton simulation store listener pattern
type Listener = () => void;

class SimulationStore {
  private state: SimulationState = { ...INITIAL_SIM_STATE };
  private listeners: Set<Listener> = new Set();
  private timerId: number | null = null;
  private lastTimeMs: number = Date.now();

  constructor() {
    this.startLoop();
  }

  public getState(): SimulationState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- ACTIONS ---

  public setMotorSpeeds(left: number, right: number, source: string = 'Thao tác tay') {
    const clampedL = Math.max(-1.0, Math.min(1.0, parseFloat(left.toFixed(2))));
    const clampedR = Math.max(-1.0, Math.min(1.0, parseFloat(right.toFixed(2))));

    let code = `robot.set_motors(${clampedL}, ${clampedR})`;
    let summary = `Cập nhật động cơ (Trái: ${clampedL}, Phải: ${clampedR})`;

    if (clampedL === 0 && clampedR === 0) {
      code = 'robot.stop()';
      summary = 'Dừng robot';
    } else if (clampedL === clampedR && clampedL > 0) {
      code = `robot.forward(${clampedL})`;
      summary = `Tiến thẳng tốc độ ${clampedL}`;
    } else if (clampedL === clampedR && clampedL < 0) {
      code = `robot.backward(${Math.abs(clampedL)})`;
      summary = `Lùi thẳng tốc độ ${Math.abs(clampedL)}`;
    } else if (clampedL === -clampedR && clampedR > 0) {
      code = `robot.left(${clampedR})`;
      summary = `Xoay trái tại chỗ ${clampedR}`;
    } else if (clampedL === -clampedR && clampedL > 0) {
      code = `robot.right(${clampedL})`;
      summary = `Xoay phải tại chỗ ${clampedL}`;
    }

    this.state = {
      ...this.state,
      targetLeftSpeed: clampedL,
      targetRightSpeed: clampedR,
      pwmL: Math.round(Math.abs(clampedL) * 100),
      pwmR: Math.round(Math.abs(clampedR) * 100),
      activePythonCode: code,
      activeCommandSummary: summary,
      hardwareStage: 'I2C_BUS'
    };

    this.addLog({
      type: 'command',
      source,
      pythonCode: code,
      leftVal: clampedL,
      rightVal: clampedR,
      linearVel: this.state.linearVel,
      angularVel: this.state.angularVel,
      actionText: summary,
      explanation: `Lệnh truyền qua I2C địa chỉ 0x60 tới chip PCA9685/TB6612. PWM L=${Math.round(Math.abs(clampedL)*100)}%, R=${Math.round(Math.abs(clampedR)*100)}%.`,
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-400'
    });

    this.notify();
  }

  public run() {
    this.state = {
      ...this.state,
      executionState: 'RUNNING'
    };
    this.addLog({
      type: 'event',
      source: 'Bảng Điều Khiển',
      pythonCode: '# Bắt đầu mô phỏng liên tục',
      leftVal: this.state.targetLeftSpeed,
      rightVal: this.state.targetRightSpeed,
      linearVel: this.state.linearVel,
      angularVel: this.state.angularVel,
      actionText: 'Kích Hoạt Chạy Mô Phỏng (RUN)',
      explanation: 'Đồng hồ mô phỏng tiếp tục chạy, tích phân động học vi sai.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400'
    });
    this.notify();
  }

  public pause() {
    this.state = {
      ...this.state,
      executionState: 'PAUSED'
    };
    this.addLog({
      type: 'event',
      source: 'Bảng Điều Khiển',
      pythonCode: '# Tạm dừng mô phỏng (Clock frozen)',
      leftVal: this.state.targetLeftSpeed,
      rightVal: this.state.targetRightSpeed,
      linearVel: this.state.linearVel,
      angularVel: this.state.angularVel,
      actionText: 'Tạm Dừng Mô Phỏng (PAUSE)',
      explanation: 'Đóng băng trạng thái tức thời phục vụ học sinh ghi chép dữ liệu thí nghiệm.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-400'
    });
    this.notify();
  }

  public step() {
    // Run single integration step
    this.state = {
      ...this.state,
      executionState: 'PAUSED',
      isStepping: true
    };
    this.integratePhysics(0.1); // step forward 100ms
    this.addLog({
      type: 'event',
      source: 'Bảng Điều Khiển',
      pythonCode: '# Single Step: dt = 0.1s',
      leftVal: this.state.targetLeftSpeed,
      rightVal: this.state.targetRightSpeed,
      linearVel: this.state.linearVel,
      angularVel: this.state.angularVel,
      actionText: 'Thực Thi Từng Bước (STEP +0.1s)',
      explanation: `Đã dịch chuyển mô phỏng thêm 0.1 giây. Tọa độ hiện tại: (${this.state.x.toFixed(2)}m, ${this.state.z.toFixed(2)}m).`,
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-400'
    });
    this.state.isStepping = false;
    this.notify();
  }

  public resume() {
    this.run();
  }

  public stop() {
    this.state = {
      ...this.state,
      executionState: 'STOPPED',
      targetLeftSpeed: 0,
      targetRightSpeed: 0,
      actualLeftSpeed: 0,
      actualRightSpeed: 0,
      pwmL: 0,
      pwmR: 0,
      activePythonCode: 'robot.stop()',
      activeCommandSummary: 'Động cơ dừng hoạt động'
    };
    this.addLog({
      type: 'command',
      source: 'Bảng Điều Khiển',
      pythonCode: 'robot.stop()',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'Dừng Động Cơ (STOP)',
      explanation: 'Cả hai kênh động cơ được trả về 0. Vận tốc tịnh tiến và góc đều về 0.',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-400'
    });
    this.notify();
  }

  public reset() {
    this.state = {
      ...INITIAL_SIM_STATE,
      logs: [
        ...this.state.logs.slice(-50),
        {
          id: `reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          type: 'event',
          source: 'Bảng Điều Khiển',
          pythonCode: 'robot.stop()\n# Đặt lại vị trí xuất phát ban đầu',
          leftVal: 0,
          rightVal: 0,
          linearVel: 0,
          angularVel: 0,
          actionText: 'Đặt Lại Toàn Bộ Mô Phỏng (RESET)',
          explanation: 'Robot trở về vạch xuất phát (-0.8m, 0.0m), góc yaw = 0 rad. Xóa lịch sử vệt quỹ đạo.',
          badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-400'
        }
      ]
    };
    this.notify();
  }

  public emergencyStop() {
    this.state = {
      ...this.state,
      executionState: 'EMERGENCY_STOP',
      targetLeftSpeed: 0,
      targetRightSpeed: 0,
      actualLeftSpeed: 0,
      actualRightSpeed: 0,
      pwmL: 0,
      pwmR: 0,
      activePythonCode: 'robot.stop()  # EMERGENCY_STOP TRIGGERED',
      activeCommandSummary: 'NGẮT KHẨN CẤP AN TOÀN!',
      hardwareStage: 'TB6612_HBRIDGE'
    };
    this.addLog({
      type: 'safety',
      source: 'Hệ Thống An Toàn E-STOP',
      pythonCode: 'robot.stop()  # KHÓA CƯỠNG BỨC',
      leftVal: 0,
      rightVal: 0,
      linearVel: 0,
      angularVel: 0,
      actionText: 'NGẮT KHẨN CẤP AN TOÀN (EMERGENCY STOP)',
      explanation: 'Đã cắt xung PWM ngay lập tức, kích hoạt phanh điện tử cầu H TB6612FNG để bảo vệ robot.',
      badgeColor: 'bg-red-500 text-white border-red-700'
    });
    this.notify();
  }

  public clearLogs() {
    this.state = {
      ...this.state,
      logs: []
    };
    this.notify();
  }

  public addLog(entry: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) {
    const newEntry: TelemetryLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };
    this.state.logs = [newEntry, ...this.state.logs].slice(0, 100);
  }

  // --- PHYSICS ENGINE TICK ---
  private startLoop() {
    if (typeof window === 'undefined') return;

    const tick = () => {
      const now = Date.now();
      const dt = Math.min((now - this.lastTimeMs) / 1000, 0.1);
      this.lastTimeMs = now;

      if (this.state.executionState === 'RUNNING') {
        this.integratePhysics(dt);
        this.notify();
      }

      this.timerId = window.requestAnimationFrame(tick);
    };

    this.timerId = window.requestAnimationFrame(tick);
  }

  private integratePhysics(dt: number) {
    const s = this.state;
    // Motor inertia / lag smoothing
    const alpha = 0.25; // smoothing factor
    const newActualL = s.actualLeftSpeed + (s.targetLeftSpeed - s.actualLeftSpeed) * alpha;
    const newActualR = s.actualRightSpeed + (s.targetRightSpeed - s.actualRightSpeed) * alpha;

    // CMU10 physical specs
    const wheelRadius = 0.0325; // 32.5mm
    const wheelBase = 0.102; // 102mm
    const maxLinearSpeed = 0.45; // m/s at 100% duty cycle

    // Wheel linear velocities
    const vL = newActualL * maxLinearSpeed;
    const vR = newActualR * maxLinearSpeed;

    // Differential drive kinematics
    const linearV = (vR + vL) / 2.0;
    const angularW = (vR - vL) / wheelBase;

    // Update wheel rotation angles (omega = v / R)
    const omegaL = vL / wheelRadius;
    const omegaR = vR / wheelRadius;
    const newWheelAngleL = s.leftWheelAngle + omegaL * dt;
    const newWheelAngleR = s.rightWheelAngle + omegaR * dt;

    // Integrate pose in 2D plane (X = forward/right, Z = down/forward in 3D world, Yaw angle)
    const newYaw = s.yaw + angularW * dt;
    let newX = s.x + linearV * Math.cos(newYaw) * dt;
    let newZ = s.z + linearV * Math.sin(newYaw) * dt;

    // Arena boundary collision clamp
    const halfW = s.arenaWidthM / 2 - 0.12;
    const halfL = s.arenaLengthM / 2 - 0.12;

    if (newX < -halfW) newX = -halfW;
    if (newX > halfW) newX = halfW;
    if (newZ < -halfL) newZ = -halfL;
    if (newZ > halfL) newZ = halfL;

    // Check collision with obstacles
    let isCollisionImminent = false;
    let minObstacleDist = 5.0;

    for (const obs of s.obstacles) {
      const dx = obs.x - newX;
      const dz = obs.z - newZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDistanceAllowed = obs.radius + 0.11; // 11cm robot radius

      if (dist < minDistanceAllowed) {
        // Physical soft bounce collision response
        const overlap = minDistanceAllowed - dist;
        newX -= (dx / dist) * overlap;
        newZ -= (dz / dist) * overlap;
        isCollisionImminent = true;
      }

      // Check distance in front of robot for sensor
      const angleToObs = Math.atan2(dz, dx) - newYaw;
      const normAngle = Math.atan2(Math.sin(angleToObs), Math.cos(angleToObs));
      if (Math.abs(normAngle) < Math.PI / 4 && dist < minObstacleDist) {
        minObstacleDist = dist;
      }
    }

    const ultrasonicDistCm = Math.max(4, Math.min(400, Math.round(minObstacleDist * 100)));
    const isObstacleDetected = ultrasonicDistCm < 45;
    const probBlocked = isObstacleDetected ? Math.min(0.98, 0.4 + (45 - ultrasonicDistCm) / 45 * 0.58) : 0.05;

    // Calculate camera aiming point (projected road following target)
    // Find closest planned waypoint ahead of robot
    let targetX = 0;
    let targetZ = 0;
    let minWpDist = 999;
    for (const wp of s.plannedTrajectory) {
      const d = Math.sqrt((wp.x - newX) ** 2 + (wp.z - newZ) ** 2);
      if (d > 0.15 && d < minWpDist) {
        minWpDist = d;
        targetX = wp.x;
        targetZ = wp.z;
      }
    }
    // Transform target into robot local frame
    const relX = targetX - newX;
    const relZ = targetZ - newZ;
    const localX = relX * Math.cos(-newYaw) - relZ * Math.sin(-newYaw);
    const localZ = relX * Math.sin(-newYaw) + relZ * Math.cos(-newYaw);

    // Normalize to camera pixel target (224x224)
    const aimNormX = Math.max(-1.0, Math.min(1.0, localZ * 2.0));
    const aimNormY = Math.max(-1.0, Math.min(1.0, (localX - 0.3) * 2.0));
    const aimPixelX = Math.round(((aimNormX + 1.0) / 2.0) * 224);
    const aimPixelY = Math.round(((aimNormY + 1.0) / 2.0) * 224);

    // Append to actual trajectory periodically
    let trajectory = s.actualTrajectory;
    const lastPoint = trajectory[trajectory.length - 1];
    if (!lastPoint || (Math.hypot(newX - lastPoint.x, newZ - lastPoint.z) > 0.04)) {
      trajectory = [...trajectory.slice(-300), { x: newX, z: newZ, yaw: newYaw, time: s.simTimeSec + dt }];
    }

    this.state = {
      ...s,
      simTimeSec: s.simTimeSec + dt,
      x: newX,
      z: newZ,
      yaw: newYaw,
      linearVel: linearV,
      angularVel: angularW,
      actualLeftSpeed: newActualL,
      actualRightSpeed: newActualR,
      pwmL: Math.round(Math.abs(newActualL) * 100),
      pwmR: Math.round(Math.abs(newActualR) * 100),
      leftWheelAngle: newWheelAngleL,
      rightWheelAngle: newWheelAngleR,
      actualTrajectory: trajectory,
      sensors: {
        ultrasonicDistCm,
        isObstacleDetected,
        obstacleDistanceM: minObstacleDist,
        cameraAimX: aimNormX,
        cameraAimY: aimNormY,
        cameraAimPixelX: aimPixelX,
        cameraAimPixelY: aimPixelY,
        probBlocked,
        isCollisionImminent
      }
    };
  }
}

// Global Singleton Instance
export const simulationStore = new SimulationStore();
