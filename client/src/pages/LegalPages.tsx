import React from 'react';
import { Navbar } from '../components/Navbar';
import { Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Effective: September 29, 2026</p>
      </div>

      <div className="max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed bg-white dark:bg-obsidian-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2">1. Peer-to-Peer Agreement Model</h2>
        <p>
          SkillX is a collaborative exchange network. Users teach and learn from each other directly as mutual peers. SkillX is not an accredited academic institution, licensing board, or vocational school. Verification statuses on the Skill Passport (Peer-Verified and Project-Demonstrated) represent qualitative affirmations from other platform members.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-6">2. Acceptable Conduct in Skill Studios</h2>
        <p>
          Skill Studios are private workspaces reserved for constructive learning, diagramming, code collaboration, and resource sharing. Harassment, unauthorized recording, dissemination of malware, spamming, and intellectual property infringement are strictly prohibited and result in immediate account revocation.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-6">3. Content Ownership & Attribution</h2>
        <p>
          All shared resources, code snippets, and whiteboard notes remain the property of the respective creator. When sharing resources in a studio, full attribution (uploader username and timestamp) is attached and preserved.
        </p>
      </div>
    </main>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clear, human-readable data practices</p>
      </div>

      <div className="max-w-none text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed bg-white dark:bg-obsidian-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2">1. What We Collect and Why</h2>
        <p>
          We collect account information (username, email, hashed passwords), profile data (declared teaching skills, learning goals, avatar preference), studio resource metadata, and conversational reviews to facilitate bilateral skill matching and studio collaboration.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-6">2. Zero AI Processing</h2>
        <p>
          SkillX does NOT feed your audio, whiteboard drawings, code snippets, or personal onboarding answers into any third-party Artificial Intelligence model, LLM training pipeline, or synthetic voice system. All compatibility logic is 100% deterministic and rule-based.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-6">3. Camera & Audio Privacy</h2>
        <p>
          The camera is never mandatory on SkillX and starts disabled by default. Audio transmission occurs through peer-to-peer WebRTC connections. No audio or video sessions are recorded by default.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-6">4. Your Data Rights</h2>
        <p>
          You maintain full control to modify profile visibility (Public, Members only, or Private), update contact permissions, revoke device sessions, export your Skill Passport, or request complete account deletion through the Security Center.
        </p>
      </div>
    </main>
  </div>
);

export const GuidelinesPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Community Guidelines</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Our shared commitment to respectful human collaboration</p>
      </div>

      <div className="space-y-4 pt-2">
        {[
          { title: 'Person-to-Person Equity', desc: 'Approach every exchange with respect. You are not a student in a hierarchy; you are a peer bringing value to another person.' },
          { title: 'Generosity in Explanation', desc: 'Break down complex concepts patiently. Use the whiteboard, practical examples, and step-by-step guidance.' },
          { title: 'Honest Verification', desc: 'Leave genuine peer feedback. Appreciate what your partner did well and verify skills truthfully.' },
          { title: 'Safe & Consensual Spaces', desc: 'Camera is strictly optional. Respect your partner’s participation preferences at all times.' },
        ].map((g, i) => (
          <div key={i} className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-500" />
              {g.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{g.desc}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);
