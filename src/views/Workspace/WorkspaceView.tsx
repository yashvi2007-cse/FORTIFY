import React, { useState } from 'react';
import { 
  FolderGit2, 
  Folder, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Activity, 
  Box, 
  Compass, 
  Palette, 
  Search,
  ExternalLink,
  Star,
  CheckCircle2
} from 'lucide-react';
import { SavedGraphProject, NavigationTab } from '../../types';
import { KatexRenderer } from '../../components/KatexRenderer';

interface WorkspaceViewProps {
  onOpenProject: (project: SavedGraphProject) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  onOpenProject,
  onNavigateTab,
}) => {
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [projects, setProjects] = useState<SavedGraphProject[]>([
    {
      id: 'proj-1',
      title: 'Damped Oscillator & Envelope Analysis',
      folder: 'Calculus',
      updatedAt: '2 hours ago',
      tags: ['Calculus', 'Waves'],
      favorite: true,
      expressions: [
        { id: '1', latex: 'y = e^{-0.2x}\\cos(3x)', raw: 'y = exp(-0.2*x)*cos(3*x)', color: '#7655E8', visible: true, type: 'function' },
        { id: '2', latex: 'y = e^{-0.2x}', raw: 'y = exp(-0.2*x)', color: '#17A890', visible: true, type: 'function' },
      ],
    },
    {
      id: 'proj-2',
      title: 'Quadratic Discriminant Family',
      folder: 'Algebra',
      updatedAt: 'Yesterday',
      tags: ['Algebra', 'Polynomials'],
      favorite: false,
      expressions: [
        { id: '3', latex: 'y = x^2 - 4x + 3', raw: 'y = x^2 - 4*x + 3', color: '#7655E8', visible: true, type: 'function' },
      ],
    },
    {
      id: 'proj-3',
      title: 'Sombrero Wave Surface Export',
      folder: '3D Geometry',
      updatedAt: '3 days ago',
      tags: ['3D', 'Manifolds'],
      favorite: true,
      expressions: [
        { id: '4', latex: 'z = 3\\sin(r)/r', raw: 'z = 3*sin(r)/r', color: '#F59E0B', visible: true, type: 'function' },
      ],
    },
    {
      id: 'proj-4',
      title: 'Projectile Trajectory with 45° Apex',
      folder: 'Physics',
      updatedAt: 'Oct 24',
      tags: ['Physics', 'Kinematics'],
      favorite: false,
      expressions: [
        { id: '5', latex: 'y(t) = v_0\\sin(\\theta)t - 0.5gt^2', raw: 'y = 20*sin(0.785)*x - 4.9*x^2', color: '#17A890', visible: true, type: 'function' },
      ],
    },
  ]);

  const folders = ['all', 'Calculus', 'Algebra', '3D Geometry', 'Physics'];

  const filteredProjects = projects.filter((p) => {
    const matchesFolder = activeFolder === 'all' || p.folder === activeFolder;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortify_workspace_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#15151D] overflow-hidden select-none">
      {/* Folder Directory Sidebar */}
      <div className="w-64 shrink-0 border-r border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">Workspace</h2>
              <p className="text-[10px] text-[#747989]">Saved mathematical files</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Folders
            </span>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors ${
                  activeFolder === f
                    ? 'bg-[#7655E8] text-white'
                    : 'text-[#747989] dark:text-[#9A9EAF] hover:bg-[#F1F2F6] dark:hover:bg-[#20202F]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span className="capitalize">{f}</span>
                </div>
                <span className="text-[10px] opacity-75">
                  {f === 'all' ? projects.length : projects.filter((p) => p.folder === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Backup export */}
        <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-[#F1F2F6] dark:bg-[#20202F] text-[#171923] dark:text-[#F4F4F8] text-xs font-medium hover:border-[#7655E8] border border-transparent"
          >
            <Download className="w-3.5 h-3.5 text-[#7655E8]" />
            <span>Export Workspace JSON</span>
          </button>
        </div>
      </div>

      {/* Projects Grid View */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Search bar & Create */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-sm flex items-center bg-white dark:bg-[#181824] border border-[#E7E7ED] dark:border-[#2B2D3A] rounded-xl px-3 py-1.5 text-xs">
              <Search className="w-4 h-4 text-[#747989] mr-2" />
              <input
                type="text"
                placeholder="Search saved graphs and equations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#171923] dark:text-[#F4F4F8] placeholder-[#747989] focus:outline-none"
              />
            </div>

            <button
              onClick={() => onNavigateTab('graph-studio')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#7655E8] hover:bg-[#6846D8] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Graph</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] hover:border-[#7655E8] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7655E8] tracking-wider">
                        {p.folder}
                      </span>
                      <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8] mt-0.5 group-hover:text-[#7655E8] transition-colors">
                        {p.title}
                      </h3>
                    </div>
                    {p.favorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </div>

                  {/* Expression list snippet */}
                  <div className="my-3 p-2.5 rounded-xl bg-[#FAFAFC] dark:bg-[#1E1E2B] border border-[#E7E7ED] dark:border-[#2B2D3A] space-y-1">
                    {p.expressions.map((e) => (
                      <div key={e.id} className="text-xs font-mono-math text-[#171923] dark:text-[#E2E4EB] truncate">
                        <KatexRenderer math={e.raw} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-[#F1F2F6] dark:bg-[#20202F] text-[10px] font-medium text-[#747989]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#747989]">{p.updatedAt}</span>
                  <button
                    onClick={() => {
                      onOpenProject(p);
                      onNavigateTab('graph-studio');
                    }}
                    className="flex items-center space-x-1 text-[#7655E8] font-semibold hover:underline"
                  >
                    <span>Open in Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
