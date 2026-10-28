import React from 'react';
import { 
  Activity, 
  Sparkles, 
  Box, 
  Compass, 
  ArrowRight, 
  Play, 
  Palette, 
  BrainCircuit, 
  Users, 
  GitFork,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Calculator,
  Grid3X3,
  BookOpen,
  Hash
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { KatexRenderer } from '../../components/KatexRenderer';

interface HomeViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onQuickPlot: (equation: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onQuickPlot,
}) => {
  const quickDemos = [
    {
      title: 'Damped Wave Oscillation',
      category: 'Calculus & Waves',
      eq: 'y = exp(-0.2*x) * sin(3*x)',
      desc: 'Superposition of exponential damping envelope on harmonic sine frequency.',
      tab: 'graph-studio' as NavigationTab,
      badge: '2D Plot',
      color: '#7655E8',
    },
    {
      title: 'Sombrero Wave Manifold',
      category: '3D Geometry',
      eq: 'z = 3 * sin(r) / r',
      desc: 'Radial Bessel-style wave surface in ℝ³ with continuous elevation gradients.',
      tab: '3d-universe' as NavigationTab,
      badge: '3D WebGL',
      color: '#17A890',
    },
    {
      title: 'Normal Gaussian Distribution',
      category: 'Probability & Statistics',
      eq: 'y = (1 / \\sqrt{2\\pi}) \\cdot e^{-0.5x^2}',
      desc: 'Standard Gaussian probability distribution curve with mean 0 and unit variance.',
      tab: 'graph-studio' as NavigationTab,
      badge: 'Calculus',
      color: '#F59E0B',
    },
    {
      title: 'Lissajous Resonance Knot',
      category: 'Mathematical Art',
      eq: 'x = \\sin(5t), \\; y = \\cos(4t)',
      desc: 'Parametric harmonic frequency ratio tracing complex orbital trajectories.',
      tab: 'math-art' as NavigationTab,
      badge: 'Math Art',
      color: '#EC4899',
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto aurora-bg bg-[#FAFAFC] dark:bg-[#0C0C14] text-[#171923] dark:text-[#F8F8FC]">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-7 relative">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#1E1E2BE6] border border-[#7655E8]/30 dark:border-[#7655E8]/40 shadow-[0_0_20px_rgba(118,85,232,0.15)] text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#7655E8]" />
          <span className="bg-gradient-to-r from-[#7655E8] to-[#17A890] bg-clip-text text-transparent font-bold">
            Next-Generation Mathematical Intelligence
          </span>
        </div>

        <div className="space-y-3.5">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight font-sans">
            <span className="bg-gradient-to-br from-[#171923] via-[#4A4568] to-[#7655E8] dark:from-[#FFFFFF] dark:via-[#DDD6FE] dark:to-[#8E70FF] bg-clip-text text-transparent">
              FORTIFY
            </span>
          </h1>
          <p className="text-2xl sm:text-3xl font-serif italic bg-gradient-to-r from-[#7655E8] via-[#A855F7] to-[#17A890] bg-clip-text text-transparent font-normal">
            Mathematics Without Limits.
          </p>
          <p className="text-sm sm:text-base text-[#747989] dark:text-[#9FA4B8] max-w-xl mx-auto leading-relaxed font-normal">
            Explore equations. Understand patterns. Discover possibilities. A unified mathematical workspace combining 2D/3D calculus, AI reasoning, and interactive exploration.
          </p>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigateTab('graph-studio')}
            className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7655E8] to-[#906BFC] hover:from-[#6B48DE] hover:to-[#805BF0] text-white text-xs font-bold shadow-[0_0_28px_rgba(118,85,232,0.5)] hover:shadow-[0_0_40px_rgba(118,85,232,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Open Graph Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('ai-tutor')}
            className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-white/90 dark:bg-[#1E1E2BE0] border border-[#E7E7ED] dark:border-white/10 hover:border-[#7655E8] text-[#171923] dark:text-[#F8F8FC] text-xs font-bold backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#7655E8]" />
            <span>Explore AI Math Tutor</span>
          </button>
        </div>
      </section>

      {/* Explore All of Our Math Tools Suite (Desmos-Style Complete Toolkit) */}
      <section className="px-6 py-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7ED] dark:border-[#2B2D3A] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#171923] dark:text-[#F4F4F8]">
                Explore All of Our Math Tools
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7655E8]/15 text-[#7655E8] dark:text-[#A78BFA] font-bold">
                SUITE
              </span>
            </div>
            <p className="text-xs text-[#747989] dark:text-[#9A9EAF]">
              Every calculator, construction engine, and dynamic computation tool in one unified workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {[
            { id: 'graph-studio' as NavigationTab, label: 'Graphing', desc: 'Plot 2D curves, derivatives & roots', icon: Activity, badge: 'Core', color: 'from-[#7655E8] to-[#906BFC]' },
            { id: 'scientific-calc' as NavigationTab, label: 'Scientific', desc: 'Trigonometry, powers, logs & constants', icon: Calculator, badge: '', color: 'from-[#06B6D4] to-[#3B82F6]' },
            { id: 'four-function-calc' as NavigationTab, label: 'Four Function', desc: 'Elementary arithmetic with receipt tape', icon: Hash, badge: '', color: 'from-[#17A890] to-[#10B981]' },
            { id: 'notebook' as NavigationTab, label: 'Notebook', desc: 'Interactive documents with math & notes', icon: BookOpen, badge: 'BETA', color: 'from-[#F59E0B] to-[#F97316]' },
            { id: 'matrix-calc' as NavigationTab, label: 'Matrix', desc: 'Determinants, inverses, RREF & systems', icon: Grid3X3, badge: '', color: 'from-[#3B82F6] to-[#6366F1]' },
            { id: 'geometry-studio' as NavigationTab, label: 'Geometry', desc: 'Ruler, compass, circles & proofs', icon: Compass, badge: '', color: 'from-[#EC4899] to-[#F43F5E]' },
            { id: '3d-universe' as NavigationTab, label: '3D Calculator', desc: 'WebGL surfaces, curves & manifolds', icon: Box, badge: '3D', color: 'from-[#8B5CF6] to-[#D946EF]' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigateTab(tool.id)}
              className="glass-panel p-4 rounded-2xl border border-[#E7E7ED] dark:border-white/10 hover:border-[#7655E8]/50 text-left transition-all hover:scale-[1.03] active:scale-[0.98] group cursor-pointer shadow-xs flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                {tool.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    tool.badge === 'BETA' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-[#7655E8]/15 text-[#7655E8]'
                  }`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <div className="pt-2">
                <div className="text-xs font-bold text-[#171923] dark:text-[#F8F8FC] group-hover:text-[#7655E8] transition-colors">
                  {tool.label}
                </div>
                <div className="text-[10px] text-[#747989] dark:text-[#9A9EAF] line-clamp-1 mt-0.5">
                  {tool.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Mathematical Explorations Grid */}
      <section className="px-6 py-8 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7ED] dark:border-[#2B2D3A] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
              Featured Mathematical Experiments
            </h2>
            <p className="text-xs text-[#747989]">
              Instant-launch experiments with real calculus models and physical dynamics.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('graph-studio')}
            className="text-xs font-semibold text-[#7655E8] hover:underline flex items-center space-x-1"
          >
            <span>All Features</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickDemos.map((demo, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (demo.tab === 'graph-studio') {
                  onQuickPlot(demo.eq);
                }
                onNavigateTab(demo.tab);
              }}
              className="p-5 rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#7655E8] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
                    {demo.category}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${demo.color}15`, color: demo.color }}
                  >
                    {demo.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8] group-hover:text-[#7655E8] transition-colors">
                  {demo.title}
                </h3>

                <div className="my-2 p-2 rounded-xl bg-[#FAFAFC] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-xs font-mono-math font-semibold truncate text-[#7655E8]">
                  <KatexRenderer math={demo.eq} />
                </div>

                <p className="text-xs text-[#747989] dark:text-[#9A9EAF] leading-relaxed">
                  {demo.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between text-xs font-semibold text-[#7655E8]">
                <span>Launch Interactive Model</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Navigation Highlights */}
      <section className="px-6 py-8 max-w-5xl mx-auto space-y-4">
        <div className="border-b border-[#E7E7ED] dark:border-[#2B2D3A] pb-3">
          <h2 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
            Core Mathematical Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => onNavigateTab('3d-universe')}
            className="p-3.5 rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#17A890] text-left transition-colors"
          >
            <Box className="w-5 h-5 text-[#17A890] mb-2" />
            <div className="font-bold text-[#171923] dark:text-[#F4F4F8]">3D Universe</div>
            <div className="text-[11px] text-[#747989] mt-0.5">Surfaces & Parametric Knots</div>
          </button>

          <button
            onClick={() => onNavigateTab('knowledge-map')}
            className="p-3.5 rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#F59E0B] text-left transition-colors"
          >
            <GitFork className="w-5 h-5 text-[#F59E0B] mb-2" />
            <div className="font-bold text-[#171923] dark:text-[#F4F4F8]">Knowledge Map</div>
            <div className="text-[11px] text-[#747989] mt-0.5">Concepts & Prerequisites</div>
          </button>

          <button
            onClick={() => onNavigateTab('live-graph')}
            className="p-3.5 rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#7655E8] text-left transition-colors"
          >
            <Users className="w-5 h-5 text-[#7655E8] mb-2" />
            <div className="font-bold text-[#171923] dark:text-[#F4F4F8]">LiveGraph</div>
            <div className="text-[11px] text-[#747989] mt-0.5">Real-time Collaboration</div>
          </button>

          <button
            onClick={() => onNavigateTab('graph-iq')}
            className="p-3.5 rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#EC4899] text-left transition-colors"
          >
            <BrainCircuit className="w-5 h-5 text-[#EC4899] mb-2" />
            <div className="font-bold text-[#171923] dark:text-[#F4F4F8]">Graph IQ</div>
            <div className="text-[11px] text-[#747989] mt-0.5">Adaptive Quizzes & Mastery</div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-[#E7E7ED] dark:border-[#2B2D3A] py-6 px-6 text-center text-xs text-[#747989]">
        <p>FORTIFY — Mathematics Without Limits. Crafted for researchers, educators, and students.</p>
      </footer>
    </div>
  );
};
