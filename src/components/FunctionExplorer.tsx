import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Copy, Check, AlertCircle, ArrowUpRight, Terminal, Tag } from 'lucide-react';
import { FunctionEntry } from '../types/jetbot';

interface FunctionExplorerProps {
  functions: FunctionEntry[];
  onSelectModule: (moduleId: string) => void;
}

export const FunctionExplorer: React.FC<FunctionExplorerProps> = ({ functions, onSelectModule }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
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
      const matchLevel = selectedLevel === 'all' || fn.level === selectedLevel;

      return matchSearch && matchGroup && matchKind && matchLevel;
    });
  }, [functions, searchQuery, selectedGroup, selectedKind, selectedLevel]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Thư Viện Hàm, Lớp, Biến &amp; Lệnh Nguồn (JetBot API Explorer)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu {functions.length} mục API, cú pháp, tham số vào/ra và vị trí trong các notebook nguồn
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm hàm, lớp, notebook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Lọc theo nhóm:
          </span>

          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'all' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({functions.length})
          </button>
          <button
            onClick={() => setSelectedGroup('motor')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'motor' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Động cơ &amp; Robot
          </button>
          <button
            onClick={() => setSelectedGroup('camera')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'camera' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Camera &amp; Video
          </button>
          <button
            onClick={() => setSelectedGroup('vision')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'vision' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Xử lý ảnh &amp; OpenCV
          </button>
          <button
            onClick={() => setSelectedGroup('dataset')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'dataset' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tập dữ liệu
          </button>
          <button
            onClick={() => setSelectedGroup('training')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'training' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mô hình &amp; Huấn luyện
          </button>
          <button
            onClick={() => setSelectedGroup('tensorrt')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'tensorrt' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            NVIDIA TensorRT
          </button>
          <button
            onClick={() => setSelectedGroup('system')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedGroup === 'system' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hệ thống &amp; Shell
          </button>
        </div>
      </div>

      {/* Function Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFunctions.map((fn) => (
          <div
            key={fn.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              {/* Badges row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {fn.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {fn.kind}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  fn.level === 'basic' ? 'bg-emerald-100 text-emerald-800' : fn.level === 'intermediate' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {fn.level === 'basic' ? 'Cơ bản' : fn.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                </span>
              </div>

              {/* 1-sentence Summary */}
              <p className="text-xs font-bold text-slate-800 mb-2 leading-relaxed">
                {fn.summaryVi}
              </p>

              {/* Detailed Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {fn.explanationVi}
              </p>

              {/* Syntax */}
              {fn.syntax && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 mb-3">
                  <span className="text-[10px] font-sans font-bold text-slate-400 block mb-0.5">Cú pháp sử dụng:</span>
                  {fn.syntax}
                </div>
              )}

              {/* Inputs & Outputs */}
              <div className="space-y-1 text-[11px] mb-3">
                {fn.inputs && fn.inputs.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700">Đầu vào: </span>
                    <span className="text-slate-600">{fn.inputs.join(', ')}</span>
                  </div>
                )}
                {fn.outputs && fn.outputs.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700">Đầu ra: </span>
                    <span className="text-slate-600">{fn.outputs.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Code Snippet */}
              {fn.codeExample && (
                <div className="relative bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-slate-200 mb-3 overflow-x-auto">
                  <button
                    onClick={() => handleCopyCode(fn.id, fn.codeExample!)}
                    className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Sao chép đoạn mã"
                  >
                    {copiedId === fn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="pr-6">{fn.codeExample}</pre>
                </div>
              )}

              {/* Cautions */}
              {fn.cautions && fn.cautions.length > 0 && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 mb-3 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lưu ý kỹ thuật: </span>
                    {fn.cautions.join(' ')}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Source notebook link */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 overflow-x-auto">
                <span className="font-medium text-slate-400">Nguồn:</span>
                {fn.sourceNotebooks.map((nb, i) => (
                  <span key={i} className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {nb}
                  </span>
                ))}
              </div>

              {fn.moduleIds.length > 0 && (
                <button
                  onClick={() => onSelectModule(fn.moduleIds[0])}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                >
                  Xem Module <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
