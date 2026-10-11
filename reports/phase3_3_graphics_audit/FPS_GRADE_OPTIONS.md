# CÁC PHƯƠNG ÁN NÂNG CẤP ĐỒ HỌA CHUẨN FPS (FPS-GRADE IMPROVEMENT OPTIONS)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Architectural Upgrade Options & Feasibility Study

---

## 1. Tổng Quan 3 Phương Án Nâng Cấp

Dựa trên kết quả đo đạc thực tế tại Phase 3.3, đội ngũ kỹ sư đồ họa đề xuất 3 lộ trình nâng cấp với các mức độ can thiệp kiến trúc khác nhau:

```
+----------------------------------------------------------------------------------------------------+
|                                    MA TRẬN SO SÁNH 3 PHƯƠNG ÁN NÂNG CẤP                            |
+------------------------------+--------------------------+-----------------------+------------------+
| Tiêu Chí So Sánh             | OPTION 1                 | OPTION 2 (KHUYẾN NGHỊ)| OPTION 3         |
|                              | Tối Ưu Hóa WebGL Tại Chỗ | High-Fidelity Web Sim | Engine Migration |
+------------------------------+--------------------------+-----------------------+------------------+
| 1. Công nghệ Renderer        | Three.js WebGL 2.0       | Three.js WebGL 2.0 PBR| WebGPU / Babylon |
| 2. Chất lượng hình ảnh       | Khá (7/10)               | Rất Cao (9/10)        | Tối đa (9.5/10)  |
| 3. Độ ổn định 60 FPS         | 100% trên mọi máy        | >95% trên máy chuẩn   | Rủi ro máy cũ    |
| 4. Chi phí phát triển        | Thấp (S - 1 sprint)      | Vừa phải (M - 2 sprint)| Rất Cao (L/XL)   |
| 5. Tác động tải trang        | 0 KB (Dùng bundle cũ)    | +600 KB (Texture/GLTF)| +3.5 MB          |
| 6. Tương thích thiết bị GD   | 100% thiết bị học đường  | 98% thiết bị học đường| ~55% (WebGPU non)|
| 7. Rủi ro triển khai Vercel  | 0% (Không đổi core)      | Rất thấp (<2%)        | Cao (Build & SSR)|
| 8. Tính phù hợp GD Vật lí 10 | Phù hợp cơ bản           | Tối ưu nhất           | Quá tải kỹ thuật |
+------------------------------+--------------------------+-----------------------+------------------+
```

---

## 2. Chi Tiết Từng Phương Án

### 2.1. OPTION 1 — Tối Ưu Hóa WebGL Tại Chỗ (In-Place WebGL Optimization)
*Mục tiêu: Sửa lỗi hiển thị, tinh chỉnh hiệu năng, giữ nguyên mô hình Three.js hiện hữu.*

- **Kiến trúc**:
  - Giữ nguyên Three.js v0.186 hiện tại và toàn bộ cấu trúc file.
  - Khắc phục lỗi đệ quy stack overflow tại `Robot3DCanvas.tsx:682` để giải phóng mô hình 3D thực tế.
  - Sửa lỗi co hẹp Viewport cột phải bằng cách chuyển sang `flex-1 min-h-0` linh hoạt.
  - Thêm bóng đổ mềm Contact Shadows và tinh chỉnh lại độ tương phản màu sắc.
  - Chuyển đổi HUD FPV sang dạng OSD trong suốt để mở rộng vùng nhìn.
- **Ưu điểm**:
  - Rủi ro kỹ thuật bằng 0, thời gian thực hiện cực nhanh.
  - Không tăng dung lượng tải trang (Bundle size giữ nguyên).
  - Hoạt động mượt mà trên 100% máy tính cũ của trường học (kể cả máy Core i3 Gen 4/5).
- **Hạn chế**:
  - Vẫn sử dụng hình học Procedural Primitives (nhiều draw calls).
  - Chưa có hiệu ứng biến dạng thấu kính Fisheye 160° cho AI Computer Vision.
- **Điều kiện nghiệm thu**:
  - Mô hình 3D hiển thị đầy đủ, không còn thông báo fallback 2.5D.
  - 100% các chế độ CAD hoạt động, FPS duy trì 60.

---

### 2.2. OPTION 2 — High-Fidelity Web Simulator (PHƯƠNG ÁN KHUYẾN NGHỊ ƯU TIÊN)
*Mục tiêu: Đạt chuẩn chất lượng đồ họa tiệm cận game mô phỏng Robotics, trung thực với thông số vật lý và phần cứng JetBot thực tế.*

- **Kiến trúc & Kỹ thuật đề xuất**:
  1. **Khắc phục triệt để lỗi P0**: Tách nhóm wireframe độc lập, phục hồi ngay lập tức mô hình 3D JetBot.
  2. **Đóng gói Asset GLTF Draco / KTX2**: Thay thế 30 primitives rời rạc bằng 1 asset GLTF nén chuẩn CAD (~350 KB) với cấu trúc mesh phân cấp chính xác. Giảm draw calls từ 35 xuống 2–4 draw calls.
  3. **PBR Material Pipeline**:
     - Mặt đường nhựa sa bàn FPV: Texture Asphalt PBR 1K (Albedo + Normal + Roughness map).
     - Vật cản LEGO: Thêm hiệu ứng gờ nổi nhựa bóng với Subsurface Scattering nhẹ.
     - Lốp xe: Normal map xẻ rãnh gai cao su chống trượt.
  4. **Ánh sáng HDR IBL (Image-Based Lighting)**:
     - Tích hợp `RoomEnvironment` / HDR map nhẹ (~200 KB) phản chiếu ánh sáng môi trường thực lên khung nhôm và nắp mica xanh.
  5. **Custom Fisheye Barrel Distortion Shader**:
     - Xây dựng post-processing shader mô phỏng thấu kính Sony IMX219 góc siêu rộng 160°, tái hiện chính xác góc nhìn bám vạch kẻ đường của bài toán CNN Line Following.
  6. **Adaptive Quality Presets**:
     - *Low*: Native resolution, basic materials, no shadow map.
     - *Balanced*: 1.5x DPR, PBR materials, soft shadows, 60 FPS lock.
     - *High*: Native DPR, PBR, SMAA, Fisheye shader, contact shadows.
- **Đánh giá định lượng**:
  - Tải trang tăng thêm: ~550 KB (tải qua CDN hoặc nén WebP/Draco, lưu cache trình duyệt).
  - VRAM tăng: từ ~40 MB lên ~75 MB (hoàn toàn an toàn trên mọi GPU tích hợp).
  - Tốc độ khung hình: Duy trì 60 FPS trên máy tính phổ thông (Intel Iris Xe / AMD Radeon 600M).
- **Tính phù hợp với giáo dục STEM & Vật lí 10**:
  - Hoàn hảo. Giúp học sinh quan sát rõ từng cấu tạo linh kiện cơ khí (ốc vít M3, tỷ số truyền động cơ 1:48, góc đặt camera $18^\circ$, tâm khối CoM) phục vụ bài học về mô-men lực, ma sát lăn và động học vi sai.
- **Điều kiện nghiệm thu**:
  - Mô hình 3D sắc nét PBR, không răng cưa.
  - Camera FPV có hiệu ứng cong thấu kính góc rộng, tâm ngắm AI Aim Pixel chính xác.
  - FPS $\ge 58$ trong suốt 60 giây mô phỏng liên tục.

---

### 2.3. OPTION 3 — Advanced Rendering / Engine Migration (WebGPU / Dedicated Engine)
*Mục tiêu: Chuyển đổi toàn bộ sang WebGPU hoặc Engine chuyên dụng (Babylon.js / PlayCanvas / Unreal Pixel Streaming).*

- **Kiến trúc**:
  - Viết lại toàn bộ pipeline render bằng Three.js `WebGPURenderer` (TSL - Three.js Shading Language) hoặc chuyển sang engine game chuyên dụng.
- **Đánh giá tính khả thi**:
  - **Tương thích thiết bị**: RẤT KÉM ở môi trường học đường. WebGPU hiện tại chỉ hỗ trợ trên một số phiên bản Chrome/Edge mới, chưa ổn định trên Safari iOS/macOS cũ và nhiều máy tính phòng lab trường học bật cờ bảo mật tắt WebGPU.
  - **Chi phí phát triển**: Cực kỳ lớn (viết lại toàn bộ shaders, materials và pipeline Three.js hiện có).
  - **Tác động tải trang**: Tăng thêm 2–5 MB dung lượng bundle.
- **Kết luận**: **KHÔNG KHUYẾN NGHỊ** cho giai đoạn hiện tại. Kiến trúc WebGL 2.0 của Three.js hiện tại là quá đủ để đạt 60 FPS và chất lượng hình ảnh xuất sắc nếu được tối ưu hóa đúng chuẩn.

---

## 3. Khuyến Nghị Quyết Định (Final Recommendation)

Đội ngũ kỹ sư thống nhất khuyến nghị người dùng và ban dự án phê duyệt **OPTION 2 (High-Fidelity Web Simulator)**:
- Đạt được độ chân thực hình ảnh tiệm cận game mô phỏng hiện đại.
- Giữ nguyên vẹn 100% tính đúng đắn của `SimulationStore` và các bài học lập trình.
- Triển khai an toàn trên hạ tầng Vercel hiện tại mà không làm chậm thời gian tải trang.
