# BÁO CÁO 01: TỔNG KIỂM KÊ DỰ ÁN & HỆ THỐNG KỸ THUẬT CMU10
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10 STEM)

> **Mục tiêu tài liệu**: Báo cáo tổng kiểm kê mã nguồn, hạ tầng kỹ thuật, phụ thuộc, cấu trúc định tuyến và các màn hình hiện có của CMU10 trước khi tiến hành tái cấu trúc giao diện Phase B.  
> **Thời điểm kiểm định**: Tháng 10/2026 (Commit nền: `5f8729d` trên nhánh `main`).  
> **Nguyên tắc**: AUDIT-ONLY — Không thay đổi mã nguồn sản phẩm, không phá vỡ logic vật lí và điều khiển robot.

---

## 1. Mục Tiêu Giáo Dục & Đối Tượng Học Tập Chuẩn

- **Môn học mục tiêu**: **Vật lí 10 (Bộ GD&ĐT / Chương trình GDPT 2018)**.
- **Chủ đề kiến thức cốt lõi**:
  1. *Động học chất điểm & Chuyển động thẳng đều / biến đổi đều*: Vận tốc dài $v = (v_R + v_L)/2$, gia tốc $a$, quãng đường $s$, đồ thị tọa độ - thời gian $(x-t)$ và vận tốc - thời gian $(v-t)$.
  2. *Chuyển động tròn & Chuyển động quay của vật rắn*: Vận tốc góc $\omega = (v_R - v_L)/L$, gia tốc hướng tâm $a_{ht} = \omega^2 R$, bán kính quay $R = (L/2) \cdot (v_R + v_L)/(v_R - v_L)$.
  3. *Động lực học & Định luật Newton*: Lực kéo động cơ, lực ma sát lăn, xung lượng, quán tính của xe khi phanh gấp.
  4. *Năng lượng và Công*: Công suất động cơ, tiêu hao pin theo chu kỳ điều khiển xung PWM.
  5. *Ứng dụng STEM Robotics*: Mô phỏng vi sai JetBot hai bánh độc lập, cảm biến khoảng cách siêu âm (Ultrasonic HC-SR04), camera CSI nhận diện làn đường / vật cản.
- **PHÁT HIỆN SAI LỆCH QUAN TRỌNG TRONG GIAO DIỆN HIỆN TẠI**:
  - Tại `src/App.tsx:228`: Header hiển thị huy hiệu `Lớp 11`.
  - Tại `src/App.tsx:599`: Footer ghi text `Phòng thí nghiệm STEM Colorful EdTech cho học sinh lớp 11`.
  - Tại `src/components/TripleViewCockpit.tsx:490`: Mission Control ghi huy hiệu `Lớp 11 STEM`.
  - **Kết luận Audit**: Dự án phục vụ **Vật lí 10**, không phải Vật lí 11. Giai đoạn Phase B redesign cần đồng bộ hóa toàn bộ các nhãn và nội dung về chuẩn Vật lí 10.

---

## 2. Thông Số Kiến Trúc Kỹ Thuật (Tech Stack & Dependencies)

Dự án được xây dựng trên nền tảng Single Page Application (SPA) hiện đại:

| Thành phần | Phiên bản / Thư viện | Vai trò kỹ thuật trong hệ thống |
| :--- | :--- | :--- |
| **Framework UI** | React `19.0.1` | Quản lý vòng đời component, virtual DOM, render reactive |
| **Ngôn ngữ** | TypeScript `7.0.2` (Runtime TSX `4.21.0`) | Định kiểu tĩnh cho Pose, Kinematics, ComponentSpec, Viewport |
| **Build Tool & Bundler** | Vite `8.3.0` | Dev server cổng 3000 HMR, bundle Rollup minification |
| **Styling** | Tailwind CSS `4.3.3` + `@tailwindcss/vite` | Utility CSS, hỗ trợ Dark/Light mode và STEM Color Tokens |
| **3D Graphics Engine** | Three.js `0.186.1` + `@types/three` | WebGL 3D Digital Twin, PBR material, ShadowMap, CAD Modes |
| **UI Resizing Panels** | `react-resizable-panels` `2.1.7` | Chia khung linh hoạt (Split, Triple view), kéo thả thanh phân cách |
| **Icons Library** | `lucide-react` `0.546.0` | Bộ biểu tượng vector nhất quán toàn ứng dụng |
| **Animation Engine** | `motion` `12.23.24` | Animation chuyển động mượt cho modal và transitions |
| **AI Integration** | `@google/genai` `2.4.0` | Tích hợp mô hình ngôn ngữ hỗ trợ giải thích bài học (Optional) |
| **E2E Testing** | Playwright `1.64.0` | Tự động hóa kiểm thử UI, render WebGL, responsive testing |

---

## 3. Cấu Trúc Thư Mục & Tổ Chức Mã Nguồn

```
c:\Users\ltlie\Documents\GIT-DA\17.CMU10\CMU10\
├── index.html                   # HTML template chính với viewport meta
├── package.json                 # Cấu hình dependency và scripts
├── tsconfig.json                # Cấu hình TypeScript compiler
├── vite.config.ts               # Cấu hình Vite dev server & Tailwind plugin
├── src/
│   ├── main.tsx                 # Entry point khởi tạo React root
│   ├── App.tsx                  # Shell chính, Top Header, Navigation Sidebar, Tab Routing, Modals (29.6 KB)
│   ├── index.css                # Global CSS styles, token variables, custom scrollbars
│   ├── components/              # Các UI Component và Visualizer chính
│   │   ├── TripleViewCockpit.tsx          # Buồng lái mô phỏng 6 bố cục, telemetry strip, D-Pad (45.7 KB)
│   │   ├── TacticalArenaMap.tsx           # Sa bàn chiến thuật 2D SVG, click-to-goal, Pan/Zoom (44.1 KB)
│   │   ├── Robot3DCanvas.tsx              # Mô hình 3D JetBot Three.js, 7 chế độ CAD (57.8 KB)
│   │   ├── DynamicCameraFPV.tsx           # Camera FPV thời gian thực với hiệu ứng fisheye shader (15.2 KB)
│   │   ├── RobotTwinMotorSimulator.tsx    # Bộ mô phỏng 2 động cơ độc lập legacy (83.3 KB - Cần hợp nhất)
│   │   ├── CameraSimulator.tsx            # Trình mô phỏng camera annotation & inference (17.5 KB)
│   │   ├── KnowledgeMap.tsx               # Bản đồ mạng lưới bài học STEM (22.4 KB)
│   │   ├── ModuleDetailView.tsx           # Xem chi tiết 12 modules bài học (18.9 KB)
│   │   ├── PipelineDiagram.tsx            # Sơ đồ quy trình phần cứng & luồng tín hiệu JetBot (23.9 KB)
│   │   ├── FunctionExplorer.tsx           # Thư viện lệnh và API Python JetBot (11.0 KB)
│   │   ├── TrainingChartsView.tsx         # Đồ thị học máy Bokeh/Matplotlib mô phỏng (15.8 KB)
│   │   ├── WhatIfPlayground.tsx           # Sân chơi thí nghiệm giả định tham số (17.7 KB)
│   │   ├── QuizPanel.tsx                  # Trắc nghiệm tương tác kiểm tra kiến thức (9.2 KB)
│   │   ├── GlossaryView.tsx               # Tra cứu thuật ngữ Robotics & Vật lí (5.8 KB)
│   │   ├── SourcesAndCaveats.tsx          # Tài liệu tham khảo và lưu ý kỹ thuật (8.7 KB)
│   │   ├── EmergencyStopModal.tsx         # Hộp thoại dừng khẩn cấp toàn hệ thống (3.0 KB)
│   │   ├── MechanicalAcceptanceModal.tsx  # Hộp thoại nghiệm thu cơ khí (11.2 KB)
│   │   └── ErrorBoundary.tsx              # Bắt lỗi runtime của React (3.3 KB)
│   ├── stores/
│   │   └── useSimulationStore.ts          # Single Source of Truth cho toàn bộ mô phỏng (19.8 KB)
│   ├── theme/
│   │   └── stemTokens.ts                  # Bảng mã màu Vibrant STEM và định nghĩa theme (13.5 KB)
│   ├── types/
│   │   ├── jetbot.ts                      # Types cho Tabs, Modules, Functions, Quiz (2.6 KB)
│   │   └── robotGeometry.ts               # Thông số hình học JetBot, 7 CAD Inspection Modes (13.3 KB)
│   └── utils/
│       └── coordinateTransforms.ts        # Chuyển đổi tọa độ World <-> SVG <-> Screen (9.0 KB)
├── scripts/                     # Kịch bản kiểm tra tự động Playwright
└── reports/                     # Lưu trữ báo cáo kiểm định các giai đoạn
```

---

## 4. Kiểm Kê Danh Mục Màn Hình & Trạng Thái Định Tuyến (Tab Routing)

Ứng dụng hiện đang điều hướng thông qua state `currentTab` nội bộ trong `src/App.tsx`, hỗ trợ 10 tab chính:

| Tab ID | Tên hiển thị hiện tại | Component phụ trách | Mục đích & Chức năng thực tế | Kích thước component |
| :--- | :--- | :--- | :--- | :--- |
| `home` | **Kiến Thức** | `KnowledgeMap.tsx` | Bản đồ mạng lưới 12 module kiến thức, tiến trình học tập, lọc theo chủ đề | 22.4 KB |
| `robot-sim` | **Robot 2 Động Cơ** | `TripleViewCockpit.tsx` | Không gian mô phỏng trung tâm: Sa bàn 2D, Robot 3D, FPV Camera, Telemetry, D-Pad | 45.7 KB |
| `modules` | **12 Modules** | `ModuleDetailView.tsx` | Chi tiết từng bài học (M1 đến M12), mục tiêu Vật lí, bài toán tính toán, nhúng simulator con | 18.9 KB |
| `pipeline` | **Sơ Đồ Quy Trình** | `PipelineDiagram.tsx` | Sơ đồ luồng tín hiệu từ Python -> I2C -> PCA9685 -> TB6612 -> Motor TT -> Bánh xe | 23.9 KB |
| `functions` | **Thư Viện Hàm** | `FunctionExplorer.tsx` | Danh mục 30+ hàm Python `jetbot` (`set_motors`, `forward`, `stop`, `Camera`, `bgr8_to_jpeg`) | 11.0 KB |
| `training-charts` | **Đồ Thị AI** | `TrainingChartsView.tsx` | Biểu đồ huấn luyện AI bám làn (Loss, Epoch, MSE), phân tích hàm mất mát | 15.8 KB |
| `what-if` | **Thí Nghiệm Nếu-Như** | `WhatIfPlayground.tsx` | Thí nghiệm vật lí giả định: thay đổi ma sát $\mu$, khối lượng $m$, độ trễ mạng, nhiễu cảm biến | 17.7 KB |
| `quiz` | **Trắc Nghiệm** | `QuizPanel.tsx` | Bộ câu hỏi kiểm tra Vật lí 10 & Robotics (10 câu hỏi tính toán, giải thích, chấm điểm tức thì) | 9.2 KB |
| `glossary` | **Thuật Ngữ** | `GlossaryView.tsx` | Từ điển tra cứu 40+ thuật ngữ (Vi sai, PWM, Kinematics, Deadband, Odometry, FOV) | 5.8 KB |
| `sources` | **Nguồn & Lưu Ý** | `SourcesAndCaveats.tsx` | Nguồn tài liệu gốc từ NVIDIA JetBot, giáo trình Vật lí 10, lưu ý phần cứng Jetson Nano | 8.7 KB |

---

## 5. Kết Quả Đo Lường Build & Hiệu Năng Ban Đầu

Thực hiện kiểm thử thực tế từ terminal vào ngày 11/10/2026:

### A. TypeScript Check (`npm run lint` -> `tsc --noEmit`)
- **Kết quả**: Exit Code `0` (Không có bất kỳ lỗi định kiểu tĩnh nào).

### B. Production Build (`npm run build` -> `vite build`)
- **Thời gian build**: `477 ms`.
- **Tổng số module transform**: `1,688 modules`.
- **Dung lượng file phân phối (`dist/`)**:
  - `dist/index.html`: **1.24 kB** (gzip: 0.58 kB)
  - `dist/assets/index-B2pfDHqV.css`: **154.18 kB** (gzip: 19.88 kB)
  - `dist/assets/index-ALjDWeH9.js`: **1,213.86 kB** (gzip: 318.19 kB)
- **Cảnh báo kỹ thuật ghi nhận**:
  - Bundle JavaScript vượt quá 500 kB (hiện là 1.21 MB).
  - *Nguyên nhân*: Toàn bộ 10 màn hình và Three.js được gộp vào 1 chunk duy nhất, chưa áp dụng `React.lazy()` và dynamic `import()` code splitting. Đây là cơ hội tối ưu lớn cho Phase B.

### C. Runtime Performance Benchmark (Playwright headless trên port 3000)
- **Thời gian tải trang ban đầu**: `722 ms`.
- **DOM Node Count tại tab mô phỏng**: `725 nodes` (mức tải nhẹ, tối ưu tốt).
- **Bộ nhớ Heap JS trình duyệt**: `45 MB used` / `54 MB total` (ổn định, không rò rỉ bộ nhớ).
- **Console errors**: `0`.
- **Console warnings**: `3` (chủ yếu là khuyến nghị `id`/`order` của `react-resizable-panels`).
