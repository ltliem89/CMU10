# BÁO CÁO KIỂM THỬ HỒI QUY TOÀN DIỆN (REGRESSION TEST SUITE)
## Đảm bảo Không Phát Sinh Lỗi Phụ (Zero Regression) Sau Khi Sửa Hướng Robot

**Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10  
**Thời điểm kiểm tra:** 11/10/2026  
**Môi trường:** Node.js v20+, Vite v8.3.4, Playwright Chromium  

---

### 1. KẾT QUẢ KIỂM THỬ HỒI QUY PHASE B (21 CHECKS)

* **Tập lệnh:** `scripts/verify_phase_b_acceptance.mjs`
* **Kết quả:** **21/21 CHECKS PASSED (100.0%)**
* **Chi tiết nhóm kiểm tra:**
  1. *Simulation Invariants & State Integrity:*
     - Khởi tạo vị trí & trạng thái chuẩn: **PASS** ($x = -0.8\text{ m}, z = 0.0\text{ m}, \text{yaw} = 0\text{ rad}$, `STOPPED`).
     - Tích phân liên tục khi RUN: **PASS** (di chuyển đều, cập nhật vệt quỹ đạo).
     - Đóng băng thời gian khi PAUSE: **PASS** (`simTimeSec` không đổi sau 300ms).
     - Thực thi từng bước (+0.1s): **PASS** (tăng đúng 0.100s).
     - Bảo toàn tọa độ qua 4 khung nhìn (2D/3D/FPV/TRIPLE): **PASS**.
     - Ngắt khẩn cấp E-STOP khóa an toàn: **PASS**.
     - RESET hoàn nguyên vị trí và làm sạch dữ liệu đo: **PASS**.
  2. *Tactical Arena Map Navigation & Goal System:*
     - Thu phóng bản đồ (Zoom In): **PASS** (tỉ lệ $125\%$).
     - Vừa vặn sa bàn (Fit Scene): **PASS** (trở về $100\%$).
     - Bám tâm robot (Focus Robot): **PASS**.
     - Bật/tắt chế độ Click-to-Goal: **PASS**.
     - Đặt cờ đích tương tác: **PASS**.
  3. *UI Fidelity & GDPT 2018 Curriculum Compliance:*
     - Chiều cao thanh tiêu đề CMUHeader: **PASS** ($81\text{ px}$, độ lệch $< 4\text{ px}$).
     - Tuân thủ SGK Vật lí 10 (0 từ ngữ Vật lí 11): **PASS** ($0$ phát hiện).
     - Danh sách bài học Vật lí 10 ở sidebar: **PASS**.
     - Bộ chuyển đổi 12 bài thực hành JetBot: **PASS**.
     - 5 trụ cột giáo dục trên thanh điều hướng: **PASS**.
     - D-Pad trên RobotStatusPanel: **PASS**.
     - Đồng hồ tốc độ & Telemetry HUD strip: **PASS**.
     - Gắn kết buồng lái Triple View Cockpit: **PASS**.
  4. *Runtime Cleanliness:*
     - Lỗi console & ngoại lệ không xử lý: **PASS** (0 console errors).

---

### 2. KẾT QUẢ KIỂM THỬ HỒI QUY PHASE C (AUDIT & MEASUREMENTS)

* **Tập lệnh:** `scripts/verify_phase_c_audit.mjs`
* **Kết quả:** **TOÀN BỘ CÁC MỤC KIỂM TRA ĐẠT (PASS)**
* **Chi tiết nhóm kiểm tra:**
  1. *Kiểm tra 6 kích thước khung nhìn (Viewports):*
     - `1586x992` (Desktop tham chiếu): Header $81\text{ px}$, Sidebar $285\text{ px}$, không tràn layout (**PASS**).
     - `1536x960` (Màn hình 2K/FHD): Header $81\text{ px}$, Sidebar $285\text{ px}$ (**PASS**).
     - `1440x900` (Laptop 14-inch): Header $81\text{ px}$, Sidebar $285\text{ px}$ (**PASS**).
     - `1280x800` (Laptop học sinh): Header $81\text{ px}$, Sidebar $285\text{ px}$ (**PASS**).
     - `1024x768` (Tablet STEM): Header $81\text{ px}$, Sidebar $285\text{ px}$ (**PASS**).
     - `390x844` (Mobile): Header $77\text{ px}$, các thành phần xếp chồng linh hoạt (**PASS**).
  2. *Góc nhìn camera 3D Canvas:* Khung nhìn hiển thị rõ nét toàn bộ xe và bánh xe (**PASS**).
  3. *Hiệu năng & Tài nguyên:* Tần số khung hình $\ge 58\text{ FPS}$, bộ nhớ heap ổn định.

---

### 3. KIỂM TRA TYPE-SAFETY & PRODUCTION BUILD

* **Lệnh kiểm tra kiểu:** `npm run lint` (`tsc --noEmit`) $\to$ **0 lỗi cú pháp / type error**.
* **Lệnh biên dịch đóng gói:** `npm run build` $\to$ **Thành công trong 448ms**, tạo gói `dist/` hoàn chỉnh.

---

### 4. KẾT LUẬN HỒI QUY
Toàn bộ các chức năng kế thừa từ Phase B và Phase C đều được bảo toàn nguyên vẹn $100\%$, không có bất kỳ hiện tượng hồi quy tiêu cực nào sau các sửa đổi về hướng robot và động học vi sai.
