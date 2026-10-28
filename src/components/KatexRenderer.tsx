import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KatexRenderer: React.FC<KatexRendererProps> = ({ math, block = false, className = '' }) => {
  // Convert standard ASCII math into basic LaTeX if not already LaTeX
  const latex = useMemo(() => {
    let expr = math.trim();
    if (!expr) return '';
    // Format simple expressions: e.g. y = x^2 + 3 -> y = x^{2} + 3
    expr = expr.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
    expr = expr.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    expr = expr.replace(/sin\(/g, '\\sin(');
    expr = expr.replace(/cos\(/g, '\\cos(');
    expr = expr.replace(/tan\(/g, '\\tan(');
    expr = expr.replace(/pi/g, '\\pi');
    expr = expr.replace(/theta/g, '\\theta');
    return expr;
  }, [math]);

  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return latex;
    }
  }, [latex, block]);

  return (
    <span
      className={`inline-block font-serif ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
