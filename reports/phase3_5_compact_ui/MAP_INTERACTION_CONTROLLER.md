# CMU10 Phase 3.5 — Map Interaction Controller & Coordinate Engine

## 1. Overview & Architecture
The `TacticalArenaMap.tsx` component was elevated from a static SVG display into a **dynamic, multi-modal Interactive Map Controller**. It decouples display viewport transformations from physical world simulations, providing game-engine quality navigation (Pan, Zoom, Follow, Focus, and Click-to-Goal) without ever mutating robot physics or waypoint data.

---

## 2. Coordinate System Hierarchy & Mathematical Derivations

The controller maintains three strictly segregated coordinate spaces:

```
[Screen Coordinates (Pixels)]
            │  (Canvas Bounding Client Rect)
            ▼
[View Coordinates (SVG Space: 0..600 x 0..400)]
            │  (Inverse Pan & Zoom: uBase = (uSvg - panX) / zoom)
            ▼
[World Coordinates (Simulation Metrics: X: -1.5..1.5m, Z: -1.0..1.0m)]
```

### 2.1 Forward Coordinate Transformation (World $\to$ Screen)
Given physical robot pose $(x, z) \in [-1.5, 1.5] \times [-1.0, 1.0]$:
$$u_{base} = \left(\frac{x + 1.5}{3.0}\right) \times 600$$
$$v_{base} = \left(\frac{z + 1.0}{2.0}\right) \times 400$$

With pan $(\text{panX}, \text{panY})$ and zoom factor $s$:
$$u_{view} = \text{panX} + s \cdot u_{base}$$
$$v_{view} = \text{panY} + s \cdot v_{base}$$

### 2.2 Inverse Coordinate Transformation (Screen $\to$ World)
Given mouse event client position $(e.clientX, e.clientY)$ and SVG bounding client rect:
$$u_{svg} = \left(\frac{e.clientX - rect.left}{rect.width}\right) \times 600$$
$$v_{svg} = \left(\frac{e.clientY - rect.top}{rect.height}\right) \times 400$$

Inverting the display transform:
$$u_{base} = \frac{u_{svg} - \text{panX}}{s}, \quad v_{base} = \frac{v_{svg} - \text{panY}}{s}$$

Converting base SVG units to world metric meters:
$$x_{world} = \left(\frac{u_{base}}{600}\right) \times 3.0 - 1.5$$
$$z_{world} = \left(\frac{v_{base}}{400}\right) \times 2.0 - 1.0$$
$$\text{clamped to } x_{world} \in [-1.50, 1.50]\text{m}, \quad z_{world} \in [-1.00, 1.00]\text{m}$$

This inverse transformation guarantees sub-millimeter precision when setting goals or placing waypoints regardless of the current zoom level or pan offset.

---

## 3. Zoom Engine & Focal Point Anchoring

### 3.1 Anchor Point Preservation (Zero Jitter Wheel Zoom)
When zooming with mouse wheel at focal point $P = (u_{svg}, v_{svg})$, the world point beneath the cursor must remain fixed at $P$:
$$\frac{P - \text{panX}_2}{s_2} = \frac{P - \text{panX}_1}{s_1}$$
$$\implies \text{panX}_2 = P_x - \frac{s_2}{s_1}(P_x - \text{panX}_1)$$
$$\implies \text{panY}_2 = P_y - \frac{s_2}{s_1}(P_y - \text{panY}_1)$$

### 3.2 Zoom Limits & Presets
- **Range**: Clamped between $0.5\times$ (50%) and $5.0\times$ (500%).
- **Zoom In (`+`)**: Multiplies zoom by $1.25$ centered on viewport center $(300, 200)$.
- **Zoom Out (`-`)**: Multiplies zoom by $0.80$ centered on viewport center $(300, 200)$.
- **1-Click Reset (`100%`)**: Restores $s = 1.0$, $\text{panX} = 0$, $\text{panY} = 0$.
- **Fit to Frame (`Vừa Khung`)**: Resets to canonical $100\%$ overview.

---

## 4. Pan Interaction & Gesture Handling

The controller supports three seamless pan modes:
1. **Middle Mouse Drag**: Button 1 drag instantly moves the camera.
2. **Spacebar + Left Click Drag**: Holding Space activates `cursor-grab`; dragging activates `cursor-grabbing`.
3. **Dedicated Pan Mode Toggle (`Kéo`)**: Allows single-click dragging for touchpad or trackball users.
4. **Safety Disconnection**: Any manual pan event immediately deactivates `Follow Robot`, allowing free camera movement without fighting the auto-tracker.

---

## 5. Camera Centering & Follow Modes

| Mode | Trigger | Behavior |
| :--- | :--- | :--- |
| **Focus Robot** | `handleFocusRobot` | Instantly centers camera on $(robotSvgX, robotSvgY)$ at current zoom level. |
| **Follow Robot** | `handleToggleFollowRobot` | Active camera tracking mode. Updates pan $(\text{panX}, \text{panY})$ synchronously on every simulation tick to keep the JetBot centered at $(300, 200)$. |
| **Free Map** | Manual Pan / Button | Deactivates tracking, returning full manual control to the user. |
| **Focus Goal** | `handleFocusGoal` | Centers camera on the active target goal or the furthest waypoint. |
| **Fit All** | `handleFitAll` | Restores standard $100\%$ arena view. |

---

## 6. Click-to-Goal & Navigation Safety

To prevent accidental robot movement:
1. User activates `Mục Tiêu` (Goal) mode.
2. User clicks anywhere on the tactical map.
3. Inverse transform calculates $(x_{world}, z_{world})$.
4. An animated target beacon with a pulsating halo appears at the chosen point.
5. A confirmation dialog pill appears:
   $$\text{Đích: } X = \dots\text{m}, Z = \dots\text{m} \quad [\text{Bắt Đầu}] \quad [\text{Hủy}]$$
6. Only upon clicking `Bắt Đầu` is a command issued to `simulationStore.setMotorSpeeds(...)` and `simulationStore.run()`.
7. Clicking `Hủy` cleanly clears the pending goal.

---

## 7. Fullscreen & Canvas Scalability

- Clicking the fullscreen toggle expands the map to `fixed inset-0 z-50 p-2 bg-[#050914]`.
- SVG uses `preserveAspectRatio="xMidYMid meet"` combined with vector coordinate transforms.
- Fullscreen entry and exit cause **zero pixel distortion, zero blurring, and zero coordinate drift**.
