# CMU10 — NHẬT KÝ THAY ĐỔI MÃ NGUỒN (PHASE B CHANGELOG)
## Chi tiết Toàn bộ Tệp Tin Được Tạo Mới và Điều Chỉnh

- **Dự án:** CMU10 — Phòng thí nghiệm Vật lí 10 & Robot AI JetBot
- **Tài liệu chuẩn:** Phase B Master UI Reconstruction
- **Phiên bản:** V1.0
- **Ngày lập:** 11/10/2026

---

## 1. TỆP TIN TẠO MỚI (NEW COMPONENTS & UTILITIES)

| Đường dẫn tệp tin | Mục đích và Chức năng |
|:---|:---|
| `src/data/physics10LessonsData.ts` | Bảng đăng ký chuẩn mực 5 bài học Vật lí 10 (GDPT 2018), mục tiêu sư phạm và nhiệm vụ thực hành |
| `src/components/CMUHeader.tsx` | Thanh điều hướng đỉnh Navy (`#082B59`), logo CMU10, badge `Lớp 10`, 5 Cột Trụ, Tiện ích và nút đỏ E-STOP |
| `src/components/LessonSidebar.tsx` | Thanh bên trái (~285px) chứa 2 tab Danh sách/Tiến trình, 5 bài học Vật lí 10 và thẻ Mục tiêu bài học co giãn |
| `src/components/RobotStatusPanel.tsx` | Bảng bên phải (~270px) hiển thị toạ độ, vận tốc, pin 7.4V, 4 cảm biến siêu âm và bàn phím điều khiển D-Pad |
| `src/components/SimulationHUD.tsx` | Đồng hồ đo vận tốc Gauge tròn nổi ở đáy Viewport kèm các thẻ chỉ số $t, s, a$ thời gian thực |
| `src/components/PhysicsChartPanel.tsx` | Panel A (hàng dưới) vẽ đồ thị động lực học vector SVG ($v\text{-}t, a\text{-}t, s\text{-}t, F\text{-}t$) |
| `src/components/RealtimeDataTable.tsx` | Panel B (hàng dưới) hiển thị bảng số liệu đo đạc thời gian thực, hỗ trợ tải file CSV thí nghiệm |
| `src/components/CameraViewGallery.tsx` | Panel C (hàng dưới) hiển thị phòng trưng bày 4 góc nhìn camera (Toàn cảnh, Bám sau xe, Cận cảnh, 2D) |
| `src/components/CMUSimulationWorkspace.tsx` | Không gian làm việc mô phỏng trung tâm khớp 100% hình mẫu tham chiếu `cmu10_reference.png` |
| `scripts/verify_phase_b_reconstruction.mjs` | Kịch bản kiểm định tự động Playwright E2E chụp 18 ảnh màn hình và xác minh 20 bài test |

---

## 2. TỆP TIN ĐIỀU CHỈNH (MODIFIED FILES)

| Đường dẫn tệp tin | Thay đổi cụ thể |
|:---|:---|
| `src/index.css` | Bổ sung hệ thống Design Tokens CSS `--cmu-*` (Navy 950, Blue 600, Sky 500, BG `#EEF5FC`, Surface `#FFFFFF`) |
| `src/App.tsx` | Tái cấu trúc thành kiến trúc Simulation-First Workspace, tích hợp CMUHeader, 5 Cột Trụ và phím tắt Spacebar E-STOP |
| `src/components/Robot3DCanvas.tsx` | Bổ sung prop `className` cho `Robot3DCanvasProps`, chuẩn hóa render container và triệt tiêu chuỗi nhãn Lớp 11 |
| `src/components/RobotTwinMotorSimulator.tsx` | Đồng bộ hai chiều các thanh trượt motor với `simulationStore.setMotorSpeeds()` |
| `src/components/KnowledgeMap.tsx` | Chuẩn hóa toàn bộ nhãn văn bản thành Lớp 10 / Vật lí 10 GDPT 2018 |
| `src/components/SourcesAndCaveats.tsx` | Chuẩn hóa thông tin bản quyền và trích dẫn chương trình Vật lí 10 GDPT 2018 |
| `src/components/TripleViewCockpit.tsx` | Chuẩn hóa nhãn mô phỏng vật lí sang Lớp 10 |

---

## 3. NGUYÊN TẮC BẢO TOÀN (INVARIANTS PRESERVED)
- **Không thay đổi công thức vật lí:** Giữ nguyên các thông số động học vi sai $r = 0.0325\text{m}$, $L = 0.13\text{m}$, $v_{max} = 0.8\text{m/s}$ trong `useSimulationStore.ts`.
- **Không tự ý commit/push/deploy:** Toàn bộ thay đổi nằm trong working tree để người dùng nghiệm thu.
- **Không tắt máy tính:** Tuân thủ tuyệt đối quy định an toàn hệ thống.
