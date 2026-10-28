import React from 'react';
import { Delete, X } from 'lucide-react';

interface MathKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (token: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({
  isOpen,
  onClose,
  onInsert,
  onBackspace,
  onClear,
}) => {
  if (!isOpen) return null;

  const row1 = ['x', 'y', 'a', 'b', 'c', '(', ')', '^2', '^', 'sqrt('];
  const row2 = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'pi', 'e', 'abs(', '<=', '>='];
  const row3 = ['7', '8', '9', '/', '*', '+', '-'];
  const row4 = ['4', '5', '6', '1', '2', '3', '0', '.', '='];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl bg-white/95 dark:bg-[#1E1E2B]/95 backdrop-blur-md rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl p-3 animate-in slide-in-from-bottom-6 duration-200">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
        <div className="text-xs font-semibold text-[#171923] dark:text-[#F4F4F8] flex items-center space-x-1.5">
          <span className="font-serif italic font-bold">f(x)</span>
          <span>Mathematical Keypad</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClear}
            className="text-[11px] text-[#747989] hover:text-[#EF4444] px-2 py-0.5 rounded hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#747989] hover:text-[#171923] dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 font-mono-math text-xs">
        {/* Row 1: Variables & Powers */}
        <div className="grid grid-cols-10 gap-1">
          {row1.map((key) => (
            <button
              key={key}
              onClick={() => onInsert(key)}
              className="py-2 rounded-lg bg-[#F1F2F6] dark:bg-[#252536] hover:bg-[#E7E7ED] dark:hover:bg-[#2F2F44] text-[#171923] dark:text-[#F4F4F8] font-semibold active:scale-95 transition-transform"
            >
              {key === '^2' ? 'x²' : key === '^' ? 'aᵇ' : key === 'sqrt(' ? '√x' : key}
            </button>
          ))}
        </div>

        {/* Row 2: Trig & Transcendental */}
        <div className="grid grid-cols-10 gap-1">
          {row2.map((key) => (
            <button
              key={key}
              onClick={() => onInsert(key)}
              className="py-2 rounded-lg bg-[#F1F2F6] dark:bg-[#252536] hover:bg-[#E7E7ED] dark:hover:bg-[#2F2F44] text-[#7655E8] dark:text-[#8E70FF] font-semibold active:scale-95 transition-transform"
            >
              {key === 'pi' ? 'π' : key === 'abs(' ? '|x|' : key.replace('(', '')}
            </button>
          ))}
        </div>

        {/* Row 3 & 4: Numbers and Operators */}
        <div className="flex space-x-1">
          <div className="grid grid-cols-7 gap-1 flex-1">
            {row3.map((key) => (
              <button
                key={key}
                onClick={() => onInsert(key)}
                className="py-2 rounded-lg bg-white dark:bg-[#1A1A24] border border-[#E7E7ED] dark:border-[#2B2D3A] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8] font-bold active:scale-95 transition-transform"
              >
                {key}
              </button>
            ))}
          </div>
          <button
            onClick={onBackspace}
            className="w-16 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-9 gap-1">
          {row4.map((key) => (
            <button
              key={key}
              onClick={() => onInsert(key)}
              className="py-2 rounded-lg bg-white dark:bg-[#1A1A24] border border-[#E7E7ED] dark:border-[#2B2D3A] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] text-[#171923] dark:text-[#F4F4F8] font-bold active:scale-95 transition-transform"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
