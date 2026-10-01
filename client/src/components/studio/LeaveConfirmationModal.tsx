import React from 'react';
import { AlertTriangle, LogOut, PhoneOff, X, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';

interface LeaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
  onConfirmEndSession: () => void;
  isHost: boolean;
  isEnding?: boolean;
}

export const LeaveConfirmationModal: React.FC<LeaveConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmLeave,
  onConfirmEndSession,
  isHost,
  isEnding = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full blur-2xl pointer-events-none opacity-40 ${
            isHost ? 'bg-rose-500' : 'bg-gold-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isEnding}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {isHost ? (
          /* Host / Instructor Leave Alert */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-1">
                  Instructor / Host Alert
                </span>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
                  End Meeting for Everyone?
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are the <strong className="text-gold-500 dark:text-gold-400">session instructor</strong>. If you leave now, this meeting will be <strong className="text-rose-600 dark:text-rose-400">ended completely</strong> for all participants.
            </p>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>What happens next:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                <li>Active audio, video, and screen sharing will disconnect immediately.</li>
                <li>Collaborative whiteboard and code spaces will close.</li>
                <li>All students and peers will be cleanly redirected to their dashboard.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isEnding}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                Stay in Session
              </button>
              <button
                type="button"
                onClick={onConfirmEndSession}
                disabled={isEnding}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isEnding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Ending Meeting...</span>
                  </>
                ) : (
                  <>
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Meeting for Everyone</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Participant Leave Alert */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-500 shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 mb-1">
                  Participant Action
                </span>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
                  Leave Studio Session?
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to leave this session? The instructor and other peers will remain in the room. You can re-enter at any time while the session is active.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Stay in Session
              </button>
              <button
                type="button"
                onClick={onConfirmLeave}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Leave Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
