import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  MonitorPlay,
  Share2,
  Users,
  Lock,
  Sparkles,
  CheckCircle2,
  Cpu,
  EyeOff,
  Code2,
  PenTool,
  Radio,
  FileText,
  Star
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { UserAvatar } from '../components/UserAvatar';

export const LandingPage: React.FC = () => {
  const [exchangeTab, setExchangeTab] = useState<'sample1' | 'sample2'>('sample1');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-900 dark:selection:text-gold-200 ambient-canvas transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-200 dark:border-white/10">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Human-to-Human Skill Exchange • Zero AI Dependencies</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Your Skills Have Value. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 dark:from-gold-400 dark:via-amber-200 dark:to-gold-500">
              Exchange Them.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Learn from people. Teach what you know. Build something together.
            A premium peer-to-peer network designed for direct knowledge exchange.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-sm shadow-gold-glow transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Start Your Skill Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold text-sm border border-slate-300 dark:border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Explore Skills
            </Link>
          </div>

          {/* Interactive Bilateral Skill Exchange Visual */}
          <div className="mt-16 max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-obsidian-900 dark:to-obsidian-950 border border-slate-200 dark:border-gold-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Transparent Complementary Matching Model
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setExchangeTab('sample1')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    exchangeTab === 'sample1' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Tech ↔ Security
                </button>
                <button
                  onClick={() => setExchangeTab('sample2')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    exchangeTab === 'sample2' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Frontend ↔ Design
                </button>
              </div>
            </div>

            {exchangeTab === 'sample1' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* User A */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar avatar={{ category: 'technical', id: 'tech-wizard' }} size="md" showGoldBorder />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Harsha</p>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400">@python_master</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 dark:text-slate-400">
                      Teaches: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Python • Flask</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Wants: <span className="font-semibold text-cyan-600 dark:text-cyan-400">Cybersecurity</span>
                    </p>
                  </div>
                </div>

                {/* Exchange Bridge */}
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xl font-bold shadow-gold-subtle mb-2">
                    ⇄
                  </div>
                  <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                    Mutual Match
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    100% Rule-Based Compatibility
                  </span>
                </div>

                {/* User B */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar avatar={{ category: 'technical', id: 'tech-cyber-1' }} size="md" showGoldBorder />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Nova</p>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400">@cyber_nova</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 dark:text-slate-400">
                      Teaches: <span className="font-semibold text-cyan-600 dark:text-cyan-400">Cybersecurity • Linux</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Wants: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Python</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* User A */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar avatar={{ category: 'cute', id: 'cute-fox' }} size="md" showGoldBorder />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Alex</p>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400">@alex_codes</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 dark:text-slate-400">
                      Teaches: <span className="font-semibold text-emerald-600 dark:text-emerald-400">React • TypeScript</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Wants: <span className="font-semibold text-rose-600 dark:text-rose-400">UI/UX Design</span>
                    </p>
                  </div>
                </div>

                {/* Exchange Bridge */}
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400 text-xl font-bold shadow-gold-subtle mb-2">
                    ⇄
                  </div>
                  <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                    Mutual Match
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    100% Rule-Based Compatibility
                  </span>
                </div>

                {/* User B */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar avatar={{ category: 'creative', id: 'creative-artisan' }} size="md" showGoldBorder />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Elena</p>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400">@designfox</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 dark:text-slate-400">
                      Teaches: <span className="font-semibold text-rose-600 dark:text-rose-400">Figma • Design Tokens</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Wants: <span className="font-semibold text-emerald-600 dark:text-emerald-400">React</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-6 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Transparent calculation
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Private Skill Studio
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Verified Passport credential
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle / How It Works */}
      <section id="how-it-works" className="py-20 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-obsidian-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-gold-600 dark:text-gold-400">
              The Seven-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-2">
              FIND → CONNECT → EXCHANGE → LEARN → BUILD → VERIFY
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              SkillX is designed around human equity. You are never a passive student in a lecture; you are a peer bringing tangible value to another person.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Build Your Profile',
                desc: 'Answer 5 personalized learning questions and select beautiful non-photo avatars.',
              },
              {
                step: '02',
                title: 'Share What You Know',
                desc: 'Declare the skills you can teach and what you are eager to learn in return.',
              },
              {
                step: '03',
                title: 'Discover Compatible Peers',
                desc: 'Deterministic rule-based matching identifies exact mutual skill pairings without AI.',
              },
              {
                step: '04',
                title: 'Launch Skill Studio',
                desc: 'Step into a private collaborative workspace with shared whiteboard and code space.',
              },
              {
                step: '05',
                title: 'Exchange Knowledge',
                desc: 'Explain concepts verbally with optional push-to-talk, screen share, and resources.',
              },
              {
                step: '06',
                title: 'Collaborate on Projects',
                desc: 'Turn knowledge into tangible working projects you can show the world.',
              },
              {
                step: '07',
                title: 'Build Skill Passport',
                desc: 'Earn peer-verified and project-demonstrated credentials on your digital passport.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-white/10 hover:border-gold-500/40 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-1 rounded">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Features */}
      <section id="features" className="py-20 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-gold-600 dark:text-gold-400">
              Signature Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-2">
              Engineered For Deep Human Collaboration
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Every tool in SkillX is purposeful, private, and built for real pair learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/20 shadow-sm hover:border-gold-500/50 transition-all">
              <Award className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Black + Gold Skill Passport</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A prestigious digital credential that distinguishes between self-declared proficiency, peer-verified knowledge, and project-demonstrated expertise.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm hover:border-gold-500/50 transition-all">
              <MonitorPlay className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Private Skill Studio</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A 2-party collaborative environment featuring synchronized Whiteboard, multi-language Code Space, in-studio chat, and host session permissions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm hover:border-gold-500/50 transition-all">
              <Radio className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Camera is Always Optional</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explain complex ideas verbally or on the whiteboard. Camera is never mandatory, works 100% camera-off, and respects your privacy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm hover:border-gold-500/50 transition-all">
              <FileText className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Attributed Resource Sharing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Share PDFs, code files, and diagrams. Every file clearly attributes the uploader avatar, username, timestamp, and size with zero anonymous ownership.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm hover:border-gold-500/50 transition-all">
              <Star className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Conversational Peer Reviews</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No boring 1–10 survey forms. Light appreciation chips (“Explained clearly”, “Easy to collaborate with”) that directly verify skills on your passport.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm hover:border-gold-500/50 transition-all">
              <Lock className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy & Security Centers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Granular control over profile visibility, contact preferences, active login sessions, and instant user blocking/reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-100 dark:bg-obsidian-950 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center font-bold text-obsidian-950 text-xs">
              X
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SkillX</span>
            <span>— Exchange Skills. Share Knowledge. Build Together.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-gold-500 transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-gold-500 transition-colors">Privacy Policy</Link>
            <Link to="/guidelines" className="hover:text-gold-500 transition-colors">Community Guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

