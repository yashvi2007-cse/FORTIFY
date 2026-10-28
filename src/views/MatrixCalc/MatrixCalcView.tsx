import React, { useState } from 'react';
import { 
  Grid3X3, 
  Plus, 
  Minus, 
  RotateCcw, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Calculator,
  Equal,
  Shuffle
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';

interface MatrixCalcProps {
  darkMode: boolean;
}

type MatrixData = number[][];

export const MatrixCalcView: React.FC<MatrixCalcProps> = ({ darkMode }) => {
  // Matrix A (default 3x3)
  const [matrixA, setMatrixA] = useState<MatrixData>([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2],
  ]);

  // Matrix B (default 3x3)
  const [matrixB, setMatrixB] = useState<MatrixData>([
    [1, 0, 2],
    [3, -2, 1],
    [0, 1, 4],
  ]);

  // Active Selected Matrix Target for Unary Ops
  const [activeMatrixId, setActiveMatrixId] = useState<'A' | 'B'>('A');
  const [scalarK, setScalarK] = useState<number>(2);

  // Result state
  const [resultName, setResultName] = useState<string>('det(A)');
  const [scalarResult, setScalarResult] = useState<number | null>(null);
  const [matrixResult, setMatrixResult] = useState<MatrixData | null>(null);
  const [operationNote, setOperationNote] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Helper: resize matrix
  const resizeMatrix = (
    target: 'A' | 'B',
    deltaRows: number,
    deltaCols: number
  ) => {
    const current = target === 'A' ? matrixA : matrixB;
    const currentRows = current.length;
    const currentCols = current[0]?.length || 1;

    const newRows = Math.min(6, Math.max(1, currentRows + deltaRows));
    const newCols = Math.min(6, Math.max(1, currentCols + deltaCols));

    const next: MatrixData = [];
    for (let r = 0; r < newRows; r++) {
      const row: number[] = [];
      for (let c = 0; c < newCols; c++) {
        if (r < currentRows && c < currentCols) {
          row.push(current[r][c]);
        } else {
          row.push(r === c ? 1 : 0);
        }
      }
      next.push(row);
    }

    if (target === 'A') setMatrixA(next);
    else setMatrixB(next);
  };

  const updateCell = (target: 'A' | 'B', r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const current = target === 'A' ? matrixA : matrixB;
    const next = current.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? num : cell))
    );

    if (target === 'A') setMatrixA(next);
    else setMatrixB(next);
  };

  // Matrix Operations
  const computeDeterminant = (M: MatrixData): number => {
    const n = M.length;
    if (n !== M[0].length) return NaN;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];

    let det = 0;
    for (let c = 0; c < n; c++) {
      const subMatrix = M.slice(1).map((row) => row.filter((_, ci) => ci !== c));
      det += (c % 2 === 0 ? 1 : -1) * M[0][c] * computeDeterminant(subMatrix);
    }
    return det;
  };

  const handleDet = (target: 'A' | 'B') => {
    const M = target === 'A' ? matrixA : matrixB;
    if (M.length !== M[0].length) {
      setOperationNote('Determinant requires a square matrix (n × n).');
      setScalarResult(null);
      setMatrixResult(null);
      return;
    }
    const det = computeDeterminant(M);
    setResultName(`det(${target})`);
    setScalarResult(det);
    setMatrixResult(null);
    setOperationNote(
      det === 0 
        ? `det(${target}) = 0: Matrix is singular (non-invertible).` 
        : `det(${target}) = ${det}. Matrix has full rank and is invertible.`
    );
  };

  const handleTranspose = (target: 'A' | 'B') => {
    const M = target === 'A' ? matrixA : matrixB;
    const rows = M.length;
    const cols = M[0].length;
    const res: MatrixData = [];

    for (let c = 0; c < cols; c++) {
      const row: number[] = [];
      for (let r = 0; r < rows; r++) {
        row.push(M[r][c]);
      }
      res.push(row);
    }

    setResultName(`${target}ᵀ (Transpose)`);
    setMatrixResult(res);
    setScalarResult(null);
    setOperationNote(`Reflected across main diagonal: dimensions changed to ${cols} × ${rows}.`);
  };

  const handleInverse = (target: 'A' | 'B') => {
    const M = target === 'A' ? matrixA : matrixB;
    const n = M.length;
    if (n !== M[0].length) {
      setOperationNote('Inverse requires a square matrix.');
      return;
    }

    const det = computeDeterminant(M);
    if (Math.abs(det) < 1e-12) {
      setOperationNote(`Singular matrix! det(${target}) = 0. No inverse exists.`);
      setMatrixResult(null);
      setScalarResult(null);
      return;
    }

    // Gauss-Jordan elimination on [M | I]
    const aug = M.map((row, i) => [
      ...row,
      ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ]);

    for (let i = 0; i < n; i++) {
      // Pivot
      let maxRow = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(aug[r][i]) > Math.abs(aug[maxRow][i])) maxRow = r;
      }
      const temp = aug[i];
      aug[i] = aug[maxRow];
      aug[maxRow] = temp;

      const pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-12) return;

      for (let c = 0; c < 2 * n; c++) aug[i][c] /= pivot;

      for (let r = 0; r < n; r++) {
        if (r !== i) {
          const factor = aug[r][i];
          for (let c = 0; c < 2 * n; c++) {
            aug[r][c] -= factor * aug[i][c];
          }
        }
      }
    }

    const inv: MatrixData = aug.map((row) =>
      row.slice(n).map((v) => Number(v.toFixed(4)))
    );

    setResultName(`${target}⁻¹ (Inverse Matrix)`);
    setMatrixResult(inv);
    setScalarResult(null);
    setOperationNote(`Satisfies ${target} · ${target}⁻¹ = I. Computed via Gauss-Jordan elimination.`);
  };

  const handleRref = (target: 'A' | 'B') => {
    const M = target === 'A' ? matrixA : matrixB;
    const rows = M.length;
    const cols = M[0].length;
    const A = M.map((r) => [...r]);

    let lead = 0;
    for (let r = 0; r < rows; r++) {
      if (cols <= lead) break;
      let i = r;
      while (Math.abs(A[i][lead]) < 1e-12) {
        i++;
        if (rows === i) {
          i = r;
          lead++;
          if (cols === lead) break;
        }
      }
      if (cols === lead) break;

      const temp = A[i];
      A[i] = A[r];
      A[r] = temp;

      const val = A[r][lead];
      for (let j = 0; j < cols; j++) A[r][j] /= val;

      for (let i2 = 0; i2 < rows; i2++) {
        if (i2 !== r) {
          const factor = A[i2][lead];
          for (let j = 0; j < cols; j++) {
            A[i2][j] -= factor * A[r][j];
          }
        }
      }
      lead++;
    }

    const cleaned = A.map((row) => row.map((v) => Number(v.toFixed(4))));
    setResultName(`rref(${target})`);
    setMatrixResult(cleaned);
    setScalarResult(null);
    setOperationNote(`Reduced Row Echelon Form obtained via elementary row operations.`);
  };

  const handleAdd = () => {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
      setOperationNote('Matrix addition requires matching dimensions (rows and cols).');
      return;
    }
    const res = matrixA.map((row, r) => row.map((cell, c) => cell + matrixB[r][c]));
    setResultName('A + B');
    setMatrixResult(res);
    setScalarResult(null);
    setOperationNote('Element-wise summation (A[i,j] + B[i,j]).');
  };

  const handleMultiply = () => {
    const aRows = matrixA.length;
    const aCols = matrixA[0].length;
    const bRows = matrixB.length;
    const bCols = matrixB[0].length;

    if (aCols !== bRows) {
      setOperationNote(`Incompatible dimensions! Columns of A (${aCols}) must equal rows of B (${bRows}).`);
      return;
    }

    const res: MatrixData = [];
    for (let r = 0; r < aRows; r++) {
      const row: number[] = [];
      for (let c = 0; c < bCols; c++) {
        let sum = 0;
        for (let k = 0; k < aCols; k++) {
          sum += matrixA[r][k] * matrixB[k][c];
        }
        row.push(Number(sum.toFixed(4)));
      }
      res.push(row);
    }

    setResultName('A × B');
    setMatrixResult(res);
    setScalarResult(null);
    setOperationNote(`Matrix dot product: produced ${aRows} × ${bCols} result matrix.`);
  };

  const handleScalarMultiply = (target: 'A' | 'B') => {
    const M = target === 'A' ? matrixA : matrixB;
    const res = M.map((row) => row.map((cell) => Number((cell * scalarK).toFixed(4))));
    setResultName(`${scalarK} · ${target}`);
    setMatrixResult(res);
    setScalarResult(null);
    setOperationNote(`Every entry scaled by factor ${scalarK}.`);
  };

  const handleCopyLatex = () => {
    if (matrixResult) {
      const latex = `\\begin{bmatrix} ${matrixResult.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
      navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center space-x-2.5 pb-2 border-b border-[#E7E7ED] dark:border-[#27273A]">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-white shadow-md">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#171923] dark:text-[#F8F8FC]">Matrix Calculator</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                LINEAR ALGEBRA
              </span>
            </div>
            <p className="text-xs text-[#747989] dark:text-[#9A9EAF]">Determinants, inverses, RREF, matrix multiplication & systems</p>
          </div>
        </div>

        {/* Matrix Editors: Matrix A and Matrix B */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Matrix A Card */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#7655E8]" />
                <h2 className="text-sm font-bold text-[#171923] dark:text-[#F8F8FC]">Matrix [A]</h2>
                <span className="text-xs font-mono-math text-[#747989]">
                  ({matrixA.length} × {matrixA[0]?.length || 0})
                </span>
              </div>

              {/* Dimensions Stepper */}
              <div className="flex items-center space-x-2 text-xs font-mono-math">
                <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] rounded-lg p-0.5 border border-[#E7E7ED] dark:border-[#27273A]">
                  <span className="px-1.5 text-[10px] text-[#747989]">Row</span>
                  <button
                    onClick={() => resizeMatrix('A', -1, 0)}
                    disabled={matrixA.length <= 1}
                    className="p-1 hover:text-[#7655E8] disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1 font-bold">{matrixA.length}</span>
                  <button
                    onClick={() => resizeMatrix('A', 1, 0)}
                    disabled={matrixA.length >= 6}
                    className="p-1 hover:text-[#7655E8] disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] rounded-lg p-0.5 border border-[#E7E7ED] dark:border-[#27273A]">
                  <span className="px-1.5 text-[10px] text-[#747989]">Col</span>
                  <button
                    onClick={() => resizeMatrix('A', 0, -1)}
                    disabled={matrixA[0]?.length <= 1}
                    className="p-1 hover:text-[#7655E8] disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1 font-bold">{matrixA[0]?.length || 0}</span>
                  <button
                    onClick={() => resizeMatrix('A', 0, 1)}
                    disabled={(matrixA[0]?.length || 0) >= 6}
                    className="p-1 hover:text-[#7655E8] disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix A Cells Grid */}
            <div className="overflow-x-auto p-2 bg-[#FAFAFC] dark:bg-[#141420] rounded-xl border border-[#E7E7ED] dark:border-[#222234] flex justify-center">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${matrixA[0]?.length || 1}, minmax(48px, 60px))`,
                }}
              >
                {matrixA.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`a-${r}-${c}`}
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => updateCell('A', r, c, e.target.value)}
                      className="h-10 text-center font-mono-math font-semibold text-xs rounded-lg bg-white dark:bg-[#1D1D2C] border border-[#E7E7ED] dark:border-[#2B2D3A] focus:border-[#7655E8] focus:ring-1 focus:ring-[#7655E8] focus:outline-none"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Matrix B Card */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#17A890]" />
                <h2 className="text-sm font-bold text-[#171923] dark:text-[#F8F8FC]">Matrix [B]</h2>
                <span className="text-xs font-mono-math text-[#747989]">
                  ({matrixB.length} × {matrixB[0]?.length || 0})
                </span>
              </div>

              {/* Dimensions Stepper */}
              <div className="flex items-center space-x-2 text-xs font-mono-math">
                <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] rounded-lg p-0.5 border border-[#E7E7ED] dark:border-[#27273A]">
                  <span className="px-1.5 text-[10px] text-[#747989]">Row</span>
                  <button
                    onClick={() => resizeMatrix('B', -1, 0)}
                    disabled={matrixB.length <= 1}
                    className="p-1 hover:text-[#17A890] disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1 font-bold">{matrixB.length}</span>
                  <button
                    onClick={() => resizeMatrix('B', 1, 0)}
                    disabled={matrixB.length >= 6}
                    className="p-1 hover:text-[#17A890] disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] rounded-lg p-0.5 border border-[#E7E7ED] dark:border-[#27273A]">
                  <span className="px-1.5 text-[10px] text-[#747989]">Col</span>
                  <button
                    onClick={() => resizeMatrix('B', 0, -1)}
                    disabled={matrixB[0]?.length <= 1}
                    className="p-1 hover:text-[#17A890] disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1 font-bold">{matrixB[0]?.length || 0}</span>
                  <button
                    onClick={() => resizeMatrix('B', 0, 1)}
                    disabled={(matrixB[0]?.length || 0) >= 6}
                    className="p-1 hover:text-[#17A890] disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix B Cells Grid */}
            <div className="overflow-x-auto p-2 bg-[#FAFAFC] dark:bg-[#141420] rounded-xl border border-[#E7E7ED] dark:border-[#222234] flex justify-center">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${matrixB[0]?.length || 1}, minmax(48px, 60px))`,
                }}
              >
                {matrixB.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`b-${r}-${c}`}
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => updateCell('B', r, c, e.target.value)}
                      className="h-10 text-center font-mono-math font-semibold text-xs rounded-lg bg-white dark:bg-[#1D1D2C] border border-[#E7E7ED] dark:border-[#2B2D3A] focus:border-[#17A890] focus:ring-1 focus:ring-[#17A890] focus:outline-none"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Operations Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#747989]">Target Matrix:</span>
              <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] p-0.5 rounded-xl border border-[#E7E7ED] dark:border-[#27273A]">
                <button
                  onClick={() => setActiveMatrixId('A')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeMatrixId === 'A'
                      ? 'bg-[#7655E8] text-white shadow-xs'
                      : 'text-[#747989] hover:text-[#171923] dark:hover:text-white'
                  }`}
                >
                  Matrix [A]
                </button>
                <button
                  onClick={() => setActiveMatrixId('B')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeMatrixId === 'B'
                      ? 'bg-[#17A890] text-white shadow-xs'
                      : 'text-[#747989] hover:text-[#171923] dark:hover:text-white'
                  }`}
                >
                  Matrix [B]
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#747989] font-medium">Scalar k:</span>
              <input
                type="number"
                value={scalarK}
                onChange={(e) => setScalarK(parseFloat(e.target.value) || 1)}
                className="w-14 px-2 py-1 rounded-lg font-mono-math bg-[#F1F2F6] dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-center"
              />
              <button
                onClick={() => handleScalarMultiply(activeMatrixId)}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold"
              >
                k · {activeMatrixId}
              </button>
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex flex-wrap gap-2 text-xs font-mono-math">
            <button
              onClick={() => handleDet(activeMatrixId)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E2B] hover:bg-[#7655E8]/15 hover:text-[#7655E8] border border-[#E7E7ED] dark:border-[#2A2A3C] font-bold transition-all cursor-pointer shadow-xs"
            >
              det({activeMatrixId})
            </button>
            <button
              onClick={() => handleInverse(activeMatrixId)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E2B] hover:bg-[#7655E8]/15 hover:text-[#7655E8] border border-[#E7E7ED] dark:border-[#2A2A3C] font-bold transition-all cursor-pointer shadow-xs"
            >
              {activeMatrixId}⁻¹ Inverse
            </button>
            <button
              onClick={() => handleTranspose(activeMatrixId)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E2B] hover:bg-[#7655E8]/15 hover:text-[#7655E8] border border-[#E7E7ED] dark:border-[#2A2A3C] font-bold transition-all cursor-pointer shadow-xs"
            >
              {activeMatrixId}ᵀ Transpose
            </button>
            <button
              onClick={() => handleRref(activeMatrixId)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E2B] hover:bg-[#7655E8]/15 hover:text-[#7655E8] border border-[#E7E7ED] dark:border-[#2A2A3C] font-bold transition-all cursor-pointer shadow-xs"
            >
              rref({activeMatrixId})
            </button>
            <div className="h-8 w-px bg-[#E7E7ED] dark:bg-[#2A2A3C] self-center mx-1" />
            <button
              onClick={handleAdd}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E2B] hover:bg-emerald-500/15 hover:text-emerald-500 border border-[#E7E7ED] dark:border-[#2A2A3C] font-bold transition-all cursor-pointer shadow-xs"
            >
              [A] + [B]
            </button>
            <button
              onClick={handleMultiply}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#7655E8] to-[#06B6D4] text-white font-extrabold hover:opacity-95 shadow-md transition-all cursor-pointer"
            >
              [A] × [B]
            </button>
          </div>
        </div>

        {/* Calculation Result Screen */}
        <div className="glass-panel p-5 rounded-2xl border border-[#E7E7ED] dark:border-white/10 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F2F6] dark:border-white/5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#7655E8]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#171923] dark:text-[#F8F8FC]">
                Result: {resultName}
              </h3>
            </div>
            {matrixResult && (
              <button
                onClick={handleCopyLatex}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F1F2F6] dark:bg-[#202030] text-[11px] font-mono-math text-[#747989] hover:text-[#171923] dark:hover:text-white"
                title="Copy LaTeX matrix notation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'LaTeX'}</span>
              </button>
            )}
          </div>

          {/* Scalar Result Display */}
          {scalarResult !== null && (
            <div className="py-4 text-center">
              <span className="font-mono-math text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#7655E8] to-[#06B6D4] bg-clip-text text-transparent">
                {scalarResult}
              </span>
            </div>
          )}

          {/* Matrix Result Display */}
          {matrixResult !== null && (
            <div className="overflow-x-auto py-2 flex justify-center">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${matrixResult[0]?.length || 1}, minmax(48px, 60px))`,
                }}
              >
                {matrixResult.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`res-${r}-${c}`}
                      className="h-10 flex items-center justify-center font-mono-math font-bold text-xs rounded-lg bg-white dark:bg-[#1D1D2C] border border-[#7655E8]/30 dark:border-[#8E70FF]/30 text-[#7655E8] dark:text-[#A78BFA] shadow-xs"
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {operationNote && (
            <p className="text-xs text-[#747989] leading-relaxed pt-1 border-t border-[#F1F2F6] dark:border-white/5">
              {operationNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
