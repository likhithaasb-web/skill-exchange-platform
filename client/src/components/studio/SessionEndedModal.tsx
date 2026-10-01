import React, { useEffect, useState } from 'react';
import { PhoneOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionEndedModalProps {
  isOpen: boolean;
  endedBy?: string;
  reason?: string;
  onReturnDashboard?: () => void;
}

export const SessionEndedModal: React.FC<SessionEndedModalProps> = ({
  isOpen,
  endedBy = 'The instructor',
  reason,
  onReturnDashboard,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onReturnDashboard) {
            onReturnDashboard();
          } else {
            navigate('/dashboard');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onReturnDashboard, navigate]);

  if (!isOpen) return null;

  const handleReturn = () => {
    if (onReturnDashboard) {
      onReturnDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-center overflow-hidden">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-gold-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Central Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-gold-500/20 border border-gold-500/40 flex items-center justify-center mx-auto mb-4 text-gold-500 shadow-gold-subtle">
          <PhoneOff className="w-8 h-8 text-gold-500 dark:text-gold-400" />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
          Session Terminated
        </span>

        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">
          Meeting Ended Completely
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-4 leading-relaxed">
          {reason || (
            <>
              The session instructor <strong className="text-gold-600 dark:text-gold-400 font-semibold">{endedBy}</strong> has left the meeting. This Skill Studio session has concluded for all participants.
            </>
          )}
        </p>

        {/* Status card */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-obsidian-950 border border-slate-200 dark:border-white/5 mb-5 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">All streams disconnected</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        </div>

        {/* Countdown notice */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          Redirecting to your dashboard in <span className="text-gold-600 dark:text-gold-400 font-bold">{countdown}</span> seconds...
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => navigate('/exchanges')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-300 dark:border-white/10"
          >
            View Exchanges
          </button>
          <button
            onClick={handleReturn}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Return Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
