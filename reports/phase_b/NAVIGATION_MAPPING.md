# BÁO CÁO ÁNH XẠ ĐIỀU HƯỚNG 10 TABS CŨ SANG 5 TRỤ CỘT MỚI (PHASE B)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10)

> **Mục tiêu**: Ánh xạ toàn diện 10 tabs phân mảnh hiện tại vào **5 Trụ Cột Cấp Cao** và **4 Tiện Ích Phụ** theo đúng cấu trúc của hình tham chiếu chuẩn CMU10.

---

## 1. Cấu Trúc Điều Hướng Cấp Cao Mới (5 Pillars + Utilities)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] CMU10 - Phòng thí nghiệm Vật lí 10 [Lớp 10]                                                    │
│                                                                                                        │
│ [Bài học]     [Mô phỏng]      [Lập trình]      [Phân tích]      [Báo cáo]                              │
│ (Blue #1677FF)(Magenta #A21CAF)(Teal #0D9488) (Amber #F59E0B)  (Purple #7C3AED)                        │
│                                                                                                        │
│ Tiện ích: [Thư viện]  [Cài đặt]  [Trợ giúp]    [ ⚠ E-STOP ]                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bảng Ánh Xạ Chi Tiết 10 Tabs Cũ

| Tab Cũ | Tên Cũ | Trụ Cột Mới | Entry Point Mới | Component Phụ Trách | Hành Vi Chuyển Đổi & Lợi Ích UX |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tab 1** | `home` (Kiến Thức) | **1. Bài học** | Tab con `Tiến trình` trong Sidebar Trái & Trang Bài Học | `KnowledgeMap.tsx` | Hiển thị bản đồ mạng lưới 12 bài học, tiến độ hoàn thành mà không làm rời khỏi ngữ cảnh học tập. |
| **Tab 2** | `robot-sim` (Robot 2 Động Cơ) | **2. Mô phỏng** | **Workspace Trung Tâm Chính (Default View)** | `TripleViewCockpit.tsx` / `CMUSimulationWorkspace.tsx` | Không gian buồng lái mô phỏng trung tâm: Viewport 3D, Minimap 2D, FPV, D-Pad, HUD, 3 panel phân tích phía dưới. |
| **Tab 3** | `modules` (12 Modules) | **1. Bài học** | Tab con `Danh sách` trong Sidebar Trái | `LessonSidebar.tsx` + `ModuleDetailView.tsx` | Học sinh bấm chọn từng bài học Vật lí 10 trực tiếp từ sidebar bên trái, nạp ngay mục tiêu và thông số bài. |
| **Tab 4** | `pipeline` (Sơ Đồ Quy Trình) | **1. Bài học** / **3. Lập trình** | Sub-view `Phần Cứng & Tín Hiệu` | `PipelineDiagram.tsx` | Tích hợp vào phần cấu tạo phần cứng trong Bài học M1 hoặc tab Hardware trong Lập trình. |
| **Tab 5** | `functions` (Thư Viện Hàm) | **3. Lập trình** | Menu con `Thư Viện Lệnh JetBot` | `FunctionExplorer.tsx` | Đưa vào không gian Lập trình, học sinh vừa tra cứu cú pháp vừa có thể nạp lệnh vào robot mô phỏng. |
| **Tab 6** | `training-charts` (Đồ Thị AI) | **4. Phân tích** | Tab con `Đồ Thị AI & Huấn Luyện` | `TrainingChartsView.tsx` | Tách bạch giữa buồng lái điều khiển và phân tích chuyên sâu các mô hình học máy. |
| **Tab 7** | `what-if` (Thí Nghiệm Nếu-Như) | **4. Phân tích** | Tab con `Thí Nghiệm Giả Định Vật Lí` | `WhatIfPlayground.tsx` | Thí nghiệm tương tác thay đổi ma sát $\mu$, khối lượng $m$, quan sát biến thiên đồ thị. |
| **Tab 8** | `quiz` (Trắc Nghiệm) | **5. Báo cáo** | Tab con `Trắc Nghiệm Đánh Giá` | `QuizPanel.tsx` | 10 câu hỏi kiểm tra Vật lí 10 & Robotics, làm bài thi và chấm điểm kết thúc buổi học. |
| **Tab 9** | `glossary` (Thuật Ngữ) | **Tiện ích: Thư viện** | Modal / Drawer tra cứu từ điển | `GlossaryView.tsx` | Bấm vào nút `Thư viện` trên header mở nhanh bảng tra cứu thuật ngữ mà không ngắt quãng mô phỏng. |
| **Tab 10** | `sources` (Nguồn & Lưu Ý) | **Tiện ích: Trợ giúp** | Modal / Drawer hướng dẫn kỹ thuật | `SourcesAndCaveats.tsx` | Bấm vào nút `Trợ giúp` trên header mở tài liệu nguồn và hướng dẫn an toàn pin 7.4V. |

---

## 3. Các Tiện Ích Bổ Sung Trên Header
- **Thư viện**: Mở từ điển thuật ngữ (`GlossaryView`) và tài liệu tra cứu API.
- **Cài đặt**: Mở hộp thoại tùy chỉnh giao diện (Chế độ Sáng/Tối, Cỡ chữ A/A+/A++, Bật/tắt âm thanh động cơ).
- **Trợ giúp**: Mở hướng dẫn sử dụng phím tắt (Mũi tên điều khiển, Spacebar dừng khẩn cấp) và lưu ý phần cứng.
- **E-STOP**: Nút dừng khẩn cấp màu đỏ rực rỡ, luôn cố định ở góc trên cùng bên phải, ưu tiên ngắt động cơ tức thời.
