# BÁO CÁO 02: MA TRẬN TÍNH NĂNG TOÀN DIỆN (FEATURE INVENTORY MATRIX)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10 STEM)

> **Mục tiêu tài liệu**: Bảng kiểm kê chi tiết từng tính năng hiện hữu của CMU10, phân loại trạng thái hoạt động thực tế (`VERIFIED_WORKING`, `IMPLEMENTED_UNVERIFIED`, `UI_ONLY`, `BROKEN`, `DUPLICATED`), chỉ ra các thành phần trùng lặp và đề xuất định hướng tái cấu trúc cho Phase B.

---

## 1. Bảng Ma Trận Tính Năng Hệ Thống

| Mã | Tên Tính Năng | Nhóm Chức Năng | Component Phụ Trách | Trạng Thái Audit | Mô Tả Hành Vi & Kiểm Định Thực Tế | Đề Xuất Redesign Phase B |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F01** | Bố cục Chuẩn (Standard Layout) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Khung 3D lớn chiếm ưu thế, sa bàn 2D và FPV xếp dọc bên phải, D-Pad và Console nằm phía dưới | **KEEP** — Giữ làm layout mặc định của phòng thí nghiệm |
| **F02** | Bố cục Tập Trung (Focus Layout) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Tự động thu gọn thanh bên (56px) và ẩn panel D-Pad/Console, dành 80% diện tích cho mô phỏng | **KEEP** — Tối ưu cho chế độ trình chiếu giảng bài |
| **F03** | Bố cục Chia Đôi (Split View) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Chia 50:50 giữa mô phỏng 3D/2D và khu vực quan sát lệnh/telemetry | **KEEP** — Rất phù hợp khi học sinh code và quan sát |
| **F04** | Bố cục Ba Khung (Triple View) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Xếp ngang 3 viewport: Sa bàn đua 2D, Robot 3D Twin và Camera FPV cùng tỉ lệ | **KEEP** — Rất trực quan khi giảng về sự tương quan tọa độ |
| **F05** | Hình trong Hình (PiP Mode) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Viewport chính cực đại, camera FPV nổi dạng thumbnail (300x200) có thể kéo thả di chuyển | **KEEP** — Giữ và thêm tính năng snap góc màn hình |
| **F06** | Toàn Màn Hình (Fullscreen) | Không gian mô phỏng | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Buồng lái chiếm 100vw x 100vh, cố định z-index 50, ẩn hoàn toàn header và sidebar | **KEEP** — Phím tắt `Esc` thoát nhanh hoạt động tốt |
| **F07** | Phóng to riêng khung (Maximize Viewport) | Độc lập Viewport | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Nút Maximize trên từng viewport (2D, 3D, FPV) cho phép bung rộng riêng khung đó | **KEEP** — Giữ nguyên logic |
| **F08** | Kéo thả đổi vị trí khung (Drag/Drop Viewport) | Bố cục linh hoạt | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Cho phép kéo grip header của khung (Map/3D/FPV) thả vào slot khác để hoán đổi | **KEEP** — Thêm visual highlight khi kéo |
| **F09** | Khôi phục bố cục (Reset Layout) | Quản lý giao diện | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Đưa toàn bộ chia tỉ lệ, vị trí PiP, các panel ẩn/hiện về trạng thái mặc định | **KEEP** — Đặt ở vị trí dễ thấy trên thanh công cụ |
| **F10** | D-Pad Điều Khiển Thủ Công | Điều khiển Robot | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Nút Tiến, Lùi, Rẽ Trái, Rẽ Phải, Xoay Tại Chỗ, Dừng. Tương tác mượt, ghi nhận telemetry | **KEEP** — Thu gọn kích thước nút cho cân đối |
| **F11** | Thanh Trượt Motor (Sliders) | Điều khiển Robot | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Điều chỉnh tốc độ động cơ trái/phải độc lập [-1.0 .. 1.0], đồng bộ PWM [0..100%] | **KEEP** — Cần hiển thị rõ giá trị số bên cạnh |
| **F12** | Điều khiển phím mũi tên | Điều khiển Robot | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | ArrowUp (Tiến), ArrowDown (Lùi), ArrowLeft (Quay trái), ArrowRight (Quay phải) | **KEEP** — Bổ sung tooltip nhắc phím tắt |
| **F13** | Dừng Khẩn Cấp (E-STOP) | An toàn hệ thống | `App.tsx` + `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Nút đỏ nổi bật ở header và cockpit, phím tắt `Spacebar`, ngắt PWM = 0 ngay lập tức, mở modal cảnh báo | **KEEP** — Bắt buộc giữ làm tiêu chuẩn an toàn |
| **F14** | Vận Hành Mô Phỏng: Run/Pause/Step/Reset | Quản lý thời gian | `useSimulationStore.ts` | `VERIFIED_WORKING` | Run (chạy liên tục), Pause (dừng tạm thời), Step (+0.1s), Reset (về gốc tọa độ x=-0.8, z=0) | **KEEP** — Đảm bảo tích hợp vật lí thời gian thực |
| **F15** | Sa Bàn 2D: Pan & Zoom | Định vị không gian | `TacticalArenaMap.tsx` | `VERIFIED_WORKING` | Cuộn chuột non-passive, kéo chuột (Pointer capture), nút Zoom In/Out, Fit All | **KEEP** — Phản hồi mượt mà không bị giật khung hình |
| **F16** | Sa Bàn 2D: Click-to-Goal | Dẫn đường tự động | `TacticalArenaMap.tsx` | `VERIFIED_WORKING` | Bấm chuột lên sa bàn đặt đích đến, kiểm tra va chạm vật cản, hiển thị cọc tiêu đích | **KEEP** — Tính năng tương tác cao rất giá trị |
| **F17** | Sa Bàn 2D: Follow Robot / Focus | Góc nhìn quan sát | `TacticalArenaMap.tsx` | `VERIFIED_WORKING` | Tự động bám theo robot khi di chuyển, hoặc căn giữa vào robot / đích đến | **KEEP** — Hoạt động chuẩn xác |
| **F18** | Robot 3D: PBR Material & Shadows | Đồ họa kỹ thuật số | `Robot3DCanvas.tsx` | `VERIFIED_WORKING` | Khung nhôm anot hóa, bánh xe cao su, Jetson Nano, tản nhiệt, đổ bóng mềm PCFShadow | **KEEP** — Chất lượng render cao, ổn định 60fps |
| **F19** | Robot 3D: 7 Chế Độ Kiểm Tra CAD | Khám phá cấu tạo | `Robot3DCanvas.tsx` | `VERIFIED_WORKING` | Realistic, Wireframe, Components Exploded, Collision AABB, Axes XYZ, Sensor FOV, Dimensions | **KEEP** — Tính năng sư phạm cực kỳ xuất sắc |
| **F20** | Robot 3D: Quay Quanh & Zoom (Orbit) | Tương tác 3D | `Robot3DCanvas.tsx` | `VERIFIED_WORKING` | Kéo chuột xoay quanh robot, lăn chuột zoom, các nút góc nhìn Top/Front/Side/Reset | **KEEP** — Điều hướng mượt mà |
| **F21** | Camera FPV Thời Gian Thực | Cảm biến thị giác | `DynamicCameraFPV.tsx` | `VERIFIED_WORKING` | Góc nhìn người thứ nhất gắn trên mũi xe, hiển thị tâm ngắm, góc mở FOV 160 độ, phát hiện vật cản | **KEEP** — Tăng cảm giác chân thực của xe |
| **F22** | Telemetry HUD Strip | Dữ liệu thời gian thực | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Dải chỉ số cách ly: Thời gian T (s), Vị trí (x, z) m, Hướng Yaw (độ), PWM L/R (%) | **KEEP** — Độc lập re-render, không gây drop FPS |
| **F23** | Console: Telemetry Logs | Nhật ký vận hành | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Danh sách dòng lệnh và sự kiện cảm biến theo thời gian, có màu phân loại | **KEEP** — Hỗ trợ debug bài tập |
| **F24** | Console: Python Active Code | Lập trình | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Hiển thị đoạn mã Python tương ứng với hành động hiện tại, nút Copy Code | **KEEP** — Rất trực quan cho học sinh học Python |
| **F25** | Console: Signal Flow Pipeline | Phần cứng & Tín hiệu | `TripleViewCockpit.tsx` | `VERIFIED_WORKING` | Luồng tín hiệu: Python Runtime -> I2C -> PCA9685 -> TB6612 -> Motor TT -> Bánh xe | **KEEP** — Tốt cho giáo dục STEM phần cứng |
| **F26** | Bản Đồ Kiến Thức (Knowledge Map) | Bài học lý thuyết | `KnowledgeMap.tsx` | `VERIFIED_WORKING` | Sơ đồ mạng lưới 12 module kết nối theo cụm kiến thức, trạng thái hoàn thành | **RELOCATE** — Đưa vào nhóm menu **Bài Học** |
| **F27** | Chi Tiết 12 Module Bài Học | Bài học lý thuyết | `ModuleDetailView.tsx` | `VERIFIED_WORKING` | Chi tiết mục tiêu Vật lí 10, công thức, bài toán mẫu, code mẫu của từng module M1-M12 | **RELOCATE** — Đưa vào nhóm menu **Bài Học** |
| **F28** | Bộ Mô Phỏng 2 Động Cơ Cũ | Mô phỏng cục bộ | `RobotTwinMotorSimulator.tsx` | `DUPLICATED` | Thành phần cũ 83KB có bộ điều khiển motor và telemetry riêng, đang nhúng trong `ModuleDetailView` | **MERGE / REFACTOR** — Trùng lặp lớn, cần hợp nhất |
| **F29** | Camera Simulator (Annotation/Inference) | Trí tuệ nhân tạo | `CameraSimulator.tsx` | `VERIFIED_WORKING` | Giao diện gán nhãn ảnh (Bounding box / Điểm tránh vật cản) và dự đoán AI | **RELOCATE** — Đặt trong bài học thị giác máy tính |
| **F30** | Sơ Đồ Quy Trình Chi Tiết | Phần cứng & Hệ thống | `PipelineDiagram.tsx` | `VERIFIED_WORKING` | Sơ đồ khối chi tiết các tầng phần cứng máy tính nhúng NVIDIA Jetson Nano | **RELOCATE** — Gộp vào tab **Bài Học / Phần Cứng** |
| **F31** | Thư Viện Hàm & API JetBot | Lập trình | `FunctionExplorer.tsx` | `VERIFIED_WORKING` | Tra cứu 30+ hàm Python, tìm kiếm, lọc theo module, xem cú pháp và ví dụ | **RELOCATE** — Đưa vào nhóm menu **Lập Trình** |
| **F32** | Đồ Thị Huấn Luyện AI (Loss/MSE) | Phân tích dữ liệu | `TrainingChartsView.tsx` | `VERIFIED_WORKING` | Biểu đồ đường huấn luyện mô hình bám làn (Epoch, Train Loss, Val Loss) | **RELOCATE** — Đưa vào nhóm menu **Phân Tích** |
| **F33** | Thí Nghiệm Nếu-Như (What-If) | Thí nghiệm Vật lí | `WhatIfPlayground.tsx` | `VERIFIED_WORKING` | Thanh trượt đổi ma sát $\mu$, khối lượng $m$, độ trễ, sai số để xem tác động vật lí | **RELOCATE** — Đưa vào nhóm menu **Phân Tích / Thí Nghiệm** |
| **F34** | Trắc Nghiệm Tương Tác (Quiz) | Đánh giá kiến thức | `QuizPanel.tsx` | `VERIFIED_WORKING` | 10 câu hỏi trắc nghiệm Vật lí 10 & Robotics, chọn đáp án, giải thích chi tiết, chấm điểm | **RELOCATE** — Đưa vào nhóm menu **Báo Cáo & Đánh Giá** |
| **F35** | Từ Điển Thuật Ngữ (Glossary) | Tài liệu tra cứu | `GlossaryView.tsx` | `VERIFIED_WORKING` | Tra cứu định nghĩa thuật ngữ kỹ thuật, lọc theo từ khóa | **RELOCATE** — Đưa vào menu phụ **Trợ Giúp / Tra Cứu** |
| **F36** | Nguồn & Lưu Ý Kỹ Thuật | Tài liệu tra cứu | `SourcesAndCaveats.tsx` | `VERIFIED_WORKING` | Danh mục tài liệu tham khảo, cảnh báo nguồn điện 5V/4A, pin Li-ion 18650 | **RELOCATE** — Đưa vào menu phụ **Trợ Giúp / Tài Liệu** |
| **F37** | Chuyển Đổi Dark / Light Mode | Cá nhân hóa UI | `App.tsx` | `VERIFIED_WORKING` | Chuyển đổi giao diện Sáng / Neon Phòng Thí Nghiệm Đêm, đổi class Tailwind | **KEEP** — Đặt gọn tại thanh tiện ích trên cùng |
| **F38** | Điều Chỉnh Cỡ Chữ (Font Size) | Trợ năng (A/A+/A++) | `App.tsx` | `VERIFIED_WORKING` | 3 mức: Chuẩn (17.5px), Lớn (19.5px), Cực Lớn (21.5px) cho học sinh quan sát từ xa | **KEEP** — Giữ trên thanh tiện ích trên cùng |
| **F39** | Hộp Thoại Nghiệm Thu Cơ Khí | Kiểm định phần cứng | `MechanicalAcceptanceModal.tsx` | `IMPLEMENTED_UNVERIFIED` | Checklist nghiệm thu động cơ, bánh xe, khung sườn JetBot; hiện chỉ gọi từ simulator cũ | **MERGE** — Đưa vào mục Kiểm Định Phần Cứng |

---

## 2. Vấn Đề Trọng Yếu: Sự Trùng Lặp Của 2 Bộ Mô Phỏng (Dual-Simulator Redundancy)

Kiểm toán mã nguồn phát hiện một vấn đề kiến trúc lớn cần giải quyết trong Phase B:

1. **Bộ mô phỏng 1: `TripleViewCockpit.tsx` (Chính & Hiện Đại Nhất)**:
   - Sử dụng `useSimulationStore.ts` làm Single Source of Truth.
   - Quản lý đồng bộ: Sa bàn 2D, Robot 3D Three.js, Camera FPV, D-Pad, Telemetry, Code Active.
   - Có 6 chế độ bố cục, hỗ trợ phóng to, kéo thả, thu nhỏ, kiểm tra CAD.
2. **Bộ mô phỏng 2: `RobotTwinMotorSimulator.tsx` (Legacy, 83.3 KB, 1,653 dòng)**:
   - Quản lý `leftSpeed`, `rightSpeed` và log sự kiện trong state nội bộ riêng biệt.
   - Được nhúng nhiều lần trong `ModuleDetailView.tsx` (tại các dòng 143, 172, 179).
   - Dẫn đến việc khi học sinh chạy robot ở `ModuleDetailView`, trạng thái robot không được đồng bộ với `TripleViewCockpit` và `useSimulationStore`.
- **Khuyến nghị Phase B**: Tái sử dụng `TripleViewCockpit` hoặc trích xuất component điều khiển động cơ dùng chung từ `useSimulationStore`, loại bỏ sự trùng lặp 83KB của `RobotTwinMotorSimulator.tsx`.
