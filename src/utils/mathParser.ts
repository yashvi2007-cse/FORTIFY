import * as math from 'mathjs';
import { HealthIssue, ExpressionItem } from '../types';

/**
 * Clean user string into math.js compatible expression.
 * Handles forms like:
 * "y = 2x + 3" -> "2*x + 3"
 * "f(x) = x^2" -> "x^2"
 * "a = 4" -> slider variable
 * "y = sin(x)" -> "sin(x)"
 */
export function sanitizeMathString(input: string): string {
  let str = input.trim();
  if (!str) return '';

  // Remove leading 'y =' or 'f(x) =' if present
  str = str.replace(/^y\s*=\s*/i, '');
  str = str.replace(/^f\(x\)\s*=\s*/i, '');
  str = str.replace(/^g\(x\)\s*=\s*/i, '');

  // Add implicit multiplication: e.g. 2x -> 2*x, 3sin(x) -> 3*sin(x), (x+1)(x-2) -> (x+1)*(x-2)
  str = str.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  str = str.replace(/(\))(\()/g, '$1*$2');
  str = str.replace(/(\))([a-zA-Z0-9])/g, '$1*$2');

  return str;
}

export interface CompiledFunction {
  evaluate: (x: number, scope?: Record<string, number>) => number;
  rawExpression: string;
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Safely compiles mathematical expression using mathjs
 * Never uses eval or new Function()
 */
export function compileSafeFunction(exprString: string): CompiledFunction {
  const sanitized = sanitizeMathString(exprString);
  if (!sanitized) {
    return {
      evaluate: () => NaN,
      rawExpression: sanitized,
      hasError: true,
      errorMessage: 'Empty expression',
    };
  }

  try {
    const compiled = math.compile(sanitized);
    return {
      evaluate: (x: number, scope: Record<string, number> = {}) => {
        try {
          const val = compiled.evaluate({ x, ...scope });
          if (typeof val === 'number') {
            return Number.isFinite(val) ? val : NaN;
          }
          if (val && typeof val === 'object' && 're' in val) {
            // Complex number -> if imaginary part is negligible, return real part
            if (Math.abs(val.im) < 1e-10) return val.re;
            return NaN;
          }
          return NaN;
        } catch {
          return NaN;
        }
      },
      rawExpression: sanitized,
      hasError: false,
    };
  } catch (err: any) {
    return {
      evaluate: () => NaN,
      rawExpression: sanitized,
      hasError: true,
      errorMessage: err?.message || 'Invalid syntax',
    };
  }
}

/**
 * Safely evaluates any mathematical expression or arithmetic string
 * using math.js with optional variable scope.
 */
export function evaluateFormula(exprString: string, scope: Record<string, number> = {}): number | string {
  const sanitized = sanitizeMathString(exprString);
  if (!sanitized) return '';
  try {
    const res = math.evaluate(sanitized, scope);
    if (typeof res === 'number') {
      return Number.isFinite(res) ? res : NaN;
    }
    if (res && typeof res === 'object' && 're' in res) {
      if (Math.abs(res.im) < 1e-10) return res.re;
      return `${res.re} + ${res.im}i`;
    }
    return String(res);
  } catch {
    return NaN;
  }
}

/**
 * Numerical derivative approximation using central difference
 */
export function numericalDerivative(
  fn: (x: number, scope?: Record<string, number>) => number,
  x: number,
  scope: Record<string, number> = {},
  h: number = 0.0001
): number {
  const fPlus = fn(x + h, scope);
  const fMinus = fn(x - h, scope);
  if (isNaN(fPlus) || isNaN(fMinus)) return NaN;
  return (fPlus - fMinus) / (2 * h);
}

/**
 * Numerical second derivative approximation for curvature & concavity
 */
export function numericalSecondDerivative(
  fn: (x: number, scope?: Record<string, number>) => number,
  x: number,
  scope: Record<string, number> = {},
  h: number = 0.001
): number {
  const fPlus = fn(x + h, scope);
  const fMid = fn(x, scope);
  const fMinus = fn(x - h, scope);
  if (isNaN(fPlus) || isNaN(fMid) || isNaN(fMinus)) return NaN;
  return (fPlus - 2 * fMid + fMinus) / (h * h);
}

/**
 * Numerical definite integral using Simpson's 1/3 Rule
 */
export function numericalIntegral(
  fn: (x: number, scope?: Record<string, number>) => number,
  a: number,
  b: number,
  scope: Record<string, number> = {},
  n: number = 100
): number {
  if (a === b) return 0;
  if (a > b) return -numericalIntegral(fn, b, a, scope, n);

  const steps = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / steps;
  let sum = fn(a, scope) + fn(b, scope);

  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    const y = fn(x, scope);
    if (isNaN(y)) return NaN;
    sum += (i % 2 === 0 ? 2 : 4) * y;
  }

  return (h / 3) * sum;
}

/**
 * Detect roots (x-intercepts) in viewport range [xMin, xMax]
 */
export function findRootsInRange(
  fn: (x: number, scope?: Record<string, number>) => number,
  xMin: number,
  xMax: number,
  scope: Record<string, number> = {},
  samples: number = 200
): number[] {
  const roots: number[] = [];
  const step = (xMax - xMin) / samples;
  let prevX = xMin;
  let prevY = fn(prevX, scope);

  for (let i = 1; i <= samples; i++) {
    const currentX = xMin + i * step;
    const currentY = fn(currentX, scope);

    if (isNaN(prevY)) {
      prevX = currentX;
      prevY = currentY;
      continue;
    }

    // Exact root
    if (Math.abs(currentY) < 1e-7) {
      roots.push(Number(currentX.toFixed(3)));
    } else if (prevY * currentY < 0 && Math.abs(currentY - prevY) < 50) {
      // Sign change without massive asymptote jump -> bisection refinement
      let left = prevX;
      let right = currentX;
      for (let iter = 0; iter < 12; iter++) {
        const mid = (left + right) / 2;
        const midY = fn(mid, scope);
        if (Math.abs(midY) < 1e-6) {
          left = mid;
          break;
        }
        if (prevY * midY < 0) {
          right = mid;
        } else {
          left = mid;
        }
      }
      const foundRoot = Number(((left + right) / 2).toFixed(3));
      // Avoid duplicate close roots
      if (!roots.some(r => Math.abs(r - foundRoot) < 0.05)) {
        roots.push(foundRoot);
      }
    }

    prevX = currentX;
    prevY = currentY;
  }

  return roots;
}

/**
 * Graph Health Check Engine:
 * Validates syntax, domain restrictions, discontinuities, division by zero, invalid log/sqrt inputs.
 */
export function inspectExpressionHealth(item: ExpressionItem, scope: Record<string, number> = {}): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const raw = item.raw.trim();

  if (!raw) return issues;

  // Check 1: Syntax compilation
  const sanitized = sanitizeMathString(raw);
  try {
    math.parse(sanitized);
  } catch (err: any) {
    issues.push({
      severity: 'error',
      title: 'Syntax Error',
      description: `Could not parse mathematical expression: ${err?.message || 'Invalid syntax'}.`,
      expressionId: item.id,
      suggestion: 'Check for missing parentheses, incomplete operators or unbalanced brackets.',
    });
    return issues;
  }

  // Check 2: Potential division by zero (e.g. 1/x, 1/(x-2))
  if (sanitized.includes('/')) {
    issues.push({
      severity: 'warning',
      title: 'Potential Division by Zero / Vertical Asymptote',
      description: 'Expression contains division. Values of x causing denominator to be 0 produce vertical asymptotes.',
      expressionId: item.id,
      suggestion: 'Ensure domain limits exclude denominator zeros.',
    });
  }

  // Check 3: Logarithms with non-positive domain
  if (/log|ln/.test(sanitized)) {
    issues.push({
      severity: 'info',
      title: 'Logarithmic Domain Restriction',
      description: 'Logarithm functions are only defined for strictly positive arguments (arg > 0).',
      expressionId: item.id,
      suggestion: 'Graph will be undefined for non-positive inputs.',
    });
  }

  // Check 4: Square root negative values
  if (/sqrt|\^0\.5|\^\(1\/2\)/.test(sanitized)) {
    issues.push({
      severity: 'info',
      title: 'Square Root Domain Restriction',
      description: 'Square roots require the radicand to be non-negative (x ≥ 0) for real-valued outputs.',
      expressionId: item.id,
      suggestion: 'Real-number plotting only shows the portion where the expression inside the root is non-negative.',
    });
  }

  // Check 5: Tangent / Secant periodic discontinuities
  if (/tan\(|sec\(/.test(sanitized)) {
    issues.push({
      severity: 'info',
      title: 'Periodic Discontinuities',
      description: 'Trigonometric functions tan(x) and sec(x) possess infinite discontinuities at odd multiples of π/2.',
      expressionId: item.id,
      suggestion: 'Adaptive smoothing filters the asymptotic branches.',
    });
  }

  return issues;
}

/**
 * Graph-to-Code generator:
 * Exports supported expressions into Python, JavaScript, and MATLAB
 */
export function exportGraphToCode(
  expressions: ExpressionItem[],
  scope: Record<string, number> = {},
  language: 'python' | 'javascript' | 'matlab' = 'python'
): { code: string; explanation: string } {
  const activeFunctions = expressions.filter(e => e.visible && e.type === 'function');

  if (activeFunctions.length === 0) {
    return {
      code: '# No active functions plotted yet.',
      explanation: 'Add at least one function in Graph Studio to generate exportable code.',
    };
  }

  if (language === 'python') {
    const fnDefs = activeFunctions.map((fn, idx) => {
      let pyExpr = sanitizeMathString(fn.raw)
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'np.sin(')
        .replace(/cos\(/g, 'np.cos(')
        .replace(/tan\(/g, 'np.tan(')
        .replace(/exp\(/g, 'np.exp(')
        .replace(/log\(/g, 'np.log(')
        .replace(/sqrt\(/g, 'np.sqrt(')
        .replace(/pi/g, 'np.pi');
      
      // Inject slider values if present
      Object.entries(scope).forEach(([param, val]) => {
        const regex = new RegExp(`\\b${param}\\b`, 'g');
        pyExpr = pyExpr.replace(regex, val.toString());
      });

      return `y${idx + 1} = ${pyExpr}  # Function: ${fn.raw}\nplt.plot(x, y${idx + 1}, label='${fn.raw}', color='${fn.color}', linewidth=2)`;
    }).join('\n\n');

    const code = `import numpy as np
import matplotlib.pyplot as plt

# FORTIFY Graph-to-Code Generator
# Generates high-resolution publication-ready Matplotlib figure

# 1. Domain configuration
x = np.linspace(-10, 10, 1000)

# 2. Evaluate mathematical curves
${fnDefs}

# 3. Canvas formatting & grid
plt.axhline(0, color='#888888', linewidth=0.8, linestyle='--')
plt.axvline(0, color='#888888', linewidth=0.8, linestyle='--')
plt.grid(True, linestyle=':', alpha=0.6)
plt.title('FORTIFY Mathematical Plot', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('x')
plt.ylabel('y')
plt.legend(frameon=True, facecolor='white', framealpha=0.9)
plt.tight_layout()

# 4. Display plot
plt.show()`;

    return {
      code,
      explanation: 'Python implementation using NumPy vectorization for rapid array evaluation and Matplotlib for clean graphing with legends and axes.',
    };
  }

  if (language === 'javascript') {
    const fnEvals = activeFunctions.map((fn, idx) => {
      let jsExpr = sanitizeMathString(fn.raw)
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pi/g, 'Math.PI');

      Object.entries(scope).forEach(([param, val]) => {
        const regex = new RegExp(`\\b${param}\\b`, 'g');
        jsExpr = jsExpr.replace(regex, val.toString());
      });

      return `const f${idx + 1} = (x) => ${jsExpr}; // ${fn.raw}`;
    }).join('\n');

    const code = `// FORTIFY Graph-to-Code: JavaScript Engine
// Standalone evaluation and HTML5 Canvas drawing snippet

${fnEvals}

// Evaluate sample values:
const sampleX = [-2, -1, 0, 1, 2];
console.log('Sample Evaluations:');
sampleX.forEach(x => {
  ${activeFunctions.map((_, i) => `console.log(\`f${i + 1}(\${x}) = \${f${i + 1}(x)}\`);`).join('\n  ')}
});`;

    return {
      code,
      explanation: 'Pure JavaScript function closures using standard Math functions, suitable for Node.js, Web workers, or HTML5 Canvas integration.',
    };
  }

  // MATLAB
  const matlabFns = activeFunctions.map((fn, idx) => {
    let mExpr = sanitizeMathString(fn.raw)
      .replace(/\^/g, '.^')
      .replace(/\*/g, '.*')
      .replace(/\//g, './');

    Object.entries(scope).forEach(([param, val]) => {
      const regex = new RegExp(`\\b${param}\\b`, 'g');
      mExpr = mExpr.replace(regex, val.toString());
    });

    return `y${idx + 1} = ${mExpr};\nplot(x, y${idx + 1}, 'LineWidth', 2, 'DisplayName', '${fn.raw}');\nhold on;`;
  }).join('\n\n');

  const code = `% FORTIFY Graph-to-Code: MATLAB / GNU Octave
% High precision vector computation

clc; clear; close all;

% Domain setup
x = linspace(-10, 10, 1000);

% Plot expressions
figure('Color', 'w');
${matlabFns}

grid on;
box on;
xlabel('x', 'FontSize', 12);
ylabel('f(x)', 'FontSize', 12);
title('FORTIFY Mathematical Computation', 'FontSize', 14);
legend('show', 'Location', 'northeast');
set(gca, 'XAxisLocation', 'origin', 'YAxisLocation', 'origin');`;

  return {
    code,
    explanation: 'MATLAB / GNU Octave script using element-wise vector operators (.^, .*, ./) for high efficiency and clean publication plotting.',
  };
}
