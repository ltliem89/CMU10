# BÁO CÁO 06: RỦI RO HỒI QUY MÔ PHỎNG & BẢO TOÀN VẬT LÍ (SIMULATION REGRESSION RISKS)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10 STEM)

> **Mục tiêu tài liệu**: Phân tích toàn diện các rủi ro hồi quy (regression risks) về mô hình vật lí, hệ quy chiếu không gian, đồng bộ đa khung nhìn và hiệu năng render khi tiến hành tái cấu trúc giao diện ở Phase B. Thiết lập bộ quy tắc bất biến (invariants) mà bất kỳ thay đổi UI nào cũng KHÔNG ĐƯỢC PHÉP vi phạm.

---

## 1. Các Đại Lượng Vật Lí Bất Biến & Mô Hình Động Học Vi Sai (Physical Invariants)

Hệ thống mô phỏng JetBot tuân theo mô hình động học vi sai unicycle (Differential Drive Kinematics) được quy định chặt chẽ trong `src/stores/useSimulationStore.ts`:

### A. Hằng Số Cơ Khí & Vật Lí Chuẩn Của JetBot
- **Bán kính bánh xe ($r$)**: $0.0325\text{ m}$ (Đường kính bánh xe tiêu chuẩn $65\text{ mm}$).
- **Khoảng cách giữa hai bánh ($L$)**: $0.130\text{ m}$ ($130\text{ mm}$ Track width).
- **Vận tốc tuyến tính cực đại ($v_{max}$)**: $0.80\text{ m/s}$.
- **Vận tốc góc cực đại ($\omega_{max}$)**: $4.50\text{ rad/s}$.
- **Kích thước sa bàn chuẩn ($W \times H$)**: $3.0\text{ m} \times 2.0\text{ m}$ (Tọa độ $x \in [-1.5, 1.5]\text{m}$, $z \in [-1.0, 1.0]\text{m}$).
- **Chu kỳ cập nhật thời gian thực ($\Delta t$)**: $0.033\text{ s}$ ($\sim 30\text{ Hz}$).

### B. Phương Trình Động Học Vật Lí 10 (Differential Drive Equations)
Cho vận tốc hai bánh $v_L, v_R$:
$$\begin{aligned}
v &= \frac{v_R + v_L}{2} \quad (\text{Vận tốc dài của tâm xe}) \\
\omega &= \frac{v_R - v_L}{L} \quad (\text{Vận tốc góc quay quanh trục đứng}) \\
\dot{x} &= v \cdot \cos(\psi) \\
\dot{z} &= -v \cdot \sin(\psi) \\
\dot{\psi} &= \omega
\end{aligned}$$
*(Trong đó $\psi$ là góc hướng yaw).*

> [!CAUTION]
> **QUY TẮC BẤT BIẾN SỐ 1**: Khi tái cấu trúc giao diện Phase B, **tuyệt đối không được can thiệp hoặc sửa đổi các phương trình tính toán động học và tham số vật lí** trong `src/stores/useSimulationStore.ts`. Giao diện có thể thay đổi bố cục, nhưng vật lí phải giữ nguyên 100%.

---

## 2. Toàn Vẹn Hệ Quy Chiếu Không Gian (Coordinate Space Integrity)

Hệ thống CMU10 duy trì sự chuyển đổi khép kín và chính xác giữa 3 không gian tọa độ thông qua thư viện `src/utils/coordinateTransforms.ts`:

```
┌─────────────────────────────────┐
│     WORLD SPACE (Hệ Mét)        │
│ x: [-1.5 .. 1.5]m, z: [-1 .. 1]m│
└───────────────▲─────────────────┘
                │  worldToSvg() / svgToWorld()
                ▼
┌─────────────────────────────────┐
│     SVG SPACE (ViewBox)         │
│ u: [0 .. 600]px, v: [0 .. 400]px│
└───────────────▲─────────────────┘
                │  MDN getScreenCTM().inverse()
                ▼
┌─────────────────────────────────┐
│     SCREEN SPACE (Pixel Chuột)  │
│ clientX, clientY (CSS Viewport) │
└─────────────────────────────────┘
```

### Các Nguy Cơ Hồi Quy Tọa Độ Khi Redesign UI:
1. **Lệch điểm nhấp chuột (Coordinate Drift)**: Khi đưa `<TacticalArenaMap />` vào các container mới (flex, grid, css transform, scroll panel), nếu dùng `getBoundingClientRect()` thủ công có thể gây sai lệch tọa độ đặt cọc tiêu đích (Click-to-Goal).  
   *Giải pháp*: Bắt buộc duy trì phương thức chuẩn W3C/MDN `svg.getScreenCTM().inverse()` đã được hoàn thiện tại Phase 3.6.
2. **Kéo lệch bản đồ khi bấm nút (Drag/Pan Leak)**: Khi người dùng bấm các nút điều khiển nổi trên bản đồ, sự kiện chuột có thể bị rò rỉ làm bản đồ bị trôi.  
   *Giải pháp*: Giữ nguyên cơ chế `dragThreshold > 5px` và `e.stopPropagation()` trên thanh công cụ nổi.

---

## 3. Tính Toàn Vẹn Đồng Bộ Đa Khung Nhìn (Multi-Viewport Synchronization)

Khi robot di chuyển trên sa bàn, 3 khung nhìn phải phản ánh chính xác trạng thái vật lí:

| Khung nhìn | Công nghệ | Nguồn dữ liệu | Biểu diễn vật lí |
| :--- | :--- | :--- | :--- |
| **1. Sa Bàn Chiến Thuật 2D** | SVG Vector | `(simState.x, simState.z, simState.yaw)` | Tọa độ phẳng $(u, v)$, mũi tên chỉ hướng, nón quét cảm biến siêu âm, vệt quỹ đạo đã đi |
| **2. Robot 3D Digital Twin** | Three.js WebGL | `(leftSpeed, rightSpeed, yaw, wheelAngles)` | Bánh xe quay đúng vận tốc góc $\omega_w$, xe xoay hướng trong không gian 3D, đổ bóng mềm |
| **3. Camera FPV Thực Tế** | Canvas Shader | `(x, z, yaw, obstacles)` | Góc nhìn gắn tại mũi xe hướng về trước, tâm ngắm, phát hiện và phóng to chướng ngại vật |

### Nguy Cơ Hồi Quy Đa Khung Nhìn Khi Redesign:
- **Nguy cơ Desync**: Nếu một màn hình mới tách rời gọi riêng lẻ hàm điều khiển mà không thông qua `simulationStore.setMotorSpeeds()`, trạng thái robot giữa 3 khung nhìn sẽ bị lệch nhau.
- **Rủi ro rò rỉ WebGL Context (Context Loss)**: Nếu việc chuyển tab trong Phase B unmount và mount lại component Three.js liên tục mà không gọi `renderer.dispose()` và dọn dẹp geometries/materials, trình duyệt sẽ bị lỗi WebGL Context Lost sau 16 lần chuyển tab.

---

## 4. Bảng Đánh Giá Rủi Ro Hồi Quy Chi Tiết

| Mã Rủi Ro | Mô Tả Rủi Ro Kỹ Thuật | Mức Độ | Tác Động Tiềm Tàng | Biện Pháp Kiểm Soát & Phòng Ngừa Cho Phase B |
| :--- | :--- | :--- | :--- | :--- |
| **R1** | Sửa nhầm công thức động học vi sai trong Store | **CRITICAL** | Robot di chuyển sai quỹ đạo, sai định luật Vật lí 10 | Đóng băng (Freeze) file `useSimulationStore.ts`, không chỉnh sửa logic vật lí |
| **R2** | Sai lệch tọa độ Click-to-Goal do thay đổi container layout | **HIGH** | Bấm đặt đích trên sa bàn một nơi, cọc tiêu xuất hiện một nẻo | Bảo toàn thư viện `coordinateTransforms.ts` và kiểm tra tự động E2E |
| **R3** | WebGL Context Lost khi chuyển tab nhiều lần | **HIGH** | Màn hình 3D biến thành màu đen hoặc crash tab trình duyệt | Duy trì `ErrorBoundary` và logic dọn dẹp `renderer.dispose()` trong `Robot3DCanvas.tsx` |
| **R4** | Trùng lặp trạng thái giữa `TripleViewCockpit` và `RobotTwinMotorSimulator` | **MEDIUM** | Người học điều khiển ở trang bài học nhưng buồng lái không cập nhật | Thay thế `RobotTwinMotorSimulator` bằng cách kết nối vào `useSimulationStore` |
| **R5** | Bão Re-render (Render Storm) do Telemetry 30Hz | **MEDIUM** | Giao diện bị đơ (jank), tụt FPS từ 60 xuống dưới 20 | Bắt buộc duy trì `CockpitTelemetryStrip` bọc `React.memo` và throttle 50ms |

---

## 5. Tiêu Chí Nghiệm Thu Kiểm Thử Bắt Buộc Cho Phase B (Regression Verification Gate)

Bất kỳ đề xuất thiết kế lại nào trong Phase B phải vượt qua các bài kiểm thử sau trước khi được phê duyệt:

1. **Gate 1 - Toàn vẹn TypeScript & Build**: `npm run lint` và `npm run build` kết thúc với mã lỗi `0`.
2. **Gate 2 - Chuyển động vật lí**: Robot di chuyển thẳng khi $v_L = v_R$, quay tại chỗ khi $v_L = -v_R$, dừng hoàn toàn khi bấm E-STOP.
3. **Gate 3 - Tọa độ sa bàn**: Bấm chuột vào góc sa bàn $(-1.0, 0.5)$ tạo đích đến đúng tọa độ trong giới hạn sai số $< 0.02\text{m}$.
4. **Gate 4 - Đa khung nhìn**: 3 khung nhìn (2D, 3D, FPV) đồng bộ trạng thái khi robot di chuyển trong mọi chế độ layout (Standard, Focus, Split, Triple, PiP).
5. **Gate 5 - Độ ổn định chuyển tab**: Chuyển đổi qua lại giữa 5 trụ cột chức năng 20 chu kỳ liên tiếp không gây lỗi console hoặc WebGL crash.
