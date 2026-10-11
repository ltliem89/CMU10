# TỔNG KẾT SỬA LỖI VÀ GIỚI HẠN KỸ THUẬT (FIXES AND LIMITATIONS)

## 1. Các lỗi đã được xác minh và xử lý triệt để

| ID | Thành phần | Mô tả lỗi trước khi sửa | Giải pháp kỹ thuật đã áp dụng | Trạng thái |
|:---|:---|:---|:---|:---:|
| **FIX-01** | `useSimulationStore.ts` | Nguy cơ chia cho 0 (`NaN`) khi robot nằm trùng tâm vật cản (`dist === 0`) trong hàm phản hồi va chạm. | Thêm kiểm tra `dist > 0.001`, đẩy robot theo bán kính an toàn nếu trùng tâm, loại bỏ triệt để giá trị `NaN`/`Infinity`. | **RESOLVED** |
| **FIX-02** | `Robot3DCanvas.tsx` & `DynamicCameraFPV.tsx` | Sự kiện `window.resize` tĩnh không nhận biết được thay đổi kích thước panel khi kéo thanh phân cách. | Tích hợp `ResizeObserver` trực tiếp trên phần tử container, cập nhật `camera.aspect` và `renderer.setSize` tức thì. | **RESOLVED** |
| **FIX-03** | `TripleViewCockpit.tsx` | Chế độ Fullscreen chưa ẩn hoàn toàn các thanh điều khiển bên dưới và thiếu phím tắt thoát nhanh. | Tối ưu hóa kích thước panel lên 100% khi Fullscreen, ẩn các panel phụ và hỗ trợ phím `Escape` để thoát nhanh. | **RESOLVED** |
| **FIX-04** | `TacticalArenaMap.tsx` | Giới hạn chiều cao tĩnh `max-h-[500px]` làm sa bàn bị bó hẹp khi mở rộng toàn màn hình. | Loại bỏ `max-h-[500px]`, cho phép vector SVG co giãn tự do theo tỷ lệ của container. | **RESOLVED** |
| **FIX-05** | `TripleViewCockpit.tsx` | Phím Spacebar (E-STOP) có thể bị kích hoạt nhầm khi người dùng đang nhập văn bản hoặc code. | Thêm bộ lọc `e.target` bỏ qua các phần tử `input`, `textarea` và `isContentEditable`. | **RESOLVED** |

---

## 2. Các giới hạn kỹ thuật đã ghi nhận (Known Limitations)
1. **WebGL Khử Răng Cưa trên GPU Tích Hợp Cũ**: Ở một số thiết bị có GPU tích hợp rất yếu, việc hiển thị đồng thời cả 2 canvas Three.js (Robot 3D và FPV Camera) ở chế độ Triple View có thể giảm nhẹ FPS từ 60 xuống ~45 FPS.
2. **Kích thước Màn hình Rất Hẹp (<400px)**: Trên màn hình điện thoại di động siêu hẹp, chế độ Triple View sẽ tự động thích ứng nhưng người dùng được khuyến nghị sử dụng chế độ Focus hoặc PiP để có trải nghiệm điều khiển tốt nhất.