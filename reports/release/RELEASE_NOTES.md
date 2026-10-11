# RELEASE NOTES — CMU10 PRODUCTION RELEASE PHASE C
## Phòng Thí Nghiệm Robot & Mô Phỏng Vật Lí 10 (GDPT 2018)

**Bản phát hành:** CMU10 Phase C Production Release  
**Ngày phát hành:** 11/10/2026  
**Kho lưu trữ chính thức:** [https://github.com/ltliem89/CMU10](https://github.com/ltliem89/CMU10)  
**Nhánh triển khai:** `main`  

---

## 1. GIỚI THIỆU PHIÊN BẢN
Bản phát hành CMU10 Phase C chính thức hoàn thiện việc tái cấu trúc giao diện tương tác chuyên sâu, chuẩn hóa mô hình động học vi sai của robot NVIDIA JetBot giáo dục và tích hợp bài bản chương trình học tập môn Vật lí 10 theo định hướng GDPT 2018 - STEM.

---

## 2. TÍNH NĂNG NỔI BẬT

### 🚀 Giao Diện Chuẩn Tham Chiếu & Đa Nền Tảng (Responsive)
- Thiết kế 3 cột chuyên nghiệp: Sidebar bài học bên trái, Vùng mô phỏng trung tâm, Bảng điều khiển cảm biến bên phải.
- Hoàn toàn tương thích và không tràn ngang trên 6 cỡ màn hình (từ Máy tính bàn 2K, Laptop 14-inch, Máy tính bảng học sinh cho đến Điện thoại di động).
- Thanh tiêu đề chuẩn nhận diện Deep Navy `#082B59` với đầy đủ 5 trụ cột sư phạm: **Bài học**, **Mô phỏng**, **Lập trình**, **Phân tích**, **Báo cáo**.

### 🤖 Mô Phỏng Vật Lý Chuẩn Xác & Khoa Học
- Mô hình động học vi sai differential drive ($v, \omega$) chính xác với kích thước vật lý thực của JetBot: Bán kính bánh $R = 32.5\text{ mm}$, Wheelbase $L = 102\text{ mm}$.
- Đạt độ chính xác $99.92\%$ đối với bài toán quay tròn tại chỗ và triệt tiêu hoàn toàn độ lệch hướng khi chạy thẳng.
- Đồng hồ mô phỏng khoa học: Đóng băng tuyệt đối khi Tạm dừng (PAUSE), cho phép học sinh ghi chép dữ liệu thí nghiệm chính xác.

### 🛡️ Cơ Chế An Toàn Phần Mềm (E-STOP Hard Lockout)
- Nút ngắt khẩn cấp E-STOP triệt tiêu tức thì 100% xung động cơ ($\text{PWM} = 0\%$).
- Tích hợp chốt chặn an toàn: Tự động khóa và từ chối mọi lệnh điều khiển tay hoặc lệnh lập trình gửi đến khi hệ thống đang trong tình trạng ngắt an toàn.

### 🗺️ Bản Đồ Chiến Thuật & Điều Hướng Linh Hoạt
- Bản đồ sa bàn 2D hỗ trợ thu phóng cuộn chuột (Wheel Zoom), kéo rê góc nhìn (Pan), căn vừa toàn cảnh (Fit Scene) và bám theo xe (Follow Robot).
- Chế độ chọn điểm đến tương tác (Click-to-Goal) với phím nóng `Escape` giúp hủy nhanh thao tác.
