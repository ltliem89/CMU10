import React from 'react';
import { AlertOctagon, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            CƠ CHẾ AN TOÀN PHẦN CỨNG ĐÃ KÍCH HOẠT
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            ĐÃ DỪNG KHẨN CẤP ROBOT!
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Toàn bộ lệnh xung PWM tới hai động cơ (<code>robot.left_motor</code> &amp; <code>robot.right_motor</code>)
            đã bị ngắt về <strong>0.0</strong> ngay lập tức. Robot mô phỏng đã hãm phanh đứng yên.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Trạng thái hệ thống:
          </div>
          <div>• <code>robot.stop()</code>: Đã thực thi</div>
          <div>• <code>traitlets.dlink</code>: Đã unlink bảo vệ an toàn</div>
          <div>• Vận tốc hai bánh xe: 0.00 / 0.00</div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác Nhận &amp; Tiếp Tục Trải Nghiệm An Toàn
          </button>
        </div>
      </div>
    </div>
  );
};
