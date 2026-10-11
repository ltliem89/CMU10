# CMU10 — BÁO CÁO PHÂN TÍCH RỦI RO HỒI QUY (REGRESSION RISKS & MITIGATION)
## Đánh giá Rủi ro Kỹ thuật & Biện pháp Ngăn ngừa Lỗi Hệ thống

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu chuẩn:** Phase B Master UI Reconstruction
- **Phiên bản:** V1.0
- **Ngày lập:** 11/10/2026

---

## 1. DANH MỤC CÁC NGUY CƠ HỒI QUY (REGRESSION VECTORS)

Trong quá trình tái cấu trúc toàn diện giao diện theo hình mẫu tham chiếu `cmu10_reference.png`, nhóm kỹ thuật đã nhận diện và xử lý 5 rủi ro hồi quy chính:

```
+---------------------------------------------------------------------------------------------------------------+
| Rủi ro Kỹ thuật                        | Mức độ | Hậu quả tiềm tàng              | Biện pháp Triệt tiêu        |
+---------------------------------------------------------------------------------------------------------------+
| 1. Lệch đồng bộ trạng thái động cơ     | Cao    | Xe 3D đứng yên khi kéo slider  | Hợp nhất qua simulationStore|
| 2. Rò rỉ bộ nhớ WebGL Three.js         | Cao    | Giật lag sau nhiều lần chuyển  | Dispose triệt để Geo/Mat/Tex|
| 3. Tái xuất hiện nhãn sai "Lớp 11"     | Trung  | Vi phạm nội dung sư phạm GDPT  | Khóa chặt file đăng ký mẫu  |
| 4. Xung đột lớp phủ giao diện (Z-index)| Cao    | Chặn sự kiện click chuột       | Chuẩn hóa thang Z-Index 0-50|
| 5. Tràn thanh cuộn ngang trên tablet   | Thấp   | Vỡ khung hiển thị              | Ép min-w-0 và flex-wrap     |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 2. CHI TIẾT CÁC BIỆN PHÁP BẢO VỆ (DEFENSIVE IMPLEMENTATION)

### 2.1. Triệt tiêu rủi ro Desync động cơ
- Mọi tương tác điều khiển (từ bàn phím D-Pad, thanh trượt tốc độ trong `RobotStatusPanel`, kịch bản chạy trong `LessonSidebar`, hoặc nút Chạy/Bước trong Viewport Toolbar) đều gửi lệnh trực tiếp vào `simulationStore.setMotorSpeeds()`.
- Bất kỳ thành phần nào cần đọc dữ liệu vận tốc, tọa độ hay cảm biến đều lắng nghe từ `simulationStore.subscribe()` với cơ chế tiết lưu 20 FPS thông minh.

### 2.2. Kiểm soát vòng đời Three.js WebGL
- Toàn bộ mesh Three.js, vật liệu (`MeshStandardMaterial`), hình học (`BoxGeometry`, `CylinderGeometry`) và canvas DOM được dọn dẹp sạch sẽ trong hook cleanup của `useEffect` khi unmount hoặc chuyển tab.
- Cơ chế Fallback 2.5D tự động được kích hoạt nếu GPU hoặc WebGL trên máy người dùng gặp sự cố.

### 2.3. Loại bỏ triệt để và vĩnh viễn nhãn "Lớp 11"
- Đã rà soát và thay thế toàn bộ chuỗi ký tự "Lớp 11" sang "Lớp 10 / Vật lí 10 (Chương trình GDPT 2018)" trên toàn bộ cây mã nguồn (`KnowledgeMap.tsx`, `SourcesAndCaveats.tsx`, `TripleViewCockpit.tsx`, `RobotTwinMotorSimulator.tsx`, `CMUHeader.tsx`, `LessonSidebar.tsx`).
- Tạo mới cơ sở dữ liệu `physics10LessonsData.ts` làm chuẩn mực định danh cho 5 bài học Vật lí 10 cốt lõi.

### 2.4. Chuẩn hóa phân tầng Z-Index
- `z-0`: Canvas Three.js WebGL & Tactical Arena Map.
- `z-10`: Các bảng điều khiển nổi (Camera Controls, MiniMap, Speedometer HUD, Compass Rose).
- `z-20`: Thanh điều hướng đỉnh (CMUHeader).
- `z-50`: Hộp thoại modal dừng khẩn cấp (EmergencyStopModal), Cài đặt, Trợ giúp và Toàn màn hình.
- Các lớp overlay nền mờ bắt buộc phải có nút đóng và gỡ bỏ `pointer-events` khi đóng để không chặn tương tác người dùng.
