# BÁO CÁO KIỂM KÊ TÍNH NĂNG TOÀN HỆ THỐNG (PHASE B)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10)

> **Mục tiêu**: Bảng kiểm kê đầy đủ toàn bộ 39 tính năng đang có trong mã nguồn CMU10, xác định state owner, rủi ro hồi quy và vị trí mới tương ứng với hình tham chiếu chuẩn.

---

## Bảng Kiểm Kê Chi Tiết 39 Tính Năng

| Mã ID | Tên Chức Năng | Component Cũ | State Owner / Store | Trạng Thái | Vị Trí Mới (Hình Tham Chiếu) | Hành Động | Rủi Ro Hồi Quy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F01** | Bố cục Chuẩn (Standard Layout) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Khung mô phỏng trung tâm | `KEEP` | Thấp |
| **F02** | Bố cục Tập Trung (Focus Layout) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Nút thu gọn sidebar/panel | `KEEP` | Thấp |
| **F03** | Bố cục Chia Đôi (Split View) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Phân tích chia cột | `KEEP` | Thấp |
| **F04** | Bố cục Ba Khung (Triple View) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Camera gallery 2x2 | `MERGE` | Thấp |
| **F05** | Hình trong Hình (PiP Mode) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Bản đồ tổng quan nổi | `MERGE` | Thấp |
| **F06** | Toàn Màn Hình (Fullscreen) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Nút Fullscreen toolbar | `KEEP` | Thấp |
| **F07** | Phóng to riêng khung (Maximize) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Nút bung rộng minimap/gallery | `KEEP` | Thấp |
| **F08** | Kéo thả đổi vị trí khung | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Layout responsive linh hoạt | `KEEP` | Thấp |
| **F09** | Khôi phục bố cục (Reset Layout) | `TripleViewCockpit.tsx` | Local State | `VERIFIED` | Nút Reset góc toolbar | `KEEP` | Thấp |
| **F10** | D-Pad Điều Khiển Thủ Công | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Panel Phải -> Điều khiển nhanh | `RELOCATE` | Thấp |
| **F11** | Thanh Trượt Motor (Sliders) | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Panel Phải -> Slider Tốc độ | `RELOCATE` | Thấp |
| **F12** | Điều Khiển Bằng Bàn Phím | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Phím mũi tên / WASD toàn cục | `KEEP` | Thấp |
| **F13** | Dừng Khẩn Cấp (E-STOP) | `App.tsx` + `Cockpit` | `useSimulationStore` | `VERIFIED` | Header góc phải (Nút Đỏ) + Spacebar | `KEEP` | Rất Thấp |
| **F14** | Vận Hành: Run/Pause/Step/Reset | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Toolbar Mô Phỏng (4 nút màu) | `RELOCATE` | Thấp |
| **F15** | Sa Bàn 2D: Pan & Zoom | `TacticalArenaMap.tsx` | `TacticalArenaMap` | `VERIFIED` | Bản đồ tổng quan (Minimap) | `MERGE` | Thấp |
| **F16** | Sa Bàn 2D: Click-to-Goal | `TacticalArenaMap.tsx` | `useSimulationStore` | `VERIFIED` | Minimap & Viewport | `KEEP` | Trung bình |
| **F17** | Sa Bàn 2D: Follow Robot / Focus | `TacticalArenaMap.tsx` | `TacticalArenaMap` | `VERIFIED` | Cụm nút camera bên trái viewport | `RELOCATE` | Thấp |
| **F18** | Robot 3D: PBR Material & Shadows | `Robot3DCanvas.tsx` | Three.js Scene | `VERIFIED` | Viewport trung tâm (Chế độ 3D) | `KEEP` | Thấp |
| **F19** | Robot 3D: 7 Chế Độ CAD Inspection | `Robot3DCanvas.tsx` | Three.js Scene | `VERIFIED` | Chế độ quan sát 3D / CAD | `KEEP` | Thấp |
| **F20** | Robot 3D: Orbit & Zoom | `Robot3DCanvas.tsx` | Camera Controls | `VERIFIED` | Nút `Góc tự do` + chuột trái | `KEEP` | Thấp |
| **F21** | Camera FPV Thời Gian Thực | `DynamicCameraFPV.tsx`| Canvas Shader | `VERIFIED` | Toolbar nút `FPV` + Camera Gallery | `KEEP` | Thấp |
| **F22** | Telemetry HUD Strip | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | HUD dưới viewport ($v, t, s, a$) | `REDESIGN` | Thấp |
| **F23** | Console: Telemetry Logs | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Workspace Phân tích & Lập trình | `RELOCATE` | Thấp |
| **F24** | Console: Python Active Code | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Workspace Lập Trình | `RELOCATE` | Thấp |
| **F25** | Console: Signal Flow Pipeline | `TripleViewCockpit.tsx` | `useSimulationStore` | `VERIFIED` | Workspace Bài Học / Phần Cứng | `RELOCATE` | Thấp |
| **F26** | Bản Đồ Kiến Thức (Knowledge Map) | `KnowledgeMap.tsx` | Props modules | `VERIFIED` | Workspace Bài Học -> Tiến trình | `RELOCATE` | Thấp |
| **F27** | Chi Tiết 12 Module Bài Học | `ModuleDetailView.tsx` | Props modules | `VERIFIED` | Sidebar Trái -> Danh sách bài học | `REDESIGN` | Thấp |
| **F28** | Bộ Mô Phỏng 2 Động Cơ Cũ | `RobotTwinMotorSimulator`| Local State riêng | `DUPLICATED` | Thay thế bằng `useSimulationStore` | `MERGE` | Cao |
| **F29** | Camera Simulator (Annotation) | `CameraSimulator.tsx` | Local State | `VERIFIED` | Workspace Lập trình / AI Vision | `RELOCATE` | Thấp |
| **F30** | Sơ Đồ Quy Trình Chi Tiết | `PipelineDiagram.tsx` | Static Data | `VERIFIED` | Workspace Bài Học -> Phần cứng | `RELOCATE` | Thấp |
| **F31** | Thư Viện Hàm & API JetBot | `FunctionExplorer.tsx` | `functionsData` | `VERIFIED` | Workspace Lập Trình | `RELOCATE` | Thấp |
| **F32** | Đồ Thị Huấn Luyện AI (Loss) | `TrainingChartsView.tsx`| Static/Mock | `VERIFIED` | Workspace Phân Tích | `RELOCATE` | Thấp |
| **F33** | Thí Nghiệm Nếu-Như (What-If) | `WhatIfPlayground.tsx` | Local Physics | `VERIFIED` | Workspace Phân Tích | `RELOCATE` | Thấp |
| **F34** | Trắc Nghiệm Tương Tác (Quiz) | `QuizPanel.tsx` | `quizData` | `VERIFIED` | Workspace Báo Cáo & Đánh Giá | `RELOCATE` | Thấp |
| **F35** | Từ Điển Thuật Ngữ (Glossary) | `GlossaryView.tsx` | `glossaryData` | `VERIFIED` | Header -> Tiện ích `Thư viện` | `RELOCATE` | Thấp |
| **F36** | Nguồn & Lưu Ý Kỹ Thuật | `SourcesAndCaveats.tsx` | Static Data | `VERIFIED` | Header -> Tiện ích `Trợ giúp` | `RELOCATE` | Thấp |
| **F37** | Chuyển Đổi Dark / Light Mode | `App.tsx` | Theme Context | `VERIFIED` | Header -> Tiện ích `Cài đặt` | `RELOCATE` | Thấp |
| **F38** | Điều Chỉnh Cỡ Chữ (Font Size) | `App.tsx` | CSS Root Class | `VERIFIED` | Header -> Tiện ích `Cài đặt` | `RELOCATE` | Thấp |
| **F39** | Hộp Thoại Nghiệm Thu Cơ Khí | `MechanicalAcceptanceModal`| Local Modal State | `VERIFIED` | Workspace Báo Cáo | `RELOCATE` | Thấp |
