import React from 'react';
import {
  Bot,
  Home,
  Box,
  Code2,
  LineChart,
  FileText,
  BookOpen,
  Settings,
  HelpCircle,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export type MainWorkspaceTab = 'lessons' | 'simulation' | 'coding' | 'analytics' | 'reports';

interface CMUHeaderProps {
  activeTab: MainWorkspaceTab;
  onSelectTab: (tab: MainWorkspaceTab) => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onEmergencyStop: () => void;
}

export const CMUHeader: React.FC<CMUHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLibrary,
  onOpenSettings,
  onOpenHelp,
  onEmergencyStop
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      id: 'lessons' as MainWorkspaceTab,
      label: 'Bài học',
      icon: <Home className="w-4.5 h-4.5" />,
      activeColor: 'bg-[#1677FF] text-white shadow-md shadow-blue-500/25',
      inactiveColor: 'text-slate-200 hover:text-white hover:bg-white/10'
    },
    {
      id: 'simulation' as MainWorkspaceTab,
      label: 'Mô phỏng',
      icon: <Box className="w-4.5 h-4.5" />,
      activeColor: 'bg-[#A21CAF] text-white shadow-md shadow-fuchsia-500/25',
      inactiveColor: 'text-slate-200 hover:text-white hover:bg-white/10'
    },
    {
      id: 'coding' as MainWorkspaceTab,
      label: 'Lập trình',
      icon: <Code2 className="w-4.5 h-4.5" />,
      activeColor: 'bg-[#0D9488] text-white shadow-md shadow-teal-500/25',
      inactiveColor: 'text-slate-200 hover:text-white hover:bg-white/10'
    },
    {
      id: 'analytics' as MainWorkspaceTab,
      label: 'Phân tích',
      icon: <LineChart className="w-4.5 h-4.5" />,
      activeColor: 'bg-[#F59E0B] text-white shadow-md shadow-amber-500/25',
      inactiveColor: 'text-slate-200 hover:text-white hover:bg-white/10'
    },
    {
      id: 'reports' as MainWorkspaceTab,
      label: 'Báo cáo',
      icon: <FileText className="w-4.5 h-4.5" />,
      activeColor: 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/25',
      inactiveColor: 'text-slate-200 hover:text-white hover:bg-white/10'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#082B59] text-white border-b border-[#124A8A]/50 shadow-md select-none">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 h-[76px] sm:h-[80px] flex items-center justify-between gap-3">
        {/* Brand Area (Left) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onSelectTab('simulation')}
            className="flex items-center gap-3 cursor-pointer group"
            title="CMU10 — Phòng thí nghiệm Vật lí 10"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#318BFF] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#082B59] rounded-[14px] flex items-center justify-center text-cyan-300">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-cyan-200 transition">
                  CMU10
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full border border-sky-400/60 text-sky-200 bg-sky-950/40">
                  Lớp 10
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block font-medium">
                Phòng thí nghiệm Vật lí 10
              </p>
            </div>
          </div>
        </div>

        {/* 5 Primary Pillars (Center) */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-[#061F40]/80 p-1 rounded-2xl border border-[#124A8A]/40">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-150 ${
                  isActive ? item.activeColor : item.inactiveColor
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utilities & E-STOP (Right) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenLibrary}
            className="hidden md:flex flex-col items-center justify-center px-2 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition text-[11px] font-semibold"
            title="Thư viện thuật ngữ & tài liệu"
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Thư viện</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="hidden md:flex flex-col items-center justify-center px-2 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition text-[11px] font-semibold"
            title="Cài đặt giao diện & cỡ chữ"
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Cài đặt</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="hidden md:flex flex-col items-center justify-center px-2 py-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition text-[11px] font-semibold"
            title="Trợ giúp & hướng dẫn"
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>Trợ giúp</span>
          </button>

          {/* Emergency Stop Button (E-STOP) */}
          <button
            onClick={onEmergencyStop}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F0182D] to-[#E11D48] hover:from-[#DC2626] hover:to-[#BE123C] active:scale-95 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-red-500/30 transition border border-red-300/40"
            title="Dừng khẩn cấp toàn bộ hệ thống mô phỏng (Spacebar)"
            aria-label="Emergency Stop"
          >
            <AlertTriangle className="w-4.5 h-4.5 fill-current animate-bounce" />
            <span className="tracking-tight uppercase">E-STOP</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#061F40] border-t border-[#124A8A]/50 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive ? item.activeColor : 'bg-white/5 text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-around pt-2 border-t border-[#124A8A]/40 text-xs text-slate-300">
            <button onClick={onOpenLibrary} className="flex items-center gap-1.5 py-1">
              <BookOpen className="w-4 h-4" /> Thư viện
            </button>
            <button onClick={onOpenSettings} className="flex items-center gap-1.5 py-1">
              <Settings className="w-4 h-4" /> Cài đặt
            </button>
            <button onClick={onOpenHelp} className="flex items-center gap-1.5 py-1">
              <HelpCircle className="w-4 h-4" /> Trợ giúp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
