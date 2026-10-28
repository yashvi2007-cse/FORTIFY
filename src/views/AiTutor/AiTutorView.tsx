import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  BookOpen, 
  Lightbulb, 
  Compass, 
  HelpCircle,
  Play,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { ExpressionItem, NavigationTab } from '../../types';
import { KatexRenderer } from '../../components/KatexRenderer';
import { speakEquation } from '../../utils/speech';

interface AiTutorViewProps {
  currentExpressions: ExpressionItem[];
  onInjectEquation: (eq: string) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  formula?: string;
  steps?: string[];
  suggestedAction?: {
    label: string;
    equation: string;
  };
  experimentPrompt?: string;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  currentExpressions,
  onInjectEquation,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "Hello! I am MathPilot, your intelligent mathematical tutor. I have real-time visibility into your Graph Studio session. Ask me to explain graph geometries, derive formulas step-by-step, diagnose errors, or suggest interactive experiments.",
      steps: [
        "Ask 'Why does a parabola open upwards?'",
        "Ask 'Explain the derivative of sin(x) geometrically'",
        "Ask 'What happens when the discriminant Δ is negative?'",
        "Ask 'Convert this sentence: a bell curve with peak at 0 and width 2'",
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Pre-configured mathematical knowledge responses
  const generateTutorResponse = (query: string): Message => {
    const q = query.toLowerCase();

    if (q.includes('why') && (q.includes('parabola') || q.includes('x^2') || q.includes('x²') || q.includes('open up'))) {
      return {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: "The quadratic function y = ax² opens upwards because of how the squared operation interacts with positive coefficients:",
        formula: 'y = a \\cdot x^2 \\quad (a > 0)',
        steps: [
          "1. Non-negativity of Squares: For any real number x (positive or negative), x² ≥ 0. Squaring eliminates direction and preserves magnitude.",
          "2. Coefficient Sign: When the leading coefficient a > 0, multiplying the non-negative square by a keeps the output positive (y ≥ 0).",
          "3. Growth at Infinities: As x → +∞ or x → -∞, x² grows quadratically towards +∞. Therefore, both branches of the curve rise indefinitely.",
          "4. Global Vertex Minimum: The lowest possible value occurs when x = 0, giving y = 0. This creates a minimum turning point (vertex) rather than a maximum.",
        ],
        suggestedAction: {
          label: "Experiment with Inverting the Parabola (y = -x²)",
          equation: "y = -x^2",
        },
        experimentPrompt: "Try changing 'a' from +1 to -1 in Graph Studio to watch the parabola flip across the x-axis!",
      };
    }

    if (q.includes('derivative') || q.includes('slope') || q.includes('tangent')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: "The derivative f'(x) represents the instantaneous rate of change or the geometric slope of the tangent line to the curve at coordinate x:",
        formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x-h)}{2h}",
        steps: [
          "1. Tangent Slope: When f(x) is climbing upwards to the right, f'(x) > 0.",
          "2. Stationary Points / Extrema: Where the graph peaks (local maximum) or troughs (local minimum), the tangent is completely flat, meaning f'(x) = 0.",
          "3. Concavity & 2nd Derivative: If f'(x) is increasing, the curve holds water (concave up). If f'(x) is decreasing, it sheds water (concave down).",
        ],
        suggestedAction: {
          label: "Plot Function alongside its Derivative (y = x³ - 3x)",
          equation: "y = x^3 - 3*x",
        },
      };
    }

    if (q.includes('bell') || q.includes('gaussian') || q.includes('normal distribution')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: "Converted your natural language query into the standard Normal Gaussian Distribution function:",
        formula: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left(-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2\\right)",
        steps: [
          "• Mean (μ = 0): Dictates the horizontal center of symmetry and highest peak.",
          "• Standard Deviation (σ = 1): Dictates the dispersion and inflections at x = μ ± σ.",
          "• Total Integral: The area under this curve across (-∞, +∞) strictly equals exactly 1.0 (100% probability mass).",
        ],
        suggestedAction: {
          label: "Plot Standard Bell Curve in Graph Studio",
          equation: "y = (1 / sqrt(2*pi)) * exp(-0.5 * x^2)",
        },
      };
    }

    if (q.includes('discriminant') || q.includes('roots') || q.includes('b^2 - 4ac') || q.includes('delta')) {
      return {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: "The discriminant Δ = b² - 4ac governs the topological intersection between the parabola and the x-axis:",
        formula: "\\Delta = b^2 - 4ac",
        steps: [
          "• If Δ > 0: The quadratic equation has two distinct real roots (curve cuts the x-axis at 2 points).",
          "• If Δ = 0: Exactly one repeated root exists (the vertex sits directly tangent to the x-axis).",
          "• If Δ < 0: The square root in the quadratic formula yields an imaginary number; geometrically, the entire parabola floats strictly above or below the x-axis with 0 real intersections.",
        ],
        suggestedAction: {
          label: "Plot Floating Parabola with Δ < 0",
          equation: "y = x^2 + x + 2",
        },
      };
    }

    // Default conversational AI mathematical response
    return {
      id: `m-${Date.now()}`,
      sender: 'assistant',
      text: `Analyzing your mathematical query regarding "${query}":`,
      formula: "f(x) = \\sum_{k=0}^{\\infty} a_k x^k",
      steps: [
        "1. Identified key mathematical properties: function domain, rate of change, and symmetry.",
        "2. To understand this curve geometrically, observe where f(x) = 0 (x-intercepts) and where f'(x) = 0 (critical extrema).",
        "3. Would you like to test a specific parameter variation or explore 3D manifolds in 3D Universe?",
      ],
      suggestedAction: {
        label: "Plot Damped Oscillation Wave",
        equation: "y = exp(-0.15*x) * sin(2*x)",
      },
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;

    const userText = inputQuery.trim();
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = generateTutorResponse(userText);
      setMessages((prev) => [...prev, response]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#15151D] overflow-hidden select-none">
      {/* Left Context Column: Active Graph State */}
      <div className="w-72 shrink-0 border-r border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] p-4 hidden md:flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#7655E8]/10 text-[#7655E8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#171923] dark:text-[#F4F4F8]">Graph Context</h2>
              <p className="text-[10px] text-[#747989]">MathPilot live telemetry</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Plotted in Studio ({currentExpressions.length})
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {currentExpressions.map((e) => (
                <div
                  key={e.id}
                  className="p-2 rounded-lg bg-[#FAFAFC] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-xs font-mono-math flex items-center justify-between"
                >
                  <span className="truncate">{e.raw}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 ml-1.5" style={{ backgroundColor: e.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5 pt-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Suggested Questions
            </span>
            {[
              "Why does y = x² open upwards?",
              "Explain derivative geometrically",
              "What does the discriminant mean?",
              "Plot a standard bell curve",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInputQuery(prompt)}
                className="w-full text-left p-2 rounded-lg text-xs bg-[#F1F2F6] dark:bg-[#20202F] hover:bg-[#E7E7ED] dark:hover:bg-[#28283B] text-[#171923] dark:text-[#E2E4EB] transition-colors truncate"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#7655E8]/10 border border-[#7655E8]/20 text-[11px] text-[#7655E8] flex items-center justify-between">
          <span>Jump to 2D Graph</span>
          <button
            onClick={() => onNavigateTab('graph-studio')}
            className="font-bold underline"
          >
            Graph Studio →
          </button>
        </div>
      </div>

      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isBot
                      ? 'bg-[#7655E8] text-white shadow-xs'
                      : 'bg-[#171923] dark:bg-[#F4F4F8] text-white dark:text-[#171923]'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs space-y-2.5 max-w-xl ${
                    isBot
                      ? 'bg-white dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-[#171923] dark:text-[#F4F4F8] shadow-sm'
                      : 'bg-[#7655E8] text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{isBot ? 'MathPilot AI' : 'You'}</span>
                    {isBot && (
                      <button
                        onClick={() => speakEquation(msg.text)}
                        className="text-[#747989] hover:text-[#7655E8]"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="leading-relaxed text-[12px]">{msg.text}</p>

                  {/* Formula banner */}
                  {msg.formula && (
                    <div className="p-2.5 rounded-xl bg-[#FAFAFC] dark:bg-[#15151D] border border-[#E7E7ED] dark:border-[#2B2D3A] text-center my-1.5 overflow-x-auto text-sm font-bold text-[#7655E8]">
                      <KatexRenderer math={msg.formula} block />
                    </div>
                  )}

                  {/* Step by step items */}
                  {msg.steps && (
                    <div className="space-y-1.5 pt-1">
                      {msg.steps.map((st, i) => (
                        <div key={i} className="text-[11px] leading-relaxed text-[#747989] dark:text-[#A6ABB9]">
                          {st}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Experiment Action */}
                  {msg.suggestedAction && (
                    <div className="pt-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
                      <button
                        onClick={() => {
                          onInjectEquation(msg.suggestedAction!.equation);
                          onNavigateTab('graph-studio');
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7655E8]/10 hover:bg-[#7655E8]/20 text-[#7655E8] transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{msg.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center space-x-2 text-xs text-[#7655E8] animate-pulse">
              <Bot className="w-4 h-4" />
              <span>MathPilot is formulating mathematical explanation...</span>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824]">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto flex items-center bg-[#F1F2F6] dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] px-4 py-2 focus-within:border-[#7655E8] transition-colors"
          >
            <input
              type="text"
              placeholder="Ask MathPilot anything (e.g. 'Why does y=x² open upwards?', 'Plot bell curve')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[#171923] dark:text-[#F4F4F8] placeholder-[#747989] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="p-1.5 rounded-xl bg-[#7655E8] text-white hover:bg-[#6846D8] disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
