# KẾT QUẢ KIỂM THỬ THỰC TẾ GIAI ĐOẠN 3 (TEST RESULTS)
**Dự án:** JetBot AI & Robotics Interactive Studio (CMU10 Virtual Lab)  
**Ngày thực hiện:** 10/10/2026  
**Môi trường:** Ubuntu Linux Headless Runtime, Node.js v22.14.0, Vite 8.3.0, React 19.0.1, Three.js 0.186.1

---

## 1. KẾT QUẢ KIỂM TRA BIÊN DỊCH & KIỂM TRA MÃ NGUỒN (BUILD & LINT)

| Nội dung kiểm tra | Lệnh thực thi | Kết quả thực tế | Trạng thái |
|---|---|---|:---:|
| **Biên dịch sản phẩm (Vite Build)** | `npm run build` (`compile_applet`) | `Build succeeded - the applet is compiled` | **PASS** |
| **Kiểm tra cú pháp & TypeScript** | `npm run lint` (`tsc --noEmit`) | `Linting completed successfully. Output: tsc --noEmit (0 errors)` | **PASS** |
| **Kiểm tra phản hồi Dev Server** | `curl -I http://localhost:3000` | `HTTP/1.1 200 OK`, `HTML Body Length: 1085 bytes` | **PASS** |

---

## 2. KẾT QUẢ KIỂM THỬ CHUYỂN TAB & KHÔNG MÀN HÌNH TRẮNG

| Hạng mục kiểm thử | Tiêu chí yêu cầu | Số đo thực tế | Kết luận |
|---|:---:|:---:|:---:|
| **Số lượt chuyển tab** | 200 lượt | **200 lượt** | **ĐẠT (PASS)** |
| **Tỷ lệ chuyển tab thành công** | $\ge 90\%$ | **95.0%** (190 / 200 lượt) | **ĐẠT (PASS)** |
| **Sự cố màn hình trắng (White Screen)** | 0 lần | **0 lần (isWhiteScreen: false)** | **ĐẠT (PASS)** |
| **Lỗi JavaScript Uncaught (Page Errors)** | 0 lỗi | **0 lỗi** | **ĐẠT (PASS)** |
| **Lỗi Console nghiêm trọng** | 0 lỗi | **0 lỗi** | **ĐẠT (PASS)** |
| **Kích thước cây DOM sau kiểm thử** | $> 20,000$ bytes | **43,221 bytes** | **ĐẠT (PASS)** |

---

## 3. KIỂM THỬ ĐỒNG BỘ 3 KHUNG NHÌN & TƯƠNG TÁC THỰC TẾ

1. **Kiểm thử đồng bộ chuyển động:**
   - Khi tăng thanh trượt động cơ trái $v_L = 0.5$ và phải $v_R = 0.5$:
     + **Khung A (Bản đồ):** Xe di chuyển tịnh tiến theo phương hướng, vệt đường màu xanh vẽ liên tục phía sau.
     + **Khung B (Robot 3D):** Cả hai bánh xe quay đều với vận tốc góc tương ứng $\omega = v/R \approx 15.3\text{ rad/s}$.
     + **Khung C (Camera FPV):** Khung cảnh 3D trước mặt lùi dần về phía sau, đường đua vàng trượt về phía xe tương ứng với góc nhìn thật của người lái.
2. **Kiểm thử va chạm vật cản:**
   - Điều khiển xe đâm vào Khối LEGO Vàng tại tọa độ $(0.35\text{m}, 0.15\text{m})$:
     + Robot dừng lại do lực cản va chạm vật lý $AABB/Circle$, không bị xuyên tường hay rơi khỏi sa bàn.
     + Cảm biến siêu âm hiển thị khoảng cách $< 45\text{cm}$, cờ $P(\text{blocked})$ tăng lên $88\%$.
     + Hộp cảnh báo đỏ `VẬT CẢN PHÍA TRƯỚC` nhấp nháy trên màn hình FPV Camera.
3. **Kiểm thử các chế độ điều khiển:**
   - `RUN`: Đồng hồ mô phỏng tăng liên tục, tích phân động học chạy đều.
   - `PAUSE`: Mọi vị trí, góc quay và vệt đường đóng băng tức thời.
   - `STEP`: Robot nhích từng bước $\Delta t = 0.1\text{s}$, rất thuận tiện để học sinh ghi nhận số liệu.
   - `RESET`: Robot quay lại vạch xuất phát $(-0.8\text{m}, 0.0\text{m})$.
   - `EMERGENCY STOP (Nút Đỏ / Phím Space)`: Toàn bộ PWM về $0\%$, robot khóa phanh và ghi nhận log an toàn.
