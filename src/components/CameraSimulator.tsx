import React, { useState } from 'react';
import { Camera, Target, AlertCircle, CheckCircle, Image as ImageIcon, Sparkles, Sliders, Check } from 'lucide-react';

interface CameraSimulatorProps {
  mode?: 'annotation' | 'classification' | 'inference';
  onAnnotate?: (x: number, y: number) => void;
  onSnapshotSaved?: (sample: { id: string; x: number; y: number; filename: string; scene: string }) => void;
}

export type SceneId = 'straight' | 'curve_right' | 'curve_left' | 'blocked_lego' | 'blocked_box';

interface SceneConfig {
  id: SceneId;
  nameVi: string;
  category: 'free' | 'blocked';
  recommendedTarget: { x: number; y: number }; // In pixel coordinates 224x224
  defaultProbBlocked: number;
}

const SCENES: SceneConfig[] = [
  {
    id: 'straight',
    nameVi: 'Đường thẳng thoáng đãng',
    category: 'free',
    recommendedTarget: { x: 112, y: 70 },
    defaultProbBlocked: 0.05
  },
  {
    id: 'curve_right',
    nameVi: 'Khúc cua ngoặt sang phải',
    category: 'free',
    recommendedTarget: { x: 165, y: 95 },
    defaultProbBlocked: 0.12
  },
  {
    id: 'curve_left',
    nameVi: 'Khúc cua ngoặt sang trái',
    category: 'free',
    recommendedTarget: { x: 58, y: 95 },
    defaultProbBlocked: 0.14
  },
  {
    id: 'blocked_lego',
    nameVi: 'Vật cản LEGO chắn đường',
    category: 'blocked',
    recommendedTarget: { x: 80, y: 150 },
    defaultProbBlocked: 0.89
  },
  {
    id: 'blocked_box',
    nameVi: 'Hộp đồ chơi sát cản trước',
    category: 'blocked',
    recommendedTarget: { x: 50, y: 160 },
    defaultProbBlocked: 0.95
  }
];

export const CameraSimulator: React.FC<CameraSimulatorProps> = ({
  mode = 'annotation',
  onAnnotate,
  onSnapshotSaved
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneConfig>(SCENES[0]);
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number }>(SCENES[0].recommendedTarget);
  const [savedCount, setSavedCount] = useState<number>(12);
  const [lastSavedFilename, setLastSavedFilename] = useState<string>('xy_112_070_e847c21.jpg');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Handle scene change
  const handleSelectScene = (scene: SceneConfig) => {
    setSelectedScene(scene);
    setTargetPoint(scene.recommendedTarget);
  };

  // Click on camera canvas to annotate target point
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 224);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 224);

    const clampedX = Math.max(0, Math.min(224, clickX));
    const clampedY = Math.max(0, Math.min(224, clickY));

    setTargetPoint({ x: clampedX, y: clampedY });
    if (onAnnotate) onAnnotate(clampedX, clampedY);
  };

  // Normalized coordinates for training formula
  const normX = ((targetPoint.x - 112) / 112).toFixed(3);
  const normY = ((targetPoint.y - 112) / 112).toFixed(3);

  // Save sample snapshot
  const handleSaveSnapshot = () => {
    const randomHex = Math.random().toString(16).substring(2, 9);
    const filename = `xy_${String(targetPoint.x).padStart(3, '0')}_${String(targetPoint.y).padStart(3, '0')}_${randomHex}.jpg`;
    setLastSavedFilename(filename);
    setSavedCount((prev) => prev + 1);

    if (onSnapshotSaved) {
      onSnapshotSaved({
        id: randomHex,
        x: targetPoint.x,
        y: targetPoint.y,
        filename,
        scene: selectedScene.nameVi
      });
    }
  };

  // Steering angle calculation: np.arctan2(x, y)
  const calcSteeringAngle = () => {
    const x = parseFloat(normX);
    const y = (0.5 - parseFloat(normY)) / 2.0;
    const angleRad = Math.atan2(x, y);
    return ((angleRad * 180) / Math.PI).toFixed(1);
  };

  return (
    <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Sensor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Cảm Biến Thị Giác CSI Camera (224×224 px)
            </h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold font-mono">
              Định dạng: BGR8 → JPEG (bgr8_to_jpeg)
            </span>
          </div>
        </div>

        {/* Scene Selector with Vibrant STEM Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <span className="text-slate-400 dark:text-slate-500 font-bold mr-1 hidden sm:inline">Cảnh:</span>
          {SCENES.map((scene) => {
            const isFree = scene.category === 'free';
            const isSelected = selectedScene.id === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => handleSelectScene(scene)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  isSelected
                    ? isFree
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-pink-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {scene.nameVi}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: 224x224 Camera Canvas Styled as Scientific Lens HUD */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-[240px] h-[240px] bg-[#0A101F] rounded-2xl overflow-hidden shadow-xl border-2 border-teal-500/50">
            {/* Simulated Track Video Scene (SVG Visual Render) */}
            <svg
              viewBox="0 0 224 224"
              className="w-full h-full cursor-crosshair select-none"
              onClick={handleCanvasClick}
            >
              {/* Floor background */}
              <rect width="224" height="224" fill="#0B1329" />

              {/* Perspective grid floor */}
              <line x1="0" y1="112" x2="224" y2="112" stroke="#1E293B" strokeWidth="0.8" />
              <line x1="0" y1="160" x2="224" y2="160" stroke="#1E293B" strokeWidth="1" />
              <line x1="0" y1="200" x2="224" y2="200" stroke="#1E293B" strokeWidth="1.2" />

              {/* Scene 1: Straight road */}
              {selectedScene.id === 'straight' && (
                <g>
                  {/* Road asphalt */}
                  <polygon points="80,50 144,50 200,224 24,224" fill="#1E293B" />
                  {/* Road border edges */}
                  <line x1="80" y1="50" x2="24" y2="224" stroke="#64748B" strokeWidth="3" />
                  <line x1="144" y1="50" x2="200" y2="224" stroke="#64748B" strokeWidth="3" />
                  {/* Dashed center line */}
                  <line x1="112" y1="50" x2="112" y2="224" stroke="#FACC15" strokeWidth="3" strokeDasharray="14 10" />
                </g>
              )}

              {/* Scene 2: Right curve */}
              {selectedScene.id === 'curve_right' && (
                <g>
                  <path d="M 60,224 Q 100,120 180,60 L 220,60 Q 150,140 200,224 Z" fill="#1E293B" />
                  <path d="M 60,224 Q 100,120 180,60" stroke="#64748B" strokeWidth="3" fill="none" />
                  <path d="M 200,224 Q 150,140 220,60" stroke="#64748B" strokeWidth="3" fill="none" />
                  <path d="M 130,224 Q 125,130 200,60" stroke="#FACC15" strokeWidth="3" strokeDasharray="14 10" fill="none" />
                </g>
              )}

              {/* Scene 3: Left curve */}
              {selectedScene.id === 'curve_left' && (
                <g>
                  <path d="M 164,224 Q 124,120 44,60 L 4,60 Q 74,140 24,224 Z" fill="#1E293B" />
                  <path d="M 164,224 Q 124,120 44,60" stroke="#64748B" strokeWidth="3" fill="none" />
                  <path d="M 24,224 Q 74,140 4,60" stroke="#64748B" strokeWidth="3" fill="none" />
                  <path d="M 94,224 Q 99,130 24,60" stroke="#FACC15" strokeWidth="3" strokeDasharray="14 10" fill="none" />
                </g>
              )}

              {/* Scene 4: Obstacle Lego Blocks */}
              {selectedScene.id === 'blocked_lego' && (
                <g>
                  <polygon points="80,50 144,50 200,224 24,224" fill="#1E293B" />
                  <line x1="80" y1="50" x2="24" y2="224" stroke="#64748B" strokeWidth="3" />
                  <line x1="144" y1="50" x2="200" y2="224" stroke="#64748B" strokeWidth="3" />
                  {/* Lego Obstacle */}
                  <rect x="75" y="115" width="74" height="48" rx="4" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                  <circle cx="88" cy="115" r="4" fill="#DC2626" />
                  <circle cx="104" cy="115" r="4" fill="#DC2626" />
                  <circle cx="120" cy="115" r="4" fill="#DC2626" />
                  <circle cx="136" cy="115" r="4" fill="#DC2626" />
                  <text x="112" y="145" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">BLOCKED</text>
                </g>
              )}

              {/* Scene 5: Obstacle Toy Box */}
              {selectedScene.id === 'blocked_box' && (
                <g>
                  <polygon points="80,50 144,50 200,224 24,224" fill="#1E293B" />
                  <line x1="80" y1="50" x2="24" y2="224" stroke="#64748B" strokeWidth="3" />
                  <line x1="144" y1="50" x2="200" y2="224" stroke="#64748B" strokeWidth="3" />
                  {/* Cardboard Box Obstacle close to camera */}
                  <polygon points="50,110 174,110 164,195 60,195" fill="#D97706" stroke="#92400E" strokeWidth="2" />
                  <text x="112" y="160" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">VẬT CẢN GẦN</text>
                </g>
              )}

              {/* HUD Target crosshair and vector guide */}
              <line x1="112" y1="224" x2={targetPoint.x} y2={targetPoint.y} stroke="#06B6D4" strokeWidth="2.5" strokeDasharray="3 2" />
              <circle cx="112" cy="224" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Annotated Target circle (cv2.circle green dot) */}
              <circle cx={targetPoint.x} cy={targetPoint.y} r="9" fill="rgba(34, 197, 94, 0.4)" stroke="#22C55E" strokeWidth="2.5" />
              <circle cx={targetPoint.x} cy={targetPoint.y} r="3" fill="#22C55E" />
            </svg>

            {/* Scientific HUD Overlay details */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
              LIVE 224×224
            </div>

            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/80 backdrop-blur-xs text-yellow-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-yellow-500/30">
                Nhấp chuột lên ảnh để gán nhãn chấm xanh (Target X/Y)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Formula & Action Panel */}
        <div className="md:col-span-6 space-y-3.5">
          {/* Coordinates & Naming Formula */}
          <div className="bg-slate-50 dark:bg-[#182442] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm space-y-2 font-mono shadow-xs">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="font-sans font-bold text-slate-900 dark:text-white">Tọa độ Pixel (Ảnh):</span>
              <span className="font-black text-blue-600 dark:text-blue-400">X = {targetPoint.x}px, Y = {targetPoint.y}px</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="font-sans font-bold text-slate-900 dark:text-white">Chuẩn hóa [-1.0, 1.0]:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">norm_x = {normX}, norm_y = {normY}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="font-sans font-bold text-slate-900 dark:text-white">Góc bẻ lái ước tính:</span>
              <span className="font-black text-amber-500 dark:text-amber-400">θ = arctan2(x,y) = {calcSteeringAngle()}°</span>
            </div>
          </div>

          {/* Classification Probabilities (For Collision Avoidance) */}
          <div className="bg-slate-50 dark:bg-[#182442] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-bold text-slate-900 dark:text-white">Xác suất Softmax (Tránh va chạm):</span>
              <span className={`font-mono font-black px-2.5 py-0.5 rounded-lg text-xs ${
                selectedScene.defaultProbBlocked >= 0.5 
                  ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200 border border-pink-300' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
              }`}>
                prob_blocked = {(selectedScene.defaultProbBlocked * 100).toFixed(0)}%
              </span>
            </div>

            {/* High contrast progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(1 - selectedScene.defaultProbBlocked) * 100}%` }}
                title="Free"
              />
              <div
                className="bg-pink-500 h-full transition-all"
                style={{ width: `${selectedScene.defaultProbBlocked * 100}%` }}
                title="Blocked"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">Đường thoáng (free): {((1 - selectedScene.defaultProbBlocked) * 100).toFixed(0)}%</span>
              <span className="text-pink-600 dark:text-pink-400">Vật cản (blocked): {(selectedScene.defaultProbBlocked * 100).toFixed(0)}%</span>
            </div>

            <div className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Hành vi điều khiển:</span>
              {selectedScene.defaultProbBlocked < 0.5 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> robot.forward(speed) [Tiến thẳng]
                </span>
              ) : (
                <span className="text-pink-600 dark:text-pink-400 font-black flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> robot.left(speed) [Bẻ lái né chướng ngại]
                </span>
              )}
            </div>
          </div>

          {/* Action Button: Save Snapshot to Dataset */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={handleSaveSnapshot}
              className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition stem-card-interactive"
            >
              <ImageIcon className="w-4.5 h-4.5" />
              Lưu Mẫu Snapshot Vào dataset_xy/
            </button>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Tổng mẫu: <strong className="text-slate-900 dark:text-white text-sm">{savedCount}</strong>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-[#182442] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Tên file sinh ra: </span>
            <code className="text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">{lastSavedFilename}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
