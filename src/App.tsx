import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X,
  Sun,
  Moon,
  Keyboard,
  Info,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

import { ModuleMeta } from './types/jetbot';
import { modulesData } from './data/modulesData';
import { functionsData } from './data/functionsData';
import { glossaryData, quizData } from './data/glossaryData';
import { PHYSICS_10_LESSONS, Physics10Lesson } from './data/physics10LessonsData';
import { simulationStore } from './stores/useSimulationStore';

import { CMUHeader, MainWorkspaceTab } from './components/CMUHeader';
import { CMUSimulationWorkspace } from './components/CMUSimulationWorkspace';
import { KnowledgeMap } from './components/KnowledgeMap';
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
  // Main Workspace Tab (Default: 'simulation' as in CMU10 reference design)
  const [activeTab, setActiveTab] = useState<MainWorkspaceTab>('simulation');
  const [selectedLesson, setSelectedLesson] = useState<Physics10Lesson>(PHYSICS_10_LESSONS[0]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('teleoperation');

  // Utility Modals State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Appearance Settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'xlarge'>('standard');

  // Lessons workspace sub-tab: 'modules' | 'map' | 'pipeline'
  const [lessonsSubTab, setLessonsSubTab] = useState<'modules' | 'map' | 'pipeline'>('modules');

  const currentModule = modulesData.find((m) => m.id === selectedModuleId) || modulesData[0];

  const handleSelectModule = (id: string) => {
    setSelectedModuleId(id);
    setActiveTab('lessons');
    setLessonsSubTab('modules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmergencyStop = () => {
    simulationStore.emergencyStop();
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

  // Global Keyboard Shortcuts (Spacebar = E-STOP, Arrows = Motors)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleEmergencyStop();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(0.6, 0.6, 'Phím Mũi Tên: Tiến');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(-0.5, -0.5, 'Phím Mũi Tên: Lùi');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(-0.4, 0.4, 'Phím Mũi Tên: Xoay Trái');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        simulationStore.setMotorSpeeds(0.4, -0.4, 'Phím Mũi Tên: Xoay Phải');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF5FC] dark:bg-[#0B1120] text-[#102B52] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200">
      {/* 1. Global CMU10 Reference Top Header */}
      <CMUHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLibrary={() => setIsLibraryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onEmergencyStop={handleEmergencyStop}
      />

      {/* 2. Main Workspaces (Switch according to activeTab) */}
      <main className="flex-1 w-full flex flex-col">
        {/* Workspace 1: Simulation-First (Reference Screen View) */}
        {activeTab === 'simulation' && (
          <CMUSimulationWorkspace
            selectedLesson={selectedLesson}
            onSelectLesson={setSelectedLesson}
            selectedModuleId={selectedModuleId}
            onSelectModule={(m) => handleSelectModule(m.id)}
            onEmergencyStop={handleEmergencyStop}
          />
        )}

        {/* Workspace 2: Lessons (Bài học & 12 Chuyên đề) */}
        {activeTab === 'lessons' && (
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-4">
            {/* Sub-navigation bar inside Lessons */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#131E36] p-2.5 rounded-2xl border border-[#D6E3F2] dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setLessonsSubTab('modules')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    lessonsSubTab === 'modules'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  12 Chuyên Đề Chi Tiết
                </button>
                <button
                  onClick={() => setLessonsSubTab('map')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    lessonsSubTab === 'map'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Bản Đồ Mạng Lưới Kiến Thức
                </button>
                <button
                  onClick={() => setLessonsSubTab('pipeline')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    lessonsSubTab === 'pipeline'
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-[#102B52] dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Sơ Đồ Hệ Thống &amp; Phần Cứng
                </button>
              </div>

              <button
                onClick={() => setActiveTab('simulation')}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-xs"
              >
                <span>Mở Phòng Thí Nghiệm Cho Bài Này</span>
                <span className="font-mono">&rarr;</span>
              </button>
            </div>

            {lessonsSubTab === 'modules' && (
              <ModuleDetailView
                module={currentModule}
                allModules={modulesData}
                onSelectModule={handleSelectModule}
                onEmergencyStop={handleEmergencyStop}
              />
            )}

            {lessonsSubTab === 'map' && (
              <KnowledgeMap onSelectModule={handleSelectModule} modules={modulesData} />
            )}

            {lessonsSubTab === 'pipeline' && <PipelineDiagram />}
          </div>
        )}

        {/* Workspace 3: Coding (Lập trình Python & Thư viện hàm) */}
        {activeTab === 'coding' && (
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-4">
            <div className="bg-white dark:bg-[#131E36] p-4 rounded-2xl border border-[#D6E3F2] dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#102B52] dark:text-white">
                  Studio Lập Trình Python JetBot
                </h2>
                <p className="text-xs text-[#526B8A] dark:text-slate-400">
                  Tra cứu API và thực thi lệnh trực tiếp vào robot mô phỏng vi sai
                </p>
              </div>
              <button
                onClick={() => setActiveTab('simulation')}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-[#1677FF] text-white hover:bg-blue-600 shadow-xs"
              >
                Quan Sát Kết Quả Trên Sa Bàn &rarr;
              </button>
            </div>
            <FunctionExplorer functions={functionsData} onSelectModule={handleSelectModule} />
          </div>
        )}

        {/* Workspace 4: Analytics (Phân tích đồ thị & Thí nghiệm nếu-như) */}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <div className="bg-white dark:bg-[#131E36] p-4 rounded-2xl border border-[#D6E3F2] dark:border-slate-800 shadow-xs">
              <h2 className="text-lg font-bold text-[#102B52] dark:text-white">
                Không Gian Phân Tích Thực Nghiệm Vật Lí 10 &amp; AI
              </h2>
              <p className="text-xs text-[#526B8A] dark:text-slate-400">
                Khảo sát tác động của ma sát, khối lượng xe và quá trình hội tụ của mô hình học máy
              </p>
            </div>
            <WhatIfPlayground />
            <TrainingChartsView />
          </div>
        )}

        {/* Workspace 5: Reports (Báo cáo & Đánh giá kết quả) */}
        {activeTab === 'reports' && (
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <div className="bg-white dark:bg-[#131E36] p-4 rounded-2xl border border-[#D6E3F2] dark:border-slate-800 shadow-xs">
              <h2 className="text-lg font-bold text-[#102B52] dark:text-white">
                Đánh Giá Kiến Thức &amp; Báo Cáo Thí Nghiệm
              </h2>
              <p className="text-xs text-[#526B8A] dark:text-slate-400">
                Kiểm tra kiến thức Vật lí 10 &amp; Robotics thông qua bộ 10 câu hỏi tương tác có chấm điểm
              </p>
            </div>
            <QuizPanel questions={quizData} onSelectModule={handleSelectModule} />
          </div>
        )}
      </main>

      {/* 3. Utility Modals */}
      {/* Library Modal (Glossary) */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131E36] w-full max-w-4xl max-h-[85vh] rounded-3xl border border-[#D6E3F2] dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D6E3F2] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1677FF]" />
                <h3 className="font-bold text-base text-[#102B52] dark:text-white">
                  Thư Viện Tra Cứu Thuật Ngữ Vật Lí 10 &amp; Robotics
                </h3>
              </div>
              <button
                onClick={() => setIsLibraryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <GlossaryView terms={glossaryData} />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131E36] w-full max-w-md rounded-3xl border border-[#D6E3F2] dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-[#102B52] dark:text-white">
                Cài Đặt Giao Diện &amp; Trợ Năng
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFD] dark:bg-slate-800/50 border border-[#D6E3F2] dark:border-slate-700">
                <span className="font-bold text-[#102B52] dark:text-white">Chế độ hiển thị:</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#D6E3F2] dark:border-slate-700 font-bold flex items-center gap-1.5 text-slate-800 dark:text-white"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span>{isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFD] dark:bg-slate-800/50 border border-[#D6E3F2] dark:border-slate-700">
                <span className="font-bold text-[#102B52] dark:text-white">Cỡ chữ hiển thị:</span>
                <div className="flex items-center gap-1 font-bold">
                  <button
                    onClick={() => setFontSize('standard')}
                    className={`px-2.5 py-1 rounded-lg text-xs ${
                      fontSize === 'standard' ? 'bg-[#1677FF] text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2.5 py-1 rounded-lg text-sm ${
                      fontSize === 'large' ? 'bg-[#1677FF] text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2.5 py-1 rounded-lg text-base ${
                      fontSize === 'xlarge' ? 'bg-[#1677FF] text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    A++
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1677FF] text-white font-bold text-xs hover:bg-blue-600 transition shadow-xs"
            >
              Hoàn Tất Cài Đặt
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131E36] w-full max-w-3xl max-h-[85vh] rounded-3xl border border-[#D6E3F2] dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D6E3F2] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#1677FF]" />
                <h3 className="font-bold text-base text-[#102B52] dark:text-white">
                  Hướng Dẫn &amp; Phím Tắt Điều Khiển CMU10
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-[#526B8A] dark:text-slate-300">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900 text-[#102B52] dark:text-blue-200 space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-[#1677FF]" /> Phím Tắt Điều Khiển Bàn Phím
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold">Spacebar</kbd>: Dừng Khẩn Cấp (E-STOP)</div>
                  <div>• <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold">Mũi Tên Lên</kbd>: Xe Tiến Thẳng</div>
                  <div>• <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold">Mũi Tên Xuống</kbd>: Xe Chạy Lùi</div>
                  <div>• <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold">Mũi Tên Trái/Phải</kbd>: Quay Xe Tại Chỗ</div>
                </div>
              </div>
              <SourcesAndCaveats modules={modulesData} onSelectModule={handleSelectModule} />
            </div>
          </div>
        </div>
      )}

      {/* Global Emergency Stop Modal */}
      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-[#131E36] border-t border-[#D6E3F2] dark:border-slate-800 py-4 text-xs text-[#526B8A] dark:text-slate-400 select-none">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#102B52] dark:text-white">
              CMU10 JetBot AI Studio
            </span>
            <span>—</span>
            <span>Phòng thí nghiệm STEM Robotics dành cho học sinh Vật lí 10 (Chương trình GDPT 2018)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Mô phỏng trình duyệt an toàn 100%
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
