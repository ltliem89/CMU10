# QUY ƯỚC HỆ TRỤC TỌA ĐỘ VÀ ĐỘNG HỌC ROBOT CMU10
## CMU10 Coordinate System & Kinematic Standard Specification

**Tài liệu:** Chuẩn hóa quy ước hình học và động học CMU10 JetBot  
**Áp dụng:** Toàn bộ hệ thống CMU10 (Toán học vật lí, 2D Canvas, 3D WebGL, FPV Raymarching, Giao diện học tập)  

---

### 1. HỆ TỌA ĐỘ THẾ GIỚI (WORLD COORDINATE FRAME)

Sa bàn mô phỏng thực hành CMU10 có kích thước chuẩn $3.0\text{ m} \times 2.0\text{ m}$.
* Trục tọa độ thế giới gắn với mặt sàn thí nghiệm:
  - **Trục $+X$:** Hướng Đông (về phía tay phải người quan sát bản đồ 2D). Chiều dài sàn $X \in [-1.5, +1.5]\text{ m}$.
  - **Trục $+Z$:** Hướng Nam (hướng xuống dưới trong hình chiếu 2D SVG). Chiều rộng sàn $Z \in [-1.0, +1.0]\text{ m}$.
  - **Trục $+Y$:** Hướng Thẳng đứng lên trên (bàn tay phải chuẩn trong Three.js).
* Vị trí xuất phát mặc định của JetBot:
  $$\mathbf{p}_0 = (x_0, y_0, z_0) = (-0.8\text{ m}, 0.0\text{ m}, 0.0\text{ m})$$

---

### 2. GÓC HƯỚNG VÀ VECTOR TIẾN (HEADING & YAW ANGLE)

* Góc hướng $\text{yaw} \in (-\pi, \pi]$ quy ước:
  - $\text{yaw} = 0$: Đầu xe hướng về phía Đông (dọc theo trục $+X$).
  - $\text{yaw} = +\frac{\pi}{2}$ ($+90^\circ$): Đầu xe hướng về phía Nam (dọc theo trục $+Z$, rẽ phải từ vị trí ban đầu).
  - $\text{yaw} = -\frac{\pi}{2}$ ($-90^\circ$): Đầu xe hướng về phía Bắc (dọc theo trục $-Z$, rẽ trái từ vị trí ban đầu).
  - $\text{yaw} = \pi$ hoặc $-\pi$ ($180^\circ$): Đầu xe hướng về phía Tây (dọc theo trục $-X$).
* Vector chỉ phương tiến của robot trong mặt phẳng sàn $(X, Z)$:
  $$\hat{\mathbf{u}}_{\text{forward}} = (\cos(\text{yaw}), \sin(\text{yaw}))$$
* Vector ngang sang phải của thân xe:
  $$\hat{\mathbf{u}}_{\text{right}} = (-\sin(\text{yaw}), \cos(\text{yaw}))$$
* Vector ngang sang trái của thân xe:
  $$\hat{\mathbf{u}}_{\text{left}} = (\sin(\text{yaw}), -\cos(\text{yaw}))$$

---

### 3. ĐỘNG HỌC VI SAI VÀ TÍCH PHÂN TỌA ĐỘ (DIFFERENTIAL DRIVE KINEMATICS)

* **Thông số vật lí của CMU10 JetBot:**
  - Bán kính bánh xe: $R = 0.0325\text{ m}$ ($32.5\text{ mm}$).
  - Khoảng cách giữa 2 bánh xe (Wheelbase): $L = 0.102\text{ m}$ ($102\text{ mm}$).
  - Vận tốc tuyến tính tối đa tại PWM 100%: $v_{\text{max}} = 0.45\text{ m/s}$.
* **Vận tốc bánh xe:**
  - $v_L = \text{speed}_L \times v_{\text{max}}$
  - $v_R = \text{speed}_R \times v_{\text{max}}$
* **Vận tốc tịnh tiến và vận tốc góc của trọng tâm:**
  $$v = \frac{v_R + v_L}{2}$$
  $$\omega = \frac{v_R - v_L}{L}$$
* **Phương trình vi phân chuyển động:**
  $$\frac{d(\text{yaw})}{dt} = -\omega = -\frac{v_R - v_L}{L}$$
  $$\frac{dx}{dt} = v \cos(\text{yaw})$$
  $$\frac{dz}{dt} = v \sin(\text{yaw})$$
* **Giải thích quy ước dấu góc:**
  Khi bánh phải quay tới ($v_R > 0$) và bánh trái quay lùi ($v_L < 0$), robot quay tại chỗ ngược chiều kim đồng hồ trên mặt phẳng sàn (xoay từ $+X$ sang $-Z$, tức sang trái/Bắc). Trong mặt phẳng $(X, Z)$, việc quay từ $+X$ sang $-Z$ tương ứng với góc $\text{yaw}$ giảm dần ($\Delta\text{yaw} < 0$). Do đó $\frac{d(\text{yaw})}{dt} = -\omega$.

---

### 4. ÁNH XẠ ĐỒ HỌA TRÊN CÁC KHUNG NHÌN (GRAPHICS MAPPING)

| Khung nhìn (View) | Quy ước tọa độ hiển thị | Công thức ánh xạ từ Simulation State |
| :--- | :--- | :--- |
| **Bản đồ 2D (Tactical Map SVG)** | Gốc $(0,0)$ ở góc trên-trái. Chiều ngang $+X$, chiều dọc $+Z$. | $X_{\text{px}} = (x + 1.5) \times \text{scale}_X$<br>$Y_{\text{px}} = (z + 1.0) \times \text{scale}_Z$<br>Góc xoay: $\theta_{\text{SVG}} = \text{yaw} \times \frac{180^\circ}{\pi}$ |
| **Robot 3D Twin (Three.js)** | Hệ trục bàn tay phải: $+X$ Phải, $+Y$ Trên, $+Z$ Ra ngoài. Mesh gốc đầu xe hướng $+Z$. | Khung đế robot: $\text{rotation.y} = -\frac{\pi}{2} - \text{yaw}$<br>Sàn băng chuyền ảo: $\Delta X = -\Delta d \cos(\text{yaw})$, $\Delta Z = -\Delta d \sin(\text{yaw})$ |
| **Camera FPV (Cockpit)** | Điểm nhìn đặt tại mũi robot: $(x_{\text{cam}}, y_{\text{cam}}, z_{\text{cam}}) = (x, 0.08, z)$. | Vector nhìn: $(\cos(\text{yaw}), 0, \sin(\text{yaw}))$<br>Chân trời ổn định theo trục $+Y$. |
| **Cảm biến siêu âm (Ultrasonic)** | Tia quét nón mở góc $\pm 45^\circ$ dọc theo vector tiến của mũi xe. | Khoảng cách đo: $\min \{ d_i \mid |\angle(\mathbf{p}_{\text{obs}} - \mathbf{p}_{\text{robot}}) - \text{yaw}| \le 45^\circ \}$ |
