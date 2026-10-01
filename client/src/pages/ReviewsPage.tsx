import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Heart, Sparkles, User, Globe, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { UserAvatar } from '../components/UserAvatar';
import { api } from '../services/api';
import { Review } from '../types';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user?._id]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReviewsForUser(user!._id);
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      console.warn('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-white/10">
            <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              Peer Confirmations
            </span>
            <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
              Peer Reviews & Endorsements
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Human appreciation and qualitative feedback from completed Skill Studio sessions.
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <Heart className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No peer reviews yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Complete a skill exchange session with a partner to receive peer confirmations on your Skill Passport.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/20 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar avatar={rev.reviewerId?.avatar} size="md" showGoldBorder />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {rev.reviewerId?.displayName || 'Peer'}
                          </span>
                          <span className="text-xs text-gold-600 dark:text-gold-400">@{rev.reviewerId?.username}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        Verified: {rev.skillTaught}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                        {rev.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {rev.visibility === 'public' ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  {/* Appreciation Chips */}
                  {rev.appreciationChips?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rev.appreciationChips.map((chip, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 shadow-sm"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Personal Note */}
                  {rev.personalNote && (
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-black/40 p-3.5 rounded-xl border border-slate-200 dark:border-white/5 italic">
                      "{rev.personalNote}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
};
