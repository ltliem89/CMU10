# ĐÁNH GIÁ CHẤT LƯỢNG HÌNH ẢNH & ĐỘ CHÂN THỰC (VISUAL FIDELITY AUDIT)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Visual Fidelity & Graphics Inspection

---

## 1. Chất Lượng Hình Học Mô Hình (Model Quality & Mechanical Accuracy)

### 1.1. Hiện Trạng & Phân Tích Kỹ Thuật
- **Vị trí mã nguồn**: `src/types/robotGeometry.ts:79` và `src/components/Robot3DCanvas.tsx:285–675`.
- **Thông số hình học chuẩn hóa**:
  - Dài × Rộng × Cao: $138\text{ mm} \times 125\text{ mm} \times 130\text{ mm}$.
  - Bán kính bánh xe: $R = 32.5\text{ mm}$ (Đường kính 65 mm), bản lốp rộng $26\text{ mm}$.
  - Khoảng cách hai bánh vi sai: $b = 102\text{ mm}$.
  - Khoảng sáng gầm xe: $12\text{ mm}$. Bánh bi sau (Caster): $R = 7.5\text{ mm}$, lùi sau trục trước $55\text{ mm}$.
- **Phương pháp tạo hình**:
  - 100% chi tiết được dựng thủ công bằng Three.js Primitives (`ShapeGeometry`, `CylinderGeometry`, `BoxGeometry`, `TorusGeometry`, `ExtrudeGeometry`).
  - Bao gồm: Sàn đáy nhôm CNC, sàn trên mica xanh, cọc đồng M3 (tier spacing 35mm), động cơ giảm tốc vàng TT motor, bánh xe cao su nan hoa xẻ rãnh, tản nhiệt nhôm đen Jetson Nano với các rãnh xẻ, camera CSI Sony IMX219, cảm biến siêu âm HC-SR04 2 mắt phát/thu, khay pin 3S 18650 và cặp ăng-ten WiFi chữ V nghiêng 45°.
- **Phát hiện sự cố kỹ thuật (Lỗi Nghiêm Trọng P0)**:
  - **Bằng chứng xác minh runtime**: Trong quá trình khởi tạo mô hình 3D (`useEffect`), hàm tạo wireframe tại dòng `Robot3DCanvas.tsx:682` duyệt `robotRoot.traverse((child) => { child.add(wireMesh) })`. Thao tác thêm `wireMesh` lồng trực tiếp vào `child` trong lúc duyệt gây đệ quy vô hạn:
    ```
    RangeError: Maximum call stack size exceeded at new Color (three.js) ... at Robot3DCanvas.tsx:591
    ```
  - Hậu quả: Three.js crash ngay lập tức trước khi kịp vẽ frame đầu tiên, kích hoạt cờ `setWebglError(true)` và hiển thị giao diện thay thế `Mô Phỏng 2.5D Chuẩn CMU10`. Người dùng hoàn toàn không xem được mô hình 3D thực tế!
- **Mức ảnh hưởng thị giác**: CỰC KỲ CAO (Mô hình 3D bị ẩn hoàn toàn).
- **Chi phí GPU/CPU dự kiến**: Fix lỗi sẽ tốn ~2–5% GPU cho 3D Canvas, duy trì 60 FPS.
- **Giải pháp đề xuất**:
  1. Tách mảng duyệt: `const meshes: THREE.Mesh[] = []; robotRoot.traverse(c => { if (c.isMesh) meshes.push(c); });` rồi mới tạo wireframe gắn riêng vào group helper ngoài, không `add()` vào cây đang duyệt.
  2. Về lâu dài: Đóng gói toàn bộ mô hình thành file GLTF/GLB nén Draco (~350 KB), giảm draw calls từ 35 xuống 2–3 batches.
- **Rủi ro**: Rất thấp (Sửa thuật toán duyệt).

---

## 2. Vật Liệu & Ánh Sáng (Materials & Lighting Fidelity)

### 2.1. Hiện Trạng
- **Vị trí mã nguồn**: `src/components/Robot3DCanvas.tsx:220–280` và `DynamicCameraFPV.tsx:75–145`.
- **Hệ thống vật liệu**:
  - Sử dụng `MeshStandardMaterial` và `MeshPhysicalMaterial` cho thấu kính camera.
  - Tuy nhiên, tất cả chỉ được gán màu phẳng đơn sắc (`color: hex`, `metalness`, `roughness`). Hoàn toàn không có **PBR Textures** (Normal Maps, Roughness Maps, Metalness Maps, Ambient Occlusion Maps).
  - Bề mặt lốp cao su phẳng lỳ, không có độ gai gồ ghề của rãnh bánh xe cao su.
  - Tản nhiệt nhôm đen và bo mạch PCB Jetson Nano không có chi tiết mạch in, chân tụ điện hay vân xước kim loại (Brushed metal).
- **Hệ thống ánh sáng**:
  - Scene 3D dùng 3 đèn: Ambient (0.75), Main Key Directional (1.4, shadow map 1024x1024), Fill (0.6, xanh dương), Rim (0.5, cam).
  - Không có môi trường ánh sáng thực tế IBL (Image-Based Lighting / HDR Environment Map). Kết quả: kim loại phản xạ màu trời xám đục, không có ánh sáng tự nhiên của phòng thí nghiệm Robotics.
  - Scene FPV chỉ có 1 Directional Light và 1 Ambient Light, không có bóng đổ (Shadow Map bị tắt hoàn toàn).
- **Mức ảnh hưởng thị giác**: TRUNG BÌNH - CAO (Hình ảnh trông giống đồ họa kỹ thuật thập niên 2010 hơn là game mô phỏng hiện đại).
- **Giải pháp đề xuất**:
  1. Thêm bộ texture PBR procedural hoặc texture map nén WebP/KTX2 cho mặt sàn nhựa đường (Asphalt), lốp xe cao su và vỏ nhôm.
  2. Bổ sung `RoomEnvironment` hoặc `RGBELoader` tải bản đồ HDR studio 512x256 (~200 KB) cho Three.js PBR IBL.
  3. Kích hoạt bóng đổ tiếp xúc (Contact Shadows) dưới gầm bánh xe.

---

## 3. Độ Nét Hình Ảnh (Image Sharpness & Resolution Backing)

### 3.1. Hiện Trạng & Đo Đạc Thực Tế
- **Dữ liệu runtime xác minh**:
  - `devicePixelRatio` trên máy đo: `1.0`.
  - Renderer áp dụng: `renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))`.
  - Kích thước canvas thực tế (Scenario B):
    - Canvas 3D: CSS Width 346px, Backing Width 346px (Tỷ lệ 1.0).
    - Canvas FPV: CSS Width 348px, Backing Width 348px (Tỷ lệ 1.0).
- **Nhận định chất lượng**:
  - Ở màn hình DPI tiêu chuẩn (1080p Desktop), tỷ lệ 1:1 cho độ nét ổn định.
  - Tuy nhiên trên màn hình High-DPI (Retina, 2K/4K, màn hình cảm ứng), giới hạn 2x đôi khi làm tăng tải GPU nếu không bật adaptive quality.
  - Thiếu bộ lọc khử răng cưa hậu kỳ (FXAA/SMAA). Các đường dây điện, ăng-ten SMA 10mm và cọc ren M3 xuất hiện hiện tượng vỡ hạt/nhấp nháy (Pixel Shimmering / Aliasing) khi xoay camera.
- **Giải pháp đề xuất**:
  - Tích hợp bộ lọc SMAA nhẹ (Subpixel Morphological Antialiasing) trong EffectComposer.
  - Cung cấp tùy chọn cài đặt chất lượng đồ họa: **Low (1.0x, No AA)**, **Balanced (1.5x, FXAA)**, **High (Native DPR, SMAA, Soft Shadows)**.

---

## 4. Trình Diễn Camera & Góc Nhìn FPV (Camera & First-Person Presentation)

### 4.1. Hiện Trạng & Đo Đạc Thực Tế
- **Vị trí mã nguồn**: `src/components/DynamicCameraFPV.tsx:53–185`.
- **Thông số cấu hình camera**:
  - `PerspectiveCamera(82, width / height, 0.02, 12)`
  - Góc chúc xuống: $18^\circ$ (Pitch Down $\approx 0.31\text{ rad}$).
  - Khoảng cách ngắm mục tiêu: $0.6\text{ m}$.
- **Phát hiện sự cố & Sai lệch thực tế**:
  1. **Sai lệch thấu kính**: Camera vật lý JetBot dùng module Sony IMX219 có góc siêu rộng **160° Fisheye**. Nhưng simulator dùng camera phẳng 82° thông thường. Do đó, người học không thấy được hiện tượng cong ảnh và góc quan sát mép bánh xe trước - yếu tố bắt buộc khi học bài toán "Road Following / Collision Avoidance" bằng mạng nơ-ron CNN.
  2. **Bố cục hiển thị bị chèn ép**: Khi mở tab Standard hoặc Triple View, panel FPV bị co hẹp còn 200px chiều cao. Thẻ tiêu đề "Khung C: Camera FPV Thực..." chiếm tới hơn 50% diện tích, khiến vùng quan sát camera 3D thực tế chỉ còn một dải hẹp ~40–60px (xem ảnh `fpv_camera_view.png`).
- **Giải pháp đề xuất**:
  1. Thêm Custom Post-Processing Shader mô phỏng biến dạng thấu kính Fisheye (Barrel Distortion Shader) với thông số $k_1 = -0.15, k_2 = 0.05$.
  2. Thiết kế lại HUD FPV dạng OSD (On-Screen Display) trong suốt đè lên trên canvas thay vì dùng header card chiếm chỗ bên ngoài.

---

## 5. Môi Trường Sa Bàn Đua (Environment & Race Track)

### 5.1. Hiện Trạng
- **Vị trí mã nguồn**: `src/components/TacticalArenaMap.tsx:115–144` và `DynamicCameraFPV.tsx:73–152`.
- **Đặc điểm môi trường**:
  - Kích thước sa bàn chuẩn: $3.0\text{ m} \times 2.0\text{ m}$ (Thực tế hộp rào $3.2\text{ m} \times 2.2\text{ m}$).
  - Đường đua: Đường cong kín Catmull-Rom với vạch tim đường nét đứt màu vàng (`#FACC15`) và vạch biên trắng viền xám.
  - 4 vật cản: Khối LEGO vàng ($R=0.12\text{m}$), Hộp gỗ cam ($R=0.15\text{m}$), Trụ tiêu đỏ ($R=0.10\text{m}$), Khối rào xanh ($R=0.14\text{m}$).
- **Nhận định chất lượng**:
  - Bản đồ SVG 2D (`TacticalArenaMap`) hiển thị rất đẹp, rõ ràng, tương phản cao, đúng chuẩn giáo dục STEM.
  - Ngược lại, Scene FPV 3D còn quá sơ sài: mặt sàn phẳng nhẵn thín, vạch đường là các ống `TubeGeometry` đơn giản, các khối vật cản là hình trụ/hộp đơn sắc không có gờ ráp, không có bóng đổ nền, gây cảm giác không gian phẳng và mất cảm nhận chiều sâu khi xe tiến lại gần vật cản.
- **Giải pháp đề xuất**:
  - Thay mặt phẳng sàn bằng Grid Asphalt PBR Texture.
  - Đổ bóng thực cho các vật cản trong FPV View.
  - Thêm hiệu ứng gờ giảm tốc (Curbs) đỏ-trắng ở các góc cua đường đua.

---

## 6. Giao Diện Người Dùng & HUD Cảm Biến (UI / HUD Presentation)

### 6.1. Hiện Trạng
- **Bảng màu**: Chuẩn STEM Vibrant Design Tokens (Xanh dương, Tím Neon, Hồng, Cam, Vàng, Xanh lá).
- **Các thông số Telemetry**:
  - Thời gian mô phỏng $T$ (s).
  - Tọa độ vị trí $(X, Z)$ mét.
  - Góc hướng xe YAW ($^\circ$).
  - Công suất xung động cơ $\text{PWM}_L, \text{PWM}_R$ (%).
  - Khoảng cách cảm biến siêu âm (cm) và mục tiêu AI Camera Aim Pixel $(X, Y) \in [0..224]$.
- **Đánh giá trải nghiệm**:
  - Tương phản văn bản xuất sắc trên nền tối Dark Slate (`#0B1120`, `#070D1B`).
  - Hỗ trợ đầy đủ phím tắt bàn phím (Mũi tên điều khiển, Spacebar ngắt khẩn cấp, Escape thoát fullscreen).
  - Vấn đề duy nhất là thanh telemetry và header toolbar chiếm khoảng ~25% tổng chiều cao khi ở màn hình nhỏ (1366x768), cần có chế độ tự ẩn (Auto-collapse HUD) khi người dùng muốn tập trung toàn lực vào sa bàn.
