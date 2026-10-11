# HƯỚNG DẪN QUY ƯỚC TỌA ĐỘ VÀ ĐỘNG HỌC ROBOT CMU10
## Dành Cho Kỹ Sư Phát Triển & Giáo Viên Giảng Dạy STEM Vật Lí 10

Tài liệu này định nghĩa hệ quy chiếu chuẩn của JetBot trong không gian mô phỏng phòng thí nghiệm Vật lí 10 (CMU10).

---

### 1. Hệ Trục Tọa Độ Thế Giới (World Frame)

- **Mặt sàn sa bàn:** Không gian 2D trên mặt phẳng $(X, Z)$ với $X \in [-1.5, +1.5]\text{ m}$ (dài $3.0\text{ m}$) và $Z \in [-1.0, +1.0]\text{ m}$ (rộng $2.0\text{ m}$).
- **Trục $+X$:** Hướng Đông (hướng tiến ban đầu của xe).
- **Trục $+Z$:** Hướng Nam (hướng xuống dưới trên bản đồ 2D).
- **Trục $+Y$:** Hướng Thẳng đứng lên trời.
- **Vị trí xuất phát ban đầu:** $(x, y, z) = (-0.8, 0.0, 0.0)\text{ m}$.

---

### 2. Góc Hướng (Heading / Yaw) & Các Vector Chỉ Phương

- **Quy ước góc $\text{yaw}$:** Đơn vị radian, nằm trong khoảng $(-\pi, \pi]$.
  - $\text{yaw} = 0$: Đầu xe hướng Đông ($+X$).
  - $\text{yaw} = +\frac{\pi}{2}$: Đầu xe hướng Nam ($+Z$) (rẽ phải $90^\circ$).
  - $\text{yaw} = -\frac{\pi}{2}$: Đầu xe hướng Bắc ($-Z$) (rẽ trái $90^\circ$).
  - $\text{yaw} = \pm \pi$: Đầu xe hướng Tây ($-X$) (quay đầu $180^\circ$).
- **Vector tiến (Forward):** $\hat{\mathbf{u}}_{\text{fwd}} = (\cos(\text{yaw}), \sin(\text{yaw}))$.
- **Vector sang phải (Right):** $\hat{\mathbf{u}}_{\text{right}} = (-\sin(\text{yaw}), \cos(\text{yaw}))$.
- **Vector sang trái (Left):** $\hat{\mathbf{u}}_{\text{left}} = (\sin(\text{yaw}), -\cos(\text{yaw}))$.

---

### 3. Công Thức Động Học Vi Sai (Differential Drive Kinematics)

CMU10 áp dụng mô hình chuyển động vi sai hai bánh chủ động và một bánh dẫn hướng tự do (caster):
- Bán kính bánh xe: $R = 0.0325\text{ m}$.
- Khoảng cách hai bánh: $L = 0.102\text{ m}$.
- Tốc độ dài lớn nhất: $v_{\text{max}} = 0.45\text{ m/s}$.

Khi hai động cơ nhận giá trị điều khiển $s_L, s_R \in [-1.0, 1.0]$:
1. Vận tốc dài từng bánh: $v_L = s_L \cdot v_{\text{max}}$, $v_R = s_R \cdot v_{\text{max}}$.
2. Vận tốc tịnh tiến trọng tâm: $v = \frac{v_R + v_L}{2}$.
3. Vận tốc góc quay quanh trục đứng: $\omega = \frac{v_R - v_L}{L}$.
4. Tích phân biến thiên tư thế theo thời gian $\Delta t$:
   $$\text{yaw}_{t + \Delta t} = \text{atan2}\left(\sin(\text{yaw}_t - \omega \Delta t), \cos(\text{yaw}_t - \omega \Delta t)\right)$$
   $$x_{t + \Delta t} = x_t + v \cos(\text{yaw}_{t + \Delta t}) \Delta t$$
   $$z_{t + \Delta t} = z_t + v \sin(\text{yaw}_{t + \Delta t}) \Delta t$$

---

### 4. Ánh Xạ Giữa Các Khung Nhìn Đồ Họa

1. **Bản đồ 2D Tactical Map:**
   - Tọa độ hiển thị: ánh xạ tuyến tính từ $[-1.5, 1.5] \times [-1.0, 1.0]$ sang kích thước pixel SVG.
   - Góc xoay thân xe: $\theta_{\text{SVG}} = \text{yaw} \times \frac{180^\circ}{\pi}$.
2. **Khung nhìn 3D Canvas:**
   - Vì file CAD 3D gốc có mũi xe dọc trục $+Z$, góc xoay của mesh được tính theo:
     $$\text{rotation.y} = -\frac{\pi}{2} - \text{yaw}$$
   - Lưới sàn di chuyển ngược vector vận tốc để tạo cảm giác xe chuyển động:
     $$\Delta X_{\text{grid}} = -\Delta d \cos(\text{yaw}), \quad \Delta Z_{\text{grid}} = -\Delta d \sin(\text{yaw})$$
3. **Camera FPV Góc Nhìn Thứ Nhất:**
   - Điểm nhìn camera: $(x, 0.08, z)$.
   - Điểm ngắm (LookAt): $(x + \cos(\text{yaw}), 0.08, z + \sin(\text{yaw}))$.
4. **Cảm Biến Siêu Âm:**
   - Phát hiện chướng ngại vật trong cung góc $\pm 45^\circ$ phía trước đầu xe:
     $$|\text{atan2}(z_{\text{obs}} - z, x_{\text{obs}} - x) - \text{yaw}| \le 45^\circ$$
