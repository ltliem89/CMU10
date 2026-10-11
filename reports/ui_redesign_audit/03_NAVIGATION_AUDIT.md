# BÁO CÁO 03: ĐÁNH GIÁ ĐIỀU HƯỚNG & CẤU TRÚC MENU (NAVIGATION AUDIT)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10 STEM)

> **Mục tiêu tài liệu**: Phân tích chi tiết thanh điều hướng trên cùng (Top Bar), thanh bên (Sidebar Navigation), ngăn kéo di động (Mobile Drawer) và chân trang (Footer). Đánh giá tải nhận thức của 10 tab dàn trải hiện tại, xác định các điểm trùng lặp và phân loại hành động tái cấu trúc (`KEEP`, `RELOCATE`, `MERGE`, `REDESIGN`) cho Phase B.

---

## 1. Hiện Trạng Cấu Trúc Điều Hướng CMU10

Hiện tại, ứng dụng phân bổ điều hướng qua 4 khu vực:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [TOP BAR] Logo | Title | Badges (VIBRANT STEM, Lớp 11) | Dark/Light | Font Size | E-STOP│
├──────────────────────────┬─────────────────────────────────────────────────────────────┤
│ [SIDEBAR (56px - 240px)] │ [MAIN CONTENT WORKSPACE]                                    │
│ 1. Kiến Thức             │ (Hiển thị 1 trong 10 tabs theo state currentTab)            │
│ 2. Robot 2 Động Cơ       │                                                             │
│ 3. 12 Modules            │ - Tab 'robot-sim' mở TripleViewCockpit (Sa bàn, 3D, FPV)    │
│ 4. Sơ Đồ Quy Trình       │ - Tab 'modules' mở ModuleDetailView                         │
│ 5. Thư Viện Hàm          │ - Tab 'what-if' mở WhatIfPlayground                         │
│ 6. Đồ Thị AI             │ - Tab 'training-charts' mở TrainingChartsView               │
│ 7. Thí Nghiệm Nếu-Như    │ - Các tab khác: KnowledgeMap, Pipeline, Functions, Quiz... │
│ 8. Trắc Nghiệm           │                                                             │
│ 9. Thuật Ngữ             │                                                             │
│ 10. Nguồn & Lưu Ý        │                                                             │
│ + Accordion 12 Modules   │                                                             │
│ + Accordion Bảng Màu     │                                                             │
├──────────────────────────┴─────────────────────────────────────────────────────────────┤
│ [FOOTER] Bản quyền | An Toàn 100% | Mô phỏng trình duyệt | Link Nguồn kỹ thuật         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kiểm Kê & Đánh Giá Từng Thành Phần Điều Hướng

### A. Thanh Tiêu Đề Trên Cùng (Global Top Header - `src/App.tsx:198-303`)

| Phần tử giao diện | Chức năng hiện tại | Đánh giá UX / Vấn đề phát hiện | Đề xuất hành động |
| :--- | :--- | :--- | :--- |
| **Logo & Tên ứng dụng** | Nhấp để quay về tab `home` (`Kiến Thức`) | Trực quan, nhận diện thương hiệu tốt, hiệu ứng hover mượt | `KEEP` |
| **Huy hiệu "Lớp 11"** | Nhãn phân loại lớp học | **SAI LỆCH SƯ PHẠM**: Dự án chuẩn là **Vật lí 10**, không phải 11 | `REDESIGN` -> Đổi thành **Vật lí 10** |
| **Mô tả ngắn header** | *Phòng thí nghiệm lập trình robot vi sai & AI bám đường / tránh va chạm* | Chiếm diện tích ngang trên màn hình trung bình, bị ẩn trên mobile | `KEEP` nhưng tối ưu ngắn gọn |
| **Nút Chuyển Dark/Light** | Đổi class `dark` trên `<html>`, đổi icon Sun/Moon | Hoạt động tức thì, tương phản tốt | `KEEP` |
| **Bộ đổi cỡ chữ (A/A+/A++)** | Đổi class `font-size-large`, `font-size-xlarge` | Rất hữu ích khi giáo viên chiếu lên máy chiếu lớp học | `KEEP` |
| **Badge "Mô phỏng an toàn"** | Biểu tượng khiên xanh + chấm ping xanh | Cung cấp cảm giác yên tâm khi chạy mã lập trình | `KEEP` (gọn lại dạng pill nhỏ) |
| **Nút DỪNG KHẨN CẤP** | Đỏ rực rỡ, icon cảnh báo, mở `EmergencyStopModal` | Cực kỳ nổi bật, thao tác 1 chạm, chuẩn an toàn công nghiệp | `KEEP` — Bắt buộc duy trì |

---

### B. Thanh Bên Điều Hướng Chính (Sidebar Navigation - `src/App.tsx:308-457`)

Thanh bên hiện tại chứa danh sách phẳng gồm 10 mục điều hướng:

| STT | Mục điều hướng | Icon | Badge | Hành vi khi nhấp | Đánh giá kiến trúc thông tin | Đề xuất Phase B |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Kiến Thức** | `Layers` | *(không)* | Chuyển `currentTab = 'home'` | Là bản đồ tổng thể 12 bài học, thực chất là cổng vào bài học | `MERGE` vào nhóm **Bài Học** |
| 2 | **Robot 2 Động Cơ** | `Compass` | `Mô phỏng` | Chuyển `currentTab = 'robot-sim'` | Trung tâm thực hành mô phỏng (Sa bàn, 3D Twin, FPV) | `KEEP` làm trụ cột **Mô Phỏng** |
| 3 | **12 Modules** | `Bot` | `12 Bài` | Chuyển `currentTab = 'modules'` | Chi tiết bài giảng từng module lý thuyết | `MERGE` vào nhóm **Bài Học** |
| 4 | **Sơ Đồ Quy Trình** | `GitFork` | *(không)* | Chuyển `currentTab = 'pipeline'` | Sơ đồ luồng phần cứng từ Python xuống động cơ | `RELOCATE` vào mục **Bài Học / Phần Cứng** |
| 5 | **Thư Viện Hàm** | `BookOpen` | `30+` | Chuyển `currentTab = 'functions'` | Tra cứu cú pháp lệnh Python điều khiển robot | `RELOCATE` vào nhóm **Lập Trình** |
| 6 | **Đồ Thị AI** | `LineChart` | `Bokeh` | Chuyển `currentTab = 'training-charts'` | Đồ thị phân tích huấn luyện và hàm mất mát | `RELOCATE` vào nhóm **Phân Tích** |
| 7 | **Thí Nghiệm Nếu-Như** | `Sliders` | `Lab` | Chuyển `currentTab = 'what-if'` | Thay đổi tham số ma sát, khối lượng xem phản ứng vật lí | `RELOCATE` vào nhóm **Phân Tích / Thí Nghiệm** |
| 8 | **Trắc Nghiệm** | `HelpCircle` | `10 Câu` | Chuyển `currentTab = 'quiz'` | Kiểm tra kiến thức trắc nghiệm Vật lí 10 & Robotics | `RELOCATE` vào nhóm **Báo Cáo / Đánh Giá** |
| 9 | **Thuật Ngữ** | `BookA` | *(không)* | Chuyển `currentTab = 'glossary'` | Từ điển tra cứu khái niệm | `RELOCATE` vào menu tiện ích **Trợ Giúp** |
| 10 | **Nguồn & Lưu Ý** | `FileText` | *(không)* | Chuyển `currentTab = 'sources'` | Tài liệu tham khảo và lưu ý phần cứng | `RELOCATE` vào menu tiện ích **Trợ Giúp** |

---

### C. Hai Khối Accordion Phụ Trên Sidebar (`src/App.tsx:363-455`)

1. **Khối danh sách cuộn "12 Modules" (Accordion)**:
   - Cho phép chọn nhanh từ Module 1 đến Module 12 để nhảy trực tiếp vào `ModuleDetailView`.
   - *Đánh giá*: Trùng lặp với mục số 3 ("12 Modules") và bản đồ số 1 ("Kiến Thức"). Có đến 3 nơi cùng thực hiện việc chọn module.
   - *Đề xuất Phase B*: Tích hợp làm menu con thả xuống (submenu / sub-tabs) bên trong màn hình **Bài Học**.
2. **Khối "Màu STEM Chuẩn" (Palette Card)**:
   - Hiển thị 6 chấm màu quy ước (Xanh: Điều khiển, Tím: AI, Hồng: Sáng tạo, Cam: Thử nghiệm, Vàng: Khám phá, Ngọc: Cảm biến).
   - *Đánh giá*: Chiếm 120px chiều cao sidebar, chỉ mang tính tham khảo màu sắc, học sinh không thao tác được gì ngoài đọc.
   - *Đề xuất Phase B*: Chuyển thành tooltip hoặc modal hướng dẫn, giải phóng hoàn toàn không gian cho chiều dọc màn hình.

---

## 3. Phân Tích Nhược Điểm UX & Tải Nhận Thức (Cognitive Load)

1. **Quá tải lựa chọn (Choice Overload - Hick's Law)**:
   - Người học khi mở ứng dụng nhìn thấy ngay 10 mục menu xếp hàng dọc.
   - Không có sự phân biệt thứ bậc rõ ràng giữa nội dung chính (Học bài, Mô phỏng) và tài liệu phụ (Thuật ngữ, Nguồn lưu ý).
2. **Không gian màn hình bị chia cắt**:
   - Sidebar chiếm từ 224px đến 240px chiều ngang. Khi màn hình là laptop 1366x768 hoặc 1280x800, không gian còn lại cho sa bàn đua và robot 3D bị co hẹp.
   - Chế độ Focus thu gọn sidebar xuống 56px là giải pháp tốt, nhưng cần được tích hợp tự nhiên hơn vào kiến trúc IA tổng thể.
3. **Thiếu liên kết liền mạch giữa Học -> Code -> Mô phỏng -> Phân tích**:
   - Người học khi đọc bài Module 2 (Điều khiển từ xa) phải tự nhớ chuyển sang tab "Robot 2 Động Cơ" để chạy thử.
   - Không có nút chuyển ngữ cảnh "Mở phòng lab cho bài này" hoặc "Chạy thử mã mẫu trong buồng lái".

---

## 4. Đề Xuất Phân Nhóm 5 Trụ Cột Chuẩn CMU10 Cho Phase B

Tái cấu trúc 10 tab phân mảnh hiện tại thành **5 Nhóm Chức Năng Cốt Lõi (5 Primary Pillars)** kết hợp với thanh tiện ích:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ CMU10 JETBOT LAB 10   [Bài Học]   [Mô Phỏng]   [Lập Trình]   [Phân Tích]   [Đánh Giá & BC]   │
│ (Vật lí 10 STEM)       (M1 - M12)  (2D/3D/FPV)   (Code/Hàm)    (Đồ thị/Lab)   (Quiz/Báo cáo) │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thanh Tiện Ích Phụ (Góc Phải): [Trợ Giúp/Thuật Ngữ] [Sáng/Tối] [Cỡ Chữ] [DỪNG KHẨN CẤP]       │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Trụ cột 1: BÀI HỌC (Lessons & Knowledge)**:
   - Gộp `Kiến Thức` (`KnowledgeMap`), `12 Modules` (`ModuleDetailView`), và `Sơ Đồ Quy Trình` (`PipelineDiagram`).
   - Cung cấp luồng học tuyến tính từ cơ bản đến nâng cao.
2. **Trụ cột 2: MÔ PHỎNG (Simulation Workspace - Heart of CMU10)**:
   - Giữ nguyên toàn bộ sức mạnh của `TripleViewCockpit` với 6 layout modes, sa bàn 2D tương tác cao, robot 3D CAD và FPV.
3. **Trụ cột 3: LẬP TRÌNH (Coding & Studio)**:
   - Kết hợp `FunctionExplorer` (thư viện hàm), trình soạn thảo Python và bảng hiển thị luồng tín hiệu phần cứng.
4. **Trụ cột 4: PHÂN TÍCH (Analytics & Physics Telemetry)**:
   - Gộp `TrainingChartsView` (đồ thị AI/vận tốc) và `WhatIfPlayground` (thí nghiệm thông số ma sát, khối lượng Vật lí 10).
5. **Trụ cột 5: BÁO CÁO & ĐÁNH GIÁ (Reports & Assessment)**:
   - `QuizPanel` (10 câu trắc nghiệm chấm điểm tự động) và chức năng xuất kết quả thực hành Vật lí 10.
- **Tiện ích phụ (Utilities)**:
  - `Thuật Ngữ` (`GlossaryView`) và `Nguồn Tài Liệu` (`SourcesAndCaveats`) được xếp vào menu Trợ Giúp (Help & Docs).
  - Đổi toàn bộ nhãn hiển thị từ `Lớp 11` sang **Vật lí 10**.
