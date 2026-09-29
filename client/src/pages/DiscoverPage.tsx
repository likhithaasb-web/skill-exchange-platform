import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Send,
  Award,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ArrowRightLeft
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [peers, setPeers] = useState<MatchPeer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [mutualOnly, setMutualOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProposalPeer, setSelectedProposalPeer] = useState<MatchPeer | null>(null);

  useEffect(() => {
    fetchPeers();
  }, [selectedCategory, selectedLevel, selectedLanguage, mutualOnly]);

  const fetchPeers = async () => {
    setIsLoading(true);
    try {
      const res = await api.discoverPeers({
        skill: searchQuery,
        category: selectedCategory,
        level: selectedLevel,
        language: selectedLanguage,
        mutualOnly,
      });

      if (res.success) {
        setPeers(res.peers || []);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex">
        {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <main className={`flex-1 ${user ? 'lg:pl-64' : ''} p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Peer Discovery & Matching
              </span>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                Explore Skills & Peers
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Find compatible people to exchange knowledge with. Matches are computed with transparent rule-based logic.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMutualOnly(!mutualOnly)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  mutualOnly
                    ? 'border-gold-500 bg-gold-500 text-obsidian-950 shadow-gold-subtle'
                    : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {mutualOnly ? 'Mutual Matches Only (Active)' : 'Filter Mutual Matches'}
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
                  placeholder="Search skills (e.g. Python, Cybersecurity, React, Figma, Linux, Docker)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all"
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
                className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
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
                className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
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
                className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
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
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedLevel('');
                    setSelectedLanguage('');
                    setMutualOnly(false);
                  }}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 underline ml-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </form>

          {/* Results Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <Compass className="w-8 h-8 mx-auto text-gold-500 animate-spin mb-3" />
              Searching compatible peer profiles...
            </div>
          ) : peers.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <Compass className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching peers found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try widening your search terms or clearing some of the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {peers.map((peer) => {
                const isMutual = peer.matchInfo?.isMutualMatch;
                return (
                  <div
                    key={peer.user._id}
                    className={`rounded-2xl p-5 flex flex-col justify-between transition-all bg-white dark:bg-obsidian-900 shadow-sm ${
                      isMutual
                        ? 'border-2 border-gold-500/40 hover:border-gold-500/80 shadow-gold-subtle'
                        : 'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/profile/${peer.user.username}`} className="flex items-center gap-3 group">
                          <UserAvatar avatar={peer.user.avatar} size="md" showGoldBorder={isMutual} />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors">
                              {peer.user.displayName}
                            </h4>
                            <span className="text-xs text-slate-400 block">@{peer.user.username}</span>
                          </div>
                        </Link>

                        {isMutual ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40">
                            Mutual Match
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                            Explore
                          </span>
                        )}
                      </div>

                      {/* Tagline / Bio */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-3 line-clamp-2">
                        "{peer.user.tagline || peer.user.bio || 'Passionate skill exchanger.'}"
                      </p>

                      {/* Skills Teaching */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold-600 dark:text-gold-400 block">
                          Teaches ({peer.profile?.skillsTeaching?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {peer.profile?.skillsTeaching?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-800 dark:text-slate-200"
                            >
                              {s.name} <span className="text-slate-400 dark:text-slate-500 text-[9px]">({s.level})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills Learning */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                          Wants To Learn ({peer.profile?.skillsLearning?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {peer.profile?.skillsLearning?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Why You Match Transparent Explanation */}
                      {user && peer.matchInfo?.whyMatch?.length > 0 && (
                        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-gold-500/20 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block mb-1">
                            Compatibility Breakdown:
                          </span>
                          {peer.matchInfo.whyMatch.map((reason, i) => (
                            <p key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span className="line-clamp-2">{reason.replace(/^✓\s*/, '')}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-5">
                      <Link
                        to={`/profile/${peer.user.username}`}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-gold-500 transition-colors"
                      >
                        View Passport →
                      </Link>

                      {user && (
                        <button
                          onClick={() => setSelectedProposalPeer(peer)}
                          className="px-3.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Propose Exchange
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

