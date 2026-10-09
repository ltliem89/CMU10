import React, { useState } from 'react';
import { Sliders, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw, Layers, Award, Sparkles } from 'lucide-react';

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
        status: 'Dao động lắc lư hình sin (Oscillation)',
        color: 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700',
        desc: 'Độ lợi tỷ lệ Kp quá cao trong khi Kd = 0 khiến JetBot bẻ lái quá đà (over-correct), xe sẽ bị lắc lư hình sin qua lại liên tục giữa hai bên vạch kẻ đường.'
      };
    }
    if (steeringGain < 0.08) {
      return {
        status: 'Phản ứng chậm chạp (Sluggish)',
        color: 'text-pink-800 dark:text-pink-200 bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-700',
        desc: 'Kp quá nhỏ làm góc lái sinh ra không đủ lớn khi vào cua. Robot sẽ trượt ra khỏi đường đua ở những khúc cua ngoặt.'
      };
    }
    if (Math.abs(steeringBias) > 0.15) {
      return {
        status: 'Bị lệch một bên (Motor/Camera Drift)',
        color: 'text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700',
        desc: `Độ lệch bias = ${steeringBias > 0 ? '+' : ''}${steeringBias} làm xe luôn có xu hướng tạt sang ${steeringBias > 0 ? 'phải' : 'trái'}, chỉ nên dùng khi động cơ thực tế bị lệch cơ khí.`
      };
    }
    return {
      status: 'Bám đường mượt mà (Smooth Tracking)',
      color: 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700',
      desc: 'Bộ thông số cân bằng lý tưởng (Kp ≈ 0.15-0.25, Kd ≈ 0.02-0.08). Lực hãm vi phân triệt tiêu dao động, xe bám tâm đường rất êm.'
    };
  };

  const pdEval = getPDEvaluation();

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Phòng Thí Nghiệm &quot;Nếu Thay Đổi Giá Trị Thì Sao?&quot; (What-If Lab)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Thử nghiệm can thiệp tham số thuật toán để phân tích tác động trực tiếp lên hành vi xe
              </p>
            </div>
          </div>
        </div>
        <span className="self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-300 border border-pink-300">
          Sáng tạo STEM
        </span>
      </div>

      {/* Tabs with Vibrant STEM Accents */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveExp('pd')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeExp === 'pd' 
              ? 'bg-blue-600 text-white shadow-md font-black' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          1. Tinh chỉnh bộ điều khiển PD (Kp, Kd, Bias)
        </button>
        <button
          onClick={() => setActiveExp('hflip')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeExp === 'hflip' 
              ? 'bg-amber-500 text-black shadow-md font-black' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          2. Lật ngang ảnh: Có đảo dấu x = -x hay không?
        </button>
        <button
          onClick={() => setActiveExp('model_arch')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeExp === 'model_arch' 
              ? 'bg-purple-600 text-white shadow-md font-black' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          3. So sánh AlexNet vs ResNet18
        </button>
        <button
          onClick={() => setActiveExp('precision')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeExp === 'precision' 
              ? 'bg-orange-600 text-white shadow-md font-black' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          4. PyTorch FP32 vs TensorRT FP16
        </button>
      </div>

      {/* Experiment 1: PD Gain */}
      {activeExp === 'pd' && (
        <div className="space-y-6">
          <div className="bg-blue-50/80 dark:bg-blue-950/40 p-4.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-200 block mb-1 uppercase tracking-wide">
              Công thức điều khiển vi sai trong live_demo.ipynb:
            </span>
            <code className="text-blue-800 dark:text-blue-300 font-mono block leading-relaxed">
              angle = np.arctan2(x, y)
              <br />
              pid = angle * steering_gain + (angle - angle_last) * steering_kd
              <br />
              steering = pid + steering_bias
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Steering Gain */}
            <div className="p-4 bg-white dark:bg-[#182442] rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xs">
              <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-800 dark:text-slate-200">
                <span>steering_gain (Kp):</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-black text-sm">{steeringGain.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.02"
                value={steeringGain}
                onChange={(e) => setSteeringGain(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Độ nhạy phản ứng bẻ lái theo góc lệch.</p>
            </div>

            {/* Steering Kd */}
            <div className="p-4 bg-white dark:bg-[#182442] rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-xs">
              <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-800 dark:text-slate-200">
                <span>steering_kd (Kd):</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-black text-sm">{steeringKd.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.2"
                step="0.005"
                value={steeringKd}
                onChange={(e) => setSteeringKd(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Lực hãm vi phân triệt tiêu rung lắc hình sin.</p>
            </div>

            {/* Steering Bias */}
            <div className="p-4 bg-white dark:bg-[#182442] rounded-2xl border-2 border-orange-200 dark:border-orange-800 shadow-xs">
              <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-800 dark:text-slate-200">
                <span>steering_bias:</span>
                <span className="font-mono text-orange-600 dark:text-orange-400 font-black text-sm">
                  {steeringBias > 0 ? `+${steeringBias.toFixed(2)}` : steeringBias.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.02"
                value={steeringBias}
                onChange={(e) => setSteeringBias(parseFloat(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Bù trừ độ lệch cơ khí bánh hoặc góc lắp camera.</p>
            </div>
          </div>

          {/* Diagnostic Evaluation Card */}
          <div className={`p-4.5 rounded-2xl border-2 text-xs sm:text-sm ${pdEval.color} shadow-xs`}>
            <div className="font-black text-base mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Chẩn Đoán Động Học: {pdEval.status}</span>
            </div>
            <p className="leading-relaxed opacity-95 font-medium">{pdEval.desc}</p>
          </div>
        </div>
      )}

      {/* Experiment 2: Data Augmentation HFlip */}
      {activeExp === 'hflip' && (
        <div className="space-y-4">
          <div className="p-4.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs">
            <h4 className="font-black text-amber-900 dark:text-amber-200 mb-1 text-sm">
              Cạm bẫy kinh điển trong XYDataset (train_model.ipynb):
            </h4>
            <p className="text-amber-950/90 dark:text-amber-300 leading-relaxed font-medium">
              Khi thực hiện tăng cường dữ liệu bằng lật ngang ảnh (Horizontal Flip), hướng cua của con đường bị đảo ngược
              (rẽ phải biến thành rẽ trái). Nếu không đảo dấu tọa độ mục tiêu <code>x = -x</code>, điều gì sẽ xảy ra?
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#182442] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={invertLabelX}
                onChange={(e) => setInvertLabelX(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
              Bật logic đảo dấu nhãn tọa độ: <code>x = -x</code> khi lật ảnh
            </label>
          </div>

          <div className={`p-4.5 rounded-2xl border-2 text-xs sm:text-sm ${
            invertLabelX 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
          }`}>
            {invertLabelX ? (
              <div>
                <span className="font-black text-base block mb-1">✓ ĐÚNG CHUẨN: Dữ liệu huấn luyện nhất quán ngữ nghĩa!</span>
                Ảnh bị lật sang trái và nhãn x cũng mang dấu âm tương ứng. Robot học được cả hai chiều rẽ đối xứng, tăng gấp đôi độ đa dạng của tập huấn luyện.
              </div>
            ) : (
              <div>
                <span className="font-black text-base block mb-1">✗ LỖI NGUY HIỂM: Mâu thuẫn nhãn (Contradictory Labels)!</span>
                Ảnh hiển thị khúc cua rẽ trái nhưng nhãn tọa độ x vẫn mang giá trị dương (rẽ phải). Khi chạy thực tế gặp khúc cua sẽ đánh lái ngược chiều và lao vào tường!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experiment 3: AlexNet vs ResNet18 */}
      {activeExp === 'model_arch' && (
        <div className="space-y-4 text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Tiêu chí so sánh</th>
                  <th className="p-3.5 text-orange-600 dark:text-orange-400">AlexNet (Module 5)</th>
                  <th className="p-3.5 text-purple-600 dark:text-purple-400">ResNet18 (Module 6)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold">Năm ra đời &amp; Ý tưởng</td>
                  <td className="p-3.5">2012 (Kiến trúc Conv cổ điển sâu 8 tầng)</td>
                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400">2015 (Residual Skip Connections giải quyết tiêu biến gradient)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Số lượng tham số (Parameters)</td>
                  <td className="p-3.5">~61 triệu tham số (FC lớp cuối rất nặng)</td>
                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400">~11.7 triệu tham số (nhẹ hơn ~5 lần)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Lớp thay thế cho 2 đầu ra</td>
                  <td className="p-3.5 font-mono">model.classifier[6] = Linear(in, 2)</td>
                  <td className="p-3.5 font-mono text-purple-600 dark:text-purple-400 font-bold">model.fc = Linear(512, 2)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Hiệu năng trên Jetson Nano</td>
                  <td className="p-3.5">Tốn nhiều VRAM, tốc độ suy luận vừa phải</td>
                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400">Tối ưu vượt trội khi kết hợp FP16 và TensorRT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Experiment 4: PyTorch vs TensorRT */}
      {activeExp === 'precision' && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182442]">
              <span className="font-black text-slate-900 dark:text-white block mb-2 uppercase text-xs">
                PyTorch FP32 / FP16 Tiêu Chuẩn:
              </span>
              <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                <li>Tính toán từng lớp tuần tự (Conv $\rightarrow$ BatchNorm $\rightarrow$ ReLU).</li>
                <li>Độ trễ suy luận trên Jetson Nano: ~45 - 60 ms / khung hình (~15 - 20 FPS).</li>
                <li>Dễ debug, code linh hoạt nhưng chưa tận dụng hết năng lực đồ họa GPU.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border-2 border-orange-300 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-950/40">
              <span className="font-black text-orange-900 dark:text-orange-300 block mb-2 uppercase text-xs">
                NVIDIA TensorRT FP16 (Engine Build):
              </span>
              <ul className="space-y-2 list-disc list-inside text-orange-950 dark:text-orange-200 leading-relaxed font-medium">
                <li><strong>Layer Fusion:</strong> Gộp Conv + Bias + ReLU thành 1 CUDA kernel duy nhất, giảm triệt để truy xuất VRAM.</li>
                <li><strong>FP16 Half-Precision:</strong> Nén trọng số sang 16-bit, nhân đôi thông lượng xử lý tensor.</li>
                <li>Độ trễ suy luận giảm ngoạn mục xuống: ~15 - 20 ms (~45 - 55+ FPS).</li>
                <li>Robot phản xạ bẻ lái nhanh gấp 3 lần tại các góc cua gắt!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
