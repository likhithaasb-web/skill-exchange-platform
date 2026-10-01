import React, { useState } from 'react';
import { X, Star, Heart, Check, Lock, Globe } from 'lucide-react';
import { SkillExchange } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: SkillExchange | null;
  onSuccess?: () => void;
}

const APPRECIATION_OPTIONS = [
  { id: '✨ Explained clearly', label: 'Explained clearly', icon: '✨' },
  { id: '🤝 Easy to collaborate with', label: 'Easy to collaborate with', icon: '🤝' },
  { id: '💡 Shared useful knowledge', label: 'Shared useful knowledge', icon: '💡' },
  { id: '🧠 Made difficult concepts easier', label: 'Made difficult concepts easier', icon: '🧠' },
  { id: '💬 Communicated well', label: 'Communicated well', icon: '💬' },
  { id: '⏱ Respectful of time', label: 'Respectful of time', icon: '⏱' },
  { id: '🚀 Helped me build something', label: 'Helped me build something', icon: '🚀' },
];

export const PeerReviewModal: React.FC<PeerReviewModalProps> = ({
  isOpen,
  onClose,
  exchange,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !exchange) return null;

  // Resolve current user ID and exchange participant IDs safely
  const currentUserId = (user?._id || (user as any)?.id || '').toString();
  const requesterId = (exchange.requesterId?._id || exchange.requesterId || '').toString();
  const recipientId = (exchange.recipientId?._id || exchange.recipientId || '').toString();

  const isRequester = currentUserId === requesterId;
  const partner = isRequester ? exchange.recipientId : exchange.requesterId;
  const partnerId = isRequester ? recipientId : requesterId;
  const partnerDisplayName =
    partner?.displayName || (partner?.username ? `@${partner.username}` : 'Exchange Partner');
  const skillTaughtByPartner =
    (isRequester ? exchange.requestedSkill?.name : exchange.offeredSkill?.name) || 'Skill';

  const toggleChip = (chipId: string) => {
    if (selectedChips.includes(chipId)) {
      setSelectedChips(selectedChips.filter((c) => c !== chipId));
    } else {
      setSelectedChips([...selectedChips, chipId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChips.length === 0 && !personalNote.trim()) {
      setError('Please select at least one appreciation chip or add a short note.');
      return;
    }

    const targetRecipientId = (partner?._id || partnerId || '').toString();
    if (targetRecipientId === currentUserId) {
      setError('You cannot review yourself. Please verify your exchange partner.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.submitReview({
        exchangeId: exchange._id,
        recipientId: targetRecipientId,
        skillTaught: skillTaughtByPartner,
        appreciationChips: selectedChips,
        personalNote,
        visibility,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
              How was your exchange with {partnerDisplayName}?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified skill taught: <span className="text-gold-400 font-semibold">{skillTaughtByPartner}</span>
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
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Selectable appreciation chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Choose what describes the experience:
            </label>
            <div className="flex flex-wrap gap-2">
              {APPRECIATION_OPTIONS.map((chip) => {
                const isSelected = selectedChips.includes(chip.id);
                return (
                  <button
                    type="button"
                    key={chip.id}
                    onClick={() => toggleChip(chip.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-gold-500 bg-gold-500/20 text-gold-300 font-semibold shadow-gold-subtle scale-105'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-gold-500/40 hover:bg-white/5'
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-gold-400 ml-0.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Short Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Want to add something? (Optional)
            </label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Tell them what you appreciated about their explanation or collaboration..."
              className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Public vs Private Choice */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              Feedback Privacy Preference
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                  visibility === 'public'
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300 font-semibold'
                    : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 text-gold-400" />
                <div>
                  <span className="block font-semibold">Public Verification</span>
                  <span className="text-[10px] text-slate-400">Shows on their profile & passport</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                  visibility === 'private'
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300 font-semibold'
                    : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                <div>
                  <span className="block font-semibold">Private to Partner</span>
                  <span className="text-[10px] text-slate-400">Only visible to them</span>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 shadow-gold-subtle transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5 fill-obsidian-950" />
              {isLoading ? 'Submitting...' : 'Send Appreciation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
