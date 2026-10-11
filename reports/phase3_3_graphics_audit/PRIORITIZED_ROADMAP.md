# LỘ TRÌNH CẢI TIẾN ƯU TIÊN (PRIORITIZED ROADMAP)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Graphics & Simulation Optimization Plan

---

## 1. Phân Loại Mức Độ Ưu Tiên (Priority Classification)

- **P0 (Khẩn cấp / Chặn chức năng chính)**: Màn hình trắng, crash ứng dụng, sai lệch mô hình vật lý hoặc mất an toàn.
- **P1 (Quan trọng / Hiệu năng & Giao diện)**: Giật hình do re-render thừa, viewport bị che khuất, co thắt layout, rò rỉ bộ nhớ.
- **P2 (Nâng cấp trải nghiệm & Chất lượng hình ảnh)**: Độ nét, vật liệu PBR, ánh sáng HDR IBL, góc nhìn camera Fisheye, độ chân thực sa bàn.
- **P3 (Hiệu ứng bổ sung)**: Post-processing Bloom nhẹ, âm thanh động cơ mô phỏng, camera cinematic.

---

## 2. Ma Trận Chi Tiết Các Hạng Mục Nâng Cấp (Detailed Implementation Matrix)

| ID | Ưu Tiên | Thành Phần Liên Quan | Nguyên Nhân Gốc (Root Cause) | Giải Pháp Kỹ Thuật Đề Xuất | Tiêu Chí Nghiệm Thu (Acceptance Criteria) | Kiểm Thử Hồi Quy (Regression Tests) | Rủi Ro | Phụ Thuộc | Ước Tính |
|:---|:---:|:---|:---|:---|:---|:---|:---:|:---|:---:|
| **TASK-01** | **P0** | `src/components/Robot3DCanvas.tsx:682` | `robotRoot.traverse()` thêm trực tiếp `wireMesh` lồng vào cây đối tượng đang duyệt, gây đệ quy vô hạn `RangeError: Maximum call stack size exceeded` và crash WebGL sang màn hình fallback 2.5D. | Duyệt danh sách mesh trước thành mảng riêng (`const meshes = []`), sau đó mới tạo `wireframeObjects` gắn vào một helper group độc lập nằm ngoài cây `robotRoot`. | Mô hình 3D Mechanical của JetBot hiển thị 100% trong Three.js scene; không còn thông báo fallback 2.5D; 0 console error. | Chạy lại `check_console.mjs`, xác minh cờ `webglError === false` và mesh 3D hiển thị rõ trong screenshot. | Rất Thấp | Không | **S** (Small) |
| **TASK-02** | **P1** | `src/components/TripleViewCockpit.tsx` & `Robot3DCanvas.tsx` | Khung `Robot3DCanvas` đặt `min-h-[340px]` cứng, trong khi panel được phân bổ chỉ ~180px ở layout Standard, gây tràn khung và ép camera FPV xuống còn 40px chiều cao canvas. | Chuyển `min-h-[340px]` sang `min-h-0 flex-1`, quy hoạch lại tỷ lệ chia dọc cột phải (55% cho 3D Canvas, 45% cho FPV Camera) hoặc cho phép kéo splitter dọc mượt mà. | Cả hai canvas 3D và FPV đều có chiều cao hữu dụng $\ge 160\text{px}$ ở chế độ Standard; không bị cắt xén UI. | Chụp ảnh kiểm tra `baseline_cockpit_standard.png` đo kích thước canvas clientHeight. | Thấp | Không | **S** (Small) |
| **TASK-03** | **P1** | `src/components/TripleViewCockpit.tsx:108` | `simulationStore.subscribe(setSimState)` được đăng ký ở component cha `TripleViewCockpit`, làm re-render toàn bộ DOM Cockpit 60 lần/giây khi robot chạy. | Chuyển subscription xuống các leaf component (thanh Telemetry HUD, bảng D-Pad) hoặc sử dụng selector chuyên biệt; component cha chỉ quản lý layout state. | Giảm số lần re-render của component cha từ 60 lần/s xuống 0 khi đang lái xe; CPU main-thread giảm $\ge 35\%$. | React Profiler ghi nhận commit duration $< 2\text{ms}$ trong khi robot đang chạy. | Thấp | `useSimulationStore` | **M** (Medium) |
| **TASK-04** | **P2** | `src/components/DynamicCameraFPV.tsx:53` | FPV Camera đang dùng camera phẳng góc $82^\circ$, không phản ánh đúng thấu kính Fisheye góc rộng $160^\circ$ của phần cứng Sony IMX219 trên JetBot. | Tích hợp Custom Post-Processing Shader (Barrel Distortion) hoặc cấu hình góc siêu rộng $120^\circ-140^\circ$ có hiệu ứng cong quang học thấu kính thực tế. | Khung FPV hiển thị độ cong góc rộng thực tế của đường đua và thấy được rìa bánh xe trước; tâm ngắm AI Aim Pixel trùng khớp tọa độ. | So sánh ảnh chụp FPV với ảnh chụp thực tế của camera JetBot. | Trung Bình | Three.js Shaders | **M** (Medium) |
| **TASK-05** | **P2** | `src/components/Robot3DCanvas.tsx` & `DynamicCameraFPV.tsx` | Vật liệu chỉ dùng màu phẳng (`MeshStandardMaterial` hex color), không có PBR maps và thiếu môi trường phản chiếu HDR (IBL). | Bổ sung texture PBR (Albedo, Normal, Roughness) cho mặt đường nhựa FPV, lốp xe cao su gai; tích hợp `RoomEnvironment` tạo ánh sáng phản xạ kim loại tự nhiên. | Bề mặt lốp có gân gai rõ ràng; khung nhôm có độ phản chiếu ánh sáng môi trường; sa bàn đua có vân nhựa đường chân thực. | Kiểm tra trực quan screenshot và đo frame rate duy trì $\ge 58\text{ FPS}$. | Thấp | Textures assets | **M** (Medium) |
| **TASK-06** | **P2** | `src/components/DynamicCameraFPV.tsx` | Header card FPV chiếm diện tích quá lớn trong khung nhỏ, đẩy canvas xuống đáy. | Thiết kế lại HUD FPV thành lớp phủ OSD (On-Screen Display) trong suốt nằm trực tiếp trên mặt canvas (như HUD máy bay hoặc drone). | Diện tích hiển thị của canvas FPV tăng gấp đôi ($+100\%$ không gian quan sát). | Kiểm tra tính tương phản chữ trên nền tối và nền sáng. | Rất Thấp | Tailwind CSS | **S** (Small) |
| **TASK-07** | **P2** | `src/stores/useSimulationStore.ts:562` | Quỹ đạo `actualTrajectory` và `logs` cấp phát object mới liên tục trong RAF loop, gây rác bộ nhớ heap (~24.4 MB / 10s). | Áp dụng kỹ thuật Object Pooling và giới hạn tần số ghi vết quỹ đạo (chỉ ghi khi vị trí thay đổi đáng kể $\Delta d > 0.05\text{m}$). | Tốc độ gia tăng bộ nhớ heap giảm xuống $< 5\text{ MB} / 10\text{s}$. | Đo đạc `performance.memory` trong Scenario B 60s. | Thấp | Không | **S** (Small) |
| **TASK-08** | **P3** | `src/stores/useSimulationStore.ts:442` | Bước tích phân $\Delta t$ phụ thuộc vào frame time của `requestAnimationFrame`, gây sai lệch nhỏ về quán tính trên các màn hình khác tần số quét (60Hz vs 144Hz). | Tách logic tích phân vật lý sang Fixed Timestep Accumulator $\Delta t = 16.666\text{ ms}$ cố định. | Quỹ đạo xe khi chạy 10s hoàn toàn trùng khớp từng milimet trên cả màn hình 60Hz và 144Hz. | So sánh tọa độ cuối cùng $X_{end}, Z_{end}$ sau 500 bước tích phân. | Trung Bình | `useSimulationStore` | **M** (Medium) |
| **TASK-09** | **P3** | `src/components/Robot3DCanvas.tsx` | Khử răng cưa MSAA mặc định có thể để lại gờ răng cưa ở các chi tiết kim loại mảnh (ăng-ten SMA, cọc đồng M3). | Tích hợp tùy chọn bộ lọc khử răng cưa SMAA hoặc FXAA trong EffectComposer với 3 mức cấu hình (Low / Balanced / High). | Triệt tiêu hiện tượng nhấp nháy pixel (shimmering) khi xoay camera quanh các chi tiết nhỏ. | Đo đạc FPS trên cấu hình High duy trì $\ge 55\text{ FPS}$. | Thấp | Three.js Postprocessing | **M** (Medium) |

---

## 3. Kế Hoạch Triển Khai Khuyến Nghị Theo Giai Đoạn (Implementation Phases)

```
GIAI ĐOẠN 1: HOTFIX P0 & LAYOUT SẮC NÉT (Sprint 1)
- [TASK-01]: Sửa lỗi đệ quy stack overflow wireframe -> Khôi phục 3D Canvas thực tế.
- [TASK-02]: Tối ưu hóa flex layout cột phụ -> Mở rộng không gian hiển thị cho FPV.
- [TASK-06]: Chuyển đổi HUD FPV sang dạng OSD trong suốt.

GIAI ĐOẠN 2: NÂNG CẤP CHẤT LƯỢNG THỊ GIÁC & PBR (Sprint 2)
- [TASK-04]: Tích hợp thấu kính góc rộng Fisheye 160° cho FPV.
- [TASK-05]: Nâng cấp vật liệu PBR (Nhựa đường, Lốp xe, HDR Environment).
- [TASK-03]: Cô lập React re-renders ở component cha Cockpit.
- [TASK-07]: Giảm thiểu rác bộ nhớ (Memory Pooling cho Trajectory).

GIAI ĐOẠN 3: ĐỒ HỌA CAO CẤP & CHUẨN HÓA VẬT LÝ (Sprint 3)
- [TASK-08]: Chuẩn hóa Fixed Timestep tích phân động học vi sai.
- [TASK-09]: Tích hợp tùy chọn bộ lọc khử răng cưa SMAA / FXAA và Adaptive Quality.
```
