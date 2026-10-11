# BÁO CÁO 09: HỒ SƠ BÀN GIAO & TÓM TẮT ĐIỀU HÀNH (HANDOFF SUMMARY)
## CMU10 — Chuẩn Bị Tái Cấu Trúc Giao Diện Phase B (UI Redesign Handoff)

> **Mục tiêu tài liệu**: Tài liệu tổng kết cô đọng, hành động được (actionable), dùng làm căn cứ bàn giao cho Kiến trúc sư / ChatGPT để xin phê duyệt kế hoạch tái cấu trúc giao diện Phase B.

---

## 1. Tóm Tắt Phát Hiện Kiểm Toán Trọng Yếu (Key Audit Findings)

1. **Sai lệch thông tin sư phạm (Pedagogical Misalignment)**:
   - Trong `App.tsx` (dòng 228 và 599) và `TripleViewCockpit.tsx` (dòng 490) đang hiển thị nhãn `Lớp 11`.
   - **Xác nhận chuẩn**: Toàn bộ dự án CMU10 phục vụ dạy học **Vật lí 10 (Chương trình GDPT 2018)** (Động học chất điểm, Chuyển động vi sai, Định luật Newton, Chuyển động tròn đều, Sai số thí nghiệm).
   - *Hành động Phase B*: Đồng bộ hóa toàn bộ tiêu đề, huy hiệu và bài tập về chuẩn Vật lí 10.
2. **Quá tải nhận thức do menu phẳng 10 tabs (Choice Overload)**:
   - Thanh bên hiện tại liệt kê dàn trải 10 tabs (`Kiến Thức`, `Robot 2 Động Cơ`, `12 Modules`, `Sơ Đồ Quy Trình`, `Thư Viện Hàm`, `Đồ Thị AI`, `Thí Nghiệm Nếu-Như`, `Trắc Nghiệm`, `Thuật Ngữ`, `Nguồn & Lưu Ý`).
   - Có sự phân mảnh giữa việc chọn bài học (3 nơi: Tab Kiến Thức, Tab 12 Modules, Accordion sidebar).
   - *Hành động Phase B*: Tái cấu trúc thành **5 Trụ Cột Chức Năng Cốt Lõi (5 Pillars)**.
3. **Trùng lặp 2 bộ mô phỏng (Dual-Simulator Redundancy)**:
   - Buồng lái chính `TripleViewCockpit.tsx` sử dụng `useSimulationStore.ts` tập trung, đồng bộ 2D/3D/FPV hoàn hảo.
   - Component cũ `RobotTwinMotorSimulator.tsx` (83.3 KB, 1,653 dòng) tự quản lý state riêng và đang nhúng trong `ModuleDetailView.tsx`.
   - *Hành động Phase B*: Thay thế `RobotTwinMotorSimulator` bằng cách kết nối trực tiếp vào `useSimulationStore`, loại bỏ 83KB code trùng lặp.
4. **Hiệu năng nền tảng xuất sắc (Rock-Solid Baseline)**:
   - TypeScript: **0 lỗi** (`tsc --noEmit` pass 100%).
   - Tốc độ tải trang: **722 ms**, DOM count: **725 nodes**, JS Heap: **45 MB**.
   - Playwright E2E: **18 ảnh chụp màn hình kiểm định thực tế**, 0 console errors.

---

## 2. Các Quy Tắc Bất Biến Bắt Buộc Bảo Toàn (Core Invariants)

Bất kỳ kế hoạch thiết kế lại nào trong Phase B **tuyệt đối KHÔNG ĐƯỢC PHÉP vi phạm**:

| STT | Quy Tắc Bất Biến (Invariant) | Lý Do Kỹ Thuật & Sư Phạm |
| :--- | :--- | :--- |
| **INV-1** | **Bảo toàn 100% mô hình vật lí trong `useSimulationStore.ts`** | Giữ nguyên bán kính bánh xe $r = 0.0325\text{m}$, khoảng cách $L = 0.13\text{m}$, vận tốc cực đại $0.8\text{m/s}$ và các phương trình động học vi sai. Không sửa vật lí để làm UI đẹp hơn. |
| **INV-2** | **Bảo toàn chuyển đổi tọa độ chuẩn MDN `getScreenCTM()`** | Đảm bảo tính năng đặt đích Click-to-Goal trên sa bàn 2D không bị trôi lệch pixel khi lồng ghép vào layout mới. |
| **INV-3** | **Bảo toàn 3 khung nhìn đồng bộ (2D Map, 3D Twin, FPV Camera)** | Dù người dùng chọn layout nào (Standard, Focus, Split, Triple, PiP, Fullscreen), trạng thái vị trí và hướng xe phải đồng nhất trên cả 3 khung. |
| **INV-4** | **Bảo toàn cơ chế an toàn Dừng Khẩn Cấp (E-STOP)** | Nút đỏ E-STOP và phím tắt `Spacebar` phải luôn khả dụng ở mọi màn hình, ngắt PWM về 0 tức thì. |
| **INV-5** | **Bảo toàn cơ chế cách ly Telemetry HUD Strip** | Dải chỉ số $t, x, z, \psi, \text{PWM}$ phải tiếp tục được bọc `React.memo` và throttle 50ms (20 FPS) để không gây bão re-render toàn bộ ứng dụng. |

---

## 3. Kiến Trúc Thông Tin Mục Tiêu Cho Phase B (Target 5 Pillars IA)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CMU10 JETBOT AI STUDIO   [Bài Học]   [Mô Phỏng]   [Lập Trình]   [Phân Tích]   [Đánh Giá & BC]    │
│ (Vật lí 10 STEM)          (M1 - M12)  (2D/3D/FPV)   (Code Lab)   (Đồ thị/Lab)   (Quiz & Báo cáo) │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thanh Tiện Ích Phụ:  [Tra Cứu Thuật Ngữ ?]  [Giao Diện ☼]  [Cỡ Chữ A/A+]  [DỪNG KHẨN CẤP ⚠]      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Trụ cột 1 — BÀI HỌC (Lessons)**: Gộp `Kiến Thức` (`KnowledgeMap`), `12 Modules` (`ModuleDetailView`), và `Sơ Đồ Quy Trình` (`PipelineDiagram`). Cung cấp nút chuyển nhanh "Mở Phòng Thí Nghiệm Cho Bài Này".
2. **Trụ cột 2 — MÔ PHỎNG (Simulation Workspace - Trung Tâm)**: Kế thừa toàn bộ buồng lái `TripleViewCockpit` với 6 chế độ bố cục, sa bàn 2D điều khiển linh hoạt, robot 3D PBR 7 chế độ CAD và camera FPV.
3. **Trụ cột 3 — LẬP TRÌNH (Coding & Studio)**: Tích hợp thư viện hàm `FunctionExplorer`, khung soạn thảo Python và bảng hiển thị active code / tín hiệu phần cứng.
4. **Trụ cột 4 — PHÂN TÍCH (Analytics & Physics Telemetry)**: Đồ thị động học Vật lí 10 ($v-t, s-t, a-t$), đồ thị học máy `TrainingChartsView`, và sân chơi thí nghiệm tham số `WhatIfPlayground`.
5. **Trụ cột 5 — ĐÁNH GIÁ & BÁO CÁO (Assessment & Lab Reports)**: Trắc nghiệm 10 câu `QuizPanel` và chức năng xuất phiếu kết quả thí nghiệm Vật lí 10.
- **Tiện ích phụ (Utilities)**: Thuật ngữ, tài liệu nguồn, tùy biến giao diện đưa vào thanh công cụ phụ phía trên bên phải.

---

## 4. Kế Hoạch Triển Khai Phase B (Đề Xuất Phê Duyệt)

- **Bước 1: Chuẩn hóa nội dung Vật lí 10**: Sửa nhãn "Lớp 11" thành "Vật lí 10", cập nhật các mô tả và mục tiêu bài học tương ứng.
- **Bước 2: Tái cấu trúc Shell điều hướng (`App.tsx`)**: Chuyển sang thanh điều hướng 5 trụ cột chính + thanh tiện ích phụ; hỗ trợ `React.lazy()` code-splitting.
- **Bước 3: Hợp nhất bộ mô phỏng động cơ**: Nối `ModuleDetailView` trực tiếp vào `useSimulationStore`, dọn dẹp component trùng lặp `RobotTwinMotorSimulator.tsx`.
- **Bước 4: Kiểm thử E2E & Nghiệm thu không hồi quy**: Chạy bộ kiểm thử tự động hóa Playwright xác nhận 100% test pass trước khi commit và phát hành.

---

## 5. Mẫu Lời Nhắc Bàn Giao Cho Người Dùng (Prompt For ChatGPT / Architect)

Người dùng có thể sao chép đoạn nội dung dưới đây để gửi cho ChatGPT hoặc Kiến trúc sư phê duyệt:

```markdown
Kính gửi Kiến trúc sư hệ thống / ChatGPT,

Tôi đã hoàn thành Giai đoạn Phase A (Audit & Feature Inventory) cho dự án CMU10 JetBot AI & Robotics Interactive Studio.
Bộ tài liệu kiểm định đầy đủ gồm 9 báo cáo và 18 ảnh chụp màn hình thực tế đã được lưu tại thư mục:
`reports/ui_redesign_audit/` (từ `01_PROJECT_INVENTORY.md` đến `09_HANDOFF_SUMMARY.md`).

Tóm tắt phát hiện chính:
1. Dự án phục vụ dạy học Vật lí 10 (không phải lớp 11). Hiện có sai lệch nhãn cần sửa trong Phase B.
2. 10 tabs phân mảnh hiện tại cần được gom lại thành 5 Trụ Cột Chức Năng Cốt Lõi:
   - 1. Bài Học (Lessons)
   - 2. Mô Phỏng (Simulation Workspace - Trung tâm)
   - 3. Lập Trình (Coding Studio)
   - 4. Phân Tích (Analytics & Telemetry)
   - 5. Đánh Giá & Báo Cáo (Assessment & Reports)
3. Toàn bộ logic vật lí trong `useSimulationStore.ts`, chuyển đổi tọa độ `coordinateTransforms.ts`, và 3 khung nhìn 2D/3D/FPV được đóng băng để bảo toàn tuyệt đối không gây hồi quy.
4. Xóa bỏ trùng lặp 83KB của component cũ `RobotTwinMotorSimulator.tsx` để dùng chung Store tập trung.

Xin ý kiến phê duyệt đề xuất kiến trúc thông tin trên để chúng tôi tiến hành Phase B (Implementation & Redesign).
```
