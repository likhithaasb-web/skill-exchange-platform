import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Key, ShieldCheck, Sparkles, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (username: string) => {
    setIdentifier(username);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center shadow-gold-subtle mx-auto mb-3">
              <span className="font-display font-black text-obsidian-950 text-2xl">X</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to access your Skill Passport and collaborative studios.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="e.g. alex_codes"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In to SkillX'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Quick Test Accounts (Pre-seeded)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { username: 'alex_codes', label: 'Alex (React & JS)' },
                { username: 'cyber_nova', label: 'Nova (Cybersecurity)' },
                { username: 'designfox', label: 'Elena (Figma & UI/UX)' },
                { username: 'python_master', label: 'Harsha (Python)' },
              ].map((acc) => (
                <button
                  type="button"
                  key={acc.username}
                  onClick={() => fillDemoAccount(acc.username)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 hover:border-gold-500/40 text-left text-[11px] transition-colors"
                >
                  <span className="font-semibold text-gold-600 dark:text-gold-400 block">@{acc.username}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate block">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-gold-600 dark:text-gold-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
