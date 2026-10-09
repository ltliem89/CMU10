import React, { useState, useEffect } from 'react';
import { LineChart, Play, Pause, RotateCcw, TrendingDown, TrendingUp, Info, CheckCircle2, Zap } from 'lucide-react';

interface EpochData {
  epoch: number;
  trainLoss: number;
  testLoss: number;
  trainAcc: number;
  testAcc: number;
}

// Generate realistic educational training curve for 30 epochs
const generateEpochsData = (): EpochData[] => {
  const data: EpochData[] = [];
  let trainL = 0.69;
  let testL = 0.70;
  let trainA = 0.52;
  let testA = 0.50;

  for (let i = 1; i <= 30; i++) {
    // Exponential decay with realistic slight noise
    trainL = Math.max(0.08, trainL * 0.91 + (Math.random() * 0.02 - 0.01));
    testL = Math.max(0.12, testL * 0.93 + (Math.random() * 0.025 - 0.01));
    trainA = Math.min(0.98, trainA + (1.0 - trainA) * 0.12 + (Math.random() * 0.01 - 0.005));
    testA = Math.min(0.94, testA + (1.0 - testA) * 0.10 + (Math.random() * 0.015 - 0.007));

    data.push({
      epoch: i,
      trainLoss: parseFloat(trainL.toFixed(4)),
      testLoss: parseFloat(testL.toFixed(4)),
      trainAcc: parseFloat(trainA.toFixed(4)),
      testAcc: parseFloat(testA.toFixed(4))
    });
  }
  return data;
};

const SIMULATED_DATA = generateEpochsData();

export const TrainingChartsView: React.FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<'alexnet' | 'resnet18'>('alexnet');

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentEpoch((prev) => {
        if (prev >= 30) {
          setIsPlaying(false);
          return 30;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const displayedData = SIMULATED_DATA.slice(0, currentEpoch);
  const latest = displayedData[displayedData.length - 1] || SIMULATED_DATA[0];

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Mô Phỏng Đồ Thị Huấn Luyện (Loss &amp; Accuracy Bokeh)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Mô phỏng đồ thị thời gian thực từ <code>train_model_plot.ipynb</code> (Bokeh ColumnDataSource &amp; push_notebook)
              </p>
            </div>
          </div>
        </div>

        {/* Model Toggle with Vibrant STEM Badges */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setSelectedModel('alexnet')}
            className={`px-3.5 py-2 rounded-xl transition ${
              selectedModel === 'alexnet' 
                ? 'bg-orange-600 text-white shadow-md font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            AlexNet (Module 5)
          </button>
          <button
            onClick={() => setSelectedModel('resnet18')}
            className={`px-3.5 py-2 rounded-xl transition ${
              selectedModel === 'resnet18' 
                ? 'bg-purple-600 text-white shadow-md font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ResNet18 (Module 6)
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-[#182442] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (currentEpoch >= 30) setCurrentEpoch(1);
              setIsPlaying(!isPlaying);
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-black flex items-center gap-2 transition shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Tạm Dừng' : 'Chạy Mô Phỏng Epochs'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentEpoch(1);
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" /> Đặt Lại
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-700 dark:text-slate-300 font-bold">Epoch hiện tại:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={currentEpoch}
            onChange={(e) => setCurrentEpoch(parseInt(e.target.value))}
            className="w-36 accent-teal-600 cursor-pointer"
          />
          <span className="font-mono font-black text-teal-700 dark:text-teal-300 px-3 py-1 bg-teal-100 dark:bg-teal-900/60 border border-teal-300 dark:border-teal-700 rounded-xl">
            {currentEpoch} / 30
          </span>
        </div>
      </div>

      {/* Two Bokeh-like interactive charts on high-tech dark background */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Loss */}
        <div className="bg-[#0A101F] text-white p-5 rounded-3xl border-2 border-orange-500/30 shadow-xl">
          <div className="flex justify-between items-center mb-4 text-xs">
            <span className="font-black flex items-center gap-2 text-slate-100">
              <TrendingDown className="w-4 h-4 text-orange-400" /> Đồ Thị Hàm Mất Mát (Loss)
            </span>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-1 bg-cyan-400 inline-block rounded-full"></span> Train: {latest.trainLoss}
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-1 bg-orange-400 inline-block rounded-full"></span> Test: {latest.testLoss}
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-52 w-full relative">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="290" y2="60" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="290" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#334155" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="140" stroke="#334155" strokeWidth="1.5" />

              {/* Axis labels */}
              <text x="10" y="24" fill="#64748B" fontSize="9" fontFamily="monospace">0.8</text>
              <text x="10" y="80" fill="#64748B" fontSize="9" fontFamily="monospace">0.4</text>
              <text x="10" y="142" fill="#64748B" fontSize="9" fontFamily="monospace">0.0</text>
              <text x="280" y="153" fill="#64748B" fontSize="9" fontFamily="monospace">30</text>

              {/* Train Loss Path (Cyan) */}
              {displayedData.length > 1 && (
                <polyline
                  points={displayedData
                    .map((d) => {
                      const x = 30 + (d.epoch / 30) * 260;
                      const y = 140 - (d.trainLoss / 0.8) * 120;
                      return `${x},${Math.max(20, Math.min(140, y))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Test Loss Path (Energy Orange) */}
              {displayedData.length > 1 && (
                <polyline
                  points={displayedData
                    .map((d) => {
                      const x = 30 + (d.epoch / 30) * 260;
                      const y = 140 - (d.testLoss / 0.8) * 120;
                      return `${x},${Math.max(20, Math.min(140, y))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
            <span>Trục hoành: Số Epoch (1 - 30)</span>
            <span>CrossEntropy / MSE Loss</span>
          </div>
        </div>

        {/* Chart 2: Accuracy */}
        <div className="bg-[#0A101F] text-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-xl">
          <div className="flex justify-between items-center mb-4 text-xs">
            <span className="font-black flex items-center gap-2 text-slate-100">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Đồ Thị Độ Chính Xác (Accuracy)
            </span>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-1 bg-cyan-400 inline-block rounded-full"></span> Train: {(latest.trainAcc * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-1 bg-emerald-400 inline-block rounded-full"></span> Test: {(latest.testAcc * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-52 w-full relative">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Grid */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="290" y2="80" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#334155" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="140" stroke="#334155" strokeWidth="1.5" />

              <text x="5" y="24" fill="#64748B" fontSize="9" fontFamily="monospace">100%</text>
              <text x="10" y="82" fill="#64748B" fontSize="9" fontFamily="monospace">50%</text>
              <text x="15" y="142" fill="#64748B" fontSize="9" fontFamily="monospace">0%</text>
              <text x="280" y="153" fill="#64748B" fontSize="9" fontFamily="monospace">30</text>

              {/* Train Acc Path (Cyan) */}
              {displayedData.length > 1 && (
                <polyline
                  points={displayedData
                    .map((d) => {
                      const x = 30 + (d.epoch / 30) * 260;
                      const y = 140 - (d.trainAcc / 1.0) * 120;
                      return `${x},${Math.max(20, Math.min(140, y))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Test Acc Path (Emerald Green) */}
              {displayedData.length > 1 && (
                <polyline
                  points={displayedData
                    .map((d) => {
                      const x = 30 + (d.epoch / 30) * 260;
                      const y = 140 - (d.testAcc / 1.0) * 120;
                      return `${x},${Math.max(20, Math.min(140, y))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
            <span>Trục hoành: Số Epoch (1 - 30)</span>
            <span>Tỷ lệ phân loại đúng (0.0 - 1.0)</span>
          </div>
        </div>
      </div>

      {/* Pedagogical Analysis Cards */}
      <div className="bg-slate-50 dark:bg-[#182442] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Info className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          Bài Học Sư Phạm STEM: Nguyên Lý Đọc Đồ Thị Huấn Luyện AI
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-white dark:bg-[#131E36] rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="font-black text-emerald-600 dark:text-emerald-400 block mb-1">1. Hội tụ chuẩn (Good Fit):</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Cả Train Loss và Test Loss cùng giảm đều; Accuracy vượt &gt;90%. Mô hình nắm bắt được đặc trưng thị giác cốt lõi của đường đua.
            </p>
          </div>
          <div className="p-3.5 bg-white dark:bg-[#131E36] rounded-2xl border border-orange-200 dark:border-orange-800/60 shadow-2xs">
            <span className="font-black text-orange-600 dark:text-orange-400 block mb-1">2. Quá khớp (Overfitting):</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Train Loss giảm rất thấp nhưng Test Loss bắt đầu ngóc lên; mô hình chỉ ghi nhớ vẹt ảnh đã học, kém khả năng tổng quát.
            </p>
          </div>
          <div className="p-3.5 bg-white dark:bg-[#131E36] rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-2xs">
            <span className="font-black text-purple-600 dark:text-purple-400 block mb-1">3. Lưu Checkpoint:</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Notebook sử dụng logic <code>if test_acc &gt; best_acc: torch.save(...)</code> nhằm lưu đúng thời điểm vàng mô hình đạt phong độ cao nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
