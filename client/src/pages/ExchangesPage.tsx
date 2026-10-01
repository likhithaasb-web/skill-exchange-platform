import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  MonitorPlay,
  Star,
  Clock,
  Send,
  ShieldAlert,
  FolderGit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { UserAvatar } from '../components/UserAvatar';
import { PeerReviewModal } from '../components/PeerReviewModal';
import { api } from '../services/api';
import { SkillExchange } from '../types';

export const ExchangesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [exchanges, setExchanges] = useState<SkillExchange[]>([]);
  const [tab, setTab] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [selectedReviewExchange, setSelectedReviewExchange] = useState<SkillExchange | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExchanges();
  }, [user?._id]);

  const loadExchanges = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyExchanges();
      if (res.success) {
        setExchanges(res.exchanges || []);
      }
    } catch (err) {
      console.warn('Error loading exchanges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (exchangeId: string, action: 'accept' | 'decline' | 'cancel') => {
    try {
      const res = await api.respondToExchange(exchangeId, action);
      if (res.success) {
        if (action === 'accept' && res.studioId) {
          navigate(`/studio/${res.studioId}`);
        } else {
          loadExchanges();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleComplete = async (exchangeId: string) => {
    if (!window.confirm('Mark this skill exchange session as completed?')) return;
    try {
      const res = await api.completeExchange(exchangeId);
      if (res.success) {
        loadExchanges();
        // Prompt for peer review
        const ex = exchanges.find(e => e._id === exchangeId);
        if (ex) setSelectedReviewExchange(ex);
      }
    } catch (err: any) {
      alert(err.message || 'Error completing exchange');
    }
  };

  if (!user) return null;

  const filteredExchanges = exchanges.filter((ex) => {
    if (tab === 'active') return ex.status === 'accepted' || ex.status === 'in_progress';
    if (tab === 'pending') return ex.status === 'pending';
    if (tab === 'completed') return ex.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4" />
                Peer-to-Peer Agreements
              </span>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                My Skill Exchanges
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Collaborative proposals, ongoing Skill Studios, and completed exchanges.
              </p>
            </div>

            <Link
              to="/discover"
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all self-start sm:self-auto flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Propose New Exchange
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            {[
              { id: 'all', label: `All (${exchanges.length})` },
              { id: 'active', label: `Active / Studios (${exchanges.filter(e => e.status === 'accepted' || e.status === 'in_progress').length})` },
              { id: 'pending', label: `Pending Requests (${exchanges.filter(e => e.status === 'pending').length})` },
              { id: 'completed', label: `Completed (${exchanges.filter(e => e.status === 'completed').length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-gold-500 text-obsidian-950 shadow-gold-subtle'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Exchanges List */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading exchanges...
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <ArrowRightLeft className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No exchanges in this category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore the discover directory to find people offering the skills you want to learn.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExchanges.map((ex) => {
                const isRequester = ex.requesterId?._id === user._id;
                const partner = isRequester ? ex.recipientId : ex.requesterId;
                const teachSkill = isRequester ? ex.offeredSkill.name : ex.requestedSkill.name;
                const learnSkill = isRequester ? ex.requestedSkill.name : ex.offeredSkill.name;

                return (
                  <div
                    key={ex._id}
                    className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 hover:border-gold-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Partner info and status */}
                      <div className="flex items-center gap-3">
                        <UserAvatar avatar={partner?.avatar} size="md" showGoldBorder />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {partner?.displayName || 'Peer Member'}
                            </span>
                            <span className="text-xs text-gold-600 dark:text-gold-400">@{partner?.username}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {isRequester ? 'You sent this proposal' : 'Sent you a proposal'} • {new Date(ex.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span
                          className={`ml-auto sm:ml-2 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-bold ${
                            ex.status === 'accepted'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : ex.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : ex.status === 'completed'
                              ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </div>

                      {/* Bilateral Transfer Pill */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 dark:text-slate-400">You Teach:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{teachSkill}</span>
                        </div>
                        <span className="text-gold-500 font-bold">⇄</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 dark:text-slate-400">They Teach:</span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{learnSkill}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Format: {ex.preferredFormat}</span>
                      </div>

                      {ex.message && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                          "{ex.message}"
                        </p>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {/* Pending controls */}
                      {ex.status === 'pending' && (
                        <>
                          {!isRequester ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRespond(ex._id, 'accept')}
                                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Accept & Open Studio
                              </button>
                              <button
                                onClick={() => handleRespond(ex._id, 'decline')}
                                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRespond(ex._id, 'cancel')}
                              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 text-xs border border-white/10"
                            >
                              Cancel Request
                            </button>
                          )}
                        </>
                      )}

                      {/* Accepted / In Progress */}
                      {(ex.status === 'accepted' || ex.status === 'in_progress') && (
                        <div className="flex items-center gap-2">
                          {ex.studioId && (
                            <Link
                              to={`/studio/${ex.studioId._id || ex.studioId}`}
                              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5"
                            >
                              <MonitorPlay className="w-4 h-4" />
                              Enter Studio
                            </Link>
                          )}
                          <button
                            onClick={() => handleComplete(ex._id)}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}

                      {/* Completed */}
                      {ex.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReviewExchange(ex)}
                            className="px-3.5 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500 text-gold-400 hover:text-obsidian-950 font-bold text-xs border border-gold-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-gold-400" />
                            Leave Peer Feedback
                          </button>
                          {ex.studioId && (
                            <Link
                              to={`/studio/${ex.studioId._id || ex.studioId}`}
                              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs border border-white/10"
                            >
                              View Studio Archive
                            </Link>
                          )}
                        </div>
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

      <PeerReviewModal
        isOpen={!!selectedReviewExchange}
        onClose={() => setSelectedReviewExchange(null)}
        exchange={selectedReviewExchange}
        onSuccess={() => {
          alert('Peer feedback submitted! Skill verification recorded.');
          loadExchanges();
        }}
      />
    </div>
  );
};
