import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  Compass,
  ArrowLeftRight,
  MonitorPlay,
  FolderGit2,
  Star,
  Shield,
  Lock,
  Sliders,
  LogOut,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/passport', label: 'Skill Passport', icon: Award },
    { to: '/messages', label: 'Direct Messages', icon: MessageSquare },
    { to: '/discover', label: 'Discover Peers', icon: Compass },
    { to: '/exchanges', label: 'My Exchanges', icon: ArrowLeftRight },
    { to: '/studio/active', label: 'Skill Studio', icon: MonitorPlay },
    { to: '/projects', label: 'Collaborative Projects', icon: FolderGit2 },
    { to: '/reviews', label: 'Peer Reviews', icon: Star },
    { to: '/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 lg:top-16 lg:bottom-0 left-0 z-50 lg:z-30 w-64 border-r border-slate-200/80 dark:border-white/[0.07] bg-white/85 dark:bg-[#07090E]/90 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & Close (Mobile only drawer header) */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-white/[0.07] lg:hidden">
            <NavLink to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-500 flex items-center justify-center shadow-gold-satin border border-gold-400/30">
                <span className="font-display font-extrabold text-obsidian-950 text-base">X</span>
              </div>
              <span className="text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight">
                Skill<span className="text-gold-500">X</span>
              </span>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all relative ${
                      isActive
                        ? 'bg-gold-500/15 text-slate-900 dark:text-white font-semibold border border-gold-500/30 shadow-inner-glass'
                        : 'text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.08] font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-gold-400' : 'text-slate-500 dark:text-slate-300'}`} />
                      <span className="text-slate-900 dark:text-white font-medium">{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] ml-auto shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        {user && (
          <div className="p-3.5 border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-white/[0.04] transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-white/[0.06]">
              <NavLink
                to={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-2.5 min-w-0 group flex-1"
              >
                <UserAvatar avatar={user.avatar} size="sm" showGoldBorder />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-gold-500 transition-colors truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    @{user.username}
                  </p>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
