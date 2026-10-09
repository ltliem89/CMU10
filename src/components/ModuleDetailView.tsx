import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Cpu, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Camera, 
  Gamepad2, 
  Play,
  Zap,
  Tag
} from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';
import { CameraSimulator } from './CameraSimulator';
import { RobotTwinMotorSimulator } from './RobotTwinMotorSimulator';
import { MODULE_THEMES } from '../theme/stemTokens';

interface ModuleDetailViewProps {
  module: ModuleMeta;
  allModules: ModuleMeta[];
  onSelectModule: (moduleId: string) => void;
  onEmergencyStop: () => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  module,
  allModules,
  onSelectModule,
  onEmergencyStop
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<number>(0);

  // Find previous and next module for navigation
  const currentIndex = allModules.findIndex((m) => m.id === module.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  // Module distinct theme
  const theme = MODULE_THEMES[module.id] || MODULE_THEMES['teleoperation'];

  const handleCopyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Next/Prev Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131E36] p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <span className="font-bold text-slate-400 dark:text-slate-500">12 NOTEBOOKS</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: theme.primaryHex }}
            />
            <span className={`font-black ${theme.accentText} ${theme.accentBg} px-3 py-1 rounded-xl border ${theme.accentBorder}`}>
              Module {module.number}: {module.nameVi}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          {prevModule && (
            <button
              onClick={() => onSelectModule(prevModule.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> M{prevModule.number}
            </button>
          )}
          {nextModule && (
            <button
              onClick={() => onSelectModule(nextModule.id)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition font-black shadow-md"
            >
              M{nextModule.number} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Module Overview Hero Banner with Signature Gradient */}
      <div className={`bg-gradient-to-r ${theme.bannerGradient} text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-2 mb-3.5 relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/30 text-yellow-300 border border-white/20">
            NOTEBOOK: {module.notebookName}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 shadow-xs">
            {module.taskTypeVi}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
            {theme.colorName}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black mb-3 text-white drop-shadow-sm relative z-10">
          Module {module.number}: {module.nameVi}
        </h1>

        <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-4xl font-medium relative z-10">
          {module.descriptionVi}
        </p>

        {/* Target Goal Box */}
        <div className="mt-5 p-4 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 text-xs sm:text-sm text-white flex items-start gap-3 relative z-10">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-yellow-300 font-black text-sm sm:text-base">Mục tiêu sư phạm: </strong>
            {module.targetGoalVi}
          </div>
        </div>
      </div>

      {/* Interactive Sandbox for this Module */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Không Gian Thực Hành Tương Tác Trực Tiếp Của Module {module.number}
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-black border border-emerald-300 dark:border-emerald-800">
            Chạy ngay không cần robot thật
          </span>
        </div>

        {/* Conditional Visual Sandbox based on module category */}
        {module.id === 'teleoperation' && (
          <div className="space-y-4">
            <RobotTwinMotorSimulator onEmergencyStop={onEmergencyStop} />
          </div>
        )}

        {(module.id === 'data_collection' || module.id === 'data_collection_gamepad') && (
          <div className="space-y-4">
            <CameraSimulator mode="annotation" />
          </div>
        )}

        {(module.id === 'train_model' || module.id === 'train_model_plot' || module.id === 'train_model_resnet18') && (
          <div className="bg-slate-50 dark:bg-[#182442] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-base">
              Mô Phỏng Quá Trình Huấn Luyện Mạng Nơ-ron AI
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Module này huấn luyện mô hình sâu trên máy trạm hoặc GPU Jetson Nano. Hãy chuyển sang tab 
              <strong className="text-blue-600 dark:text-blue-400"> &quot;Đồ Thị Huấn Luyện&quot;</strong> hoặc 
              <strong className="text-pink-600 dark:text-pink-400"> &quot;Thí Nghiệm Nếu Như&quot;</strong> để phân tích trực quan quá trình hội tụ!
            </p>
          </div>
        )}

        {(module.id === 'live_demo' || module.id === 'live_demo_trt') && (
          <div className="space-y-4">
            <CameraSimulator mode="inference" />
            <RobotTwinMotorSimulator onEmergencyStop={onEmergencyStop} />
          </div>
        )}

        {(module.id === 'live_demo_resnet18' || module.id === 'live_demo_resnet18_trt') && (
          <div className="space-y-4">
            <CameraSimulator mode="classification" />
            <RobotTwinMotorSimulator onEmergencyStop={onEmergencyStop} />
          </div>
        )}

        {(module.id === 'live_demo_build_trt' || module.id === 'live_demo_resnet18_build_trt') && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-purple-900 text-white p-6 sm:p-7 rounded-3xl shadow-md space-y-3">
            <div className="flex items-center gap-2 text-yellow-300 font-black text-base">
              <Zap className="w-6 h-6" />
              Quy Trình Biên Dịch Tối Ưu NVIDIA TensorRT (torch2trt FP16)
            </div>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
              Mã nguồn gọi hàm <code>torch2trt(model, [data], fp16_mode=True)</code> để chuyển đổi đồ thị PyTorch sang cấu trúc TensorRT Engine.
              File trọng số engine sau biên dịch được lưu để nạp vào <code>TRTModule</code> ở bước suy luận thời gian thực với tốc độ ~45 FPS.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-black/25 rounded-2xl border border-white/20">
                <span className="text-amber-200 block mb-1 font-bold">Chế độ số thực:</span>
                <span className="font-black text-white text-sm">FP16 (Half Precision)</span>
              </div>
              <div className="p-3 bg-black/25 rounded-2xl border border-white/20">
                <span className="text-amber-200 block mb-1 font-bold">Thời gian build:</span>
                <span className="font-black text-yellow-300 text-sm">~2 - 5 phút trên Nano</span>
              </div>
              <div className="p-3 bg-black/25 rounded-2xl border border-white/20">
                <span className="text-amber-200 block mb-1 font-bold">File đích:</span>
                <span className="font-mono font-black text-cyan-200 text-xs">
                  {module.id.includes('resnet18') ? 'best_model_trt.pth' : 'best_steering_model_xy_trt.pth'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Flow (Input -> Process -> Output) */}
      <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Luồng Dữ Liệu Chi Tiết (Data Flow)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60">
            <span className="font-black text-blue-700 dark:text-blue-300 block mb-1 uppercase tracking-wide text-xs">
              1. Dữ Liệu Đầu Vào (Input)
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{module.dataFlow.input}</p>
          </div>
          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60">
            <span className="font-black text-purple-700 dark:text-purple-300 block mb-1 uppercase tracking-wide text-xs">
              2. Thuật Toán Xử Lý (Process)
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{module.dataFlow.process}</p>
          </div>
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
            <span className="font-black text-emerald-700 dark:text-emerald-300 block mb-1 uppercase tracking-wide text-xs">
              3. Kết Quả Đầu Ra (Output)
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{module.dataFlow.output}</p>
          </div>
        </div>
      </div>

      {/* Code Snippets Extracted Directly from Notebook */}
      <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Mã Nguồn Trích Xuất Từ Notebook Gốc
          </h3>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {module.codeSnippets.length} đoạn mã tham chiếu
          </span>
        </div>

        {/* Code Tabs */}
        {module.codeSnippets.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 text-xs">
            {module.codeSnippets.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCodeTab(idx)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeCodeTab === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Đoạn mã {idx + 1}: {snippet.captionVi || 'Code Cell'}
              </button>
            ))}
          </div>
        )}

        {/* Active Code Block Display */}
        {module.codeSnippets[activeCodeTab] && (
          <div className="space-y-4">
            <div className="relative bg-[#0A101F] rounded-2xl p-5 overflow-x-auto border-2 border-slate-800 shadow-xl">
              <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-800 text-xs sm:text-sm text-slate-400">
                <span className="font-bold text-slate-200">{module.codeSnippets[activeCodeTab].captionVi}</span>
                <button
                  onClick={() => handleCopyCode(activeCodeTab, module.codeSnippets[activeCodeTab].code)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition font-bold"
                >
                  {copiedIndex === activeCodeTab ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Sao chép mã
                    </>
                  )}
                </button>
              </div>
              <pre className="text-sm font-mono text-emerald-300 dark:text-emerald-400 leading-relaxed">
                {module.codeSnippets[activeCodeTab].code}
              </pre>
            </div>

            {/* Line-by-line pedagogical annotations */}
            {module.codeSnippets[activeCodeTab].annotations && (
              <div className="p-5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-3 text-xs sm:text-sm">
                <span className="font-black text-indigo-900 dark:text-indigo-200 text-sm block mb-1">
                  Chú giải kỹ thuật từng dòng lệnh:
                </span>
                <div className="space-y-2.5">
                  {module.codeSnippets[activeCodeTab].annotations!.map((ann, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-indigo-950 dark:text-indigo-200">
                      <span className="font-mono font-black text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shrink-0 text-xs">
                        Dòng {ann.line}
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-indigo-950 dark:text-indigo-100">{ann.explanation}</strong>
                        <div className="text-indigo-800/90 dark:text-indigo-300/90 text-xs sm:text-sm italic font-medium">
                          Tác động cơ khí / logic: {ann.impactOnRobot}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caveats & Hardware Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caveats */}
        <div className="bg-orange-50/80 dark:bg-orange-950/40 p-5 rounded-3xl border border-orange-200 dark:border-orange-800/60 space-y-3 text-xs sm:text-sm text-orange-950 dark:text-orange-200">
          <div className="font-black flex items-center gap-2 text-orange-900 dark:text-orange-300 text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Lỗi Thường Gặp &amp; Lưu Ý Kỹ Thuật (Caveats)
          </div>
          <ul className="space-y-2 list-disc list-inside text-orange-950/95 dark:text-orange-200/95 leading-relaxed font-medium">
            {module.caveatsAndErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>

        {/* Hardware Requirements */}
        <div className="bg-slate-50 dark:bg-[#182442] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <div className="font-black flex items-center gap-2 text-slate-900 dark:text-white text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Điều Kiện Phần Cứng Triển Khai Thực Tế
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2 font-medium">
            Khi triển khai từ trình duyệt sang kit robot JetBot thực tế:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {module.hardwareRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
