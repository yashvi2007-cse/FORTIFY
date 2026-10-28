import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  History, 
  Trash2, 
  Sparkles,
  Delete,
  Hash
} from 'lucide-react';
import { speakEquation } from '../../utils/speech';

interface FourFunctionCalcProps {
  darkMode: boolean;
}

interface TapeRecord {
  id: string;
  prevVal: string;
  op: string;
  currVal: string;
  result: string;
  timestamp: number;
}

export const FourFunctionCalcView: React.FC<FourFunctionCalcProps> = ({ darkMode }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tape, setTape] = useState<TapeRecord[]>([
    { id: '1', prevVal: '145', op: '×', currVal: '12', result: '1740', timestamp: Date.now() - 300000 },
    { id: '2', prevVal: '1740', op: '÷', currVal: '4', result: '435', timestamp: Date.now() - 150000 },
    { id: '3', prevVal: '435', op: '+', currVal: '65', result: '500', timestamp: Date.now() - 40000 },
  ]);

  // Physical keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+' || e.key === '-') {
        performOperation(e.key === '+' ? '+' : '−');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        performOperation('=');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevValue, operation, waitingForOperand]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (val !== 0) {
      setDisplay((-val).toString());
    }
  };

  const inputPercent = () => {
    const val = parseFloat(display);
    if (prevValue !== null && operation) {
      // e.g., 200 + 10% = 200 + 20
      const percentVal = (prevValue * val) / 100;
      setDisplay(percentVal.toString());
    } else {
      setDisplay((val / 100).toString());
    }
  };

  const performOperation = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let calculated = 0;

      switch (operation) {
        case '+':
          calculated = currentValue + inputValue;
          break;
        case '−':
        case '-':
          calculated = currentValue - inputValue;
          break;
        case '×':
        case '*':
          calculated = currentValue * inputValue;
          break;
        case '÷':
        case '/':
          calculated = inputValue === 0 ? NaN : currentValue / inputValue;
          break;
        default:
          calculated = inputValue;
      }

      if (isNaN(calculated) || !isFinite(calculated)) {
        setDisplay('Error');
        setPrevValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        return;
      }

      const formatted = Number(calculated.toFixed(10)).toString();
      setDisplay(formatted);
      setPrevValue(calculated);

      // Record to tape
      const record: TapeRecord = {
        id: Date.now().toString(),
        prevVal: currentValue.toString(),
        op: operation,
        currVal: inputValue.toString(),
        result: formatted,
        timestamp: Date.now(),
      };
      setTape((prev) => [record, ...prev.slice(0, 29)]);
    }

    setWaitingForOperand(true);
    setOperation(nextOp === '=' ? null : nextOp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Main Center Area */}
      <div className="flex-1 flex flex-col max-w-xl mx-auto p-4 sm:p-6 justify-between overflow-y-auto">
        {/* Header */}
        <div className="flex items-center space-x-2.5 pb-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#17A890] to-[#06B6D4] text-white shadow-md">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#171923] dark:text-[#F8F8FC]">Four Function Calculator</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#17A890]/15 text-[#17A890] font-bold">
                BASIC
              </span>
            </div>
            <p className="text-xs text-[#747989] dark:text-[#9A9EAF]">Fast, accessible elementary arithmetic & percentage calculator</p>
          </div>
        </div>

        {/* Oversized Screen Display */}
        <div className="w-full glass-panel rounded-2xl p-5 sm:p-6 mb-4 border border-[#E7E7ED] dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[140px]">
          {/* Top Operational Breadcrumb */}
          <div className="h-6 flex items-center justify-end space-x-2 text-xs font-mono-math text-[#747989]">
            {prevValue !== null && (
              <>
                <span>{prevValue}</span>
                <span className="text-[#17A890] font-bold text-sm">{operation}</span>
              </>
            )}
          </div>

          {/* Primary Display Line */}
          <div className="flex items-baseline justify-between overflow-hidden">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white transition-colors"
                title="Copy number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => speakEquation(display)}
                className="p-1 rounded-md text-[#747989] hover:text-[#171923] dark:hover:text-white transition-colors"
                title="Speak number"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right flex-1 truncate font-mono-math font-extrabold text-4xl sm:text-5xl text-[#171923] dark:text-[#F8F8FC]">
              {display}
            </div>
          </div>
        </div>

        {/* Oversized Four-Function Keypad */}
        <div className="grid grid-cols-4 gap-2.5 text-lg font-mono-math">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-950/40 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            AC
          </button>
          <button
            onClick={toggleSign}
            className="p-4 rounded-2xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] font-semibold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            ±
          </button>
          <button
            onClick={inputPercent}
            className="p-4 rounded-2xl bg-white dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#171923] dark:text-[#F8F8FC] font-semibold hover:bg-[#F1F2F6] dark:hover:bg-[#252538] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            %
          </button>
          <button
            onClick={() => performOperation('÷')}
            className={`p-4 rounded-2xl border text-xl font-bold transition-all cursor-pointer shadow-xs ${
              operation === '÷'
                ? 'bg-[#17A890] text-white border-[#17A890] shadow-md ring-2 ring-[#17A890]/30'
                : 'bg-[#17A890]/15 dark:bg-[#17A890]/25 border-[#17A890]/30 text-[#17A890] hover:bg-[#17A890]/25'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputDigit('7')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            7
          </button>
          <button
            onClick={() => inputDigit('8')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            8
          </button>
          <button
            onClick={() => inputDigit('9')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            9
          </button>
          <button
            onClick={() => performOperation('×')}
            className={`p-4 rounded-2xl border text-xl font-bold transition-all cursor-pointer shadow-xs ${
              operation === '×'
                ? 'bg-[#17A890] text-white border-[#17A890] shadow-md ring-2 ring-[#17A890]/30'
                : 'bg-[#17A890]/15 dark:bg-[#17A890]/25 border-[#17A890]/30 text-[#17A890] hover:bg-[#17A890]/25'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputDigit('4')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            4
          </button>
          <button
            onClick={() => inputDigit('5')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            5
          </button>
          <button
            onClick={() => inputDigit('6')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            6
          </button>
          <button
            onClick={() => performOperation('−')}
            className={`p-4 rounded-2xl border text-xl font-bold transition-all cursor-pointer shadow-xs ${
              operation === '−'
                ? 'bg-[#17A890] text-white border-[#17A890] shadow-md ring-2 ring-[#17A890]/30'
                : 'bg-[#17A890]/15 dark:bg-[#17A890]/25 border-[#17A890]/30 text-[#17A890] hover:bg-[#17A890]/25'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputDigit('1')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            1
          </button>
          <button
            onClick={() => inputDigit('2')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            2
          </button>
          <button
            onClick={() => inputDigit('3')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            3
          </button>
          <button
            onClick={() => performOperation('+')}
            className={`p-4 rounded-2xl border text-xl font-bold transition-all cursor-pointer shadow-xs ${
              operation === '+'
                ? 'bg-[#17A890] text-white border-[#17A890] shadow-md ring-2 ring-[#17A890]/30'
                : 'bg-[#17A890]/15 dark:bg-[#17A890]/25 border-[#17A890]/30 text-[#17A890] hover:bg-[#17A890]/25'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputDigit('0')}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            onClick={inputDot}
            className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E7E7ED] dark:border-[#2A2A3C] text-xl font-bold text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#222234] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            .
          </button>
          <button
            onClick={handleBackspace}
            className="p-4 rounded-2xl bg-[#F1F2F6] dark:bg-[#1A1A28] border border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:text-rose-500 active:scale-95 transition-all cursor-pointer shadow-xs flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={() => performOperation('=')}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#17A890] to-[#10B981] text-white font-extrabold text-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
          >
            =
          </button>
        </div>
      </div>

      {/* Arithmetic Paper Tape Drawer */}
      <div className="w-76 shrink-0 border-l border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] p-4 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7ED] dark:border-[#27273A]">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#17A890]" />
            <span className="text-xs font-bold text-[#171923] dark:text-[#F8F8FC]">Receipt Tape</span>
          </div>
          {tape.length > 0 && (
            <button
              onClick={() => setTape([])}
              className="p-1 rounded-md text-[#747989] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              title="Clear Tape"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {tape.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-[#747989]">
              <Sparkles className="w-8 h-8 mb-2 text-[#17A890] opacity-40 animate-pulse" />
              <p className="text-xs font-medium">Receipt is empty</p>
              <p className="text-[11px] text-[#9A9EAF] mt-1">Calculations will print here sequentially.</p>
            </div>
          ) : (
            tape.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setDisplay(rec.result)}
                className="p-2.5 rounded-xl border border-[#E7E7ED] dark:border-[#27273A] bg-[#FAFAFC] dark:bg-[#1A1A28] hover:border-[#17A890] transition-all cursor-pointer shadow-xs text-xs font-mono-math"
              >
                <div className="flex justify-between text-[#747989]">
                  <span>{rec.prevVal}</span>
                  <span className="text-[#17A890] font-bold">{rec.op}</span>
                </div>
                <div className="text-right text-[#747989]">{rec.currVal}</div>
                <div className="border-t border-dashed border-[#E7E7ED] dark:border-[#2D2D40] mt-1 pt-1 text-right font-extrabold text-[#171923] dark:text-[#F8F8FC]">
                  = {rec.result}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#27273A] text-[10px] text-[#747989] text-center">
          Continuous arithmetic register
        </div>
      </div>
    </div>
  );
};
