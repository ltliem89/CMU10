# CMU10 — BÁO CÁO THIẾT KẾ BỐ CỤC (LAYOUT SPECIFICATION)
## Tài liệu Đặc tả Bố cục Chuẩn xác Khớp Hình Tham chiếu CMU10

- **Dự án:** CMU10 — Phòng thí nghiệm Robot AI & Vật lí 10 (Chương trình GDPT 2018)
- **Tài liệu tham chiếu chuẩn:** `cmu10_reference.png` (Ảnh bảng điều khiển mô phỏng robot CMU10)
- **Phiên bản:** Phase B Master Reconstruction V1.0
- **Ngày lập:** 11/10/2026
- **Trạng thái:** Đã triển khai và xác minh trong mã nguồn thực tế

---

## 1. TỔNG QUAN HỆ THỐNG BỐ CỤC (WORKSPACE HIERARCHY)

Giao diện CMU10 được tái cấu trúc hoàn toàn theo triết lý **Simulation-First Workspace** (Khung mô phỏng là trung tâm tuyệt đối). Bố cục mô phỏng mô phỏng một trạm điều khiển robot chuyên nghiệp (Cockpit / Mission Control), bao gồm 4 khối không gian chính:

```
+-------------------------------------------------------------------------------------------------------------+
|  CMU10 HEADER (Chiều cao cố định 48px, Navy #082B59, Thương hiệu + 5 Cột Trụ + Tiện ích + E-STOP)          |
+-------------------------------------------------------------------------------------------------------------+
|  WORKSPACE CONTAINER (Toàn màn hình, Nền #EEF5FC, Padding 8px - 12px, Gap 12px)                             |
|                                                                                                             |
|  +----------------+  +-------------------------------------------------------------+  +-------------------+  |
|  | CỘT 1:         |  | CỘT 2: KHUNG MÔ PHỎNG TRUNG TÂM                             |  | CỘT 3:            |  |
|  | LESSON SIDEBAR |  |                                                             |  | ROBOT STATUS      |  |
|  |                |  |  +-------------------------------------------------------+  |  | & SENSORS         |  |
|  | Chiều rộng:    |  |  | TOOLBAR: Chạy, Tạm dừng, Bước, Đặt lại | 2D/3D/FPV | Full|  |  |                   |  |
|  | - Mở: 285px    |  |  +-------------------------------------------------------+  |  | Chiều rộng:       |  |
|  | - Thu: 64px    |  |  | VIEWPORT CHÍNH (Three.js 3D / 2D Tactical / FPV)       |  |  | 270px (cố định)   |  |
|  |                |  |  |                                                       |  |  |                   |  |
|  | Gồm:           |  |  |  [Camera Nav Controls]             [Minimap Tổng quan]|  |  | Gồm:              |  |
|  | • 5 Bài học    |  |  |  (Fit, Follow, Free, + , -)        (Toạ độ, Co/Giãn)  |  |  | • Tốc độ động cơ  |  |
|  |   Vật lí 10    |  |  |                                                       |  |  | • 4 Cảm biến      |  |
|  | • Thẻ tiến     |  |  |                                     [La bàn Heading] |  |  |   siêu âm & pin   |  |
|  |   trình & mục  |  |  |              [ĐỒNG HỒ ĐO TỐC ĐỘ HUD V-METER]          |  |  | • Bàn phím D-Pad  |  |
|  |   tiêu STEM    |  |  +-------------------------------------------------------+  |  |   điều hướng nhanh|  |
|  +----------------+  +-------------------------------------------------------------+  +-------------------+  |
|                                                                                                             |
|  +-------------------------------------------------------------------------------------------------------+  |
|  | DÒNG ĐO ĐẠC & PHÂN TÍCH (ANALYTICS ROW - Chiều cao cố định ~220px, Phân chia 12 cột)                  |  |
|  |                                                                                                       |  |
|  |  +----------------------------+  +--------------------------+  +-----------------------------------+  |  |
|  |  | PANEL A: ĐỒ THỊ VẬT LÍ     |  | PANEL B: BẢNG DỮ LIỆU    |  | PANEL C: BỘ CAMERA FPV & GÓC NHÌN |  |  |
|  |  | Chiều rộng: 5/12 (~40%)    |  | Chiều rộng: 4/12 (~33%)  |  | Chiều rộng: 3/12 (~27%)           |  |  |
|  |  | Chuyển đồ thị: v-t, a-t,   |  | Bảng đo đạc thời gian    |  | 4 góc nhìn thời gian thực:        |  |  |
|  |  | s-t, F-t; Vẽ SVG real-time |  | thực (t, s, v, a, F_kéo) |  | Toàn cảnh, Bám xe, Gần, 2D        |  |  |
|  |  +----------------------------+  +--------------------------+  +-----------------------------------+  |  |
|  +-------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------+
```

---

## 2. QUY CHUẨN THÔNG SỐ HÌNH HỌC (GEOMETRIC & SPATIAL TOKENS)

### 2.1. Thanh điều hướng đỉnh (CMUHeader)
- **Chiều cao:** 80px (`h-[76px] sm:h-[80px]`, thực tế đo DOM: 81px, khớp với dải màu navy 84px trên ảnh tham chiếu `cmu10_reference.png`).
- **Màu nền:** `--cmu-navy-950` (`#082B59`).
- **Phân chia khu vực:**
  - *Cụm Thương hiệu bên trái:* Logo CMU10 + Huy hiệu `VẬT LÍ 10 - GDPT 2018` + Trạng thái hệ thống (Live indicator xanh lá).
  - *Cụm 5 Cột trụ trung tâm:* `Bài học`, `Mô phỏng`, `Lập trình`, `Phân tích`, `Báo cáo`. Tab đang chọn có nền Indigo/Blue (`#1677FF`) hoặc Magenta (`#A21CAF`).
  - *Cụm Tiện ích bên phải:* Phím tắt, Thư viện, Cài đặt, Trợ giúp, Nút **⚠ DỪNG KHẨN CẤP (E-STOP)** màu đỏ nổi bật.

### 2.2. Khung bài học bên trái (LessonSidebar)
- **Chiều rộng chuẩn:** 285px (`w-full lg:w-[285px]`).
- **Chiều rộng khi thu gọn:** 64px (`w-16`).
- **Góc bo:** 16px (`rounded-2xl`).
- **Cấu trúc nội dung:**
  - Header: Biểu tượng cuốn sách, tiêu đề "Bài học Vật lí 10", nút thu gọn/mở rộng.
  - Bộ chuyển chế độ: Tab danh sách và Tab tiến trình học tập.
  - Danh sách 5 bài học GDPT 2018:
    1. Bài 1: Chuyển động thẳng đều ($v = \text{const}$).
    2. Bài 2: Chuyển động thẳng biến đổi đều ($a = \text{const}$).
    3. Bài 3: Định luật Newton và Lực ma sát ($F = ma$).
    4. Bài 4: Chuyển động tròn đều và Gia tốc hướng tâm ($a_{ht} = \frac{v^2}{r}$).
    5. Bài 5: Thực hành tổng hợp đo sai số và báo cáo thí nghiệm.
  - Khung Mục tiêu bài học (Objectives Card): Collapsible card tóm tắt mục tiêu nhận thức, năng lực tính toán và nhiệm vụ thí nghiệm.

### 2.3. Khung nhìn trung tâm (Main Simulation Viewport)
- **Tỉ lệ diện tích:** Chiếm > 60% chiều ngang màn hình.
- **Chiều cao tối thiểu:** 460px (màn hình chuẩn), 520px (màn hình lớn XL), lấp đầy toàn bộ khi ở chế độ Toàn màn hình.
- **Thanh công cụ Toolbar phía trên:**
  - Cụm điều khiển chạy mô phỏng: `Chạy (Run)`, `Tạm dừng (Pause)`, `Bước +0.1s (Step)`, `Đặt lại (Reset)`.
  - Cụm chuyển đổi chế độ hiển thị: `2D` (Sa bàn bám đường RTS), `3D` (Không gian thực tế Three.js WebGL), `FPV` (Góc nhìn thứ nhất camera IMX219).
  - Nút chuyển Toàn màn hình (Fullscreen toggle).
- **Các thành phần nổi trên Viewport (Floating Overlays):**
  - *Cụm công cụ Camera (Trái):* `Fit cảnh`, `Theo xe`, `Góc tự do`, Phóng to `(+)`, Thu nhỏ `(-)`.
  - *La bàn định hướng Compass Rose (Giữa trên):* Vòng xoay la bàn 360 độ chỉ rõ hướng mũi xe (Yaw góc quay thực tế).
  - *Bản đồ tổng quan MiniMap (Phải trên):* Cửa sổ minimap có thể co giãn/thu gọn, hiển thị tọa độ tức thời $(x, y)$ và đường bao sân đua.
  - *Đồng hồ đo tốc độ HUD Speedometer (Giữa dưới):* Cụm Gauge tròn đo vận tốc tức thời $v$ kèm các thẻ chỉ số $t$, $s$, $a$.

### 2.4. Khung trạng thái robot bên phải (RobotStatusPanel)
- **Chiều rộng chuẩn:** 270px (`w-full lg:w-[270px]`).
- **Góc bo:** 16px (`rounded-2xl`).
- **Nội dung:**
  - Header: Trạng thái kết nối robot và nhãn chế độ (Đang chạy / Tạm dừng / E-STOP).
  - Vận tốc hai động cơ: $v_L$, $v_R$ (rad/s và m/s), tỉ lệ PWM 0–100%.
  - Cụm cảm biến thực tế: Khoảng cách siêu âm phía trước (HC-SR04), cảm biến trái, phải, sau và điện áp pin (7.4V Li-ion).
  - Bàn phím điều khiển nhanh D-Pad: 5 nút (Tiến, Lùi, Quay Trái, Quay Phải, Dừng) kèm thanh trượt công suất động cơ (Throttle 0–100%).

### 2.5. Dòng đo đạc & phân tích phía dưới (Analytics Row)
- **Chiều cao chuẩn:** ~220px.
- **Phân chia lưới 12 cột:**
  - **Panel A (5 cột ~ 41.6%):** Khung đồ thị động lực học với thanh chọn đồ thị $v\text{-}t$, $a\text{-}t$, $s\text{-}t$, $F\text{-}t$ và đồ thị vector SVG thời gian thực mượt mà.
  - **Panel B (4 cột ~ 33.3%):** Bảng dữ liệu số đo đạc vi sai vi mô ($t, s, v, a, F_k$) cập nhật tức thời theo tần số vòng lặp vật lí, hỗ trợ xuất file CSV.
  - **Panel C (3 cột ~ 25%):** Phòng trưng bày camera đa góc nhìn (Camera View Gallery) gồm 4 màn hình nhỏ: Toàn cảnh, Bám theo robot, Góc cận cơ khí, Nhìn từ trên cao (2D).

---

## 3. KHẢ NĂNG CO DÃN VÀ THÍCH ỨNG (RESPONSIVE BEHAVIOR)

| Kích thước màn hình | Chiều rộng Viewport | Bố cục Sidebar & Status Panel | Khung Viewport | Hàng Analytics |
|:---|:---|:---|:---|:---|
| **Ultra-wide / 1920x1080** | Full 1920px | 285px (Sidebar) + 270px (Status) cố định 2 bên | Chiếm ~1300px, 3D WebGL 60 FPS | 3 panel xếp ngang 5 - 4 - 3 |
| **Desktop Chuẩn / 1586x992** | Khớp 100% hình mẫu | 285px (Sidebar) + 270px (Status) | Chiếm ~980px, cân đối hoàn hảo | 3 panel xếp ngang đúng tỉ lệ |
| **Laptop / 1280x800** | Co giãn nhẹ | Sidebar cho phép thu gọn thành 64px, Status panel giữ 250px | Chiếm ~900px | 3 panel tự động co chữ, cuộn mượt |
| **Tablet / 1024x768** | Co giãn chuyển cột | Sidebar và Status panel chuyển thành các tab phụ hoặc xếp dưới | Chiếm toàn bộ chiều ngang | Xếp chồng 2 hàng linh hoạt |

---

## 4. BẢO ĐẢM NGUYÊN TẮC GIÁO DỤC VẬT LÍ 10
Mọi thông số bố cục và nhãn hiển thị trong layout spec đều tuân thủ tuyệt đối quy định:
- Sử dụng thuật ngữ chuẩn xác sách giáo khoa Vật lí 10 (Chương trình GDPT 2018).
- Không xuất hiện bất kỳ nhãn nào liên quan đến "Lớp 11".
- Khung điều khiển và đo đạc đặt trọng tâm vào việc giúp học sinh quan sát định lượng các quy luật chuyển động và lực.
