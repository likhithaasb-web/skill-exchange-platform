import React, { useState } from 'react';
import { X, Send, ArrowRightLeft, ShieldAlert, Check } from 'lucide-react';
import { MatchPeer, TeachingSkill, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ExchangeProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  peer: MatchPeer | null;
  onSuccess?: () => void;
}

export const ExchangeProposalModal: React.FC<ExchangeProposalModalProps> = ({
  isOpen,
  onClose,
  peer,
  onSuccess,
}) => {
  const { user, profile } = useAuth();

  const [requestedSkill, setRequestedSkill] = useState<string>('');
  const [offeredSkill, setOfferedSkill] = useState<string>('');
  const [preferredFormats, setPreferredFormats] = useState<string[]>(['Voice', 'Whiteboard']);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFormat = (fmt: string) => {
    setPreferredFormats((prev) => {
      if (prev.includes(fmt)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((f) => f !== fmt);
      } else {
        return [...prev, fmt];
      }
    });
  };

  // Initialize skills when peer changes
  React.useEffect(() => {
    if (peer) {
      // Pick first matching or first available
      const suggestedOffered = peer.matchInfo?.aTeachesWhatBWants?.[0]?.offered?.name ||
        profile?.skillsTeaching?.[0]?.name || '';
      const suggestedRequested = peer.matchInfo?.bTeachesWhatAWants?.[0]?.offered?.name ||
        peer.profile?.skillsTeaching?.[0]?.name || '';

      setOfferedSkill(suggestedOffered);
      setRequestedSkill(suggestedRequested);
      setMessage(`Hi @${peer.user.username}, I would love to exchange skills with you: teach ${suggestedOffered || 'my skills'} and learn ${suggestedRequested || 'your skills'}. Let's collaborate!`);
      setError(null);
    }
  }, [peer, profile]);

  if (!isOpen || !peer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkill || !requestedSkill) {
      setError('Please select both a skill to offer and a skill to learn.');
      return;
    }

    if (preferredFormats.length === 0) {
      setError('Please select at least one collaboration format.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.createExchangeRequest({
        recipientId: peer.user._id,
        offeredSkill: { name: offeredSkill },
        requestedSkill: { name: requestedSkill },
        preferredFormat: preferredFormats.join(', '),
        preferredFormats,
        message,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send exchange proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const myTeachingSkills = profile?.skillsTeaching || [];
  const peerTeachingSkills = peer.profile?.skillsTeaching || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-gold-400" />
              Propose Skill Exchange
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect directly with @{peer.user.username} for peer-to-peer knowledge sharing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Mutual Exchange Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-gold-500/20">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold block mb-1">
                YOU OFFER TO TEACH
              </span>
              {myTeachingSkills.length > 0 ? (
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                >
                  {myTeachingSkills.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name} ({s.level})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Python"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                />
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                THEY WILL TEACH YOU
              </span>
              {peerTeachingSkills.length > 0 ? (
                <select
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                >
                  {peerTeachingSkills.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name} ({s.level})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Cybersecurity"
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                />
              )}
            </div>
          </div>

          {/* Format selection (Multi-optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Preferred Collaboration Formats
              </label>
              <span className="text-[10px] text-gold-400 font-mono">
                (Multi-select enabled)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Voice', 'Whiteboard', 'Code', 'Camera', 'Mixed'] as const).map((fmt) => {
                const isSelected = preferredFormats.includes(fmt);
                return (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => handleToggleFormat(fmt)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-gold-500 bg-gold-500/20 text-gold-300 font-bold shadow-sm ring-1 ring-gold-500/40'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 stroke-[3]" />}
                    <span>{fmt}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              * Multiple formats can be chosen. Camera is strictly optional in all Skill Studios.
            </p>
          </div>

          {/* Personalized Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Introduction & Learning Goals
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them what you'd love to learn and how you can work together..."
              className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 shadow-gold-subtle transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Sending...' : 'Send Exchange Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
