import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Star, 
  MapPin, 
  ArrowRightLeft, 
  FileText, 
  CreditCard,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkillProfile, User } from '../types';
import { UserAvatar } from './UserAvatar';
import { exportActivityPDF } from '../utils/exportActivityPDF';

interface SkillPassportCardProps {
  user: User;
  profile?: SkillProfile | null;
  isOwner?: boolean;
  onEditSkills?: () => void;
  onProposeExchange?: () => void;
}

export const SkillPassportCard: React.FC<SkillPassportCardProps> = ({
  user,
  profile,
  isOwner = false,
  onEditSkills,
  onProposeExchange,
}) => {
  const navigate = useNavigate();
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/profile/${user.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportActivityPDF(user, profile);
  };

  const memberId = user._id ? user._id.slice(-6).toUpperCase() : 'MEMBER';

  // Determine highest verification tier among teaching skills
  const hasProjectVerified = skillsTeaching.some(s => s.verificationStatus === 'Project-Demonstrated');
  const hasPeerVerified = skillsTeaching.some(s => s.verificationStatus === 'Peer-Verified');

  return (
    <div className="w-full max-w-xl mx-auto relative rounded-3xl overflow-hidden border border-gold-500/40 bg-gradient-to-br from-[#131722] via-[#0A0D13] to-[#040608] shadow-2xl p-5 sm:p-6 text-white transition-all duration-300 hover:border-gold-500/60 hover:shadow-gold-500/10 group">
      {/* Decorative Gold Radial Glows */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Business Card Chip & Header Strip */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gold-500/20 relative z-10">
        <div className="flex items-center gap-2">
          {/* Smart Chip Graphic */}
          <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-400 to-gold-200 p-0.5 flex items-center justify-center shadow-inner">
            <div className="w-full h-full border border-amber-600/40 rounded-[2px] flex items-center justify-center">
              <CreditCard className="w-3 h-3 text-obsidian-950/70" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-gold-400 uppercase">
              SKILLX PASSPORT
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              SX-{memberId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available for Exchange
          </span>
        </div>
      </div>

      {/* Main Body: Identity & Key Selection Signal */}
      <div className="py-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* User Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <UserAvatar
            avatar={user.avatar}
            size="lg"
            showGoldBorder
            className="ring-2 ring-gold-500/30 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold font-display text-white truncate">
                {user.displayName}
              </h2>
              {hasProjectVerified ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" title="Project Verified">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Project-Proven
                </span>
              ) : hasPeerVerified ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-300 border border-gold-500/30" title="Peer Verified">
                  <ShieldCheck className="w-2.5 h-2.5" /> Peer-Verified
                </span>
              ) : null}
            </div>

            <p className="text-xs text-gold-400/90 font-medium">@{user.username}</p>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 italic">
              {user.tagline || 'Collaborative Peer Explorer'}
            </p>

            {user.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {user.location}
              </span>
            )}
          </div>
        </div>

        {/* Quick Social Proof Metrics (Crucial for peer selection) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>5.0</span>
            <span className="text-[10px] text-slate-400 font-normal">Peer Rating</span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
            <ArrowRightLeft className="w-3 h-3 text-gold-400" />
            <span><strong>{stats.exchangesCompleted}</strong> Exchanges Completed</span>
          </div>
        </div>
      </div>

      {/* The Crucial Match Section: What other peers need to select this user */}
      <div className="py-3 px-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5 relative z-10 text-xs">
        {/* Skills I Can Teach You */}
        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gold-400 pt-1">
            Teaches:
          </span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {skillsTeaching.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">No teaching skills listed yet.</span>
            ) : (
              skillsTeaching.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-300 border border-gold-500/25 text-[11px] font-medium"
                >
                  <Award className="w-3 h-3 text-gold-400 shrink-0" />
                  <strong>{skill.name}</strong>
                  <span className="text-[10px] text-gold-400/80">({skill.level})</span>
                </span>
              ))
            )}
            {skillsTeaching.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{skillsTeaching.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Skills I Want In Return */}
        <div className="flex items-start gap-2 border-t border-white/5 pt-2">
          <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-0.5">
            Seeking:
          </span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {skillsLearning.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">Open to all peer skills</span>
            ) : (
              skillsLearning.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-slate-200 border border-white/10 text-[11px]"
                >
                  {skill.name}
                  {skill.targetLevel && (
                    <span className="text-[9px] text-slate-400 ml-1">({skill.targetLevel})</span>
                  )}
                </span>
              ))
            )}
            {skillsLearning.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{skillsLearning.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Strip */}
      <div className="mt-4 pt-3 border-t border-gold-500/15 flex items-center justify-between gap-2 relative z-10">
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          <span>ZERO-AI • VERIFIED HUMAN P2P</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium border border-white/10 transition-colors"
            title="Download PDF Activity Summary to Share"
          >
            <FileText className="w-3 h-3 text-gold-400" />
            <span>PDF</span>
          </button>

          {/* Share Card */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 text-[11px] font-medium border border-gold-500/30 transition-all hover:scale-105 active:scale-95"
            title="Copy Public Passport Card Link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          {/* Owner vs Peer Action */}
          {isOwner && onEditSkills ? (
            <button
              type="button"
              onClick={onEditSkills}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold border border-white/15 transition-colors"
            >
              Edit Skills
            </button>
          ) : !isOwner ? (
            <button
              type="button"
              onClick={onProposeExchange ? onProposeExchange : () => navigate(`/profile/${user.username}`)}
              className="px-3 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-[11px] font-bold shadow-gold-subtle transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Exchange</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
