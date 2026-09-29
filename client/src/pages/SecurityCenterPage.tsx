import React, { useState, useEffect } from 'react';
import { Lock, Key, Laptop, History, ShieldAlert, Check, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { PasswordStrengthMeter, getPasswordStrength } from '../components/PasswordStrengthMeter';
import { api } from '../services/api';

export const SecurityCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const res = await api.getBlockedUsers();
      if (res.success) {
        setBlockedUsers(res.blockedUsers || []);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleUnblock = async (targetId: string) => {
    try {
      await api.unblockUser(targetId);
      loadBlockedUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to unblock user');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const strength = getPasswordStrength(newPassword);
    if (strength.score < 3) {
      setPasswordError('Please choose a stronger password.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogoutAllOtherSessions = async () => {
    if (!window.confirm('Sign out of all other devices and browser sessions?')) return;
    try {
      await api.logoutSession();
      alert('All other sessions signed out.');
    } catch (err: any) {
      alert(err.message || 'Failed to sign out other sessions');
    }
  };

  if (!user) return null;

  const activeSessions = user.security?.activeSessions || [
    { sessionId: 'current', device: 'Current Web Browser (Windows 11)', ip: '127.0.0.1', lastActive: new Date().toISOString() }
  ];

  const loginHistory = user.security?.loginHistory || [
    { timestamp: new Date().toISOString(), device: 'Desktop Chrome / Windows', ip: '127.0.0.1', status: 'success' }
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="pb-4 border-b border-white/10">
            <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Security Center
            </span>
            <h1 className="text-3xl font-extrabold font-display text-white mt-1">
              Account Security & Active Sessions
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit active sessions, change your credentials, and manage safety controls.
            </p>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-gold-400" />
              Update Account Password
            </h3>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Strong Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                    required
                  />
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-gold-400" />
                  Active Device Sessions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Devices currently signed into your SkillX account.
                </p>
              </div>
              <button
                onClick={handleLogoutAllOtherSessions}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
              >
                Sign Out Other Devices
              </button>
            </div>

            <div className="space-y-2">
              {activeSessions.map((session, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block">{session.device}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        IP: {session.ip || '127.0.0.1'} • Active: {new Date(session.lastActive).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Users */}
          <div className="p-6 rounded-2xl bg-obsidian-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-gold-400" />
              Blocked Accounts
            </h3>
            <p className="text-xs text-slate-400">
              Blocked users cannot view your Skill Passport, message you, or invite you to studios.
            </p>

            {blockedUsers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No blocked users.</p>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((bu: any) => (
                  <div
                    key={bu._id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200">@{bu.username} ({bu.displayName})</span>
                    <button
                      onClick={() => handleUnblock(bu._id)}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
