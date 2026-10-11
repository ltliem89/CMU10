import React, { useState, useEffect } from 'react';
import { LineChart as ChartIcon } from 'lucide-react';
import { simulationStore } from '../stores/useSimulationStore';

export type PhysicsChartMetric = 'v-t' | 'a-t' | 's-t' | 'f-t';

interface DataPoint {
  t: number;
  val: number;
}

export const PhysicsChartPanel: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<PhysicsChartMetric>('v-t');
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([
    { t: 0, val: 0.0 },
    { t: 2, val: 0.35 },
    { t: 4, val: 0.58 },
    { t: 6, val: 0.72 },
    { t: 8, val: 0.81 },
    { t: 10, val: 0.82 },
    { t: 12, val: 0.82 },
    { t: 14, val: 0.82 },
    { t: 16, val: 0.82 },
    { t: 18, val: 0.82 },
    { t: 20, val: 0.82 }
  ]);

  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const now = performance.now();
      if (now - lastTime < 500) return; // Update chart every 500ms
      lastTime = now;
      const s = simulationStore.getState();
      const t = parseFloat(s.simTimeSec.toFixed(1));
      let val = 0;
      if (activeMetric === 'v-t') val = Math.abs(s.linearVel);
      else if (activeMetric === 'a-t') val = Math.abs(s.linearVel) * 0.15;
      else if (activeMetric === 's-t') val = Math.abs(s.x + 0.8) + Math.abs(s.z);
      else if (activeMetric === 'f-t') val = Math.abs(s.linearVel) * 0.44; // F = m*a approx

      setDataHistory((prev) => {
        const next = [...prev, { t, val }];
        if (next.length > 25) next.shift();
        return next;
      });
    });
    return unsub;
  }, [activeMetric]);

  const tabs: { id: PhysicsChartMetric; label: string; yLabel: string; maxVal: number }[] = [
    { id: 'v-t', label: 'Vận tốc  v – t', yLabel: 'v (m/s)', maxVal: 2.0 },
    { id: 'a-t', label: 'Gia tốc  a – t', yLabel: 'a (m/s²)', maxVal: 1.0 },
    { id: 's-t', label: 'Quãng đường  s – t', yLabel: 's (m)', maxVal: 15.0 },
    { id: 'f-t', label: 'Lực  F – t', yLabel: 'F (N)', maxVal: 2.0 }
  ];

  const currentTabDef = tabs.find((t) => t.id === activeMetric) || tabs[0];

  // SVG Chart Dimensions
  const svgW = 480;
  const svgH = 140;
  const paddingL = 36;
  const paddingR = 14;
  const paddingT = 16;
  const paddingB = 26;

  const chartW = svgW - paddingL - paddingR;
  const chartH = svgH - paddingT - paddingB;

  const minT = dataHistory[0]?.t || 0;
  const maxT = Math.max(minT + 10, dataHistory[dataHistory.length - 1]?.t || 20);

  const getX = (t: number) => paddingL + ((t - minT) / (maxT - minT || 1)) * chartW;
  const getY = (val: number) =>
    paddingT + chartH - Math.min(1.0, Math.max(0, val / currentTabDef.maxVal)) * chartH;

  const pointsString = dataHistory
    .map((pt) => `${getX(pt.t).toFixed(1)},${getY(pt.val).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-white rounded-2xl border border-[#D6E3F2] shadow-xs p-3.5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center">
            <ChartIcon className="w-4 h-4" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#102B52]">
            Đồ thị đại lượng vật lí
          </h3>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#EEF5FC] p-0.5 rounded-xl border border-[#D6E3F2] text-[11px] font-bold">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveMetric(t.id);
                setDataHistory([]);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeMetric === t.id
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative w-full h-[140px] bg-[#FAFDFE] rounded-xl border border-[#E2EDF8] overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines horizontal */}
          <line
            x1={paddingL}
            y1={paddingT}
            x2={svgW - paddingR}
            y2={paddingT}
            stroke="#DCE6F2"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingL}
            y1={paddingT + chartH / 2}
            x2={svgW - paddingR}
            y2={paddingT + chartH / 2}
            stroke="#DCE6F2"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingL}
            y1={paddingT + chartH}
            x2={svgW - paddingR}
            y2={paddingT + chartH}
            stroke="#B5CEE7"
          />

          {/* Y Axis Label */}
          <text
            x={10}
            y={paddingT + 6}
            className="text-[9px] fill-[#526B8A] font-mono font-bold"
          >
            {currentTabDef.maxVal.toFixed(1)}
          </text>
          <text
            x={10}
            y={paddingT + chartH / 2 + 3}
            className="text-[9px] fill-[#526B8A] font-mono"
          >
            {(currentTabDef.maxVal / 2).toFixed(1)}
          </text>
          <text
            x={16}
            y={paddingT + chartH + 2}
            className="text-[9px] fill-[#526B8A] font-mono"
          >
            0.0
          </text>

          {/* X Axis Labels */}
          <text
            x={paddingL}
            y={svgH - 8}
            className="text-[9px] fill-[#526B8A] font-mono"
          >
            {minT.toFixed(0)}
          </text>
          <text
            x={paddingL + chartW / 2 - 8}
            y={svgH - 8}
            className="text-[9px] fill-[#526B8A] font-mono"
          >
            {((minT + maxT) / 2).toFixed(0)}
          </text>
          <text
            x={svgW - paddingR - 14}
            y={svgH - 8}
            className="text-[9px] fill-[#526B8A] font-mono"
          >
            {maxT.toFixed(0)}
          </text>
          <text
            x={svgW / 2 - 25}
            y={svgH - 8}
            className="text-[9.5px] fill-[#526B8A] font-sans font-bold"
          >
            Thời gian (s)
          </text>

          {/* Primary Trend Line */}
          {dataHistory.length > 1 && (
            <>
              <polyline
                fill="none"
                stroke="#1677FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
              {/* Data points markers */}
              {dataHistory.map((pt, i) => (
                <circle
                  key={i}
                  cx={getX(pt.t)}
                  cy={getY(pt.val)}
                  r="3"
                  fill="#FFFFFF"
                  stroke="#1677FF"
                  strokeWidth="2"
                />
              ))}
            </>
          )}
        </svg>

        {/* Y Axis Title indicator */}
        <div className="absolute top-1 left-2 text-[10px] font-bold text-[#1677FF]">
          {currentTabDef.yLabel}
        </div>
      </div>
    </div>
  );
};
