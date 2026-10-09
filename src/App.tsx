import React, { useState, useEffect } from 'react';
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
  Sun,
  Moon,
  Atom,
  Cpu,
  Zap,
  Palette
} from 'lucide-react';

import { ViewTab, ModuleMeta } from './types/jetbot';
import { modulesData } from './data/modulesData';
import { functionsData } from './data/functionsData';
import { glossaryData, quizData } from './data/glossaryData';
import { MODULE_THEMES, STEM_PALETTE } from './theme/stemTokens';

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

interface NavItemDef {
  id: ViewTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  activeColor: string; // Tailwind class
  activeBorder: string;
  badgeColor: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('teleoperation');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'xlarge'>('large');

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

  // Font size effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-large', 'font-size-xlarge');
    if (fontSize === 'large') {
      root.classList.add('font-size-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('font-size-xlarge');
    }
  }, [fontSize]);

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Vibrant STEM Navigation Definition
  const navItems: NavItemDef[] = [
    { 
      id: 'home', 
      label: 'Bản Đồ Kiến Thức', 
      icon: <Layers className="w-5 h-5" />, 
      activeColor: 'bg-blue-600 text-white shadow-blue-500/25',
      activeBorder: 'border-blue-400',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
    },
    { 
      id: 'robot-sim', 
      label: 'Robot 2 Động Cơ', 
      icon: <Compass className="w-5 h-5" />, 
      badge: 'Thử nghiệm',
      activeColor: 'bg-orange-600 text-white shadow-orange-500/25',
      activeBorder: 'border-orange-400',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200'
    },
    { 
      id: 'modules', 
      label: '12 Modules Chi Tiết', 
      icon: <Bot className="w-5 h-5" />, 
      badge: '12 Notebooks',
      activeColor: 'bg-purple-600 text-white shadow-purple-500/25',
      activeBorder: 'border-purple-400',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
    },
    { 
      id: 'pipeline', 
      label: 'Sơ Đồ Quy Trình', 
      icon: <GitFork className="w-5 h-5" />, 
      activeColor: 'bg-teal-600 text-white shadow-teal-500/25',
      activeBorder: 'border-teal-400',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200'
    },
    { 
      id: 'functions', 
      label: 'Thư Viện Hàm & Lệnh', 
      icon: <BookOpen className="w-5 h-5" />, 
      badge: `${functionsData.length}+`,
      activeColor: 'bg-amber-600 text-white shadow-amber-500/25',
      activeBorder: 'border-amber-400',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
    },
    { 
      id: 'training-charts', 
      label: 'Đồ Thị Huấn Luyện', 
      icon: <LineChart className="w-5 h-5" />, 
      badge: 'Bokeh',
      activeColor: 'bg-teal-600 text-white shadow-teal-500/25',
      activeBorder: 'border-teal-400',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200'
    },
    { 
      id: 'what-if', 
      label: 'Thí Nghiệm "Nếu Như"', 
      icon: <Sliders className="w-5 h-5" />, 
      badge: 'Sáng tạo',
      activeColor: 'bg-pink-600 text-white shadow-pink-500/25',
      activeBorder: 'border-pink-400',
      badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200'
    },
    { 
      id: 'quiz', 
      label: 'Thực Hành & Trắc Nghiệm', 
      icon: <HelpCircle className="w-5 h-5" />, 
      badge: '10 Câu',
      activeColor: 'bg-green-600 text-white shadow-green-500/25',
      activeBorder: 'border-green-400',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
    },
    { 
      id: 'glossary', 
      label: 'Từ Điển Thuật Ngữ', 
      icon: <BookA className="w-5 h-5" />, 
      activeColor: 'bg-purple-600 text-white shadow-purple-500/25',
      activeBorder: 'border-purple-400',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
    },
    { 
      id: 'sources', 
      label: 'Nguồn & Lưu Ý Kỹ Thuật', 
      icon: <FileText className="w-5 h-5" />, 
      activeColor: 'bg-blue-600 text-white shadow-blue-500/25',
      activeBorder: 'border-blue-400',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] flex flex-col font-sans text-base transition-colors duration-200 stem-lab-grid">
      {/* Top Global Vibrant STEM Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-indigo-900 to-purple-900 text-white shadow-md border-b border-indigo-700/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => setCurrentTab('home')}
              className="cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-slate-950/70 rounded-[14px] flex items-center justify-center text-white backdrop-blur-xs">
                  <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-200 transition">
                    JetBot AI Studio
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-black rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                    VIBRANT STEM
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-white/15 text-pink-200 border border-pink-300/30">
                    Lớp 11
                  </span>
                </div>
                <p className="text-xs text-indigo-100 hidden sm:block">
                  Phòng thí nghiệm lập trình robot vi sai &amp; AI bám đường / tránh va chạm
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Dark Mode, Font Size, Safety Indicator & Emergency Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ phòng thí nghiệm đêm (Neon)'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center border border-white/15"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-200" />
              )}
            </button>

            {/* Font Size Adjuster Control */}
            <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/15 text-xs backdrop-blur-xs">
              <span className="text-slate-300 font-semibold px-2 hidden lg:inline">Cỡ chữ:</span>
              <button
                onClick={() => setFontSize('standard')}
                title="Cỡ chữ Chuẩn (17.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-xs ${
                  fontSize === 'standard' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="Cỡ chữ Lớn (19.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-sm ${
                  fontSize === 'large' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                title="Cỡ chữ Cực Lớn (21.5px)"
                className={`px-2 py-1 rounded-lg font-bold transition text-base ${
                  fontSize === 'xlarge' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            {/* Safety Mode Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mô phỏng an toàn</span>
            </div>

            {/* Emergency Stop Button */}
            <button
              onClick={handleEmergencyStop}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md transition border border-red-400/30"
            >
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              <span className="tracking-tight">DỪNG KHẨN CẤP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 space-y-4">
          {/* Main Navigation Deck */}
          <nav className="bg-white dark:bg-[#131E36] rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm space-y-1">
            <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>ĐIỀU HƯỚNG STEM LAB</span>
              <Atom className="w-4 h-4 text-purple-500" />
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? `${item.activeColor} font-bold shadow-md scale-[1.01]`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick 12-Module Color Coded List */}
          <div className="bg-white dark:bg-[#131E36] rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-500" />
                12 Modules Nguồn
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                M1 - M12
              </span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {modulesData.map((m) => {
                const theme = MODULE_THEMES[m.id] || MODULE_THEMES['teleoperation'];
                const isSelected = currentTab === 'modules' && selectedModuleId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModule(m.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? `${theme.accentBg} ${theme.accentText} font-black border ${theme.accentBorder} shadow-xs`
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                    }`}
                    title={`Module ${m.number}: ${m.nameVi}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: theme.primaryHex }}
                      />
                      <span className="truncate">
                        M{m.number}: {m.nameVi}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibrant STEM Palette Visual Guide Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 p-4 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/40 space-y-2.5">
            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Quy Chuẩn Màu STEM Lớp 11
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Xanh: Điều khiển</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>Tím: AI &amp; Mạng</span>
              </div>
              <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-300">
                <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                <span>Hồng: Sáng tạo</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-300">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Cam: Thử nghiệm</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Vàng: Khám phá</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>Ngọc: Cảm biến</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 md:hidden flex">
            <div className="w-80 bg-white dark:bg-[#131E36] h-full p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  Danh Mục Bài Học JetBot
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? `${item.activeColor} font-bold shadow-xs`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-2">
                  12 Modules Nguồn:
                </span>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {modulesData.map((m) => {
                    const theme = MODULE_THEMES[m.id] || MODULE_THEMES['teleoperation'];
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModule(m.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 truncate"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: theme.primaryHex }}
                        />
                        <span className="truncate">
                          M{m.number}: {m.nameVi}
                        </span>
                      </button>
                    );
                  })}
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

      {/* Modern STEM Lab Footer */}
      <footer className="bg-white dark:bg-[#131E36] border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">
              JetBot AI Studio
            </span>
            <span>—</span>
            <span>Phòng thí nghiệm STEM Colorful EdTech cho học sinh lớp 11</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> An Toàn 100%
            </span>
            <span>•</span>
            <span>Mô phỏng trình duyệt</span>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentTab('sources');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
            >
              Kiểm kê kỹ thuật 12 Notebooks
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
