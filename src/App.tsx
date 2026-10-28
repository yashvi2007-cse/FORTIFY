import React, { useState, useEffect } from 'react';
import { NavigationTab, ExpressionItem, SavedGraphProject } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { CursorSpotlight } from './components/CursorSpotlight';

// Views
import { HomeView } from './views/Home/HomeView';
import { GraphStudioView } from './views/GraphStudio/GraphStudioView';
import { ScientificCalcView } from './views/ScientificCalc/ScientificCalcView';
import { FourFunctionCalcView } from './views/FourFunctionCalc/FourFunctionCalcView';
import { NotebookView } from './views/Notebook/NotebookView';
import { MatrixCalcView } from './views/MatrixCalc/MatrixCalcView';
import { GeometryView } from './views/Geometry/GeometryView';
import { AiTutorView } from './views/AiTutor/AiTutorView';
import { Universe3DView } from './views/Universe3D/Universe3DView';
import { LiveGraphView } from './views/LiveGraph/LiveGraphView';
import { GraphIQView } from './views/GraphIQ/GraphIQView';
import { MathArtView } from './views/MathArt/MathArtView';
import { KnowledgeMapView } from './views/KnowledgeMap/KnowledgeMapView';
import { WorkspaceView } from './views/Workspace/WorkspaceView';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Quick plot queue from Search or Presets
  const [quickEquationToPlot, setQuickEquationToPlot] = useState<string | undefined>(undefined);

  // Shared active expressions across app (e.g. for AI Math Tutor context)
  const [activeExpressions, setActiveExpressions] = useState<ExpressionItem[]>([
    {
      id: 'eq-1',
      latex: 'y = x^2 - 4',
      raw: 'y = x^2 - 4',
      color: '#7655E8',
      visible: true,
      type: 'function',
    },
    {
      id: 'eq-2',
      latex: 'y = 2*x + 1',
      raw: 'y = 2*x + 1',
      color: '#17A890',
      visible: true,
      type: 'function',
    },
  ]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleQuickPlot = (eq: string) => {
    setQuickEquationToPlot(eq);
    setCurrentTab('graph-studio');
  };

  const handleOpenProject = (project: SavedGraphProject) => {
    setActiveExpressions(project.expressions);
    if (project.expressions.length > 0) {
      setQuickEquationToPlot(project.expressions[0].raw);
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col bg-[#FAFAFC] dark:bg-[#0C0C14] text-[#171923] dark:text-[#F4F4F8] ${highContrast ? 'contrast-125' : ''}`}>
      {/* Interactive Cursor Spotlight Aura Light behind pointer */}
      <CursorSpotlight darkMode={darkMode} />

      {/* Top Universal Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        audioActive={audioActive}
        onToggleAudio={() => setAudioActive(!audioActive)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onQuickNewGraph={() => {
          setQuickEquationToPlot('y = x^2');
          setCurrentTab('graph-studio');
        }}
      />

      {/* Main Body: Collapsible Sidebar + Active Content View */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
          {currentTab === 'home' && (
            <HomeView
              onNavigateTab={setCurrentTab}
              onQuickPlot={handleQuickPlot}
            />
          )}

          {currentTab === 'graph-studio' && (
            <GraphStudioView
              darkMode={darkMode}
              highContrast={highContrast}
              onNavigateToTutor={() => setCurrentTab('ai-tutor')}
              externalQuickEquation={quickEquationToPlot}
              onClearQuickEquation={() => setQuickEquationToPlot(undefined)}
            />
          )}

          {currentTab === 'scientific-calc' && (
            <ScientificCalcView
              darkMode={darkMode}
              onNavigateToGraph={handleQuickPlot}
            />
          )}

          {currentTab === 'four-function-calc' && (
            <FourFunctionCalcView darkMode={darkMode} />
          )}

          {currentTab === 'notebook' && (
            <NotebookView
              darkMode={darkMode}
              onNavigateToGraph={handleQuickPlot}
            />
          )}

          {currentTab === 'matrix-calc' && (
            <MatrixCalcView darkMode={darkMode} />
          )}

          {currentTab === 'geometry-studio' && (
            <GeometryView darkMode={darkMode} />
          )}

          {currentTab === 'ai-tutor' && (
            <AiTutorView
              currentExpressions={activeExpressions}
              onInjectEquation={handleQuickPlot}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === '3d-universe' && (
            <Universe3DView darkMode={darkMode} />
          )}

          {currentTab === 'live-graph' && (
            <LiveGraphView darkMode={darkMode} />
          )}

          {currentTab === 'graph-iq' && (
            <GraphIQView
              darkMode={darkMode}
              onNavigateToStudio={() => setCurrentTab('graph-studio')}
            />
          )}

          {currentTab === 'math-art' && (
            <MathArtView darkMode={darkMode} />
          )}

          {currentTab === 'knowledge-map' && (
            <KnowledgeMapView
              onNavigateTab={setCurrentTab}
              onOpenGraphWithPreset={handleQuickPlot}
            />
          )}

          {currentTab === 'workspace' && (
            <WorkspaceView
              onOpenProject={handleOpenProject}
              onNavigateTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentTab}
        onQuickPlot={handleQuickPlot}
      />
    </div>
  );
}

export default App;
