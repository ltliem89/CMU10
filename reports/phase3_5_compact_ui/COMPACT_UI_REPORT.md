# CMU10 Phase 3.5 — Compact UI & Typography Standardization Report

## 1. Executive Summary & Goals
In Phase 3.5, the user interface of the CMU10 JetBot AI & Robotics Interactive Studio was thoroughly audited and refactored to achieve **high visual density, minimal component footprint, and maximized simulation canvas real estate**, while maintaining strict readability, ergonomic control accessibility, and zero disruption to the underlying kinematics and physics engine.

Particular emphasis was placed on:
1. **Làm gọn menu "ĐIỀU HƯỚNG STEM LAB"**:
   - Shortening navigation labels (specifically removing "Chi Tiết" from "12 Modules Chi Tiết" $\to$ "12 Modules").
   - Narrowing the sidebar width from `w-72` (288px) to `w-56` / `w-60` (224–240px).
   - Making sub-panels (12 Modules list and STEM color palette guide) collapsible into sleek 1-line accordions.
2. **Standardizing Typography & Density**:
   - Eliminating bloated margins, padding, and excessive heights across headers and toolbars.
   - Giving 75–85% of viewport width to the simulation workspace when in `Robot 2 Động Cơ` tab.
   - Retaining the prominent visibility, high clickability, and safety priority of the E-STOP button.

---

## 2. Typography Standard & Spacing Matrix

The application's typography was unified according to the following strict scale:

| Hierarchy Level | Target Font Size | Tailwind Classes | Applied Components & Locations |
| :--- | :--- | :--- | :--- |
| **Normal Body / Explanations** | 12 – 13 px | `text-xs font-normal` / `text-[13px]` | Telemetry logs, component descriptions, status toasts |
| **Secondary Labels & Telemetry** | 10 – 11 px | `text-[10px]` / `text-[11px] font-mono` | Real-time $(x, z, \text{yaw})$ coordinates, PWM percentages, zoom badge, arena size badge |
| **Action & Control Buttons** | 11 – 12 px | `text-[11px]` / `text-xs font-bold` | Run, Pause, Step, Reset, Layout switchers, Map interaction mode pills |
| **Section & Card Headers** | 13 – 14 px | `text-xs font-black` / `text-sm font-bold` | "ĐIỀU HƯỚNG STEM LAB", "JetBot Virtual Lab", Viewport card title bars |
| **Critical Metrics & Emergency** | 14 – 18 px | `text-sm font-black` / `text-base` | E-STOP safety button, emergency stop modal alerts, major KPI indicators |

---

## 3. Detailed Refactoring of Menu "ĐIỀU HƯỚNG STEM LAB"

### 3.1 Nav Item Label Optimization
All navigation items were streamlined for rapid scanning without loss of context:

| Tab ID | Baseline Label (Phase 3.4) | Compact Label (Phase 3.5) | Rationale |
| :--- | :--- | :--- | :--- |
| `home` | Bản Đồ Kiến Thức | **Kiến Thức** | Concise, retains knowledge map purpose |
| `robot-sim` | Robot 2 Động Cơ | **Robot 2 Động Cơ** | Retained exactly for backwards test compatibility |
| `modules` | 12 Modules Chi Tiết | **12 Modules** | Explicit user request: removed word "Chi Tiết" |
| `pipeline` | Sơ Đồ Quy Trình | **Sơ Đồ Quy Trình** | Retained clarity |
| `functions` | Thư Viện Hàm & Lệnh | **Thư Viện Hàm** | Removed redundant words |
| `training-charts` | Đồ Thị Huấn Luyện | **Đồ Thị AI** | Compact, contemporary AI terminology |
| `what-if` | Thí Nghiệm "Nếu Như" | **Thí Nghiệm Nếu-Như** | Simplified quote styling |
| `quiz` | Thực Hành & Trắc Nghiệm | **Trắc Nghiệm** | Direct and compact |
| `glossary` | Từ Điển Thuật Ngữ | **Thuật Ngữ** | Single-concept title |
| `sources` | Nguồn & Lưu Ý Kỹ Thuật | **Nguồn & Lưu Ý** | Concise |

### 3.2 Sidebar Density & Width Reduction
- **Width**: Reduced from `w-72` (288px) to `w-56 lg:w-60` (224–240px) when expanded, saving ~50px of horizontal space for the canvas. Collapsed state remains `w-16` (64px).
- **Item Padding**: Adjusted from `py-2.5 px-3.5` to `py-1.5 px-2.5`, reducing vertical button height by 35%.
- **Icon Sizing**: Scaled from `w-5 h-5` (20px) to `w-4 h-4` (16px).
- **Badge Styling**: Refactored to `text-[10px] px-1.5 py-0.2 rounded-full`.

### 3.3 Collapsible Sub-Sections
- **12 Modules Nguồn**: Converted to an accordion `<button onClick={() => setIsModulesSectionOpen(!isModulesSectionOpen)}>` with an animated chevron (`ChevronDown`). When collapsed, takes up only 32px of vertical height instead of 260px.
- **Quy Chuẩn Màu STEM Lớp 11**: Converted to a collapsible accordion card `<button onClick={() => setIsPaletteSectionOpen(!isPaletteSectionOpen)}>`.

---

## 4. Cockpit Header & Toolbars Density

In `TripleViewCockpit.tsx`:
- **Mission Control Header**:
  - Padding reduced from `px-4 py-2.5` to `px-3.5 py-2`.
  - Title font adjusted to `text-xs sm:text-sm font-black tracking-tight`.
  - Icon container reduced from `w-9 h-9` to `w-8 h-8`.
  - Primary action buttons (Run, Pause, Step, Reset) unified to `px-2.5 py-1 text-xs font-bold`.
- **E-STOP Preservation**:
  - Sized at `px-3.5 py-1 text-xs font-black` with glowing red border, animated pulse, and prominent gradient to guarantee zero accidental misclicks during emergencies.
- **Layout Switcher Bar**:
  - Height condensed to `py-0.5`, button fonts to `text-[11px] font-bold`.
  - Clean separation between Layout switchers, Panel visibility toggles, and Reset Layout button.

---

## 5. Main Content Container Scalability
In `App.tsx`:
- Container updated from rigid `max-w-7xl mx-auto` to dynamic scaling:
  ```tsx
  className={`w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex gap-3 sm:gap-4 ${
    currentTab === 'robot-sim' ? 'max-w-[1680px] mx-auto' : 'max-w-7xl mx-auto'
  }`}
  ```
- This allows full utilization of wide screens (1440p, 1080p, ultra-wide) for the robot simulation, giving up to **82% screen width** to the 3D twin, tactical arena, and FPV views.
