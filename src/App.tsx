import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  BookOpen, 
  Sliders, 
  GitFork, 
  LineChart, 
  HelpCircle, 
  BookA, 
  ShieldCheck, 
  AlertTriangle, 
  Bot, 
  Menu, 
  X, 
  FileText,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

import { ViewTab, ModuleMeta } from './types/jetbot';
import { modulesData } from './data/modulesData';
import { functionsData } from './data/functionsData';
import { glossaryData, quizData } from './data/glossaryData';

import { KnowledgeMap } from './components/KnowledgeMap';
import { RobotTwinMotorSimulator } from './components/RobotTwinMotorSimulator';
import { ModuleDetailView } from './components/ModuleDetailView';
import { FunctionExplorer } from './components/FunctionExplorer';
import { PipelineDiagram } from './components/PipelineDiagram';
import { TrainingChartsView } from './components/TrainingChartsView';
import { WhatIfPlayground } from './components/WhatIfPlayground';
import { QuizPanel } from './components/QuizPanel';
import { GlossaryView } from './components/GlossaryView';
import { SourcesAndCaveats } from './components/SourcesAndCaveats';
import { EmergencyStopModal } from './components/EmergencyStopModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('teleoperation');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  // Selected module object
  const currentModule = modulesData.find((m) => m.id === selectedModuleId) || modulesData[0];

  const handleSelectModule = (id: string) => {
    setSelectedModuleId(id);
    setCurrentTab('modules');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmergencyStop = () => {
    setIsEmergencyModalOpen(true);
  };

  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'xlarge'>('large');

  // Update HTML class when font size changes
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-large', 'font-size-xlarge');
    if (fontSize === 'large') {
      root.classList.add('font-size-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('font-size-xlarge');
    }
  }, [fontSize]);

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Bản Đồ Kiến Thức', icon: <Layers className="w-5 h-5" /> },
    { id: 'robot-sim', label: 'Robot 2 Động Cơ', icon: <Compass className="w-5 h-5" />, badge: 'Tương tác' },
    { id: 'modules', label: '12 Modules Chi Tiết', icon: <Bot className="w-5 h-5" />, badge: '12 Notebooks' },
    { id: 'pipeline', label: 'Sơ Đồ Quy Trình', icon: <GitFork className="w-5 h-5" /> },
    { id: 'functions', label: 'Thư Viện Hàm & Lệnh', icon: <BookOpen className="w-5 h-5" />, badge: `${functionsData.length}+` },
    { id: 'training-charts', label: 'Đồ Thị Huấn Luyện', icon: <LineChart className="w-5 h-5" />, badge: 'Bokeh' },
    { id: 'what-if', label: 'Thí Nghiệm "Nếu Như"', icon: <Sliders className="w-5 h-5" /> },
    { id: 'quiz', label: 'Thực Hành & Trắc Nghiệm', icon: <HelpCircle className="w-5 h-5" />, badge: '10 Câu' },
    { id: 'glossary', label: 'Từ Điển Thuật Ngữ', icon: <BookA className="w-5 h-5" /> },
    { id: 'sources', label: 'Nguồn & Lưu Ý Kỹ Thuật', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans text-base">
      {/* Top Global Safety Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => setCurrentTab('home')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md font-bold group-hover:scale-105 transition">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-indigo-300 transition">
                    JetBot AI Studio
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    STEM EDU
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden sm:block">
                  Lập trình robot vi sai &amp; AI bám đường / tránh va chạm
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Font Size Switcher & Emergency Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Adjuster Control */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
              <span className="text-slate-400 font-semibold px-2 hidden lg:inline">Cỡ chữ:</span>
              <button
                onClick={() => setFontSize('standard')}
                title="Cỡ chữ Chuẩn (17.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-xs ${
                  fontSize === 'standard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="Cỡ chữ Lớn (19.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-sm ${
                  fontSize === 'large' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                title="Cỡ chữ Cực Lớn (21.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-base ${
                  fontSize === 'xlarge' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chế độ mô phỏng an toàn</span>
            </div>

            <button
              onClick={handleEmergencyStop}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm transition"
            >
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              <span>DỪNG KHẨN CẤP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 space-y-4">
          <nav className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-1.5">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Điều Hướng Bài Học
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                  currentTab === item.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={currentTab === item.id ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Module Selector Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-900 font-bold px-1 text-xs uppercase tracking-wide">
              <span>Khám phá 12 Modules</span>
              <span className="text-xs text-indigo-600 font-bold">M1 - M12</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {modulesData.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectModule(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs truncate transition flex items-center justify-between ${
                    currentTab === 'modules' && selectedModuleId === m.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                  title={`Module ${m.number}: ${m.nameVi}`}
                >
                  <span className="truncate">
                    M{m.number}: {m.nameVi}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Safe Simulation Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4.5 rounded-2xl border border-indigo-100 space-y-2">
            <div className="font-bold text-indigo-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              Mô Phỏng Trực Quan STEM
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Tất cả các tính năng mô phỏng bánh xe, camera, gán nhãn X/Y và suy luận TensorRT được thiết kế
              chạy trực tiếp trên trình duyệt, không cần JetBot thật.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 md:hidden flex">
            <div className="w-72 bg-white h-full p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Danh Mục Bài Học</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      currentTab === item.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="font-bold text-xs text-slate-800 block mb-2">12 Modules Nguồn:</span>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {modulesData.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModule(m.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 truncate"
                    >
                      M{m.number}: {m.nameVi}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0">
          {currentTab === 'home' && (
            <KnowledgeMap onSelectModule={handleSelectModule} modules={modulesData} />
          )}

          {currentTab === 'robot-sim' && (
            <div className="space-y-6">
              <RobotTwinMotorSimulator onEmergencyStop={handleEmergencyStop} />
            </div>
          )}

          {currentTab === 'modules' && (
            <ModuleDetailView
              module={currentModule}
              allModules={modulesData}
              onSelectModule={handleSelectModule}
              onEmergencyStop={handleEmergencyStop}
            />
          )}

          {currentTab === 'pipeline' && <PipelineDiagram />}

          {currentTab === 'functions' && (
            <FunctionExplorer functions={functionsData} onSelectModule={handleSelectModule} />
          )}

          {currentTab === 'training-charts' && <TrainingChartsView />}

          {currentTab === 'what-if' && <WhatIfPlayground />}

          {currentTab === 'quiz' && (
            <QuizPanel questions={quizData} onSelectModule={handleSelectModule} />
          )}

          {currentTab === 'glossary' && <GlossaryView terms={glossaryData} />}

          {currentTab === 'sources' && (
            <SourcesAndCaveats modules={modulesData} onSelectModule={handleSelectModule} />
          )}
        </main>
      </div>

      {/* Global Emergency Stop Modal */}
      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">JetBot AI &amp; Robotics Interactive Studio</span>
            <span>—</span>
            <span>Ứng dụng giảng dạy lập trình &amp; AI dựa trên 12 notebook JetBot</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Tiếng Việt mặc định</span>
            <span>•</span>
            <span>Chế độ mô phỏng an toàn</span>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentTab('sources');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Kiểm kê kỹ thuật
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
