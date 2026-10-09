import React, { useState } from 'react';
import { GitFork, ArrowRight, CheckCircle2, AlertTriangle, Cpu, Camera, Gamepad2, Shield, Zap, Sparkles, Sliders } from 'lucide-react';

type PipelineType = 'teleop' | 'road-following' | 'collision' | 'tensorrt';

export const PipelineDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PipelineType>('road-following');
  const [selectedNode, setSelectedNode] = useState<string>('xy-regression');

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header and Pipeline Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GitFork className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Sơ Đồ Luồng Dữ Liệu Tương Tác (Data Flow Pipelines)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Khảo sát dữ liệu đầu vào (Input), thuật toán xử lý (Process) và tín hiệu chấp hành (Output) của robot
          </p>
        </div>

        {/* Tab switcher with Vibrant STEM Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => { setActiveTab('road-following'); setSelectedNode('xy-regression'); }}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'road-following' 
                ? 'bg-blue-600 text-white shadow-md font-black' 
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Bám Đường (Hồi quy)
          </button>
          <button
            onClick={() => { setActiveTab('collision'); setSelectedNode('binary-classification'); }}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'collision' 
                ? 'bg-pink-600 text-white shadow-md font-black' 
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Tránh Va Chạm (Phân loại)
          </button>
          <button
            onClick={() => { setActiveTab('teleop'); setSelectedNode('teleop-dlink'); }}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'teleop' 
                ? 'bg-purple-600 text-white shadow-md font-black' 
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Điều Khiển Thủ Công
          </button>
          <button
            onClick={() => { setActiveTab('tensorrt'); setSelectedNode('trt-fusion'); }}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'tensorrt' 
                ? 'bg-orange-600 text-white shadow-md font-black' 
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Tối Ưu TensorRT
          </button>
        </div>
      </div>

      {/* Pipeline 1: Road Following Pipeline (Blue Theme) */}
      {activeTab === 'road-following' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 p-4.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                Luồng Bám Đường (Hồi Quy Tọa Độ X/Y &amp; Điều Khiển Vi Sai)
              </h4>
              <p className="text-xs sm:text-sm text-blue-950/80 dark:text-blue-200/90 mt-1 leading-relaxed">
                Camera CSI (224×224) → Tiền xử lý (CHW, normalize) → ResNet18 → Tọa độ [x, y] → <code>arctan2(x, y)</code> &amp; PD Controller → Motor vi sai.
              </p>
            </div>
          </div>

          {/* Interactive Steps Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {/* Step 1 */}
            <div
              onClick={() => setSelectedNode('camera-in')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'camera-in' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442] hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Bước 1: Thu nhận</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Camera CSI MIPI</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">camera.value</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Khung hình thô HWC (224×224×3) BGR8 từ ống kính robot.</div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setSelectedNode('preprocess')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'preprocess' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442] hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Bước 2: Tiền xử lý</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">preprocess(image)</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">Tensor (1, 3, 224, 224)</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Đổi sang CHW, trừ mean, chia std, ép kiểu FP16 lên GPU CUDA.</div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setSelectedNode('xy-regression')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'xy-regression' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442] hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Bước 3: Mạng AI</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">ResNet18 Hồi Quy</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">outputs: [x, y]</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Lớp Linear(512, 2) xuất vector tọa độ đích trong khoảng [-1.0, 1.0].</div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setSelectedNode('pd-control')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'pd-control' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442] hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Bước 4: Điều khiển</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Góc Lái PD</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">arctan2(x, y)</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Tính góc lái θ, nhân Kp và Kd để tạo tín hiệu vi sai lái mượt mà.</div>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => setSelectedNode('motor-output')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'motor-output' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-300 dark:ring-blue-800' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442] hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Bước 5: Chấp hành</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Động Cơ Vi Sai</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">v_L, v_R qua I2C</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">robot.left = speed + steering, robot.right = speed - steering.</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 2: Collision Avoidance (Pink/Orange Theme) */}
      {activeTab === 'collision' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-orange-500/10 p-4.5 rounded-2xl border border-pink-200 dark:border-pink-900/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-pink-900 dark:text-pink-300 uppercase tracking-wide">
                Luồng Tránh Va Chạm (Phân Loại Nhị Phân Free / Blocked)
              </h4>
              <p className="text-xs sm:text-sm text-pink-950/80 dark:text-pink-200/90 mt-1 leading-relaxed">
                Ảnh Camera CSI (224×224) → ResNet18/AlexNet → Logits (2 lớp) → Softmax → prob_blocked: &lt;0.5 đi thẳng, &gt;=0.5 rẽ trái né vật cản.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div
              onClick={() => setSelectedNode('collision-in')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'collision-in' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 shadow-md ring-2 ring-pink-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase">Bước 1: Input</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Khung ảnh 224×224</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Dữ liệu chia 2 thư mục: dataset/free và dataset/blocked.</div>
            </div>

            <div
              onClick={() => setSelectedNode('binary-classification')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'binary-classification' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 shadow-md ring-2 ring-pink-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase">Bước 2: Phân loại</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">AlexNet / ResNet18</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Đầu ra 2 logits tương ứng 2 lớp: class 0 (blocked), class 1 (free).</div>
            </div>

            <div
              onClick={() => setSelectedNode('softmax-prob')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'softmax-prob' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 shadow-md ring-2 ring-pink-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase">Bước 3: Chuẩn hóa</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">F.softmax(y, dim=1)</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Chuyển đổi logits thành xác suất từ 0.0 đến 1.0 (prob_blocked).</div>
            </div>

            <div
              onClick={() => setSelectedNode('collision-action')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'collision-action' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 shadow-md ring-2 ring-pink-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase">Bước 4: Quyết định</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">forward() / left()</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Nếu prob_blocked &lt; 0.5 đi thẳng; ngược lại bẻ lái trái né cản.</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 3: Teleoperation (Purple Theme) */}
      {activeTab === 'teleop' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 p-4.5 rounded-2xl border border-purple-200 dark:border-purple-900/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-purple-900 dark:text-purple-300 uppercase tracking-wide">
                Luồng Điều Khiển Thủ Công &amp; An Toàn Watchdog
              </h4>
              <p className="text-xs sm:text-sm text-purple-950/80 dark:text-purple-200/90 mt-1 leading-relaxed">
                Gamepad HTML5 → Traitlets.dlink → Driver Động Cơ; Kèm Heartbeat Watchdog ngắt kết nối an toàn khi mất sóng WiFi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div
              onClick={() => setSelectedNode('teleop-gamepad')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'teleop-gamepad' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 shadow-md ring-2 ring-purple-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase">Nguồn lệnh</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">controller.axes[1], axes[3]</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Cần analog tay cầm: đẩy về trước cho giá trị âm, cần đảo dấu <code>lambda x: -x</code>.</div>
            </div>

            <div
              onClick={() => setSelectedNode('teleop-dlink')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'teleop-dlink' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 shadow-md ring-2 ring-purple-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase">Liên kết dữ liệu</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">traitlets.dlink()</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Liên kết 1 chiều độ trễ cực thấp: thay đổi trục gamepad lập tức nạp vào motor value.</div>
            </div>

            <div
              onClick={() => setSelectedNode('teleop-watchdog')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'teleop-watchdog' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 shadow-md ring-2 ring-purple-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase">Cơ chế an toàn</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Heartbeat(period=0.5)</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Nếu tín hiệu ping mất &gt; 0.5s: tự động hủy link (unlink) và gọi robot.stop().</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline 4: TensorRT (Orange Theme) */}
      {activeTab === 'tensorrt' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 p-4.5 rounded-2xl border border-orange-200 dark:border-orange-900/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-orange-900 dark:text-orange-300 uppercase tracking-wide">
                Luồng Biên Dịch &amp; Tăng Tốc Phần Cứng NVIDIA TensorRT
              </h4>
              <p className="text-xs sm:text-sm text-orange-950/80 dark:text-orange-200/90 mt-1 leading-relaxed">
                Mô hình PyTorch FP32 → <code>torch2trt(model, [dummy], fp16_mode=True)</code> → Hợp nhất lớp (Layer Fusion) &amp; chọn CUDA Kernel → TRTModule suy luận ~45 FPS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div
              onClick={() => setSelectedNode('trt-build')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'trt-build' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 shadow-md ring-2 ring-orange-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase">Giai đoạn 1: Build Engine</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">torch2trt FP16 Mode</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Truyền tensor dummy (1, 3, 224, 224) half(). Quá trình build mất 2-5 phút trên Jetson Nano.</div>
            </div>

            <div
              onClick={() => setSelectedNode('trt-fusion')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'trt-fusion' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 shadow-md ring-2 ring-orange-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase">Giai đoạn 2: Tối ưu đồ thị</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">Layer Fusion &amp; Precision</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Hợp nhất Conv+BatchNorm+ReLU thành 1 kernel duy nhất, giảm triệt để truy xuất bộ nhớ DRAM.</div>
            </div>

            <div
              onClick={() => setSelectedNode('trt-runtime')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition stem-card-interactive ${
                selectedNode === 'trt-runtime' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 shadow-md ring-2 ring-orange-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182442]'
              }`}
            >
              <div className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase">Giai đoạn 3: Thực thi</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">TRTModule (~45 FPS)</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">Độ trễ suy luận giảm từ ~40ms xuống ~10-15ms, JetBot phản xạ chính xác tại cua gắt.</div>
            </div>
          </div>
        </div>
      )}

      {/* Inspector Details Box for Active Node */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182442] space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Chi Tiết Kỹ Thuật Bước Đang Chọn:
          </span>
          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{selectedNode}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Dữ liệu trong pipeline được liên kết tuần tự nhằm bảo đảm tính khép kín từ khâu tiếp nhận ảnh thô của camera đến khi chuyển hóa thành các xung điện áp I2C tác động vào 2 động cơ di chuyển của JetBot.
        </p>
      </div>
    </div>
  );
};
