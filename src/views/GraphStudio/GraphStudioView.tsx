import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Camera, 
  ShieldCheck, 
  Code2, 
  Compass, 
  Volume2, 
  VolumeX, 
  History, 
  Keyboard, 
  Sparkles,
  Share2,
  TrendingUp,
  Crosshair
} from 'lucide-react';
import { ExpressionItem, GraphViewport, GraphSnapshot } from '../../types';
import { CanvasGraph } from './CanvasGraph';
import { ExpressionList } from './ExpressionList';
import { MathKeyboard } from './MathKeyboard';
import { GraphTimeMachine } from './GraphTimeMachine';
import { SnapToGraphModal } from './SnapToGraphModal';
import { GraphHealthCheckModal } from './GraphHealthCheckModal';
import { GraphToCodeModal } from './GraphToCodeModal';
import { EquationDiscoveryModal } from './EquationDiscoveryModal';
import { audioGraph } from '../../utils/audioGraph';
import { compileSafeFunction } from '../../utils/mathParser';

interface GraphStudioViewProps {
  darkMode: boolean;
  highContrast: boolean;
  onNavigateToTutor?: () => void;
  externalQuickEquation?: string;
  onClearQuickEquation?: () => void;
}

const DEFAULT_VIEWPORT: GraphViewport = {
  xMin: -6,
  xMax: 6,
  yMin: -6,
  yMax: 6,
};

export const GraphStudioView: React.FC<GraphStudioViewProps> = ({
  darkMode,
  highContrast,
  onNavigateToTutor,
  externalQuickEquation,
  onClearQuickEquation,
}) => {
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_VIEWPORT);
  const [showSlopeInspector, setShowSlopeInspector] = useState<boolean>(true);

  // Active expressions
  const [expressions, setExpressions] = useState<ExpressionItem[]>([
    {
      id: 'eq-1',
      latex: 'y = x^2 - 2',
      raw: 'y = x^2 - 2',
      color: '#7655E8',
      visible: true,
      type: 'function',
      showDerivative: false,
      showIntegral: false,
      integralRange: [-2, 2],
    },
    {
      id: 'eq-2',
      latex: 'y = 0.5*x',
      raw: 'y = 0.5*x',
      color: '#17A890',
      visible: true,
      type: 'function',
    },
    {
      id: 'slider-a',
      latex: 'a = 1',
      raw: 'a = 1',
      color: '#F59E0B',
      visible: true,
      type: 'slider',
      sliderParam: 'a',
      sliderVal: 1,
      sliderMin: -5,
      sliderMax: 5,
      sliderStep: 0.1,
      isAnimating: false,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string>('eq-1');

  // History for Time Machine
  const [history, setHistory] = useState<GraphSnapshot[]>([
    {
      id: 'snap-0',
      timestamp: Date.now() - 60000,
      title: 'Initial Quadratic & Line',
      expressions: [
        {
          id: 'eq-1',
          latex: 'y = x^2 - 4',
          raw: 'y = x^2 - 4',
          color: '#7655E8',
          visible: true,
          type: 'function',
        },
      ],
      viewport: DEFAULT_VIEWPORT,
      changedParam: 'Initial state',
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Audio sonification state
  const [isSonifying, setIsSonifying] = useState(false);
  const [scanlineX, setScanlineX] = useState<number | null>(null);

  // Modals & Panels
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isTimeMachineVisible, setIsTimeMachineVisible] = useState(true);

  // Extract scope for slider variables: e.g. { a: 1, b: 2 }
  const scope = useMemo(() => {
    const s: Record<string, number> = {};
    expressions.forEach((item) => {
      if (item.type === 'slider' && item.sliderParam) {
        s[item.sliderParam] = item.sliderVal ?? 0;
      }
    });
    return s;
  }, [expressions]);

  // Handle external quick equations from search bar
  useEffect(() => {
    if (externalQuickEquation) {
      handleAddExpression(externalQuickEquation);
      onClearQuickEquation?.();
    }
  }, [externalQuickEquation]);

  const saveHistoryStep = useCallback(
    (newExpressions: ExpressionItem[], newViewport: GraphViewport, changedParam?: string) => {
      const snap: GraphSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        title: `Step ${history.length + 1}`,
        expressions: JSON.parse(JSON.stringify(newExpressions)),
        viewport: { ...newViewport },
        changedParam,
      };

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, snap];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [history.length, historyIndex]
  );

  const handleUpdateExpression = (id: string, updates: Partial<ExpressionItem>) => {
    setExpressions((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      return updated;
    });
  };

  const handleAddExpression = (raw: string, type: ExpressionItem['type'] = 'function') => {
    let newItem: ExpressionItem;
    if (type === 'slider') {
      const param = raw.split('=')[0]?.trim() || 'k';
      const val = parseFloat(raw.split('=')[1]?.trim() || '2') || 2;
      newItem = {
        id: `slider-${Date.now()}`,
        latex: raw,
        raw,
        color: '#F59E0B',
        visible: true,
        type: 'slider',
        sliderParam: param,
        sliderVal: val,
        sliderMin: -10,
        sliderMax: 10,
        sliderStep: 0.1,
      };
    } else {
      newItem = {
        id: `eq-${Date.now()}`,
        latex: raw,
        raw,
        color: '#7655E8',
        visible: true,
        type: 'function',
      };
    }

    const nextList = [...expressions, newItem];
    setExpressions(nextList);
    setSelectedId(newItem.id);
    saveHistoryStep(nextList, viewport, `Added: ${raw}`);
  };

  const handleRemoveExpression = (id: string) => {
    const nextList = expressions.filter((e) => e.id !== id);
    setExpressions(nextList);
    saveHistoryStep(nextList, viewport, 'Deleted expression');
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    const xMid = (viewport.xMin + viewport.xMax) / 2;
    const yMid = (viewport.yMin + viewport.yMax) / 2;
    const xSpan = (viewport.xMax - viewport.xMin) * factor;
    const ySpan = (viewport.yMax - viewport.yMin) * factor;

    setViewport({
      xMin: xMid - xSpan / 2,
      xMax: xMid + xSpan / 2,
      yMin: yMid - ySpan / 2,
      yMax: yMid + ySpan / 2,
    });
  };

  const handleResetZoom = () => {
    setViewport(DEFAULT_VIEWPORT);
  };

  // Sonification play/stop
  const handleToggleSonification = () => {
    if (isSonifying) {
      audioGraph.stop();
      setIsSonifying(false);
      setScanlineX(null);
      return;
    }

    const activeFn =
      expressions.find((e) => e.id === selectedId && e.visible && e.type === 'function') ||
      expressions.find((e) => e.visible && e.type === 'function');

    if (!activeFn) return;

    const compiled = compileSafeFunction(activeFn.raw);
    if (compiled.hasError) return;

    setIsSonifying(true);
    audioGraph.playCurve(
      (x) => compiled.evaluate(x, scope),
      viewport.xMin,
      viewport.xMax,
      viewport.yMin,
      viewport.yMax,
      3500,
      (_prog, currentX) => {
        setScanlineX(currentX);
      },
      () => {
        setIsSonifying(false);
        setScanlineX(null);
      }
    );
  };

  // Time machine restore
  const handleRestoreSnapshot = (index: number) => {
    const snap = history[index];
    if (!snap) return;
    setHistoryIndex(index);
    setExpressions(JSON.parse(JSON.stringify(snap.expressions)));
    setViewport({ ...snap.viewport });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      handleRestoreSnapshot(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      handleRestoreSnapshot(historyIndex + 1);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#FAFAFC] dark:bg-[#15151D] select-none">
      {/* Main Workspace Area: Left List + Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Expression Sidebar */}
        <ExpressionList
          expressions={expressions}
          onUpdateExpression={handleUpdateExpression}
          onAddExpression={handleAddExpression}
          onRemoveExpression={handleRemoveExpression}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          onOpenKeyboard={() => setIsKeyboardOpen(true)}
        />

        {/* Center Canvas with Floating Toolbar */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Top Floating Action Bar */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Left Tools Group */}
            <div className="flex items-center space-x-1.5 glass-dock p-1 rounded-xl shadow-lg pointer-events-auto">
              <button
                onClick={() => handleZoom(0.8)}
                className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(1.25)}
                className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#7655E8] dark:text-[#A78BFA] hover:bg-[#7655E8]/15 transition-all cursor-pointer"
                title="Reset Viewport Centered on Origin (0,0)"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#7655E8] dark:text-[#A78BFA]" />
                <span className="hidden sm:inline">Origin (0,0)</span>
              </button>

              <div className="h-4 w-px bg-[#E7E7ED] dark:bg-[#2B2D3A] mx-0.5" />

              {/* Slope Inspector Toggle */}
              <button
                onClick={() => setShowSlopeInspector(!showSlopeInspector)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  showSlopeInspector
                    ? 'bg-gradient-to-r from-[#17A890] to-[#10B981] text-white shadow-sm ring-1 ring-emerald-400/30'
                    : 'text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536]'
                }`}
                title="Toggle Live Slope (dy/dx) & Tangent Line Inspector"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Slope (dy/dx)</span>
              </button>

              <div className="h-4 w-px bg-[#E7E7ED] dark:bg-[#2B2D3A] mx-0.5" />

              {/* Sonification Play Button */}
              <button
                onClick={handleToggleSonification}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSonifying
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm animate-pulse'
                    : 'text-[#17A890] hover:bg-[#17A890]/15'
                }`}
                title="Play Audio Graph Sonification (Accessibility)"
              >
                {isSonifying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSonifying ? 'Playing...' : 'Hear'}</span>
              </button>
            </div>

            {/* Right Tools Group */}
            <div className="flex items-center space-x-1.5 glass-dock p-1 rounded-xl shadow-lg pointer-events-auto">
              {/* Snap-to-Graph */}
              <button
                onClick={() => setIsSnapModalOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#7655E8] dark:text-[#A78BFA] hover:bg-[#7655E8]/15 transition-all cursor-pointer"
                title="Snap-to-Graph (Camera & OCR recognition)"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Snap</span>
              </button>

              {/* Equation Discovery Engine */}
              <button
                onClick={() => setIsDiscoveryOpen(true)}
                className="p-1.5 rounded-lg text-[#747989] hover:text-[#7655E8] dark:hover:text-[#A78BFA] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors cursor-pointer"
                title="Equation Discovery Engine"
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Health Diagnostics */}
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="p-1.5 rounded-lg text-[#747989] hover:text-[#17A890] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors cursor-pointer"
                title="Graph Health & Domain Diagnostics"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              {/* Graph to Code */}
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536] transition-colors cursor-pointer"
                title="Export Graph to Code (Python, JS, MATLAB)"
              >
                <Code2 className="w-4 h-4" />
              </button>

              {/* Time Machine toggle */}
              <button
                onClick={() => setIsTimeMachineVisible(!isTimeMachineVisible)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isTimeMachineVisible
                    ? 'text-[#7655E8] dark:text-[#A78BFA] bg-[#7655E8]/15'
                    : 'text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]'
                }`}
                title="Toggle Graph Time Machine timeline"
              >
                <History className="w-4 h-4" />
              </button>

              {/* Ask MathPilot */}
              <button
                onClick={onNavigateToTutor}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#7655E8] via-[#8B5CF6] to-[#A855F7] hover:opacity-95 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Ask MathPilot AI Tutor about this graph"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline font-bold">Ask AI</span>
              </button>
            </div>
          </div>

          {/* Canvas Rendering Plane */}
          <div className="flex-1 relative">
            <CanvasGraph
              expressions={expressions}
              viewport={viewport}
              onViewportChange={setViewport}
              scope={scope}
              selectedExpressionId={selectedId}
              onSelectExpression={setSelectedId}
              darkMode={darkMode}
              highContrast={highContrast}
              scanlineX={scanlineX}
              showTangentInspector={showSlopeInspector}
            />

            {/* Bottom-right Eye-Catching Status HUD */}
            <div className="absolute bottom-3 right-4 z-20 pointer-events-none flex items-center space-x-2 text-[10px] font-mono-math">
              <div className="bg-white/90 dark:bg-[#1E1E2BE0] backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#E7E7ED] dark:border-[#2B2D3A] text-[#747989] dark:text-[#9A9EAF] shadow-xs flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7655E8]" />
                <span>Origin: (0, 0) Centered</span>
              </div>
              <div className="bg-white/90 dark:bg-[#1E1E2BE0] backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#E7E7ED] dark:border-[#2B2D3A] text-[#17A890] shadow-xs font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17A890]" />
                <span>Fine Millimeter Grid</span>
              </div>
              {showSlopeInspector && (
                <div className="bg-[#17A890]/15 text-[#17A890] border border-[#17A890]/30 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xs font-semibold">
                  dy/dx Tangent Active
                </div>
              )}
            </div>
          </div>

          {/* Floating Math Keypad */}
          <MathKeyboard
            isOpen={isKeyboardOpen}
            onClose={() => setIsKeyboardOpen(false)}
            onInsert={(token) => {
              const active = expressions.find((e) => e.id === selectedId);
              if (active) {
                handleUpdateExpression(selectedId, { raw: active.raw + token });
              }
            }}
            onBackspace={() => {
              const active = expressions.find((e) => e.id === selectedId);
              if (active && active.raw.length > 0) {
                handleUpdateExpression(selectedId, { raw: active.raw.slice(0, -1) });
              }
            }}
            onClear={() => {
              if (selectedId) {
                handleUpdateExpression(selectedId, { raw: '' });
              }
            }}
          />

          {/* Bottom Graph Time Machine bar */}
          {isTimeMachineVisible && (
            <GraphTimeMachine
              history={history}
              currentIndex={historyIndex}
              onRestoreIndex={handleRestoreSnapshot}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onCreateSnapshot={(title, desc) => {
                saveHistoryStep(expressions, viewport, title);
              }}
              onExportHistory={() => {
                const blob = new Blob([JSON.stringify(history, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fortify_history_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}
        </div>
      </div>

      {/* Snap to Graph Modal */}
      <SnapToGraphModal
        isOpen={isSnapModalOpen}
        onClose={() => setIsSnapModalOpen(false)}
        onPlotEquation={(eq) => handleAddExpression(eq, 'function')}
      />

      {/* Health Diagnostics Modal */}
      <GraphHealthCheckModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        expressions={expressions}
        scope={scope}
      />

      {/* Graph-to-Code Exporter Modal */}
      <GraphToCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        expressions={expressions}
        scope={scope}
      />

      {/* Equation Discovery Engine Modal */}
      <EquationDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onApplyToGraph={(eq, sliders) => {
          handleAddExpression(eq, 'function');
          sliders?.forEach((s) => {
            handleAddExpression(`${s.param} = ${s.val}`, 'slider');
          });
        }}
      />
    </div>
  );
};
