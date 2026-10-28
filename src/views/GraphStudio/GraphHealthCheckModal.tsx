import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  X, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ExpressionItem, HealthIssue } from '../../types';
import { inspectExpressionHealth } from '../../utils/mathParser';

interface GraphHealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  expressions: ExpressionItem[];
  scope: Record<string, number>;
  onApplyFix?: (expressionId: string, fixedExpr: string) => void;
}

export const GraphHealthCheckModal: React.FC<GraphHealthCheckModalProps> = ({
  isOpen,
  onClose,
  expressions,
  scope,
  onApplyFix,
}) => {
  if (!isOpen) return null;

  // Aggregate health issues across all expressions
  const allIssues: { item: ExpressionItem; issue: HealthIssue }[] = [];
  expressions.forEach((item) => {
    const issues = inspectExpressionHealth(item, scope);
    issues.forEach((issue) => {
      allIssues.push({ item, issue });
    });
  });

  const errorCount = allIssues.filter(i => i.issue.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.issue.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.issue.severity === 'info').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#17A890]/10 text-[#17A890]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
                Graph Health & Domain Diagnostics
              </h3>
              <p className="text-[11px] text-[#747989]">
                Live mathematical inspection of asymptotes, singularities, and domain bounds.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 bg-[#FAFAFC] dark:bg-[#181824] border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-medium text-red-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorCount} Errors</span>
            </span>
            <span className="flex items-center space-x-1 font-medium text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount} Warnings</span>
            </span>
            <span className="flex items-center space-x-1 font-medium text-blue-500">
              <Info className="w-3.5 h-3.5" />
              <span>{infoCount} Domain Notes</span>
            </span>
          </div>
          <span className="text-[11px] text-[#747989]">
            {expressions.length} Expressions scanned
          </span>
        </div>

        {/* Diagnostic Issues List */}
        <div className="p-5 max-h-[380px] overflow-y-auto space-y-3">
          {allIssues.length === 0 ? (
            <div className="py-8 text-center text-[#747989] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#17A890] mx-auto opacity-80" />
              <div className="text-xs font-bold text-[#171923] dark:text-[#F4F4F8]">
                100% Mathematical Health Passed
              </div>
              <p className="text-[11px] text-[#747989] max-w-sm mx-auto">
                All currently active expressions have valid syntax, real-valued domains, and well-behaved continuity across the viewport.
              </p>
            </div>
          ) : (
            allIssues.map(({ item, issue }, idx) => {
              const isError = issue.severity === 'error';
              const isWarn = issue.severity === 'warning';

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 text-xs transition-colors ${
                    isError
                      ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                      : isWarn
                      ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {isError && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      {isWarn && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {!isError && !isWarn && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
                      <span className="font-bold text-[#171923] dark:text-[#F4F4F8]">
                        {issue.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] bg-white dark:bg-[#1A1A26] px-1.5 py-0.5 rounded border border-[#E7E7ED] dark:border-[#2B2D3A]">
                      {item.raw}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#747989] dark:text-[#9A9EAF] leading-relaxed">
                    {issue.description}
                  </p>

                  {issue.suggestion && (
                    <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-[#171923] dark:text-[#E2E4EB]">
                        <span className="font-semibold text-[#7655E8]">Suggestion: </span>
                        {issue.suggestion}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#181824] flex items-center justify-between text-xs">
          <span className="text-[#747989] text-[11px]">
            Strict Mode: User formulas are never silently rewritten.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-medium bg-[#171923] dark:bg-[#F4F4F8] text-white dark:text-[#171923] hover:opacity-90"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
