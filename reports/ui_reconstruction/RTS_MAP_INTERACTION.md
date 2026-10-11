# CMU10 — BÁO CÁO TƯƠNG TÁC BẢN ĐỒ VÀ SA BÀN RTS (RTS MAP INTERACTION)
## Điều khiển Sa bàn Bám đường 2D, Tọa độ Thực nghiệm & Bản đồ Thu nhỏ MiniMap

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu chuẩn:** Phase B Master UI Reconstruction
- **Phiên bản:** V1.0
- **Ngày lập:** 11/10/2026

---

## 1. THIẾT KẾ SA BÀN CHIẾN THUẬT 2D (TACTICAL ARENA 2D)

Sa bàn 2D mô phỏng góc nhìn thẳng từ trên cao (Top-down RTS View) của phòng thực nghiệm Vật lí:
- **Kích thước thực:** $3.0\text{ m} \times 2.0\text{ m}$ (Hệ toạ độ Descartes gốc tại tâm $(0, 0)$).
- **Lưới toạ độ chuẩn:** Lưới ô vuông $0.25\text{ m} \times 0.25\text{ m}$ giúp học sinh dễ dàng đo đạc độ dời $\Delta x, \Delta z$ và tính toán vận tốc trung bình $v_{tb} = \frac{\Delta s}{\Delta t}$.
- **Đường ray bám (Track):** Vạch sơn đen bám đường theo giáo trình JetBot Road Following.
- **Vật cản (Obstacles):** Các khối hộp $0.2\text{ m} \times 0.2\text{ m}$ phản xạ chùm sóng siêu âm $160^\circ$.

---

## 2. BẢN ĐỒ TỔNG QUAN THU NHỎ (FLOATING MINIMAP)

Tại góc trên bên phải của Viewport chính, một cửa sổ MiniMap nổi được tích hợp trực tiếp:
1. **Chế độ hiển thị lớp (Layers Toggle):**
   - `Mẫu`: Bật/tắt đường đi mẫu lý thuyết (quỹ đạo chuẩn mực).
   - `Vết`: Hiển thị vệt bánh xe thực tế đã chạy (odometry path) để phân tích sai số trượt bánh.
   - `Tia`: Chùm tia quét cảm biến siêu âm phía trước.
   - `Lưới`: Bật/tắt lưới toạ độ $XY$.
2. **Thao tác nhanh (Quick Actions):**
   - `Quan sát`: Chế độ tự do soi map.
   - `Kéo`: Dịch chuyển bản đồ bằng chuột.
   - `Mục tiêu`: Đặt điểm đích (Waypoint) để robot tự tìm đường đến.
   - `Tâm Robot`: Đưa góc nhìn về chính giữa thân robot.
   - `Theo Robot`: Camera tự động bám theo robot khi di chuyển.
   - `Vừa khung`: Tự động cân chỉnh vừa khít toàn bộ sa bàn.
3. **Bảng chỉ số toạ độ tức thời:**
   - Hiển thị trực quan: `X: -0.80m | Z: 0.00m | Yaw: 0° | v: 0.0 cm/s | w: 0.00 rad/s`.

---

## 3. THAO TÁC CHUỘT VÀ BÀN PHÍM CHUẨN RTS
- **Chuột trái:** Click để đặt mục tiêu di chuyển hoặc chọn đối tượng.
- **Chuột phải / Kéo giữ chuột:** Dịch chuyển góc nhìn (Pan map).
- **Cuộn chuột (Wheel):** Phóng to / Thu nhỏ mượt mà (Zoom in/out từ 50% đến 400%).
- **Phím tắt hỗ trợ:**
  - `F`: Fit to screen (Vừa khung).
  - `C`: Center robot (Về tâm xe).
  - `Space`: Dừng khẩn cấp E-STOP.
