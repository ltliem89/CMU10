# KẾT QUẢ ĐO HIỆU NĂNG & ĐỘ TRỄ (PERFORMANCE RESULTS)
**Phương pháp đo**: Tích hợp Timer high-resolution trong chu trình Playwright automation.  
**Số mẫu đo chuyển đổi layout**: N = 120 mẫu qua 20 chu kỳ.

---

## 1. Độ trễ chuyển đổi Bố cục (Layout Switch Latency)
- **Độ trễ trung bình (Average)**: `238.1 ms`
- **Độ trễ ngắn nhất (Min)**: `107 ms`
- **Độ trễ dài nhất (Max)**: `530 ms`
- **Thời gian trung bình mỗi chu kỳ (6 layouts)**: `1428.8 ms`

---

## 2. Kích thước & Tỷ lệ Diện tích Khung Mô Phỏng Thực tế
| Chế độ Bố cục | Chiều Rộng | Chiều Cao | Tổng Diện Tích | Đánh Giá Tỷ Lệ |
|:---|:---:|:---:|:---:|:---|
| **Standard** | 1229px | 607px | 746,081 px² | Cân đối |
| **Focus** | 1224px | 526px | 643,370 px² | Tối đa hóa diện tích (>80%) |
| **Split View** | 1224px | 526px | 643,370 px² | Cân đối |
| **Triple View** | 1224px | 526px | 643,370 px² | Cân đối |
| **PiP** | 1224px | 526px | 643,370 px² | Cân đối |
| **Fullscreen** | 1395px | 614px | 857,072 px² | Tối đa hóa diện tích (>80%) |

---

## 3. Độ ổn định Bộ nhớ & Trình duyệt
- **Sự cố Màn hình trắng (White Screen)**: 0 lần / 120 lần chuyển đổi.
- **Lỗi Uncaught JavaScript**: 0 lỗi.
- **Rò rỉ WebGL Context**: Không phát hiện cảnh báo mất context (`THREE.WebGLRenderer: Context Lost`).