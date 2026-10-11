# CMU10 — PHASE 3.6: CHANGELOG
## Danh Mục Thay Đổi Mã Nguồn & Cấu Trúc Dự Án

**Phiên bản:** Phase 3.6  
**Commit cơ sở:** `235d2fc`  
**Nhánh:** `main`  

---

### 1. TẠO MỚI (NEW FILES)

1. **`src/utils/coordinateTransforms.ts`**:
   - Thư viện chuyển đổi không gian chuẩn MDN cho SVG và vật lý robot.
   - Các hàm API chuẩn hóa:
     - `worldToSvg()`: Đổi từ mét sang SVG canvas [0, 600]x[0, 400].
     - `svgToWorld()`: Đổi từ SVG canvas sang mét.
     - `screenToSvg()`: Sử dụng `getScreenCTM()` và ma trận nghịch đảo để chuyển tọa độ chuột sang SVG.
     - `screenToWorld()`: Chuyển đổi con trỏ màn hình sang tọa độ thực tế có tính toán pan và zoom.
     - `worldToScreen()`: Chuyển tọa độ thế giới sang vị trí pixel trên màn hình.
     - `zoomAtPoint()`: Phóng to giữ cố định điểm neo dưới con trỏ chuột.
     - `zoomAtCenter()`: Phóng to quanh tâm sa bàn (300, 200).
     - `panByScreenDelta()`: Tính toán độ dời sa bàn theo pixel di chuyển chuột.
     - `focusWorldPoint()`: Căn giữa camera vào vị trí thế giới cụ thể.
     - `fitAllBounds()`: Đặt lại tỷ lệ bao quát 100%.
     - `validateGoalPoint()`: Kiểm tra ranh giới sa bàn và va chạm với các vật cản tĩnh.
2. **`scripts/verify_phase3_6_layout_map.mjs`**:
   - Bộ kiểm thử tự động Playwright bao phủ toàn diện 17 tiêu chí kỹ thuật:
     - WCAG 2.2 target size ($\ge 24\times 24\text{px}$).
     - Zoom bằng nút bấm và zoom bằng con lăn có giữ điểm neo.
     - Pan bằng chuột giữa, Space + chuột trái và chế độ Pan Mode.
     - Ngưỡng phân biệt click/drag ($\Delta > 5\text{px}$).
     - Click-to-Goal với kiểm định an toàn và từ chối va chạm.
     - Máy trạng thái quan sát (Free, Follow, Focus).
     - Toàn màn hình và khôi phục layout.
     - Đa độ phân giải (1920, 1440, 1280, 1024).
     - Đồng bộ đa khung nhìn và cách ly hoàn toàn vật lý mô phỏng khi camera dịch chuyển.
     - E-STOP, giải phóng sự kiện pointer và 0 console errors.
3. **`reports/phase3_6_layout_map/`**:
   - Thư mục hồ sơ nghiệm thu kỹ thuật:
     - `DESIGN_RATIONALE.md`: Lý do và nguyên lý thiết kế.
     - `MAP_INTERACTION_ARCHITECTURE.md`: Kiến trúc bộ điều khiển sa bàn.
     - `COORDINATE_TRANSFORMS.md`: Công thức toán học và chuyển đổi tọa độ.
     - `ACCESSIBILITY_AND_RESPONSIVENESS.md`: Tuân thủ WCAG 2.2 và responsive.
     - `TEST_RESULTS.md`: Báo cáo nghiệm thu kết quả 17 test suites.
     - `CHANGELOG.md`: Danh mục chi tiết các tệp thay đổi.
     - `test-results.json`: Báo cáo dạng JSON máy đọc.
     - `screenshots/`: 6 ảnh chụp màn hình kiểm định tự động.

---

### 2. SỬA ĐỔI (MODIFIED FILES)

1. **`src/components/TacticalArenaMap.tsx`**:
   - Tích hợp thư viện `coordinateTransforms.ts`.
   - Nâng cấp hệ thống bắt sự kiện sang Pointer Events với `setPointerCapture` và `releasePointerCapture`.
   - Phân biệt click và drag dựa trên ngưỡng di chuyển thực tế $\Delta > 5\text{px}$.
   - Tách biệt kiểm tra các nút overlay trên sa bàn để không chặn sự kiện click.
   - Thêm máy trạng thái quan sát `ObservationState` (`FREE`, `FOLLOW_ROBOT`, `FOCUS_ROBOT`, `FOCUS_GOAL`, `FIT_ALL`) và tự động ngắt chế độ theo robot khi người dùng pan thủ công.
   - Thay thế `onWheel` trong JSX bằng `addEventListener('wheel', ..., { passive: false })` để loại bỏ hoàn toàn lỗi console `Unable to preventDefault inside passive event listener`.
   - Nâng cấp vòng đời Click-to-Goal: kiểm định va chạm vật cản, hiển thị thanh xác nhận Goal Pill, theo dõi khoảng cách tiếp cận mục tiêu ($d \le 0.08\text{m}$) và hãm phanh khi đến đích.
   - Bổ sung `min-h-[24px] min-w-[24px]` và `aria-label` cho toàn bộ các nút điều khiển theo chuẩn WCAG 2.2.
2. **`src/components/TripleViewCockpit.tsx`**:
   - Chuẩn hóa kích thước vùng bấm tối thiểu $\ge 24\times 24\text{px}$ (`min-h-[24px] min-w-[24px]`) cho tất cả các nút phóng to khung nhìn (Map, 3D Twin, FPV Camera) và các nút thanh công cụ phụ trợ (D-Pad, Code/Log, FPV toggle, Reset Layout).
   - Thêm `aria-label` cho các nút biểu tượng để hỗ trợ khả năng tiếp cận.
   - Bảo toàn phân quyền điều khiển và mức ưu tiên cao nhất cho nút `E-STOP`.
