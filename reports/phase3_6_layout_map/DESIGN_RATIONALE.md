# CMU10 — PHASE 3.6: DESIGN RATIONALE
## Nghiên Cứu & Nguyên Lý Thiết Kế Bố Cục và Kiến Trúc Tương Tác Sa Bàn Bản Đồ

**Dự án:** CMU10 JetBot AI & Robotics Interactive Studio  
**Mục tiêu:** Chuyển đổi kiến trúc sa bàn 2D thành hệ thống điều khiển robot chuyên nghiệp chuẩn Web Robotics, kết hợp nguyên lý toán học không gian thực, tối ưu WCAG 2.2 và bảo toàn tuyệt đối động học vi sai.  
**Phiên bản nền:** Phase 3.5 (commit `235d2fc`)  
**Tác giả:** Senior Frontend Engineer & Robotics Simulation Architect

---

### 1. BỐI CẢNH VÀ THÁCH THỨC KỸ THUẬT

Sa bàn ảo CMU10 không phải là bản đồ địa lý tĩnh (GIS map) thông thường mà là một **sân thi đấu robot tự hành (Autonomous Robot Arena)** với các ràng buộc vật lý nghiêm ngặt:
- Miền tọa độ thế giới xác định: $X \in [-1.5, 1.5]\text{ m}$ (chiều rộng $3.0\text{ m}$), $Z \in [-1.0, 1.0]\text{ m}$ (chiều dài $2.0\text{ m}$).
- Robot có kích thước vật lý thực (bán kính va chạm $r = 0.11\text{ m}$, wheelbase $b = 0.112\text{ m}$, bánh xe $r_w = 0.0325\text{ m}$).
- Chướng ngại vật tĩnh có bán kính và tọa độ tâm thực tế.
- Các thao tác bản đồ (zoom, pan, fullscreen) **tuyệt đối không được làm biến đổi trạng thái động học** hoặc gửi lệnh vận tốc giả tới robot.
- Tương tác chuột/chạm cần phân biệt rạch ròi giữa thao tác **Kéo Di Chuyển (Pan Drag)** và **Đặt Điểm Mục Tiêu (Click-to-Goal)** để tránh việc nhả chuột sau khi pan vô tình ra lệnh cho robot lao vào tường hoặc vật cản.

---

### 2. PHÂN TÁCH BA HỆ TỌA ĐỘ (THREE-TIER COORDINATE SPACES)

Hệ thống Phase 3.6 chính thức phân tách và đóng gói ba hệ không gian tọa độ:

```
[Screen / Client Coordinates]
       │  (clientX, clientY)
       ▼  getScreenCTM().inverse()
[SVG Viewport Coordinates]
       │  (uView, vView)
       ▼  uBase = (uView - panX) / zoom
[Base SVG Canvas Coordinates]  viewBox [0 0 600 400]
       │  (uBase, vBase)
       ▼  x = (uBase / 600) * 3.0 - 1.5
[World Metric Coordinates]     Arena X: [-1.5, 1.5]m, Z: [-1.0, 1.0]m
```

#### Ưu thế của MDN `getScreenCTM()`
Thay vì dựa vào các phép chia tỷ lệ màn hình đơn giản dễ bị lệch khi container bị letterbox, padding hoặc co giãn responsive, `getScreenCTM()` (Current Transformation Matrix) của SVG element trả về ma trận chuyển đổi affine 2D chuẩn xác từ màn hình hiển thị vào không gian SVG. Bằng việc nhân vector tọa độ với ma trận nghịch đảo $M^{-1}$, độ lệch điểm trỏ con trỏ chuột được triệt tiêu tuyệt đối trên mọi độ phân giải.

---

### 3. QUY TẮC PHÂN BIỆT CLICK VÀ DRAG (DRAG THRESHOLD $\Delta > 5\text{px}$)

Một lỗi nghiêm trọng trong các hệ thống điều khiển robot trên web là **tai nạn nhả chuột (Drag-Release Misfire)**:
- Người dùng bấm giữ chuột để kéo sa bàn quan sát (Pan).
- Khi nhả chuột (`pointerup`), hệ thống bắt sự kiện click và tự động đặt Waypoint hoặc Mục tiêu tại điểm nhả chuột.
- Robot nhận lệnh sai và chuyển hướng đột ngột.

**Giải pháp Phase 3.6:**
- Thiết lập biến trạng thái khoảng cách dịch chuyển:
  $$\Delta = \sqrt{(\text{clientX} - \text{start.clientX})^2 + (\text{clientY} - \text{start.clientY})^2}$$
- Nếu $\Delta > 5\text{ px}$: Ghi nhận cờ `hasExceededDragThreshold = true`.
- Khi sự kiện `pointerup` kích hoạt:
  - Nếu `hasExceededDragThreshold == true`: **Hủy bỏ hoàn toàn** mọi logic đặt Waypoint hoặc Goal.
  - Chỉ khi $\Delta \le 5\text{ px}$ (thao tác click có chủ đích), hệ thống mới thực hiện phân giải tọa độ thế giới và kiểm tra hợp lệ.

---

### 4. MÁY TRẠNG THÁI QUAN SÁT (OBSERVATION STATE MACHINE)

Bản đồ hỗ trợ 5 trạng thái quan sát độc lập:
1. **`FREE`**: Người dùng tự do pan, zoom và khảo sát sa bàn.
2. **`FOLLOW_ROBOT`**: Camera liên tục bám theo tâm robot $(x, z)$ theo thời gian thực ($30\text{ Hz}$).
3. **`FOCUS_ROBOT`**: Camera đưa robot về trung tâm tầm nhìn $(300, 200)$ đúng một lần và chuyển quyền kiểm soát cho người dùng.
4. **`FOCUS_GOAL`**: Camera đưa mục tiêu đang chọn hoặc waypoint cuối cùng về trung tâm tầm nhìn.
5. **`FIT_ALL`**: Reset camera về mức $100\%$ (`zoom = 1.0, panX = 0, panY = 0`) để bao quát toàn bộ ranh giới sân thi đấu.

**Nguyên tắc chuyển trạng thái thông minh:**
Khi đang ở trạng thái `FOLLOW_ROBOT`, nếu người dùng thực hiện thao tác kéo bản đồ thủ công (bằng Pan mode, chuột giữa hoặc Space + drag), hệ thống tự động chuyển trạng thái về `FREE`. Điều này ngăn chặn hiện tượng camera giằng co giữa thuật toán bám robot và ý định thao tác của người dùng.

---

### 5. AN TOÀN VÀ PHÂN QUYỀN ĐIỀU KHIỂN (CONTROL OWNERSHIP HIERARCHY)

Hệ thống tuân thủ cây ưu tiên kiểm soát:
1. **Mức 1 — Cao nhất:** **E-STOP (Dừng Khẩn Cấp)**:
   - Ngắt ngay lập tức toàn bộ xung PWM hai động cơ về 0.
   - Dừng luồng mô phỏng và khóa chuyển động.
   - Không bị vô hiệu hóa bởi bất kỳ thao tác UI nào.
2. **Mức 2:** **Manual D-Pad & Keyboard Arrows**:
   - Ghi đè các chế độ tự hành khi có tín hiệu can thiệp trực tiếp từ người điều khiển.
3. **Mức 3:** **Click-to-Goal & Trajectory Autonav**:
   - Chỉ được kích hoạt khi mục tiêu đã được kiểm định an toàn (không vi phạm biên sa bàn, không nằm trong bán kính va chạm vật cản) và người dùng bấm nút **Xác Nhận (Bắt Đầu)**.
4. **Mức 4 — Cách ly hoàn toàn:** **Camera Viewport Transforms (Pan / Zoom)**:
   - Chỉ tác động lên ma trận hiển thị của sa bàn SVG.
   - Phát ra chính xác $0\text{ m/s}$ vận tốc và $0\text{ rad/s}$ vận tốc góc tới bộ điều khiển robot.
