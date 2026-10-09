import React, { useState } from 'react';
import { BookA, Search, Tag, Sparkles } from 'lucide-react';
import { GlossaryTerm } from '../types/jetbot';

interface GlossaryViewProps {
  terms: GlossaryTerm[];
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ terms }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(terms.map((t) => t.category)));

  const filteredTerms = terms.filter((item) => {
    const matchSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.realWorldContext.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookA className="w-5 h-5 text-indigo-600" />
              Từ Điển Thuật Ngữ Kỹ Thuật (Robotics &amp; AI Glossary)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Giải thích chuẩn xác các khái niệm chuyên sâu trong dự án JetBot bằng tiếng Việt kèm ngữ cảnh thực tế
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm thuật ngữ (ví dụ: FP16, Vi sai...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedCategory === 'all' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({terms.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedCategory === cat ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {item.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-0.5 font-mono">
                {item.term}
              </h3>
              <div className="text-xs font-semibold text-indigo-700 mb-3">
                {item.vietnamese}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.definition}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wide">
                Ứng dụng trong JetBot:
              </span>
              <p className="leading-relaxed opacity-90">{item.realWorldContext}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
