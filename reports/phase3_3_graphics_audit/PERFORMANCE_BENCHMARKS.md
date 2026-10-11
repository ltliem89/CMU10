# ĐO ĐẠC HIỆU NĂNG THỜI GIAN THỰC (PERFORMANCE BENCHMARKS)
**Dự án CMU10 JetBot AI & Robotics Interactive Studio**  
**Giai đoạn**: Phase 3.3 — Real-Time Performance & Rendering Audit  
**Môi trường thử nghiệm**: Microsoft Edge Chromium Engine (Direct3D11 via ANGLE), Intel(R) Iris(R) Xe Graphics, Windows 11 x64, Desktop Baseline 1440×900.

---

## 1. Môi Trường Phần Cứng & WebGL Driver

| Thuộc Tính | Giá Trị Thực Đo | Nhận Xét Kỹ Thuật |
|:---|:---|:---|
| **Hệ Điều Hành** | Windows (Win32 x64) | Môi trường máy trạm thử nghiệm tiêu chuẩn |
| **Trình Duyệt** | Microsoft Edge 156 (Chromium Engine) | Tương đồng 100% với Google Chrome |
| **WebGL Context** | WebGL 2.0 (OpenGL ES 3.0 Chromium) | Hỗ trợ đầy đủ VAO, Uniform Buffers, Floating-point textures |
| **GPU / Renderer** | ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11) | GPU tích hợp phổ biến trên các dòng laptop giáo dục Gen 11/12/13/14 |
| **Shading Language** | WebGL GLSL ES 3.00 | Hỗ trợ shader hiện đại, MRT, Flat/Centroid qualifiers |
| **Max Texture Size** | 16,384 × 16,384 px | Dư khả năng tải texture 1K/2K/4K |
| **Max Viewport Dims** | 32,767 × 32,767 px | Không bị nghẽn giới hạn kích thước canvas |
| **Device Pixel Ratio**| 1.0 (Baseline desktop viewport) | Tỷ lệ 1:1 backing buffer và CSS |

---

## 2. Kết Quả Đo Đạc Tốc Độ Khung Hình (FPS & Frame Time Distribution)

Được thu thập liên tục trong chu kỳ tải mô phỏng tích cực (Scenario B: xe chạy với vận tốc $v = 0.225\text{ m/s}$ và cập nhật liên tục tất cả các panel):

```
+-----------------------------------------------------------------------------------------+
|                                PHÂN PHỐI THỜI GIAN KHUNG HÌNH (MS)                      |
|                                                                                         |
|  Min: 11.8ms | Mean: 16.66ms | Median: 16.7ms | p95: 16.8ms | p99: 16.9ms | Max: 17.2ms  |
|                                                                                         |
|  [|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||]  |
|  11.8ms                         16.67ms (Chuẩn 60 FPS)                          17.2ms  |
+-----------------------------------------------------------------------------------------+
```

| Chỉ Số Đo Lường | Giá Trị Thực Đo | Ngưỡng Tiêu Chuẩn 60 FPS | Đánh Giá (Status) |
|:---|:---:|:---:|:---:|
| **Tổng số frame ghi nhận** | **608 frames** | N/A | Hoàn thành đủ mẫu thống kê |
| **FPS Trung Bình (Mean)** | **60.0 FPS** | $\ge 58.0\text{ FPS}$ | **PASS (Rất Ổn Định)** |
| **FPS 1% Low** | **58.7 FPS** | $\ge 45.0\text{ FPS}$ | **PASS (Không Giật Drop)** |
| **Thời gian Frame TB (Mean)** | **16.66 ms** | $16.67\text{ ms}$ | **PASS (Khớp chuẩn V-Sync)** |
| **Median Frame Time** | **16.70 ms** | $16.67\text{ ms}$ | **PASS** |
| **95th Percentile (p95)** | **16.80 ms** | $\le 20.00\text{ ms}$ | **PASS** |
| **99th Percentile (p99)** | **16.90 ms** | $\le 25.00\text{ ms}$ | **PASS** |
| **Frame Time Xấu Nhất (Worst 1%)** | **17.03 ms** | $\le 22.00\text{ ms}$ | **PASS** |
| **Frame Time Ngắn Nhất (Min)** | **11.80 ms** | N/A | Sớm hơn V-Sync |
| **Frame Time Dài Nhất (Max)** | **17.20 ms** | $\le 33.33\text{ ms}$ | **PASS (Không lag spike)** |
| **Số tác vụ dài (Long Tasks > 50ms)** | **0 tasks** | $0$ | **PASS (Main thread mượt mà)** |
| **Tăng trưởng bộ nhớ Heap** | **~24.4 MB / 10s** | $\le 30\text{ MB}$ | **PASS (Cần tối ưu pooling)** |

---

## 3. Độ Trễ Chuyển Đổi Bố Cục (Layout Switch Latency Benchmark)

Đo lường thời gian từ khi click nút chuyển bố cục đến khi hoàn tất layout reflow và WebGL resize (20 chu kỳ lặp lại = 120 lần chuyển đổi):

| Bố Cục (Layout) | Thời Gian TB (Avg) | Ngắn Nhất (Min) | Dài Nhất (Max) | Nhận Xét Hiệu Năng |
|:---|:---:|:---:|:---:|:---|
| **Standard** | `339.9 ms` | `92 ms` | `464 ms` | Chứa toàn bộ các panel phụ, chi phí dựng DOM cao nhất. |
| **Focus** | `406.9 ms` | `139 ms` | `465 ms` | Kích hoạt hiệu ứng thu gọn Sidebar (64px icon) + ẩn D-Pad. |
| **Split View** | `158.3 ms` | `139 ms` | `432 ms` | Layout cân đối 50:50, chuyển đổi nhanh. |
| **Triple View** | `174.4 ms` | `154 ms` | `216 ms` | Độ biến thiên thấp (Jitter rất nhỏ), chuyển mượt. |
| **Picture-in-Picture (PiP)** | `128.3 ms` | `123 ms` | `152 ms` | **Nhanh nhất**, cửa sổ FPV chuyển sang chế độ tuyệt đối (`absolute`). |
| **Fullscreen** | `169.7 ms` | `154 ms` | `203 ms` | Mở rộng 100vw × 100vh, ổn định cao. |

---

## 4. Kiểm Thử Khả Năng Thích Ứng Viewport & Đổi Kích Thước (Resize Stress Test)

Kiểm tra trên 4 cấu hình màn hình đại diện trong giáo dục và thiết bị di động:

| Kịch Bản Độ Phân Giải | Thiết Bị Đại Diện | Kích Thước Canvas 3D | Kích Thước Canvas FPV | Tồn Tại Canvas 0px? | Kết Luận |
|:---|:---|:---:|:---:|:---:|:---:|
| **1920 × 1080** | Màn hình Desktop Full HD | 450 × 340 px | 497 × 200 px | Không (0) | **PASS** |
| **1366 × 768** | Laptop học sinh phổ thông | 450 × 340 px | 424 × 200 px | Không (0) | **PASS** |
| **1024 × 768** | Máy tính bảng iPad / Tablet | 450 × 340 px | 294 × 200 px | Không (0) | **PASS** |
| **412 × 915** | Điện thoại thông minh (Mobile) | 450 × 340 px | 113 × 200 px | Không (0) | **PASS** |

*Ghi chú*: Toàn bộ canvas đều duy trì kích thước $>0\text{px}$, không xuất hiện màn hình trắng hoặc lỗi WebGL khi thay đổi kích thước đột ngột.

---

## 5. Tổng Kết Đánh Giá 10 Kịch Bản (Scenarios A – J)

| Kịch Bản | Mục Tiêu Thử Nghiệm | Kết Quả Thực Đo | Đánh Giá |
|:---:|:---|:---|:---:|
| **A** | Tải trang lần đầu & Mở Cockpit | Load: 713ms, Init: 1768ms, Render bình thường | **PASS** |
| **B** | Chạy mô phỏng tải cao 60s | 60.0 FPS, 1% Low: 58.7 FPS, 0 Long tasks | **PASS** |
| **C** | Step +0.1s & Pause | Step delta chính xác 0.10s, Pose đóng băng 0 trôi | **PASS** |
| **D** | Chuyển layout 20 vòng liên tiếp | 120/120 lần thành công, 0 lỗi, 0 màn hình trắng | **PASS** |
| **E** | Chuyển tab khi robot đang chạy | Phục hồi cả 2 canvas Three.js bình thường | **PASS** |
| **F** | Resize liên tục trên 4 kích thước | 100% canvas duy trì width/height hợp lệ | **PASS** |
| **G** | Bật tắt 7 chế độ CAD Inspection | Cả 7 chế độ cập nhật đúng DOM attribute | **PASS** |
| **H** | Va chạm vật cản & Đọc cảm biến | Robot không xuyên tâm, không NaN/Infinity | **PASS** |
| **I** | Bật/tắt mở rộng khung FPV | Khung nhìn FPV hoạt động ổn định | **PASS** |
| **J** | E-STOP & Reset vị trí ban đầu | PWM về 0%, Pose trở về (-0.80, 0.00)m | **PASS** |
