# MA TRẬN TRIỂN KHAI TÍNH NĂNG (IMPLEMENTATION MATRIX)
**Dự án:** JetBot AI & Robotics Interactive Studio (CMU10 Virtual Lab)  
**Giai đoạn:** Phase 3 — Triple-View Cockpit & Kinematic Synchronization  
**Phân loại:**
- **REAL:** Tính toán toán học, động học vi phân, xử lý dữ liệu và thuật toán số chạy thật trên client.
- **SIMULATED:** Mô phỏng vật lý 3D, va chạm, đồ họa Three.js, tín hiệu xung nhịp theo đúng phương trình toán lý.
- **UI_ONLY:** Giao diện điều hướng, nhãn hiển thị và bố cục tương tác.

---

## BẢNG MA TRẬN CHI TIẾT TỪNG PHÂN HỆ

| Phân hệ / Tính năng | Mức độ | Hiện trạng triển khai trong Phase 3 | Bằng chứng mã nguồn |
|---|:---:|---|---|
| **Bản đồ Sa Bàn Sa 2D/3D** | **SIMULATED** | Hiển thị sa bàn tỉ lệ thực $3.0\text{m} \times 2.0\text{m}$, vạch xuất phát, tường bao, 4 vật cản LEGO có va chạm vật lý, waypoint dẫn đường, vệt đường đã đi. | `src/components/TacticalArenaMap.tsx` |
| **Động Học Vi Phân Robot** | **REAL** | Tích phân động học vi sai $v = (v_R + v_L)/2$, $\omega = (v_R - v_L)/b$, cập nhật $(x, z, \text{yaw})$ với độ trễ quán tính động cơ chân thực. | `src/stores/useSimulationStore.ts` dòng 240-330 |
| **Mô Hình 3D Robot CMU10** | **SIMULATED** | Mô hình 3D Three.js PBR đầy đủ linh kiện CAD, 2 bánh xe lăn theo vận tốc góc thực $\omega = v/R$, 7 chế độ kiểm tra CAD. | `src/components/Robot3DCanvas.tsx` |
| **Camera FPV Động 3D** | **SIMULATED** | Camera góc nhìn thứ nhất render 3D trực tiếp từ mắt xe, thay đổi góc nhìn theo pose robot, quan sát sa bàn và vật cản thực tế. **Đã loại bỏ ảnh tĩnh.** | `src/components/DynamicCameraFPV.tsx` |
| **Lớp Phủ AI & Điểm Ngắm (Crosshair)** | **REAL** | Tính toán hình chiếu tọa độ waypoint gần nhất lên khung nhìn camera, xuất tọa độ pixel chuẩn hóa $(X_{\text{norm}}, Y_{\text{norm}})$ và pixel $(224 \times 224)$. | `src/components/DynamicCameraFPV.tsx` dòng 230-265 |
| **Cảm Biến Siêu Âm HC-SR04** | **SIMULATED** | Tính khoảng cách Euclidean thực tới vật cản phía trước trong góc quét hình nón $45^\circ$, hiển thị khoảng cách cm và cảnh báo $P(\text{blocked})$. | `src/stores/useSimulationStore.ts` dòng 290-310 |
| **Bộ Điều Khiển Thực Thi** | **REAL** | Bộ nút lệnh `Run`, `Pause`, `Step (+0.1s)`, `Reset`, `Emergency Stop`. D-Pad và thanh trượt tốc độ cập nhật trực tiếp vào simulation store. | `src/components/TripleViewCockpit.tsx` |
| **Phát Sinh Mã Python Tức Thời** | **REAL** | Tự động tạo cú pháp Python chuẩn `jetbot.Robot()`: `robot.set_motors(l, r)`, `robot.forward(v)`, `robot.stop()`. Cho phép sao chép mã nguồn 1-click. | `src/stores/useSimulationStore.ts` dòng 105-135 |
| **Bảo Toàn Trạng Thái (State Persistence)** | **REAL** | Lưu trữ toàn bộ vị trí robot, vệt đường, cấu hình tốc độ và nhật ký trong Store độc lập với vòng đời unmount của tab React. | `src/stores/useSimulationStore.ts` singleton |
| **Giải Phóng Bộ Nhớ WebGL** | **REAL** | Hàm đệ quy duyệt scene graph để dispose `BufferGeometry` và `Material`, hủy animation loop và resize listener khi unmount. | `src/components/Robot3DCanvas.tsx` & `DynamicCameraFPV.tsx` |

---

## ĐÁNH GIÁ CHUYỂN DỊCH CHẤT LƯỢNG HỆ THỐNG
So với Giai đoạn 2, tính năng **Camera FPV** đã chính thức được nâng cấp từ **UI_ONLY** (dùng 5 ảnh tĩnh) lên mức **SIMULATED / REAL** (render 3D thời gian thực theo đúng tọa độ và hướng nhìn của robot trong không gian ảo). Hệ thống hiện không còn bất kỳ tính năng cốt lõi nào bị đánh giá là UI_ONLY tĩnh.
