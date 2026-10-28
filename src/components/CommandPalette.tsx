import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Activity, 
  Box, 
  Users, 
  BrainCircuit, 
  Palette, 
  FolderGit2, 
  X,
  Compass,
  ArrowRight,
  Calculator,
  Grid3X3,
  BookOpen,
  Hash
} from 'lucide-react';
import { NavigationTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onQuickPlot?: (equation: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onQuickPlot,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Graphing Calculator', icon: Activity, tab: 'graph-studio' as NavigationTab, desc: 'Interactive 2D Cartesian & Polar graphing with calculus' },
    { label: 'Scientific Calculator', icon: Calculator, tab: 'scientific-calc' as NavigationTab, desc: 'Trigonometry, hyperbolic, powers, logs & memory tape' },
    { label: 'Four Function Calculator', icon: Hash, tab: 'four-function-calc' as NavigationTab, desc: 'Accessible elementary arithmetic with receipt tape' },
    { label: 'Notebook (BETA)', icon: BookOpen, tab: 'notebook' as NavigationTab, desc: 'Computational documents with math, notes & graphs' },
    { label: 'Matrix Calculator', icon: Grid3X3, tab: 'matrix-calc' as NavigationTab, desc: 'Determinants, inverses, RREF & systems of linear equations' },
    { label: 'Geometry Studio', icon: Compass, tab: 'geometry-studio' as NavigationTab, desc: 'Interactive Euclidean ruler & compass dynamic constructions' },
    { label: '3D Calculator / Universe', icon: Box, tab: '3d-universe' as NavigationTab, desc: 'Three.js 3D surface manifolds & space curves' },
    { label: 'AI Math Tutor (MathPilot)', icon: Sparkles, tab: 'ai-tutor' as NavigationTab, desc: 'Step-by-step reasoning & equation guidance' },
    { label: 'LiveGraph Collaboration', icon: Users, tab: 'live-graph' as NavigationTab, desc: 'Real-time multi-user shared graphing workspace' },
    { label: 'Graph IQ', icon: BrainCircuit, tab: 'graph-iq' as NavigationTab, desc: 'Adaptive graph quizzes and mastery challenges' },
    { label: 'Math Art Studio', icon: Palette, tab: 'math-art' as NavigationTab, desc: 'Parametric art, Fractals & Spirographs' },
    { label: 'Math Knowledge Map', icon: Compass, tab: 'knowledge-map' as NavigationTab, desc: 'Interactive visual node map of mathematical topics' },
    { label: 'My Workspace', icon: FolderGit2, tab: 'workspace' as NavigationTab, desc: 'Saved graphs, notes, and simulation projects' },
  ];

  const presets = [
    { label: 'Plot Standard Normal Bell Curve', eq: 'y = (1/sqrt(2*pi)) * exp(-0.5*x^2)' },
    { label: 'Plot Damped Oscillation Wave', eq: 'y = exp(-0.2*x) * sin(3*x)' },
    { label: 'Plot Quadratic in Vertex Form', eq: 'y = 2*(x - 3)^2 - 4' },
    { label: 'Plot Cubic with Inflexion Point', eq: 'y = x^3 - 3*x' },
    { label: 'Plot Rose Curve (Polar)', eq: 'y = cos(4*x)' },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPresets = presets.filter(p =>
    p.label.toLowerCase().includes(query.toLowerCase()) ||
    p.eq.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
          <Search className="w-5 h-5 text-[#747989] dark:text-[#9A9EAF] mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search tools, plot equations, or jump to feature (e.g., 'sin(x)', '3D Universe')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                if (query.includes('=') || query.includes('x') || query.includes('sin') || query.includes('+')) {
                  onQuickPlot?.(query);
                  onNavigate('graph-studio');
                  onClose();
                }
              }
            }}
            className="w-full bg-transparent text-sm text-[#171923] dark:text-[#F4F4F8] placeholder-[#747989] dark:placeholder-[#6C7184] focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="text-[#747989] hover:text-[#171923] dark:hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {query.trim().length > 0 && (
            <div className="px-3 py-2 text-xs font-semibold text-[#747989] dark:text-[#8E93A6] uppercase tracking-wider">
              Quick Action
            </div>
          )}

          {query.trim().length > 0 && (query.includes('x') || query.includes('+') || query.includes('=')) && (
            <button
              onClick={() => {
                onQuickPlot?.(query);
                onNavigate('graph-studio');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left bg-[#7655E8]/10 hover:bg-[#7655E8]/20 text-[#7655E8] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Quick-Plot Equation: <span className="font-mono-math font-semibold">{query}</span></span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="px-3 py-1.5 text-xs font-semibold text-[#747989] dark:text-[#8E93A6] uppercase tracking-wider">
            Navigation
          </div>
          {filteredActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => {
                  onNavigate(action.tab);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#F1F2F6] dark:bg-[#252536] text-[#7655E8]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-[#747989] dark:text-[#8E93A6]">{action.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9A9EAF]" />
              </button>
            );
          })}

          <div className="px-3 pt-3 pb-1.5 text-xs font-semibold text-[#747989] dark:text-[#8E93A6] uppercase tracking-wider">
            Popular Mathematical Curves
          </div>
          {filteredPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickPlot?.(preset.eq);
                onNavigate('graph-studio');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8] transition-colors"
            >
              <div>
                <div className="text-sm font-medium">{preset.label}</div>
                <div className="text-xs font-mono-math text-[#7655E8]">{preset.eq}</div>
              </div>
              <span className="text-xs text-[#747989] bg-[#E7E7ED] dark:bg-[#2B2D3A] px-2 py-0.5 rounded-md">Plot</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-2.5 bg-[#FAFAFC] dark:bg-[#181822] border-t border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between text-xs text-[#747989]">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#2B2D3A] border border-[#E7E7ED] dark:border-[#383A4A] font-mono">Esc</kbd> to close</span>
          <span>Open with <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#2B2D3A] border border-[#E7E7ED] dark:border-[#383A4A] font-mono">⌘K</kbd></span>
        </div>
      </div>
    </div>
  );
};
