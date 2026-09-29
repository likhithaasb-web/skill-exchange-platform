import React, { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Clock, BookOpen, Layers, Share2, Download, ExternalLink } from 'lucide-react';
import { SkillProfile, User } from '../types';
import { UserAvatar } from './UserAvatar';

interface SkillPassportCardProps {
  user: User;
  profile?: SkillProfile | null;
  isOwner?: boolean;
  onEditSkills?: () => void;
}

export const SkillPassportCard: React.FC<SkillPassportCardProps> = ({
  user,
  profile,
  isOwner = false,
  onEditSkills,
}) => {
  const [copied, setCopied] = useState(false);

  const skillsTeaching = profile?.skillsTeaching || [];
  const skillsLearning = profile?.skillsLearning || [];
  const stats = profile?.stats || {
    skillsTaught: skillsTeaching.length,
    skillsLearned: skillsLearning.length,
    exchangesCompleted: 0,
    projectsCompleted: 0,
    teachingHours: 0,
    learningHours: 0,
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getVerificationBadge = (status: string, count: number = 0) => {
    switch (status) {
      case 'Peer-Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm" title={`Verified by ${count} peer exchange partners`}>
            <ShieldCheck className="w-3 h-3 text-gold-400" />
            Peer-Verified {count > 0 && `(${count})`}
          </span>
        );
      case 'Project-Demonstrated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm" title="Demonstrated in completed collaborative project">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Project-Demonstrated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700" title="Self-declared by user">
            Self-Declared
          </span>
        );
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-gold-500/40 bg-gradient-to-b from-[#0F141D] via-[#090C12] to-[#06080D] shadow-2xl p-6 sm:p-8 text-white transition-all hover:border-gold-500/60 group">
      {/* Decorative Gold Sheen & Watermark */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-4 pointer-events-none select-none opacity-5 text-gold-500 font-display font-black text-8xl">
        SKILLX
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gold-500/20 gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <UserAvatar
            avatar={user.avatar}
            size="xl"
            showGoldBorder
            className="ring-4 ring-gold-500/20 shadow-gold-glow"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/30">
                Official Skill Credential
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: SX-{user._id ? user._id.slice(-6).toUpperCase() : 'MEMBER'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              {user.displayName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-gold-400 font-medium">@{user.username}</span>
              <span>•</span>
              <span className="line-clamp-1 italic">{user.tagline || 'Lifelong Skill Explorer'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 text-xs font-medium border border-gold-500/30 transition-all hover:scale-105 active:scale-95"
            title="Copy Public Passport Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Link Copied!' : 'Share Passport'}
          </button>
          {isOwner && onEditSkills && (
            <button
              onClick={onEditSkills}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
            >
              Manage Skills
            </button>
          )}
        </div>
      </div>

      {/* Main Passport Content: Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gold-500/20 relative z-10">
        {/* Skills I Teach */}
        <div className="bg-obsidian-900/60 border border-gold-500/20 rounded-xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400" />
              Skills I Teach
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {skillsTeaching.length} {skillsTeaching.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {skillsTeaching.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>Your teaching passport is waiting for its first skill.</p>
              {isOwner && (
                <button
                  onClick={onEditSkills}
                  className="mt-2 text-gold-400 hover:text-gold-300 font-medium underline"
                >
                  Add a skill you can teach
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {skillsTeaching.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/5 hover:border-gold-500/30 transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{skill.name}</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                        {skill.level}
                      </span>
                    </div>
                    {skill.category && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">{skill.category}</span>
                    )}
                  </div>
                  <div>
                    {getVerificationBadge(skill.verificationStatus, skill.verifiedByCount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-obsidian-900/60 border border-white/10 rounded-xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Skills I Want to Learn
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {skillsLearning.length} {skillsLearning.length === 1 ? 'goal' : 'goals'}
            </span>
          </div>

          {skillsLearning.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>What would you love to learn from peers?</p>
              {isOwner && (
                <button
                  onClick={onEditSkills}
                  className="mt-2 text-gold-400 hover:text-gold-300 font-medium underline"
                >
                  Add a learning goal
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {skillsLearning.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{skill.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Target: {skill.targetLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <span>Prefers:</span>
                      {skill.preferredFormat?.map((fmt, i) => (
                        <span key={i} className="text-slate-300 font-mono bg-white/5 px-1 rounded">{fmt}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded bg-white/5">
                    {skill.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exchange Statistics */}
      <div className="pt-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Verified Exchange Metrics
          </span>
          <span className="text-[11px] text-slate-400 italic">
            Zero algorithmic inflation • Peer-confirmed hours
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-black/50 border border-gold-500/20 text-center">
            <span className="block text-2xl font-bold font-mono text-gold-400">{stats.skillsTaught}</span>
            <span className="text-[11px] text-slate-400">Skills Taught</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
            <span className="block text-2xl font-bold font-mono text-slate-200">{stats.skillsLearned}</span>
            <span className="text-[11px] text-slate-400">Skills Learning</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-gold-500/20 text-center">
            <span className="block text-2xl font-bold font-mono text-gold-400">{stats.exchangesCompleted}</span>
            <span className="text-[11px] text-slate-400">Exchanges Done</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 text-center">
            <span className="block text-2xl font-bold font-mono text-emerald-400">{stats.projectsCompleted}</span>
            <span className="text-[11px] text-slate-400">Projects Built</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
            <span className="block text-2xl font-bold font-mono text-slate-200">{stats.teachingHours}h</span>
            <span className="text-[11px] text-slate-400">Teaching Hours</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
            <span className="block text-2xl font-bold font-mono text-slate-200">{stats.learningHours}h</span>
            <span className="text-[11px] text-slate-400">Learning Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};
