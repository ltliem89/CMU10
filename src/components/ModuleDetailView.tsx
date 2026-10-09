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
  Play
} from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';
import { CameraSimulator } from './CameraSimulator';
import { RobotTwinMotorSimulator } from './RobotTwinMotorSimulator';

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

  const handleCopyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-400">DANH MỤC 12 MODULES</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Module {module.number}: {module.nameVi}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {prevModule && (
            <button
              onClick={() => onSelectModule(prevModule.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Module {prevModule.number}
            </button>
          )}
          {nextModule && (
            <button
              onClick={() => onSelectModule(nextModule.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition font-medium shadow-2xs"
            >
              Module {nextModule.number} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Module Overview Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            TỆP NGUỒN: {module.notebookName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            {module.taskTypeVi}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
            {module.categoryNameVi}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">
          Module {module.number}: {module.nameVi}
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          {module.descriptionVi}
        </p>

        {/* Target Goal Box */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-indigo-200 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Mục tiêu chính: </strong>
            {module.targetGoalVi}
          </div>
        </div>
      </div>

      {/* Interactive Sandbox for this Module */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4.5 h-4.5 text-indigo-600" />
            Không Gian Thực Hành Tương Tác Của Module {module.number}
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Mô phỏng chạy ngay không cần phần cứng
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
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Mô Phỏng Quá Trình Huấn Luyện Mạng Nơ-ron</h4>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto">
              Module này huấn luyện mô hình sâu trên máy trạm hoặc GPU Jetson Nano. Hãy sử dụng tab 
              <strong> &quot;Đồ Thị Huấn Luyện&quot;</strong> trên thanh điều hướng để xem mô phỏng tương tác đường cong Loss &amp; Accuracy.
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
          <div className="bg-gradient-to-r from-cyan-950 to-slate-900 text-white p-6 rounded-2xl border border-cyan-800/40 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Cpu className="w-5 h-5" />
              Quy Trình Biên Dịch Mô Hình NVIDIA TensorRT (torch2trt FP16)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mã nguồn sử dụng lệnh <code>torch2trt(model, [data], fp16_mode=True)</code> để chuyển đổi đồ thị PyTorch sang định dạng TensorRT Engine tối ưu.
              Sau khi biên dịch thành công, file trọng số engine được lưu ra đĩa để nạp vào <code>TRTModule</code> ở bước suy luận thời gian thực.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block mb-1">Độ chính xác:</span>
                <span className="font-bold text-cyan-300">FP16 (Half Precision)</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block mb-1">Thời gian build:</span>
                <span className="font-bold text-amber-300">~2 - 5 phút trên Jetson Nano</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block mb-1">Kết quả đầu ra:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {module.id.includes('resnet18') ? 'best_model_trt.pth' : 'best_steering_model_xy_trt.pth'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Flow (Input -> Process -> Output) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Luồng Dữ Liệu Chi Tiết (Data Flow)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-indigo-700 block mb-1 uppercase tracking-wide text-[11px]">
              1. Dữ Liệu Đầu Vào (Input)
            </span>
            <p className="text-slate-700 leading-relaxed">{module.dataFlow.input}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-blue-700 block mb-1 uppercase tracking-wide text-[11px]">
              2. Thuật Toán Xử Lý (Process)
            </span>
            <p className="text-slate-700 leading-relaxed">{module.dataFlow.process}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1 uppercase tracking-wide text-[11px]">
              3. Kết Quả Đầu Ra (Output)
            </span>
            <p className="text-slate-700 leading-relaxed">{module.dataFlow.output}</p>
          </div>
        </div>
      </div>

      {/* Code Snippets Extracted Directly from Notebook */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" /> Mã Nguồn Trích Xuất Từ Notebook Gốc
          </h3>
          <span className="text-xs font-mono text-slate-500">
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
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCodeTab === idx
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            <div className="relative bg-slate-950 rounded-xl p-4 overflow-x-auto border border-slate-800">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                <span>{module.codeSnippets[activeCodeTab].captionVi}</span>
                <button
                  onClick={() => handleCopyCode(activeCodeTab, module.codeSnippets[activeCodeTab].code)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition"
                >
                  {copiedIndex === activeCodeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sao chép mã
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                {module.codeSnippets[activeCodeTab].code}
              </pre>
            </div>

            {/* Line-by-line pedagogical annotations if available */}
            {module.codeSnippets[activeCodeTab].annotations && (
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2 text-xs">
                <span className="font-bold text-indigo-900 block mb-1">Chú giải chi tiết từng dòng lệnh:</span>
                <div className="space-y-2">
                  {module.codeSnippets[activeCodeTab].annotations!.map((ann, i) => (
                    <div key={i} className="flex items-start gap-2 text-indigo-950">
                      <span className="font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                        Dòng {ann.line}
                      </span>
                      <div>
                        <strong>{ann.explanation}</strong>
                        <div className="text-indigo-800/80 mt-0.5 italic">
                          Tác động lên robot: {ann.impactOnRobot}
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

      {/* Caveats, Common Errors and Hardware notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caveats */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-950">
          <div className="font-bold flex items-center gap-2 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Lỗi Thường Gặp &amp; Lưu Ý Kỹ Thuật (Caveats)
          </div>
          <ul className="space-y-2 list-disc list-inside text-amber-900/90 leading-relaxed">
            {module.caveatsAndErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>

        {/* Hardware & Runtime Requirements */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-800">
          <div className="font-bold flex items-center gap-2 text-slate-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Điều Kiện Triển Khai Thực Tế &amp; An Toàn
          </div>
          <p className="text-slate-600 leading-relaxed mb-2">
            Khi chuyển từ môi trường mô phỏng sang robot thật Jetson Nano:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-700">
            {module.hardwareRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
