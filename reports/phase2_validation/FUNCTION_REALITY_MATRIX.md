# BẢNG MA TRẬN PHÂN LOẠI CHỨC NĂNG (FUNCTION REALITY MATRIX)
**Dự án:** JetBot AI & Robotics Interactive Studio (CMU10 Virtual Lab)  
**Phân loại mức độ hiện thực:**
- **REAL:** Tính toán thuật toán thật trên trình duyệt (toán học, động học vi phân, xử lý dữ liệu số, phân tích lỗi).
- **SIMULATED:** Mô hình vật lý ảo, động học mô phỏng theo phương trình vi phân toán lý, tạo phản xạ cảm biến và chuyển động trực quan mượt mà.
- **UI_ONLY:** Giao diện đồ họa tĩnh hoặc bán tĩnh, dữ liệu mẫu cấu hình trước, chưa có luồng dữ liệu hai chiều.
- **NOT_IMPLEMENTED:** Chỉ là tiêu đề hoặc nút bấm chưa có logic xử lý phía sau.

---

## BẢNG MA TRẬN CHI TIẾT TỪNG TÍNH NĂNG

| STT | Phân hệ / Tính năng | Trạng thái hiện tại | Mô tả chi tiết & Bằng chứng mã nguồn | Định hướng nâng cấp Giai đoạn 3 |
|:---:|---|:---:|---|---|
| **1** | **Mô hình 3D JetBot** | **SIMULATED** | Xây dựng bằng Three.js Mesh cấu trúc hình học chuẩn CAD (chassis, 2 bánh xe, lốp gai, động cơ TT DC, camera cáp ribbon, pin, Jetson Nano). Bánh xe quay theo vận tốc góc $\omega = v/R$. 7 chế độ kiểm tra (Khung dây, linh kiện, va chạm, tọa độ, FOV, CAD, thực tế). | Bổ sung cơ chế chuyển động tịnh tiến và xoay trong không gian 3D tương ứng sân đấu. |
| **2** | **Động học vi phân 2 bánh (Differential Drive)** | **REAL** | Phương trình $v = (v_R + v_L)/2$, $\omega = (v_R - v_L)/L$, cập nhật góc lái $\theta$, tọa độ $x, y$ chính xác theo toán học robot trong `RobotTwinMotorSimulator.tsx`. | Nâng cấp tích hợp thời gian thực với mô hình lực ma sát và độ trượt của bánh. |
| **3** | **Điều khiển PWM & Cầu H (Motor Driver)** | **SIMULATED** | Tính toán tỉ lệ xung PWM (0..100%), mô phỏng địa chỉ thanh ghi I2C `0x60`, chip điều khiển động cơ PCA9685/TB6612FNG trên JetBot Shield. | Xuất mã hex I2C và hiển thị xung nhịp PWM thực tế trên biểu đồ oscilloscope ảo. |
| **4** | **Phát sinh mã Python JetBot** | **REAL** | Tạo trực tiếp cú pháp chuẩn `jetbot.Robot()`: `robot.set_motors(left, right)`, `robot.stop()`, `robot.forward(speed)`, `robot.left(speed)`. | Tích hợp trình thông dịch ảo (Micro-Python / WebWorker Python runner) để chạy trực tiếp vòng lặp người dùng nhập. |
| **5** | **Camera FPV (Góc nhìn thứ nhất)** | **UI_ONLY** | Sử dụng 5 cảnh mẫu tĩnh (`straight`, `curve_right`, `curve_left`, `blocked_lego`, `blocked_box`) với tọa độ mục tiêu gắn sẵn. | Kết xuất (Render) FPV trực tiếp từ camera Three.js 3D gắn trên đầu xe JetBot nhìn ra sa bàn thực tế. |
| **6** | **Gán nhãn dữ liệu bám đường (Annotation)** | **REAL** | Người dùng click vào khung hình, hệ thống tính toán pixel $(x, y)$, chuyển đổi về tọa độ chuẩn hóa $[-1, 1]$, lưu danh sách ảnh và mẫu huấn luyện. | Lưu trữ vào IndexedDB của trình duyệt để có thể tải dataset về máy dạng `.json`/`.csv`. |
| **7** | **Suy luận AI né vật cản (Collision Avoidance)** | **SIMULATED** | Tính toán xác suất $P(\text{blocked})$ theo vị trí vật cản trong tầm quét FOV, phát cờ cảnh báo va chạm và kích hoạt phanh an toàn. | Tích hợp mô hình ONNX Runtime Web / TensorFlow.js chạy MobileNet/ResNet18 phân loại nhị phân thực tế trên CPU trình duyệt. |
| **8** | **Đồ thị huấn luyện Loss & Accuracy** | **REAL** | `TrainingChartsView.tsx` tính toán và vẽ đồ thị hàm mất mát MSE/Cross-Entropy, độ chính xác qua từng Epoch với tương tác thay đổi Learning Rate, Batch Size, Optimizer (Adam/SGD). | Cho phép người dùng bấm "Bắt đầu huấn luyện giả lập" với thời gian chạy và đồ thị nhảy theo từng epoch. |
| **9** | **Cảm biến siêu âm & Tia quét FOV** | **SIMULATED** | Hình nón FOV Three.js góc $60^\circ$ và tính toán khoảng cách Euclidean ảo tới vật cản LEGO. | Bổ sung thuật toán Raycasting va chạm thật trong không gian 3D/2D với các vật cản trên map. |
| **10** | **Quỹ đạo dự kiến vs Quỹ đạo thực tế** | **SIMULATED** | Vẽ vết đường đi (trail) của robot trong canvas 2D, hiển thị vector vận tốc và góc lệch hướng. | Bổ sung đường cong Bezier/Dubins Path làm quỹ đạo mẫu (Planned path) để so sánh sai số thực tế (Tracking Error). |
| **11** | **Điều khiển khẩn cấp (Emergency Stop)** | **REAL** | Nút bấm ngắt tức thì tất cả tiến trình mô phỏng, đặt tốc độ $v_L = 0, v_R = 0$, khóa lệnh điều khiển và ghi log an toàn. | Giữ nguyên và liên kết phím tắt bàn phím vật lý (`Spacebar` / `Escape`). |
| **12** | **Bộ đệm sự kiện & Telemetry Logger** | **REAL** | Ghi log thời gian thực với phân loại `command`, `telemetry`, `safety`, `event`, bộ lọc tìm kiếm, sao chép JSON, tải nhật ký. | Bổ sung xuất file CSV telemetry và hiển thị tốc độ dòng lệnh đang chạy. |

---

## KẾT LUẬN & ĐỊNH HƯỚNG

- Các chức năng nền tảng cốt lõi của môn học (Động học vi phân, phát sinh mã Python, công thức tính toán và trực quan hóa kỹ thuật) đã ở mức **REAL** và **SIMULATED** rất vững chắc.
- Điểm cần chuyển hóa mạnh mẽ nhất trong Giai đoạn 3 là **Camera FPV** (từ `UI_ONLY` sang camera ảo 3D động `REAL/SIMULATED`) và **Khung nhìn đồng bộ đa góc độ** (Map 2D, Không gian 3D, FPV Camera) dùng chung 1 nguồn dữ liệu thời gian thực.
