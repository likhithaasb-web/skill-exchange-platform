import React, { useState } from 'react';
import { X, ShieldAlert, Flag, Check } from 'lucide-react';
import { api } from '../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'message' | 'resource' | 'studio' | 'review';
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  'Harassment',
  'Spam',
  'Scam',
  'Inappropriate content',
  'Impersonation',
  'Malicious file',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide details regarding this report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createReport({
        targetType,
        targetId,
        reason,
        details,
        targetDetails: { title: targetTitle },
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Report submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-bold font-display text-white">
              Report Content or User
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <p className="font-bold text-white text-base">Report Submitted</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Our safety team has received your report and will take appropriate action according to Community Guidelines.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Report Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Explanation & Details
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred, violation specifics, or any context..."
                className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

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
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
