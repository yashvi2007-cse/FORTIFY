import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Activity,
  Layers
} from 'lucide-react';
import { ConceptNode, NavigationTab } from '../../types';
import { KatexRenderer } from '../../components/KatexRenderer';

interface KnowledgeMapViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenGraphWithPreset?: (equation: string) => void;
}

export const KnowledgeMapView: React.FC<KnowledgeMapViewProps> = ({
  onNavigateTab,
  onOpenGraphWithPreset,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('quadratics');

  const nodes: ConceptNode[] = [
    {
      id: 'algebra',
      label: 'Linear Algebra & Slopes',
      category: 'Foundations',
      status: 'mastered',
      prerequisites: [],
      description: 'The foundation of coordinate geometry. Linear polynomials of the form y = mx + c represent constant rates of change (derivatives).',
      equationExample: 'y = 2x + 1',
      relatedTab: 'graph-studio',
    },
    {
      id: 'quadratics',
      label: 'Quadratic Polynomials',
      category: 'Functions',
      status: 'mastered',
      prerequisites: ['algebra'],
      description: 'Second-degree polynomials featuring parabolic symmetry, vertices (h, k), and axis of symmetry x = -b/(2a).',
      equationExample: 'y = x^2 - 4x + 3',
      relatedTab: 'graph-studio',
    },
    {
      id: 'discriminant',
      label: 'Discriminant & Roots',
      category: 'Algebra',
      status: 'mastered',
      prerequisites: ['quadratics'],
      description: 'Determines the real vs complex nature of roots based on the sign of Δ = b² - 4ac.',
      equationExample: '\\Delta = b^2 - 4ac',
      relatedTab: 'graph-studio',
    },
    {
      id: 'trigonometry',
      label: 'Trigonometry & Periodic Waves',
      category: 'Functions',
      status: 'in-progress',
      prerequisites: ['algebra'],
      description: 'Harmonic oscillations governed by unit circle projections, sinusoidal periods, amplitudes, and phase shifts.',
      equationExample: 'y = \\sin(2x)',
      relatedTab: 'graph-studio',
    },
    {
      id: 'derivatives',
      label: 'Differential Calculus',
      category: 'Calculus',
      status: 'in-progress',
      prerequisites: ['quadratics', 'trigonometry'],
      description: 'Instantaneous rate of change, tangent slopes, optimization, and inflection points.',
      equationExample: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
      relatedTab: 'graph-studio',
    },
    {
      id: 'integrals',
      label: 'Integral Calculus',
      category: 'Calculus',
      status: 'recommended',
      prerequisites: ['derivatives'],
      description: 'Accumulation of quantities, definite integrals, and area under curved functions (Fundamental Theorem of Calculus).',
      equationExample: '\\int_a^b f(x)\\,dx',
      relatedTab: 'graph-studio',
    },
    {
      id: 'diff-equations',
      label: 'Differential Equations & Motion',
      category: 'Physics & Applied',
      status: 'recommended',
      prerequisites: ['derivatives', 'integrals'],
      description: 'Governs physical dynamical systems like pendulums, projectile drag, and radioactive decay.',
      equationExample: 'm\\frac{d^2x}{dt^2} + \\gamma \\frac{dx}{dt} + kx = 0',
      relatedTab: 'graph-studio',
    },
    {
      id: '3d-surfaces',
      label: '3D Multivariable Manifolds',
      category: 'Multivariable',
      status: 'locked',
      prerequisites: ['derivatives', 'diff-equations'],
      description: 'Surfaces in ℝ³ defined by z = f(x, y), gradient vectors, and saddle points.',
      equationExample: 'z = x^2 - y^2',
      relatedTab: '3d-universe',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[1];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#15151D] overflow-hidden select-none">
      {/* Node Interactive Canvas Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#171923] dark:text-[#F4F4F8]">
                Interactive Math Knowledge Map
              </h2>
              <p className="text-xs text-[#747989]">
                Structured concept graph demonstrating prerequisite pathways and topic mastery.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-[#17A890]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#17A890]" />
                <span>Mastered (3)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#7655E8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7655E8]" />
                <span>In Progress (2)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#747989]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#747989]" />
                <span>Recommended (2)</span>
              </span>
            </div>
          </div>

          {/* Node Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isMastered = node.status === 'mastered';
              const isInProgress = node.status === 'in-progress';
              const isLocked = node.status === 'locked';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7655E8] bg-white dark:bg-[#1E1E2B] shadow-md scale-[1.02]'
                      : 'border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#C4C4D0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
                      {node.category}
                    </span>
                    {isMastered && <CheckCircle2 className="w-4 h-4 text-[#17A890]" />}
                    {isInProgress && (
                      <span className="text-[10px] bg-[#7655E8]/10 text-[#7655E8] px-1.5 py-0.5 rounded font-semibold">
                        In Progress
                      </span>
                    )}
                    {isLocked && <Lock className="w-3.5 h-3.5 text-[#747989]" />}
                  </div>

                  <h3 className="text-xs font-bold text-[#171923] dark:text-[#F4F4F8] mb-1">
                    {node.label}
                  </h3>

                  <div className="text-xs font-bold text-[#7655E8] py-1">
                    <KatexRenderer math={node.equationExample} />
                  </div>

                  {node.prerequisites.length > 0 && (
                    <div className="mt-2 text-[10px] text-[#747989]">
                      Prerequisites: {node.prerequisites.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Concept Detail Column */}
      <div className="w-88 shrink-0 border-l border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#747989] uppercase font-bold tracking-wider">
                {selectedNode.category}
              </span>
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
                {selectedNode.label}
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-center text-sm font-bold text-[#7655E8]">
            <KatexRenderer math={selectedNode.equationExample} block />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Concept Essence
            </span>
            <p className="text-xs text-[#747989] dark:text-[#A6ABB9] leading-relaxed">
              {selectedNode.description}
            </p>
          </div>

          {selectedNode.prerequisites.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
              <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
                Prerequisite Chain
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedNode.prerequisites.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#F1F2F6] dark:bg-[#20202F] text-xs font-medium text-[#171923] dark:text-[#F4F4F8]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="pt-4 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
          <button
            onClick={() => {
              if (selectedNode.relatedTab === 'graph-studio' && onOpenGraphWithPreset) {
                onOpenGraphWithPreset(selectedNode.equationExample);
              }
              onNavigateTab(selectedNode.relatedTab);
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-[#7655E8] hover:bg-[#6846D8] text-white text-xs font-semibold shadow-xs"
          >
            <span>Launch Topic Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
