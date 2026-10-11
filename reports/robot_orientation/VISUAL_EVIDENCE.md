# BẰNG CHỨNG HÌNH ẢNH KIỂM ĐỊNH (VISUAL EVIDENCE CATALOG)
## Thư viện Ảnh Chụp Thực Tế Bộ Kiểm Thử Hướng & Động Học CMU10

**Thư mục lưu trữ:** `reports/robot_orientation/screenshots/`  
**Độ phân giải chụp:** $1586 \times 992\text{ px}$ (Chuẩn màn hình máy tính để bàn tham chiếu)  

---

### DANH MỤC ẢNH CHỤP MINH CHỨNG TỪNG BÀI KIỂM THỬ

| Tên bài test | Tệp ảnh chụp minh chứng | Mô tả hành vi quan sát được |
| :--- | :--- | :--- |
| **T01 — Initial Pose** | `01_initial_orientation.png` | Robot tại vạch xuất phát $(-0.8\text{ m}, 0.0\text{ m})$ hướng thẳng về phía Đông ($+X$), góc $\text{yaw} = 0\text{ rad}$. |
| **T02 — Forward Drive** | `02_forward_motion.png` | Robot tịnh tiến thẳng dọc theo trục $+X$, tọa độ $Z$ và góc $\text{yaw}$ giữ nguyên tuyệt đối. Vệt quỹ đạo màu xanh lam kéo dài. |
| **T03 — Backward Drive** | `03_backward_motion.png` | Robot lùi thẳng về phía sau trục $-X$ mà không bị đổi hướng hay lạng bánh xe. |
| **T04 — Spin Left** | `04_spin_left.png` | Bánh trái lùi, bánh phải tiến. Đầu xe xoay tại chỗ về hướng Bắc ($-Z$). Tâm xe đứng yên không trôi. |
| **T05 — Spin Right** | `05_spin_right.png` | Bánh trái tiến, bánh phải lùi. Đầu xe xoay tại chỗ về hướng Nam ($+Z$). Tâm xe đứng yên không trôi. |
| **T06 — Curved Path** | `06_curved_arc.png` | Robot di chuyển theo cung tròn mượt mà trên sa bàn với $v_L < v_R$, đầu xe hướng theo tiếp tuyến đường cong. |
| **T07 — Cardinal Headings** | `07_cardinal_directions.png` | Kiểm tra di chuyển theo 4 hướng la bàn chính: Đông ($0^\circ$), Nam ($90^\circ$), Tây ($180^\circ$), Bắc ($270^\circ$). |
| **T08 — Ultrasonic Detection** | `08_ultrasonic_detection.png` | Nón quét siêu âm hướng thẳng theo đầu xe phát hiện khối LEGO màu vàng phía trước cự ly $35\text{ cm}$. |
| **T09 — Multi-View Sync** | `09_multiview_sync.png` | Góc nghiêng $45^\circ$ đồng bộ hoàn hảo: icon bản đồ 2D, mô hình CAD 3D và góc nhìn đường chân trời camera FPV. |
| **T10 — Multi-Modal D-Pad** | `10_multimodal_dpad.png` | Nhấn nút D-Pad rẽ trái lập tức kích hoạt trạng thái `RUNNING` và tăng ga vi sai tương ứng. |
| **T11 — Collision Geometry** | `11_collision_bounce.png` | Robot chạm chướng ngại vật kích hoạt phản hồi va chạm mềm, bảo toàn khoảng cách an toàn $0.23\text{ m}$. |
| **T12 — Pause & E-STOP** | `12_estop_verified.png` | Nút ngắt khẩn cấp E-STOP chuyển nền đỏ, khóa ga PWM $0\%$, chặn toàn bộ lệnh điều khiển cho đến khi Reset. |

---

### XÁC MINH TOÀN VẸN TỆP HÌNH ẢNH
Tất cả 12 ảnh chụp trên đều được tự động kết xuất trực tiếp từ trình duyệt Chromium không đầu (headless browser) của Playwright trong suốt quá trình chạy kiểm thử tương tác thực tế, không dùng dữ liệu giả lập.
