import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  X, 
  FileCode, 
  Sparkles,
  Download
} from 'lucide-react';
import { ExpressionItem } from '../../types';
import { exportGraphToCode } from '../../utils/mathParser';

interface GraphToCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  expressions: ExpressionItem[];
  scope: Record<string, number>;
}

export const GraphToCodeModal: React.FC<GraphToCodeModalProps> = ({
  isOpen,
  onClose,
  expressions,
  scope,
}) => {
  const [language, setLanguage] = useState<'python' | 'javascript' | 'matlab'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { code, explanation } = exportGraphToCode(expressions, scope, language);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = { python: 'py', javascript: 'js', matlab: 'm' };
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortify_plot.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
                Graph-to-Code Exporter
              </h3>
              <p className="text-[11px] text-[#747989]">
                Export plotted mathematical models into executable Python, JavaScript, or MATLAB scripts.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language selector & actions */}
        <div className="px-5 py-2.5 bg-[#FAFAFC] dark:bg-[#181824] border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {(['python', 'javascript', 'matlab'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  language === lang
                    ? 'bg-[#7655E8] text-white shadow-xs'
                    : 'bg-white dark:bg-[#20202F] text-[#747989] dark:text-[#9A9EAF] border border-[#E7E7ED] dark:border-[#2B2D3A] hover:text-[#171923] dark:hover:text-white'
                }`}
              >
                {lang === 'matlab' ? 'MATLAB / Octave' : lang}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#20202F] border border-[#E7E7ED] dark:border-[#2B2D3A] text-[#171923] dark:text-[#F4F4F8] hover:border-[#7655E8]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#17A890]" /> : <Copy className="w-3.5 h-3.5 text-[#747989]" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-white dark:hover:bg-[#20202F]"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code View Body */}
        <div className="p-5 space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-[#2B2D3A] bg-[#12121A]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#181824] border-b border-[#2B2D3A] text-[10px] text-[#8E93A6] font-mono">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#7655E8]" />
                <span>fortify_plot.{language === 'matlab' ? 'm' : language === 'python' ? 'py' : 'js'}</span>
              </span>
              <span>UTF-8</span>
            </div>
            <pre className="p-4 text-xs font-mono-math text-[#E2E4EB] overflow-x-auto max-h-72 leading-relaxed selection:bg-[#7655E8]/40">
              <code>{code}</code>
            </pre>
          </div>

          <div className="rounded-xl p-3 bg-[#F1F2F6] dark:bg-[#181824] border border-[#E7E7ED] dark:border-[#2B2D3A] text-xs space-y-1">
            <div className="font-semibold text-[#171923] dark:text-[#F4F4F8] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7655E8]" />
              <span>Implementation Architecture</span>
            </div>
            <p className="text-[11px] text-[#747989] dark:text-[#9A9EAF] leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#181824] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#171923] dark:bg-[#F4F4F8] text-white dark:text-[#171923]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
