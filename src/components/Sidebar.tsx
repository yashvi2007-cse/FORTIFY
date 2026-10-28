import React from 'react';
import { 
  Home, 
  Activity, 
  Calculator,
  Hash,
  BookOpen,
  Grid3X3,
  Compass,
  Box, 
  Sparkles, 
  Users, 
  BrainCircuit, 
  Palette, 
  GitFork, 
  FolderGit2, 
  ChevronLeft, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  // Desmos-Style Core Math Tools
  const mathSuiteItems = [
    { id: 'graph-studio' as NavigationTab, label: 'Graphing', icon: Activity, badge: 'Core' },
    { id: 'scientific-calc' as NavigationTab, label: 'Scientific', icon: Calculator, badge: '' },
    { id: 'four-function-calc' as NavigationTab, label: 'Four Function', icon: Hash, badge: '' },
    { id: 'notebook' as NavigationTab, label: 'Notebook', icon: BookOpen, badge: 'BETA' },
    { id: 'matrix-calc' as NavigationTab, label: 'Matrix', icon: Grid3X3, badge: '' },
    { id: 'geometry-studio' as NavigationTab, label: 'Geometry', icon: Compass, badge: '' },
    { id: '3d-universe' as NavigationTab, label: '3D Calculator', icon: Box, badge: '3D' },
  ];

  // AI & Interactive Learning Labs
  const labItems = [
    { id: 'home' as NavigationTab, label: 'Overview', icon: Home, badge: '' },
    { id: 'ai-tutor' as NavigationTab, label: 'MathPilot AI', icon: Sparkles, badge: 'AI' },
    { id: 'graph-iq' as NavigationTab, label: 'Graph IQ', icon: BrainCircuit, badge: 'XP' },
    { id: 'math-art' as NavigationTab, label: 'Math Art', icon: Palette, badge: '' },
    { id: 'live-graph' as NavigationTab, label: 'Live Collaboration', icon: Users, badge: '' },
    { id: 'knowledge-map' as NavigationTab, label: 'Knowledge Map', icon: GitFork, badge: '' },
    { id: 'workspace' as NavigationTab, label: 'My Workspace', icon: FolderGit2, badge: '' },
  ];

  const renderNavButton = (item: { id: NavigationTab; label: string; icon: React.ComponentType<any>; badge: string }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all group relative cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-[#7655E8] to-[#906BFC] text-white shadow-[0_4px_14px_rgba(118,85,232,0.35)] scale-[1.02]'
            : 'text-[#747989] dark:text-[#9A9EAF] hover:text-[#171923] dark:hover:text-[#F4F4F8] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B] hover:translate-x-0.5'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-transform ${
            isActive ? 'text-white scale-110 drop-shadow-xs' : 'group-hover:scale-110 group-hover:text-[#7655E8]'
          } ${collapsed ? 'mx-auto' : 'mr-3'}`}
        />

        {!collapsed && (
          <div className="flex-1 flex items-center justify-between text-left truncate">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  item.badge === 'BETA' 
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F1F2F6] dark:bg-[#252536] text-[#747989] dark:text-[#8E93A6]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] border-r border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#13131E] flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Nav links with categorized sections */}
      <div className="p-2 space-y-3 overflow-y-auto">
        {/* Section 1: Desmos Core Math Suite */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9A9EAF] dark:text-[#6E7287]">
              Math Tools Suite
            </div>
          )}
          <div className="space-y-0.5">
            {mathSuiteItems.map(renderNavButton)}
          </div>
        </div>

        {/* Section 2: AI & Exploration Labs */}
        <div className="pt-1 border-t border-[#E7E7ED]/60 dark:border-[#27273A]">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9A9EAF] dark:text-[#6E7287]">
              Intelligent Labs
            </div>
          )}
          <div className="space-y-0.5">
            {labItems.map(renderNavButton)}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A] space-y-1">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-[#747989] dark:text-[#9A9EAF] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="w-full flex items-center justify-between px-1 text-xs">
              <span>Collapse Sidebar</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
