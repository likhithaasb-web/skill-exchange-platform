import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  ArrowRightLeft,
  Compass,
  MonitorPlay,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { SkillPassportCard } from '../components/SkillPassportCard';
import { SkillEditorModal } from '../components/SkillEditorModal';
import { ExchangeProposalModal } from '../components/ExchangeProposalModal';
import { UserAvatar } from '../components/UserAvatar';
import { api } from '../services/api';
import { MatchPeer, SkillExchange, NotificationItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  const [activeExchanges, setActiveExchanges] = useState<SkillExchange[]>([]);
  const [suggestedPeers, setSuggestedPeers] = useState<MatchPeer[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [selectedProposalPeer, setSelectedProposalPeer] = useState<MatchPeer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?._id]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [exchangesRes, peersRes, notifsRes] = await Promise.all([
        api.getMyExchanges(),
        api.discoverPeers({ mutualOnly: false }),
        api.getNotifications()
      ]);

      if (exchangesRes.success) {
        setActiveExchanges(exchangesRes.exchanges || []);
      }
      if (peersRes.success) {
        setSuggestedPeers(peersRes.peers?.slice(0, 4) || []);
      }
      if (notifsRes.success) {
        setRecentNotifications(notifsRes.notifications?.slice(0, 5) || []);
      }
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Headline Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Primary Credential
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                Your Skill Passport
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSkillEditorOpen(true)}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-bold shadow-gold-subtle transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Skills / Goals
              </button>
              <Link
                to="/discover"
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                Discover Peers
              </Link>
            </div>
          </div>

          {/* SIGNATURE FEATURE #1: THE SKILL PASSPORT CARD */}
          <SkillPassportCard
            user={user}
            profile={profile}
            isOwner
            onEditSkills={() => setIsSkillEditorOpen(true)}
          />

          {/* Active Exchanges / Studios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-gold-500" />
                  Active Skill Exchanges
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your ongoing collaborative peer partnerships.
                </p>
              </div>
              <Link
                to="/exchanges"
                className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                View all ({activeExchanges.length}) →
              </Link>
            </div>

            {activeExchanges.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-obsidian-900/50 border border-slate-200 dark:border-white/10 text-center space-y-3 shadow-sm">
                <ArrowRightLeft className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No active exchanges yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your first skill exchange could start here. Connect with peers who want what you teach!
                </p>
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-500 text-obsidian-950 font-bold text-xs shadow-gold-subtle"
                >
                  Discover Compatible Learners
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeExchanges.map((ex) => {
                  const isRequester = ex.requesterId?._id === user._id;
                  const partner = isRequester ? ex.recipientId : ex.requesterId;
                  const teachSkill = isRequester ? ex.offeredSkill.name : ex.requestedSkill.name;
                  const learnSkill = isRequester ? ex.requestedSkill.name : ex.offeredSkill.name;

                  return (
                    <div
                      key={ex._id}
                      className="p-5 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/20 hover:border-gold-500/40 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar avatar={partner?.avatar} size="md" showGoldBorder />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {partner?.displayName || 'Peer'}
                            </h4>
                            <span className="text-xs text-gold-600 dark:text-gold-400">@{partner?.username}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            ex.status === 'accepted'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : ex.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </div>

                      {/* Skill Pair Transfer */}
                      <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">You Teach</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{teachSkill}</span>
                        </div>
                        <div className="text-gold-500 font-bold px-2">⇄</div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">They Teach</span>
                          <span className="font-semibold text-cyan-600 dark:text-cyan-400">{learnSkill}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[11px] text-slate-400">Format: {ex.preferredFormat}</span>
                        {ex.studioId ? (
                          <Link
                            to={`/studio/${ex.studioId._id || ex.studioId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all hover:scale-105"
                          >
                            <MonitorPlay className="w-3.5 h-3.5" />
                            Enter Skill Studio
                          </Link>
                        ) : (
                          <Link
                            to="/exchanges"
                            className="text-xs text-gold-600 dark:text-gold-400 hover:underline"
                          >
                            Manage Request →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggested Connections (Rule-Based Matching Checklist) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold-500" />
                  Suggested Peer Connections
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deterministic rule-based compatibility based on your skills and preferences.
                </p>
              </div>
              <Link
                to="/discover"
                className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                Search all peers →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedPeers.map((peer) => (
                <div
                  key={peer.user._id}
                  className="p-5 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 hover:border-gold-500/40 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar avatar={peer.user.avatar} size="md" showGoldBorder />
                        <div>
                          <Link
                            to={`/profile/${peer.user.username}`}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-gold-500 transition-colors"
                          >
                            {peer.user.displayName}
                          </Link>
                          <span className="text-xs text-slate-400 block">@{peer.user.username}</span>
                        </div>
                      </div>

                      {peer.matchInfo.isMutualMatch ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                          {peer.matchInfo.compatibilityScore}% Mutual Match
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                          Complementary
                        </span>
                      )}
                    </div>

                    {/* Transparent Why You Match Checklist */}
                    <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Why You Match:
                      </span>
                      {peer.matchInfo.whyMatch?.length > 0 ? (
                        peer.matchInfo.whyMatch.map((reason, i) => (
                          <p key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{reason.replace(/^✓\s*/, '')}</span>
                          </p>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          Offers skills in software development and technical architecture.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-2">
                    <Link
                      to={`/profile/${peer.user.username}`}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-gold-500 transition-colors"
                    >
                      View Passport →
                    </Link>
                    <button
                      onClick={() => setSelectedProposalPeer(peer)}
                      className="px-3.5 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500 text-gold-600 dark:text-gold-400 hover:text-obsidian-950 font-bold text-xs border border-gold-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Propose Exchange
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold-500" />
              Recent Platform Activity
            </h2>

            <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm divide-y divide-slate-100 dark:divide-white/5">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No recent activity.</p>
              ) : (
                recentNotifications.map((notif) => (
                  <div key={notif._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{notif.title}</span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <SkillEditorModal
        isOpen={isSkillEditorOpen}
        onClose={() => setIsSkillEditorOpen(false)}
      />

      <ExchangeProposalModal
        isOpen={!!selectedProposalPeer}
        onClose={() => setSelectedProposalPeer(null)}
        peer={selectedProposalPeer}
        onSuccess={() => {
          loadDashboardData();
          alert('Exchange proposal sent successfully!');
        }}
      />
    </div>
  );
};
