import React from 'react';
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, Cpu, Terminal, ExternalLink, HardDrive } from 'lucide-react';
import { ModuleMeta } from '../types/jetbot';

interface SourcesAndCaveatsProps {
  modules: ModuleMeta[];
  onSelectModule: (moduleId: string) => void;
}

export const SourcesAndCaveats: React.FC<SourcesAndCaveatsProps> = ({ modules, onSelectModule }) => {
  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" /> Kiểm Kê Nguồn &amp; Lưu Ý Kỹ Thuật Khi Triển Khai
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Đối Chiếu Mã Nguồn 12 Notebooks &amp; Nguyên Tắc An Toàn Phần Cứng
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Ứng dụng này được xây dựng trên sự kết hợp chặt chẽ giữa <strong>Đặc tả tổng thể giảng dạy</strong> và 
            <strong>Sổ tay trích xuất 12 notebook nguồn</strong> của dự án JetBot. Nhằm đảm bảo tính trung thực sư phạm,
            chúng tôi phân định rạch ròi giữa mã nguồn gốc, phần diễn giải lý thuyết và chức năng mô phỏng an toàn trên giao diện.
          </p>
        </div>
      </div>

      {/* Tripartite Boundary Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            1. Trích Từ Mã Nguồn Gốc
          </div>
          <p className="text-emerald-950/90 leading-relaxed">
            Toàn bộ tên hàm, lớp, biến số, đường dẫn checkpoint (như <code>best_steering_model_xy.pth</code>, <code>best_model.pth</code>),
            cấu trúc mạng (AlexNet, ResNet18), lệnh shell và thuật toán PD đều được giữ nguyên vẹn 100% từ 12 tệp notebook .ipynb.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
            <Cpu className="w-4 h-4 text-blue-600" />
            2. Diễn Giải Sư Phạm
          </div>
          <p className="text-blue-950/90 leading-relaxed">
            Các giải thích về động học vi sai $v = (v_R + v_L)/2$, cơ chế hồi quy tọa độ bám đường vs phân loại nhị phân tránh va chạm,
            nguyên lý Layer Fusion của TensorRT được biên soạn để giúp giáo viên và học sinh dễ tiếp thu nhất.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            3. Mô Phỏng An Toàn Trong UI
          </div>
          <p className="text-amber-950/90 leading-relaxed">
            Bộ mô phỏng 2 bánh xe, camera giả lập và đồ thị huấn luyện chạy hoàn toàn trên trình duyệt bằng React + SVG Canvas,
            hoạt động mượt mà không yêu cầu học sinh phải sở hữu robot thật, GPU NVIDIA hay cài đặt môi trường Linux/CUDA.
          </p>
        </div>
      </div>

      {/* 12-Notebook Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          Bảng Kiểm Kê Chi Tiết 12 Notebooks Dự Án JetBot
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Tên Tệp Notebook</th>
                <th className="p-3.5">Nhiệm Vụ / Bài Toán</th>
                <th className="p-3.5">Mô Hình &amp; Công Nghệ</th>
                <th className="p-3.5">Đầu Ra Quan Trọng</th>
                <th className="p-3.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {modules.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{m.number}</td>
                  <td className="p-3.5 font-mono text-indigo-700 font-bold">{m.notebookName}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{m.taskTypeVi}</span>
                    <span className="text-xs text-slate-500">{m.categoryNameVi}</span>
                  </td>
                  <td className="p-3.5 font-mono text-xs text-slate-700">
                    {m.keyFunctions.slice(0, 2).join(', ')}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-emerald-700 font-bold">
                    {m.id === 'train_model' && 'best_steering_model_xy.pth'}
                    {m.id === 'train_model_plot' && 'best_model.pth'}
                    {m.id === 'train_model_resnet18' && 'best_model_resnet18.pth'}
                    {m.id === 'live_demo_build_trt' && 'best_steering_model_xy_trt.pth'}
                    {m.id === 'live_demo_resnet18_build_trt' && 'best_model_trt.pth'}
                    {m.id === 'data_collection' && 'dataset_xy/*.jpg'}
                    {m.id === 'teleoperation' && 'snapshots/*.jpg'}
                    {m.id.startsWith('live_demo') && !m.id.includes('build') && 'Lệnh động cơ 2 bánh'}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectModule(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition text-xs sm:text-sm"
                    >
                      Mở Module
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Hardware Caveats for Physical Deployment */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 text-sm text-amber-950">
        <div className="flex items-center gap-2.5 font-bold text-amber-900 text-base">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          Cảnh Báo Kỹ Thuật Quan Trọng Khi Chạy Trên Phần Cứng Thật Jetson Nano
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4.5 bg-white/90 rounded-2xl border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900 block text-sm">1. Giải phóng Camera CSI MIPI (camera.stop()):</span>
            <p className="leading-relaxed text-amber-950/90 text-xs sm:text-sm">
              Nếu chuyển đổi giữa các notebook mà không gọi <code>camera.stop()</code>, tiến trình GStreamer daemon
              (nvarguscamerasrc) sẽ bị khóa vĩnh viễn cho đến khi khởi động lại dịch vụ hoặc reboot hệ thống.
            </p>
          </div>

          <div className="p-4.5 bg-white/90 rounded-2xl border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900 block text-sm">2. Cạm bẫy chia tập test 50 mẫu (random_split):</span>
            <p className="leading-relaxed text-amber-950/90 text-xs sm:text-sm">
              Lệnh <code>random_split(dataset, [len(dataset) - 50, 50])</code> trong notebook tránh va chạm sẽ lập tức
              báo lỗi nếu học sinh thu thập ít hơn 50 bức ảnh. Khuyến cáo nên kiểm tra kích thước dataset trước khi chia.
            </p>
          </div>

          <div className="p-4.5 bg-white/90 rounded-2xl border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900 block text-sm">3. Phân biệt rõ hai file TensorRT (.pth):</span>
            <p className="leading-relaxed text-amber-950/90 text-xs sm:text-sm">
              Không được dùng lẫn lộn <code>best_model_trt.pth</code> (2 ngõ ra phân loại) và 
              <code>best_steering_model_xy_trt.pth</code> (hồi quy góc lái) vì cấu trúc ngõ ra và tiền xử lý hoàn toàn khác nhau.
            </p>
          </div>

          <div className="p-4.5 bg-white/90 rounded-2xl border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900 block text-sm">4. Nguồn điện và an toàn pin 18650:</span>
            <p className="leading-relaxed text-amber-950/90 text-xs sm:text-sm">
              Khi hai động cơ tăng tốc đột ngột, điện áp có thể sụt giảm tức thời (brownout) khiến Jetson Nano bị reset.
              Luôn sạc đầy pin trước khi chạy demo suy luận TensorRT tốc độ cao.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
