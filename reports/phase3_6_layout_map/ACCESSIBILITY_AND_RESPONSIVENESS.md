# CMU10 — PHASE 3.6: ACCESSIBILITY & RESPONSIVENESS
## Kiểm Định Tiếp Cận WCAG 2.2 & Khả Năng Đáp Ứng Trên Đa Độ Phân Giải

---

### 1. TUÂN THỦ TIÊU CHUẨN KHẢ NĂNG TIẾP CẬN (WCAG 2.2 AA)

#### A. Kích thước vùng tương tác (Target Size — Success Criterion 2.5.8)
Theo tiêu chuẩn WCAG 2.2 cấp độ AA, kích thước tối thiểu của vùng bấm (Target Size) cho các phần tử tương tác là $24 \times 24\text{ CSS pixels}$ (hoặc có khoảng cách bù trừ đủ lớn).
- Toàn bộ các nút công cụ trên sa bàn và thanh điều khiển Cockpit (`mode-inspect-btn`, `mode-pan-btn`, `mode-goal-btn`, `zoom-in-btn`, `zoom-out-btn`, `fit-all-btn`, `follow-robot-btn`, `focus-goal-btn`, `fullscreen-map-btn`) đều được định dạng với lớp Tailwind `min-h-[24px] min-w-[24px]` hoặc padding tương đương $\ge 28\text{px}$.
- Bộ test tự động của Phase 3.6 đã quét bounding box thực tế của từng nút trong DOM và xác nhận **100% đạt chuẩn $\ge 24\times 24\text{px}$**.

#### B. Thao tác Kéo Di Chuyển (Dragging Movements — Success Criterion 2.5.7)
WCAG 2.2 yêu cầu mọi chức năng sử dụng thao tác kéo (Dragging) phải có giải pháp thay thế bằng một lần bấm (Single Pointer Alternative).
- **Thao tác Pan sa bàn**: Người dùng có thể kéo chuột tự do HOẶC kích hoạt nút `[Kéo]` (Pan mode toggle) để kích hoạt chế độ kéo dễ dàng cho người dùng trackpad / chuột 1 nút.
- **Thao tác Zoom**: Ngoài con lăn chuột (wheel drag), hệ thống cung cấp các nút bấm đơn lẻ `[+]`, `[-]` và nút `[Vừa Khung]` ($100\%$).
- **Thao tác Focus**: Có sẵn nút `[Tâm Robot]` và `[Mục Tiêu]` để căn giữa ngay lập tức mà không cần kéo tìm vị trí thủ công.

#### C. Nhãn Phụ và Trợ Năng Màn Hình (Accessible Name & ARIA)
- Toàn bộ các icon-only button đều được bổ sung thuộc tính `aria-label` tương ứng (ví dụ: `aria-label="Toggle Fullscreen Map"`, `aria-label="Zoom In"`, `aria-label="Focus Robot"`).
- Thuộc tính `title` cung cấp tooltip trực quan giải thích công dụng của nút khi hover.

---

### 2. CHUẨN HÓA HỆ THỐNG CỠ CHỮ VÀ MẬT ĐỘ UI (TYPOGRAPHY HIERARCHY)

Giao diện Phase 3.6 được chuẩn hóa theo hệ phân cấp typographic chặt chẽ, tối ưu diện tích cho sa bàn đua:

| Thành Phần | Cỡ Chữ Chuẩn | Tailwind Class | Minh Họa |
|---|---|---|---|
| Tiêu đề khu vực (Header) | $13 - 14\text{ px}$ | `text-xs sm:text-sm font-black` | `JETBOT VIRTUAL LAB` |
| Nút điều khiển chính | $11 - 12\text{ px}$ | `text-xs font-bold` | `Chạy (Run)`, `E-STOP` |
| Nút điều khiển sa bàn | $11\text{ px}$ | `text-[11px] font-bold` | `Quan Sát`, `Kéo`, `Mục Tiêu` |
| Nhãn phụ và HUD sa bàn | $10 - 11\text{ px}$ | `text-[10px] font-mono` | `3.0m x 2.0m`, `X: 0.12m \| Z: -0.45m` |
| Chỉ số Telemetry Strip | $11\text{ px}$ | `text-[11px] font-mono` | `T: 12.4s \| POS: (-0.80, 0.00)m` |

---

### 3. KIỂM THỬ KHẢ NĂNG ĐÁP ỨNG TRÊN CÁC ĐỘ PHÂN GIẢI (RESPONSIVE VIEWPORTS)

Hệ thống đã được kiểm tra thực tế bằng Playwright trên 4 độ phân giải tiêu chuẩn:

| Độ Phân Giải | Thiết Bị Đại Diện | Trạng Thái Bố Cục | Tràn Khung Ngang (Horizontal Scroll) | Kết Quả |
|---|---|---|---|---|
| $1920 \times 1080$ | Màn hình Desktop Full HD | Tối ưu không gian hiển thị sa bàn tối đa, thanh HUD trải rộng | $0\text{ px}$ (Không tràn) | **PASS** |
| $1440 \times 900$ | Màn hình Laptop tiêu chuẩn | Tỷ lệ chuẩn 60/40 giữa sân đua và các bảng điều khiển phụ | $0\text{ px}$ (Không tràn) | **PASS** |
| $1280 \times 800$ | Màn hình Laptop nhỏ / MacBook | Thanh công cụ tự động ẩn các chữ chú thích phụ, giữ nguyên icon | $0\text{ px}$ (Không tràn) | **PASS** |
| $1024 \times 768$ | Máy tính bảng / Màn hình trường học | Bố cục dạng ngăn xếp gọn gàng, D-Pad và Console cuộn linh hoạt | $0\text{ px}$ (Không tràn) | **PASS** |
