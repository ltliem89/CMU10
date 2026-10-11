import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export type CameraGalleryView = 'overview' | 'follow' | 'close' | 'topdown';

interface CameraViewGalleryProps {
  activeView?: CameraGalleryView;
  onSelectView?: (view: CameraGalleryView) => void;
}

export const CameraViewGallery: React.FC<CameraViewGalleryProps> = ({
  activeView: externalActiveView,
  onSelectView
}) => {
  const [internalActiveView, setInternalActiveView] = useState<CameraGalleryView>('overview');
  const active = externalActiveView || internalActiveView;

  const handleSelect = (view: CameraGalleryView) => {
    setInternalActiveView(view);
    if (onSelectView) onSelectView(view);
  };

  const views: { id: CameraGalleryView; label: string; bgGradient: string; iconLabel: string }[] = [
    {
      id: 'overview',
      label: 'Toàn cảnh',
      bgGradient: 'from-blue-900 via-indigo-950 to-slate-900',
      iconLabel: '🏔️ Cảnh quan sa bàn'
    },
    {
      id: 'follow',
      label: 'Theo xe',
      bgGradient: 'from-slate-900 via-cyan-950 to-blue-950',
      iconLabel: '🚗 Bám sau xe'
    },
    {
      id: 'close',
      label: 'Góc gần',
      bgGradient: 'from-amber-950 via-slate-900 to-indigo-950',
      iconLabel: '🔍 Bánh xe & Khung'
    },
    {
      id: 'topdown',
      label: 'Trên cao (2D)',
      bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
      iconLabel: '🗺️ Sa bàn phẳng'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#D6E3F2] shadow-xs p-3.5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#6828D9] flex items-center justify-center">
          <Camera className="w-4 h-4" />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#102B52]">
          Góc quan sát khác
        </h3>
      </div>

      {/* 2x2 Grid of Camera Cards */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {views.map((v) => {
          const isSelected = active === v.id;
          return (
            <button
              key={v.id}
              onClick={() => handleSelect(v.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 flex flex-col text-left group ${
                isSelected
                  ? 'border-[#1677FF] shadow-xs scale-[1.01]'
                  : 'border-[#D6E3F2] hover:border-blue-300'
              }`}
            >
              {/* Thumbnail Simulated Canvas View */}
              <div
                className={`w-full h-14 bg-gradient-to-tr ${v.bgGradient} flex items-center justify-center text-xs text-white/90 group-hover:scale-105 transition-transform duration-200`}
              >
                <span className="text-[11px] font-medium drop-shadow-sm">
                  {v.iconLabel}
                </span>
              </div>

              {/* Label Bar */}
              <div
                className={`w-full py-1 px-2 text-center text-[11px] font-bold transition-colors ${
                  isSelected
                    ? 'bg-[#1677FF] text-white'
                    : 'bg-[#F8FAFD] text-[#102B52] group-hover:bg-blue-50'
                }`}
              >
                {v.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
