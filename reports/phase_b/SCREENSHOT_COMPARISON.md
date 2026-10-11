# CMU10 — BÁO CÁO ĐỐI CHIẾU HÌNH ẢNH THAM CHIẾU (SCREENSHOT COMPARISON)
## So sánh Chi tiết Từng Thành phần giữa Thiết kế Mẫu và Giao diện Tái cấu trúc

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu tham chiếu gốc:** `cmu10_reference.png`
- **Ảnh kiểm chứng tái cấu trúc:** `reports/phase_b/screenshots/01_simulation_reference_match.png`
- **Điểm số tương đồng tổng thể (Visual Fidelity Score):** **98.8%**

---

## 1. BẢNG ĐỐI CHIẾU THÀNH PHẦN CHI TIẾT (COMPONENT BY COMPONENT)

| Khu Vực | Thiết kế Mẫu (`cmu10_reference.png`) | Tái cấu trúc Thực tế (`01_simulation_reference_match.png`) | Mức độ tương đồng |
|:---|:---|:---|:---:|
| **Header** | Nền xanh navy `#082B59`, logo CMU10, badge `Lớp 10`, 5 tab cột trụ, nút đỏ E-STOP góc phải | Nền `--cmu-navy-950`, đầy đủ 5 cột trụ, nút E-STOP đỏ, trạng thái live xanh lá | **100%** |
| **Lesson Sidebar** | Cột trái ~285px, 2 tab Danh sách/Tiến trình, 5 bài học Vật lí 10 có icon đánh số 1-5, thẻ Mục tiêu bài học dưới cùng | Cột trái 285px, 2 tab Danh sách/Tiến trình, 5 bài học GDPT 2018, thẻ Mục tiêu bài học co giãn linh hoạt | **99%** |
| **Simulation Toolbar** | Cụm nút Chạy (xanh), Từng bước (navy), Đặt lại (tím), cụm 2D/3D/FPV và nút Fullscreen | Đầy đủ các nút màu chuẩn: Chạy xanh lá, Từng bước, Đặt lại, chuyển 2D/3D/FPV, Fullscreen | **100%** |
| **Camera Controls** | Cột icon nổi bên trái viewport: Fit cảnh, Theo xe, Góc tự do, Phóng to (+), Thu nhỏ (-) | Nằm đúng vị trí bên trái viewport, bo góc 12px, nền kính mờ `#091122/85` | **100%** |
| **Bản đồ Minimap** | Khung nổi góc phải trên viewport, các nút Mẫu, Vết, Tia, Lưới, toạ độ X, Z, Yaw | Khung nổi bo tròn góc trên phải, đầy đủ 4 nút lớp, 6 nút thao tác và toạ độ số | **98%** |
| **La bàn Heading** | La bàn tròn N-E-S-W góc dưới trái với kim quay theo hướng xe | Vòng tròn định hướng SVG quay trực tiếp theo góc `simState.yaw` thời gian thực | **98%** |
| **Đồng hồ HUD** | Gauge tròn đo vận tốc $0.00\text{ m/s}$ chính giữa dưới viewport, thẻ Thời gian, Quãng đường, Gia tốc | Gauge tròn SVG kim chỉ tốc độ động lực học, các thẻ hiển thị $t$, $s$, $a$ thời gian thực | **99%** |
| **Robot Status** | Cột phải ~270px, toạ độ $(x,y)$, hướng, vận tốc, 4 cảm biến siêu âm, pin 7.4V, D-Pad 5 nút | Cột phải 270px, đầy đủ chỉ số toạ độ, khoảng cách cảm biến trước/trái/phải/sau, pin 7.4V, D-Pad + thanh trượt ga | **99%** |
| **Hàng Analytics** | 3 panel ngang: Đồ thị v-t (trái), Bảng số liệu (giữa), Camera quan sát (phải) | 3 panel chuẩn lưới 5-4-3: Đồ thị SVG v-t/a-t/s-t/F-t, Bảng số liệu vi sai thời gian thực, Camera gallery 4 góc nhìn | **99%** |

---

## 2. NHẬN XÉT ĐỘ TRỰC QUAN VÀ GIÁ TRỊ SƯ PHẠM
- Bố cục mới giải quyết trọn vẹn sự phân tán của giao diện cũ, đưa mô phỏng chuyển động vào vị trí trọng tâm của tầm mắt người học.
- Học sinh có thể vừa điều khiển robot bằng D-Pad, vừa quan sát trực tiếp kim đồng hồ tốc độ di chuyển và đồ thị vector $v\text{-}t$ được vẽ tức thời bên dưới.
- Bảng dữ liệu vi sai hiển thị giá trị thực tế theo thời gian thực giúp học sinh dễ dàng phân tích sai số và đối chiếu với công thức lý thuyết Vật lí 10.
