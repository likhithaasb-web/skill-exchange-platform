import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Check, X, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { PasswordStrengthMeter, getPasswordStrength } from '../components/PasswordStrengthMeter';
import { api } from '../services/api';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Live Username Availability state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced live username check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checking: false });
      return;
    }

    const clean = username.trim().toLowerCase();
    if (clean.length < 4 || clean.length > 20) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Must be 4–20 characters',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Letters, numbers & underscores only (no spaces)',
      });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(clean);
        if (res.available) {
          setUsernameStatus({
            checking: false,
            available: true,
            message: `${clean} is available!`,
          });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            message: res.reason || 'Username is not available',
          });
        }
      } catch (err) {
        setUsernameStatus({ checking: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    if (!usernameStatus.available) {
      setError('Please choose a valid and available username.');
      return;
    }

    const pwdStrength = getPasswordStrength(password);
    if (pwdStrength.score < 3) {
      setError('Please choose a stronger password (must include uppercase, lowercase, number, and special character).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clean = username.trim().toLowerCase();
      await register({
        username: clean,
        email: email.trim().toLowerCase(),
        displayName: clean,
        password,
      });

      // Forward to personalized 5-question onboarding!
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center shadow-gold-subtle mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-obsidian-950" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Join SkillX</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create your profile and start exchanging skills directly with peers.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username with Live Availability Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </label>
                {usernameStatus.checking && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 animate-pulse">Checking availability...</span>
                )}
                {!usernameStatus.checking && usernameStatus.available === true && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> {usernameStatus.message}
                  </span>
                )}
                {!usernameStatus.checking && usernameStatus.available === false && (
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <X className="w-3 h-3 stroke-[3]" /> {usernameStatus.message}
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. harsha_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-obsidian-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors ${
                  usernameStatus.available === true
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : usernameStatus.available === false
                    ? 'border-rose-500/60 focus:border-rose-500'
                    : 'border-slate-300 dark:border-white/10 focus:border-gold-500'
                }`}
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                4–20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            {/* Password with Strength Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <button
              type="submit"
              disabled={isLoading || usernameStatus.available === false}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Continue to Personal Onboarding →'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 dark:text-gold-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
