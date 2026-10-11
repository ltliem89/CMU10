# THIẾT KẾ PHÒNG ĐIỀU KHIỂN & TRỰC QUAN HÓA JETBOT (VISUALIZATION DESIGN)
**Dự án:** JetBot AI & Robotics Interactive Studio (CMU10 Virtual Lab)  
**Tầm nhìn:** Nâng cấp toàn diện JetBot Virtual Lab lên mức trực quan gấp 100 lần, biến ứng dụng thành một phòng thí nghiệm robot ảo sống động (Virtual Robotics Cockpit & Telemetry Studio), nơi mọi hình ảnh đều gắn với chức năng thực thi thật.

---

## 1. MÔ HÌNH PHÒNG ĐIỀU KHIỂN 3 KHUNG NHÌN ĐỒNG BỘ (TRIPLE-VIEW COCKPIT)

Thay vì buộc người dùng phải chọn xem riêng rẽ từng chế độ (hoặc chỉ xem 3D, hoặc chỉ xem 2D, hoặc chỉ xem ảnh tĩnh), giao diện mới sẽ trang bị bố cục **Synchronized Tri-Viewport**:

```
+---------------------------------------------------------------------------------------------------------+
|                                    JETBOT MISSION CONTROL HEADER                                        |
|  Status: ONLINE [60 FPS] | Simulation Time: 00:04:28.12 | Pos: (X: 142.5cm, Y: 89.2cm, Heading: 145°)  |
+--------------------------------------------------------------------+------------------------------------+
|                                                                    |   VIEWPORT 2: 3D MECHANICAL TWIN   |
|                                                                    |  - 3D Tank/Chassis, TT Motors      |
|                   VIEWPORT 1: TACTICAL ARENA MAP                   |  - Rotating Wheels (Left/Right)    |
|               (Sân Đua Toàn Cảnh 2D/3D Top-Down View)              |  - 7 CAD Inspection Modes          |
|  - Tọa độ lưới XYZ, Waypoint, Vật cản LEGO có va chạm thật        |  - Dynamic Motor Force Vectors     |
|  - Quỹ đạo dự kiến (Planned Path) vs Quỹ đạo thực tế (Actual Trail)+------------------------------------+
|  - Vector vận tốc tức thời, khoảng cách tới tường                  |   VIEWPORT 3: FPV ROBOT CAMERA     |
|                                                                    |  - Live First-Person Vision        |
|                                                                    |  - Road Target Aiming Point (x, y) |
|                                                                    |  - AI Obstacle Detection Box       |
+--------------------------------------------------------------------+------------------------------------+
|                         LOWER CONSOLE: CODE EXECUTION & REAL-TIME TELEMETRY                             |
|  [RUN] [PAUSE] [STEP] [STOP] [EMERGENCY STOP]                                                           |
|  Active Python Line: robot.set_motors(0.40, 0.65)  -->  PWM Left: 40% | PWM Right: 65%                  |
|  Command Flow: Python Runtime ---> I2C Shield 0x60 ---> Motor TT DC ---> Wheel Kinematics ---> Camera   |
+---------------------------------------------------------------------------------------------------------+
```

### Các chế độ bố cục linh hoạt (Layout Modes):
1. **Chế độ 3 Khung Nhìn (Triple View / Studio Mode):**
   - Khung chính lớn: Sa bàn đua xe (Tactical Map) góc trên bên trái (chiếm 60% diện tích).
   - Khung phụ trên: Mô hình cơ khí 3D (Mechanical Twin) với bánh xe quay đồng bộ góc trên bên phải (20%).
   - Khung phụ dưới: Camera FPV góc nhìn thứ nhất với AI overlay nhận diện góc trên bên phải (20%).
2. **Chế độ Chia Đôi (Split View 50/50):** Xem song song Sa bàn bản đồ và Robot 3D với kích thước bằng nhau.
3. **Chế độ Hình trong Hình (Picture-in-Picture - PiP):** Phóng to toàn màn hình Sa bàn bản đồ hoặc Robot 3D, trong khi Camera FPV thu nhỏ nằm gọn ở góc màn hình có thể kéo thả.
4. **Chế độ Toàn Màn Hình (Fullscreen Focus):** Phóng to độc lập bất kỳ viewport nào để quan sát chi tiết từng linh kiện hoặc từng khúc cua.

---

## 2. KIẾN TRÚC ĐỒNG BỘ DỮ LIỆU TẬP TRUNG (UNIFIED SIMULATION ENGINE)

Tất cả các khung nhìn và bảng điều khiển sẽ cùng kết nối tới một **Single Source of Truth** duy nhất:

```
                      +---------------------------------------+
                      |       SimulationStateStore (Zustand)  |
                      | - pos: { x, y, theta }                |
                      | - targetSpeeds: { left, right }       |
                      | - actualSpeeds: { left, right }       |
                      | - wheelAngles: { leftRot, rightRot }  |
                      | - obstacles: Obstacle[]               |
                      | - plannedTrajectory: Waypoint[]       |
                      | - actualTrajectory: Point[]           |
                      | - sensors: { ultrasonic, cameraFov }  |
                      | - executionState: RUN | PAUSE | STEP  |
                      +---------------------------------------+
                                          |
        +------------------+--------------+------------------+------------------+
        |                  |                                 |                  |
        v                  v                                 v                  v
+----------------+ +----------------+              +------------------+ +----------------+
| Tactical Map   | | 3D Robot Twin  |              | 3D FPV Camera    | | Telemetry &    |
| (Top-Down      | | (Three.js Mesh |              | (Render Target / | | Code Runner    |
| Arena View)    | | Wheel Rotation)|              | Projected Scene) | | (PWM, I2C, Log)|
+----------------+ +----------------+              +------------------+ +----------------+
```

### Nguyên tắc đồng bộ nghiêm ngặt:
- **Thời gian chung (Simulation Clock):** Tốc độ mô phỏng $\Delta t$ được điều tiết thống nhất. Không có thành phần nào tự ý chạy timer riêng.
- **Hệ quy chiếu chuẩn (Coordinate System):**
  - Trục $X$: Chiều tiến về phía trước của xe (Màu đỏ).
  - Trục $Y$: Chiều ngang vuông góc sang trái (Màu xanh lá).
  - Trục $Z$: Trọng lực hướng lên trên (Màu xanh dương).
  - Góc hướng $\theta = 0$: Xe hướng theo trục $+X$. Khi quay trái, $\theta$ tăng dương (rad).
- **Vật cản có va chạm thật:** Nếu tọa độ $(x, y)$ của xe chạm vào bán kính bao của khối LEGO hoặc tường bao sa bàn, xe sẽ dừng lại do va chạm vật lý, đồng thời kích hoạt cảnh báo trên Telemetry và đèn đỏ nhấp nháy trên mô hình 3D.

---

## 3. THIẾT KẾ THANH ĐIỀU KHIỂN & LUỒNG THỰC THI MÃ NGUỒN (CODE RUNNER CONSOLE)

Bổ sung bảng thực thi trực tiếp chuẩn phòng thí nghiệm giáo dục:
- **Thanh nút bấm điều khiển:**
  - `RUN`: Chạy liên tục theo chương trình hoặc tốc độ đã đặt.
  - `PAUSE`: Tạm dừng đóng băng mọi trạng thái để học sinh ghi chép dữ liệu.
  - `STEP (Single Step)`: Thực thi từng bước thời gian ($\Delta t = 0.1\text{s}$) hoặc từng dòng lệnh Python tiếp theo để quan sát biến thiên.
  - `RESUME`: Tiếp tục sau khi tạm dừng.
  - `RESET`: Đưa robot về vạch xuất phát $(X_0, Y_0, \theta_0)$, xóa vết đường đi.
  - `EMERGENCY STOP (Nút Đỏ Lớn)`: Khóa cưỡng bức phanh, đưa PWM về 0%, hiển thị cờ ngắt an toàn.
- **Tô sáng dòng lệnh đang thực thi (Live Code Highlighter):**
  - Hiển thị đoạn mã Python đang tác động:
    ```python
    # Dòng đang kích hoạt [ACTIVE]:
    robot.set_motors(0.40, 0.65)  # Bẻ lái ôm cua phải
    ```
  - Mũi tên trực quan hóa luồng tín hiệu số:
    `Lệnh Python [set_motors]` $\longrightarrow$ `Bộ điều khiển I2C 0x60` $\longrightarrow$ `Điện áp PWM 40%/65%` $\longrightarrow$ `Động cơ TT DC sinh mô-men` $\longrightarrow$ `Bánh xe lăn` $\longrightarrow$ `Cảm biến & Camera phản hồi`.

---

## 4. CHIẾN LƯỢC BẢO TOÀN TRẠNG THÁI KHI CHUYỂN TAB (STATE PERSISTENCE)

Để khắc phục hoàn toàn nhược điểm mất trạng thái khi chuyển tab mà báo cáo Validation đã chỉ ra:
1. Đưa `SimulationStore` lên cấp độ root (ngoài phạm vi các view tab).
2. Khi người dùng chuyển sang tab khác (ví dụ: sang tab `Đồ Thị Huấn Luyện` hoặc `Từ Điển Thuật Ngữ`):
   - Mô phỏng có thể chọn tiếp tục chạy nền hoặc tạm dừng giữ nguyên vị trí robot.
   - Khi quay lại tab Robot, toàn bộ tọa độ xe, vệt đường đã đi, cấu hình camera và lịch sử log vẫn còn nguyên vẹn 100%, không bị reset về vạch xuất phát.
3. Canvas 3D sẽ tái sử dụng tài nguyên (hoặc chỉ tạm ngưng animation loop `cancelAnimationFrame` thay vì hủy sạch dữ liệu).
