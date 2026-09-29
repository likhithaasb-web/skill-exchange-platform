import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Award,
  BookOpen,
  UserCheck,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SkillLevel } from '../types';

export const OnboardingPage: React.FC = () => {
  const { user, updateUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 7; // Q1 to Q5, then Teach Skill, then Learn Skill

  // Question answers
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('Someone who gives practical examples');
  const [q5, setQ5] = useState('');

  // Initial Skills setup
  const [teachName, setTeachName] = useState('Python');
  const [teachCategory, setTeachCategory] = useState('Software Development');
  const [teachLevel, setTeachLevel] = useState<SkillLevel>('Intermediate');

  const [learnName, setLearnName] = useState('Cybersecurity');
  const [learnCategory, setLearnCategory] = useState('Security & Networking');
  const [learnLevel, setLearnLevel] = useState<SkillLevel>('Intermediate');

  const [tagline, setTagline] = useState('Passionate learner & skill exchanger');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LEARNING_HELPERS = [
    { title: 'Someone who explains visually', desc: 'Diagrams, whiteboards, flowcharts, mental models', icon: '🎨' },
    { title: 'Someone who explains step-by-step', desc: 'Logical sequence, foundational principles first', icon: '🪜' },
    { title: 'Someone who gives practical examples', desc: 'Real-world code, tangible projects, direct cases', icon: '💡' },
    { title: 'Someone who lets me experiment', desc: 'Hands-on practice, trial and error, guided exploration', icon: '🧪' },
    { title: 'Someone who challenges me', desc: 'Probing questions, architectural edge cases, rigorous review', icon: '⚡' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.saveOnboarding({
        q1SkillWish: q1,
        q2BiggestChallenge: q2,
        q3BestProject: q3,
        q4LearningHelper: q4,
        q5Aspiration: q5,
        tagline: tagline.trim(),
        skillsTeaching: [
          {
            name: teachName.trim(),
            category: teachCategory,
            level: teachLevel,
          }
        ],
        skillsLearning: [
          {
            name: learnName.trim(),
            category: learnCategory,
            targetLevel: learnLevel,
            preferredFormat: ['Whiteboard', 'Voice']
          }
        ]
      });

      if (res.user) updateUser(res.user);
      if (res.profile) updateProfile(res.profile);

      // Trigger gold confetti celebration!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F59E0B', '#FFFFFF', '#10B981']
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error saving onboarding answers');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative font-sans ambient-canvas transition-colors duration-200">
      {/* Background Sheen */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
          <span>Step {step} of {totalSteps}</span>
          <span className="text-gold-600 dark:text-gold-400 font-semibold">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-amber-300 transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card Container */}
      <div className="w-full max-w-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 flex flex-col justify-between min-h-[460px]">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Personalized Question 1 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3">
              What is one skill you wish you had learned before?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This helps reflect your learning priorities and informs how peers approach technical foundations with you.
            </p>
            <div className="pt-4">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Memory management in C, Figma design tokens, Distributed consensus..."
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Personalized Question 2 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3">
              What was your biggest learning challenge?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share what previously made learning difficult so exchange partners can support your pace.
            </p>
            <div className="pt-4">
              <textarea
                rows={4}
                autoFocus
                placeholder="e.g. Lack of real-world project context, tutorial hell without hands-on feedback, obscure error messages..."
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Personalized Question 3 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3">
              What project taught you the most?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A past milestone, experiment, or challenge that shaped your practical knowledge.
            </p>
            <div className="pt-4">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Building an automated packet sniffer, redesigning a banking app, migrating to Docker..."
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Personalized Question 4 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3">
              What kind of person helps you learn best?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your primary preferred collaboration style for Skill Studio sessions.
            </p>
            <div className="space-y-2 pt-2">
              {LEARNING_HELPERS.map((helper) => {
                const isSelected = q4 === helper.title;
                return (
                  <button
                    type="button"
                    key={helper.title}
                    onClick={() => setQ4(helper.title)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-gold-500 bg-gold-500/15 text-slate-900 dark:text-white ring-1 ring-gold-500/50'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{helper.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{helper.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helper.desc}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Personalized Question 5 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3">
              What would you love to build or accomplish with your skills?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dream project or personal mission you are working towards.
            </p>
            <div className="pt-4">
              <textarea
                rows={4}
                autoFocus
                placeholder="e.g. Build an open-source security tool, launch a design token compiler, architect resilient cloud backends..."
                value={q5}
                onChange={(e) => setQ5(e.target.value)}
                className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 6: Initial Teaching Skill */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Passport Initialization
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3 flex items-center gap-2">
              <Award className="w-6 h-6 text-gold-500" />
              What is 1 skill you can teach?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You will share this skill with fellow peers in exchange for their knowledge.
            </p>

            <div className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, UI/UX, Docker, Git"
                  value={teachName}
                  onChange={(e) => setTeachName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Level</label>
                  <select
                    value={teachLevel}
                    onChange={(e) => setTeachLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={teachCategory}
                    onChange={(e) => setTeachCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Security & Networking">Security & Networking</option>
                    <option value="Design & UI/UX">Design & UI/UX</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Data & AI">Data & AI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Initial Learning Goal */}
        {step === 7 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs uppercase font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
              Passport Finalization
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-3 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-gold-500" />
              What is 1 skill you want to learn?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We'll use rule-based matching to instantly show peers who teach this skill.
            </p>

            <div className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Skill</label>
                <input
                  type="text"
                  placeholder="e.g. Cybersecurity, Rust, Figma, Networking"
                  value={learnName}
                  onChange={(e) => setLearnName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Passport Headline / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Python Developer exploring Cybersecurity"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-obsidian-950 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>{step === totalSteps ? (isSubmitting ? 'Issuing Passport...' : 'Complete & View Passport ✨') : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
