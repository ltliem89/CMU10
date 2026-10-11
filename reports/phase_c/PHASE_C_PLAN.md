# CMU10 — PHASE C: KẾ HOẠCH KIỂM ĐỊNH CHI TIẾT
## Phase C Execution Plan: Visual Acceptance, Camera Framing, Physics & Control Validation

- **Dự án:** CMU10 — Phòng thí nghiệm mô phỏng Vật lí 10 & Robot AI JetBot
- **Giai đoạn:** Phase C — Visual Acceptance & Physics Validation
- **Chuẩn chương trình:** GDPT 2018 (Vật lí 10 — Động học & Động lực học chất điểm)
- **Baseline Git:** Branch `main`, Commit `5f8729d0b5618b60600d156083e78c9d6eeb057c`
- **Nguyên tắc:** Audit → Test → Evidence → Fix → Regression → Gate Review
- **Chính sách:** Bảo vệ nghiêm ngặt working tree (Zero commit, Zero push, Zero deploy). Không tự ý tắt máy.

---

## 1. MỤC TIÊU VÀ PHẠM VI 5 TRỤ CỘT KIỂM ĐỊNH

| Trụ cột | Mục tiêu kiểm định | Phương pháp thực nghiệm | Tiêu chí đạt (Acceptance Gate) |
| :--- | :--- | :--- | :--- |
| **1. Visual Acceptance** | Đo đạc bounding box DOM thực tế trên 6 viewports: 1586×992 (chuẩn reference), 1536×960, 1440×900, 1280×800, 1024×768, và mobile 390×844. Đối chiếu kích thước, khoảng cách, màu sắc, typography và chống tràn chữ. | Playwright Headless + DOM Bounding Box Measurement Script + Canvas Screen capture | Không vỡ khung, không text-clipping, không horizontal overflow, Header $80 - 84\text{px}$, các panel cân đối. |
| **2. Camera Framing & Map Navigation** | Tỷ lệ khung hình robot ban đầu trong viewport 3D và 2D. Tầm nhìn sa bàn phía trước và vật cản. Tính năng Fit Scene không chỉ đặt zoom 100% mà phải căn chỉnh biên sa bàn. Thao tác chuột Pan, Wheel Zoom, Zoom Anchoring, Focus Robot, Follow Robot, Free Camera, Click-to-Goal, hủy bằng Escape. | Script kiểm thử tương tác tự động + đo tỉ lệ bounding box robot / viewport | Robot chiếm tỉ lệ hợp lí ($10 - 25\%$ chiều cao viewport), nhìn rõ đường đi phía trước. Fit Scene không thay đổi sim pose/clock. Thao tác bản đồ độc lập không phát sinh lệnh motor. |
| **3. Physics Validation** | Kiểm định phương trình động học vi sai JetBot: $v = (v_R+v_L)/2$, $\omega = (v_R-v_L)/L$. Kiểm định đơn vị chuẩn (m, s, rad, m/s, rad/s). Kiểm định đồng hồ mô phỏng (STOPPED, RUNNING, PAUSED, STEP +0.1s, RESET). Nhất quán trạng thái trên 8 view/panel. Loại trừ hoàn toàn dual-loop trong `RobotTwinMotorSimulator`. | Đo đạc trực tiếp trên `simulationStore`, tính toán sai số động học vi tích phân, đối chiếu 8 component | $\Delta v \le 0.001\text{m/s}$, $\Delta \omega \le 0.001\text{rad/s}$, thời gian nhảy đúng $0.100\text{s}$ khi step, $0$ lệch pha giữa các view, không còn timer độc lập. |
| **4. Control & Safety** | Quyền điều khiển duy nhất tại một thời điểm (Arbitration). Cơ chế an toàn E-STOP ưu tiên tuyệt đối, khóa tức thời xung PWM về 0%, phanh điện tử, không tự ý resume, yêu cầu xác nhận/reset rõ ràng. Vòng đời Run / Pause / Step / Reset ổn định. | Thử nghiệm xung đột lệnh điều khiển: Keyboard vs D-Pad vs Goal vs E-STOP | E-STOP ngắt $100\%$ motor trong $< 50\text{ms}$, duy trì chốt an toàn (latch state) cho đến khi người dùng giải tỏa. |
| **5. Performance & Regression** | Thời gian build production, dung lượng bundle, khởi tạo WebGL, phản hồi sự kiện chuột pan/zoom, tính ổn định bộ nhớ và $0$ lỗi console error. | `npm run lint` (`tsc --noEmit`), `npm run build`, Chrome performance profiler | Build $< 1\text{s}$, 0 error console, không memory leak qua dispose Three.js. |

---

## 2. LỊCH TRÌNH VÀ CÁC BƯỚC THỰC HIỆN

```
[BƯỚC 1: KHỞI TẠO THƯ MỤC & ĐO ĐẠC VISUAL TẠI 6 VIEWPORTS]
       ↓
[BƯỚC 2: KIỂM ĐỊNH CAMERA FRAMING, ROBOT BOUNDING RATIO & FIT SCENE]
       ↓
[BƯỚC 3: KIỂM ĐỊNH ĐỘNG HỌC VI SAI, CLOCK & ĐỒNG BỘ 8 VIEW]
       ↓
[BƯỚC 4: KIỂM ĐỊNH BẢNG ĐIỀU KHIỂN, ARBITRATION & CHỐT AN TOÀN E-STOP]
       ↓
[BƯỚC 5: ĐO ĐẠC HIỆU NĂNG, MEMORY, BUNDLE & ZERO CONSOLE ERROR]
       ↓
[BƯỚC 6: XỬ LÝ KHOẢNG CÁCH (NẾU CÓ GAP) & CHẠY REGRESSION TOÀN DIỆN]
       ↓
[BƯỚC 7: TỔNG HỢP GATE REVIEW & BÀN GIAO PHASE C]
```
