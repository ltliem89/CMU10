# BÁO CÁO XÁC MINH & THẨM ĐỊNH MÃ NGUỒN (VALIDATION REPORT)
**Dự án:** JetBot AI & Robotics Interactive Studio (CMU10 Virtual Lab)  
**Giai đoạn:** GIAI ĐOẠN 2 — VALIDATION & VISUALIZATION DESIGN  
**Ngày thực hiện:** 10/10/2026  
**Mục tiêu:** Thẩm định trực tiếp mã nguồn, đối chiếu kết luận kiểm toán kỹ thuật, phân tích vòng đời Three.js, kiểm tra tính đồng bộ trạng thái mô phỏng và chuẩn bị kiến trúc thiết kế trực quan.

---

## 1. BỐI CẢNH & PHẠM VI XÁC MINH

Sau đợt kiểm toán hệ thống (System Audit), báo cáo ghi nhận lỗi màn hình trắng (White Screen) từng xảy ra khi người dùng chuyển đổi qua lại giữa các tab sau khi nâng cấp mô hình 3D. Nhóm kỹ thuật đã đặt ra nguyên tắc: **chưa sửa đổi mã nguồn hoặc tái cấu trúc trong giai đoạn thẩm định**; thay vào đó phải thực hiện rà soát tận gốc các file then chốt:
1. `src/components/Robot3DCanvas.tsx`
2. `src/components/RobotTwinMotorSimulator.tsx`
3. `src/components/ErrorBoundary.tsx`
4. `src/App.tsx`
5. `src/main.tsx`

---

## 2. KẾT QUẢ XÁC MINH TỪNG FILE THEO BÁO CÁO AUDIT

### 2.1. File `src/components/Robot3DCanvas.tsx`
* **Kết luận trong Audit:** Trước đây, component can thiệp trực tiếp vào DOM bằng `container.replaceChildren(renderer.domElement)` dẫn tới việc xóa node con mà React Fiber quản lý, kích hoạt lỗi `NotFoundError: Failed to execute 'removeChild' on 'Node'` khi React unmount/remount component lúc chuyển tab.
* **Xác minh trực tiếp mã nguồn hiện tại:**
  - Tại dòng 41: `const canvasMountRef = useRef<HTMLDivElement>(null);`
  - Khung render Three.js đã được phân lập vào một `div` chuyên dụng: `<div ref={canvasMountRef} className="w-full h-full relative" />`.
  - Cơ chế append element: `container.appendChild(renderer.domElement)`.
  - Cơ chế dispose và gỡ DOM trong return hook (dòng 855 - 869):
    ```ts
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer) {
        try {
          renderer.dispose();
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        } catch {
          // Safe guard against unmount race conditions
        }
      }
    };
    ```
  - **Đánh giá mức độ an toàn:** Việc kiểm tra `container.contains(renderer.domElement)` trước khi `removeChild` đã loại trừ 100% lỗi DOM unmount race condition. Bọc `try { ... } catch` ngăn unhandled exceptions trong quá trình WebGL disposal.

### 2.2. File `src/components/ErrorBoundary.tsx` & `src/main.tsx`
* **Kết luận trong Audit:** Thiếu ErrorBoundary toàn cục và cục bộ khiến bất kỳ lỗi runtime nào tại component 3D cũng làm hỏng toàn bộ cây ứng dụng React (Màn hình trắng xóa).
* **Xác minh trực tiếp mã nguồn hiện tại:**
  - `src/main.tsx` (dòng 6 - 10): Đã bọc `<App />` bên trong `<ErrorBoundary>`.
  - `src/components/ErrorBoundary.tsx` (dòng 15 - 90): Triển khai đầy đủ React Class Component bắt lỗi:
    + `getDerivedStateFromError(error)` chuyển trạng thái `hasError: true`.
    + `componentDidCatch(error, errorInfo)` ghi nhận log chi tiết.
    + Giao diện cứu hộ (Fallback UI) trực quan với thông báo lỗi, nút "Thử Khởi Động Lại Tab" và nút "Tải Lại Ứng Dụng", ngăn ngừa hiện tượng White Screen.
  - Ngoài ra, trong `RobotTwinMotorSimulator.tsx` dòng 41 & 560 cũng có ErrorBoundary cục bộ bảo vệ riêng cho Canvas 3D.

### 2.3. File `src/App.tsx`
* **Cơ chế chuyển tab:**
  - Tab state được quản lý bằng `const [currentTab, setCurrentTab] = useState<AppTab>('home');`.
  - Khi người dùng bấm tab khác, component tab cũ bị unmount hoàn toàn (Conditional rendering qua `switch/case` hoặc `if (currentTab === ...)`).
  - Khi quay lại tab, component mới được mount lại từ đầu (`useEffect` chạy lại từ đầu).
  - **Điểm yếu kiến trúc phát hiện:** Khi component tab bị unmount, toàn bộ state cục bộ (vị trí robot, tốc độ hiện tại, log telemetry, góc camera đã chỉnh) bị xóa sạch và reset về giá trị mặc định. Đây là nguyên nhân khiến trải nghiệm người dùng bị ngắt quãng, không duy trì được trạng thái chạy liên tục của phòng thí nghiệm.

---

## 3. PHÂN TÍCH VÒNG ĐỜI THREE.JS (LIFECYCLE & RESOURCE MANAGEMENT)

Qua kiểm tra chuyên sâu hàm `useEffect` khởi tạo Three.js trong `Robot3DCanvas.tsx` (dòng 47 đến 874), các khía cạnh vòng đời được đánh giá:

| Thành phần | Cơ chế hiện tại | Đánh giá rủi ro | Khuyến nghị cải tiến |
|---|---|---|---|
| **Animation Loop** | Dùng `requestAnimationFrame`, lưu ID trong `animFrameRef.current` và hủy trong cleanup. | **AN TOÀN**: Đã hủy bằng `cancelAnimationFrame`. | Tốt, không rò rỉ loop. |
| **Resize Listener** | `window.addEventListener('resize', handleResize)` và gỡ trong cleanup. | **AN TOÀN**: Đã removeEventListener đúng hàm tham chiếu. | Nên bổ sung `ResizeObserver` cho container thay vì lắng nghe toàn window. |
| **Renderer & WebGL Context** | Gọi `renderer.dispose()` trong cleanup; bọc kiểm tra `container.contains()`. | **TRUNG BÌNH**: WebGL context bị hủy và tạo mới mỗi lần chuyển tab. Nếu chuyển tab liên tục quá nhanh, một số trình duyệt có thể đạt giới hạn số context WebGL (thường là 8-16 contexts) gây WebGL context loss tạm thời. | Đưa state canvas hoặc renderer vào cache / keep-alive hoặc dùng singleton canvas mount. |
| **Geometry & Material Disposal** | Hiện chỉ dispose renderer, chưa gọi `geometry.dispose()` và `material.dispose()` đệ quy trên từng Mesh con của `scene`. | **CẢNH BÁO MEMORY LEAK**: GPU VRAM và bộ nhớ heap Three.js tăng nhẹ sau mỗi chu kỳ mount/unmount. | Bổ sung hàm đệ quy duyệt scene graph để dispose BufferGeometry và Material khi unmount. |
| **Bắt lỗi bất đồng bộ** | React ErrorBoundary chỉ bắt lỗi render đồng bộ, KHÔNG bắt được lỗi nảy sinh trong `requestAnimationFrame` hoặc event listeners. | **CẢNH BÁO RỦI RO**: Nếu `renderer.render()` ném lỗi bên trong `animate()`, ErrorBoundary sẽ không bắt được. | Bọc `try { renderer.render(scene, camera); } catch (e) { ... }` bên trong vòng lặp animation. |

---

## 4. ĐÁNH GIÁ TÍNH ĐỒNG BỘ TRẠNG THÁI MÔ PHỎNG (DATA SYNCHRONIZATION AUDIT)

Hiện tại dự án có 4 thành phần hiển thị dữ liệu chuyển động của robot:
1. **Mô hình 3D (Robot3DCanvas):** Hiển thị xe JetBot, 2 bánh xe lăn theo tốc độ $v_L, v_R$.
2. **Sân đua 2D (RobotTwinMotorSimulator 2D Arena):** Hiển thị xe chạy trên mặt phẳng tọa độ $X, Y$, góc hướng $\theta$.
3. **Camera FPV (CameraSimulator):** Hiển thị hình ảnh từ góc nhìn camera trước của xe.
4. **Bảng đo lường & Nhật ký (Telemetry & Logs):** Hiển thị $v, \omega$, PWM, gia tốc và lệnh Python.

### Bảng đối chiếu nguồn dữ liệu và sai lệch:

| Thành phần | Nguồn dữ liệu (State Source) | Hệ tọa độ & Đơn vị | Cơ chế cập nhật | Mức độ đồng bộ |
|---|---|---|---|---|
| **Bánh xe 3D** | `leftSpeed`, `rightSpeed` từ slider/lệnh | Tốc độ góc ảo $\omega = v \times 6.0 \text{ rad/s}$ | `requestAnimationFrame` (60 FPS) | **ĐỒNG BỘ MỘT PHẦN**: Bánh xe quay đúng tốc độ, nhưng xe 3D đứng yên tại chỗ, không di chuyển trong không gian 3D. |
| **Sân đua 2D** | Cục bộ trong `RobotTwinMotorSimulator` | Tọa độ pixel (0..600, 0..400), $\theta \text{ rad}$ | `setInterval(30ms)` | **CỤC BỘ**: Tự tính vi phân động học riêng, độc lập với mô hình 3D. |
| **Camera FPV** | Bộ ảnh tĩnh cấu hình sẵn trong `CameraSimulator.tsx` (5 cảnh cố định) | Pixel ảnh 224x224 (tọa độ bia $x, y$) | Sự kiện người dùng bấm chọn | **CHƯA ĐỒNG BỘ**: Không phản ánh góc nhìn thật của robot từ vị trí $(X, Y)$ trên sân đua 2D. |
| **Telemetry** | Tính từ $(v_L, v_R)$ trong bộ mô phỏng | $v \text{ (cm/s)}$, $\omega \text{ (rad/s)}$, PWM % | Bộ đếm nhịp 75 ticks | **ĐỒNG BỘ TỐT**: Khớp chuẩn với công thức động học vi phân. |

**Kết luận thẩm định đồng bộ:** Cần xây dựng **Universal Simulation Store (Zustand hoặc React Context)** đóng vai trò là single source of truth, chứa $(x, y, \theta, v_L, v_R, \text{obstacles})$. Cả 2D Canvas, 3D Scene và FPV Camera sẽ cùng đọc từ Store này để đảm bảo chuyển động đồng bộ 100%.
