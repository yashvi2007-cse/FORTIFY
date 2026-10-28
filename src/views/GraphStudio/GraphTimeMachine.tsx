import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  RotateCw, 
  Play, 
  Pause, 
  BookmarkPlus, 
  Download, 
  Layers, 
  Clock, 
  ArrowRight,
  GitCommit,
  Check
} from 'lucide-react';
import { GraphSnapshot, ExpressionItem, GraphViewport } from '../../types';

interface GraphTimeMachineProps {
  history: GraphSnapshot[];
  currentIndex: number;
  onRestoreIndex: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCreateSnapshot: (title: string, desc?: string) => void;
  onExportHistory: () => void;
}

export const GraphTimeMachine: React.FC<GraphTimeMachineProps> = ({
  history,
  currentIndex,
  onRestoreIndex,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCreateSnapshot,
  onExportHistory,
}) => {
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Replay animation: step through history one by one
  const handleToggleReplay = () => {
    if (isPlayingReplay) {
      setIsPlayingReplay(false);
      return;
    }

    if (history.length <= 1) return;
    setIsPlayingReplay(true);

    let step = 0;
    const interval = setInterval(() => {
      if (step < history.length) {
        onRestoreIndex(step);
        step++;
      } else {
        clearInterval(interval);
        setIsPlayingReplay(false);
      }
    }, 1200);
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotTitle.trim()) return;
    onCreateSnapshot(newSnapshotTitle.trim(), 'Manual milestone snapshot');
    setNewSnapshotTitle('');
    setShowAddModal(false);
  };

  const currentSnapshot = history[currentIndex] || history[history.length - 1];

  return (
    <div className="h-16 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#1A1A26] px-4 flex items-center justify-between select-none">
      {/* Left: Undo, Redo, Replay, History badge */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 border-r border-[#E7E7ED] dark:border-[#2B2D3A] pr-2.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-[#747989] dark:text-[#9A9EAF] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-[#747989] dark:text-[#9A9EAF] hover:bg-[#F1F2F6] dark:hover:bg-[#252536] disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Replay Transformation Animation */}
        <button
          onClick={handleToggleReplay}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            isPlayingReplay
              ? 'bg-amber-500 text-white'
              : 'bg-[#7655E8]/10 text-[#7655E8] hover:bg-[#7655E8]/20'
          }`}
          title="Replay all graph parameter transformations with animation"
        >
          {isPlayingReplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlayingReplay ? 'Replaying...' : 'Replay Transformations'}</span>
        </button>

        {/* Changed Parameter Diff badge */}
        {currentSnapshot?.changedParam && (
          <div className="hidden md:flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#17A890]/10 text-[#17A890] text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17A890]" />
            <span>Delta: {currentSnapshot.changedParam}</span>
          </div>
        )}
      </div>

      {/* Center: Timeline Scrubber / Version steps */}
      <div className="flex-1 max-w-xl mx-4 flex items-center space-x-1.5 overflow-x-auto py-1">
        {history.map((snap, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={snap.id}
              onClick={() => onRestoreIndex(idx)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs shrink-0 transition-all ${
                isActive
                  ? 'bg-[#7655E8] text-white shadow-xs font-semibold scale-105'
                  : 'bg-[#F1F2F6] dark:bg-[#252536] text-[#747989] dark:text-[#9A9EAF] hover:bg-[#E7E7ED] dark:hover:bg-[#2C2C40]'
              }`}
              title={`Version ${idx + 1}: ${snap.title} (${new Date(snap.timestamp).toLocaleTimeString()})`}
            >
              <GitCommit className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{snap.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Snapshot & Export */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
          title="Create Named Snapshot"
        >
          <BookmarkPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onExportHistory}
          className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
          title="Export Graph History as JSON"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveSnapshot}
            className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl p-5 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-[#7655E8]" />
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">Create Graph Snapshot</h3>
            </div>
            <p className="text-xs text-[#747989]">
              Save the current configuration of equations, sliders, and viewport bounds as a milestone in the Time Machine.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Parabola Root Inversion"
              value={newSnapshotTitle}
              onChange={(e) => setNewSnapshotTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F1F2F6] dark:bg-[#15151D] border border-[#E7E7ED] dark:border-[#2B2D3A] text-xs text-[#171923] dark:text-[#F4F4F8] focus:outline-none focus:border-[#7655E8]"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#7655E8] hover:bg-[#6846D8] text-white"
              >
                Save Snapshot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
