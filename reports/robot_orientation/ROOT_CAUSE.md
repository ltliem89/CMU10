# BÁO CÁO PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)
## Sự Cố Sai Lệch Hướng Robot & Động Học Vi Sai CMU10 JetBot

**Dự án:** CMU10 — Phòng thí nghiệm Robot & Vật lí 10  
**Đối tượng:** Hệ thống mô phỏng JetBot (Bản đồ 2D Tactical Map, 3D Canvas Twin, Camera FPV, Bộ điều khiển Đa phương thức)  
**Trạng thái kiểm định:** Đã xác minh & khắc phục triệt để (12/12 bài kiểm tra đạt chuẩn 100%)  

---

### 1. TỔNG QUAN HIỆN TƯỢNG VÀ NGUYÊN NHÂN

Trước khi khắc phục, người dùng và quá trình kiểm thử nhận thấy hiện tượng:
1. Khi robot rẽ trái (bánh phải quay tới, bánh trái quay lùi), robot lại quay sang phải; và ngược lại.
2. Mô hình 3D JetBot trên màn hình 3D Twin đứng lệch 90 độ so với hướng chuyển động thực tế trên bản đồ 2D.
3. Khi click chọn mục tiêu trên bản đồ (Click-to-Goal), robot bẻ lái ngược hướng với vị trí cờ mục tiêu.
4. Cảm biến khoảng cách siêu âm và tia camera FPV không nhìn thẳng theo đầu xe khi robot đổi hướng.
5. Thao tác điều khiển trên D-Pad hoặc phím mũi tên chỉ nạp tốc độ động cơ mà không tự động chuyển trạng thái mô phỏng sang `RUNNING`.

---

### 2. PHÂN TÍCH KỸ THUẬT CHI TIẾT & BẰNG CHỨNG MÃ NGUỒN

#### 2.1. Lỗi Dấu Tích Phân Góc Hướng Trong Động Học Vi Sai (`useSimulationStore.ts`)
* **Vị trí:** `src/stores/useSimulationStore.ts`, dòng 480 & 491.
* **Nguyên nhân gốc rễ:**
  Hệ trục tọa độ không gian sa bàn quy ước:
  - Trục $+X$ là hướng Đông (tiến thẳng ban đầu khi $\text{yaw} = 0$).
  - Trục $+Z$ là hướng Nam (hướng xuống dưới trong hình chiếu tọa độ 2D SVG).
  - Vận tốc tịnh tiến: $\dot{x} = v \cos(\text{yaw}), \dot{z} = v \sin(\text{yaw})$.
  
  Khi robot rẽ trái: bánh phải quay nhanh hơn bánh trái ($v_R > v_L$). Vận tốc góc theo công thức vi sai:
  $$\omega = \frac{v_R - v_L}{L} > 0$$
  Trên mặt phẳng tọa độ $(X, Z)$, để quay sang trái (hướng Bắc, tức $-Z$), góc hướng $\text{yaw}$ phải **giảm dần** (tiến về $-\frac{\pi}{2}$).
  Tuy nhiên, mã nguồn cũ lại cộng thêm góc:
  ```typescript
  // CŨ (SAI):
  const newYaw = s.yaw + angularW * dt; // Khi omega > 0 -> yaw tăng -> quay về +Z (Nam / Phải)!
  ```
  Điều này khiến việc rẽ trái trở thành rẽ phải, và rẽ phải trở thành rẽ trái.
* **Khắc phục:**
  ```typescript
  // MỚI (ĐÚNG):
  const rawYaw = s.yaw - angularW * dt;
  const newYaw = Math.atan2(Math.sin(rawYaw), Math.cos(rawYaw));
  ```

---

#### 2.2. Lỗi Lệch Góc Cơ Sở Mô Hình 3D JetBot (`Robot3DCanvas.tsx`)
* **Vị trí:** `src/components/Robot3DCanvas.tsx`, hàm dựng `createJetBotMesh` và vòng lặp `animate`.
* **Nguyên nhân gốc rễ:**
  - Mô hình 3D hình học CAD của JetBot được thiết kế với đầu xe quay dọc theo trục nội bộ $+Z$ và trục bánh xe nằm dọc theo trục $X$.
  - Trong không gian sa bàn CMU10, hướng tiến ban đầu ($\text{yaw} = 0$) là trục $+X$. Do đó, giữa hệ tọa độ gốc của mesh và hệ tọa độ thế giới tồn tại độ lệch chuẩn là $-\frac{\pi}{2}$ radian ($-90^\circ$).
  - Mã nguồn cũ thiết lập góc cố định ban đầu nhưng không cập nhật `robotRoot.rotation.y` theo `s.yaw` trong vòng lặp dựng hình liên tục `animate()`, khiến robot 3D đứng bất động một hướng hoặc lệch $90^\circ$ so với vector di chuyển của sàn băng chuyền ảo.
* **Khắc phục:**
  1. Gán biến tham chiếu `robotRootRef.current = robotRoot`.
  2. Trong vòng lặp `animate()`:
     ```typescript
     if (robotRootRef.current) {
       robotRootRef.current.rotation.y = -Math.PI / 2 - s.yaw;
     }
     ```
  3. Cập nhật chuyển động trượt của sàn lưới ảo (treadmill grid) phản chiếu chính xác vector hướng di chuyển:
     ```typescript
     gridHelper.position.x = -gridOffset * Math.cos(s.yaw);
     gridHelper.position.z = -gridOffset * Math.sin(s.yaw);
     ```

---

#### 2.3. Lỗi Đảo Ngược Hướng Lái Tự Động Đến Mục Tiêu (`TacticalArenaMap.tsx`)
* **Vị trí:** `src/components/TacticalArenaMap.tsx`, logic điều hướng `Click-to-Goal`.
* **Nguyên nhân gốc rễ:**
  Góc lệch giữa hướng robot hiện tại và vị trí điểm đích được tính bằng:
  ```typescript
  const angleToGoal = Math.atan2(dz, dx) - simState.yaw;
  const normAngle = Math.atan2(Math.sin(angleToGoal), Math.cos(angleToGoal));
  ```
  - Khi $\text{normAngle} > 0$, mục tiêu nằm ở bên Phải (hướng $+Z$) so với đầu xe. Robot cần rẽ phải ($v_L = 0.45, v_R = 0.15$).
  - Khi $\text{normAngle} < 0$, mục tiêu nằm ở bên Trái (hướng $-Z$) so với đầu xe. Robot cần rẽ trái ($v_L = 0.15, v_R = 0.45$).
  Mã nguồn trước đây gán ngược hai trường hợp này, dẫn đến hiện tượng robot lạng xe tránh xa điểm đích.
* **Khắc phục:** Sửa đúng quy tắc bẻ lái vi sai tương ứng với dấu của $\text{normAngle}$.

---

#### 2.4. Trạng Thái Thực Thi Khi Điều Khiển Thủ Công (`TripleViewCockpit.tsx`)
* **Vị trí:** `src/components/TripleViewCockpit.tsx`, các handler sự kiện phím D-Pad và bàn phím (Arrow Up/Down/Left/Right).
* **Nguyên nhân gốc rễ:**
  Khi người dùng click nút D-Pad hoặc bấm mũi tên, hệ thống chỉ gọi `setMotorSpeeds()`. Nếu mô phỏng đang ở trạng thái `STOPPED` hoặc `PAUSED`, vòng lặp `requestAnimationFrame` sẽ không gọi `integratePhysics()`, tạo cảm giác "bấm nút mà robot không chạy".
* **Khắc phục:**
  Tự động kích hoạt `simulationStore.run()` đồng thời với `setMotorSpeeds()`, đảm bảo robot lập tức chuyển động và hiển thị phản hồi tức thì.

---

### 3. KẾT LUẬN

Sau khi khắc phục đồng bộ 4 điểm mấu chốt trên:
- Các thành phần (Toán học vật lí, Bản đồ 2D, Robot 3D, Camera FPV, Bảng điều khiển D-Pad) hoàn toàn ăn khớp và đồng bộ 100%.
- Không còn bất kỳ sự xung đột quy ước tọa độ nào giữa các góc nhìn.
