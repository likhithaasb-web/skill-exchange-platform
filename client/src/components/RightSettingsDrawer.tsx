import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Moon, 
  Sun, 
  Monitor, 
  Shield, 
  Eye, 
  Lock, 
  Sliders, 
  UserCheck, 
  Check, 
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AccentColor, InterfaceDensity, MotionPreference, ThemeMode, AvatarData } from '../types';
import { UserAvatar } from './UserAvatar';
import { AvatarPickerModal } from './AvatarPickerModal';

interface RightSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightSettingsDrawer: React.FC<RightSettingsDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, accent, density, motion, setTheme, setAccent, setDensity, setMotion } = useTheme();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'privacy' | 'appearance' | 'security'>('privacy');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Local state for privacy settings
  const [profileVis, setProfileVis] = useState<'public' | 'members' | 'private'>(
    user?.privacySettings?.profileVisibility || 'public'
  );
  const [skillVis, setSkillVis] = useState<'public' | 'connections' | 'private'>(
    user?.privacySettings?.skillVisibility || 'public'
  );
  const [reviewVis, setReviewVis] = useState<'public' | 'private'>(
    user?.privacySettings?.reviewVisibility || 'public'
  );
  const [showActivity, setShowActivity] = useState<boolean>(
    user?.privacySettings?.showActivity ?? true
  );
  const [contactPref, setContactPref] = useState<'anyone' | 'matching' | 'nobody'>(
    user?.privacySettings?.contactPreference || 'anyone'
  );

  // Sync when user changes
  useEffect(() => {
    if (user?.privacySettings) {
      setProfileVis(user.privacySettings.profileVisibility || 'public');
      setSkillVis(user.privacySettings.skillVisibility || 'public');
      setReviewVis(user.privacySettings.reviewVisibility || 'public');
      setShowActivity(user.privacySettings.showActivity ?? true);
      setContactPref(user.privacySettings.contactPreference || 'anyone');
    }
  }, [user]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSavePrivacy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.updatePrivacySettings({
        profileVisibility: profileVis,
        skillVisibility: skillVis,
        reviewVisibility: reviewVis,
        showActivity,
        contactPreference: contactPref,
      });

      if (res.success && res.privacySettings) {
        updateUser({
          ...user,
          privacySettings: res.privacySettings,
        });
        setSaveMessage('Privacy preferences updated successfully.');
        setTimeout(() => setSaveMessage(null), 3500);
      }
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to update privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async (
    newTheme?: ThemeMode, 
    newAccent?: AccentColor, 
    newDensity?: InterfaceDensity, 
    newMotion?: MotionPreference
  ) => {
    const t = newTheme ?? theme;
    const a = newAccent ?? accent;
    const d = newDensity ?? density;
    const m = newMotion ?? motion;

    if (newTheme) setTheme(newTheme);
    if (newAccent) setAccent(newAccent);
    if (newDensity) setDensity(newDensity);
    if (newMotion) setMotion(newMotion);

    if (user) {
      try {
        await api.updateAppearance({
          theme: t,
          accent: a,
          density: d,
          motion: m,
        });
        updateUser({
          ...user,
          appearanceSettings: { theme: t, accent: a, density: d, motion: m },
        });
      } catch (err) {
        console.warn('Could not sync appearance to server:', err);
      }
    }
  };

  const handleAvatarSelect = async (newAvatar: AvatarData) => {
    try {
      setIsSaving(true);
      const res = await api.updateProfile({ avatar: newAvatar });
      if (res.user) {
        updateUser(res.user);
      }
      setSaveMessage('Persona avatar updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message || 'Failed to update avatar');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-obsidian-900 border-l border-slate-200 dark:border-obsidian-800 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-950/50 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-900 dark:text-slate-100 text-base">Quick Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage privacy, visibility & UI mode</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition"
              aria-label="Close settings drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-obsidian-800 bg-slate-100/50 dark:bg-obsidian-950/30 px-3 pt-2 gap-1">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'appearance'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 bg-white dark:bg-obsidian-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Appearance
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'privacy'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 bg-white dark:bg-obsidian-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Privacy Center
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'security'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 bg-white dark:bg-obsidian-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Security Center
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* TAB 1: PRIVACY & VISIBILITY */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <Shield className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Granular P2P Privacy</span>
                    You control who discovers your profile, which skills you advertise, and how peers contact you.
                  </div>
                </div>

                {/* Profile Visibility */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Profile Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'public', label: 'Public', desc: 'Visible to everyone' },
                      { id: 'members', label: 'Members', desc: 'Signed-in users' },
                      { id: 'private', label: 'Private', desc: 'Direct link only' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProfileVis(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          profileVis === opt.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-medium'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Inventory Visibility */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Skill Inventory Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'public', label: 'Public', desc: 'Searchable by all' },
                      { id: 'connections', label: 'Connections', desc: 'Studio partners' },
                      { id: 'private', label: 'Hidden', desc: 'Only you' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSkillVis(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          skillVis === opt.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-medium'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews & Endorsements Visibility */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Peer Reviews & Endorsements
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'public', label: 'Public Reviews', desc: 'Display badges on profile' },
                      { id: 'private', label: 'Private Only', desc: 'Hide reviews from public' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReviewVis(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          reviewVis === opt.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-medium'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inbound Contact Preference */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Who Can Propose Exchanges
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'anyone', label: 'Anyone', desc: 'Open to proposals' },
                      { id: 'matching', label: 'Mutual Match', desc: 'Complementary skills' },
                      { id: 'nobody', label: 'Do Not Disturb', desc: 'Pause requests' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setContactPref(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          contactPref === opt.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-medium'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Activity Status Switch */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Live Presence & Activity
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                      Broadcast online status when in collaborative studios
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActivity(!showActivity)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      showActivity ? 'bg-gold-500' : 'bg-slate-300 dark:bg-obsidian-700'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform absolute top-1 ${
                        showActivity ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {saveMessage && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Save Privacy Preferences'}
                </button>
              </div>
            )}

            {/* TAB 2: APPEARANCE & THEME */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                {/* Theme Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: 'Dark Obsidian', icon: Moon },
                      { id: 'light', label: 'Light Cream', icon: Sun },
                      { id: 'system', label: 'System Auto', icon: Monitor },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSaveAppearance(item.id as ThemeMode)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition ${
                            active
                              ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold shadow-sm'
                              : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Persona Avatar */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Persona Avatar
                  </label>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user?.displayName || user?.username || 'User'}
                        avatar={user?.avatar}
                        size="md"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          {user?.avatar?.label || 'Default Persona'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          SVG Identity Avatar
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 text-xs font-medium transition"
                    >
                      Change Avatar
                    </button>
                  </div>
                </div>

                {/* Density */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interface Density
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['compact', 'comfortable', 'spacious'] as InterfaceDensity[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSaveAppearance(undefined, undefined, d)}
                        className={`p-2.5 rounded-xl border capitalize text-xs font-medium transition ${
                          density === d
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motion */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Motion & Animations
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'full', label: 'Full Motion', desc: 'Smooth spring animations' },
                      { id: 'reduced', label: 'Reduced Motion', desc: 'Minimal transitions' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSaveAppearance(undefined, undefined, undefined, m.id as MotionPreference)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          motion === m.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-medium'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-obsidian-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{m.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY CENTER QUICK ACCESS */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-start gap-2.5">
                  <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                    <span className="font-semibold block">SkillX Security Shield Active</span>
                    <p className="text-[11px] leading-relaxed">
                      Zero tracking algorithms, end-to-end user-authorized data, and zero AI scraping.
                    </p>
                  </div>
                </div>

                {/* Active Session Info */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Active Session</span>
                    <span className="text-[10px] text-emerald-500 font-medium">Verified Active</span>
                  </label>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-200/50 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {user?.security?.activeSessions?.[0]?.device || 'Current Browser Client'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        IP: {user?.security?.activeSessions?.[0]?.ip || '127.0.0.1 (Local)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password / Auth Quick Links */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-obsidian-800">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Account Protection
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/settings');
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-left transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-gold-500" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                            Change Password
                          </span>
                          <span className="text-[10px] text-slate-400">Manage credentials & keys</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/settings');
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-left transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                            Blocked Users & Safety Filters
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {user?.security?.blockedUsers?.length || 0} users blocked
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with link to Full Settings Center */}
          <div className="p-4 border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/80 dark:bg-obsidian-950/80 backdrop-blur flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/settings?tab=${activeTab}`);
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 flex items-center gap-1.5 transition"
            >
              <span>Open Full Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-obsidian-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition"
            >
              Done
            </button>
          </div>

        </div>
      </div>

      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        selectedAvatar={user?.avatar}
        onSelect={handleAvatarSelect}
      />
    </div>
  );
};

