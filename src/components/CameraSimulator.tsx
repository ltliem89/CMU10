import React, { useState } from 'react';
import { Camera, Target, AlertCircle, CheckCircle, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';

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
    nameVi: 'Vật cản khối LEGO chắn đường',
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
  const [isSimulatingInference, setIsSimulatingInference] = useState<boolean>(true);

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            Khung Nhìn Camera Mô Phỏng (JetBot CSI 224×224)
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            bgr8_to_jpeg
          </span>
        </div>

        {/* Scene Selector */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium mr-1 hidden sm:inline">Cảnh:</span>
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(scene)}
              className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                selectedScene.id === scene.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {scene.nameVi}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: 224x224 Camera Canvas */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-[240px] h-[240px] bg-slate-900 rounded-xl overflow-hidden shadow-md border-2 border-slate-700">
            {/* Simulated Track Video Scene (SVG Visual Render) */}
            <svg
              viewBox="0 0 224 224"
              className="w-full h-full cursor-crosshair select-none"
              onClick={handleCanvasClick}
            >
              {/* Floor background */}
              <rect width="224" height="224" fill="#1e293b" />

              {/* Road Rendering based on selectedScene */}
              {selectedScene.id === 'straight' && (
                <g>
                  {/* Road surface */}
                  <polygon points="30,224 85,60 139,60 194,224" fill="#334155" />
                  {/* Center dashed line */}
                  <line x1="112" y1="224" x2="112" y2="60" stroke="#facc15" strokeWidth="4" strokeDasharray="8 6" />
                  {/* Horizon */}
                  <line x1="0" y1="60" x2="224" y2="60" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              )}

              {selectedScene.id === 'curve_right' && (
                <g>
                  <path d="M 30,224 Q 90,140 180,90 L 195,95 Q 110,150 194,224 Z" fill="#334155" />
                  <path d="M 112,224 Q 120,150 190,92" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="8 6" />
                </g>
              )}

              {selectedScene.id === 'curve_left' && (
                <g>
                  <path d="M 194,224 Q 134,140 44,90 L 29,95 Q 114,150 30,224 Z" fill="#334155" />
                  <path d="M 112,224 Q 104,150 34,92" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="8 6" />
                </g>
              )}

              {selectedScene.id === 'blocked_lego' && (
                <g>
                  <polygon points="30,224 85,60 139,60 194,224" fill="#334155" />
                  {/* LEGO Block Obstacle right in front */}
                  <rect x="75" y="110" width="74" height="50" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="90" cy="118" r="5" fill="#ef4444" />
                  <circle cx="112" cy="118" r="5" fill="#ef4444" />
                  <circle cx="134" cy="118" r="5" fill="#ef4444" />
                  <circle cx="90" cy="140" r="5" fill="#ef4444" />
                  <circle cx="112" cy="140" r="5" fill="#ef4444" />
                  <circle cx="134" cy="140" r="5" fill="#ef4444" />
                </g>
              )}

              {selectedScene.id === 'blocked_box' && (
                <g>
                  <polygon points="30,224 85,60 139,60 194,224" fill="#334155" />
                  {/* Heavy cardboard box */}
                  <rect x="62" y="100" width="100" height="70" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                  <line x1="62" y1="135" x2="162" y2="135" stroke="#92400e" strokeWidth="2" />
                </g>
              )}

              {/* Mode-specific Overlays */}
              {mode !== 'classification' && (
                <g>
                  {/* Base point at bottom center (cv2.circle đỏ) */}
                  <circle cx="112" cy="224" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Guidance Line (cv2.line xanh dương) */}
                  <line
                    x1="112"
                    y1="224"
                    x2={targetPoint.x}
                    y2={targetPoint.y}
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Annotated Target Dot (cv2.circle xanh lá) */}
                  <circle
                    cx={targetPoint.x}
                    cy={targetPoint.y}
                    r="7"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Crosshair guide */}
                  <line x1={targetPoint.x - 12} y1={targetPoint.y} x2={targetPoint.x + 12} y2={targetPoint.y} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={targetPoint.x} y1={targetPoint.y - 12} x2={targetPoint.x} y2={targetPoint.y + 12} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              )}

              {/* Resolution Tag */}
              <text x="6" y="16" fill="#94a3b8" fontSize="10" fontFamily="monospace">224x224</text>
            </svg>

            {/* Click instruction banner */}
            <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-sans">
                Nhấp chuột lên ảnh để di chuyển chấm xanh (Target)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Formula & Action Panel */}
        <div className="md:col-span-6 space-y-3">
          {/* Coordinates & Naming Formula */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-semibold text-slate-900">Tọa độ Pixel (Ảnh):</span>
              <span className="font-bold text-indigo-700">X = {targetPoint.x}px, Y = {targetPoint.y}px</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-semibold text-slate-900">Chuẩn hóa [-1.0, 1.0]:</span>
              <span className="font-bold text-emerald-700">norm_x = {normX}, norm_y = {normY}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans font-semibold text-slate-900">Góc lái ước tính:</span>
              <span className="font-bold text-blue-700">θ = {calcSteeringAngle()}°</span>
            </div>
          </div>

          {/* Classification Probabilities (For Collision Avoidance) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800">Dự đoán Softmax (Tránh va chạm):</span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                selectedScene.defaultProbBlocked >= 0.5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                prob_blocked = {(selectedScene.defaultProbBlocked * 100).toFixed(0)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(1 - selectedScene.defaultProbBlocked) * 100}%` }}
                title="Free"
              />
              <div
                className="bg-rose-500 h-full transition-all"
                style={{ width: `${selectedScene.defaultProbBlocked * 100}%` }}
                title="Blocked"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Đường thoáng (free): {((1 - selectedScene.defaultProbBlocked) * 100).toFixed(0)}%</span>
              <span>Bị cản (blocked): {(selectedScene.defaultProbBlocked * 100).toFixed(0)}%</span>
            </div>

            <div className="mt-2 text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <span>Hành vi điều khiển:</span>
              {selectedScene.defaultProbBlocked < 0.5 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> robot.forward(speed)
                </span>
              ) : (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> robot.left(speed) [Bẻ lái tránh cản]
                </span>
              )}
            </div>
          </div>

          {/* Action Button: Save Snapshot to Dataset */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={handleSaveSnapshot}
              className="w-full sm:w-auto flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <ImageIcon className="w-4 h-4" />
              Lưu Mẫu Snapshot Vào dataset_xy/
            </button>
            <div className="text-[11px] text-slate-500 font-mono">
              Tổng mẫu: <span className="font-bold text-slate-800">{savedCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
            <span className="font-semibold text-slate-700">Tên file sinh ra: </span>
            <code className="text-indigo-600 font-mono">{lastSavedFilename}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
