import React, { useState } from 'react';
import { Shield, Eye, Lock, Users, Check, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export const PrivacyCenterPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [profileVisibility, setProfileVisibility] = useState(user?.privacySettings?.profileVisibility || 'public');
  const [skillVisibility, setSkillVisibility] = useState(user?.privacySettings?.skillVisibility || 'public');
  const [reviewVisibility, setReviewVisibility] = useState(user?.privacySettings?.reviewVisibility || 'public');
  const [showActivity, setShowActivity] = useState(user?.privacySettings?.showActivity ?? true);
  const [contactPreference, setContactPreference] = useState(user?.privacySettings?.contactPreference || 'anyone');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.updatePrivacySettings({
        profileVisibility,
        skillVisibility,
        reviewVisibility,
        showActivity,
        contactPreference,
      });

      if (res.success && res.privacySettings) {
        updateUser({
          ...user,
          privacySettings: res.privacySettings,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="pb-4 border-b border-white/10">
            <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Privacy Center
            </span>
            <h1 className="text-3xl font-extrabold font-display text-white mt-1">
              Privacy & Visibility Controls
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Granular controls over who can discover your skills, view your passport, and send you exchange requests.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              Privacy preferences updated and saved securely.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Visibility */}
            <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold-400" />
                  Profile & Passport Visibility
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decide who can view your Skill Passport, bio, and shared accomplishments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'public', title: 'Public', desc: 'Visible to anyone on the web' },
                  { id: 'members', title: 'Members Only', desc: 'Visible only to signed-in peers' },
                  { id: 'private', title: 'Private', desc: 'Visible only to you' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setProfileVisibility(opt.id as any)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                      profileVisibility === opt.id
                        ? 'border-gold-500 bg-gold-500/15 text-white ring-1 ring-gold-500/40'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-bold text-white block mb-0.5">{opt.title}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-400" />
                  Exchange Request Inquiries
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control who is allowed to propose a skill exchange with you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'anyone', title: 'Anyone', desc: 'Any verified SkillX member' },
                  { id: 'matching', title: 'Matching Users Only', desc: 'Only peers with complementary skills' },
                  { id: 'nobody', title: 'Pause Requests', desc: 'Do not allow new proposals' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setContactPreference(opt.id as any)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                      contactPreference === opt.id
                        ? 'border-gold-500 bg-gold-500/15 text-white ring-1 ring-gold-500/40'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-bold text-white block mb-0.5">{opt.title}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Visibility */}
            <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" />
                  Peer Review Visibility
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control whether peer endorsements appear publicly on your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewVisibility('public')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                    reviewVisibility === 'public'
                      ? 'border-gold-500 bg-gold-500/15 text-white ring-1 ring-gold-500/40'
                      : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className="font-bold text-white block mb-0.5">Allow Public Reviews</span>
                  <span className="text-[11px] text-slate-400">Show peer endorsements on your passport</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewVisibility('private')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                    reviewVisibility === 'private'
                      ? 'border-gold-500 bg-gold-500/15 text-white ring-1 ring-gold-500/40'
                      : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className="font-bold text-white block mb-0.5">Private Feedback Only</span>
                  <span className="text-[11px] text-slate-400">Only you can view received feedback</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
