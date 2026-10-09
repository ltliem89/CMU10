import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Copy, Check, AlertCircle, ArrowUpRight, Terminal, Tag, Sparkles } from 'lucide-react';
import { FunctionEntry } from '../types/jetbot';

interface FunctionExplorerProps {
  functions: FunctionEntry[];
  onSelectModule: (moduleId: string) => void;
}

export const FunctionExplorer: React.FC<FunctionExplorerProps> = ({ functions, onSelectModule }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered entries
  const filteredFunctions = useMemo(() => {
    return functions.filter((fn) => {
      const matchSearch =
        fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.summaryVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.explanationVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.sourceNotebooks.some((nb) => nb.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGroup = selectedGroup === 'all' || fn.group === selectedGroup;
      const matchKind = selectedKind === 'all' || fn.kind === selectedKind;

      return matchSearch && matchGroup && matchKind;
    });
  }, [functions, searchQuery, selectedGroup, selectedKind]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search Filters */}
      <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Thư Viện Hàm, Lớp &amp; Lệnh Nguồn (JetBot API Explorer)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Tra cứu {functions.length} mục API, cú pháp, tham số vào/ra và vị trí trong các notebook nguồn
                </p>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm hàm, lớp, notebook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#182442] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition font-medium"
            />
          </div>
        </div>

        {/* Filter Chips with Distinct Vibrant STEM Colors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Lọc nhóm:
          </span>

          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'all' 
                ? 'bg-amber-500 text-black shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tất cả ({functions.length})
          </button>
          <button
            onClick={() => setSelectedGroup('motor')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'motor' 
                ? 'bg-orange-600 text-white shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Động cơ &amp; Robot
          </button>
          <button
            onClick={() => setSelectedGroup('camera')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'camera' 
                ? 'bg-teal-600 text-white shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Camera &amp; Video
          </button>
          <button
            onClick={() => setSelectedGroup('vision')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'vision' 
                ? 'bg-blue-600 text-white shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Thị giác máy tính
          </button>
          <button
            onClick={() => setSelectedGroup('dataset')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'dataset' 
                ? 'bg-yellow-500 text-black shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Bộ dữ liệu (Dataset)
          </button>
          <button
            onClick={() => setSelectedGroup('training')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'training' 
                ? 'bg-purple-600 text-white shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Huấn luyện AI
          </button>
          <button
            onClick={() => setSelectedGroup('tensorrt')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedGroup === 'tensorrt' 
                ? 'bg-orange-600 text-white shadow-xs font-black' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            TensorRT Engine
          </button>
        </div>
      </div>

      {/* Function Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFunctions.map((fn) => (
          <div
            key={fn.id}
            className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between space-y-4 stem-card-interactive"
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                    {fn.name}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/60">
                    {fn.kind}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {fn.groupNameVi}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {fn.summaryVi}
              </p>

              {fn.syntax && (
                <div className="mt-3 bg-slate-50 dark:bg-[#182442] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-blue-700 dark:text-blue-300">
                  {fn.syntax}
                </div>
              )}

              {/* In/Out Params */}
              <div className="mt-3 space-y-1 text-xs">
                {fn.inputs && fn.inputs.length > 0 && (
                  <div className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">Đầu vào: </strong>
                    {fn.inputs.join(', ')}
                  </div>
                )}
                {fn.outputs && fn.outputs.length > 0 && (
                  <div className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">Đầu ra: </strong>
                    {fn.outputs.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Notebook sources and copy button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {fn.sourceNotebooks.map((nb, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {nb}
                  </span>
                ))}
              </div>

              {fn.codeExample && (
                <button
                  onClick={() => handleCopyCode(fn.id, fn.codeExample!)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold"
                  title="Sao chép ví dụ mã"
                >
                  {copiedId === fn.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Mã mẫu
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
