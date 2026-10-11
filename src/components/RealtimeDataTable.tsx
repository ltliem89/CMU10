import React, { useEffect, useState } from 'react';
import { Table } from 'lucide-react';
import { simulationStore } from '../stores/useSimulationStore';

export const RealtimeDataTable: React.FC = () => {
  const [data, setData] = useState(() => {
    const s = simulationStore.getState();
    return {
      v: s.linearVel,
      a: Math.abs(s.linearVel) * 0.15,
      s: Math.abs(s.x + 0.8) + Math.abs(s.z),
      t: s.simTimeSec,
      F: Math.abs(s.linearVel) * 0.44
    };
  });

  useEffect(() => {
    let lastTime = 0;
    const unsub = simulationStore.subscribe(() => {
      const now = performance.now();
      if (now - lastTime < 50) return; // 20 FPS throttle
      lastTime = now;
      const s = simulationStore.getState();
      let dist = 0;
      for (let i = 1; i < s.actualTrajectory.length; i++) {
        const dx = s.actualTrajectory[i].x - s.actualTrajectory[i - 1].x;
        const dz = s.actualTrajectory[i].z - s.actualTrajectory[i - 1].z;
        dist += Math.sqrt(dx * dx + dz * dz);
      }
      setData({
        v: s.linearVel,
        a: Math.abs(s.linearVel) * 0.15,
        s: dist,
        t: s.simTimeSec,
        F: Math.abs(s.linearVel) * 0.44
      });
    });
    return unsub;
  }, []);

  const rows = [
    { name: 'Vận tốc', symbol: 'v', value: Math.abs(data.v).toFixed(2), unit: 'm/s', color: 'text-[#1677FF]' },
    { name: 'Gia tốc', symbol: 'a', value: data.a.toFixed(2), unit: 'm/s²', color: 'text-emerald-600' },
    { name: 'Quãng đường', symbol: 's', value: data.s.toFixed(1), unit: 'm', color: 'text-amber-600' },
    { name: 'Thời gian', symbol: 't', value: data.t.toFixed(1), unit: 's', color: 'text-[#102B52]' },
    { name: 'Lực đẩy (ước tính)', symbol: 'F', value: data.F.toFixed(2), unit: 'N', color: 'text-purple-600' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#D6E3F2] shadow-xs p-3.5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Table className="w-4 h-4" />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#102B52]">
          Bảng số liệu thời gian thực
        </h3>
      </div>

      {/* Realtime Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#D6E3F2] text-[#526B8A] text-[11px] font-bold">
              <th className="py-1.5 px-2">Đại lượng</th>
              <th className="py-1.5 px-2 font-mono">Kí hiệu</th>
              <th className="py-1.5 px-2 font-mono text-right">Giá trị</th>
              <th className="py-1.5 px-2 font-mono">Đơn vị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBF2F9]">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[#F8FAFD] transition-colors">
                <td className="py-1.5 px-2 font-medium text-[#102B52]">{r.name}</td>
                <td className="py-1.5 px-2 font-mono italic text-[#526B8A]">{r.symbol}</td>
                <td className={`py-1.5 px-2 font-mono font-bold text-right ${r.color}`}>
                  {r.value}
                </td>
                <td className="py-1.5 px-2 font-mono text-[#526B8A] text-[11px]">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
