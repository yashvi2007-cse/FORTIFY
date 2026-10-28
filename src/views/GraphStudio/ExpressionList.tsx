import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Play, 
  Pause, 
  Sliders, 
  Plus, 
  Sigma, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Volume2
} from 'lucide-react';
import { ExpressionItem } from '../../types';
import { KatexRenderer } from '../../components/KatexRenderer';
import { speakEquation } from '../../utils/speech';

interface ExpressionListProps {
  expressions: ExpressionItem[];
  onUpdateExpression: (id: string, updates: Partial<ExpressionItem>) => void;
  onAddExpression: (raw: string, type?: ExpressionItem['type']) => void;
  onRemoveExpression: (id: string) => void;
  selectedId?: string;
  onSelectId: (id: string) => void;
  onOpenKeyboard: () => void;
  onVoiceCommandPrompt?: () => void;
}

const PALETTE = [
  '#7655E8', // Fortify Violet
  '#17A890', // Emerald Teal
  '#F59E0B', // Amber Gold
  '#EF4444', // Coral Red
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#3B82F6', // Royal Blue
];

export const ExpressionList: React.FC<ExpressionListProps> = ({
  expressions,
  onUpdateExpression,
  onAddExpression,
  onRemoveExpression,
  selectedId,
  onSelectId,
  onOpenKeyboard,
}) => {
  const [newInput, setNewInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Animation ticker for active sliders
  useEffect(() => {
    const animatingSliders = expressions.filter(e => e.type === 'slider' && e.isAnimating);
    if (animatingSliders.length === 0) return;

    const interval = setInterval(() => {
      animatingSliders.forEach(slider => {
        const min = slider.sliderMin ?? -10;
        const max = slider.sliderMax ?? 10;
        const step = slider.sliderStep ?? 0.1;
        let nextVal = (slider.sliderVal ?? 0) + step;
        if (nextVal > max) nextVal = min;
        onUpdateExpression(slider.id, { sliderVal: Number(nextVal.toFixed(2)) });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [expressions, onUpdateExpression]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim()) return;

    // Detect if input is a slider assignment like "a = 2" or "k = 5"
    const sliderMatch = newInput.trim().match(/^([a-zA-Z])\s*=\s*(-?\d+(\.\d+)?)$/);
    if (sliderMatch) {
      const param = sliderMatch[1];
      const val = parseFloat(sliderMatch[2]);
      onAddExpression(newInput.trim(), 'slider');
    } else {
      onAddExpression(newInput.trim(), 'function');
    }

    setNewInput('');
  };

  const cycleColor = (item: ExpressionItem) => {
    const currentIndex = PALETTE.indexOf(item.color);
    const nextColor = PALETTE[(currentIndex + 1) % PALETTE.length];
    onUpdateExpression(item.id, { color: nextColor });
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFC] dark:bg-[#15151D] border-r border-[#E7E7ED] dark:border-[#2B2D3A] w-80 sm:w-88 shrink-0">
      {/* Top Header */}
      <div className="p-3 border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#171923] dark:text-[#F4F4F8]">Expressions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E7E7ED] dark:bg-[#2B2D3A] text-[#747989] dark:text-[#9A9EAF]">
            {expressions.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenKeyboard}
            className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-[#F4F4F8] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
            title="Open Math Virtual Keyboard"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddExpression('a = 2', 'slider')}
            className="px-2 py-1 rounded-lg text-[11px] font-medium text-[#7655E8] bg-[#7655E8]/10 hover:bg-[#7655E8]/20 flex items-center space-x-1"
            title="Add slider parameter"
          >
            <Sliders className="w-3 h-3" />
            <span>Slider</span>
          </button>
        </div>
      </div>

      {/* Input bar */}
      <div className="p-2.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A] space-y-2">
        <form onSubmit={handleAddSubmit}>
          <div className="flex items-center bg-white dark:bg-[#1E1E2B] rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] px-2.5 py-1.5 focus-within:border-[#7655E8] focus-within:ring-2 focus-within:ring-[#7655E8]/20 transition-all shadow-xs">
            <span className="text-xs font-serif italic text-[#747989] mr-2">f(x)=</span>
            <input
              type="text"
              placeholder="Type equation (e.g. sin(x), x^2 - 4, a=2)"
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              className="w-full bg-transparent text-xs text-[#171923] dark:text-[#F4F4F8] placeholder-[#747989] focus:outline-none font-mono-math"
            />
            <button
              type="submit"
              className="p-1 text-white bg-[#7655E8] hover:bg-[#6846D8] rounded-lg transition-transform active:scale-95 shadow-xs"
              title="Add Expression"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Math Template Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
          <span className="text-[#8A8F9F] text-[9px] uppercase tracking-wider shrink-0 font-semibold">Try:</span>
          {[
            { label: 'sin(x)', formula: 'y = sin(x)' },
            { label: 'x² - 4', formula: 'y = x^2 - 4' },
            { label: 'cos(2x)', formula: 'y = cos(2*x)' },
            { label: '1/x', formula: 'y = 1/x' },
            { label: 'e^(-x²)', formula: 'y = exp(-x^2)' },
            { label: 'tan(x)', formula: 'y = tan(x)' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onAddExpression(chip.formula, 'function')}
              className="shrink-0 px-2 py-0.5 rounded-full bg-[#F1F2F6] dark:bg-[#20202F] text-[#4B5563] dark:text-[#C7C9D9] hover:bg-[#7655E8]/15 hover:text-[#7655E8] dark:hover:text-[#8E70FF] hover:border-[#7655E8]/30 border border-transparent font-mono-math transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {expressions.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-[#747989]">
            <Sparkles className="w-8 h-8 mb-2 text-[#7655E8] opacity-60 animate-pulse" />
            <p className="text-xs font-medium">No expressions plotted yet</p>
            <p className="text-[11px] mt-1 text-[#8A8F9F]">
              Click a quick template above or enter <span className="font-mono-math text-[#7655E8]">y = sin(x)</span>.
            </p>
          </div>
        ) : (
          expressions.map((item, index) => {
            const isSelected = selectedId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectId(item.id)}
                className={`relative rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'border-[#7655E8] dark:border-[#8E70FF] bg-white dark:bg-[#1C1C2C] shadow-md ring-1 ring-[#7655E8]/30 dark:ring-[#8E70FF]/30'
                    : 'border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#161622] hover:border-[#7655E8]/40 dark:hover:border-[#8E70FF]/40 shadow-xs'
                }`}
              >
                {/* Left Color Indicator Ribbon */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all"
                  style={{ backgroundColor: item.color }}
                />

                {/* Main Card Header */}
                <div className="pl-3.5 pr-2.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-2">
                    {/* Color dot button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleColor(item);
                      }}
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs hover:scale-125 transition-transform cursor-pointer ring-2 ring-white dark:ring-[#161622]"
                      style={{ backgroundColor: item.color }}
                      title="Click to change color"
                    />

                    {/* Expression Content */}
                    <div className="flex-1 min-w-0">
                      {item.type === 'slider' ? (
                        <div className="flex items-center space-x-1.5 text-xs font-mono-math font-semibold text-[#171923] dark:text-[#F4F4F8]">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#7655E8]/10 text-[#7655E8] text-[10px] font-bold">var</span>
                          <span>{item.sliderParam}</span>
                          <span>=</span>
                          <span className="text-[#7655E8] dark:text-[#A78BFA] font-bold">{item.sliderVal}</span>
                        </div>
                      ) : (
                        <div className="truncate text-xs font-mono-math text-[#171923] dark:text-[#F4F4F8] flex items-center space-x-1.5">
                          <KatexRenderer math={item.raw} className="text-xs" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-0.5 shrink-0">
                    {/* Read aloud TTS */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEquation(item.raw);
                      }}
                      className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors"
                      title="Read equation aloud (TTS)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateExpression(item.id, { visible: !item.visible });
                      }}
                      className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors"
                      title={item.visible ? 'Hide Expression' : 'Show Expression'}
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5 text-[#17A890]" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                    </button>

                    {/* Expand calculus tools */}
                    {item.type === 'function' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isExpanded ? 'text-[#7655E8] bg-[#7655E8]/10' : 'text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536]'
                        }`}
                        title="Calculus Tools (Derivatives, Integrals)"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExpression(item.id);
                      }}
                      className="p-1 rounded-md text-[#747989] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      title="Delete Expression"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slider Scrubber & Controls */}
                {item.type === 'slider' && (
                  <div className="pl-4 pr-3 pb-3 pt-1.5 border-t border-[#F1F2F6] dark:border-[#252536] flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateExpression(item.id, { isAnimating: !item.isAnimating });
                      }}
                      className={`p-1.5 rounded-lg text-white ${
                        item.isAnimating ? 'bg-amber-500 shadow-xs animate-pulse' : 'bg-[#7655E8] hover:bg-[#6846D8]'
                      } transition-all cursor-pointer`}
                      title={item.isAnimating ? 'Pause Animation' : 'Play Parameter Animation'}
                    >
                      {item.isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>

                    <span className="text-[10px] text-[#747989] font-mono-math w-6 text-right">{item.sliderMin ?? -10}</span>
                    <input
                      type="range"
                      min={item.sliderMin ?? -10}
                      max={item.sliderMax ?? 10}
                      step={item.sliderStep ?? 0.1}
                      value={item.sliderVal ?? 0}
                      onChange={(e) => {
                        onUpdateExpression(item.id, { sliderVal: parseFloat(e.target.value) });
                      }}
                      className="flex-1 accent-[#7655E8]"
                    />
                    <span className="text-[10px] text-[#747989] font-mono-math w-6">{item.sliderMax ?? 10}</span>
                  </div>
                )}

                {/* Expandable Calculus Options (Derivative / Definite Integral) */}
                {isExpanded && item.type === 'function' && (
                  <div className="px-3 py-2.5 border-t border-[#F1F2F6] dark:border-[#252536] bg-[#FAFAFC] dark:bg-[#181824] rounded-b-xl space-y-2 text-xs">
                    {/* Derivative toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center space-x-1.5 text-[#171923] dark:text-[#F4F4F8] text-[11px]">
                        <span className="font-mono font-bold text-[#7655E8]">f'(x)</span>
                        <span>Show Derivative Curve</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={!!item.showDerivative}
                        onChange={(e) => onUpdateExpression(item.id, { showDerivative: e.target.checked })}
                        className="rounded border-[#E7E7ED] text-[#7655E8] focus:ring-0"
                      />
                    </label>

                    {/* Definite Integral toggle */}
                    <div className="space-y-1">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center space-x-1.5 text-[#171923] dark:text-[#F4F4F8] text-[11px]">
                          <Sigma className="w-3.5 h-3.5 text-[#17A890]" />
                          <span>Shade Definite Integral</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={!!item.showIntegral}
                          onChange={(e) => onUpdateExpression(item.id, { showIntegral: e.target.checked })}
                          className="rounded border-[#E7E7ED] text-[#17A890] focus:ring-0"
                        />
                      </label>

                      {item.showIntegral && (
                        <div className="flex items-center space-x-2 pt-1 text-[11px] text-[#747989]">
                          <span>From a:</span>
                          <input
                            type="number"
                            value={item.integralRange?.[0] ?? -2}
                            onChange={(e) => {
                              const b = item.integralRange?.[1] ?? 2;
                              onUpdateExpression(item.id, { integralRange: [parseFloat(e.target.value) || 0, b] });
                            }}
                            className="w-12 px-1 py-0.5 rounded bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-center font-mono-math"
                          />
                          <span>to b:</span>
                          <input
                            type="number"
                            value={item.integralRange?.[1] ?? 2}
                            onChange={(e) => {
                              const a = item.integralRange?.[0] ?? -2;
                              onUpdateExpression(item.id, { integralRange: [a, parseFloat(e.target.value) || 0] });
                            }}
                            className="w-12 px-1 py-0.5 rounded bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-center font-mono-math"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
