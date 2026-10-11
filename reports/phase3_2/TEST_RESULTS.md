# KẾT QUẢ KIỂM THỬ ĐỊNH LƯỢNG (PHASE 3.2 TEST RESULTS)
**Dự án:** JetBot Virtual Lab CMU10  
**Tổng số ca kiểm thử:** 16  
**Số ca ĐẠT (PASS):** 15  
**Số ca THẤT BẠI (FAIL):** 1  

---

| STT | Phân nhóm | Tên Kiểm Thử | Loại | Kỳ vọng | Thực tế | Trạng thái |
|:---:|:---|:---|:---:|:---|:---|:---:|
| 1 | Workspace Layouts | 20 Cycles Layout Switching Stress Test | **REAL** | 120/120 successful switches, 0 white screens, 0 uncaught errors | 120/120 switches, 0 white screens | **PASS** |
| 2 | CAD Inspection | CAD Mode: realistic | **REAL** | Active mode attribute is "realistic" | Active mode="realistic", Drawer=N/A | **PASS** |
| 3 | CAD Inspection | CAD Mode: wireframe | **REAL** | Active mode attribute is "wireframe" | Active mode="wireframe", Drawer=N/A | **PASS** |
| 4 | CAD Inspection | CAD Mode: components | **REAL** | Active mode attribute is "components" and drawer [cad-drawer-components] visible | Active mode="components", Drawer=VISIBLE | **PASS** |
| 5 | CAD Inspection | CAD Mode: collision | **REAL** | Active mode attribute is "collision" and drawer [cad-drawer-collision] visible | Active mode="collision", Drawer=VISIBLE | **PASS** |
| 6 | CAD Inspection | CAD Mode: coordinates | **REAL** | Active mode attribute is "coordinates" | Active mode="coordinates", Drawer=N/A | **PASS** |
| 7 | CAD Inspection | CAD Mode: sensors | **REAL** | Active mode attribute is "sensors" | Active mode="sensors", Drawer=N/A | **PASS** |
| 8 | CAD Inspection | CAD Mode: dimensions | **REAL** | Active mode attribute is "dimensions" and drawer [cad-drawer-dimensions] visible | Active mode="dimensions", Drawer=VISIBLE | **PASS** |
| 9 | Execution Controls | Reset Execution to Initial Pose | **REAL** | Robot coordinates reset to initial (x=-0.80m, z=0.00m, time=0.0s) | Pose (-0.80, 0.00)m, T=0.0s | **PASS** |
| 10 | Execution Controls | Step Execution (+0.1s step) | **REAL** | Simulation time increments by exactly 0.1s | Delta: +0.1s (from 0s to 0.1s) | **PASS** |
| 11 | Execution Controls | Pause State Pose Freeze | **REAL** | Simulation pose completely freezes while paused (t1 === t2) | Identical pose frozen across 400ms | **PASS** |
| 12 | Execution Controls | Emergency Stop (E-STOP) PWM Zero & Brake | **REAL** | PWM throttles drop immediately to 0% and motor speeds locked | PWM: 0% / 0% | **PASS** |
| 13 | Kinematics & Collision Physics | Numerical Stability (No NaN / Infinity on Collision) | **REAL** | No NaN, undefined, or Infinity in position or velocity coordinates | All coordinates finite numbers | **PASS** |
| 14 | State Integrity | Active Simulation Preserved During Layout Switching | **REAL** | Robot pose and execution state retained without restarting or zeroing coordinates | Pose preserved across 6 layout transitions: T: 3.8s|POS: (-0.20, 0.00)m|YAW: 0°|PWM: 50% / 50% | **PASS** |
| 15 | Performance & Responsiveness | Layout Switch Latency Benchmark | **REAL** | Average layout transition latency < 150ms | Avg: 238.1ms (Min: 107ms, Max: 530ms) | **FAIL** |
| 16 | Performance & Responsiveness | Console & Uncaught Runtime Errors | **REAL** | 0 uncaught page errors, 0 runtime exceptions | 0 uncaught errors, 1 console errors | **PASS** |

---

## Bằng chứng kiểm thử định lượng
- **20 Cycles Layout Switching Stress Test**: Avg switch latency: 238.1ms
- **CAD Mode: realistic**: DOM synchronized with Three.js CAD scene
- **CAD Mode: wireframe**: DOM synchronized with Three.js CAD scene
- **CAD Mode: components**: DOM synchronized with Three.js CAD scene
- **CAD Mode: collision**: DOM synchronized with Three.js CAD scene
- **CAD Mode: coordinates**: DOM synchronized with Three.js CAD scene
- **CAD Mode: sensors**: DOM synchronized with Three.js CAD scene
- **CAD Mode: dimensions**: DOM synchronized with Three.js CAD scene
- **Reset Execution to Initial Pose**: HUD Telemetry: T: 0.0s|POS: (-0.80, 0.00)m|YAW: 0°|PWM: 0% / 0%
- **Step Execution (+0.1s step)**: Exact discrete integration increment dt=0.10s
- **Pause State Pose Freeze**: T1: T: 1.0s|POS: (-0.80, 0.00)m|YAW: 0°|PWM: 0% / 0% == T2: T: 1.0s|POS: (-0.80, 0.00)m|YAW: 0°|PWM: 0% / 0%
- **Emergency Stop (E-STOP) PWM Zero & Brake**: HUD Telemetry: T: 1.3s|POS: (-0.74, 0.00)m|YAW: 0°|PWM: 0% / 0%
- **Numerical Stability (No NaN / Infinity on Collision)**: Telemetry string: "T: 1.3s|POS: (-0.74, 0.00)m|YAW: 0°|PWM: 0% / 0%"
- **Active Simulation Preserved During Layout Switching**: Active driving telemetry after layout transitions: T: 3.8s|POS: (-0.20, 0.00)m|YAW: 0°|PWM: 50% / 50%
- **Layout Switch Latency Benchmark**: Sample size N = 120 switches over 20 continuous cycles
- **Console & Uncaught Runtime Errors**: Uncaught: [], Console: [Failed to load resource: the server responded with a status of 404 (Not Found)]