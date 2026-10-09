import React from 'react';
import { 
  Gamepad2, 
  Camera, 
  Tag, 
  Database, 
  Cpu, 
  LineChart, 
  Zap, 
  Bot, 
  GitFork, 
  ArrowRight, 
  CheckCircle2,
  Layers,
  Sparkles,
  Compass,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';
import { MODULE_THEMES } from '../theme/stemTokens';

interface KnowledgeMapProps {
  onSelectModule: (moduleId: string) => void;
  modules: ModuleMeta[];
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ onSelectModule, modules }) => {
  return (
    <div className="space-y-8">
      {/* Vibrant STEM Hero Intro Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#EC4899] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/25 text-yellow-300 text-xs font-black tracking-wide mb-3">
            <Sparkles className="w-4 h-4 text-yellow-300" /> BẢN ĐỒ KIẾN THỨC VIBRANT STEM — JETBOT LỚP 11
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-white drop-shadow-sm">
            Hành Trình AI &amp; Robotics: Từ Lái Thủ Công Đến Tự Hành TensorRT
          </h1>
          <p className="text-white/95 text-sm sm:text-base leading-relaxed font-medium">
            Phòng thí nghiệm khám phá quy trình kỹ thuật hoàn chỉnh trích xuất từ <strong>12 notebook JetBot</strong>: 
            phân biệt rõ bài toán <strong>Hồi quy bám đường (X/Y)</strong> với <strong>Phân loại tránh va chạm (Binary)</strong>, 
            và chu trình tăng tốc phần cứng bằng <strong>NVIDIA TensorRT FP16</strong>.
          </p>
        </div>

        {/* High-Contrast Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs relative z-10">
          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-blue-200 block text-[11px] font-bold">Tài Nguyên Nguồn:</span>
            <span className="text-xl sm:text-2xl font-black text-white">12 Modules</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-purple-200 block text-[11px] font-bold">Hai Bài Toán AI:</span>
            <span className="text-lg sm:text-xl font-black text-yellow-300">Hồi quy &amp; Phân loại</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-pink-200 block text-[11px] font-bold">Kiến Trúc Mạng:</span>
            <span className="text-lg sm:text-xl font-black text-emerald-300">ResNet18 &amp; AlexNet</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-cyan-200 block text-[11px] font-bold">Tối Ưu Phần Cứng:</span>
            <span className="text-lg sm:text-xl font-black text-cyan-200">TensorRT FP16</span>
          </div>
        </div>
      </div>

      {/* Main Global Workflow Diagram */}
      <div className="bg-white dark:bg-[#131E36] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Sơ Đồ Phân Nhánh Quy Trình 12 Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Nhấp chuột vào bất kỳ module nào để xem mã nguồn notebook, luồng dữ liệu I/O và chạy thử mô phỏng trực quan
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Tương tác đa điểm
          </span>
        </div>

        {/* Phase 0: Teleoperation (Foundation) */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2.5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
            GIAI ĐOẠN KHỞI ĐẦU: ĐIỀU KHIỂN THỦ CÔNG &amp; AN TOÀN PHẦN CỨNG
          </div>
          <div
            onClick={() => onSelectModule('teleoperation')}
            className="group cursor-pointer p-4.5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-[#131E36] hover:border-blue-500 hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    Module 1: teleoperation.ipynb
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                    Xanh điện tử #2563EB
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    Heartbeat Watchdog
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Gamepad điều khiển 2 động cơ qua <code>traitlets.dlink</code>, stream camera BGR8 $\rightarrow$ JPEG nén, cơ chế Watchdog ngắt an toàn khi mất WiFi.
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1.5 shrink-0">
              Khám phá M1 <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* The Two Main AI Branches Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Branch A: Road Following (Regression) */}
          <div className="p-5 sm:p-6 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-[#131E36] dark:to-amber-950/10 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm"></span>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    NHÁNH A: BÁM ĐƯỜNG (ROAD FOLLOWING)
                  </h3>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 rounded-full border border-amber-300/50">
                  Hồi quy tọa độ X/Y
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
                Dự đoán điểm mục tiêu (x, y) trên ảnh làm &quot;củ cà rốt trên cây gậy&quot; để thuật toán PD vi sai lái hai bánh JetBot bám theo tim đường.
              </p>

              {/* Steps in Branch A */}
              <div className="space-y-3">
                {/* Step 1: Data Collection (Click) */}
                <div
                  onClick={() => onSelectModule('data_collection')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-yellow-200 dark:border-yellow-800/60 hover:border-yellow-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-500" /> Module 2: data_collection.ipynb
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 font-bold">
                      Vàng #FACC15
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Click chuột gán nhãn (offsetX, offsetY), lưu ảnh dạng <code>xy_X_Y_UUID.jpg</code>.
                  </p>
                </div>

                {/* Step 2: Gamepad Annotation */}
                <div
                  onClick={() => onSelectModule('data_collection_gamepad')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-teal-200 dark:border-teal-800/60 hover:border-teal-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-teal-500" /> Module 3: data_collection_gamepad.ipynb
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold">
                      Xanh ngọc #14B8A6
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Cần joystick gamepad điều khiển chấm xanh, nút DPAD Down lưu ảnh kèm nhãn.
                  </p>
                </div>

                {/* Step 3: Training Regression */}
                <div
                  onClick={() => onSelectModule('train_model')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-purple-200 dark:border-purple-800/60 hover:border-purple-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" /> Module 4: train_model.ipynb
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-bold">
                      Tím #8B5CF6
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    XYDataset, hflip đảo dấu <code>x = -x</code>, Adam optimizer, MSE Loss $\rightarrow$ <code>best_steering_model_xy.pth</code>.
                  </p>
                </div>

                {/* Step 4: Live Demo Inference */}
                <div
                  onClick={() => onSelectModule('live_demo')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-blue-200 dark:border-blue-800/60 hover:border-blue-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-500" /> Module 7: live_demo.ipynb
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                      Xanh #2563EB
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    PyTorch FP16, tính góc lái qua <code>arctan2(x, y)</code> và bộ điều khiển vi sai PD.
                  </p>
                </div>

                {/* Sub-Branch: TensorRT Acceleration for Road Following */}
                <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-purple-800 text-white rounded-2xl shadow-sm">
                  <div className="text-xs sm:text-sm font-black flex items-center gap-2 mb-2 text-yellow-200">
                    <Zap className="w-4 h-4 text-yellow-300" /> Tối Ưu Hóa TensorRT Bám Đường (M8 &amp; M9):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={() => onSelectModule('live_demo_build_trt')}
                      className="p-2.5 rounded-xl bg-black/25 hover:bg-black/40 cursor-pointer transition border border-white/15"
                    >
                      <div className="font-black text-sm text-yellow-300">M8: build_trt</div>
                      <div className="text-xs text-white/90">torch2trt FP16 Engine</div>
                    </div>
                    <div
                      onClick={() => onSelectModule('live_demo_trt')}
                      className="p-2.5 rounded-xl bg-black/25 hover:bg-black/40 cursor-pointer transition border border-white/15"
                    >
                      <div className="font-black text-sm text-cyan-300">M9: live_demo_trt</div>
                      <div className="text-xs text-white/90">TRTModule (~45 FPS)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch B: Collision Avoidance (Classification) */}
          <div className="p-5 sm:p-6 rounded-3xl border-2 border-pink-300 dark:border-pink-700/60 bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 dark:from-pink-950/20 dark:via-[#131E36] dark:to-pink-950/10 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-200 dark:border-pink-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-sm"></span>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    NHÁNH B: TRÁNH VA CHẠM (COLLISION AVOIDANCE)
                  </h3>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-pink-100 dark:bg-pink-900/60 text-pink-900 dark:text-pink-300 rounded-full border border-pink-300/50">
                  Phân loại free / blocked
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
                Phân loại khung ảnh thành 2 lớp: đường thông thoáng (free) hoặc có vật cản (blocked) để kích hoạt rẽ trái né chướng ngại vật.
              </p>

              {/* Steps in Branch B */}
              <div className="space-y-3">
                {/* Step 1: AlexNet Training with Bokeh */}
                <div
                  onClick={() => onSelectModule('train_model_plot')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-orange-200 dark:border-orange-800/60 hover:border-orange-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-orange-500" /> Module 5: train_model_plot.ipynb
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 font-bold">
                      Cam #F97316
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ImageFolder, AlexNet thay <code>classifier[6]=Linear(in, 2)</code>, đồ thị Bokeh trực tiếp.
                  </p>
                </div>

                {/* Step 2: ResNet18 Training */}
                <div
                  onClick={() => onSelectModule('train_model_resnet18')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-purple-200 dark:border-purple-800/60 hover:border-purple-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" /> Module 6: train_model_resnet18.ipynb
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-bold">
                      Tím đậm #7C3AED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ResNet18 kết nối tắt (Residual), lớp <code>fc = Linear(512, 2)</code> gọn hơn AlexNet.
                  </p>
                </div>

                {/* Step 3: Live Demo Inference */}
                <div
                  onClick={() => onSelectModule('live_demo_resnet18')}
                  className="p-3.5 bg-white dark:bg-[#182442] rounded-2xl border border-pink-200 dark:border-pink-800/60 hover:border-pink-400 hover:shadow-md cursor-pointer transition stem-card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-pink-500" /> Module 10: live_demo_resnet18.ipynb
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-300 font-bold">
                      Hồng #EC4899
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Softmax xuất <code>prob_blocked</code>: nếu &lt; 0.5 đi thẳng, nếu &gt;= 0.5 rẽ trái né cản.
                  </p>
                </div>

                {/* Sub-Branch: TensorRT Acceleration for Collision Avoidance */}
                <div className="p-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-900 text-white rounded-2xl shadow-sm">
                  <div className="text-xs sm:text-sm font-black flex items-center gap-2 mb-2 text-pink-200">
                    <Zap className="w-4 h-4 text-pink-300" /> Tối Ưu Hóa TensorRT Tránh Va Chạm (M11 &amp; M12):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={() => onSelectModule('live_demo_resnet18_build_trt')}
                      className="p-2.5 rounded-xl bg-black/25 hover:bg-black/40 cursor-pointer transition border border-white/15"
                    >
                      <div className="font-black text-sm text-yellow-300">M11: build_trt</div>
                      <div className="text-xs text-white/90">best_model_trt.pth</div>
                    </div>
                    <div
                      onClick={() => onSelectModule('live_demo_resnet18_trt')}
                      className="p-2.5 rounded-xl bg-black/25 hover:bg-black/40 cursor-pointer transition border border-white/15"
                    >
                      <div className="font-black text-sm text-emerald-300">M12: live_demo_trt</div>
                      <div className="text-xs text-white/90">Phản ứng tức thì FP16</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
