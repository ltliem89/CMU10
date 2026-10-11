# KẾT QUẢ KIỂM THỬ HƯỚNG VÀ ĐỘNG HỌC ROBOT (T01 - T12)
## CMU10 Robot Orientation & Differential-Drive Verification Results

**Ngày thực thi:** 11/10/2026  
**Công cụ kiểm thử:** Playwright Automated Behavioral Harness (`scripts/verify_robot_orientation.mjs`)  
**Kết quả chung:** **12/12 BÀI KIỂM TRA ĐẠT (100% PASS)**  

---

### BẢNG KẾT QUẢ CHI TIẾT TỪ T01 ĐẾN T12

| Mã | Tên bài kiểm tra | Trạng thái | Bằng chứng định lượng (Quantitative Evidence) | Tiêu chuẩn chấp nhận |
| :--- | :--- | :---: | :--- | :--- |
| **T01** | Xác định hướng ban đầu (Initial Pose & Vectors) | **PASS** | $\text{yaw} = 0\text{ rad}$, $\hat{\mathbf{u}}_{\text{fwd}} = (1.0, 0.0)$, $\hat{\mathbf{u}}_{\text{left}} = (0.0, -1.0)$, $\hat{\mathbf{u}}_{\text{right}} = (0.0, 1.0)$ | $\text{yaw} = 0$, vector hướng đúng hệ tọa độ |
| **T02** | Chuyển động tiến (Forward Drive) | **PASS** | $\Delta x = +0.459\text{ m}$, $\Delta z = 0.0000\text{ m}$, $\Delta\text{yaw} = 0.0000\text{ rad}$ | $\Delta x > 0.05\text{ m}$, $\Delta z = 0$, $\Delta\text{yaw} = 0$ |
| **T03** | Chuyển động lùi (Backward Drive) | **PASS** | $\Delta x = -0.383\text{ m}$, $\Delta z = 0.0000\text{ m}$, $\Delta\text{yaw} = 0.0000\text{ rad}$ | $\Delta x < -0.05\text{ m}$, $\Delta z = 0$, $\Delta\text{yaw} = 0$ |
| **T04** | Quay tại chỗ sang trái (Spin Left) | **PASS** | $\Delta\text{yaw} = -1.196\text{ rad}$ ($< 0$, xoay về Bắc $-Z$), độ trôi tâm $\Delta x = 0.0000\text{ m}, \Delta z = 0.0000\text{ m}$, $\omega = 3.36\text{ rad/s}$ | $\Delta\text{yaw} < -0.2\text{ rad}$, tâm robot đứng yên ($< 0.02\text{ m}$) |
| **T05** | Quay tại chỗ sang phải (Spin Right) | **PASS** | $\Delta\text{yaw} = +1.196\text{ rad}$ ($> 0$, xoay về Nam $+Z$), độ trôi tâm $\Delta x = 0.0000\text{ m}, \Delta z = 0.0000\text{ m}$, $\omega = -3.36\text{ rad/s}$ | $\Delta\text{yaw} > +0.2\text{ rad}$, tâm robot đứng yên ($< 0.02\text{ m}$) |
| **T06** | Quỹ đạo cong vi sai (Curved Path Arc) | **PASS** | $v_L = 0.2, v_R = 0.6 \implies z = -0.078\text{ m}$, $\text{yaw} = -1.265\text{ rad}$, số điểm quỹ đạo: 3 điểm | $z < -0.03\text{ m}$, $\text{yaw} < -0.2\text{ rad}$, quỹ đạo liên tục không giật |
| **T07** | Bốn hướng la bàn (Four Cardinal Headings) | **PASS** | $0^\circ$ (Đông / $+X$): $dx=0.16, dz=0.00$ [OK]<br>$90^\circ$ (Nam / $+Z$): $dx=0.00, dz=0.16$ [OK]<br>$180^\circ$ (Tây / $-X$): $dx=-0.16, dz=0.00$ [OK]<br>$270^\circ$ (Bắc / $-Z$): $dx=0.00, dz=-0.16$ [OK] | Cả 4 hướng chính di chuyển đúng dấu và vector chỉ phương |
| **T08** | Cảm biến siêu âm (Ultrasonic Raycast) | **PASS** | Nhìn thẳng chướng ngại vật obs-1: $35\text{ cm}$ (phát hiện: `true`)<br>Quay $90^\circ$ về vùng thoáng phía Bắc: $63\text{ cm}$ (phát hiện: `false`) | Phát hiện vật cản trước mặt $\le 45\text{ cm}$, không báo ảo ở vùng trống |
| **T09** | Đồng bộ Bản đồ / 3D / FPV | **PASS** | $\text{yaw} = 0.785\text{ rad}$ ($45^\circ$):<br>• Góc quay SVG: $45.0^\circ$<br>• Vector FPV Look: $(0.71, 0.71)$<br>• Góc xoay Three.js: $-2.36\text{ rad}$ ($-\frac{\pi}{2} - \text{yaw}$) | Độ lệch góc giữa các góc nhìn $< 0.1^\circ$ |
| **T10** | Điều khiển đa phương thức (Multi-Modal) | **PASS** | Nút D-Pad Trái: $v_L = -0.48, v_R = +0.48$, trạng thái tự chuyển `RUNNING` | Tự động kích hoạt mô phỏng, ga động cơ gán chính xác |
| **T11** | Hình học va chạm (Collision Geometry) | **PASS** | Khoảng cách tâm robot đến vật cản: $0.230\text{ m} \ge$ giới hạn bảo vệ thân xe $0.230\text{ m}$ (Bán kính vật cản $0.12\text{ m}$ + Bán kính xe $0.11\text{ m}$) | Phản hồi va chạm mềm (Soft bounce), không xuyên vật cản |
| **T12** | Tạm dừng & Ngắt khẩn cấp (Pause & E-STOP) | **PASS** | Trạng thái E-STOP: `true`, PWM = $0\%$, chặn lệnh động cơ mới: `true` | Cắt xung tức thời, khóa an toàn cầu H TB6612 |

---

### TỔNG KẾT
Tất cả các tiêu chí động học vi sai, hình học không gian và giao tiếp tương tác thời gian thực đều đạt mức độ chính xác tuyệt đối theo thiết kế CMU10.
