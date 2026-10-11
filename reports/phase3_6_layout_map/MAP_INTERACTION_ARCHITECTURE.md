# CMU10 — PHASE 3.6: MAP INTERACTION ARCHITECTURE
## Kiến Trúc Bộ Điều Khiển Tương Tác Sa Bàn (Map Controller)

---

### 1. KIẾN TRÚC THÀNH PHẦN (COMPONENT ARCHITECTURE)

Bộ điều khiển tương tác sa bàn được triển khai trong hai mô-đun cốt lõi:
1. **`src/utils/coordinateTransforms.ts`**: Thư viện thuần túy (pure spatial math library) chứa các hàm biến đổi không gian, ma trận SVG và thuật toán kiểm tra an toàn va chạm.
2. **`src/components/TacticalArenaMap.tsx`**: Thành phần React Viewport Controller quản lý sự kiện con trỏ Pointer Events, vòng đời xác nhận mục tiêu, máy trạng thái quan sát và đồng bộ dữ liệu với SimulationStore.

```
┌────────────────────────────────────────────────────────┐
│                  TacticalArenaMap.tsx                  │
├────────────────────────────────────────────────────────┤
│  State Machine: FREE | FOLLOW | FOCUS | FIT_ALL        │
│  Pointer Engine: PointerCapture, Threshold (>5px)      │
│  Lifecycle: Goal Validation, Confirmation & Navigation │
└───────────────────────────┬────────────────────────────┘
                            │
              Calls Pure Coordinate Engine
                            ▼
┌────────────────────────────────────────────────────────┐
│            coordinateTransforms.ts                     │
├────────────────────────────────────────────────────────┤
│  • worldToSvg(world: Point2D): SvgPoint                │
│  • svgToWorld(svg: SvgPoint): Point2D                  │
│  • screenToWorld(screen, svgElement, transform)        │
│  • worldToScreen(world, svgElement, transform)         │
│  • zoomAtPoint(focalScreen, transform, factor, svg)    │
│  • panByScreenDelta(dx, dy, transform, svg)            │
│  • validateGoalPoint(goal, obstacles)                  │
└────────────────────────────────────────────────────────┘
```

---

### 2. XỬ LÝ SỰ KIỆN CON TRỎ (POINTER EVENTS & CAPTURE)

Tuân thủ khuyến nghị chính thức của MDN về **Pointer Events**:
- **Bắt điểm bắt đầu (`pointerdown`)**:
  - Ghi nhận `pointerId`, lưu vị trí ban đầu `pointerDownPosRef` và ma trận ban đầu `dragStartTransformRef`.
  - Phân loại ý định: Nếu bấm nút giữa (button 1) hoặc đang giữ phím Space hoặc đang ở chế độ Pan mode $\rightarrow$ kích hoạt cờ `isPanDrag = true`.
  - Khóa bắt con trỏ bằng `e.currentTarget.setPointerCapture(pointerId)` trên thẻ bao bọc container.
  - Tách biệt kiểm tra các nút điều khiển overlay: Nếu điểm chạm thuộc về `<button>` hoặc phần tử điều khiển, bỏ qua logic kéo sa bàn để tránh chặn sự kiện click của nút.
- **Dịch chuyển (`pointermove`)**:
  - Cập nhật tọa độ thế giới của con trỏ hiển thị trên HUD (`cursorWorldPos`).
  - Đo khoảng cách di chuyển thực tế $\Delta = \sqrt{\Delta x^2 + \Delta y^2}$. Khi $\Delta > 5\text{ px}$, kích hoạt `hasExceededDragThreshold = true`.
  - Nếu `isPanDrag == true` và đã vượt ngưỡng kéo, tính toán độ dời SVG theo thời gian thực và cập nhật `panX`, `panY`.
- **Kết thúc (`pointerup` / `pointercancel`)**:
  - Giải phóng con trỏ bằng `releasePointerCapture(pointerId)`.
  - Đặt lại cờ kéo `isPanDrag = false`, `isActivelyPanning = false`.
  - Nếu `hasExceededDragThreshold == true`: Kết thúc thao tác kéo, không thực hiện hành động click.
  - Nếu không vượt ngưỡng kéo: Xử lý thao tác Click theo chế độ (`goal`, `waypoint`, `inspect`).

---

### 3. VÒNG ĐỜI CLICK-TO-GOAL VÀ GIÁM SÁT TIẾP CẬN MỤC TIÊU

Quy trình đặt mục tiêu được quản lý qua 6 trạng thái (`GoalExecutionStatus`):

```
       [IDLE]
         │
         │ Người dùng click lên sa bàn (trong Goal Mode)
         ▼
    Kiểm tra Hợp Lệ
   ┌─────┴─────┐
   ▼           ▼
[BLOCKED]  [CONFIRMING]
 (Báo lỗi)     │
               │ Bấm "Bắt Đầu"
               ▼
           [RUNNING] (Tính góc quay & vận tốc động cơ)
               │
      ┌────────┴────────┐
      │ d <= 0.08m      │ Phát hiện vật cản (d < 0.15m)
      ▼                 ▼
  [REACHED]         [BLOCKED]
(Hãm phanh 0m/s)  (Hãm phanh an toàn)
```

1. **`IDLE`**: Chưa có mục tiêu nào được chọn.
2. **`CONFIRMING`**: Điểm mục tiêu đã được xác thực an toàn. Hiển thị mục tiêu phát sáng trên bản đồ và thanh thông báo nổi (Goal Pill) hiển thị tọa độ $(X, Z)$ và khoảng cách từ robot.
3. **`RUNNING`**: Người dùng đã xác nhận. Bộ điều khiển tính toán góc lệch hướng $\theta_{err} = \text{atan2}(\Delta z, \Delta x) - \text{yaw}$ và áp dụng điều khiển vi sai:
   - Nếu $|\theta_{err}| > 0.2\text{ rad}$: Điều chỉnh vận tốc bánh trái/phải để xoay hướng về phía mục tiêu.
   - Khi đã thẳng hướng: Cấp vận tốc đều hai bánh để tiến thẳng.
4. **`REACHED`**: Khi khoảng cách giữa robot và mục tiêu đạt ngưỡng $d \le 0.08\text{ m}$ ($8\text{ cm}$), hệ thống tự động:
   - Cắt vận tốc hai động cơ về 0.
   - Cập nhật trạng thái thành `Đã Đến!`.
   - Ghi nhật ký sự kiện thành công vào Telemetry Logs.
5. **`BLOCKED`**: Nếu điểm chọn vi phạm biên sa bàn hoặc va chạm vật cản, hiển thị thông báo cảnh báo rõ ràng và từ chối tạo mục tiêu.

---

### 4. ĐỒNG BỘ ĐA KHUNG NHÌN (MULTI-VIEWPORT COHERENCE)

Toàn bộ hệ thống duy trì tính nhất quán tuyệt đối về trạng thái robot:
- Khung nhìn 2D Sa Bàn (`TacticalArenaMap.tsx`), Khung nhìn 3D Digital Twin (`Robot3DCanvas.tsx`) và Camera FPV (`DynamicCameraFPV.tsx`) đều đọc chung nguồn dữ liệu duy nhất từ `simulationStore`.
- Bất kỳ thay đổi vị trí hay góc xoay nào của robot trong mô phỏng vật lý đều phản ánh đồng thời trên cả 3 khung nhìn với độ trễ dưới 1 khung hình.
- Các thao tác kéo dãn, thay đổi layout (Standard, Focus, Split, Triple, PiP, Fullscreen) đều bảo toàn nguyên vẹn tọa độ mô phỏng và vị trí đích đến.
