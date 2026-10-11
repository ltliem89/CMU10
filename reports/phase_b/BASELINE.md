# BÁO CÁO BASELINE KIỂM ĐỊNH TRƯỚC KHI TÁI CẤU TRÚC (PHASE B)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10)

> **Thời điểm xác lập baseline**: Ngày 11/10/2026  
> **Commit nền**: `5f8729d` (Nhánh `main`)  
> **Mục tiêu**: Đóng băng số liệu kiểm thử kỹ thuật thực tế trước khi tiến hành tái cấu trúc theo hình tham chiếu CMU10.

---

## 1. Môi Trường Thực Thi & Hệ Thống
- **Repository Root**: `c:\Users\ltlie\Documents\GIT-DA\17.CMU10\CMU10`
- **Git Branch**: `main` (Up to date with origin/main)
- **Node.js**: `v24.19.0`
- **NPM Package**: `react-example@0.0.0`
- **Framework & Libraries**:
  - React `19.0.1` + React DOM `19.0.1`
  - TypeScript `7.0.2`
  - Vite `8.3.4`
  - Tailwind CSS `4.3.3`
  - Three.js `0.186.1`
  - Lucide React `0.546.0`
  - Playwright `1.64.0`

---

## 2. Kết Quả Kiểm Thử Thực Tế Baseline

### A. TypeScript Check (`npm run lint` -> `tsc --noEmit`)
- **Lệnh**: `npm run lint`
- **Mã kết thúc (Exit code)**: `0`
- **Lỗi phát hiện**: `0` lỗi.

### B. Production Build (`npm run build` -> `vite build`)
- **Lệnh**: `npm run build`
- **Thời gian build**: `477 ms`
- **Dung lượng tệp đầu ra**:
  - `dist/index.html`: `1.24 kB` (gzip: `0.58 kB`)
  - `dist/assets/index-B2pfDHqV.css`: `154.18 kB` (gzip: `19.88 kB`)
  - `dist/assets/index-ALjDWeH9.js`: `1,213.86 kB` (gzip: `318.19 kB`)
- **Ghi chú**: Bundle JS hiện là đơn khối monolithic.

### C. Runtime Browser Benchmark (Playwright headless)
- **Thời gian nạp trang ban đầu**: `722 ms`
- **DOM Node Count**: `725 nodes`
- **JS Heap Memory**: `45 MB used` / `54 MB total`
- **Console Errors**: `0 errors`
- **Console Warnings**: `3 warnings` (chủ yếu từ `react-resizable-panels` normalization)

---

## 3. Sai Lệch Được Xác Định & Mục Tiêu Khắc Phục
1. **Sai nhãn lớp học**: Giao diện cũ hiển thị "Lớp 11" tại `src/App.tsx:228`, `src/App.tsx:599` và `src/components/TripleViewCockpit.tsx:490`. Chuẩn chính thức là **CMU10 — Phòng thí nghiệm Vật lí 10**.
2. **Menu 10 tabs phân mảnh**: Chuyển đổi thành **5 Trụ cột cốt lõi** (`Bài học`, `Mô phỏng`, `Lập trình`, `Phân tích`, `Báo cáo`) + Tiện ích (`Thư viện`, `Cài đặt`, `Trợ giúp`, `E-STOP`).
3. **Trùng lặp bộ mô phỏng**: Hợp nhất `RobotTwinMotorSimulator.tsx` (83KB) và `TripleViewCockpit.tsx` sử dụng chung `useSimulationStore.ts`.
4. **Tái hiện chuẩn xác 100% hình tham chiếu CMU10**: Bố cục 3 cột (Sidebar trái 285px, Viewport trung tâm lớn, Panel phải 270px) + Hàng phân tích 3 panel phía dưới (Đồ thị v-t, Bảng số liệu, Góc quan sát khác).
