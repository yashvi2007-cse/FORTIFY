import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Plus, 
  Send, 
  Check, 
  Eye, 
  Shield, 
  Sparkles,
  Presentation,
  Trash2
} from 'lucide-react';
import { ExpressionItem } from '../../types';
import { CanvasGraph } from '../GraphStudio/CanvasGraph';

interface LiveGraphViewProps {
  darkMode: boolean;
}

interface PeerUser {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  role: 'teacher' | 'student';
}

interface ChatMessage {
  id: string;
  userName: string;
  text: string;
  time: string;
}

interface Annotation {
  id: string;
  author: string;
  x: number;
  y: number;
  text: string;
}

export const LiveGraphView: React.FC<LiveGraphViewProps> = ({ darkMode }) => {
  const [roomCode, setRoomCode] = useState('FORTIFY-EULER-4096');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Shared expressions
  const [sharedExpressions, setSharedExpressions] = useState<ExpressionItem[]>([
    {
      id: 'collab-1',
      latex: 'y = sin(x) + cos(2*x)',
      raw: 'y = sin(x) + cos(2*x)',
      color: '#7655E8',
      visible: true,
      type: 'function',
    },
    {
      id: 'collab-2',
      latex: 'y = 0.5*x - 1',
      raw: 'y = 0.5*x - 1',
      color: '#17A890',
      visible: true,
      type: 'function',
    },
  ]);

  // Peer participants
  const [peers, setPeers] = useState<PeerUser[]>([
    { id: 'u1', name: 'Dr. Euler (Teacher)', color: '#7655E8', cursorX: 280, cursorY: 180, role: 'teacher' },
    { id: 'u2', name: 'Ada Lovelace', color: '#17A890', cursorX: 420, cursorY: 310, role: 'student' },
    { id: 'u3', name: 'Carl Gauss', color: '#F59E0B', cursorX: 190, cursorY: 260, role: 'student' },
  ]);

  // Shared Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: 'a1', author: 'Dr. Euler', x: 280, y: 160, text: 'Notice constructive interference crest at x ≈ π/2' },
  ]);

  // Collaborative Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'c1', userName: 'Dr. Euler', text: 'Welcome everyone! Today we examine superposition harmonic nodes.', time: '10:02 AM' },
    { id: 'c2', userName: 'Ada Lovelace', text: 'I plotted the linear secular trend line in emerald.', time: '10:04 AM' },
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Animate peer cursor movements slightly to simulate real active collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((prev) =>
        prev.map((peer) => ({
          ...peer,
          cursorX: Math.max(100, Math.min(600, peer.cursorX + (Math.random() - 0.5) * 25)),
          cursorY: Math.max(80, Math.min(400, peer.cursorY + (Math.random() - 0.5) * 25)),
        }))
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fortify.math/room/${roomCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        userName: 'You',
        text: newChatText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewChatText('');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#15151D] overflow-hidden select-none">
      {/* Main Canvas & Collaborative Cursors */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Room Banner */}
        <div className="h-14 border-b border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] px-5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#17A890] animate-pulse" />
              <span className="font-bold text-[#171923] dark:text-[#F4F4F8] font-mono">{roomCode}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F1F2F6] dark:bg-[#252536] text-[#747989] hover:text-[#171923] dark:hover:text-white"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#17A890]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Room Link'}</span>
            </button>
          </div>

          {/* Right Mode Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTeacherMode(!isTeacherMode)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                isTeacherMode
                  ? 'bg-[#7655E8] text-white shadow-xs'
                  : 'bg-[#F1F2F6] dark:bg-[#252536] text-[#747989]'
              }`}
              title="Lock student view to teacher's viewport"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Teacher Mode</span>
            </button>

            <button
              onClick={() => setIsViewOnly(!isViewOnly)}
              className={`p-1.5 rounded-lg text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]`}
              title={isViewOnly ? 'Room is View Only' : 'Room is Collaborative'}
            >
              {isViewOnly ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collaborative Canvas Area with Simulated Peer Cursors */}
        <div className="flex-1 relative overflow-hidden">
          <CanvasGraph
            expressions={sharedExpressions}
            viewport={{ xMin: -10, xMax: 10, yMin: -6, yMax: 6 }}
            onViewportChange={() => {}}
            scope={{}}
            darkMode={darkMode}
            highContrast={false}
          />

          {/* Peer User Cursors Overlay */}
          {peers.map((peer) => (
            <div
              key={peer.id}
              className="absolute pointer-events-none transition-all duration-300 ease-out z-30"
              style={{ left: peer.cursorX, top: peer.cursorY }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={peer.color} className="drop-shadow-sm">
                <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
              </svg>
              <div
                className="text-[10px] text-white px-1.5 py-0.5 rounded-md font-semibold shadow-xs whitespace-nowrap ml-3 -mt-2"
                style={{ backgroundColor: peer.color }}
              >
                {peer.name}
              </div>
            </div>
          ))}

          {/* Sticky Shared Annotations */}
          {annotations.map((ann) => (
            <div
              key={ann.id}
              className="absolute z-20 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 p-2 rounded-xl shadow-md text-xs max-w-xs text-[#171923] dark:text-[#F4F4F8]"
              style={{ left: ann.x, top: ann.y }}
            >
              <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 mb-0.5">
                {ann.author}
              </div>
              <p className="text-[11px] leading-snug">{ann.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Collaboration Sidepanel: Expressions & Chat */}
      <div className="w-80 shrink-0 border-l border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] flex flex-col justify-between overflow-hidden">
        {/* Active Members */}
        <div className="p-3.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
          <div className="text-[10px] uppercase font-bold text-[#747989] mb-2 flex items-center justify-between">
            <span>In Room ({peers.length + 1})</span>
            <span className="text-[#17A890]">Active Sync</span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            <div className="px-2 py-1 rounded-lg bg-[#7655E8]/10 text-[#7655E8] text-xs font-bold">
              You
            </div>
            {peers.map((p) => (
              <div
                key={p.id}
                className="px-2 py-1 rounded-lg text-xs font-medium text-white shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat Stream */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3.5 py-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A] text-xs font-semibold text-[#171923] dark:text-[#F4F4F8]">
            Room Discussion
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-xs space-y-0.5">
                <div className="flex items-center justify-between text-[10px] text-[#747989]">
                  <span className="font-semibold text-[#171923] dark:text-[#F4F4F8]">{msg.userName}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAFAFC] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] text-[#171923] dark:text-[#E2E4EB]">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
            <div className="flex items-center bg-[#F1F2F6] dark:bg-[#1E1E2B] rounded-xl px-2.5 py-1.5 border border-[#E7E7ED] dark:border-[#2B2D3A]">
              <input
                type="text"
                placeholder="Send a comment to the room..."
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="w-full bg-transparent text-xs text-[#171923] dark:text-[#F4F4F8] placeholder-[#747989] focus:outline-none"
              />
              <button type="submit" className="text-[#7655E8] p-1 rounded-md">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
