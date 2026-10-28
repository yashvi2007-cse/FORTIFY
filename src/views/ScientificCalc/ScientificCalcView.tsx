import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  ArrowUpRight, 
  History, 
  Trash2, 
  Sparkles,
  Delete,
  CornerDownLeft
} from 'lucide-react';
import { evaluateFormula } from '../../utils/mathParser';
import { speakEquation } from '../../utils/speech';

interface ScientificCalcProps {
  darkMode: boolean;
  onNavigateToGraph?: (equation: string) => void;
}

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export const ScientificCalcView: React.FC<ScientificCalcProps> = ({ darkMode, onNavigateToGraph }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<string>('0');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isInverse, setIsInverse] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', expression: 'sin(45) * sqrt(2)', result: '1', timestamp: Date.now() - 360000 },
    { id: '2', expression: '2^10 + log(1000)', result: '1027', timestamp: Date.now() - 180000 },
    { id: '3', expression: 'e^2 + pi', result: '10.5307', timestamp: Date.now() - 60000 },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live result as user types
  useEffect(() => {
    if (!expression.trim()) {
      setResult('');
      return;
    }

    try {
      // Handle angle unit if needed
      let parsed = expression;
      if (angleUnit === 'deg') {
        // Wrap trig args to convert deg to rad
        parsed = parsed.replace(/sin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
        parsed = parsed.replace(/cos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
        parsed = parsed.replace(/tan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
      }

      const res = evaluateFormula(parsed, { Ans: parseFloat(ans) || 0, ans: parseFloat(ans) || 0 });
      if (typeof res === 'number') {
        if (!isFinite(res) || isNaN(res)) {
          setResult('Undefined');
        } else {
          // Format nicely
          const formatted = Math.abs(res) < 1e-6 && res !== 0
            ? res.toExponential(4)
            : Number(res.toFixed(8)).toString();
          setResult(formatted);
        }
      } else {
        setResult('');
      }
    } catch {
      // Incomplete syntax while typing, keep current result quiet
    }
  }, [expression, angleUnit, ans]);

  const appendToExpression = (val: string) => {
    setExpression((prev) => prev + val);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleExecute = () => {
    if (!expression.trim() || !result || result === 'Undefined') return;

    // Save to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
    setAns(result);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMemoryStore = () => {
    const val = parseFloat(result) || parseFloat(expression) || 0;
    setMemory(val);
  };

  const handleMemoryAdd = () => {
    const val = parseFloat(result) || 0;
    setMemory((prev) => prev + val);
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleSendToGraph = () => {
    if (!onNavigateToGraph) return;
    const eq = expression.includes('x') ? `y = ${expression}` : `y = ${expression || result || '0'}`;
    onNavigateToGraph(eq);
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Center Calculator Body */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto p-4 sm:p-6 overflow-y-auto justify-between">
        {/* Top Header & Modes */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7655E8] to-[#06B6D4] text-white shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-[#171923] dark:text-[#F8F8FC]">Scientific Calculator</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7655E8]/15 text-[#7655E8] dark:text-[#A78BFA] font-bold">
                  PRECISION
                </span>
              </div>
              <p className="text-xs text-[#747989] dark:text-[#9A9EAF]">Advanced mathematical operations, trigonometry & functions</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* DEG / RAD Switch */}
            <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1A1A28] p-0.5 rounded-xl border border-[#E7E7ED] dark:border-[#27273A]">
              <button
                onClick={() => setAngleUnit('deg')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  angleUnit === 'deg'
                    ? 'bg-white dark:bg-[#7655E8] text-[#7655E8] dark:text-white shadow-xs'
                    : 'text-[#747989] hover:text-[#171923] dark:hover:text-white'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => setAngleUnit('rad')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  angleUnit === 'rad'
                    ? 'bg-white dark:bg-[#7655E8] text-[#7655E8] dark:text-white shadow-xs'
                    : 'text-[#747989] hover:text-[#171923] dark:hover:text-white'
                }`}
              >
                RAD
              </button>
            </div>

            {/* Toggle History Tape button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl border transition-all ${
                showHistory 
                  ? 'border-[#7655E8] bg-[#7655E8]/10 text-[#7655E8]' 
                  : 'border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1E1E2B]'
              }`}
              title="Toggle Calculation History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 mb-4 border border-[#E7E7ED] dark:border-white/10 shadow-lg relative flex flex-col justify-between min-h-[120px]">
          {/* Top Info Bar inside display */}
          <div className="flex items-center justify-between text-[11px] text-[#747989] font-mono-math pb-2">
            <div className="flex items-center space-x-2">
              <span className="uppercase font-bold tracking-wider text-[#7655E8]">{angleUnit}</span>
              {memory !== 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                  M = {memory}
                </span>
              )}
            </div>
            {ans !== '0' && <span>Ans = {ans}</span>}
          </div>

          {/* Interactive Formula Input */}
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="w-full bg-transparent text-right font-mono-math text-xl sm:text-2xl text-[#171923] dark:text-[#F8F8FC] focus:outline-none placeholder-[#9A9EAF]"
          />

          {/* Evaluation Result */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E7E7ED]/50 dark:border-white/5 mt-2">
            <div className="flex items-center space-x-1.5">
              {result && (
                <>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white transition-colors"
                    title="Copy result"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => speakEquation(result)}
                    className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white transition-colors"
                    title="Speak result"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {onNavigateToGraph && (
                    <button
                      onClick={handleSendToGraph}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#7655E8]/10 hover:bg-[#7655E8]/20 text-[#7655E8] text-[10px] font-semibold transition-colors"
                      title="Plot this function or value in Graph Studio"
                    >
                      <span>Plot</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-[#747989] mr-2 font-mono-math">=</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono-math bg-gradient-to-r from-[#7655E8] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
                {result || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Scientific Keypad Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 sm:gap-2 text-xs font-mono-math">
          {/* Row 1: Function toggles & Memory */}
          <button
            onClick={() => setIsInverse(!isInverse)}
            className={`p-2.5 rounded-xl border font-bold transition-all ${
              isInverse 
                ? 'bg-[#7655E8] text-white border-[#7655E8]' 
                : 'bg-white dark:bg-[#1A1A28] border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252538]'
            }`}
          >
            2nd
          </button>
          <button
            onClick={handleMemoryStore}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-bold transition-all"
            title="Store to Memory"
          >
            MS
          </button>
          <button
            onClick={() => appendToExpression(memory.toString())}
            disabled={memory === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] disabled:opacity-40 hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-bold transition-all"
            title="Recall Memory"
          >
            MR
          </button>
          <button
            onClick={handleMemoryAdd}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-bold transition-all"
            title="Add to Memory"
          >
            M+
          </button>
          <button
            onClick={handleMemoryClear}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-bold transition-all"
            title="Clear Memory"
          >
            MC
          </button>
          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-100 transition-all col-span-1"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="p-2.5 rounded-xl bg-[#F1F2F6] dark:bg-[#222232] border border-[#E7E7ED] dark:border-[#2D2D40] text-[#747989] hover:text-rose-500 font-bold transition-all hidden sm:flex items-center justify-center"
          >
            <Delete className="w-4 h-4" />
          </button>

          {/* Row 2: Trig & Powers */}
          <button
            onClick={() => appendToExpression(isInverse ? 'asin(' : 'sin(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            {isInverse ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => appendToExpression(isInverse ? 'acos(' : 'cos(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            {isInverse ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => appendToExpression(isInverse ? 'atan(' : 'tan(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            {isInverse ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => appendToExpression('(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#7655E8] dark:text-[#A78BFA] font-bold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] transition-all"
          >
            (
          </button>
          <button
            onClick={() => appendToExpression(')')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#7655E8] dark:text-[#A78BFA] font-bold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] transition-all"
          >
            )
          </button>
          <button
            onClick={() => appendToExpression('%')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] font-bold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] transition-all"
          >
            %
          </button>
          <button
            onClick={() => appendToExpression(' / ')}
            className="p-2.5 rounded-xl bg-[#7655E8]/10 border border-[#7655E8]/30 text-[#7655E8] dark:text-[#A78BFA] font-bold text-base hover:bg-[#7655E8]/20 transition-all hidden sm:block"
          >
            ÷
          </button>

          {/* Row 3: Log, roots & 7 8 9 */}
          <button
            onClick={() => appendToExpression('ln(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            ln
          </button>
          <button
            onClick={() => appendToExpression('log(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            log
          </button>
          <button
            onClick={() => appendToExpression('^2')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            x²
          </button>
          <button
            onClick={() => appendToExpression('7')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            7
          </button>
          <button
            onClick={() => appendToExpression('8')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            8
          </button>
          <button
            onClick={() => appendToExpression('9')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            9
          </button>
          <button
            onClick={() => appendToExpression(' * ')}
            className="p-2.5 rounded-xl bg-[#7655E8]/10 border border-[#7655E8]/30 text-[#7655E8] dark:text-[#A78BFA] font-bold text-base hover:bg-[#7655E8]/20 transition-all hidden sm:block"
          >
            ×
          </button>

          {/* Row 4: Power, root & 4 5 6 */}
          <button
            onClick={() => appendToExpression('^')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            xʸ
          </button>
          <button
            onClick={() => appendToExpression('sqrt(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            √x
          </button>
          <button
            onClick={() => appendToExpression('abs(')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            |x|
          </button>
          <button
            onClick={() => appendToExpression('4')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            4
          </button>
          <button
            onClick={() => appendToExpression('5')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            5
          </button>
          <button
            onClick={() => appendToExpression('6')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            6
          </button>
          <button
            onClick={() => appendToExpression(' - ')}
            className="p-2.5 rounded-xl bg-[#7655E8]/10 border border-[#7655E8]/30 text-[#7655E8] dark:text-[#A78BFA] font-bold text-base hover:bg-[#7655E8]/20 transition-all hidden sm:block"
          >
            −
          </button>

          {/* Row 5: Constants & 1 2 3 */}
          <button
            onClick={() => appendToExpression('pi')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-serif italic text-sm transition-all"
          >
            π
          </button>
          <button
            onClick={() => appendToExpression('e')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-serif italic text-sm transition-all"
          >
            e
          </button>
          <button
            onClick={() => appendToExpression('!')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#252538] font-semibold transition-all"
          >
            n!
          </button>
          <button
            onClick={() => appendToExpression('1')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            1
          </button>
          <button
            onClick={() => appendToExpression('2')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            2
          </button>
          <button
            onClick={() => appendToExpression('3')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            3
          </button>
          <button
            onClick={() => appendToExpression(' + ')}
            className="p-2.5 rounded-xl bg-[#7655E8]/10 border border-[#7655E8]/30 text-[#7655E8] dark:text-[#A78BFA] font-bold text-base hover:bg-[#7655E8]/20 transition-all hidden sm:block"
          >
            +
          </button>

          {/* Row 6: 0, ., Ans, Execute */}
          <button
            onClick={() => appendToExpression('Ans')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#7655E8] dark:text-[#A78BFA] font-bold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] transition-all"
          >
            Ans
          </button>
          <button
            onClick={() => appendToExpression('0')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            0
          </button>
          <button
            onClick={() => appendToExpression('.')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-base font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] transition-all"
          >
            .
          </button>
          <button
            onClick={() => appendToExpression('(-')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] font-bold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] transition-all"
          >
            (–)
          </button>
          <button
            onClick={handleExecute}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#7655E8] to-[#9333EA] hover:opacity-95 text-white font-extrabold text-base shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all col-span-2 sm:col-span-3 flex items-center justify-center space-x-2"
          >
            <span>=</span>
            <CornerDownLeft className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>

      {/* Side Calculation History Drawer */}
      {showHistory && (
        <div className="w-80 shrink-0 border-l border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] p-4 flex flex-col justify-between overflow-hidden transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7ED] dark:border-[#27273A]">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#7655E8]" />
              <span className="text-xs font-bold text-[#171923] dark:text-[#F8F8FC]">Calculation Tape</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="p-1 rounded-md text-[#747989] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                title="Clear Tape"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#747989]">
                <Sparkles className="w-8 h-8 mb-2 text-[#7655E8] opacity-40 animate-pulse" />
                <p className="text-xs font-medium">No calculations yet</p>
                <p className="text-[11px] text-[#9A9EAF] mt-1">Press '=' to save computations to this tape.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setExpression(item.expression);
                    setResult(item.result);
                  }}
                  className="p-3 rounded-xl border border-[#E7E7ED] dark:border-[#27273A] bg-[#FAFAFC] dark:bg-[#1A1A28] hover:border-[#7655E8] dark:hover:border-[#8E70FF] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="text-xs font-mono-math text-[#747989] truncate">
                    {item.expression}
                  </div>
                  <div className="text-sm font-extrabold font-mono-math text-[#171923] dark:text-[#F8F8FC] mt-1 text-right flex items-center justify-end space-x-1">
                    <span className="text-xs text-[#7655E8]">=</span>
                    <span>{item.result}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#27273A] text-[10px] text-[#747989] flex items-center justify-between">
            <span>{history.length} operations stored</span>
            <span>Click any item to reload</span>
          </div>
        </div>
      )}
    </div>
  );
};
