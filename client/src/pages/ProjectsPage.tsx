import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { UserAvatar } from '../components/UserAvatar';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Project form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsUsedStr, setSkillsUsedStr] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('connections');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProjects();
      if (res.success) {
        setProjects(res.projects || []);
      }
    } catch (err) {
      console.warn('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const skillsArray = skillsUsedStr.split(',').map(s => s.trim()).filter(Boolean);
      await api.createProject({
        title,
        description,
        skillsUsed: skillsArray,
        githubUrl,
        liveUrl,
        privacy,
      });

      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setSkillsUsedStr('');
      setGithubUrl('');
      setLiveUrl('');
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (projectId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    const confirmMsg = nextStatus === 'completed'
      ? 'Mark this project as complete? This will officially award "Project-Demonstrated" verification to your Skill Passport!'
      : 'Reopen this project?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateProject(projectId, { status: nextStatus });
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <div className={`flex-1 ${user ? 'lg:pl-64' : ''} flex flex-col min-w-0 w-full`}>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4" />
                Collaborative Project Hub
              </span>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                Peer Collaborative Projects
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Turn exchanged skills into verifiable code. Completed projects earn Project-Demonstrated passport credentials.
              </p>
            </div>

            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                New Collaborative Project
              </button>
            )}
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <FolderGit2 className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No collaborative projects yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                After exchanging skills in a Studio, team up with your partner to build a tangible project!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => {
                const isParticipant = proj.participants?.some(
                  p => (p.userId?._id || p.userId) === user?._id
                );

                return (
                  <div
                    key={proj._id}
                    className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 hover:border-gold-500/30 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      {/* Top Bar: Status & Privacy */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                            proj.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {proj.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {proj.status === 'completed' ? 'Project Completed' : 'In Progress'}
                        </span>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                          {proj.privacy}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>

                      {/* Skills Used Badges */}
                      {proj.skillsUsed?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {proj.skillsUsed.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-gold-500/20 text-[10px] font-medium text-gold-700 dark:text-gold-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Participants */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Collaborators:</span>
                        <div className="flex -space-x-2 overflow-hidden">
                          {proj.participants?.map((p, i) => (
                            <UserAvatar
                              key={i}
                              avatar={p.userId?.avatar}
                              size="xs"
                              showGoldBorder
                              className="ring-2 ring-obsidian-950"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-300 ml-1">
                          {proj.participants?.map(p => `@${p.userId?.username}`).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            GitHub
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-gold-400 text-xs flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Demo
                          </a>
                        )}
                      </div>

                      {isParticipant && (
                        <button
                          onClick={() => handleToggleComplete(proj._id, proj.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            proj.status === 'completed'
                              ? 'border-white/10 text-slate-400 hover:text-white'
                              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-obsidian-950 font-bold'
                          }`}
                        >
                          {proj.status === 'completed' ? 'Reopen' : 'Mark Completed 🏆'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-gold-400" />
                Create Collaborative Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design Token Bridge, DevSecOps Monitor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What are you building together and which problems does it solve?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skills Used (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Cybersecurity, React, Figma"
                  value={skillsUsedStr}
                  onChange={(e) => setSkillsUsedStr(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Skills listed here are awarded "Project-Demonstrated" status upon completion!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Repo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Privacy</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="connections">Connections Only</option>
                  <option value="public">Public (Show on passport to all)</option>
                  <option value="private">Private (Participants only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs rounded-xl shadow-gold-subtle transition-all disabled:opacity-40"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
