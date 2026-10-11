# TỔNG HỢP CÁC SỬA ĐỔI KỸ THUẬT (FIX SUMMARY)
## Khắc phục Hướng Robot & Động Học Vi Sai CMU10

**Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10  
**Giai đoạn:** Robot Orientation & Differential-Drive Kinematics Closure  
**Ngày thực hiện:** 11/10/2026  

---

### 1. CÁC TỆP NGUỒN ĐÃ THAY ĐỔI

| Tệp (File Path) | Mục đích sửa đổi | Nội dung thay đổi chi tiết |
| :--- | :--- | :--- |
| `src/stores/useSimulationStore.ts` | Sửa tích phân góc hướng vi sai & chuẩn hóa góc $-\pi \dots \pi$ | Sửa công thức góc hướng: `const rawYaw = s.yaw - angularW * dt; const newYaw = Math.atan2(Math.sin(rawYaw), Math.cos(rawYaw));` |
| `src/components/Robot3DCanvas.tsx` | Khắc phục hướng đầu xe 3D Twin & sàn băng chuyền ảo | 1. Lưu tham chiếu `robotRootRef`.<br>2. Cập nhật xoay đầu xe thời gian thực: `robotRootRef.current.rotation.y = -Math.PI / 2 - s.yaw`.<br>3. Khớp vector chuyển động sàn ảo với góc `s.yaw`. |
| `src/components/TacticalArenaMap.tsx` | Sửa logic bẻ lái vi sai Click-to-Goal | Điều chỉnh motor speeds theo dấu `normAngle`: nếu mục tiêu bên phải (`normAngle > 0`), tăng ga bánh trái `(0.45, 0.15)`; nếu bên trái (`normAngle < 0`), tăng ga bánh phải `(0.15, 0.45)`. |
| `src/components/TripleViewCockpit.tsx` | Tự động kích hoạt RUN khi điều khiển bằng D-Pad / Bàn phím | Khi nhấn D-Pad hoặc bấm phím mũi tên, tự động gọi `simulationStore.run()` cùng lúc với `setMotorSpeeds()`. |
| `src/types/robotGeometry.ts` | Cập nhật tài liệu quy ước hình học & hệ trục | Bổ sung chi tiết quy ước góc hướng, vector tiến, ma trận xoay và các kích thước chuẩn của JetBot. |
| `scripts/verify_robot_orientation.mjs` | Xây dựng bộ test harness tự động T01 - T12 | Triển khai 12 bài kiểm tra tự động với assertion hành vi thực tế, chụp ảnh bằng chứng và xuất báo cáo JSON. |

---

### 2. CHI TIẾT SỬA ĐỔI TRONG TỪNG COMPONENT

#### 2.1. `src/stores/useSimulationStore.ts`
```typescript
// Trước:
const newYaw = s.yaw + angularW * dt;

// Sau:
const rawYaw = s.yaw - angularW * dt;
const newYaw = Math.atan2(Math.sin(rawYaw), Math.cos(rawYaw));
```
*Lý do:* Khớp chính xác chiều quay thực tế của hệ vi sai khi bánh phải chạy nhanh hơn bánh trái thì xe rẽ trái (về hướng Bắc $-Z$).

#### 2.2. `src/components/Robot3DCanvas.tsx`
```typescript
// Trong hàm render / animate:
if (robotRootRef.current) {
  robotRootRef.current.rotation.y = -Math.PI / 2 - s.yaw;
}
gridHelper.position.x = -gridOffset * Math.cos(s.yaw);
gridHelper.position.z = -gridOffset * Math.sin(s.yaw);
```
*Lý do:* Khắc phục độ lệch $90^\circ$ của mô hình CAD và giúp sàn chuyển động ngược chiều vector tiến của robot.

#### 2.3. `src/components/TacticalArenaMap.tsx`
```typescript
if (Math.abs(normAngle) > 0.08) {
  if (normAngle > 0) {
    // Goal to the right -> turn right (vL > vR)
    simulationStore.setMotorSpeeds(0.45, 0.15, 'Tự động rẽ phải đến mục tiêu');
  } else {
    // Goal to the left -> turn left (vR > vL)
    simulationStore.setMotorSpeeds(0.15, 0.45, 'Tự động rẽ trái đến mục tiêu');
  }
}
```
*Lý do:* Đảm bảo robot rẽ trực tiếp về hướng điểm cờ đích khi bật chế độ Click-to-Goal.

---

### 3. KIỂM ĐỊNH SAU SỬA ĐỔI

1. **Bộ kiểm tra chuyên sâu T01-T12:** Đạt 12/12 kiểm tra (100% PASS).
2. **Bộ hồi quy Phase B (21 checks):** Đạt 21/21 (100% PASS).
3. **Bộ hồi quy Phase C Audit:** Đạt toàn bộ 6 viewports và các bài đo vật lí.
4. **Kiểm tra TypeScript:** `npm run lint` hoàn thành với 0 lỗi.
5. **Biên dịch sản phẩm:** `npm run build` thành công trong 448ms.
