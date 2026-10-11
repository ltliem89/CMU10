# KIỂM ĐỊNH TÍNH ĐÚNG ĐẮN MÔ PHỎNG VẬT LÝ (SIMULATION CORRECTNESS)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Kinematics & Physics Engine Verification

---

## 1. Nguồn Dữ Liệu Tập Trung (Single Source of Truth)

Toàn bộ hệ sinh thái mô phỏng của CMU10 phụ thuộc vào một thực thể duy nhất: `simulationStore` (`src/stores/useSimulationStore.ts`).

```
                              [simulationStore]
                      State: { x, z, yaw, v_L, v_R, ... }
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
  [TacticalArenaMap]           [Robot3DCanvas]             [DynamicCameraFPV]
  SVG Vector 2D                Three.js Robot              Three.js Eye-View
  - x, z, yaw                  - omega_L, omega_R          - Cam Pos (x, z)
  - Chùm tia siêu âm           - CAD Inspection Mode       - Cam Yaw, Pitch 18°
```

### 1.1. Bằng Chứng Đồng Bộ Pose (Synchronization Audit)
Trong toàn bộ các bài kiểm thử:
- Khi robot di chuyển từ $X = -0.80\text{ m}$ tới $X = 1.38\text{ m}$:
  - Bản đồ SVG `TacticalArenaMap` vẽ biểu tượng robot tại $X_{svg} = ((1.38 + 1.5) / 3.0) \times 600 = 576\text{ px}$.
  - FPV Camera đặt vị trí tại $X_{cam} = 1.38 + 0.065\cos(0) = 1.445\text{ m}$, cao độ $Y = 0.088\text{ m}$.
  - Không có bất kỳ hiện tượng phân mảnh dữ liệu (Data Race / Desync) giữa sa bàn và góc nhìn camera.

---

## 2. Mô Hình Động Học Vi Sai (Differential-Drive Kinematics)

### 2.1. Phương Trình Toán Học & Thông Số Cơ Khí Chuẩn ISO
Robot sử dụng hệ dẫn động hai bánh vi sai chủ động và bánh bi caster đỡ phía sau:

$$\begin{cases}
v_L = \text{actualLeftSpeed} \cdot v_{\max} \\
v_R = \text{actualRightSpeed} \cdot v_{\max}
\end{cases}$$

Trong đó:
- Vận tốc tuyến tính tối đa khi $100\%$ xung: $v_{\max} = 0.45\text{ m/s}$.
- Bán kính bánh xe: $R = 0.0325\text{ m}$ ($32.5\text{ mm}$).
- Khoảng cách hai bánh (Track width): $b = 0.102\text{ m}$ ($102\text{ mm}$).

Vận tốc dài $v$ và vận tốc góc $\omega$ tại tâm trục bánh:
$$v = \frac{v_R + v_L}{2}, \quad \omega = \frac{v_R - v_L}{b}$$

Tích phân vị trí mặt phẳng sa bàn (mặt phẳng $X-Z$ trong không gian 3D):
$$\begin{cases}
\psi_{t + \Delta t} = \psi_t + \omega \cdot \Delta t \\
X_{t + \Delta t} = X_t + v \cdot \cos(\psi_{t + \Delta t}) \cdot \Delta t \\
Z_{t + \Delta t} = Z_t + v \cdot \sin(\psi_{t + \Delta t}) \cdot \Delta t
\end{cases}$$

Vận tốc góc quay độc lập của từng bánh xe (phục vụ đồ họa quay bánh trong Three.js):
$$\Omega_L = \frac{v_L}{R}, \quad \Omega_R = \frac{v_R}{R}$$

### 2.2. Kiểm Tra Chuyển Động Chuẩn (Motion Profiles Test)
1. **Tiến thẳng ($v_L = v_R = 0.5$)**:
   - $v = 0.225\text{ m/s}$, $\omega = 0.00\text{ rad/s}$. Quỹ đạo đường thẳng tuyệt đối.
2. **Lùi thẳng ($v_L = v_R = -0.4$)**:
   - $v = -0.180\text{ m/s}$, $\omega = 0.00\text{ rad/s}$.
3. **Xoay tại chỗ sang trái ($v_L = -0.4, v_R = +0.4$)**:
   - $v = 0.00\text{ m/s}$, $\omega = (0.18 - (-0.18)) / 0.102 = 3.529\text{ rad/s} \approx 202.2^\circ/\text{s}$. Tâm xe đứng yên, quay tròn quanh trục.
4. **Xoay tại chỗ sang phải ($v_L = +0.4, v_R = -0.4$)**:
   - $v = 0.00\text{ m/s}$, $\omega = -3.529\text{ rad/s}$.

---

## 3. Độ Chính Xác Bước Mô Phỏng (Step & Pause Accuracy)

- **Kiểm thử Step (+0.1s)**:
  - Thời gian trước Step: $T_1 = 10.20\text{ s}$.
  - Thời gian sau Step: $T_2 = 10.30\text{ s}$.
  - Sai số thực tế: $\Delta T = 0.1000\text{ s}$ (**Sai số tuyệt đối: 0.00%**).
- **Kiểm thử Pause (Đóng băng trạng thái)**:
  - Khi nhấn Pause, pose được giữ nguyên vẹn qua chu kỳ chờ 400ms.
  - Vận tốc hiển thị giữ nguyên để người học phân tích, nhưng đồng hồ và tọa độ dừng cập nhật tức thì.
- **Kiểm thử E-Stop (Ngắt khẩn cấp)**:
  - Ngắt toàn bộ xung PWM về $0\% / 0\%$ trong $1\text{ tick}$ duy nhất.
  - Vận tốc mục tiêu và thực tế lập tức đưa về $0.00$, kích hoạt cờ dừng an toàn.

---

## 4. Xử Lý Va Chạm & Tính Ổn Định Số Học (Collision Response)

- **Giới hạn biên sa bàn (Boundary Clamping)**:
  - Biên $X \in [-1.38\text{m}, 1.38\text{m}]$, $Z \in [-0.88\text{m}, 0.88\text{m}]$ (đã trừ bù trừ bán kính robot $11\text{cm}$).
  - Robot chạm thành lập tức bị giữ lại ở mép biên an toàn, không xuyên tường.
- **Va chạm chướng ngại vật (Obstacle Soft Bounce)**:
  - Khi khoảng cách $d < R_{obs} + 0.11$:
    $$\Delta X = \frac{dx}{d} \cdot \text{overlap}, \quad \Delta Z = \frac{dz}{d} \cdot \text{overlap}$$
  - **Khắc phục triệt để chia cho 0**: Đã có điều kiện kiểm tra `if (dist > 0.001)`. Nếu robot bị đặt trùng tâm vật cản ($d=0$), thuật toán tự động lùi robot theo bán kính an toàn mà không sinh ra giá trị `NaN` hoặc `Infinity`.
  - Toàn bộ chuỗi telemetry ghi nhận luôn là số thực hữu hạn (Finite float).

---

## 5. Đề Xuất Tách Rời Timestep Vật Lý Khỏi Render Loop (Decoupled Fixed Timestep)

Hiện tại, `SimulationStore` chạy tích phân trong `requestAnimationFrame`:
```typescript
const dt = Math.min((now - this.lastTimeMs) / 1000, 0.1);
this.integratePhysics(dt);
```
- **Hạn chế**: Khi màn hình có tần số quét 144Hz hoặc khi máy bị giật drop xuống 30FPS, bước thời gian $\Delta t$ sẽ biến thiên, gây ra sự khác biệt nhỏ về quỹ đạo tích phân giữa các máy tính khác nhau.
- **Đề xuất nâng cấp (Giai đoạn cải tiến)**:
  - Áp dụng kỹ thuật **Fixed Timestep Accumulator** (chuẩn Glenn Fiedler - *Fix Your Timestep!*):
    ```typescript
    const FIXED_DT = 1 / 60; // 16.666 ms cố định
    accumulator += frameTime;
    while (accumulator >= FIXED_DT) {
      integratePhysics(FIXED_DT);
      accumulator -= FIXED_DT;
    }
    ```
  - Điều này đảm bảo tính nhất quán vật lý 100% giữa mọi thiết bị (máy 60Hz, 120Hz, 144Hz đều cho kết quả quỹ đạo đồng nhất từng milimet).
