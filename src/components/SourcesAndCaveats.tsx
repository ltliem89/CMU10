import React from 'react';
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, Cpu, Terminal, ExternalLink, HardDrive, Sparkles, ArrowRight } from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';
import { MODULE_THEMES } from '../theme/stemTokens';

interface SourcesAndCaveatsProps {
  modules: ModuleMeta[];
  onSelectModule: (moduleId: string) => void;
}

export const SourcesAndCaveats: React.FC<SourcesAndCaveatsProps> = ({ modules, onSelectModule }) => {
  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-yellow-300 text-xs font-black mb-3 border border-white/20">
            <FileText className="w-4 h-4 text-yellow-300" /> KIỂM KÊ KỸ THUẬT &amp; ĐỐI CHIẾU MÃ NGUỒN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Đối Chiếu Mã Nguồn 12 Notebooks &amp; Nguyên Tắc An Toàn Phần Cứng
          </h1>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-medium">
            Ứng dụng này được xây dựng trên sự kết hợp chặt chẽ giữa <strong>Đặc tả tổng thể giảng dạy</strong> và 
            <strong> Sổ tay trích xuất 12 notebook nguồn</strong> của dự án JetBot. Nhằm đảm bảo tính trung thực sư phạm,
            chúng tôi phân định rạch ròi giữa mã nguồn gốc, phần diễn giải lý thuyết và chức năng mô phỏng an toàn trên giao diện.
          </p>
        </div>
      </div>

      {/* Tripartite Boundary Principles with Vibrant STEM Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs sm:text-sm space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300 text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            1. Trích Từ Mã Nguồn Gốc
          </div>
          <p className="text-emerald-950/90 dark:text-emerald-200 leading-relaxed font-medium">
            Toàn bộ tên hàm, lớp, biến số, đường dẫn checkpoint (như <code>best_steering_model_xy.pth</code>, <code>best_model.pth</code>),
            cấu trúc mạng (AlexNet, ResNet18), lệnh shell và thuật toán PD được giữ nguyên vẹn 100% từ 12 tệp notebook .ipynb.
          </p>
        </div>

        <div className="p-5 rounded-3xl border-2 border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 text-xs sm:text-sm space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 font-black text-blue-800 dark:text-blue-300 text-base">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            2. Diễn Giải Sư Phạm
          </div>
          <p className="text-blue-950/90 dark:text-blue-200 leading-relaxed font-medium">
            Các giải thích về động học vi sai $v = (v_R + v_L)/2$, hồi quy tọa độ bám đường vs phân loại nhị phân tránh va chạm,
            và cơ chế Layer Fusion của TensorRT được biên soạn giúp học sinh lớp 11 dễ tiếp thu nhất.
          </p>
        </div>

        <div className="p-5 rounded-3xl border-2 border-orange-300 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-950/30 text-xs sm:text-sm space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 font-black text-orange-800 dark:text-orange-300 text-base">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            3. Mô Phỏng An Toàn Trong UI
          </div>
          <p className="text-orange-950/90 dark:text-orange-200 leading-relaxed font-medium">
            Bộ mô phỏng 2 bánh xe, camera giả lập và đồ thị huấn luyện chạy hoàn toàn trên trình duyệt bằng React + SVG Canvas,
            hoạt động mượt mà không yêu cầu học sinh phải có robot thật hay GPU NVIDIA.
          </p>
        </div>
      </div>

      {/* 12-Notebook Inventory Table */}
      <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 overflow-hidden space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Bảng Kiểm Kê Chi Tiết 12 Notebooks Dự Án JetBot
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-xs tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Màu</th>
                <th className="p-3.5">Tên Tệp Notebook</th>
                <th className="p-3.5">Nhiệm Vụ / Bài Toán</th>
                <th className="p-3.5">Mô Hình &amp; Công Nghệ</th>
                <th className="p-3.5">Đầu Ra Quan Trọng</th>
                <th className="p-3.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {modules.map((m) => {
                const theme = MODULE_THEMES[m.id] || MODULE_THEMES['teleoperation'];
                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-black text-slate-900 dark:text-white">{m.number}</td>
                    <td className="p-3.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                        style={{ backgroundColor: theme.primaryHex }}
                        title={theme.colorName}
                      />
                    </td>
                    <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">{m.notebookName}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{m.taskTypeVi}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{m.categoryNameVi}</span>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {m.keyFunctions.slice(0, 2).join(', ')}
                    </td>
                    <td className="p-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      {m.id === 'train_model' && 'best_steering_model_xy.pth'}
                      {m.id === 'train_model_plot' && 'best_model.pth'}
                      {m.id === 'train_model_resnet18' && 'best_model_resnet18.pth'}
                      {m.id === 'live_demo_build_trt' && 'best_steering_model_xy_trt.pth'}
                      {m.id === 'live_demo_resnet18_build_trt' && 'best_model_trt.pth'}
                      {!['train_model', 'train_model_plot', 'train_model_resnet18', 'live_demo_build_trt', 'live_demo_resnet18_build_trt'].includes(m.id) && 'Lệnh điều khiển / Dataset'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectModule(m.id)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Mở <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
