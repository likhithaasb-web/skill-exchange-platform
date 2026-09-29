import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, Share2, Download, Printer, Plus, FolderGit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { SkillPassportCard } from '../components/SkillPassportCard';
import { SkillEditorModal } from '../components/SkillEditorModal';
import { UserAvatar } from '../components/UserAvatar';

export const PassportPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);

  if (!user) return null;

  const skillsTeaching = profile?.skillsTeaching || [];
  const skillsLearning = profile?.skillsLearning || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Verified Digital Credential
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                The Skill Passport
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your portable record of peer exchanges, verified skills, and collaborative project accomplishments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-white/10 transition-colors flex items-center gap-1.5"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4" />
                Export / Print
              </button>
              <button
                onClick={() => setIsSkillEditorOpen(true)}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Skills
              </button>
            </div>
          </div>

          {/* The Black + Gold Card */}
          <SkillPassportCard
            user={user}
            profile={profile}
            isOwner
            onEditSkills={() => setIsSkillEditorOpen(true)}
          />

          {/* Verification Hierarchy Guide */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Skill Verification Tiers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SkillX never relies on automated certifications or quizzes. Trust is grounded in real peer exchanges and tangible project code.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  Self-Declared
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Initial Baseline</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Skills you declare upon profile creation. Transparently marked as unverified until peer collaboration occurs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-gold-500/20 space-y-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                  <ShieldCheck className="w-3 h-3 text-gold-500" /> Peer-Verified
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Exchange Confirmed</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Earned when another member completes a Skill Studio exchange with you and leaves an appreciation confirmation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-emerald-500/20 space-y-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Project-Demonstrated
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Proven in Code</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  The highest endorsement: earned when you and a partner mark a collaborative project as complete.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SkillEditorModal
        isOpen={isSkillEditorOpen}
        onClose={() => setIsSkillEditorOpen(false)}
      />
    </div>
  );
};
