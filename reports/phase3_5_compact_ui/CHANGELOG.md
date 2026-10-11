# CMU10 Phase 3.5 — Changelog & Implementation Summary

## Release: CMU10 Phase 3.5 (Compact UI & Flexible Map Control)
**Date**: 2026-10-11  
**Repository**: `https://github.com/ltliem89/CMU10.git`  
**Branch**: `main`  
**Status**: Production Verified (100% Pass)

---

### 1. Modified Source Files

#### `src/App.tsx`
- **Shortened Nav Item Labels**:
  - `12 Modules Chi Tiết` $\to$ **`12 Modules`** (removed "Chi Tiết").
  - `Bản Đồ Kiến Thức` $\to$ **`Kiến Thức`**.
  - `Thư Viện Hàm & Lệnh` $\to$ **`Thư Viện Hàm`**.
  - `Đồ Thị Huấn Luyện` $\to$ **`Đồ Thị AI`**.
  - `Thí Nghiệm "Nếu Như"` $\to$ **`Thí Nghiệm Nếu-Như`**.
  - `Thực Hành & Trắc Nghiệm` $\to$ **`Trắc Nghiệm`**.
  - `Từ Điển Thuật Ngữ` $\to$ **`Thuật Ngữ`**.
  - `Nguồn & Lưu Ý Kỹ Thuật` $\to$ **`Nguồn & Lưu Ý`**.
- **Compact Sidebar Architecture**:
  - Reduced width from `w-72` to `w-56 lg:w-60` (saving ~50px width for workspace).
  - Reduced button padding from `py-2.5 px-3.5` to `py-1.5 px-2.5`.
  - Scaled icon dimensions from `w-5 h-5` to `w-4 h-4`.
  - Added collapsible accordion state for **12 Modules** (`isModulesSectionOpen`).
  - Added collapsible accordion state for **STEM Color Palette** (`isPaletteSectionOpen`).
- **Dynamic Simulation Workspace Width**:
  - Expanded container from `max-w-7xl` to `max-w-[1680px]` when on the simulation tab (`Robot 2 Động Cơ`).

#### `src/components/TacticalArenaMap.tsx`
- **Map Interaction Controller**:
  - Integrated Zoom Engine: `+`, `-`, mouse wheel focal point anchoring (zero cursor jitter), dynamic percentage indicator, `100%` reset, and `Fit to Frame` (clamped $0.5\times - 5.0\times$).
  - Integrated Pan Engine: Middle mouse drag, Space + Left Click drag, and dedicated Pan mode toggle.
  - Centering & Tracking Modes: `Focus Robot`, `Follow Robot` (60Hz synchronous camera tracking), `Free Map` (smooth decoupling), `Focus Goal`, `Fit All`.
  - Strict Mathematical Coordinate Transformations: Reversible inverse transformation from screen client pixels $(clientX, clientY)$ to world meters $(x_{world}, z_{world})$.
  - Click-to-Goal & Navigation Safety: Interactive target placement with animated beacon and confirmation banner (`Bắt Đầu` / `Hủy`).
  - Fullscreen Map: Toggleable fullscreen overlay with zero aspect ratio distortion (`preserveAspectRatio="xMidYMid meet"`).

#### `src/components/TripleViewCockpit.tsx`
- **Standardized Typography & Density**:
  - Compacted header padding from `px-4 py-2.5` to `px-3.5 py-2`.
  - Header title scaled to `text-xs sm:text-sm font-black uppercase`.
  - Command buttons (Run, Pause, Step, Reset) condensed to `px-2.5 py-1 text-xs font-bold`.
  - Preserved prominent, high-clickability animated red E-STOP button (`px-3.5 py-1 text-xs font-black`).
  - Wired `onToggleMaximize` and `isMaximized` props into `TacticalArenaMap`.

#### `src/components/EmergencyStopModal.tsx`
- Added `data-testid="estop-modal-dismiss-btn"` to the confirmation button for reliable automated interaction.

---

### 2. Testing Infrastructure & Reports

#### `scripts/verify_phase3_5_map_control.mjs`
- Automated Playwright validation suite testing:
  - Compact nav label assertion.
  - WebGL viewport initialization.
  - Map zoom in/out with percentage tracking.
  - Fit to frame / reset zoom.
  - Map pan drag via mouse move.
  - Focus and Follow robot tracking.
  - Click-to-Goal target placement and navigation confirmation.
  - Fullscreen map toggle and restore.
  - E-STOP safety lock and modal dismissal.
  - Origin reset state.
  - Laptop 1280x800 responsive layout without overflow.

#### `reports/phase3_5_compact_ui/`
- `COMPACT_UI_REPORT.md`
- `MAP_INTERACTION_CONTROLLER.md`
- `TEST_RESULTS.md`
- `CHANGELOG.md`
- `test-results.json`
- 8 high-resolution PNG verification screenshots in `screenshots/`.
