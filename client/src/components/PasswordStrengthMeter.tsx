import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const getPasswordStrength = (pwd: string) => {
  if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700', text: 'text-slate-500' };

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400', percent: 25 };
  } else if (score <= 4) {
    return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400', percent: 50 };
  } else if (score === 5) {
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400', percent: 75 };
  } else {
    return { score: 4, label: 'Very Strong', color: 'bg-gold-500', text: 'text-gold-400', percent: 100 };
  }
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Password Strength</span>
        <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
        <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-700'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-700'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-700'}`} style={{ width: '25%' }} />
        <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-700'}`} style={{ width: '25%' }} />
      </div>

      <p className="text-[11px] text-slate-400">
        Requires 8+ chars (12+ recommended), uppercase, lowercase, numbers, and symbols.
      </p>
    </div>
  );
};
