# BÁO CÁO 04: BẢN ĐỒ CẤU TRÚC COMPONENT & TÀI NGUYÊN GIAO DIỆN (UI COMPONENT MAP)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10 STEM)

> **Mục tiêu tài liệu**: Lập bản đồ phân cấp toàn bộ cây component React của CMU10, phân tích mức độ phụ thuộc, tái sử dụng, hiệu năng re-render, quản lý WebGL context và các thư viện tài nguyên giao diện (Icons, Theme Tokens, Shaders).

---

## 1. Cây Phân Cấp Component Toàn Diện (Component Hierarchy Tree)

```
[App.tsx] (Root Shell & Layout Orchestrator)
 │
 ├── [Global Header]
 │    ├── [Logo & Branding] (Bot Icon + "JetBot AI Studio" + Badges)
 │    ├── [Dark/Light Toggle Button] (Sun / Moon)
 │    ├── [Font Size Adjuster] (A / A+ / A++ toggle buttons)
 │    ├── [Safety Status Badge] (ShieldCheck + ping animation)
 │    └── [Emergency Stop Button] (AlertTriangle + gradient red button)
 │
 ├── [Desktop Sidebar Aside]
 │    ├── [Header & Collapse Toggle] (Atom Icon button)
 │    ├── [Navigation Items Deck] (10 Buttons với Icon & Badge màu)
 │    ├── [Accordion 12 Modules] (Collapsible list M1 -> M12)
 │    └── [Accordion STEM Palette] (Collapsible color guide card)
 │
 ├── [Mobile Navigation Drawer] (Modal trượt cho viewport < 768px)
 │
 ├── [Main Content Workspace] (Switch-case theo state currentTab)
 │    │
 │    ├── [Tab: home] ──> <KnowledgeMap />
 │    │                    ├── Network Graph SVG
 │    │                    ├── Module Status Cards (12 items)
 │    │                    └── Filter Tags
 │    │
 │    ├── [Tab: robot-sim] ──> <TripleViewCockpit /> (Buồng Lái Trung Tâm)
 │    │                         │
 │    │                         ├── [Mission Control Header] (Run/Pause/Step/Reset/E-STOP)
 │    │                         ├── [Layout Toolbar] (Standard, Focus, Split, Triple, PiP, Fullscreen)
 │    │                         ├── [Panel Toggles] (D-Pad, Console, FPV, Sidebar, Reset)
 │    │                         ├── [CockpitTelemetryStrip] (Isolated 20 FPS Throttled HUD)
 │    │                         │
 │    │                         ├── <PanelGroup direction="vertical">
 │    │                         │    │
 │    │                         │    ├── <Panel: Top Simulation Stage>
 │    │                         │    │    ├── <TacticalArenaMap /> (Sa bàn 2D SVG, Pan/Zoom, Click-to-Goal)
 │    │                         │    │    ├── <Robot3DCanvas /> (Three.js WebGL, 7 CAD Inspection Modes)
 │    │                         │    │    └── <DynamicCameraFPV /> (First Person View + Fisheye Shader)
 │    │                         │    │
 │    │                         │    └── <Panel: Bottom Control Stage>
 │    │                         │         ├── [D-Pad Manual Controller] (Forward, Backward, Left, Right)
 │    │                         │         ├── [Motor Speed Sliders] (Dual PWM Throttles [-1.0 .. 1.0])
 │    │                         │         └── [Console Deck Tabs]
 │    │                         │              ├── [Tab: Telemetry Logs] (Stream sự kiện thời gian thực)
 │    │                         │              ├── [Tab: Python Active Code] (Mã nguồn đồng bộ)
 │    │                         │              └── [Tab: Hardware Signal Flow] (Luồng I2C/PWM)
 │    │
 │    ├── [Tab: modules] ──> <ModuleDetailView />
 │    │                       ├── Module Header & Lesson Navigation
 │    │                       ├── Physics & Robotics Objectives (Vật lí 10)
 │    │                       ├── Embedded <RobotTwinMotorSimulator /> (Legacy Simulator)
 │    │                       ├── Embedded <CameraSimulator /> (Annotation/Inference)
 │    │                       └── Sample Code & Calculation Exercise
 │    │
 │    ├── [Tab: pipeline] ──> <PipelineDiagram /> (Sơ đồ khối phần cứng & phần mềm)
 │    ├── [Tab: functions] ──> <FunctionExplorer /> (Tra cứu 30+ hàm Python `jetbot`)
 │    ├── [Tab: training-charts] ──> <TrainingChartsView /> (Đồ thị Loss/Epoch Bokeh)
 │    ├── [Tab: what-if] ──> <WhatIfPlayground /> (Thí nghiệm biến đổi tham số Vật lí)
 │    ├── [Tab: quiz] ──> <QuizPanel /> (10 câu trắc nghiệm tương tác)
 │    ├── [Tab: glossary] ──> <GlossaryView /> (Từ điển 40+ thuật ngữ)
 │    └── [Tab: sources] ──> <SourcesAndCaveats /> (Tài liệu nguồn & cảnh báo kỹ thuật)
 │
 ├── [Global Modals]
 │    ├── <EmergencyStopModal /> (Hộp thoại an toàn kích hoạt khi E-STOP)
 │    └── <MechanicalAcceptanceModal /> (Hộp thoại kiểm định cơ khí)
 │
 └── [Global Footer] (Bản quyền, nhãn An Toàn, link tài liệu)
```

---

## 2. Kiểm Kê Thư Viện Tài Nguyên & Thành Phần Tái Sử Dụng

### A. Bảng Mã Màu STEM & Theme Tokens (`src/theme/stemTokens.ts`)
- Định nghĩa 6 màu chuyên ngành giáo dục STEM:
  - **Blue** (`#2563EB`): Điều khiển động cơ & Động học (Kinematics).
  - **Purple** (`#7C3AED`): Trí tuệ nhân tạo (AI) & Thị giác máy tính.
  - **Pink** (`#DB2777`): Sáng tạo & Lắp ráp cơ khí JetBot.
  - **Orange** (`#EA580C`): Thử nghiệm vi sai & Ma sát vật lí.
  - **Amber** (`#D97706`): Khám phá phần cứng Jetson Nano & Cảm biến.
  - **Teal** (`#0D9488`): Cảm biến siêu âm & Tránh va chạm.
- Từng module M1-M12 đều có theme token riêng (`MODULE_THEMES`), bao gồm `primaryHex`, `accentBg`, `accentText`, `accentBorder`.

### B. Bộ Biểu Tượng Vector (`lucide-react`)
Toàn bộ biểu tượng được nhập có chọn lọc từ `lucide-react`, đảm bảo kích thước tiêu chuẩn (`14px` đến `18px`), hỗ trợ stroke vector sắc nét ở mọi độ phân giải màn hình.

### C. Đồ Họa 3D & Shader Engine (`three`)
- Tọa lạc tại `src/components/Robot3DCanvas.tsx` (57.8 KB).
- **Hệ thống chiếu sáng**: Studio PBR Lighting Rig với `AmbientLight`, `DirectionalLight` (tạo bóng đổ `PCFSoftShadowMap`), và `PointLight` giả lập đèn pha xe.
- **Vật liệu PBR (Physically Based Rendering)**:
  - Khung nhôm: `MeshStandardMaterial` (`roughness: 0.35`, `metalness: 0.85`).
  - Lốp cao su: `MeshStandardMaterial` (`roughness: 0.90`, `metalness: 0.05`).
  - Mạch Jetson Nano: `MeshStandardMaterial` màu xanh đậm (`0x0f2e1b`).
- **Góc nhìn camera 3D**: `PerspectiveCamera` (FOV 42 độ), bán kính quỹ đạo `0.35m`, mượt mà khi xoay quanh tâm xe.

---

## 3. Phân Tích Cơ Chế Đồng Bộ Trạng Thái & Tối Ưu Render (State & Performance Coupling)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SINGLE SOURCE OF TRUTH: useSimulationStore           │
│  (Pose: x, z, yaw | Speeds: left, right | PWM | Sensors | Logs | Code) │
└───────────────────────┬────────────────────────┬───────────────────────┘
                        │                        │
       (Throttled 20 FPS Subscription)    (Selective Subscription on changes)
                        ▼                        ▼
           <CockpitTelemetryStrip />     <TripleViewCockpit />
           - T, Pos, Yaw, PWM            - Layouts, Viewport slots
           - KHÔNG re-render cockpit!    - D-Pad, Sliders, Console
                        │
                        ├────────────────────────┬───────────────────────┐
                        ▼                        ▼                       ▼
              <TacticalArenaMap />       <Robot3DCanvas />       <DynamicCameraFPV />
              - 2D SVG Render            - Three.js WebGL Loop   - Canvas 2D / WebGL
              - Pan, Zoom, Follow        - 60 FPS requestAnim    - Raycast obstacles
```

### A. Điểm Mạnh Đã Tối Ưu
1. **Isolated Telemetry HUD Strip**: Dải chỉ số telemetry nhận dữ liệu từ `useSimulationStore` qua một subscription riêng biệt, có cơ chế điều tiết (throttle) ở chu kỳ ~50ms (20 FPS). Nhờ đó, việc hiển thị số liệu tốc độ cao không gây ra hiện tượng giật giật (micro-jank) hay re-render toàn bộ cây component buồng lái.
2. **Animation Loop Độc Lập Trong 3D Canvas**: `Robot3DCanvas` chạy vòng lặp render bằng `requestAnimationFrame` độc lập với chu kỳ render của React, cập nhật góc quay bánh xe trực tiếp vào Three.js Object3D mà không thông qua React State.

### B. Vấn Đề Ghép Nối (Coupling) & Rủi Ro Cần Xử Lý Trong Phase B
1. **Sự Tồn Tại Song Song Của `RobotTwinMotorSimulator.tsx`**:
   - Component này tự quản lý state động cơ nội bộ, hoàn toàn tách rời khỏi `useSimulationStore`.
   - Khi được nhúng trong `ModuleDetailView`, học sinh điều khiển robot ở đây nhưng không làm thay đổi trạng thái trong `TripleViewCockpit`.
   - Cần tái cấu trúc để mọi thành phần mô phỏng đều nối vào `useSimulationStore`.
2. **Quản Lý WebGL Context Khi Chuyển Tab**:
   - Khi chuyển từ tab `robot-sim` sang tab khác và quay lại, `Robot3DCanvas` phải dọn dẹp (cleanup) `renderer.dispose()` và tái khởi tạo WebGL context một cách an toàn để tránh rò rỉ bộ nhớ GPU trên các trình duyệt Chrome/Edge.
