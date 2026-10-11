# CMU10 — BÁO CÁO ĐẶC TẢ GÓC NHÌN VÀ CAMERA (CAMERA FRAMING SPECIFICATION)
## Cấu hình Góc nhìn Three.js, Camera FPV 160° và Bộ trưng bày Đa góc nhìn

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu chuẩn:** Phase B Master UI Reconstruction
- **Phiên bản:** V1.0
- **Ngày lập:** 11/10/2026

---

## 1. CÁC CHẾ ĐỘ CAMERA CHÍNH (CAMERA MODES)

Hệ thống cung cấp 3 chế độ camera cơ bản được kích hoạt qua thanh điều hướng bên trái Viewport:

```
+-------------------------------------------------------------------------------------------------+
| Chế độ      | Mục đích                                 | Vị trí Camera (X, Y, Z) | Target Focus |
+-------------------------------------------------------------------------------------------------+
| Fit cảnh    | Căn chỉnh góc nhìn bao quát toàn bộ xe   | (0.28, 0.22, 0.32)      | (0, 0.04, 0) |
| Theo xe     | Camera bám theo đuôi robot khi chạy      | Theo Pose (Offset -0.25)| Tâm robot    |
| Góc tự do   | Cho phép người dùng xoay 360°, soi chi tiết linh kiện CAD           | Tự do        |
+-------------------------------------------------------------------------------------------------+
```

Ngoài ra, hệ thống hỗ trợ 4 góc nhìn chuẩn kỹ thuật (Quick CAD Presets):
- **3D Iso:** Góc phối cảnh chuẩn ISO $45^\circ$ (Trực quan hóa hình học không gian).
- **Top:** Nhìn vuông góc từ trên đỉnh (Khảo sát bán kính quay và hướng chuyển động).
- **Front:** Nhìn trực diện mặt trước (Kiểm tra góc nghiêng cảm biến và camera).
- **Side:** Nhìn cạnh sườn (Kiểm tra khoảng sáng gầm xe 12mm và bán kính bánh xe 32.5mm).

---

## 2. CAMERA FPV THỰC NGHIỆM (FIRST-PERSON VIEW)

Camera FPV mô phỏng chính xác cảm biến quang học thực tế của JetBot:
- **Cảm biến mô phỏng:** Sony IMX219 CSI 8 Megapixel.
- **Ống kính Fisheye:** Trường nhìn chéo (FOV) $160^\circ$.
- **Góc nghiêng vật lí:** Chúc xuống $18^\circ$ so với phương ngang.
- **Tọa độ gắn trên giá đỡ:** $(0.00\text{ m}, 0.086\text{ m}, 0.065\text{ m})$ tính từ tâm trục bánh sau.
- **Ứng dụng giáo dục:**
  - Giúp học sinh trải nghiệm góc nhìn của xe tự hành khi dò đường (Road Following).
  - Phân tích hiện tượng biến dạng quang học (Fisheye distortion) và cách thuật toán AI định vị vạch tim đường.

---

## 3. PHÒNG TRƯNG BÀY CAMERA ĐA GÓC NHÌN (CAMERA VIEW GALLERY)

Tại Panel C của hàng phân tích phía dưới, bộ trưng bày camera 4 góc nhìn được đồng bộ thời gian thực:
1. **Toàn cảnh sa bàn (Overview):** Khái quát vị trí robot trong sân thi đấu.
2. **Bám sau xe (Follow Cam):** Góc nhìn góc thấp mô phỏng góc quan sát của trọng tài/huấn luyện viên.
3. **Cận cảnh robot (Close-up):** Soi chi tiết chuyển động quay của bánh xe và tản nhiệt Jetson Nano.
4. **Nhìn từ trên cao (2D Orthographic):** Góc nhìn bản đồ hình học không bị biến dạng phối cảnh.

Người dùng có thể bấm vào bất kỳ ô camera nào để chuyển khung nhìn chính sang góc nhìn tương ứng.
