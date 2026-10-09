import React, { useState } from 'react';
import { LineChart, Play, RotateCcw, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, Info } from 'lucide-react';

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
    // Exponential decay with slight noise
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
  React.useEffect(() => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Mô Phỏng Trực Quan Đồ Thị Huấn Luyện (Loss &amp; Accuracy Bokeh)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng đồ thị trực tiếp thời gian thực từ <code>train_model_plot.ipynb</code> (Bokeh ColumnDataSource &amp; push_notebook)
          </p>
        </div>

        {/* Model Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedModel('alexnet')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedModel === 'alexnet' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            AlexNet (Module 5)
          </button>
          <button
            onClick={() => setSelectedModel('resnet18')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedModel === 'resnet18' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ResNet18 (Module 6)
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentEpoch >= 30) setCurrentEpoch(1);
              setIsPlaying(!isPlaying);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Play className="w-3.5 h-3.5" />
            {isPlaying ? 'Tạm Dừng' : 'Chạy Mô Phỏng Epochs'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentEpoch(1);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-medium">Epoch hiện tại:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={currentEpoch}
            onChange={(e) => setCurrentEpoch(parseInt(e.target.value))}
            className="w-32 accent-indigo-600 cursor-pointer"
          />
          <span className="font-mono font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded">
            {currentEpoch} / 30
          </span>
        </div>
      </div>

      {/* Two Bokeh-like interactive charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Loss */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center mb-3 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <TrendingDown className="w-4 h-4 text-amber-400" /> Đồ Thị Hàm Mất Mát (Loss)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-sky-400 font-mono">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Train Loss: {latest.trainLoss}
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> Test Loss: {latest.testLoss}
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-48 w-full relative">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="60" x2="290" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="100" x2="290" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="20" x2="30" y2="140" stroke="#475569" strokeWidth="1" />

              {/* Axis labels */}
              <text x="10" y="24" fill="#94a3b8" fontSize="8" fontFamily="monospace">0.8</text>
              <text x="10" y="80" fill="#94a3b8" fontSize="8" fontFamily="monospace">0.4</text>
              <text x="10" y="142" fill="#94a3b8" fontSize="8" fontFamily="monospace">0.0</text>
              <text x="280" y="152" fill="#94a3b8" fontSize="8" fontFamily="monospace">30</text>

              {/* Train Loss Path (Sky blue) */}
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
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Test Loss Path (Amber) */}
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
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Trục hoành: Số Epoch (1-30)</span>
            <span>Hàm mất mát Cross-Entropy / MSE</span>
          </div>
        </div>

        {/* Chart 2: Accuracy */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center mb-3 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Đồ Thị Độ Chính Xác (Accuracy)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-sky-400 font-mono">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Train Acc: {(latest.trainAcc * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span> Test Acc: {(latest.testAcc * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-48 w-full relative">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Grid */}
              <line x1="30" y1="20" x2="290" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="80" x2="290" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="140" x2="290" y2="140" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="20" x2="30" y2="140" stroke="#475569" strokeWidth="1" />

              <text x="5" y="24" fill="#94a3b8" fontSize="8" fontFamily="monospace">100%</text>
              <text x="10" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace">50%</text>
              <text x="15" y="142" fill="#94a3b8" fontSize="8" fontFamily="monospace">0%</text>
              <text x="280" y="152" fill="#94a3b8" fontSize="8" fontFamily="monospace">30</text>

              {/* Train Acc Path */}
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
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Test Acc Path (Emerald) */}
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
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Trục hoành: Số Epoch (1-30)</span>
            <span>Tỷ lệ phân loại đúng (0.0 - 1.0)</span>
          </div>
        </div>
      </div>

      {/* Pedagogical Analysis Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600" />
          Bài Học Sư Phạm: Cách Đọc Biểu Đồ Huấn Luyện AI
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">1. Hội tụ tốt (Good Fit):</span>
            Loss của cả tập Train và Test đều giảm dần và ổn định. Accuracy đạt trên 90% phản ánh mô hình đã học được các đặc trưng thị giác cốt lõi.
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-amber-700 block mb-1">2. Quá khớp (Overfitting):</span>
            Khi Train Loss tiếp tục giảm sâu nhưng Test Loss bắt đầu đi ngang hoặc tăng vọt; lúc này mô hình chỉ học thuộc vẹt ảnh chụp trong phòng thí nghiệm.
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-indigo-700 block mb-1">3. Lưu Checkpoint tốt nhất:</span>
            Trong notebook: <code>if test_accuracy &gt; best_accuracy: torch.save(...)</code> chỉ lưu lại thời điểm mô hình tổng quát tốt nhất trên tập kiểm tra.
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center font-mono italic">
        * Lưu ý: Biểu đồ được mô phỏng toán học cho mục đích giảng dạy STEM, phản ánh đúng xu hướng hội tụ thực nghiệm của AlexNet/ResNet18.
      </div>
    </div>
  );
};
