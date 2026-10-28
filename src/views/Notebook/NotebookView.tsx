import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Copy, 
  Download, 
  Share2, 
  Calculator,
  CheckCircle2,
  Heading,
  Code
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';
import { CanvasGraph } from '../GraphStudio/CanvasGraph';
import { evaluateFormula } from '../../utils/mathParser';

interface NotebookViewProps {
  darkMode: boolean;
  onNavigateToGraph?: (eq: string) => void;
}

type BlockType = 'text' | 'math' | 'graph' | 'calculation';

interface NotebookBlock {
  id: string;
  type: BlockType;
  title?: string;
  content: string; // text content, latex math, or equation for graph
  computedResult?: string;
}

export const NotebookView: React.FC<NotebookViewProps> = ({ darkMode, onNavigateToGraph }) => {
  const [docTitle, setDocTitle] = useState('Calculus Optimization: Maximizing Area');
  const [blocks, setBlocks] = useState<NotebookBlock[]>([
    {
      id: 'b1',
      type: 'text',
      content: '## Problem Statement\nA farmer has 100 meters of fencing and wants to enclose a rectangular pasture bordering a straight river. No fence is needed along the river bank. Find the dimensions that maximize the enclosed area.',
    },
    {
      id: 'b2',
      type: 'math',
      title: 'Constraint Equation',
      content: '2x + y = 100 \\implies y = 100 - 2x',
    },
    {
      id: 'b3',
      type: 'math',
      title: 'Area Objective Function',
      content: 'A(x) = x \\cdot y = x(100 - 2x) = 100x - 2x^2',
    },
    {
      id: 'b4',
      type: 'graph',
      title: 'Graph of Area vs Width x',
      content: 'y = 100*x - 2*x^2',
    },
    {
      id: 'b5',
      type: 'calculation',
      title: 'Critical Point Evaluation (A\'(x) = 100 - 4x = 0)',
      content: 'x = 100 / 4',
      computedResult: '25 meters',
    },
    {
      id: 'b6',
      type: 'calculation',
      title: 'Maximum Enclosed Area A(25)',
      content: '100 * 25 - 2 * (25^2)',
      computedResult: '1250 m²',
    },
  ]);

  const addBlock = (type: BlockType, afterIndex?: number) => {
    let defaultContent = '';
    let title = '';
    let computedResult = '';

    if (type === 'text') {
      defaultContent = 'Enter explanatory notes or mathematical observations here...';
    } else if (type === 'math') {
      defaultContent = 'f(x) = \\int_0^x \\sin(t) \\, dt = 1 - \\cos(x)';
      title = 'Formula Expression';
    } else if (type === 'graph') {
      defaultContent = 'y = sin(x)';
      title = 'Interactive Curve Plot';
    } else if (type === 'calculation') {
      defaultContent = 'sqrt(144) + 2^4';
      title = 'Live Compute';
      computedResult = '28';
    }

    const newBlock: NotebookBlock = {
      id: `block-${Date.now()}`,
      type,
      title,
      content: defaultContent,
      computedResult,
    };

    setBlocks((prev) => {
      if (afterIndex === undefined || afterIndex === prev.length - 1) {
        return [...prev, newBlock];
      }
      const updated = [...prev];
      updated.splice(afterIndex + 1, 0, newBlock);
      return updated;
    });
  };

  const updateBlock = (id: string, updates: Partial<NotebookBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...updates };

        // If it's calculation, re-evaluate
        if (updated.type === 'calculation' && updates.content !== undefined) {
          try {
            const res = evaluateFormula(updates.content);
            if (typeof res === 'number') {
              updated.computedResult = res.toString();
            }
          } catch {
            // keep previous
          }
        }
        return updated;
      })
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleExportMarkdown = () => {
    let md = `# ${docTitle}\n\n`;
    blocks.forEach((b) => {
      if (b.title) md += `### ${b.title}\n`;
      if (b.type === 'math') {
        md += `$$\n${b.content}\n$$\n\n`;
      } else if (b.type === 'calculation') {
        md += `\`${b.content}\` = **${b.computedResult || ''}**\n\n`;
      } else if (b.type === 'graph') {
        md += `*[Interactive Graph: ${b.content}]*\n\n`;
      } else {
        md += `${b.content}\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Central Interactive Document Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-5 pb-16">
          {/* Document Header */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#7655E8] to-[#9333EA] text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    BETA
                  </span>
                  <span className="text-xs text-[#747989]">Interactive Mathematical Notebook</span>
                </div>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="font-bold text-lg sm:text-xl text-[#171923] dark:text-[#F8F8FC] bg-transparent focus:outline-none w-full border-b border-transparent hover:border-[#E7E7ED] focus:border-[#7655E8] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F1F2F6] dark:bg-[#1E1E2B] text-xs font-semibold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#E7E7ED] transition-colors"
                title="Download as Markdown file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Notebook Block Stream */}
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-xs relative group transition-all hover:border-[#7655E8]/40"
              >
                {/* Block Controls Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F1F2F6] dark:border-white/5 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#7655E8]/10 text-[#7655E8] dark:text-[#A78BFA]">
                      {block.type}
                    </span>
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      placeholder="Block title (optional)..."
                      className="text-xs font-semibold text-[#747989] bg-transparent focus:outline-none placeholder-[#9A9EAF]"
                    />
                  </div>

                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="p-1 rounded-md text-[#747989] hover:text-rose-500"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Content by Type */}
                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent text-sm text-[#171923] dark:text-[#E2E4EB] focus:outline-none resize-y leading-relaxed font-sans placeholder-[#9A9EAF]"
                  />
                )}

                {block.type === 'math' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#7655E8]/10 to-transparent border border-[#7655E8]/20 text-center text-sm font-bold text-[#7655E8] dark:text-[#A78BFA]">
                      <KatexRenderer math={block.content} block />
                    </div>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="LaTeX math expression..."
                      className="w-full bg-[#F1F2F6] dark:bg-[#1A1A28] px-3 py-1.5 rounded-xl text-xs font-mono-math text-[#171923] dark:text-[#F8F8FC] focus:outline-none border border-transparent focus:border-[#7655E8]"
                    />
                  </div>
                )}

                {block.type === 'graph' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono-math text-[#747989]">f(x) =</span>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        className="flex-1 bg-[#F1F2F6] dark:bg-[#1A1A28] px-3 py-1.5 rounded-xl text-xs font-mono-math text-[#171923] dark:text-[#F8F8FC] focus:outline-none border border-transparent focus:border-[#7655E8]"
                      />
                    </div>
                    <div className="h-56 rounded-xl overflow-hidden border border-[#E7E7ED] dark:border-white/10 relative">
                      <CanvasGraph
                        expressions={[
                          {
                            id: 'nb-g',
                            latex: block.content,
                            raw: block.content,
                            color: '#7655E8',
                            visible: true,
                            type: 'function',
                          },
                        ]}
                        viewport={{ xMin: -5, xMax: 35, yMin: -200, yMax: 1400 }}
                        onViewportChange={() => {}}
                        scope={{}}
                        darkMode={darkMode}
                        highContrast={false}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'calculation' && (
                  <div className="flex items-center justify-between bg-[#F1F2F6] dark:bg-[#1A1A28] p-3 rounded-xl border border-[#E7E7ED] dark:border-[#27273A]">
                    <div className="flex items-center space-x-2 flex-1">
                      <Calculator className="w-4 h-4 text-[#7655E8]" />
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        className="flex-1 bg-transparent text-xs font-mono-math text-[#171923] dark:text-[#F8F8FC] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-bold font-mono-math text-[#7655E8] dark:text-[#A78BFA]">
                      <span>=</span>
                      <span>{block.computedResult || '...'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Block Command Bar */}
          <div className="flex items-center justify-center space-x-2 p-3 glass-dock rounded-2xl shadow-lg border border-[#E7E7ED] dark:border-white/10">
            <span className="text-xs text-[#747989] font-semibold mr-1">Insert Block:</span>
            <button
              onClick={() => addBlock('text')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#202030] hover:bg-[#7655E8]/10 hover:text-[#7655E8] text-xs font-semibold border border-[#E7E7ED] dark:border-[#303044] transition-all cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => addBlock('math')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#202030] hover:bg-[#7655E8]/10 hover:text-[#7655E8] text-xs font-semibold border border-[#E7E7ED] dark:border-[#303044] transition-all cursor-pointer shadow-xs"
            >
              <Heading className="w-3.5 h-3.5" />
              <span>Formula</span>
            </button>
            <button
              onClick={() => addBlock('graph')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#202030] hover:bg-[#7655E8]/10 hover:text-[#7655E8] text-xs font-semibold border border-[#E7E7ED] dark:border-[#303044] transition-all cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Graph</span>
            </button>
            <button
              onClick={() => addBlock('calculation')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#202030] hover:bg-[#7655E8]/10 hover:text-[#7655E8] text-xs font-semibold border border-[#E7E7ED] dark:border-[#303044] transition-all cursor-pointer shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Compute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
