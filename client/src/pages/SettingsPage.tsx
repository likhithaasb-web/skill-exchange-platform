import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Laptop, 
  Palette, 
  Layout, 
  Eye, 
  Sparkles, 
  Check, 
  Shield, 
  Lock, 
  UserX, 
  Download, 
  Trash2, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  LogOut,
  Clock,
  FileText,
  Share2,
  Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { UserAvatar } from '../components/UserAvatar';
import { AccentColor, AvatarData, InterfaceDensity, MotionPreference, ThemeMode } from '../types';
import { api } from '../services/api';
import { exportActivityPDF } from '../utils/exportActivityPDF';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const {
    theme,
    accent,
    density,
    motion,
    setTheme,
    setAccent,
    setDensity,
    setMotion,
  } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const initialTab = (searchParams.get('tab') as 'privacy' | 'security' | 'appearance') || 'appearance';
  const [activeTab, setActiveTab] = useState<'privacy' | 'security' | 'appearance'>(initialTab);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Privacy states
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

  // Security states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'privacy' || tabParam === 'security' || tabParam === 'appearance') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.privacySettings) {
      setProfileVis(user.privacySettings.profileVisibility || 'public');
      setSkillVis(user.privacySettings.skillVisibility || 'public');
      setReviewVis(user.privacySettings.reviewVisibility || 'public');
      setShowActivity(user.privacySettings.showActivity ?? true);
      setContactPref(user.privacySettings.contactPreference || 'anyone');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'security') {
      loadBlockedUsers();
    }
  }, [activeTab]);

  const loadBlockedUsers = async () => {
    setIsLoadingBlocked(true);
    try {
      const res = await api.getBlockedUsers();
      if (res.success) {
        setBlockedUsers(res.blockedUsers || []);
      }
    } catch (err) {
      // quiet fail
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  const handleUnblock = async (targetUserId: string) => {
    try {
      await api.unblockUser(targetUserId);
      setBlockedUsers(prev => prev.filter(u => u._id !== targetUserId));
      setSavedMessage('User unblocked.');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to unblock user');
    }
  };

  const handleSaveAppearance = async (
    newTheme: ThemeMode,
    newAccent: AccentColor,
    newDensity: InterfaceDensity,
    newMotion: MotionPreference
  ) => {
    if (!user) return;
    try {
      await api.updateAppearance({
        theme: newTheme,
        accent: newAccent,
        density: newDensity,
        motion: newMotion,
      });
      setSavedMessage('Appearance preferences updated.');
      setTimeout(() => setSavedMessage(null), 2500);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    setSavedMessage(null);
    setErrorMessage(null);
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
        setSavedMessage('Privacy settings updated successfully.');
        setTimeout(() => setSavedMessage(null), 3500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update privacy settings');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsChangingPassword(true);
    setErrorMessage(null);
    try {
      await api.changePassword({ oldPassword, newPassword });
      setSavedMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSavedMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const exportPayload = {
      exportDate: new Date().toISOString(),
      platform: 'SkillX Peer-to-Peer Network',
      aiStatus: 'Zero-AI verified',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        tagline: user.tagline,
        location: user.location,
        languages: user.languages,
        privacySettings: user.privacySettings,
        appearanceSettings: user.appearanceSettings,
      }
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillx-data-export-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedMessage('Your user data export has been downloaded.');
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleExportPDF = () => {
    if (!user) return;
    exportActivityPDF(user, profile);
    setSavedMessage('Activity report PDF opened! You can save as PDF or print to share.');
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleAvatarSelect = async (newAvatar: AvatarData) => {
    setIsAvatarModalOpen(false);
    if (!user) return;
    try {
      const res = await api.updateProfile({ avatar: newAvatar });
      if (res.success && res.user) {
        updateUser(res.user);
        setSavedMessage('Persona avatar updated successfully!');
        setTimeout(() => setSavedMessage(null), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update avatar.');
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ambient-canvas">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex relative z-10">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          
          {/* Page Header */}
          <div className="pb-4 border-b border-slate-200 dark:border-obsidian-800">
            <span className="text-xs font-mono font-bold text-gold-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              Platform Settings
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your appearance, privacy center, and security center in one unified workspace.
            </p>
          </div>

          {/* Navigation Tabs: Appearance, Privacy Center, Security Center */}
          <div className="flex border-b border-slate-200 dark:border-obsidian-800 gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('appearance');
                setSearchParams({ tab: 'appearance' });
              }}
              className={`pb-3 px-1 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              Appearance
            </button>

            <button
              onClick={() => {
                setActiveTab('privacy');
                setSearchParams({ tab: 'privacy' });
              }}
              className={`pb-3 px-1 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              Privacy Center
            </button>

            <button
              onClick={() => {
                setActiveTab('security');
                setSearchParams({ tab: 'security' });
              }}
              className={`pb-3 px-1 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-gold-500 text-gold-600 dark:text-gold-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security Center
            </button>
          </div>

          {/* Alerts */}
          {savedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{savedMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Persona Avatar */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {user?.avatar && (
                      <UserAvatar
                        avatar={user.avatar}
                        size="xl"
                        showGoldBorder
                        className="ring-4 ring-gold-500/20 shrink-0"
                      />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-gold-500" />
                        Persona Avatar
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Your digital persona across Skill Studios, Passports, and peer exchanges. No real photo required.
                      </p>
                      <span className="text-[11px] text-gold-600 dark:text-gold-400 font-medium block mt-1">
                        Current: @{user?.username} ({user?.avatar?.category || 'custom'} - {user?.avatar?.id || 'avatar'})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    Change Persona Avatar
                  </button>
                </div>
              </div>

              {/* Color Themes */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-gold-500" />
                    Color Theme Mode
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    SkillX is custom-styled for both luminous warm light mode and deep obsidian dark mode.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'dark', title: 'Dark Mode', desc: 'Obsidian charcoal with golden illumination', icon: Moon },
                    { id: 'light', title: 'Light Mode', desc: 'Warm cream alabaster with amber accents', icon: Sun },
                    { id: 'system', title: 'System Default', desc: 'Automatically match your OS theme', icon: Laptop },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id as ThemeMode);
                          handleSaveAppearance(opt.id as ThemeMode, accent, density, motion);
                        }}
                        className={`p-4 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40'
                            : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">{opt.title}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{opt.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spacing & Density */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-gold-500" />
                    Interface Density
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Actively adjusts font scaling, card paddings, and layout density across the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'compact', title: 'Compact', desc: 'Dense tables, tighter margins, and compact cards' },
                    { id: 'comfortable', title: 'Comfortable', desc: 'Balanced padding and standard comfortable spacing' },
                    { id: 'spacious', title: 'Spacious', desc: 'Generous whitespace, large cards, and relaxed margins' },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        setDensity(d.id as InterfaceDensity);
                        handleSaveAppearance(theme, accent, d.id as InterfaceDensity, motion);
                      }}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                        density === d.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">{d.title}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{d.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Active Density Live Preview ({density.toUpperCase()})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-medium">Dashboard Card Padding</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-500 font-mono">SX-{density}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-medium">Studio Row Spacing</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motion */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    Motion & Transitions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Control interface physics, hover effects, celebratory confetti, and animated keyframes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'full', title: 'Full Animations', desc: 'Smooth spring animations and celebratory transitions' },
                    { id: 'reduced', title: 'Reduced Motion', desc: 'Instant UI changes with zero animated shifts' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setMotion(m.id as MotionPreference);
                        handleSaveAppearance(theme, accent, density, m.id as MotionPreference);
                      }}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                        motion === m.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">{m.title}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Live Motion Test Preview */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Live Physics Status: {motion === 'full' ? 'Full Animations Running' : 'Animations Halted (Reduced Motion)'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {motion === 'full' ? 'Dynamic pulses, smooth springs & transitions active' : 'All transforms and pulsing keyframes are halted'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full bg-gold-400 ${motion === 'full' ? 'animate-ping' : ''}`} />
                    <div className={`w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center text-obsidian-950 font-bold text-xs shadow-sm ${motion === 'full' ? 'animate-bounce' : ''}`}>
                      ★
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY CENTER */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              
              {/* Privacy Overview Banner */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold text-sm block">SkillX Privacy Guarantee</span>
                  <p className="leading-relaxed">
                    Unlike centralized ad networks, SkillX never sells your peer interactions, profile metrics, or exchange artifacts. You have fine-grained authority over every disclosure.
                  </p>
                </div>
              </div>

              {/* Discovery & Profile Visibility */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gold-500" />
                    Profile & Discovery Visibility
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Determine who can find and view your Skill Passport on the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'public', title: 'Public', desc: 'Visible to all visitors & indexed in the Discover catalog' },
                    { id: 'members', title: 'Members Only', desc: 'Visible only to registered SkillX peers who are logged in' },
                    { id: 'private', title: 'Private / Stealth', desc: 'Hidden from search catalog. Accessible only by direct URL link' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfileVis(opt.id as any)}
                      className={`p-4 rounded-xl border text-left text-xs transition-all ${
                        profileVis === opt.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40'
                          : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">{opt.title}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Inventory Visibility */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-gold-500" />
                    Skills Inventory Visibility
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select which users can inspect your Teaching & Learning skills list.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'public', title: 'Public Skills', desc: 'Anyone viewing your profile can see all listed skills' },
                    { id: 'connections', title: 'Exchange Partners Only', desc: 'Visible only to peers you have accepted exchanges with' },
                    { id: 'private', title: 'Hidden Inventory', desc: 'Keep skills private until you explicitly propose an exchange' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSkillVis(opt.id as any)}
                      className={`p-4 rounded-xl border text-left text-xs transition-all ${
                        skillVis === opt.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40'
                          : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">{opt.title}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Peer Contact & Inbound Requests */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gold-500" />
                    Inbound Exchange Requests & Messages
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter inbound exchange proposals and contact attempts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'anyone', title: 'Open to All', desc: 'Any verified SkillX user can send you a proposal' },
                    { id: 'matching', title: 'Compatible Matches Only', desc: 'Only users with mutual skill compatibility can propose' },
                    { id: 'nobody', title: 'Do Not Disturb', desc: 'Pause all inbound exchange proposals temporarily' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setContactPref(opt.id as any)}
                      className={`p-4 rounded-xl border text-left text-xs transition-all ${
                        contactPref === opt.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold ring-1 ring-gold-500/40'
                          : 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">{opt.title}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Broadcast Switch */}
              <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Real-Time Online Presence
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
                    Broadcast a green active indicator to peers when you are actively learning, messaging, or collaborating in Skill Studios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowActivity(!showActivity)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    showActivity ? 'bg-gold-500' : 'bg-slate-300 dark:bg-obsidian-700'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform absolute top-1 ${
                      showActivity ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs sm:text-sm transition shadow-md"
                >
                  Save Privacy Preferences
                </button>
              </div>

              {/* Data Export & Deletion */}
              <div className="pt-6 border-t border-slate-200 dark:border-obsidian-800 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Data Portability & Rights
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option 1: PDF Activity Report (Shareable) */}
                  <div className="p-4 rounded-xl border border-gold-500/40 bg-gold-500/5 dark:bg-gold-500/10 space-y-2 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-semibold text-xs sm:text-sm">
                      <FileText className="w-4 h-4 text-gold-500" />
                      Export Activity Report (PDF)
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Download a certified, shareable PDF summary of your peer exchanges, verified skills, and collaboration track record.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="px-3.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-bold shadow-gold-subtle transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Activity PDF
                    </button>
                  </div>

                  {/* Option 2: Raw JSON Archive */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-xs sm:text-sm">
                      <Download className="w-4 h-4 text-slate-500" />
                      Export Personal Data (JSON)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Download a structured JSON archive of your skill profiles, peer endorsements, and account configuration.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition"
                    >
                      Download JSON Export
                    </button>
                  </div>

                  {/* Option 3: Account Deletion */}
                  <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs sm:text-sm">
                      <Trash2 className="w-4 h-4" />
                      Account Deletion Policy
                    </div>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                      Under our Zero-Retention pledge, deleting an account purges all profiles, message histories, and project affiliations completely.
                    </p>
                    <span className="text-[10px] text-slate-400 block italic">
                      Contact safety@skillx.dev for account termination verification.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SECURITY CENTER */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Security Shield Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold text-sm block">SkillX Security Shield Active</span>
                  <p className="leading-relaxed">
                    All authentication hashes use salted bcrypt (10 rounds). Tokens are short-lived JWTs. Zero tracking scripts and zero automated bots operate on this platform.
                  </p>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Key className="w-4 h-4 text-gold-500" />
                    Change Account Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your master access credentials. Minimum 8 characters.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-obsidian-950/60 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-obsidian-950/60 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-obsidian-950/60 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs sm:text-sm transition shadow-md disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Active Sessions */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gold-500" />
                    Authorized Sessions & Devices
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Devices currently signed into your SkillX account.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-obsidian-800">
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {user?.security?.activeSessions?.[0]?.device || 'Current Browser Client'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Current Active
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          IP: {user?.security?.activeSessions?.[0]?.ip || '127.0.0.1'} • Session established via Web Client
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blocked Users Directory */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-rose-500" />
                    Blocked Users
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Blocked peers cannot message you, request skill exchanges, or view your collaborative studios.
                  </p>
                </div>

                {isLoadingBlocked ? (
                  <p className="text-xs text-slate-400">Loading blocked list...</p>
                ) : blockedUsers.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-obsidian-800 text-center text-xs text-slate-400">
                    No blocked users. Your peer interactions are currently unrestricted.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-obsidian-800">
                    {blockedUsers.map((bUser) => (
                      <div key={bUser._id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {bUser.displayName} <span className="text-slate-400 text-xs">@{bUser.username}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblock(bUser._id)}
                          className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-obsidian-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
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

