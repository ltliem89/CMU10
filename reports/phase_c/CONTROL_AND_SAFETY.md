# CMU10 — PHASE C: CONTROL AND SAFETY REPORT
## Báo Cáo Kiểm Định Phân Quyền Điều Khiển, Ngắt Khẩn Cấp E-STOP & An Toàn Mô Phỏng

**Dự án:** CMU10 — Phòng thí nghiệm mô phỏng Vật lí 10  
**Giai đoạn:** Phase C — Visual Acceptance & Physics Validation  
**Thời gian thực hiện:** 2026-10-11  
**Mục tiêu:** Kiểm tra cơ chế phân quyền điều khiển (arbitration), tính năng chốt ngắt khẩn cấp E-STOP và các chốt chặn an toàn phần mềm.  
**Kết quả tổng thể:** **PASS (100% Tiêu chí an toàn và điều khiển đạt chuẩn)**

---

## 1. PHÂN CẤP QUYỀN ĐIỀU KHIỂN (CONTROL ARBITRATION HIERARCHY)

Để đảm bảo hệ thống phản ứng tin cậy trong môi trường phòng học thực tế, kiến trúc CMU10 thiết lập 4 cấp độ ưu tiên điều khiển nghiêm ngặt:

```
[MỨC 0 — CAO NHẤT]  NGẮT KHẨN CẤP AN TOÀN (E-STOP LATCH)
       │            • Cắt 100% xung PWM (0%)
       │            • Khóa hoàn toàn mọi luồng nhận lệnh vận tốc
       ▼
[MỨC 1 — BẢO VỆ]    CHỐNG VA CHẠM & GIỚI HẠN SA BÀN (BOUNDARY CONTAINMENT)
       │            • Tự động chặn tọa độ robot vượt quá biên 2.4m x 1.6m
       │            • Phản lực nảy mềm (soft bounce) khi chạm chướng ngại vật
       ▼
[MỨC 2 — THỦ CÔNG]  ĐIỀU KHIỂN TAY (MANUAL OVERRIDE: PHÍM BẤM, D-PAD, GAMEPAD)
       │            • Can thiệp tức thời vào hành vi xe
       │            • Ghi đè các lệnh tự hành đang thực thi
       ▼
[MỨC 3 — TỰ HÀNH]   ĐIỀU KHIỂN TỰ ĐỘNG & BÀI HỌC (AUTONOMOUS / CLICK-TO-GOAL / PYTHON)
                    • Di chuyển theo mục tiêu Waypoint
                    • Chạy kịch bản lập trình mẫu của bài học Vật lí 10
```

---

## 2. KIỂM ĐỊNH TÍNH NĂNG NGẮT KHẨN CẤP (E-STOP HARD LOCKOUT)

### 2.1. Quy Trình Kích Hoạt & Cắt Nguồn Xung PWM
Khi người dùng bấm nút đỏ **"Ngắt khẩn cấp"** trên Header hoặc phím nóng hệ thống:
1. Trạng thái thực thi chuyển ngay lập tức sang `executionState = 'EMERGENCY_STOP'`.
2. Giá trị PWM hai kênh động cơ bị ép về 0 tức thời:
   $$\text{PWM}_L = 0\%, \quad \text{PWM}_R = 0\%$$
3. Tốc độ mục tiêu và tốc độ thực tế lập tức đặt về 0:
   $$v_{target, L} = 0, \quad v_{target, R} = 0, \quad v_{actual, L} = 0, \quad v_{actual, R} = 0$$
4. Dừng ngay đồng hồ mô phỏng, ghi nhận sự kiện nhật ký `LOG_EMERGENCY`.

### 2.2. Kiểm Định Chốt Khóa An Toàn (Latching Interlock)
Một lỗi nghiêm trọng trong các hệ thống mô phỏng thông thường là việc người dùng đóng thông báo khẩn cấp hoặc vô tình ấn phím điều khiển khiến robot chạy tiếp.
Trong CMU10 Phase C, cơ chế chốt khóa phần mềm (software safety interlock) đã được củng cố trực tiếp tại hàm cửa ngõ `setMotorSpeeds`:
```typescript
if (this.state.executionState === 'EMERGENCY_STOP' && (left !== 0 || right !== 0)) {
  // E-STOP safety lock active: ignore speed update until Reset or explicit Clear
  return;
}
```

### 2.3. Bằng Chứng Thực Nghiệm Đo Đạc Tự Động

Trích xuất từ kết quả kiểm định `reports/phase_c/measurements/phase_c_audit_measurements.json`:

| Chỉ Số Kiểm Định | Hành Vi Kỳ Vọng | Kết Quả Đo Đạc Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- |
| **Trạng thái hệ thống khi ấn E-STOP** | Chuyển sang `EMERGENCY_STOP` | `state: "EMERGENCY_STOP"` | **PASS** |
| **Xung PWM động cơ** | Triệt tiêu hoàn toàn về 0 | `pwmL: 0, pwmR: 0` | **PASS** |
| **Vận tốc mục tiêu** | Đưa về 0 | `targetL: 0, targetR: 0` | **PASS** |
| **Trạng thái đứng yên (isHalted)** | Robot dừng tuyệt đối | `isHalted: true` | **PASS** |
| **Thử gửi lệnh D-Pad khi E-STOP đang chốt** | Lệnh phải bị từ chối triệt để | `commandBlockedUnderEstop: true`<br>(`targetLeftSpeed === 0`) | **PASS** |
| **Đóng modal cảnh báo E-STOP** | Không được tự động chạy lại | Robot tiếp tục giữ trạng thái ngắt an toàn | **PASS** |

---

## 3. TÁCH BIỆT THAO TÁC CAMERA VÀ LỆNH ĐỘNG CƠ ROBOT

Để loại bỏ hoàn toàn các xung đột thao tác trên sa bàn cảm ứng hoặc chuột:

1. **Thao tác Kéo rê Sa bàn (Pan):**
   - Sự kiện chuột kéo rê sa bàn chỉ cập nhật tọa độ quan sát (`panOffset`) của viewBox SVG.
   - Kiểm định tự động xác nhận: trong suốt quá trình kéo rê chuột qua lại 80 px ngang và 50 px dọc, hai kênh tốc độ động cơ giữ nguyên giá trị `(0.00, 0.00)` (`panDoesNotSendMotors: true`).
2. **Thao tác Căn vừa Khung hình (Fit Scene):**
   - Nút "Toàn cảnh" tính toán lại ma trận co giãn màn hình để hiển thị trọn vẹn $2.4\text{m} \times 1.6\text{m}$.
   - Kiểm tra bất biến xác nhận: thao tác Fit Scene hoàn toàn độc lập, **không làm thay đổi tọa độ $(x, z, \text{Yaw})$ hay thời gian mô phỏng $t$** (`fitScenePreservesPose: true`).
3. **Thao tác Đặt mục tiêu (Click-to-Goal) và Phím Hủy (Escape):**
   - Ở chế độ Goal, học sinh có thể nhấp chuột bất kỳ đâu trên đường đua để thả điểm đến.
   - Nhấn phím `Escape` lập tức hủy bỏ Waypoint đang treo và trả con trỏ về chế độ quan sát an toàn (`goalCancelledByEscape: true`).

---

## 4. KẾT LUẬN KIỂM ĐỊNH ĐIỀU KHIỂN & AN TOÀN
Cơ chế điều khiển và chốt an toàn E-STOP của CMU10 Phase C hoạt động hoàn hảo, đáp ứng đầy đủ các tiêu chuẩn an toàn phần mềm cao nhất cho phòng học STEM Robotics tương tác.
