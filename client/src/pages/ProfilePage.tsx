import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Send,
  Shield,
  Star,
  FolderGit2,
  Lock,
  MoreVertical,
  Flag,
  UserX,
  MapPin,
  Languages,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { SkillPassportCard } from '../components/SkillPassportCard';
import { ExchangeProposalModal } from '../components/ExchangeProposalModal';
import { ReportModal } from '../components/ReportModal';
import { UserAvatar } from '../components/UserAvatar';
import { api } from '../services/api';
import { MatchPeer, Project, Review, SkillProfile, User } from '../types';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username, currentUser?._id]);

  const loadProfile = async (uname: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getProfile(uname);
      if (res.success) {
        setProfileUser(res.user);
        setSkillProfile(res.profile);
        setReviews(res.reviews || []);
        setProjects(res.projects || []);
        setIsOwner(res.isOwner);
      }
    } catch (err: any) {
      setError(err.message || 'Profile is private or not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!profileUser) return;
    if (!window.confirm(`Block @${profileUser.username}? You will no longer see each other's profiles or exchanges.`)) return;

    try {
      await api.blockUser(profileUser._id);
      alert(`@${profileUser.username} has been blocked.`);
      window.location.href = '/dashboard';
    } catch (err: any) {
      alert(err.message || 'Block action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200 relative overflow-x-hidden">
      {/* Creative ambient glow orbs */}
      <div className="fixed top-1/4 -right-40 w-96 h-96 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-40 w-96 h-96 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        {currentUser && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <div className={`flex-1 ${currentUser ? 'lg:pl-64' : ''} flex flex-col min-w-0 w-full`}>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8 relative z-10">
          {isLoading ? (
            <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-xs">
              Loading member passport...
            </div>
          ) : error || !profileUser ? (
            <div className="py-20 text-center rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 space-y-3 shadow-sm">
              <Lock className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 opacity-50" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Restricted or Not Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {error || 'This profile is either private or unavailable.'}
              </p>
            </div>
          ) : (
            <>
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={profileUser.avatar} size="lg" showGoldBorder />
                  <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                      {profileUser.displayName}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="text-gold-600 dark:text-gold-400 font-semibold">@{profileUser.username}</span>
                      {profileUser.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {profileUser.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative">
                  {!isOwner && currentUser && (
                    <>
                      <Link
                        to={`/messages?user=${profileUser.username}`}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-obsidian-800 hover:bg-slate-100 dark:hover:bg-obsidian-700 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-300 dark:border-obsidian-700 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
                        Direct Message
                      </Link>

                      <button
                        onClick={() => setIsProposalModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Propose Exchange
                      </button>

                      {/* Options menu */}
                      <button
                        onClick={() => setShowActionMenu(!showActionMenu)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showActionMenu && (
                        <div className="absolute right-0 top-11 w-44 bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1 text-xs z-30">
                          <button
                            onClick={() => {
                              setShowActionMenu(false);
                              setIsReportModalOpen(true);
                            }}
                            className="w-full text-left p-2 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                          >
                            <Flag className="w-3.5 h-3.5 text-amber-500" />
                            Report Profile
                          </button>
                          <button
                            onClick={() => {
                              setShowActionMenu(false);
                              handleBlockUser();
                            }}
                            className="w-full text-left p-2 rounded text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Block User
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bio & Learning Identity */}
              {(profileUser.bio || profileUser.onboardingAnswers?.q4LearningHelper) && (
                <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 text-xs space-y-2 shadow-sm">
                  {profileUser.bio && (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profileUser.bio}</p>
                  )}
                  {profileUser.onboardingAnswers?.q4LearningHelper && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Learning Style Preference: <span className="text-gold-600 dark:text-gold-300 font-medium">{profileUser.onboardingAnswers.q4LearningHelper}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Flagship Skill Passport Card */}
              <SkillPassportCard
                user={profileUser}
                profile={skillProfile}
                isOwner={isOwner}
              />

              {/* Collaborative Projects Showcase */}
              {projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-gold-500" />
                    Completed Collaborative Projects ({projects.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div key={p._id} className="p-5 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded font-mono font-semibold">
                            Completed
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.skillsUsed?.map((s, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-black/40 text-gold-700 dark:text-gold-300 px-2 py-0.5 rounded border border-gold-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peer Reviews Showcase */}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                    Peer Endorsements ({reviews.length})
                  </h3>

                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-2 text-xs shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">@{rev.reviewerId?.username}</span>
                          <span className="text-[10px] text-gold-600 dark:text-gold-400 font-mono">Skill Verified: {rev.skillTaught}</span>
                        </div>
                        {rev.appreciationChips?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {rev.appreciationChips.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 text-[10px] border border-gold-500/20">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {rev.personalNote && (
                          <p className="text-slate-600 dark:text-slate-300 italic pt-1">"{rev.personalNote}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
        </div>
      </div>

      {profileUser && (
        <>
          <ExchangeProposalModal
            isOpen={isProposalModalOpen}
            onClose={() => setIsProposalModalOpen(false)}
            peer={{
              user: profileUser,
              profile: skillProfile || { userId: profileUser._id, skillsTeaching: [], skillsLearning: [], stats: {} as any },
              matchInfo: { isMutualMatch: false, isOneWayTeach: false, isOneWayLearn: false, compatibilityScore: 0, whyMatch: [], breakdown: [] }
            }}
            onSuccess={() => alert('Exchange proposal sent!')}
          />

          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            targetType="user"
            targetId={profileUser._id}
            targetTitle={`User @${profileUser.username}`}
          />
        </>
      )}
    </div>
  );
};
