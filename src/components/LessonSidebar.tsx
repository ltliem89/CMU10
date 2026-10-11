import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';
import { PHYSICS_10_LESSONS, Physics10Lesson } from '../data/physics10LessonsData';
import { modulesData } from '../data/modulesData';
import { ModuleMeta } from '../types/jetbot';

interface LessonSidebarProps {
  selectedLessonId: string;
  onSelectLesson: (lesson: Physics10Lesson) => void;
  selectedModuleId?: string;
  onSelectModule?: (module: ModuleMeta) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  selectedLessonId,
  onSelectLesson,
  selectedModuleId,
  onSelectModule,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'progress'>('list');
  const [curriculumMode, setCurriculumMode] = useState<'physics10' | 'robotics12'>('physics10');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState<boolean>(true);

  const currentLesson = PHYSICS_10_LESSONS.find((l) => l.id === selectedLessonId) || PHYSICS_10_LESSONS[0];

  return (
    <aside
      className={`bg-white rounded-2xl border border-[#D6E3F2] shadow-xs flex flex-col transition-all duration-200 select-none overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-full lg:w-[285px]'
      } shrink-0`}
    >
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-[#D6E3F2] flex items-center justify-between gap-2 bg-[#F8FAFD]">
        <div className="flex items-center gap-2 truncate">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#1677FF] shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h2 className="text-[14px] font-bold text-[#102B52] leading-tight truncate">
                Bài học Vật lí 10
              </h2>
              <span className="text-[11px] text-[#526B8A] font-medium">
                GDPT 2018 • STEM
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            data-testid="lesson-sidebar-toggle-btn"
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-slate-100 text-[#526B8A] transition ml-auto"
            title={isCollapsed ? 'Mở rộng bài học' : 'Thu gọn thanh bài học'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto">
          {/* Sub-Tabs: Danh sách | Tiến trình */}
          <div className="grid grid-cols-2 gap-1 bg-[#EEF5FC] p-1 rounded-xl border border-[#D6E3F2]/60 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`py-1.5 rounded-lg transition text-center ${
                activeSubTab === 'list'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setActiveSubTab('progress')}
              className={`py-1.5 rounded-lg transition text-center ${
                activeSubTab === 'progress'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#102B52] hover:bg-white/60'
              }`}
            >
              Tiến trình
            </button>
          </div>

          {activeSubTab === 'list' ? (
            <>
              {/* Optional Curriculum Switch: Vật lí 10 (Chuẩn) vs 12 Modules Robotics */}
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#526B8A]">
                <span>Chương trình:</span>
                <div className="flex items-center gap-1">
                  <button
                    data-testid="curriculum-toggle-physics"
                    onClick={() => setCurriculumMode('physics10')}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      curriculumMode === 'physics10'
                        ? 'bg-blue-100 text-[#1677FF]'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    Vật lí 10 (5 bài)
                  </button>
                  <span>•</span>
                  <button
                    data-testid="curriculum-toggle-robotics"
                    onClick={() => setCurriculumMode('robotics12')}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      curriculumMode === 'robotics12'
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    12 Modules AI
                  </button>
                </div>
              </div>

              {/* Lesson Items List */}
              <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
                {curriculumMode === 'physics10' ? (
                  PHYSICS_10_LESSONS.map((lesson) => {
                    const isSelected = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-[#1677FF] text-white shadow-sm shadow-blue-500/20'
                            : 'bg-white hover:bg-[#F1F6FD] border border-[#D6E3F2]/60 text-[#102B52]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 text-white shadow-2xs"
                            style={{ backgroundColor: lesson.badgeColor }}
                          >
                            {lesson.order}
                          </span>
                          <div className="truncate">
                            <h4
                              className={`text-[12.5px] font-bold leading-tight truncate ${
                                isSelected ? 'text-white' : 'text-[#102B52]'
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            <p
                              className={`text-[10.5px] leading-tight truncate ${
                                isSelected ? 'text-blue-100' : 'text-[#526B8A]'
                              }`}
                            >
                              {lesson.subtitle}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })
                ) : (
                  modulesData.map((m) => {
                    const isSelected = selectedModuleId === m.id;
                    return (
                      <button
                        key={m.id}
                        data-testid="sidebar-module-item"
                        onClick={() => onSelectModule && onSelectModule(m)}
                        className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-50 border border-[#D6E3F2]/60 text-[#102B52]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black flex items-center justify-center shrink-0">
                            {m.number}
                          </span>
                          <span className="text-[12px] font-bold truncate">
                            {m.nameVi}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Objectives Accordion Card */}
              <div className="bg-[#F8FAFD] rounded-xl border border-[#D6E3F2] p-3 space-y-2">
                <button
                  onClick={() => setIsObjectivesOpen(!isObjectivesOpen)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B52]">
                    <Target className="w-4 h-4 text-red-500 fill-red-100" />
                    <span>Mục tiêu bài học</span>
                  </div>
                  {isObjectivesOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#526B8A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#526B8A]" />
                  )}
                </button>

                {isObjectivesOpen && (
                  <ul className="space-y-1.5 text-[11.5px] text-[#526B8A] leading-relaxed pt-1 border-t border-[#D6E3F2]/60">
                    {currentLesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#1677FF] font-bold shrink-0">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            /* Progress Tab */
            <div className="space-y-3 p-1 text-xs">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200/60 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Tiến độ Vật lí 10</span>
                  <span className="text-emerald-700">60%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[60%]" />
                </div>
                <p className="text-[11px] text-emerald-700 pt-1">
                  Đã hoàn thành 3/5 bài thí nghiệm thực hành.
                </p>
              </div>

              <div className="space-y-1.5">
                {PHYSICS_10_LESSONS.map((l) => (
                  <div
                    key={l.id}
                    className="p-2 rounded-lg bg-white border border-[#D6E3F2] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          l.order <= 3 ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span className="text-[12px] font-medium text-[#102B52] truncate">
                        Bài {l.order}: {l.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        l.order <= 3
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {l.order <= 3 ? 'Đạt' : 'Chưa'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
