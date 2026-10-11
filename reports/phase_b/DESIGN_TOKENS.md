# BÁO CÁO DESIGN TOKENS CHUẨN CMU10 (PHASE B)
## CMU10 — JetBot AI & Robotics Interactive Studio (Vật lí 10)

> **Mục tiêu**: Định nghĩa chính thức toàn bộ bảng mã màu, typography, spacing, border-radius và icon mapping theo đúng hình ảnh tham chiếu `cmu10_reference.png`.

---

## 1. Bảng Mã Màu Chính Thức (Official Color Palette)

```css
:root {
  /* Header & Navigation */
  --cmu-navy-950: #082B59;  /* Nền Header chính */
  --cmu-navy-900: #0B356B;  /* Header phụ & Toolbar Nút Từng bước */
  --cmu-navy-800: #124A8A;  /* Accent / Active hover */

  /* Primary Accent & Action */
  --cmu-blue-600: #1677FF;  /* Nút Bài học, Viewport 3D Active, Selected Lesson */
  --cmu-blue-500: #318BFF;  /* Hover accent */
  --cmu-blue-100: #E8F2FF;  /* Nền Tab inactive, Selected row highlight */

  /* Surfaces & Borders */
  --cmu-bg: #EEF5FC;        /* Nền toàn ứng dụng (Pale Blue-Gray) */
  --cmu-surface: #FFFFFF;   /* Nền các Panel trắng tinh */
  --cmu-border: #D6E3F2;    /* Viền mảnh Panel & Divider */

  /* Text & Labels */
  --cmu-text: #102B52;      /* Màu chữ chính (Dark Navy Text) */
  --cmu-text-secondary: #526B8A; /* Màu chữ phụ, mô tả ngắn */

  /* Simulation Actions */
  --cmu-green-600: #009E66; /* Nút Chạy (Run) */
  --cmu-green-100: #E2F7EC; /* Nền trạng thái Đang chạy */
  --cmu-amber-500: #FFB020; /* Nút Tạm dừng (Pause) */
  --cmu-amber-100: #FFF2D4; /* Nền cảnh báo */
  --cmu-purple-600: #6828D9;/* Nút Đặt lại (Reset) */
  --cmu-cyan-500: #12B8E8;  /* Telemetry HUD & Measurement highlight */
  --cmu-red-600: #F0182D;   /* Nút Dừng Khẩn Cấp (E-STOP) */
  --cmu-red-100: #FFE7EA;   /* Nền cảnh báo khẩn cấp */

  /* Charts & Telemetry */
  --cmu-chart-grid: #DCE6F2;
}
```

---

## 2. Màu Sắc 5 Trụ Cột Điều Hướng (5 Pillars Navigation Badges)
1. **Bài học**: Xanh dương `#1677FF` (Icon Home).
2. **Mô phỏng**: Hồng tím/Magenta `#A21CAF` / `#9333EA` (Icon VR/Cube).
3. **Lập trình**: Xanh ngọc Teal `#0D9488` (Icon Code `</>`).
4. **Phân tích**: Cam vàng Amber `#F59E0B` / `#D97706` (Icon Chart Line).
5. **Báo cáo**: Tím Purple `#7C3AED` (Icon File Text).

---

## 3. Hệ Thống Typography (Font Size & Weight)
- **Tên dự án (`CMU10`)**: $24\text{px}$, font-black / bold, màu trắng (`#FFFFFF`).
- **Phụ đề (`Phòng thí nghiệm Vật lí 10`)**: $13\text{px}$, font-medium, màu xanh nhạt (`#BAE6FD`).
- **Huy hiệu lớp (`Lớp 10`)**: $12\text{px}$, pill outline border trắng xanh.
- **Menu chính (`Bài học`, `Mô phỏng`...)**: $14\text{px}$, font-bold.
- **Tiêu đề Panel (`Bài học Vật lí 10`, `Trạng thái xe`)**: $15 - 16\text{px}$, font-bold, màu `#102B52`.
- **Nội dung thông thường (Body Text)**: $13 - 14\text{px}$, line-height $1.4$.
- **Nhãn dữ liệu (Labels)**: $12 - 13\text{px}$, màu `#526B8A`.
- **Giá trị Telemetry HUD quan trọng ($v, t, s, a$)**: $20 - 24\text{px}$, font-bold / mono.
- **Nút điều khiển (`Chạy`, `Tạm dừng`)**: $13 - 14\text{px}$, font-bold.

---

## 4. Spacing, Border & Radius (Quy Chuẩn Hình Học)
- **Khoảng cách cơ sở**: Bội số $4\text{px}$ ($4, 8, 12, 16, 20, 24\text{px}$).
- **Padding Panel**: $12 - 16\text{px}$.
- **Khoảng cách giữa các Panel**: $10 - 12\text{px}$.
- **Bo góc Panel (Radius)**: $12 - 16\text{px}$ (`rounded-2xl`).
- **Bo góc Nút (Button Radius)**: $8 - 12\text{px}$ (`rounded-xl`).
- **Bo góc Pill / Badge**: $9999\text{px}$ (`rounded-full`).
- **Viền (Border)**: $1\text{px}$ solid `#D6E3F2`.
- **Bóng đổ (Shadow)**: `shadow-xs` đến `shadow-md` nhẹ nhàng, tinh tế, không dùng shadow đen thô.
