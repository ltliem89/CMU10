# Phương Án Cải Thiện Bố Trí Chuẩn Hóa — Robot Twin & Nhật Ký Robot (Vibrant STEM)

## 1. Phân Tích Hiện Trạng & Vấn Đề Cần Cải Thiện
- **Bố cục dọc kéo dài quá mức (Excessive Vertical Stacking):** Hiện tại, bảng "Nhật Ký Robot" được xếp ở tận đáy trang, sau cả khu vực Sân Chạy Robot (Arena) và Bảng Điều Khiển Động Cơ. Khi học sinh thao tác trên thanh trượt hoặc chọn các nút kịch bản thử nghiệm ở trên, học sinh **không thể quan sát được dòng lệnh phát sinh ngay lập tức mà phải cuộn trang lên xuống liên tục**.
- **Mất tính liên kết trực quan giữa Nguyên nhân & Kết quả (Decoupled Visual Cause & Effect):** 
  - Trong phương pháp giáo dục STEM lớp 11, việc học sinh vừa chỉnh tay ga vừa nhìn thấy robot rẽ trên sân chạy, đồng thời **thấy ngay dòng mã Python `robot.set_motors()` và xung PWM phát sinh trong console** là chìa khóa để hiểu rõ logic điều khiển máy tính.
- **Dồn nén thông tin ở cột điều khiển:** Các khối thông tin (công thức toán, giải thích chuyển động, thanh trượt, preset) bị xếp chồng dày đặc ở một cột đơn lẻ.

---

## 2. Phương Án Thiết Kế Bố Trí Chuẩn (Standard Layout Blueprint)

### A. Kiến Trúc Buồng Lái STEM 2 Tầng (2-Tier STEM Cockpit Architecture)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Tiêu đề Robot Vi Sai · Trạng thái Trình duyệt · [Chạy / Tạm Dừng] · [Đặt Lại] · [E-STOP Đỏ]   │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────────┤
│  TẦNG 1: TRẠM THÍ NGHIỆM ĐỘNG HỌC (ARENA & DIRECT CONTROLS)                                            │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│  CỘT TRÁI (60%): SÂN CHẠY ROBOT (2D CANVAS)     │  CỘT PHẢI (40%): ĐIỀU KHIỂN & KỊCH BẢN CHUẨN (MỤC 5.4) │
│  - Đường đua vòng cung với vạch kẻ vàng         │  - 2 Thanh trượt vi sai Motor L (Xanh) & R (Cam)     │
│  - Robot vi sai xoay thời gian thực             │  - Lưới 6 kịch bản thử nghiệm nhanh 2x3 (Mục 5.4)    │
│  - Vector vận tốc bánh xe & Hướng di chuyển     │  - Nút chuyển nhanh chế độ xem / Thu gọn mở rộng Log  │
│  - HUD Tọa độ (X, Y, Theta, v, ω)               │  - Thẻ tóm tắt trạng thái động thái đang chạy        │
├─────────────────────────────────────────────────┴──────────────────────────────────────────────────────┤
│  TẦNG 2: NHẬT KÝ ROBOT & BẢNG CHẨN ĐOÁN THỜI GIAN THỰC (INTEGRATED TELEMETRY & CODE CONSOLE)          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  - Thanh công cụ: [Lọc: Tất cả / Lệnh Động Cơ / Odometry / An toàn] · [Tự động cuộn] · [Copy Python]   │
│  ┌──────────────────────────────────────────────┬────────────────────────────────────────────────────┐ │
│  │ PHÂN KHU A (55%): DÒNG LỆNH & BUS I2C        │ PHÂN KHU B (45%): GIẢI THÍCH VẬT LÝ & CÔNG THỨC    │ │
│  │ - Terminal stream thời gian thực             │ - Mô hình Toán vi sai:                             │ │
│  │ - Mã Python: >>> robot.set_motors(l, r)      │   v = (v_R + v_L)/2                                │ │
│  │ - Trạng thái ACK 200 I2C (0x60)              │   ω = (v_R - v_L)/b                                │ │
│  │ - Copy nhanh từng dòng lệnh                  │ - Phân tích cơ học: Tại sao robot rẽ hướng này?    │ │
│  │ - Xung PWM (%) trên kênh A và kênh B         │ - Chẩn đoán phần cứng Nano & Driver TB6612FNG      │ │
│  └──────────────────────────────────────────────┴────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Các Điểm Nâng Cấp Logic & Trải Nghiệm Người Dùng (UX)

1. **Hiển thị song hành (Side-by-side Live Feedback):**
   - Phân khu Nhật Ký được chia đôi: Một bên là **Dòng lệnh & Code Python** (dành cho học sinh quan sát code), bên còn lại là **Phân tích cơ học & Công thức vi sai** (dành cho việc học lý thuyết vật lý).
   - Khi học sinh kéo thanh trượt hoặc bấm kịch bản, cả hai bên đều cập nhật tức thời mà không cần cuộn trang.

2. **Chế độ xem linh hoạt (Foldable / Compact Mode):**
   - Học sinh có thể nhấn nút **Thu gọn / Mở rộng** để tập trung quan sát Sân chạy khi màn hình nhỏ, hoặc mở rộng đầy đủ để xem chi tiết từng byte lệnh trên bus I2C.

3. **Màu sắc nhận diện trực quan theo chuẩn Vibrant STEM:**
   - **Kênh Bánh Trái:** Xanh điện tử (`#2563EB`) đồng bộ từ thanh trượt $\rightarrow$ nhãn L $\rightarrow$ vector vận tốc trái $\rightarrow$ tham số hàm `robot.left_motor`.
   - **Kênh Bánh Phải:** Cam năng lượng (`#F97316`) đồng bộ từ thanh trượt $\rightarrow$ nhãn R $\rightarrow$ vector vận tốc phải $\rightarrow$ tham số hàm `robot.right_motor`.
   - **Trạng thái an toàn & Dừng khẩn cấp:** Đỏ rực (`#DC2626`) với thông báo cảnh báo rõ ràng.

4. **Tương thích hoàn toàn với bài học JetBot:**
   - Dòng lệnh xuất ra chuẩn 100% cú pháp JetBot Python (`robot.set_motors(left, right)`, `robot.forward(speed)`, `robot.stop()`).
   - Hỗ trợ nút sao chép toàn bộ phiên chạy để nạp trực tiếp vào Jupyter Notebook (`teleoperation.ipynb` / `live_demo.ipynb`).

---

## 4. Kế Hoạch Triển Khai Sau Khi Phê Duyệt

1. Cấu trúc lại file `/src/components/RobotTwinMotorSimulator.tsx` theo bản thiết kế 2 tầng chuẩn mực.
2. Kiểm thử đồng bộ các sự kiện thay đổi thanh trượt, nút kịch bản, dừng khẩn cấp và bus log.
3. Chạy `compile_applet` và `lint_applet` để xác nhận ứng dụng hoạt động mượt mà, không có lỗi runtime.
