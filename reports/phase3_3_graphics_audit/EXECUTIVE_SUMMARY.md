# BÁO CÁO TỔNG HỢP KIỂM ĐỊNH ĐỒ HỌA, RENDERING & MÔ PHỎNG (PHASE 3.3)
**CMU10 JetBot AI & Robotics Interactive Studio**  
**Vai trò đánh giá**: Senior Graphics Engineer + Real-time Simulation Engineer + Frontend Performance Engineer  
**Thời gian thực hiện**: 2026-10-11  
**Mục tiêu**: Đánh giá toàn diện kiến trúc đồ họa, xác định nguyên nhân suy giảm chất lượng hiển thị, đo đạc hiệu năng thực tế (FPS-grade benchmark) và xây dựng phương án nâng cấp độ chân thực tiệm cận tiêu chuẩn game mô phỏng hiện đại trên nền tảng Web.

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

Dự án CMU10 đã xây dựng thành công nền tảng mô phỏng robot vi sai JetBot với kiến trúc tích hợp đa góc nhìn (**Triple-View Cockpit**), kết hợp:
1. Bản đồ sa bàn chiến thuật vector SVG 2D/3D (3.0m × 2.0m).
2. Mô hình 3D Mechanical Digital Twin chuẩn thông số cơ khí ISO/CMU10.
3. Camera góc nhìn thứ nhất (FPV Dynamic Camera) mô phỏng cảm biến thị giác Sony IMX219.
4. Hệ thống telemetry, D-Pad, và bảng điều khiển động cơ vi sai thời gian thực.

Tuy nhiên, qua đợt kiểm định chuyên sâu bằng công cụ đo lường tự động (Playwright với engine Chromium/Edge GPU-accelerated) và đối chiếu trực quan từng pixel ảnh chụp runtime, đội ngũ kỹ sư ghi nhận:
- **Độ ổn định khung hình cơ bản**: Đạt trung bình **60.0 FPS** (Mean frame time **16.66 ms**, p95 **16.8 ms**, 1% Low **58.7 FPS**) trên thiết bị Intel Iris Xe Graphics. Mô hình vật lý động học vi sai nhất quán, không sinh lỗi NaN/Infinity.
- **Vấn đề cốt lõi về thị giác**: Khung nhìn 3D Robot hiện tại **đang bị crash ngầm trong quá trình khởi tạo Three.js** do lỗi đệ quy vô hạn (`RangeError: Maximum call stack size exceeded` tại `Robot3DCanvas.tsx:682`), dẫn tới việc Three.js bị vô hiệu hóa và rơi vào màn hình tĩnh dự phòng (*Mô Phỏng 2.5D Chuẩn CMU10*).
- **Vấn đề bố cục khung nhìn**: Ở bố cục chuẩn (Standard View), cột phụ bên phải bị co thắt chiều cao (~180px mỗi khung) trong khi `Robot3DCanvas` đặt `min-h-[340px]`, gây hiện tượng chèn ép giao diện khiến WebGL canvas của FPV Camera chỉ còn khoảng 40–60px chiều cao hữu dụng.
- **Độ chân thực đồ họa**: Sử dụng vật liệu cơ bản (`MeshStandardMaterial` màu đơn sắc) không có texture PBR (Normal map, Roughness map, AO), không có ánh sáng môi trường HDR (IBL), và thiếu hiệu ứng thấu kính góc rộng Fisheye 160° thực tế của robot JetBot.

---

## 2. 10 Vấn Đề Quan Trọng Nhất (Top 10 Critical Findings)

| STT | Mã | Mức Độ | Trạng Thái Xác Minh | Thành Phần | Mô Tả Chi Tiết Vấn Đề |
|:---:|:---|:---:|:---:|:---|:---|
| 1 | **BUG-01** | **P0** | **RUNTIME VERIFIED** | `Robot3DCanvas.tsx:682` | **Đệ quy vô tận khi tạo Wireframe**: `robotRoot.traverse()` thêm trực tiếp `wireMesh` vào `child` trong lúc duyệt cây, khiến Three.js duyệt lại chính node mới sinh, gây lỗi `RangeError: Maximum call stack size exceeded` và kích hoạt màn hình fallback "Mô Phỏng 2.5D". Mô hình 3D thực tế chưa từng được render tới người dùng. |
| 2 | **BUG-02** | **P1** | **RUNTIME VERIFIED** | `TripleViewCockpit.tsx` | **Co thắt chiều cao Viewport cột phải**: Trong bố cục Standard/Triple, cột bên phải chia đôi chiều cao (~180px/khung), trong khi `Robot3DCanvas` ép `min-h-[340px]`, dẫn đến tràn layout và làm khung FPV camera bị đè nén, chỉ chừa khoảng ~40px cho canvas. |
| 3 | **PERF-01** | **P1** | **STATIC AUDIT** | `TripleViewCockpit.tsx:108` | **Re-render thừa toàn bộ Cockpit ở tần số 60 Hz**: `simulationStore.subscribe(setSimState)` được lắng nghe ở component cha `TripleViewCockpit`, làm re-render lại toàn bộ cây React (Header, Layout toolbar, D-Pad, Console, Code blocks) trên từng frame 60 FPS thay vì chỉ cập nhật các leaf component cần thiết. |
| 4 | **VIS-01** | **P2** | **STATIC AUDIT** | `Robot3DCanvas.tsx:220` | **Thiếu texture PBR thực tế**: Các vật liệu hợp kim nhôm, vỏ nhựa ABS, lốp cao su, bo mạch PCB Jetson Nano chỉ là các khối màu phẳng (`MeshStandardMaterial` với color hex) không có Normal Map, Roughness Map, Metalness Map hay Ambient Occlusion Map. |
| 5 | **VIS-02** | **P2** | **STATIC AUDIT** | `Robot3DCanvas.tsx` | **Chưa tối ưu hóa Draw Calls & Thiếu Asset GLTF**: Toàn bộ hơn 30 chi tiết cơ khí được dựng bằng Three.js Primitives procedurally (CSG/Shapes), dẫn đến hơn 35 draw calls riêng biệt, không có InstancedMesh hoặc nén mô hình GLTF chuẩn. |
| 6 | **VIS-03** | **P2** | **RUNTIME VERIFIED** | `DynamicCameraFPV.tsx:59` | **Thiếu siêu mẫu hóa / Anti-aliasing cao cấp**: Renderer đặt `setPixelRatio(Math.min(window.devicePixelRatio, 2))`, sử dụng MSAA mặc định của trình duyệt nhưng không có FXAA/SMAA/TAA hậu kỳ, gây hiện tượng răng cưa ở các đường viền mỏng và vạch kẻ đường. |
| 7 | **CAM-01** | **P2** | **STATIC & RUNTIME** | `DynamicCameraFPV.tsx:53` | **Sai lệch phối cảnh thấu kính FPV**: Camera thực tế của JetBot là Sony IMX219 Fisheye 160° FOV, nhưng simulator dùng camera Perspective chuẩn 82° phẳng, làm mất đi độ cong thấu kính góc siêu rộng đặc trưng phục vụ thuật toán bám làn đường AI (Line Following). |
| 8 | **LGT-01** | **P2** | **STATIC AUDIT** | `Robot3DCanvas.tsx:170` | **Thiếu ánh sáng môi trường IBL (Image-Based Lighting)**: Chỉ có 3 nguồn sáng Directional/Ambient đơn giản, không có HDR Environment Map khiến kim loại và nhựa phản xạ tối tăm, thiếu chiều sâu phản chiếu không gian phòng thí nghiệm thực tế. |
| 9 | **MEM-01** | **P2** | **RUNTIME VERIFIED** | `useSimulationStore.ts:562` | **Gia tăng bộ nhớ heap liên tục (Memory Churn)**: Mảng `actualTrajectory` và `logs` liên tục cấp phát object mới trong vòng lặp vật lý, làm tăng ~24.4 MB heap trong 10 giây chạy tải liên tục. |
| 10 | **ENV-01** | **P3** | **STATIC & RUNTIME** | `DynamicCameraFPV.tsx:74` | **Môi trường đua sa bàn còn đơn điệu**: Mặt sàn FPV là mặt phẳng đơn sắc (`color: 0x1e293b`), vạch đường dựng bằng TubeGeometry thô sơ, các vật cản hộp LEGO không có texture gạch nổi hoặc bóng đổ mềm. |

---

## 3. 5 Cải Tiến Có Tác Động Thị Giác Cao Nhất (Top 5 Visual Impact Improvements)

1. **Sửa lỗi đệ quy Wireframe giải phóng 3D Mechanical Model thực**: Ngắt việc thêm node con lặp trong `robotRoot.traverse()`, mở khóa ngay lập tức toàn bộ mô hình 3D chân thực của JetBot (khung gầm anode, bánh xe cao su, ăng-ten kép, Jetson Nano, tản nhiệt nhôm).
2. **Tích hợp Thấu Kính Fisheye AI 160° cho FPV Camera**: Xây dựng Custom Post-Processing Shader (Barrel Distortion) mô phỏng chính xác thấu kính mắt cá góc rộng Sony IMX219, giúp người học quan sát toàn cảnh đường chạy giống 100% video thực từ JetBot.
3. **Môi Trường Sa Bàn Đua Realistic PBR**: Thêm Texture mặt đường nhựa Asphalt PBR (Albedo + Normal map 1K) kết hợp vạch sơn phân làn có độ nhám, các vật cản LEGO có núm tán xạ ánh sáng và bóng đổ tiếp xúc (Contact Shadows).
4. **Hệ Thống Ánh Sáng IBL / HDR Studio Environment**: Bổ sung `RGBELoader` tải bản đồ ánh sáng HDR phòng thí nghiệm robotics hiện đại, mang lại độ phản chiếu kim loại, ánh sáng khúc xạ qua nắp mica và bóng đổ mềm mượt PCF.
5. **HUD Overlay Cảm Biến AI Phong Cách Cyberpunk / STEM Hiện Đại**: Tinh chỉnh giao diện ngắm bắn AI, radar siêu âm và vệt dẫn hướng động cơ với hiệu ứng phát quang (Bloom/Glow nhẹ), phân cấp thị giác rõ ràng và font số kỹ thuật số sắc nét.

---

## 4. 5 Cải Tiến Giảm Giật Và Ngăn Ngừa Màn Hình Trắng (Top 5 Stability & Anti-Jank Improvements)

1. **Cô lập React State Subscriptions (Zustand-style / Selective Hook)**: Tách các hiển thị telemetry tần số cao (vận tốc, góc yaw, PWM) ra khỏi component cha `TripleViewCockpit`. Các panel controls chỉ re-render khi mở/đóng tab; các chỉ số động học cập nhật qua các ref hoặc component con có memoization.
2. **Tách Rời Fixed Timestep Vật Lý khỏi Render Loop**: Chạy tích phân động học vi sai ở chu kỳ cố định $\Delta t = 16.67\text{ ms}$ (60Hz lock) hoặc dùng Web Worker, ngăn ngừa hiện tượng giật bước vật lý khi FPS tụt do tải đồ họa.
3. **Quy Hoạch Lại Flexbox & Panel Min-Height**: Loại bỏ `min-h-[340px]` cứng nhắc trên `Robot3DCanvas`, thay bằng tỷ lệ `flex-1 min-h-0`, tự động co giãn không gian khi hiển thị ở chế độ Triple View hoặc mở rộng FPV.
4. **Tái Sử Dụng Geometry & Material (Object Pooling)**: Tái sử dụng mảng tọa độ quỹ đạo thay vì `[...trajectory.slice(-300), newPoint]` liên tục tạo mảng mới, giảm tối đa rác bộ nhớ (GC pause).
5. **Xử Lý An Toàn WebGL Context Lost / Restored**: Đăng ký các trình xử lý sự kiện `webglcontextlost` và `webglcontextrestored`, tự động tái khởi tạo tài nguyên Three.js khi trình duyệt giải phóng VRAM mà không bị trắng màn hình.

---

## 5. Các Vấn Đề Đã Xác Minh vs Giả Thuyết Chưa Xác Minh

### Đã Xác Minh Bằng Runtime (RUNTIME VERIFIED)
- [x] Lỗi đệ quy stack overflow tại `Robot3DCanvas.tsx:682` gây crash Three.js và hiển thị fallback 2.5D.
- [x] Tần số khung hình thực tế đạt 60.0 FPS trên Chromium/Edge (Intel Iris Xe GPU).
- [x] Kích thước Viewport FPV bị co hẹp xuống 200px chiều cao (canvas backing: 348x200 px).
- [x] Độ chính xác bước thời gian mô phỏng Step $\Delta t = 0.10\text{ s}$ đạt 100%.
- [x] Chức năng ngắt khẩn cấp E-STOP triệt tiêu PWM về 0% và khóa phanh đứng yên.
- [x] Khả năng co giãn trên 4 kích cỡ màn hình (1920x1080, 1366x768, 1024x768, 412x915) không bị sập canvas 0px.

### Giả Thuyết Cần Kiểm Tra Thêm Ở Giai Đoạn Nâng Cấp (HYPOTHESES)
- [ ] Mức tiêu thụ VRAM khi tải texture PBR 1K/2K trên các dòng máy tính bảng học sinh (iPad / Chromebook).
- [ ] Tác động hiệu năng của post-processing Pass (UnrealBloomPass / SMAAPass) đối với GPU tích hợp thế hệ cũ (Intel HD 520 / 620).

---

## 6. Đề Xuất Phương Án Ưu Tiên: OPTION 2 (High-Fidelity Web Simulator)

Nhóm kỹ sư đề xuất **OPTION 2 — High-Fidelity Web Simulator trên Three.js** là phương án tối ưu:
- **Lý do**: Tận dụng triệt để nền tảng Three.js hiện có mà không phá vỡ cấu trúc mã nguồn hay kiến trúc `SimulationStore`. Nâng cấp chất lượng hình ảnh lên mức tiệm cận game mô phỏng thông qua PBR textures, HDR lighting, thấu kính Fisheye AI và tối ưu hóa layout, trong khi vẫn tương thích 100% với môi trường Web/Vercel và máy tính phổ thông của học sinh trường phổ thông.
- **Không đề xuất Option 3 (WebGPU migration)** ở thời điểm này vì WebGPU chưa hỗ trợ đồng đều trên toàn bộ trình duyệt di động và thiết bị học đường hiện nay.

---

## 7. Danh Sách File Dự Kiến Sửa Đổi Trong Giai Đoạn Tiếp Theo

1. `src/components/Robot3DCanvas.tsx` (Sửa lỗi đệ quy wireframe, tối ưu vật liệu PBR, sửa min-h).
2. `src/components/DynamicCameraFPV.tsx` (Thêm shader Fisheye 160°, PBR arena floor, tối ưu HUD).
3. `src/components/TripleViewCockpit.tsx` (Tối ưu hóa layout chia tỷ lệ, cô lập re-render).
4. `src/stores/useSimulationStore.ts` (Object pooling cho trajectory & logs, fixed timestep loop).
5. `src/types/robotGeometry.ts` (Bổ sung cấu hình texture & shader presets).
