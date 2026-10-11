# CMU10 Phase 3.4 — Changelog & Implementation Details

## Release: CMU10 Phase 3.4 (P0 Hotfix & High-Fidelity Simulator)
**Date**: 2026-10-11  
**Target Repository**: `https://github.com/ltliem89/CMU10.git`  
**Branch**: `main`  
**Status**: Production Verified

---

### 1. Bug Fixes (P0 Critical)
- **`src/components/Robot3DCanvas.tsx`**:
  - **Fixed Scene Graph Recursion Crash**: Eliminated `RangeError: Maximum call stack size exceeded` in `robotRoot.traverse()`. Replaced inline `robotRoot.traverse(child => ... child.add(wireframeMesh))` with a two-phase collection pattern:
    1. Phase 1: Collect candidate meshes into an array `meshesToProcess`.
    2. Phase 2: Iterate over `meshesToProcess` and apply wireframe overlays without mutating the traversed scene graph dynamically.
  - **Single Shared Wireframe Material**: Replaced per-mesh material allocations with a shared `wireframeMat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x38bdf8 })` instance, preventing WebGL shader thrashing and GPU memory leaks.
  - **Fixed Deprecated Three.js Shadow Map API**: Upgraded `THREE.PCFSoftShadowMap` to `THREE.PCFShadowMap`, resolving Three.js console deprecation warnings.
  - **Hardware Acceleration False Flag Eliminated**: Removed premature fallback to 2.5D schematic view caused by caught JavaScript exceptions; fallback is now strictly reserved for true WebGL context acquisition failures.

---

### 2. Layout & UI Modernization (Simulation-First Architecture)
- **`src/components/TripleViewCockpit.tsx`**:
  - **3D Robot Promoted to Primary Slot**: Reconfigured default layout slots to `{ main: '3d', sub1: 'map', sub2: 'fpv' }`, providing 65% width to the high-fidelity 3D viewport.
  - **Layout Reset Alignment**: Updated `handleResetLayout` to restore `{ main: '3d', sub1: 'map', sub2: 'fpv' }`.
  - **Decoupled 60Hz Telemetry Subscriptions**: Extracted telemetry indicators into a memoized `<CockpitTelemetryStrip />` component throttled to 20Hz. The root `TripleViewCockpit` component now experiences **0 re-renders** during active 60Hz physics ticks.
- **`src/components/Robot3DCanvas.tsx`**:
  - **Eliminated Nested Toolbar**: Removed the redundant card header, returning 46px of vertical canvas height to the viewport.
  - **Floating OSD Camera Controls**: Migrated camera angle presets (`3D Iso`, `Top`, `Front`, `Side`, `Reset`) into a sleek, translucent floating OSD pill on the top-right.
  - **Header Collision Prevention**: Bound CAD mode button container to `max-w-[calc(100%-250px)]` with horizontal scroll to ensure zero overlap with camera angle pills across all view resolutions.
- **`src/components/TacticalArenaMap.tsx`**:
  - **Floating Tactical Toggles**: Replaced fixed header toolbar with floating translucent OSD pill (`Quỹ Đạo Mẫu`, `Vết Thực Tế`, `Tia Quét`), gaining 44px of vertical display height.
  - **Dynamic Height Allocation**: Replaced rigid `min-h-[320px]` with `min-h-0` to support flexible CSS Grid fractional sizing.

---

### 3. Visual Fidelity & Graphics Enhancements
- **`src/components/Robot3DCanvas.tsx`**:
  - **High-Fidelity PBR Materials**: Integrated `THREE.MeshPhysicalMaterial` with clearcoat lacquer (`clearcoat: 0.35`, `roughness: 0.25`) for metallic chassis, and transparent acrylic transmission (`transmission: 0.55`, `ior: 1.49`) for the sensor dome.
  - **4-Point Cinematic Lighting Rig**: Key light (1.2 intensity, 2048x2048 PCF soft shadows), fill light (0.6), cyan hemisphere ambient light (0.75), and rim backlight (0.45).
  - **Spatial Reference Helpers**: Added concentric distance rings at $r = 0.15\text{m}$, $0.30\text{m}$, and $0.45\text{m}$ and a cyan forward heading arrow guide.
  - **Quality Preset Switcher**: Added runtime Low / Balanced / High switcher with dynamic shadow map resolution and pixel ratio clamping (`min(window.dpr, 1.5x - 2.0x)`).
  - **Diagnostic HUD**: Added live measured FPS and frame time diagnostic indicator.
- **`src/components/DynamicCameraFPV.tsx`**:
  - **Waveshare IMX219 Optical Model**: Upgraded perspective camera field of view from 82° to 105° wide-angle lens emulation.
  - **Optical Vignette Overlay**: Implemented radial gradient lens vignette overlay replicating physical camera barrel optics.
  - **HUD Throttling**: Throttled DOM telemetry overlay updates to 45ms (~20Hz), eliminating main-thread reflow overhead.
  - **FPV Frame Rate Counter**: Added live FPS indicator on the FPV OSD.

---

### 4. Verification & Testing Infrastructure
- **`scripts/verify_phase3_4_fidelity.mjs`**:
  - Created end-to-end automated Playwright test suite covering:
    - 3D WebGL context verification.
    - 7 CAD inspection mode transitions.
    - 3 render quality presets.
    - 20 rapid workspace layout switches.
    - Differential drive motion and trajectory tracking.
    - Emergency Stop safety interlock.
    - Clean simulation reset.
  - Captured 7 high-resolution screenshots in `reports/phase3_4_implementation/screenshots/`.
  - Exported machine-readable test results to `reports/phase3_4_implementation/test-results.json`.

---

### 5. Architectural Non-Regressions & Guarantees
- **Physics Engine Untouched**: `useSimulationStore.ts` differential drive equations, wheel radius, track width, and obstacle collision restitution logic were 100% preserved.
- **TypeScript & Build Cleanliness**: 0 type errors (`npm run lint`), 0 bundle warnings (`npm run build`).
