# CMU10 Phase 3.5 — Automated Test Results & Benchmark Report

## 1. Test Execution Metadata

| Parameter | Specification |
| :--- | :--- |
| **Engine** | Playwright (Chromium Headless / WebGL SwiftShader emulation) |
| **Primary Script** | `scripts/verify_phase3_5_map_control.mjs` |
| **Regression Script** | `scripts/verify_phase3_4_fidelity.mjs` |
| **Target Application** | CMU10 JetBot AI Studio (`http://localhost:3000`) |
| **Timestamp** | 2026-10-11 |
| **Total Test Suites** | 12 / 12 Suites Passed |
| **Overall Verdict** | **PASS (100%)** |
| **Console Errors** | **0** |
| **JS Heap Memory** | **43 MB** (Well within 60MB target) |

---

## 2. Test Execution Matrix (Phase 3.5)

| Test ID | Test Scenario | Verified Assertions | Status |
| :--- | :--- | :--- | :--- |
| **TEST-01** | **Compact Sidebar Labels** | Nav button contains "12 Modules" without "Chi Tiết". Other labels verified compact. | **PASS** |
| **TEST-02** | **WebGL Viewport Initialization** | 2 active WebGL canvases (Robot3DCanvas & DynamicCameraFPV), 0 fallback alerts. | **PASS** |
| **TEST-03** | **Workspace Layout Switching** | Split View activated, 50:50 allocation for Map testing verified. | **PASS** |
| **TEST-04** | **Zoom In/Out Controls** | Zoom changed from $100\% \to 156\% \to 125\%$ via buttons, displaying dynamic badge. | **PASS** |
| **TEST-05** | **Fit to Frame / Reset Zoom** | Clicking "Vừa Khung" reset zoom level to exactly $100\%$. | **PASS** |
| **TEST-06** | **Map Pan Drag** | Mouse drag moved SVG viewport by $80 \times 50$ px smoothly without jumping. | **PASS** |
| **TEST-07** | **Focus & Follow Robot** | Focus centered on robot; Follow Robot entered "Đang Theo" active tracking state. | **PASS** |
| **TEST-08** | **Click-to-Goal Placement** | Goal clicked; confirmation banner displayed at computed inverse world coords; Start Navigation started drive. | **PASS** |
| **TEST-09** | **Fullscreen Map Mode** | Map fullscreen opened and restored without canvas distortion or aspect ratio skewing. | **PASS** |
| **TEST-10** | **E-STOP Safety Priority** | Emergency stop halted motors, locked system, and opened safety modal. Dismissed cleanly. | **PASS** |
| **TEST-11** | **Simulation State Reset** | Reset restored $(0.0, 0.0, 0.0)$ pose and cleared trajectories. | **PASS** |
| **TEST-12** | **Laptop Viewport (1280x800)** | Rendered at $1280 \times 800$ resolution with zero horizontal scrolling or layout breakage. | **PASS** |

---

## 3. Regression Suite Verification (Phase 3.4 Parity)

The entire Phase 3.4 verification suite was run concurrently against the updated codebase:
- **WebGL Context**: Intact (2 canvases active).
- **7 CAD Inspection Modes**: Realistic, Wireframe, Components, Collision, Coordinates, Sensors FOV, Dimensions all passed.
- **Quality Presets**: High, Low, Balanced all passed.
- **20 Rapid Layout Transitions**: 20/20 cycles completed with average transition time of $2056\text{ ms}$.
- **Kinematics & Physics Engine**: 100% mathematical parity, differential drive velocities and trajectories preserved.
- **Zero Console Errors**: 0 uncaught exceptions.

---

## 4. Visual Evidence Artifacts

The following screenshots were captured automatically during test execution and are located in `reports/phase3_5_compact_ui/screenshots/`:

1. `01_compact_sidebar_home.png`: Compact sidebar on Home tab displaying "12 Modules" and concise nav labels.
2. `02_simulation_cockpit_overview.png`: Simulation cockpit with compact header and standardized font hierarchy.
3. `03_map_zoomed_and_panned.png`: Map canvas zoomed and panned with visible track displacement.
4. `04_click_to_goal_pending.png`: Click-to-Goal target beacon with confirmation banner.
5. `05_map_fullscreen_active.png`: Fullscreen map viewport without aspect ratio distortion.
6. `06_estop_safety_engaged.png`: Emergency Stop safety interlock modal.
7. `07_final_reset_state.png`: Clean reset state with robot returned to origin.
8. `08_laptop_1280_responsive.png`: Responsive layout on 1280px laptop screen.
