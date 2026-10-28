import React, { useState } from 'react';
import { 
  Sparkles, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  X,
  Target,
  Zap
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';

interface EquationDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToGraph: (equation: string, sliders?: { param: string; val: number }[]) => void;
}

export const EquationDiscoveryModal: React.FC<EquationDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onApplyToGraph,
}) => {
  const [topic, setTopic] = useState<'quadratic' | 'sinusoid' | 'exponential'>('quadratic');

  // Quadratic parameters: ax^2 + bx + c
  const [a, setA] = useState(1);
  const [b, setB] = useState(-4);
  const [c, setC] = useState(3);

  // Sinusoidal parameters: A*sin(B*x - C) + D
  const [amp, setAmp] = useState(2);
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);

  if (!isOpen) return null;

  // Quadratic Calculations
  const discriminant = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  let rootNature = '';
  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootNature = `Two Distinct Real Roots: x₁ = ${r1.toFixed(2)}, x₂ = ${r2.toFixed(2)}`;
  } else if (discriminant === 0) {
    rootNature = `One Repeated Real Root: x = ${vertexX.toFixed(2)} (Vertex touches x-axis)`;
  } else {
    rootNature = 'No Real Roots (Curve does not intersect x-axis, Δ < 0)';
  }

  const handleApplyQuadratic = () => {
    const eq = `y = ${a}*x^2 + ${b}*x + ${c}`.replace(/\+\s*-/g, '- ');
    onApplyToGraph(eq, [
      { param: 'a', val: a },
      { param: 'b', val: b },
      { param: 'c', val: c },
    ]);
    onClose();
  };

  const handleApplySinusoid = () => {
    const eq = `y = ${amp}*sin(${freq}*x - ${phase})`;
    onApplyToGraph(eq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
                Equation Discovery Engine
              </h3>
              <p className="text-[11px] text-[#747989]">
                Live parameter exploration revealing the geometry behind algebraic formulas.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discovery Topics */}
        <div className="px-5 pt-3 flex space-x-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
          <button
            onClick={() => setTopic('quadratic')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              topic === 'quadratic'
                ? 'border-[#7655E8] text-[#7655E8]'
                : 'border-transparent text-[#747989] hover:text-[#171923] dark:hover:text-white'
            }`}
          >
            Quadratic & Discriminant Lab
          </button>
          <button
            onClick={() => setTopic('sinusoid')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              topic === 'sinusoid'
                ? 'border-[#7655E8] text-[#7655E8]'
                : 'border-transparent text-[#747989] hover:text-[#171923] dark:hover:text-white'
            }`}
          >
            Harmonic Sinusoid Transformations
          </button>
        </div>

        <div className="p-5 max-h-[460px] overflow-y-auto space-y-4">
          {topic === 'quadratic' ? (
            <div className="space-y-4">
              {/* Formula & Live readout */}
              <div className="bg-[#FAFAFC] dark:bg-[#181824] rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#747989] uppercase tracking-wider">
                    General Form
                  </div>
                  <div className="text-base font-bold text-[#171923] dark:text-[#F4F4F8] mt-0.5">
                    <KatexRenderer math={`f(x) = ${a}x^2 + (${b})x + (${c})`} />
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#20202F] border border-[#E7E7ED] dark:border-[#2B2D3A]">
                    <div className="text-[10px] text-[#747989]">Discriminant (Δ)</div>
                    <div className={`font-mono-math font-bold ${discriminant >= 0 ? 'text-[#17A890]' : 'text-[#EF4444]'}`}>
                      {discriminant.toFixed(1)}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#20202F] border border-[#E7E7ED] dark:border-[#2B2D3A]">
                    <div className="text-[10px] text-[#747989]">Vertex (h, k)</div>
                    <div className="font-mono-math font-bold text-[#7655E8]">
                      ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 bg-white dark:bg-[#1A1A26] rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] p-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#171923] dark:text-[#F4F4F8]">Leading Coefficient (a): {a}</span>
                    <span className="text-[#747989] text-[11px]">{a > 0 ? 'Opens Upwards (Concave Up)' : 'Opens Downwards (Concave Down)'}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.2"
                    value={a}
                    onChange={(e) => setA(parseFloat(e.target.value) || 0.1)}
                    className="w-full accent-[#7655E8]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#171923] dark:text-[#F4F4F8]">Linear Term (b): {b}</span>
                    <span className="text-[#747989] text-[11px]">Axis of Symmetry: x = {-b / (2 * a)}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="0.5"
                    value={b}
                    onChange={(e) => setB(parseFloat(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#171923] dark:text-[#F4F4F8]">Vertical Offset / y-intercept (c): {c}</span>
                    <span className="text-[#747989] text-[11px]">Intersection with y-axis: (0, {c})</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="0.5"
                    value={c}
                    onChange={(e) => setC(parseFloat(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>
              </div>

              {/* Discovery Insights */}
              <div className="p-3.5 rounded-xl bg-[#7655E8]/5 border border-[#7655E8]/20 text-xs space-y-1.5">
                <div className="font-bold text-[#7655E8] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Mathematical Discovery Insights</span>
                </div>
                <div className="text-[11px] text-[#171923] dark:text-[#E2E4EB] leading-relaxed">
                  • <span className="font-semibold">{rootNature}</span>
                </div>
                <div className="text-[11px] text-[#747989] dark:text-[#9A9EAF] leading-relaxed">
                  • Because <span className="font-mono-math font-semibold">{a > 0 ? 'a > 0' : 'a < 0'}</span>, the vertex represents a global <span className="font-semibold">{a > 0 ? 'minimum' : 'maximum'}</span> at y = {vertexY.toFixed(2)}.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#FAFAFC] dark:bg-[#181824] rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] p-4">
                <div className="text-[11px] font-semibold text-[#747989] uppercase tracking-wider">
                  Sinusoid Transformation Form
                </div>
                <div className="text-base font-bold text-[#171923] dark:text-[#F4F4F8] mt-0.5">
                  <KatexRenderer math={`y = ${amp}\\sin(${freq}x - ${phase})`} />
                </div>
              </div>

              <div className="space-y-3 bg-white dark:bg-[#1A1A26] rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] p-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#171923] dark:text-[#F4F4F8]">Amplitude (A): {amp}</span>
                    <span className="text-[#747989] text-[11px]">Range: [{-amp}, {amp}]</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={amp}
                    onChange={(e) => setAmp(parseFloat(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-[#171923] dark:text-[#F4F4F8]">Angular Frequency (B): {freq}</span>
                    <span className="text-[#747989] text-[11px]">Period T = 2π/{freq} ≈ {(2 * Math.PI / freq).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={freq}
                    onChange={(e) => setFreq(parseFloat(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#181824] flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
          >
            Close
          </button>
          <button
            onClick={topic === 'quadratic' ? handleApplyQuadratic : handleApplySinusoid}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#7655E8] hover:bg-[#6846D8] text-white"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply to Graph Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
