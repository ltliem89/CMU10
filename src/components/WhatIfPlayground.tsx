import React, { useState } from 'react';
import { Sliders, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';

export const WhatIfPlayground: React.FC = () => {
  const [activeExp, setActiveExp] = useState<'pd' | 'hflip' | 'model_arch' | 'precision'>('pd');

  // Experiment 1: PD Gain state
  const [steeringGain, setSteeringGain] = useState<number>(0.2);
  const [steeringKd, setSteeringKd] = useState<number>(0.0);
  const [steeringBias, setSteeringBias] = useState<number>(0.0);

  // Experiment 2: HFlip logic toggle
  const [invertLabelX, setInvertLabelX] = useState<boolean>(true);

  // Computed PD evaluation
  const getPDEvaluation = () => {
    if (steeringGain > 0.45 && steeringKd < 0.05) {
      return {
        status: 'Dao động lắc lư (Oscillation)',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        desc: 'Độ lợi tỷ lệ Kp quá cao trong khi Kd = 0 khiến JetBot bẻ lái quá đà (over-correct), xe sẽ bị lắc lư hình sin qua lại liên tục giữa hai bên lề đường.'
      };
    }
    if (steeringGain < 0.08) {
      return {
        status: 'Phản ứng chậm chạp (Sluggish)',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        desc: 'Kp quá nhỏ làm góc lái sinh ra không đủ lớn khi vào cua. Robot sẽ trượt ra khỏi đường đua ở những khúc cua gắt.'
      };
    }
    if (Math.abs(steeringBias) > 0.15) {
      return {
        status: 'Bị lệch một bên (Motor/Camera Drift)',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        desc: `Độ lệch bias = ${steeringBias > 0 ? '+' : ''}${steeringBias} làm xe luôn có xu hướng tạt sang ${steeringBias > 0 ? 'phải' : 'trái'}, chỉ nên dùng khi động cơ thực tế bị lệch cơ khí.`
      };
    }
    return {
      status: 'Bám đường mượt mà (Smooth Tracking)',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      desc: 'Bộ thông số cân bằng lý tưởng (Kp ≈ 0.15-0.25, Kd ≈ 0.02-0.08). Lực hãm vi phân triệt tiêu dao động, xe bám tâm đường rất êm.'
    };
  };

  const pdEval = getPDEvaluation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          Phòng Thí Nghiệm &quot;Nếu Thay Đổi Giá Trị Thì Sao?&quot; (What-If Simulator)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Khám phá sự thay đổi của thuật toán và phản ứng của robot khi bạn can thiệp vào các tham số cốt lõi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveExp('pd')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeExp === 'pd' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          1. Tinh chỉnh bộ điều khiển PD (Kp, Kd, Bias)
        </button>
        <button
          onClick={() => setActiveExp('hflip')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeExp === 'hflip' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          2. Lật ngang ảnh: Có đảo dấu x = -x hay không?
        </button>
        <button
          onClick={() => setActiveExp('model_arch')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeExp === 'model_arch' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          3. So sánh AlexNet vs ResNet18
        </button>
        <button
          onClick={() => setActiveExp('precision')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeExp === 'precision' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          4. PyTorch FP32 vs TensorRT FP16
        </button>
      </div>

      {/* Experiment 1: PD Gain */}
      {activeExp === 'pd' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Công thức điều khiển lái trong live_demo.ipynb:</span>
            <code className="text-indigo-700 font-mono block">
              angle = np.arctan2(x, y)
              <br />
              pid = angle * steering_gain + (angle - angle_last) * steering_kd
              <br />
              steering = pid + steering_bias
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Steering Gain */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-700">
                <span>steering_gain (Kp):</span>
                <span className="font-mono text-indigo-700 font-bold">{steeringGain.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.02"
                value={steeringGain}
                onChange={(e) => setSteeringGain(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Độ nhạy phản ứng bẻ lái theo góc lệch.</p>
            </div>

            {/* Steering Kd */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-700">
                <span>steering_kd (Kd):</span>
                <span className="font-mono text-indigo-700 font-bold">{steeringKd.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.2"
                step="0.005"
                value={steeringKd}
                onChange={(e) => setSteeringKd(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Lực hãm chống rung lắc hình sin.</p>
            </div>

            {/* Steering Bias */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-700">
                <span>steering_bias:</span>
                <span className="font-mono text-indigo-700 font-bold">{steeringBias > 0 ? `+${steeringBias.toFixed(2)}` : steeringBias.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.02"
                value={steeringBias}
                onChange={(e) => setSteeringBias(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Bù trừ độ lệch cơ khí bánh hoặc góc camera.</p>
            </div>
          </div>

          {/* Diagnostic Evaluation Card */}
          <div className={`p-4 rounded-xl border text-xs ${pdEval.color}`}>
            <div className="font-bold text-sm mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Kết Quả Đánh Giá Hành Vi Robot: {pdEval.status}
            </div>
            <p className="leading-relaxed opacity-90">{pdEval.desc}</p>
          </div>
        </div>
      )}

      {/* Experiment 2: Data Augmentation HFlip */}
      {activeExp === 'hflip' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Cạm bẫy kinh điển trong XYDataset (train_model.ipynb):</h4>
            <p className="text-slate-600 leading-relaxed">
              Khi ta thực hiện tăng cường dữ liệu bằng lật ngang ảnh (Horizontal Flip), hướng cua của con đường bị đảo ngược
              (rẽ phải biến thành rẽ trái). Nếu ta không đảo dấu tọa độ mục tiêu <code>x = -x</code>, điều gì sẽ xảy ra?
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 text-xs">
            <label className="font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={invertLabelX}
                onChange={(e) => setInvertLabelX(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              Bật logic đảo dấu nhãn tọa độ: <code>x = -x</code> khi lật ảnh
            </label>
          </div>

          <div className={`p-4 rounded-xl border text-xs ${
            invertLabelX ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {invertLabelX ? (
              <div>
                <span className="font-bold text-sm block mb-1">ĐÚNG CHUẨN: Dữ liệu huấn luyện nhất quán ngữ nghĩa!</span>
                Ảnh bị lật sang trái và nhãn x cũng âm tương ứng. Robot học được cả hai chiều rẽ đối xứng, nâng cao gấp đôi độ đa dạng của tập huấn luyện.
              </div>
            ) : (
              <div>
                <span className="font-bold text-sm block mb-1">LỖI NGHIÊM TRỌNG: Mâu thuẫn nhãn (Contradictory Labels)!</span>
                Ảnh hiển thị khúc cua rẽ trái nhưng nhãn tọa độ x vẫn mang giá trị dương (rẽ phải). Mô hình bị &quot;tẩu hỏa nhập ma&quot;, khi chạy thực tế gặp khúc cua sẽ lao thẳng vào tường!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experiment 3: AlexNet vs ResNet18 */}
      {activeExp === 'model_arch' && (
        <div className="space-y-4 text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Tiêu chí so sánh</th>
                  <th className="p-3 text-indigo-700">AlexNet (Module 5)</th>
                  <th className="p-3 text-emerald-700">ResNet18 (Module 6)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold">Năm ra đời &amp; Ý tưởng</td>
                  <td className="p-3">2012 (Kiến trúc Conv cổ điển sâu 8 tầng)</td>
                  <td className="p-3 font-medium text-emerald-800">2015 (Residual Skip Connections giải quyết tiêu biến gradient)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Số lượng tham số (Parameters)</td>
                  <td className="p-3">~61 triệu tham số (FC lớp cuối rất nặng)</td>
                  <td className="p-3 font-medium text-emerald-800">~11.7 triệu tham số (nhẹ hơn ~5 lần)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Lớp thay thế cho 2 đầu ra</td>
                  <td className="p-3 font-mono">model.classifier[6] = Linear(in, 2)</td>
                  <td className="p-3 font-mono text-emerald-800">model.fc = Linear(512, 2)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Hiệu năng trên Jetson Nano</td>
                  <td className="p-3">Tốn nhiều VRAM, tốc độ suy luận vừa phải</td>
                  <td className="p-3 font-medium text-emerald-800">Tối ưu hơn rất nhiều khi kết hợp FP16 và TensorRT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Experiment 4: PyTorch vs TensorRT */}
      {activeExp === 'precision' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 block mb-2 uppercase text-[11px]">PyTorch FP32 / FP16 Tiêu Chuẩn:</span>
              <ul className="space-y-2 list-disc list-inside text-slate-600">
                <li>Tính toán từng lớp tuần tự (Conv $\rightarrow$ BatchNorm $\rightarrow$ ReLU).</li>
                <li>Độ trễ suy luận trên Jetson Nano: ~45 - 60 ms / khung hình (~15 - 20 FPS).</li>
                <li>Dễ debug, code linh hoạt nhưng chưa tận dụng hết sức mạnh phần cứng GPU.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50">
              <span className="font-bold text-cyan-900 block mb-2 uppercase text-[11px]">NVIDIA TensorRT FP16 (Engine Build):</span>
              <ul className="space-y-2 list-disc list-inside text-cyan-950">
                <li><strong>Layer Fusion:</strong> Gộp Conv + Bias + ReLU thành 1 kernel duy nhất, giảm đọc/ghi VRAM.</li>
                <li><strong>FP16 Half-Precision:</strong> Nén trọng số sang 16-bit, nhân đôi tốc độ xử lý phần cứng.</li>
                <li>Độ trễ suy luận giảm xuống: ~15 - 20 ms / khung hình (~45 - 55+ FPS).</li>
                <li>Robot phản xạ nhanh gấp 3 lần ở các khúc cua gắt!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
