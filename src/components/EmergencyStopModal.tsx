import React from 'react';
import { AlertOctagon, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131E36] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-red-500 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-300 dark:border-red-800">
            CƠ CHẾ AN TOÀN STEM ĐÃ KÍCH HOẠT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2.5">
            ĐÃ DỪNG KHẨN CẤP ROBOT!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
            Toàn bộ xung PWM điều khiển hai động cơ (<code>robot.left_motor</code> &amp; <code>robot.right_motor</code>)
            đã bị ngắt về <strong>0.0</strong> ngay lập tức. Robot mô phỏng đã hãm phanh đứng yên.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-[#182442] rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-medium">
          <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" /> Trạng thái bảo vệ an toàn:
          </div>
          <div>• <code>robot.stop()</code>: Đã thực thi hạ tốc độ về 0.00</div>
          <div>• <code>traitlets.dlink</code>: Đã ngắt liên kết bảo vệ an toàn</div>
          <div>• Vận tốc hai bánh xe: v_L = 0.00, v_R = 0.00</div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác Nhận &amp; Tiếp Tục Thí Nghiệm An Toàn
          </button>
        </div>
      </div>
    </div>
  );
};
