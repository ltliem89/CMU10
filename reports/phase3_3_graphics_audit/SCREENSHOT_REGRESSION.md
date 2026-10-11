# ĐỐI CHIẾU HÌNH ẢNH & KIỂM THỬ HỒI QUY THỊ GIÁC (SCREENSHOT REGRESSION)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Visual Regression & Frame Inspection  
**Thư mục lưu trữ hình ảnh**: `reports/phase3_3_graphics_audit/screenshots/`

---

## 1. Danh Mục Toàn Bộ Hình Ảnh Chụp Runtime

Được thu thập tự động thông qua Playwright Engine (Microsoft Edge Chromium, Headless with WebGL acceleration):

| STT | Tên File Hình Ảnh | Kích Thước | Danh Mục | Trạng Thái Hiển Thị & Bằng Chứng |
|:---:|:---|:---:|:---:|:---|
| 1 | `baseline_cockpit_standard_1440.png` | 1440 × 900 | Baseline Layout | Bố cục chuẩn: Sa bàn 2D lớn bên trái, cột phụ 3D & FPV bên phải, D-Pad bên dưới. Phát hiện: Panel 3D hiển thị fallback 2.5D. |
| 2 | `layout_standard.png` | 1440 × 900 | Layout Mode | Tương tự baseline, tỷ lệ 62% sa bàn / 38% cụm 3D-FPV. |
| 3 | `layout_focus.png` | 1440 × 900 | Layout Mode | Vùng mô phỏng mở rộng chiếm ~82% chiều cao, thanh Sidebar tự động thu gọn về icon 64px, ẩn D-Pad. |
| 4 | `layout_split_view.png` | 1440 × 900 | Layout Mode | Phân chia 50:50 không gian giữa sa bàn và cụm 3D/FPV có thanh trượt ngăn cách. |
| 5 | `layout_triple_view.png` | 1440 × 900 | Layout Mode | Ba khung nhìn đồng thời, tỷ lệ phân chia cân bằng. |
| 6 | `layout_pip.png` | 1440 × 900 | Layout Mode | Sa bàn mở rộng toàn bộ màn hình, cửa sổ FPV Camera hiển thị dưới dạng khung nổi có thể kéo rê bằng chuột. |
| 7 | `layout_fullscreen.png` | 1440 × 900 | Layout Mode | Mở rộng 100vw × 100vh, ẩn toàn bộ navigation bên ngoài và các panel D-Pad dưới chân. |
| 8 | `cad_realistic.png` | 1440 × 900 | CAD Mode | Chế độ Thực tế (PBR): Giao diện 3D rơi vào fallback do RangeError stack overflow. |
| 9 | `cad_wireframe.png` | 1440 × 900 | CAD Mode | Chế độ Khung Dây: Trạng thái cờ `internalMode === 'wireframe'`. |
| 10 | `cad_components.png` | 1440 × 900 | CAD Mode | Chế độ Linh Kiện: Kích hoạt ngăn kéo chi tiết linh kiện CAD bên dưới canvas. |
| 11 | `cad_collision.png` | 1440 × 900 | CAD Mode | Chế độ Va Chạm: Kích hoạt bảng phân tích hình học vùng bao va chạm (Collision Hull). |
| 12 | `cad_coordinates.png` | 1440 × 900 | CAD Mode | Chế độ Tọa Độ XYZ: Kích hoạt hệ trục tọa độ tại trọng tâm robot. |
| 13 | `cad_sensors.png` | 1440 × 900 | CAD Mode | Chế độ Cảm Biến: Kích hoạt nón FOV camera 160° và góc quét siêu âm 30°. |
| 14 | `cad_dimensions.png` | 1440 × 900 | CAD Mode | Chế độ Kích Thước CAD: Kích hoạt bảng thông số cơ khí 138x125x130 mm chuẩn ISO. |
| 15 | `fpv_camera_view.png` | 1440 × 900 | FPV Camera | Góc nhìn camera mắt thần. Canvas WebGL hiển thị đường chạy, vạch vàng và tâm ngắm AI Aim Pixel. |
| 16 | `viewport_desktop_1080p.png` | 1920 × 1080 | Responsive | Màn hình Full HD: Canvas mở rộng 450×340px (3D) và 497×200px (FPV), không bị vỡ bố cục. |
| 17 | `viewport_laptop_1366.png` | 1366 × 768 | Responsive | Màn hình laptop phổ thông 1366×768: Giao diện thích ứng tốt, các thanh cuộn hoạt động mượt mà. |
| 18 | `viewport_tablet_1024.png` | 1024 × 768 | Responsive | Màn hình máy tính bảng 1024×768: Chiều rộng co lại, các nút bấm vẫn giữ kích thước chạm (touch target $\ge 40\text{px}$). |
| 19 | `viewport_mobile_412.png` | 412 × 915 | Responsive | Màn hình di động dọc: Bố cục tự động chuyển sang ngăn xếp dọc (stacked flex), không tràn ngang. |

---

## 2. Phân Tích Bằng Chứng Thị Giác (Visual Evidence Analysis)

### 2.1. Bằng Chứng Lỗi Fallback 2.5D Của 3D Canvas
Quan sát file `layout_fullscreen.png` và `cad_realistic.png`:
- Ở ô **Robot JetBot 3D Twin**: Thay vì hiển thị mô hình 3D xoay của xe JetBot, vùng canvas lại hiển thị biểu tượng hộp Cyan cùng tiêu đề:
  `Mô Phỏng 2.5D Chuẩn CMU10 - Môi trường trình duyệt đang tắt tăng tốc phần cứng WebGL...`
- **Nguyên nhân kỹ thuật đã xác minh**: Không phải do GPU thiếu WebGL (bằng chứng là Canvas 1 của FPV Camera vẫn render WebGL 2.0 bình thường), mà do lỗi đệ quy stack overflow khi khởi tạo `wireframeObjects` trong `Robot3DCanvas.tsx:682`.

### 2.2. Bằng Chứng Co Hẹp Khung FPV Camera
Quan sát file `baseline_cockpit_standard_1440.png` và `fpv_camera_view.png`:
- Khung **Camera FPV Thực Tế** có chiều cao tổng cộng ~200px.
- Phần header gồm:
  - Thanh tiêu đề bar (40px)
  - Card "Khung C: Camera FPV Thực (Góc Nhìn Thứ Nhất)" kèm badge LIVE 30FPS và AI Overlay (50px)
- Vùng canvas WebGL còn lại bị nén xuống chỉ còn một khe hẹp ngang ~40–60px, khiến người xem chỉ thấy vệt ngắm AI mà không bao quát được toàn bộ cung đường đua 3D.
- **Yêu cầu nâng cấp thị giác**: Tích hợp HUD FPV thành lớp phủ OSD (On-Screen Display) nằm ngay trên mặt canvas để trả lại 100% diện tích chiều cao cho góc nhìn camera.
