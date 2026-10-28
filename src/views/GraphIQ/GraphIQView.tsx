import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Flame, 
  Clock, 
  Trophy, 
  ArrowRight, 
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import { CanvasGraph } from '../GraphStudio/CanvasGraph';
import { KatexRenderer } from '../../components/KatexRenderer';

interface GraphIQViewProps {
  darkMode: boolean;
  onNavigateToStudio?: () => void;
}

export const GraphIQView: React.FC<GraphIQViewProps> = ({ darkMode, onNavigateToStudio }) => {
  const [streak, setStreak] = useState(3);
  const [score, setScore] = useState(240);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sliderInput, setSliderInput] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      topic: 'Calculus: Derivatives',
      difficulty: 'Explorer',
      prompt: 'At what value of x does the function f(x) = x² - 4x + 3 have a critical point (horizontal tangent where f\'(x) = 0)?',
      equation: 'f(x) = x^2 - 4x + 3',
      options: ['x = 1', 'x = 2', 'x = 3', 'x = 0'],
      correctAnswer: 'x = 2',
      explanation: 'Differentiating gives f\'(x) = 2x - 4. Setting f\'(x) = 0 yields 2x = 4, so x = 2. This represents the minimum vertex of the parabola.',
      userInteractiveType: 'multiple-choice',
      graphPreset: {
        expressions: [
          {
            id: 'gq-1',
            latex: 'y = x^2 - 4*x + 3',
            raw: 'y = x^2 - 4*x + 3',
            color: '#7655E8',
            visible: true,
            type: 'function',
            showDerivative: true,
          },
        ],
        viewport: { xMin: -2, xMax: 6, yMin: -3, yMax: 5 },
      },
    },
    {
      id: 'q2',
      topic: 'Trigonometry: Wave Periods',
      difficulty: 'Advanced',
      prompt: 'What is the fundamental period T of the harmonic function f(x) = 3·sin(2x)?',
      equation: 'f(x) = 3\\sin(2x)',
      options: ['T = 2π', 'T = π', 'T = π/2', 'T = 4π'],
      correctAnswer: 'T = π',
      explanation: 'For any sinusoid sin(Bx), the period T = 2π / |B|. Here B = 2, so the period T = 2π / 2 = π radians (≈ 3.14159). The wave oscillates twice as fast as standard sin(x).',
      userInteractiveType: 'multiple-choice',
      graphPreset: {
        expressions: [
          {
            id: 'gq-2',
            latex: 'y = 3*sin(2*x)',
            raw: 'y = 3*sin(2*x)',
            color: '#17A890',
            visible: true,
            type: 'function',
          },
        ],
        viewport: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
      },
    },
    {
      id: 'q3',
      topic: 'Algebra: Parabola Discriminant',
      difficulty: 'Master',
      prompt: 'How many real x-intercepts does the function f(x) = x² + 2x + 5 possess?',
      equation: 'f(x) = x^2 + 2x + 5',
      options: ['0 Real Intercepts (Δ < 0)', '1 Repeated Intercept (Δ = 0)', '2 Distinct Intercepts (Δ > 0)', 'Infinite'],
      correctAnswer: '0 Real Intercepts (Δ < 0)',
      explanation: 'The discriminant Δ = b² - 4ac = (2)² - 4(1)(5) = 4 - 20 = -16. Since Δ < 0, the curve floats entirely above the x-axis with no real roots.',
      userInteractiveType: 'multiple-choice',
      graphPreset: {
        expressions: [
          {
            id: 'gq-3',
            latex: 'y = x^2 + 2*x + 5',
            raw: 'y = x^2 + 2*x + 5',
            color: '#EF4444',
            visible: true,
            type: 'function',
          },
        ],
        viewport: { xMin: -4, xMax: 4, yMin: -2, yMax: 10 },
      },
    },
  ];

  const currentQ = questions[currentQuestionIndex] || questions[0];

  const handleSelectOption = (opt: string) => {
    if (hasAnswered) return;
    setSelectedOption(opt);
    const correct = opt === currentQ.correctAnswer;
    setIsCorrect(correct);
    setHasAnswered(true);

    if (correct) {
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 50);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setHasAnswered(false);
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Left Quiz & Feedback Column */}
      <div className="w-96 sm:w-104 shrink-0 border-r border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7ED] dark:border-[#27273A]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7655E8] to-[#9333EA] text-white shadow-md">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#171923] dark:text-[#F8F8FC]">Graph IQ</h2>
                <span className="text-[10px] text-[#747989] dark:text-[#9A9EAF]">Adaptive Mastery Engine</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold shadow-xs">
                <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
                <span>{streak} Streak</span>
              </div>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#7655E8]/10 border border-[#7655E8]/30 text-[#7655E8] dark:text-[#A78BFA] font-bold shadow-xs">
                <Trophy className="w-4 h-4" />
                <span>{score} XP</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[#747989] dark:text-[#9A9EAF]">
              <span>Progress to Next Rank</span>
              <span className="font-mono-math font-semibold">Q{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <div className="w-full h-2 bg-[#E7E7ED] dark:bg-[#20202F] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7655E8] via-[#06B6D4] to-[#17A890] rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Topic & Difficulty Badge */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7655E8]/10 border border-[#7655E8]/20 text-[#7655E8] dark:text-[#A78BFA] font-semibold text-[11px]">
              {currentQ.topic}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#17A890]/10 border border-[#17A890]/20 text-[#17A890] font-semibold text-[11px]">
              Level: {currentQ.difficulty}
            </span>
          </div>

          {/* Prompt */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-[#171923] dark:text-[#E2E4EB] leading-relaxed">
              {currentQ.prompt}
            </p>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#7655E8]/5 to-transparent border border-[#7655E8]/20 dark:border-[#8E70FF]/20 text-center text-sm font-bold text-[#7655E8] dark:text-[#A78BFA] shadow-xs">
              <KatexRenderer math={currentQ.equation} block />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-1">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;

              let btnStyle = 'border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#1A1A28] hover:border-[#7655E8] dark:hover:border-[#8E70FF] text-[#171923] dark:text-[#F8F8FC] shadow-xs';

              if (hasAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'border-[#17A890] bg-[#17A890]/15 text-[#17A890] font-bold shadow-md ring-1 ring-[#17A890]';
                } else if (isSelected) {
                  btnStyle = 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold shadow-md ring-1 ring-[#EF4444]';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${btnStyle}`}
                >
                  <span className="font-medium">{opt}</span>
                  {hasAnswered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-[#17A890] shrink-0" />}
                  {hasAnswered && isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {hasAnswered && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-300 shadow-sm ${
                isCorrect
                  ? 'border-[#17A890]/30 bg-[#17A890]/10 text-[#17A890]'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              <div className="font-bold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#7655E8] dark:text-[#A78BFA]" />
                <span>{isCorrect ? 'Outstanding! Visual Proof Breakdown:' : 'Insight & Solution:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#4B5563] dark:text-[#D1D5DB]">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-[#E7E7ED] dark:border-[#27273A] flex items-center justify-between">
          <span className="text-[11px] text-[#747989] font-mono-math">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          {hasAnswered && (
            <button
              onClick={handleNextQuestion}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7655E8] to-[#9333EA] hover:opacity-95 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Next Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Interactive Graph Inspection */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="h-10 border-b border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] px-4 flex items-center justify-between text-xs text-[#747989]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#17A890] animate-pulse" />
            <span className="font-semibold text-[#171923] dark:text-[#F8F8FC]">Interactive Geometric Proof</span>
          </div>
          <span className="text-[11px]">Pan & Zoom to explore critical points</span>
        </div>
        <div className="flex-1 relative">
          <CanvasGraph
            expressions={currentQ.graphPreset.expressions}
            viewport={currentQ.graphPreset.viewport}
            onViewportChange={() => {}}
            scope={{}}
            darkMode={darkMode}
            highContrast={false}
          />
        </div>
      </div>
    </div>
  );
};
