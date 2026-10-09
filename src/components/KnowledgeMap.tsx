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
  Sparkles
} from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';

interface KnowledgeMapProps {
  onSelectModule: (moduleId: string) => void;
  modules: ModuleMeta[];
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ onSelectModule, modules }) => {
  return (
    <div className="space-y-8">
      {/* Overview Intro Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Bản Đồ Kiến Thức Dự Án JetBot (12 Notebooks)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Từ Điều Khiển Thủ Công Đến AI Tự Hành &amp; TensorRT
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Khám phá quy trình công nghệ hoàn chỉnh của robot di động AI: thu thập dữ liệu bằng camera &amp; gamepad,
            phân biệt rạch ròi bài toán <strong>Hồi quy bám đường</strong> với <strong>Phân loại tránh va chạm</strong>,
            và chu trình biên dịch tăng tốc phần cứng bằng <strong>NVIDIA TensorRT</strong>.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Số Notebook Nguồn:</span>
            <span className="text-lg font-bold text-white">12 Modules</span>
          </div>
          <div>
            <span className="text-slate-400 block">Hai Bài Toán AI:</span>
            <span className="text-lg font-bold text-indigo-300">Hồi quy &amp; Phân loại</span>
          </div>
          <div>
            <span className="text-slate-400 block">Kiến Trúc Mạng:</span>
            <span className="text-lg font-bold text-emerald-300">ResNet18 &amp; AlexNet</span>
          </div>
          <div>
            <span className="text-slate-400 block">Tối Ưu Hóa:</span>
            <span className="text-lg font-bold text-cyan-300">TensorRT FP16</span>
          </div>
        </div>
      </div>

      {/* Main Global Workflow Diagram */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Sơ Đồ Phân Nhánh Quy Trình Toàn Dự Án
            </h2>
            <p className="text-xs text-slate-500">
              Nhấp chuột vào bất kỳ giai đoạn nào để mở tài liệu, xem mã nguồn tham chiếu và thử nghiệm mô phỏng
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Tương tác 12 Modules
          </span>
        </div>

        {/* Phase 0: Teleoperation (Foundation) */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Giai đoạn khởi đầu: Điều khiển thủ công &amp; Quan sát phần cứng
          </div>
          <div
            onClick={() => onSelectModule('teleoperation')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition">
                    Module 1: teleoperation.ipynb
                  </span>
                  <span className="text-[11px] px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full font-medium">
                    Điều khiển thủ công
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Gamepad điều khiển 2 động cơ qua traitlets.dlink, camera stream BGR8 $\rightarrow$ JPEG, Heartbeat watchdog an toàn khi mất WiFi.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1">
              Khám phá <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* The Two Main AI Branches Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Branch A: Road Following (Regression) */}
          <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    NHÁNH A: BÁM ĐƯỜNG (ROAD FOLLOWING)
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Hồi quy tọa độ X/Y
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Dự đoán điểm mục tiêu (x, y) trên ảnh làm &quot;củ cà rốt trên cây gậy&quot; để JetBot bẻ lái theo đường đua.
              </p>

              {/* Steps in Branch A */}
              <div className="space-y-2.5">
                {/* Step 1: Data Collection */}
                <div
                  onClick={() => onSelectModule('data_collection')}
                  className="p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" /> Module 2: data_collection.ipynb
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ClickableImageWidget</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Bấm chuột lên ảnh để gán nhãn (offsetX, offsetY), lưu ảnh dạng xy_X_Y_UUID.jpg.
                  </p>
                </div>

                {/* Step 2: Gamepad Annotation */}
                <div
                  onClick={() => onSelectModule('data_collection_gamepad')}
                  className="p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-blue-600" /> Module 3: data_collection_gamepad.ipynb
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">cv2.circle &amp; cv2.line</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Cần joystick gamepad điều khiển chấm xanh, DPAD Down lưu ảnh.
                  </p>
                </div>

                {/* Step 3: Training Regression */}
                <div
                  onClick={() => onSelectModule('train_model')}
                  className="p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" /> Module 4: train_model.ipynb
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                      XYDataset + ResNet18
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Đọc nhãn từ tên file, hflip đảo dấu x = -x, Adam optimizer, MSE Loss $\rightarrow$ best_steering_model_xy.pth.
                  </p>
                </div>

                {/* Step 4: Live Demo Inference */}
                <div
                  onClick={() => onSelectModule('live_demo')}
                  className="p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-blue-600" /> Module 7: live_demo.ipynb
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">PD Controller + arctan2</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    PyTorch model.eval().half(), tính góc lái và cấp xung vi sai hai bánh xe.
                  </p>
                </div>

                {/* Step 5 & 6: TensorRT Acceleration */}
                <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-xs">
                  <div className="text-xs font-bold flex items-center gap-1.5 mb-2 text-cyan-300">
                    <Zap className="w-3.5 h-3.5" /> Nhánh Tối Ưu Hóa TensorRT Bám Đường:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div
                      onClick={() => onSelectModule('live_demo_build_trt')}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition"
                    >
                      <div className="font-bold">M8: build_trt</div>
                      <div className="text-[10px] text-slate-300">torch2trt FP16</div>
                    </div>
                    <div
                      onClick={() => onSelectModule('live_demo_trt')}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition"
                    >
                      <div className="font-bold">M9: live_demo_trt</div>
                      <div className="text-[10px] text-slate-300">TRTModule (~45 FPS)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch B: Collision Avoidance (Classification) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    NHÁNH B: TRÁNH VA CHẠM (COLLISION AVOIDANCE)
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Phân loại free / blocked
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Phân loại khung ảnh thành 2 lớp: đường thông thoáng (free) hoặc có vật cản (blocked) để kích hoạt rẽ trái.
              </p>

              {/* Steps in Branch B */}
              <div className="space-y-2.5">
                {/* Step 1: AlexNet Training with Bokeh */}
                <div
                  onClick={() => onSelectModule('train_model_plot')}
                  className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <LineChart className="w-3.5 h-3.5 text-emerald-600" /> Module 5: train_model_plot.ipynb
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      AlexNet + Bokeh Plots
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    ImageFolder, thay classifier[6]=Linear(in, 2), đồ thị Loss/Accuracy trực tiếp, lưu best_model.pth.
                  </p>
                </div>

                {/* Step 2: ResNet18 Training */}
                <div
                  onClick={() => onSelectModule('train_model_resnet18')}
                  className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Module 6: train_model_resnet18.ipynb
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ResNet18 fc=Linear(512, 2)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Cùng bài toán 2 lớp nhưng dùng ResNet18 với residual block nhẹ hơn, lưu best_model_resnet18.pth.
                  </p>
                </div>

                {/* Step 3: Live Demo Inference */}
                <div
                  onClick={() => onSelectModule('live_demo_resnet18')}
                  className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 cursor-pointer transition shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-600" /> Module 10: live_demo_resnet18.ipynb
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">F.softmax(y, dim=1)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Đọc prob_blocked: nếu &lt; 0.5 đi thẳng robot.forward, nếu &gt;= 0.5 rẽ trái robot.left tránh cản.
                  </p>
                </div>

                {/* Step 4 & 5: TensorRT Acceleration for Collision */}
                <div className="p-3 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-xl shadow-xs">
                  <div className="text-xs font-bold flex items-center gap-1.5 mb-2 text-emerald-300">
                    <Zap className="w-3.5 h-3.5" /> Nhánh Tối Ưu Hóa TensorRT Tránh Va Chạm:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div
                      onClick={() => onSelectModule('live_demo_resnet18_build_trt')}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition"
                    >
                      <div className="font-bold">M11: build_trt</div>
                      <div className="text-[10px] text-slate-300">best_model_trt.pth</div>
                    </div>
                    <div
                      onClick={() => onSelectModule('live_demo_resnet18_trt')}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition"
                    >
                      <div className="font-bold">M12: live_demo_trt</div>
                      <div className="text-[10px] text-slate-300">TRTModule phân loại</div>
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
