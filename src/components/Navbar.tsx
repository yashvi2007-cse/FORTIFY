import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Volume2, 
  VolumeX, 
  Eye, 
  Sparkles, 
  Layers, 
  Box, 
  Compass,
  Users,
  Check,
  LayoutGrid,
  Calculator,
  Grid3X3,
  BookOpen,
  Hash,
  Activity,
  ChevronDown
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  audioActive: boolean;
  onToggleAudio: () => void;
  onOpenCommandPalette: () => void;
  onQuickNewGraph?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  highContrast,
  onToggleHighContrast,
  audioActive,
  onToggleAudio,
  onOpenCommandPalette,
  onQuickNewGraph,
}) => {
  const [showMathTools, setShowMathTools] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Calculus Concept Mastered', text: 'You achieved 100% on Derivative Tangent Slopes in GraphIQ.', time: '12m ago', read: false },
    { id: 2, title: 'New 3D Surface: Lorenz Attractor', text: 'Chaotic dynamical attractor now available in 3D Universe.', time: '2h ago', read: false },
    { id: 3, title: 'MathPilot Tip', text: 'Try asking "Why does a parabola have a focal point?" in AI Tutor.', time: '1d ago', read: true },
  ]);

  const desmosTools = [
    { id: 'graph-studio' as NavigationTab, label: 'Graphing', desc: 'Plot 2D curves, sliders & calculus', icon: Activity, badge: '' },
    { id: 'scientific-calc' as NavigationTab, label: 'Scientific', desc: 'Trig, powers, logs & constants', icon: Calculator, badge: '' },
    { id: 'four-function-calc' as NavigationTab, label: 'Four Function', desc: 'Fast arithmetic with receipt tape', icon: Hash, badge: '' },
    { id: 'notebook' as NavigationTab, label: 'Notebook', desc: 'Live documents with math & notes', icon: BookOpen, badge: 'BETA' },
    { id: 'matrix-calc' as NavigationTab, label: 'Matrix', desc: 'Determinants, inverses, RREF & ops', icon: Grid3X3, badge: '' },
    { id: 'geometry-studio' as NavigationTab, label: 'Geometry', desc: 'Compass, ruler & dynamic theorems', icon: Compass, badge: '' },
    { id: '3d-universe' as NavigationTab, label: '3D Calculator', desc: '3D manifolds, surfaces & curves', icon: Box, badge: '3D' },
  ];

  return (
    <header className="h-14 border-b border-[#E7E7ED] dark:border-white/[0.08] bg-white/80 dark:bg-[#101018E6] backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs">
      {/* Left: Brand */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7655E8] via-[#8E70FF] to-[#06B6D4] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(118,85,232,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(118,85,232,0.7)] transition-all">
            <span className="font-serif italic text-lg leading-none select-none">∫</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-base bg-gradient-to-r from-[#171923] via-[#7655E8] to-[#171923] dark:from-[#FFFFFF] dark:via-[#A78BFA] dark:to-[#FFFFFF] bg-clip-text text-transparent">
                FORTIFY
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#7655E8]/15 text-[#7655E8] dark:bg-[#7655E8]/25 dark:text-[#A78BFA] border border-[#7655E8]/20">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-[#747989] dark:text-[#9A9EAF] -mt-0.5 hidden sm:block tracking-wide">
              Mathematics Without Limits
            </div>
          </div>
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F1F2F6] dark:bg-[#1E1E2B] border border-transparent hover:border-[#E7E7ED] dark:hover:border-[#333547] text-left transition-all text-[#747989] dark:text-[#9A9EAF] cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-xs">
            <Search className="w-4 h-4 text-[#747989]" />
            <span>Search functions, tools, or press to plot...</span>
          </div>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#2B2D3A] border border-[#E7E7ED] dark:border-[#383A4A] font-mono text-[#747989]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Math Tools Suite Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMathTools(!showMathTools);
              setShowQuickCreate(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F1F2F6] dark:bg-[#1A1A28] hover:bg-[#E7E7ED] dark:hover:bg-[#252538] text-[#171923] dark:text-[#F8F8FC] text-xs font-bold transition-all border border-[#E7E7ED] dark:border-[#27273A] cursor-pointer"
            title="Explore all Math Tools (Desmos Suite)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#7655E8]" />
            <span className="hidden sm:inline">Math Tools</span>
            <ChevronDown className="w-3 h-3 text-[#747989]" />
          </button>

          {showMathTools && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-dock border border-[#E7E7ED] dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-[#E7E7ED] dark:border-[#27273A] flex items-center justify-between text-[11px] font-bold text-[#747989]">
                <span>EXPLORE ALL MATH TOOLS</span>
                <span className="text-[9px] px-1.5 rounded bg-[#7655E8]/10 text-[#7655E8]">7 TOOLS</span>
              </div>
              <div className="py-1 space-y-0.5 max-h-96 overflow-y-auto">
                {desmosTools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onNavigate(t.id);
                        setShowMathTools(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-[#7655E8]/10 text-[#7655E8] group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-[#171923] dark:text-[#F8F8FC]">{t.label}</span>
                          {t.badge && (
                            <span className="text-[9px] px-1 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#747989] truncate">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B]"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickCreate(!showQuickCreate);
              setShowMathTools(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#7655E8] hover:bg-[#6846D8] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  onQuickNewGraph?.();
                  onNavigate('graph-studio');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 text-left rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8]"
              >
                <Layers className="w-4 h-4 text-[#7655E8]" />
                <span>2D Cartesian Graph</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('3d-universe');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 text-left rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8]"
              >
                <Box className="w-4 h-4 text-[#17A890]" />
                <span>3D Mathematical Surface</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('live-graph');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 text-left rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8]"
              >
                <Users className="w-4 h-4 text-[#F59E0B]" />
                <span>LiveGraph Room</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('ai-tutor');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 text-left rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8]"
              >
                <Sparkles className="w-4 h-4 text-[#EC4899]" />
                <span>AI Tutor Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Sonification Sound Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-xl transition-colors ${
            audioActive
              ? 'bg-[#17A890]/15 text-[#17A890]'
              : 'text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B]'
          }`}
          title={audioActive ? 'Audio Sonification Active' : 'Enable Graph Audio Sonification'}
        >
          {audioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* High Contrast Mode Toggle */}
        <button
          onClick={onToggleHighContrast}
          className={`p-2 rounded-xl transition-colors ${
            highContrast
              ? 'bg-[#7655E8]/15 text-[#7655E8]'
              : 'text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B]'
          }`}
          title="Toggle High Contrast Mode (Accessibility)"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B] transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7655E8]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
                <span className="text-xs font-semibold text-[#171923] dark:text-[#F4F4F8]">Notifications</span>
                <button
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  className="text-[10px] text-[#7655E8] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-[#E7E7ED] dark:divide-[#2B2D3A] max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#171923] dark:text-[#F4F4F8]">{n.title}</span>
                      <span className="text-[10px] text-[#747989]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#747989] dark:text-[#9A9EAF] mt-0.5">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-xl bg-[#F1F2F6] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-center text-[#171923] dark:text-[#F4F4F8] hover:border-[#7655E8] transition-colors"
          >
            <User className="w-4 h-4 text-[#7655E8]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
                <div className="w-9 h-9 rounded-xl bg-[#7655E8] text-white flex items-center justify-center font-bold text-sm">
                  YS
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171923] dark:text-[#F4F4F8]">Dr. Yashvi Surana</div>
                  <div className="text-[10px] text-[#747989]">Mathematics & Physics</div>
                </div>
              </div>
              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('workspace');
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8] flex items-center justify-between"
                >
                  <span>My Workspace</span>
                  <span className="text-[10px] bg-[#E7E7ED] dark:bg-[#2B2D3A] px-1.5 py-0.5 rounded text-[#747989]">8 Graphs</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('knowledge-map');
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8]"
                >
                  Knowledge Map
                </button>
              </div>
              <div className="pt-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between text-[11px] text-[#17A890]">
                <span>Cloud Sync</span>
                <span className="flex items-center space-x-1 font-semibold">
                  <Check className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
