import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Send,
  Sparkles,
  ArrowRightLeft,
  MessageSquare,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { UserAvatar } from '../components/UserAvatar';
import { ExchangeProposalModal } from '../components/ExchangeProposalModal';
import { api } from '../services/api';
import { MatchPeer } from '../types';

export const DiscoverPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const initialSearch = searchParams.get('search') || searchParams.get('username') || searchParams.get('skill') || '';

  const [peers, setPeers] = useState<MatchPeer[]>([]);
  const [similarSuggestions, setSimilarSuggestions] = useState<MatchPeer[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [mutualOnly, setMutualOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProposalPeer, setSelectedProposalPeer] = useState<MatchPeer | null>(null);

  // Debounced live filtering on search query and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPeers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, selectedLanguage, mutualOnly]);

  const fetchPeers = async (overrideSkill?: string) => {
    setIsLoading(true);
    try {
      const skillParam = overrideSkill !== undefined ? overrideSkill : searchQuery;
      const res = await api.discoverPeers({
        skill: skillParam,
        category: selectedCategory,
        level: selectedLevel,
        language: selectedLanguage,
        mutualOnly,
      });

      if (res.success) {
        setPeers(res.peers || []);
        setSimilarSuggestions(res.similarSuggestions || []);
      }
    } catch (err) {
      console.warn('Error discovering peers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPeers();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedLanguage('');
    setMutualOnly(false);
    fetchPeers('');
  };

  const isBrowsingAll = !searchQuery.trim() && !selectedCategory && !selectedLevel && !selectedLanguage && !mutualOnly;

  const renderPeerCard = (peer: MatchPeer, isSuggestedHighlight = false) => {
    const isMutual = peer.matchInfo?.isMutualMatch;
    const formattedUsername = `@${peer.user.username.replace(/^@/, '')}`;

    return (
      <div
        key={peer.user._id}
        className={`satin-card rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
          isMutual
            ? 'border border-gold-500/50 shadow-gold-satin'
            : isSuggestedHighlight
            ? 'border border-gold-500/30 bg-gradient-to-b from-gold-500/[0.04] to-transparent'
            : 'border border-slate-200/80 dark:border-white/[0.08] hover:border-gold-500/40'
        }`}
      >
        <div>
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/profile/${peer.user.username}`} className="shrink-0">
                <UserAvatar avatar={peer.user.avatar} size="md" showGoldBorder={isMutual} />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/profile/${peer.user.username}`}
                  className="text-sm font-semibold text-slate-900 dark:text-white hover:text-gold-500 transition-colors truncate block"
                >
                  {peer.user.displayName}
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchQuery(formattedUsername);
                  }}
                  className="text-xs text-slate-400 hover:text-gold-500 block truncate transition-colors font-mono text-left"
                  title={`Filter by ${formattedUsername}`}
                >
                  {formattedUsername}
                </button>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
              {isMutual ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40">
                  🤝 Mutual Match
                </span>
              ) : peer.matchInfo?.compatibilityScore > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {peer.matchInfo.compatibilityScore}% Match
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                  Explore
                </span>
              )}
            </div>
          </div>

          {/* Suggestion Reason Badge */}
          {peer.suggestionReason && (
            <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-gold-500/10 border border-gold-500/20 text-[11px] font-medium text-gold-700 dark:text-gold-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span className="truncate">{peer.suggestionReason}</span>
            </div>
          )}

          {/* Tagline / Bio */}
          <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-3 line-clamp-2">
            "{peer.user.tagline || peer.user.bio || 'Passionate skill exchanger.'}"
          </p>

          {/* Skills Teaching */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gold-600 dark:text-gold-400 block font-mono">
              Teaches ({peer.profile?.skillsTeaching?.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {peer.profile?.skillsTeaching?.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] text-[11px] font-medium text-slate-800 dark:text-slate-200"
                >
                  {s.name} <span className="text-slate-400 dark:text-slate-500 text-[9px]">({s.level})</span>
                </span>
              ))}
              {(peer.profile?.skillsTeaching?.length || 0) > 4 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{(peer.profile?.skillsTeaching?.length || 0) - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Skills Learning */}
          <div className="mt-3 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block font-mono">
              Wants To Learn ({peer.profile?.skillsLearning?.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {peer.profile?.skillsLearning?.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-[11px] text-slate-700 dark:text-slate-300"
                >
                  {s.name}
                </span>
              ))}
              {(peer.profile?.skillsLearning?.length || 0) > 4 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{(peer.profile?.skillsLearning?.length || 0) - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Why You Match Transparent Explanation */}
          {user && peer.matchInfo?.whyMatch?.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block mb-1 font-mono">
                Compatibility Breakdown:
              </span>
              {peer.matchInfo.whyMatch.slice(0, 2).map((reason, i) => (
                <p key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span className="line-clamp-2">{reason.replace(/^✓\s*/, '')}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Bottom User-to-User Connection Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-white/[0.06] mt-5">
          <Link
            to={`/profile/${peer.user.username}`}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-gold-500 transition-colors flex items-center justify-center sm:justify-start gap-1 py-1 font-medium"
            title="View Skill Passport"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Passport</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to={`/messages?userId=${peer.user._id}`}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 hover:border-gold-500/40 bg-slate-50 dark:bg-white/5 hover:bg-gold-500/10 text-slate-700 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold-400 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  title="Direct message this user"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
                  <span>Chat</span>
                </Link>

                <button
                  onClick={() => setSelectedProposalPeer(peer)}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-gold-satin transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  title="Propose 1-on-1 skill exchange"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Propose</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-gold-satin transition-all flex items-center justify-center gap-1.5"
              >
                Connect
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <div className={`flex-1 ${user ? 'lg:pl-64' : ''} flex flex-col min-w-0 w-full`}>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Peer Discovery & Matching
                </span>
                <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                  Explore Skills & Peers
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Find compatible people to exchange knowledge with. Direct user-to-user messaging, smart suggestions, and transparent compatibility.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMutualOnly(!mutualOnly)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    mutualOnly
                      ? 'border-gold-500/50 bg-gold-500/15 text-gold-700 dark:text-gold-300 font-bold shadow-inner-glass'
                      : 'border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {mutualOnly ? 'Mutual Matches (Active)' : 'Filter Mutual Matches'}
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by username (@username) or skills (e.g. Python, Cybersecurity, React)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#0B0E17] border border-slate-200/80 dark:border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500/50 shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-gold-satin transition-all shrink-0 active:scale-[0.98]"
                >
                  Search
                </button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] font-mono mr-1">
                  <Filter className="w-3 h-3" /> Filters:
                </span>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white dark:bg-[#0B0E17] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Security">Security</option>
                  <option value="Design">Design & UI/UX</option>
                  <option value="Cloud">Cloud & DevOps</option>
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-white dark:bg-[#0B0E17] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white dark:bg-[#0B0E17] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
                >
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                </select>

                {(searchQuery || selectedCategory || selectedLevel || selectedLanguage || mutualOnly) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 underline ml-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </form>

            {/* Main Content Area */}
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                <Compass className="w-8 h-8 mx-auto text-gold-500 animate-spin mb-3" />
                Searching compatible peer profiles...
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Similar Suggestions Section only when browsing all (no query/filters) */}
                {isBrowsingAll && similarSuggestions.length > 0 && (
                  <section className="satin-card p-5 rounded-2xl border border-gold-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-600 dark:text-gold-400 font-bold">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Similar Suggestions For You
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Recommended peers matching your learning interests and skills to exchange
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold border border-gold-500/30">
                        Smart Suggestions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                      {similarSuggestions.slice(0, 3).map((peer) => renderPeerCard(peer, true))}
                    </div>
                  </section>
                )}

                {/* 2. Main Search/Explore Results Grid or Fallback */}
                {peers.length === 0 ? (
                  <div className="space-y-6">
                    <div className="satin-card p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-center space-y-3 shadow-sm">
                      <Compass className="w-10 h-10 mx-auto text-gold-500/70" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {searchQuery ? `No exact match for "${searchQuery}"` : 'No peers found for selected filters'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {similarSuggestions.length > 0
                          ? 'No exact keyword matches found, but here are similar peer suggestions with complementary skills and mutual compatibility:'
                          : 'Try widening your search terms or clearing some of the filters.'}
                      </p>
                    </div>

                    {similarSuggestions.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold-500" />
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Similar Suggestions & Recommended Peers ({similarSuggestions.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {similarSuggestions.map((peer) => renderPeerCard(peer, true))}
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {isBrowsingAll ? 'All Available Peers' : `Search Results (${peers.length})`}
                      </h2>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {peers.length} {peers.length === 1 ? 'peer' : 'peers'} found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {peers.map((peer) => renderPeerCard(peer, false))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <ExchangeProposalModal
        isOpen={!!selectedProposalPeer}
        onClose={() => setSelectedProposalPeer(null)}
        peer={selectedProposalPeer}
        onSuccess={() => {
          alert('Exchange proposal sent successfully!');
          fetchPeers();
        }}
      />
    </div>
  );
};
