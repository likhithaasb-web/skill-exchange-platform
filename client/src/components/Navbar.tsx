import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogIn, UserPlus, Menu, X, Check, Shield, Sliders, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettingsDrawer } from '../context/SettingsDrawerContext';
import { UserAvatar } from './UserAvatar';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { openSettings } = useSettingsDrawer();
  const navigate = useNavigate();

  const handleOpenSettings = onOpenSettings || openSettings;


  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#07090E]/85 backdrop-blur-xl transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Left: Mobile Toggle & Permanent Stable Brand Logo */}
        <div className="flex items-center gap-3">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-500 flex items-center justify-center shadow-gold-satin border border-gold-400/30 group-hover:scale-105 transition-transform shrink-0">
              <span className="font-display font-extrabold text-obsidian-950 text-lg tracking-tight">X</span>
            </div>
            <div>
              <span className="text-xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors">
                Skill<span className="text-gold-500">X</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-400 font-medium">
                Exchange • Learn • Build
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav for Public Visitors */}
        {!user && (
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Link to="/#how-it-works" className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">How It Works</Link>
            <Link to="/discover" className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">Explore Skills</Link>
            <Link to="/#features" className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">Skill Studio</Link>
            <Link to="/#passport" className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">Skill Passport</Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Settings Drawer Toggle */}
          <button
            type="button"
            onClick={handleOpenSettings}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Open Quick Settings & Privacy Drawer"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gold-400" /> : <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-700" />}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 relative">
              {/* Direct Messages Icon */}
              <Link
                to="/messages"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors relative"
                title="Direct Messages"
              >
                <MessageSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-gold-500 text-obsidian-950 font-bold text-[8px] flex items-center justify-center shadow-gold-satin">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-white/95 dark:bg-[#0E121B]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl p-4 text-slate-800 dark:text-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04] py-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n._id}
                            onClick={() => {
                              api.markNotificationRead(n._id);
                              setShowNotifications(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                              n.isRead 
                                ? 'opacity-70 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/[0.04]' 
                                : 'bg-gold-500/10 hover:bg-gold-500/15 text-slate-900 dark:text-slate-100 font-medium'
                            }`}
                          >
                            <span className="font-semibold block mb-0.5">{n.title}</span>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <Link to={`/profile/${user.username}`} className="flex items-center gap-2 pl-1 group">
                <UserAvatar avatar={user.avatar} size="sm" showGoldBorder />
                <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-gold-500 transition-colors">
                  @{user.username}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08] flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-obsidian-950 shadow-gold-satin transition-all hover:shadow-gold-subtle active:scale-[0.98] flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

