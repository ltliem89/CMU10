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
      <div className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                <BookA className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Từ Điển Thuật Ngữ Kỹ Thuật (Robotics &amp; AI Glossary)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Giải thích chuẩn xác các khái niệm chuyên sâu trong dự án JetBot bằng tiếng Việt kèm ngữ cảnh thực tế
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm thuật ngữ (FP16, Vi sai...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#182442] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedCategory === 'all' 
                ? 'bg-purple-600 text-white font-black shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tất cả ({terms.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white font-black shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#131E36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition p-6 flex flex-col justify-between stem-card-interactive"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {item.category}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 font-mono">
                {item.term}
              </h3>
              <div className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-3.5">
                {item.vietnamese}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                {item.definition}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#182442] -mx-6 -mb-6 p-4 rounded-b-3xl">
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5 font-bold">Ứng dụng thực tiễn trên JetBot:</strong>
              {item.realWorldContext}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
