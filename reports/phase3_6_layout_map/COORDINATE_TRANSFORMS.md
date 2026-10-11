# CMU10 — PHASE 3.6: COORDINATE TRANSFORMS
## Tài Liệu Kỹ Thuật Biến Đổi Tọa Độ & Phương Trình Toán Học Không Gian

---

### 1. THAM SỐ KHÔNG GIAN ĐẶC TRƯNG CỦA SA BÀN

Các hằng số không gian được xác lập dựa trên dữ liệu chuẩn của `useSimulationStore.ts`:

| Đại Lượng | Ký Hiệu | Giá Trị / Miền | Đơn Vị |
|---|---|---|---|
| Chiều rộng sa bàn (trục X) | $W_{arena}$ | $3.0$ (từ $-1.5$ đến $+1.5$) | Mét ($\text{m}$) |
| Chiều dài sa bàn (trục Z) | $L_{arena}$ | $2.0$ (từ $-1.0$ đến $+1.0$) | Mét ($\text{m}$) |
| Chiều rộng Base SVG Canvas | $W_{svg}$ | $600$ | Đơn vị SVG |
| Chiều cao Base SVG Canvas | $H_{svg}$ | $400$ | Đơn vị SVG |
| Tỷ lệ xích chuẩn | $S_x, S_z$ | $S_x = 200\text{ px/m}, S_z = 200\text{ px/m}$ | $\text{px/m}$ |
| Bán kính bao an toàn của Robot | $r_{robot}$ | $0.11$ | Mét ($\text{m}$) |

---

### 2. PHƯƠNG TRÌNH BIẾN ĐỔI CHUẨN

#### A. Từ Thế Giới sang Base SVG (`worldToSvg`)
Cho điểm tọa độ thực tế $P_{world} = (x, z)$:
$$u = \frac{x - (-1.5)}{3.0} \times 600 = \frac{x + 1.5}{3.0} \times 600$$
$$v = \frac{z - (-1.0)}{2.0} \times 400 = \frac{z + 1.0}{2.0} \times 400$$

#### B. Từ Base SVG sang Thế Giới (`svgToWorld`)
Cho điểm tọa độ canvas SVG $P_{svg} = (u, v)$:
$$x = \frac{u}{600} \times 3.0 - 1.5$$
$$z = \frac{v}{400} \times 2.0 - 1.0$$

#### C. Biến đổi ma trận Hiển thị (View Transform: Pan & Zoom)
Trong thẻ `<g transform="translate(panX, panY) scale(zoom)">`:
Điểm hiển thị trên màn hình SVG $P_{view} = (u_{view}, v_{view})$ được tính:
$$u_{view} = \text{zoom} \cdot u + \text{panX}$$
$$v_{view} = \text{zoom} \cdot v + \text{panY}$$

Nghịch đảo để tìm tọa độ base SVG khi biết điểm nhìn:
$$u = \frac{u_{view} - \text{panX}}{\text{zoom}}$$
$$v = \frac{v_{view} - \text{panY}}{\text{zoom}}$$

---

### 3. THUẬT TOÁN BẢO TOÀN ĐIỂM NEO KHI PHÓNG TO (FOCAL POINT PRESERVATION)

Khi người dùng cuộn con lăn chuột tại vị trí con trỏ $P_{focal} = (u_f, v_f)$, mục tiêu là điểm vật lý nằm dưới con trỏ chuột **không bị dịch chuyển** trên màn hình sau khi thay đổi tỷ lệ phóng to từ $\text{zoom}_{old}$ sang $\text{zoom}_{new}$.

Phương trình bảo toàn:
$$u_f = \text{zoom}_{old} \cdot u_{base} + \text{panX}_{old} \implies u_{base} = \frac{u_f - \text{panX}_{old}}{\text{zoom}_{old}}$$
Sau khi áp dụng tỷ lệ zoom mới:
$$u_f = \text{zoom}_{new} \cdot u_{base} + \text{panX}_{new}$$
Thay $u_{base}$ vào:
$$\text{panX}_{new} = u_f - \frac{\text{zoom}_{new}}{\text{zoom}_{old}} \cdot (u_f - \text{panX}_{old})$$
Tương tự cho trục dọc:
$$\text{panY}_{new} = v_f - \frac{\text{zoom}_{new}}{\text{zoom}_{old}} \cdot (v_f - \text{panY}_{old})$$

Thuật toán này đã được triển khai hoàn chỉnh trong hàm `zoomAtPoint()` và vượt qua 100% kiểm thử tự động.

---

### 4. THUẬT TOÁN KIỂM ĐỊNH AN TOÀN ĐIỂM ĐÍCH (GOAL SAFETY VALIDATION)

Hàm `validateGoalPoint(goal: Point2D, obstacles: ObstacleSpec[])` kiểm tra:

1. **Ranh giới vật lý sa bàn (Physical Bounds):**
   $$-1.5 \le x_{goal} \le 1.5 \quad \text{và} \quad -1.0 \le z_{goal} \le 1.0$$
   Nếu nằm ngoài, trả về cảnh báo vi phạm ranh giới.

2. **Khoảng cách an toàn tới các chướng ngại vật tĩnh (Obstacle Clearance):**
   Với mỗi vật cản $i$ có tọa độ tâm $(x_i, z_i)$ và bán kính $r_i$:
   Khoảng cách Euclid:
   $$d_i = \sqrt{(x_{goal} - x_i)^2 + (z_{goal} - z_i)^2}$$
   Khoảng cách an toàn tối thiểu (đã cộng bán kính robot $r_{robot} = 0.11\text{ m}$):
   $$d_{safe, i} = r_i + 0.11\text{ m}$$
   Nếu $d_i < d_{safe, i}$, điểm đích nằm trong vùng va chạm nguy hiểm $\implies$ từ chối tạo mục tiêu và hiển thị tên vật cản cụ thể.
