# CMU10 — PHASE 3.6: TEST RESULTS
## Báo Cáo Kiểm Định Thực Tế & Ma Trận Kiểm Thử Tự Động Playwright

**Thời gian kiểm định:** 2026-10-11T15:30:20+07:00  
**Tập lệnh kiểm thử chính:** `scripts/verify_phase3_6_layout_map.mjs`  
**Môi trường:** Chromium Headless (WebGL ANGLE SwiftShader enabled)  
**Tổng số ca kiểm thử:** 17/17 Suites  
**Tỷ lệ đạt:** **100% PASS**  
**Lỗi Console phát sinh:** 0  
**Bộ nhớ JS Heap:** 51 MB / 78 MB  

---

### 1. MA TRẬN 17 CA KIỂM THỬ GIAI ĐOẠN 3.6

| STT | Tên Ca Kiểm Thử | Mục Tiêu & Phương Pháp Đo | Kết Quả Đo Đạc Thực Tế | Trạng Thái |
|---|---|---|---|:---:|
| 1 | **WCAG 2.2 Target Size Compliance** | Kiểm tra kích thước bounding box của tất cả nút bản đồ ($\ge 24 \times 24\text{px}$) | Toàn bộ 7 nhóm nút đo đạc $\ge 24\text{px}$ chiều rộng và cao | **PASS** |
| 2 | **Map Zoom In/Out Buttons** | Bấm nút `[+]` và `[-]`, đọc nhãn phần trăm zoom | $100\% \longrightarrow 125\% \longrightarrow 80\%$ | **PASS** |
| 3 | **Wheel Zoom Focal Anchoring** | Cuộn con lăn chuột trên SVG, kiểm tra thay đổi zoom mượt | $92\% \longrightarrow 78\%$ mà không giật khung | **PASS** |
| 4 | **Pan Mode Drag** | Bật chế độ Pan Mode và kéo chuột 60x40 pixel | Dịch chuyển ma trận SVG: `translate(9.31, 8.52) scale(1)` | **PASS** |
| 5 | **Space + Left Click Pan** | Nhấn giữ phím Space và kéo chuột trái | Dịch chuyển ma trận SVG: `translate(-7.76, -6.39) scale(1)` | **PASS** |
| 6 | **Drag Threshold (>5px) Defense** | Kéo chuột 35px trong chế độ Goal/Pan, xác minh không vô tình đặt Goal | $0$ mục tiêu được tạo trên sự kiện nhả chuột | **PASS** |
| 7 | **Click-to-Goal Accuracy** | Bấm chọn điểm an toàn trên sa bàn, kiểm tra tọa độ hiển thị | Điểm đích tạo chính xác: $X = -0.28\text{m}, Z = 0.10\text{m}$ ($d=0.53\text{m}$) | **PASS** |
| 8 | **Invalid Goal Collision Check** | Bấm chọn điểm nằm trong vật cản LEGO ($X=0.35, Z=0.15$) | Hệ thống từ chối và cảnh báo: `Va chạm vật cản: Khối LEGO Vàng` | **PASS** |
| 9 | **Observation Modes Transition** | Bật Follow Robot, sau đó pan thủ công để kiểm tra tự ngắt | Tự động chuyển từ `Đang Theo` sang `Theo Robot` (Free mode) | **PASS** |
| 10 | **Map Fullscreen & Restore** | Bật toàn màn hình bản đồ và khôi phục về kích thước cũ | Toàn màn hình mở rộng không làm vỡ WebGL / SVG canvas | **PASS** |
| 11 | **Responsive Viewports** | Kiểm tra hiển thị tại 1920x1080, 1440x900, 1280x800, 1024x768 | $0$ thanh cuộn ngang ngoài ý muốn trên toàn bộ độ phân giải | **PASS** |
| 12 | **Multi-viewport Pose Sync** | Đối chiếu tọa độ robot hiển thị trên 2D Map và Telemetry Strip | Khớp nối $100\%$ dữ liệu $X, Z, \text{yaw}$ trong thời gian thực | **PASS** |
| 13 | **Pan/Zoom Physics Isolation** | Đo vận tốc động cơ và tọa độ robot trong suốt quá trình zoom/pan | Vận tốc đo được: $v = 0.00\text{ m/s}, \omega = 0.00\text{ rad/s}$ | **PASS** |
| 14 | **E-STOP Safety Priority** | Bấm nút E-STOP khi robot đang chạy | Hệ thống hãm phanh tức thì, ngắt động cơ và chuyển sang dừng | **PASS** |
| 15 | **Pointer Cancellation Cleanup** | Phát sự kiện `pointercancel` nhân tạo | Bộ lắng nghe giải phóng sạch sẽ, không kẹt trạng thái kéo | **PASS** |
| 16 | **Console Error Free** | Ghi nhận lỗi console của browser trong toàn bộ phiên test | **$0$ uncaught console errors** | **PASS** |
| 17 | **Regression Compliance** | Kiểm tra chế độ Triple View, 7 CAD mode và sidebar menu | Đạt $100\%$ tiêu chuẩn kiểm định của Phase 3.4 & Phase 3.5 | **PASS** |

---

### 2. KẾT QUẢ KIỂM THỬ HỒI QUY TOÀN BỘ (FULL REGRESSION SUITE)

- **Phase 3.5 Test Suite (`verify_phase3_5_map_control.mjs`)**:
  - Kết quả: **12/12 PASS (100%)**
  - Console Errors: 0
  - Thời gian chạy: ~30 giây
- **Phase 3.4 Test Suite (`verify_phase3_4_fidelity.mjs`)**:
  - Kết quả: **7/7 PASS (100%)**
  - Chu kỳ chuyển layout: 20/20 thành công
  - 7 chế độ CAD inspection: Wireframe, Components, Collision, Coordinates, FOV, Dimensions, Realistic hoạt động hoàn hảo.
  - Console Errors: 0
- **TypeScript Compiler (`npm run lint` / `tsc --noEmit`)**:
  - Exit code: 0 (0 errors, 0 warnings).
- **Vite Production Bundler (`npm run build`)**:
  - Exit code: 0 (Build thành công trong 551ms).
