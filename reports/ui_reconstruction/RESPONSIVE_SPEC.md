# CMU10 — BÁO CÁO THÍCH ỨNG ĐA THIẾT BỊ (RESPONSIVE SPECIFICATION)
## Kiểm định và Quy chuẩn Hiển thị trên Màn hình Desktop, Laptop và Tablet

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu chuẩn:** Phase B Master UI Reconstruction
- **Phiên bản:** V1.0
- **Ngày lập:** 11/10/2026

---

## 1. CÁC ĐIỂM NGẮT THIẾT KẾ (RESPONSIVE BREAKPOINTS)

Hệ thống CMU10 được kiểm định trên 5 độ phân giải đại diện cho thiết bị học tập trong trường phổ thông:

```
+-------------------------------------------------------------------------------------------------------------+
| Độ Phân Giải | Loại Thiết Bị              | Trạng Thái Viewport               | Screenshot Kiểm Chứng       |
+-------------------------------------------------------------------------------------------------------------+
| 1586 × 992   | Desktop Chuẩn (Khớp mẫu)   | 3 cột đầy đủ (285px - Flex - 270px)| 16_responsive_desktop_...   |
| 1536 × 960   | Màn hình máy trạm lab      | Cân đối hoàn hảo, 3D 60 FPS       | 01_simulation_reference_... |
| 1440 × 900   | Màn hình phổ biến          | Tự động co dãn Viewport linh hoạt | Baseline verified           |
| 1280 × 800   | Laptop học sinh (13-14")   | Sidebar cho phép co thành 64px    | 17_responsive_laptop_...    |
| 1024 × 768   | Máy tính bảng / iPad       | Cột chuyển xếp tầng mượt mà       | 18_responsive_tablet_...    |
+-------------------------------------------------------------------------------------------------------------+
```

---

## 2. QUY TẮC CO GIÃN THÀNH PHẦN (COMPONENT ADAPTATION RULES)

### 2.1. Thanh điều hướng đỉnh (CMUHeader)
- Trên Desktop ($\ge 1280\text{px}$): Hiển thị đầy đủ nhãn văn bản của 5 Cột Trụ và các nút Tiện ích.
- Dưới $1280\text{px}$: Tự động rút gọn nhãn, giữ lại icon trực quan và nhãn chính để tránh tràn thanh menu.
- Nút E-STOP màu đỏ luôn giữ nguyên vị trí và kích thước nổi bật bất kể kích thước màn hình.

### 2.2. Khung mô phỏng và Thanh bên (LessonSidebar & RobotStatusPanel)
- Khi chiều rộng màn hình $< 1200\text{px}$, `LessonSidebar` kích hoạt nút thu gọn thành thanh icon gọn gàng ($64\text{px}$), giải phóng tối đa không gian cho Viewport 3D.
- `RobotStatusPanel` chuyển đổi các hàng chỉ số sang bố cục 2 cột compact, đảm bảo không có hiện tượng vỡ khung hay thanh cuộn ngang ngoài ý muốn.

### 2.3. Hàng đo đạc phân tích (Analytics Row)
- Trên màn hình rộng ($\ge 1280\text{px}$): Phân chia lưới ngang 5 cột (Đồ thị) + 4 cột (Bảng số liệu) + 3 cột (Camera).
- Dưới $1280\text{px}$: Tự động xếp chồng dọc (stack) hoặc cho phép cuộn ngang có chỉ báo vuốt chạm mượt mà.

---

## 3. KẾT LUẬN KIỂM ĐỊNH
Toàn bộ các chế độ co giãn đã được chụp màn hình tự động bằng Playwright và lưu trữ tại thư mục `reports/phase_b/screenshots/` (file 16, 17, 18). Hệ thống đạt độ ổn định hiển thị $100\%$ không phát sinh lỗi tràn khung (no horizontal scrollbar leak).
