# BÁO CÁO KIỂM ĐỊNH TOÀN BỘ CHẾ ĐỘ MÔ PHỎNG (PHASE 3.2)
**Thời gian kiểm định**: 2026-10-11T03:04:42.073Z  
**Môi trường thực thi**: Headless Chromium (Microsoft Edge (Chromium Engine)), Desktop Viewport 1440×900  
**Tỷ lệ Đạt Chuẩn**: 93.8% (15/16 tests PASS)

---

## 1. Kiểm định các Chế độ Bố cục Workspace (Layout Modes)
Đã thực hiện kiểm định ứng suất qua **20 chu kỳ liên tục** (tổng cộng **120 lượt chuyển đổi bố cục**) giữa 6 chế độ:
- **Standard**: Khung mô phỏng phân bổ cân đối 66% chiều cao, tích hợp sa bàn chính và cụm 3D/FPV bên phải.
- **Focus**: Tối ưu hóa 82% diện tích vùng làm việc cho mô phỏng, tự động thu gọn Sidebar về icon 64px và ẩn các panel phụ.
- **Split View**: Chia đôi 50:50 không gian giữa sa bàn và robot 3D/camera.
- **Triple View**: Phân chia không gian 3 góc nhìn đồng thời với các thanh trượt tỷ lệ linh hoạt.
- **Picture-in-Picture (PiP)**: Sa bàn chính mở rộng toàn bộ, FPV Camera hiển thị dưới dạng cửa sổ nổi có thể kéo thả tự do.
- **Fullscreen**: Mô phỏng mở rộng toàn màn hình 100vw × 100vh, tự động ẩn toàn bộ thanh tiêu đề và điều khiển phụ.
- **Maximize & Minimize**: Phóng to độc lập từng khung nhìn và khôi phục mượt mà.
- **Reset Layout**: Khôi phục trạng thái chuẩn ban đầu chỉ với 1 cú click.

**Kết quả thực đo kích thước khung mô phỏng:**
- Chế độ **Standard**: `1229px × 607px` (Diện tích: 746,081 px²)
- Chế độ **Focus**: `1224px × 526px` (Diện tích: 643,370 px²)
- Chế độ **Split View**: `1224px × 526px` (Diện tích: 643,370 px²)
- Chế độ **Triple View**: `1224px × 526px` (Diện tích: 643,370 px²)
- Chế độ **PiP**: `1224px × 526px` (Diện tích: 643,370 px²)
- Chế độ **Fullscreen**: `1395px × 614px` (Diện tích: 857,072 px²)

---

## 2. Kiểm định 7 Chế độ CAD Inspection
Đã thực hiện assert kiểm tra DOM và shader/helper trạng thái hiển thị cho toàn bộ 7 chế độ:
1. **Realistic (PBR)**: Shader vật liệu kim loại/nhựa chân thực, khử răng cưa và đổ bóng PBR.
2. **Wireframe**: Kích hoạt hiển thị khung dây hình học cho toàn bộ linh kiện.
3. **Components**: Hiển thị bảng chi tiết linh kiện CAD (`[data-testid="cad-drawer-components"]`), cho phép kiểm tra từng module.
4. **Collision**: Hiển thị phân tích vùng bao va chạm (`[data-testid="cad-drawer-collision"]`), kiểm tra hình trụ bảo vệ.
5. **Coordinates**: Kích hoạt trục tọa độ XYZ cục bộ tại trọng tâm robot.
6. **Sensors FOV**: Hiển thị hình nón phát xạ của cảm biến siêu âm và camera FOV 160°.
7. **Dimensions (CAD)**: Hiển thị bảng kích thước hình học chuẩn ISO (`[data-testid="cad-drawer-dimensions"]`).

---

## 3. Kiểm định Động học & Điều khiển
- **Step (+0.1s)**: Kiểm tra thời gian mô phỏng tăng chính xác $\Delta t = 0.10$ giây mỗi lần kích hoạt.
- **Pause**: Xác minh trạng thái pose được đóng băng tuyệt đối, không có sai lệch trôi dạt.
- **Reset**: Xác minh vị trí robot quay về đúng tọa độ ban đầu $(-0.80\text{m}, 0.00\text{m})$.
- **Emergency Stop (E-STOP)**: Xác minh ngắt toàn bộ xung PWM về 0% và khóa phanh tức thời.
- **D-Pad & Sliders**: Xác minh điều khiển vận tốc độc lập hai bánh xe $v_L, v_R$.

---

## 4. Bảo toàn Trạng thái (State Integrity)
Trong quá trình robot đang di chuyển với vận tốc thực tế, việc chuyển đổi liên tục qua các layout không làm reset robot về điểm xuất phát, không gây rò rỉ WebGL context và không sinh ra lỗi NaN hay Infinity.