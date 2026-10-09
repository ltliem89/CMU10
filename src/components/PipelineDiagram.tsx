import React, { useState } from 'react';
import { GitFork, ArrowRight, CheckCircle2, AlertTriangle, Cpu, Camera, Gamepad2, Shield, Zap, Sparkles } from 'lucide-react';

type PipelineType = 'teleop' | 'road-following' | 'collision' | 'tensorrt';

export const PipelineDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PipelineType>('road-following');
  const [selectedNode, setSelectedNode] = useState<string | null>('xy-regression');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            Sơ Đồ Luồng Dữ Liệu Tương Tác (Data Flow Pipelines)
          </h2>
          <p className="text-xs text-slate-500">
            Xem chi tiết dữ liệu đi vào, thuật toán xử lý và kết quả đầu ra tác động lên robot ở từng giai đoạn
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('road-following')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'road-following' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bám Đường (Hồi quy)
          </button>
          <button
            onClick={() => setActiveTab('collision')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'collision' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tránh Va Chạm (Phân loại)
          </button>
          <button
            onClick={() => setActiveTab('teleop')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'teleop' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Điều Khiển Thủ Công
          </button>
          <button
            onClick={() => setActiveTab('tensorrt')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'tensorrt' ? 'bg-white text-cyan-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tối Ưu TensorRT
          </button>
        </div>
      </div>

      {/* Pipeline 1: Road Following Pipeline */}
      {activeTab === 'road-following' && (
        <div className="space-y-6">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Luồng Bám Đường (Hồi Quy Tọa Độ X/Y)
              </h4>
              <p className="text-xs text-blue-800/80 mt-0.5">
                Camera (224×224) $\rightarrow$ Tiền xử lý (CHW, normalize) $\rightarrow$ ResNet18 $\rightarrow$ Tọa độ [x, y] $\rightarrow$ arctan2 &amp; PD Controller $\rightarrow$ Motor vi sai.
              </p>
            </div>
          </div>

          {/* Interactive Steps Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
            {/* Step 1 */}
            <div
              onClick={() => setSelectedNode('camera-in')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedNode === 'camera-in' ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-blue-600 uppercase">Bước 1: Thu nhận</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Camera CSI MIPI</div>
              <div className="text-xs font-mono text-slate-600 mt-1">camera.value</div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">Khung hình thô HWC (224×224×3) BGR8 từ ống kính robot.</div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setSelectedNode('preprocess')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedNode === 'preprocess' ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-blue-600 uppercase">Bước 2: Tiền xử lý</div>
              <div className="text-sm font-bold text-slate-900 mt-1">preprocess(image)</div>
              <div className="text-xs font-mono text-slate-600 mt-1">Tensor (1, 3, 224, 224)</div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">Đổi trục sang CHW, chia 255.0, trừ mean, chia std, ép kiểu FP16 lên GPU.</div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setSelectedNode('xy-regression')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedNode === 'xy-regression' ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-blue-600 uppercase">Bước 3: Suy luận AI</div>
              <div className="text-sm font-bold text-slate-900 mt-1">ResNet18 Regression</div>
              <div className="text-xs font-mono text-slate-600 mt-1">outputs: [x, y]</div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">Lớp Linear(512, 2) dự đoán tọa độ chuẩn hóa x trong [-1, 1], y trong [-1, 1].</div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setSelectedNode('pd-control')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedNode === 'pd-control' ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-blue-600 uppercase">Bước 4: Điều khiển</div>
              <div className="text-sm font-bold text-slate-900 mt-1">PD Steering Angle</div>
              <div className="text-xs font-mono text-slate-600 mt-1">arctan2(x, y)</div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">Tính góc lái θ, nhân Kp và Kd để tạo tín hiệu steering_slider mượt mà.</div>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => setSelectedNode('motor-output')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedNode === 'motor-output' ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-blue-600 uppercase">Bước 5: Chấp hành</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Động Cơ Vi Sai</div>
              <div className="text-xs font-mono text-slate-600 mt-1">left / right motor</div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">left = speed + steering, right = speed - steering, kẹp trong [0.0, 1.0].</div>
            </div>
          </div>

          {/* Node Detailed Focus Inspector */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-indigo-300 mb-2.5 text-sm sm:text-base">
              <Sparkles className="w-5 h-5" />
              Chi Tiết Kỹ Thuật Bước Được Chọn:
            </div>
            {selectedNode === 'camera-in' && (
              <div className="space-y-1.5">
                <p className="text-slate-300 leading-relaxed">Khung ảnh lấy từ đối tượng <code>Camera()</code> qua backend GStreamer phần cứng Jetson Nano.</p>
                <p className="font-mono text-emerald-400 text-xs sm:text-sm">Đầu vào: Cảm biến quang học CSI 224x224 px $\rightarrow$ Đầu ra: camera.value (NumPy array, uint8).</p>
              </div>
            )}
            {selectedNode === 'preprocess' && (
              <div className="space-y-1.5">
                <p className="text-slate-300 leading-relaxed">Thực hiện hàm <code>preprocess(image)</code>: chuyển PIL, to_tensor (HWC sang CHW), chia 255.0, trừ mean=[0.485, 0.456, 0.406], chia std=[0.229, 0.224, 0.225], đưa lên GPU cuda() dạng half().</p>
                <p className="font-mono text-emerald-400 text-xs sm:text-sm">Đầu vào: (224, 224, 3) BGR $\rightarrow$ Đầu ra: torch.cuda.HalfTensor (1, 3, 224, 224).</p>
              </div>
            )}
            {selectedNode === 'xy-regression' && (
              <div className="space-y-1.5">
                <p className="text-slate-300 leading-relaxed">Mô hình ResNet18 đã nạp checkpoint <code>best_steering_model_xy.pth</code> thực hiện phép tính ma trận trích xuất đặc trưng qua 18 tầng tích chập và lớp Fully Connected cuối cùng 512 $\rightarrow$ 2.</p>
                <p className="font-mono text-emerald-400 text-xs sm:text-sm">Đầu vào: Tensor ảnh (1, 3, 224, 224) $\rightarrow$ Đầu ra: xy[0] (tọa độ x), xy[1] (tọa độ y).</p>
              </div>
            )}
            {selectedNode === 'pd-control' && (
              <div className="space-y-1.5">
                <p className="text-slate-300 leading-relaxed">Chuyển đổi sai lệch vị trí mục tiêu thành góc lái mong muốn: <code>angle = np.arctan2(x, y)</code>. Thuật toán PD: <code>pid = angle * steering_gain + (angle - angle_last) * steering_dgain</code>.</p>
                <p className="font-mono text-emerald-400 text-xs sm:text-sm">Đầu vào: (x, y) $\rightarrow$ Đầu ra: giá trị steering float trong khoảng [-1.0, 1.0].</p>
              </div>
            )}
            {selectedNode === 'motor-output' && (
              <div className="space-y-1.5">
                <p className="text-slate-300 leading-relaxed">Gửi xung điều chế PWM qua I2C bus tới IC PCA9685 và cầu H TB6612FNG trên JetBot kit. Động cơ hai bánh xe quay chênh lệch vận tốc để tạo mô-men lái bám theo vạch.</p>
                <p className="font-mono text-emerald-400 text-xs sm:text-sm">Đầu vào: steering, speed $\rightarrow$ Đầu ra: robot.left_motor.value, robot.right_motor.value.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline 2: Collision Avoidance Pipeline */}
      {activeTab === 'collision' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Luồng Tránh Va Chạm (Phân Loại Nhị Phân)
              </h4>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                Camera $\rightarrow$ Tiền xử lý $\rightarrow$ AlexNet hoặc ResNet18 $\rightarrow$ Logits (2 lớp) $\rightarrow$ F.softmax $\rightarrow$ prob_blocked $\rightarrow$ Rẽ trái hoặc Đi thẳng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">1. Thu nhận ảnh</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Camera.instance()</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">224×224 px</div>
              <p className="text-[11px] text-slate-600 mt-2">Ống kính quan sát không gian phía trước mặt xe.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">2. Mạng phân loại</div>
              <div className="text-xs font-bold text-slate-800 mt-1">AlexNet / ResNet18</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">2 ngõ ra (free, blocked)</div>
              <p className="text-[11px] text-slate-600 mt-2">Dự đoán điểm số chưa chuẩn hóa (logits) của 2 lớp.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">3. Xác suất Softmax</div>
              <div className="text-xs font-bold text-slate-800 mt-1">F.softmax(y, dim=1)</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">prob_blocked in [0, 1]</div>
              <p className="text-[11px] text-slate-600 mt-2">Chuẩn hóa vector logits thành tổng xác suất 100%.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">4. Quyết định hành vi</div>
              <div className="text-xs font-bold text-slate-800 mt-1">prob_blocked &lt; 0.5 ?</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">forward() vs left()</div>
              <p className="text-[11px] text-slate-600 mt-2">Nếu đường thông thoáng thì tiến; nếu bị cản thì bẻ lái gấp sang trái.</p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 3: Teleoperation */}
      {activeTab === 'teleop' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Luồng Điều Khiển Thủ Công (Teleoperation)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Gamepad HTML5 $\rightarrow$ Traitlets.dlink(transform=lambda x: -x) $\rightarrow$ Motor Driver; Song song: Camera BGR8 $\rightarrow$ bgr8_to_jpeg $\rightarrow$ Web Widget Image. Giám sát an toàn: Heartbeat Watchdog.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-xs text-indigo-700 uppercase mb-2">Nhánh Điều Khiển Động Cơ</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                controller.axes[1] $\rightarrow$ dlink(-x) $\rightarrow$ robot.left_motor.value
                <br />
                controller.axes[3] $\rightarrow$ dlink(-x) $\rightarrow$ robot.right_motor.value
              </p>
              <div className="mt-3 text-[11px] text-slate-500">
                Đảo dấu bằng lambda vì trục analog tay cầm trả về âm khi đẩy về phía trước.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-xs text-blue-700 uppercase mb-2">Nhánh Luồng Video Trực Tiếp</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                camera.value (BGR8) $\rightarrow$ dlink(bgr8_to_jpeg) $\rightarrow$ widgets.Image (JPEG)
              </p>
              <div className="mt-3 text-[11px] text-slate-500">
                Trình duyệt chỉ hỗ trợ ảnh nén JPEG; hàm bgr8_to_jpeg thực hiện nén nhẹ 75% chất lượng.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-xs text-rose-700 uppercase mb-2">Watchdog An Toàn Heartbeat</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                Heartbeat(period=0.5) $\rightarrow$ Nếu status == dead $\rightarrow$ unlink() &amp; robot.stop()
              </p>
              <div className="mt-3 text-[11px] text-slate-500">
                Ngắt các liên kết dlink và phanh động cơ ngay lập tức nếu mất sóng WiFi quá nửa giây.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 4: TensorRT */}
      {activeTab === 'tensorrt' && (
        <div className="space-y-6">
          <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wide">
                Luồng Tối Ưu Hóa &amp; Tăng Tốc NVIDIA TensorRT
              </h4>
              <p className="text-xs text-cyan-800/80 mt-0.5">
                Mô hình PyTorch (.pth) $\rightarrow$ torch2trt(model, [dummy_data], fp16_mode=True) $\rightarrow$ TensorRT Engine (xxx_trt.pth) $\rightarrow$ TRTModule suy luận thời gian thực.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-cyan-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-cyan-800 uppercase">Giai Đoạn 1: Build Engine (Chạy 1 lần)</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-mono">live_demo_*_build_trt</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Nạp checkpoint mô hình PyTorch đã huấn luyện (weights).</li>
                <li>Tạo tensor mẫu dummy <code>torch.zeros((1, 3, 224, 224)).cuda().half()</code> để định hình input shape.</li>
                <li>Thực thi <code>torch2trt(model, [data], fp16_mode=True)</code>: TensorRT quét đồ thị tính toán, gộp các lớp Conv+ReLU (Layer Fusion), chọn kernel GPU tối ưu nhất.</li>
                <li>Lưu file engine state_dict ra đĩa (ví dụ <code>best_steering_model_xy_trt.pth</code>).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-cyan-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-cyan-800 uppercase">Giai Đoạn 2: Suy Luận Thực Tế (Runtime)</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-mono">live_demo_*_trt</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Khởi tạo đối tượng <code>TRTModule()</code> (lớp bao bọc tiện lợi của thư viện torch2trt).</li>
                <li>Nạp trực tiếp state_dict của engine TensorRT vào <code>model_trt</code>.</li>
                <li>Gọi <code>model_trt(preprocess(image))</code> trong callback camera với độ trễ siêu thấp.</li>
                <li>Giảm tải cho CPU Jetson Nano, nâng tốc độ khung hình từ ~15 FPS lên ~45+ FPS mượt mà.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
