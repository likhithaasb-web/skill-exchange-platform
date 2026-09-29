import React, { useState } from 'react';
import { X, Plus, Trash2, Award, BookOpen } from 'lucide-react';
import { SkillLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SkillEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'teaching' | 'learning';
}

const CATEGORIES = [
  'Software Development',
  'Security & Networking',
  'Design & UI/UX',
  'Cloud & DevOps',
  'Data & Analytics',
  'Languages & Communication',
  'Creative Arts & Video',
  'Business & Product',
];

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export const SkillEditorModal: React.FC<SkillEditorModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'teaching',
}) => {
  const { profile, updateProfile } = useAuth();
  const [tab, setTab] = useState<'teaching' | 'learning'>(initialTab);

  // New Teaching Skill state
  const [teachName, setTeachName] = useState('');
  const [teachCategory, setTeachCategory] = useState(CATEGORIES[0]);
  const [teachLevel, setTeachLevel] = useState<SkillLevel>('Intermediate');
  const [teachYears, setTeachYears] = useState(2);

  // New Learning Goal state
  const [learnName, setLearnName] = useState('');
  const [learnCategory, setLearnCategory] = useState(CATEGORIES[0]);
  const [learnTargetLevel, setLearnTargetLevel] = useState<SkillLevel>('Intermediate');
  const [learnPriority, setLearnPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.addTeachingSkill({
        name: teachName.trim(),
        category: teachCategory,
        level: teachLevel,
        yearsExperience: Number(teachYears),
      });
      if (res.profile) updateProfile(res.profile);
      setTeachName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add teaching skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeaching = async (skillId: string) => {
    try {
      const res = await api.removeTeachingSkill(skillId);
      if (res.profile) updateProfile(res.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to remove skill');
    }
  };

  const handleAddLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.addLearningSkill({
        name: learnName.trim(),
        category: learnCategory,
        targetLevel: learnTargetLevel,
        priority: learnPriority,
      });
      if (res.profile) updateProfile(res.profile);
      setLearnName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add learning goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLearning = async (skillId: string) => {
    try {
      const res = await api.removeLearningSkill(skillId);
      if (res.profile) updateProfile(res.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to remove learning goal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-xl font-bold font-display text-white">
            Manage Your Skill Passport
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mt-3">
          <button
            onClick={() => setTab('teaching')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              tab === 'teaching'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Skills I Teach ({profile?.skillsTeaching?.length || 0})
          </button>

          <button
            onClick={() => setTab('learning')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              tab === 'learning'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Skills I Want to Learn ({profile?.skillsLearning?.length || 0})
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="overflow-y-auto py-4 flex-1 space-y-5">
          {tab === 'teaching' ? (
            <div>
              {/* Add form */}
              <form onSubmit={handleAddTeaching} className="p-4 rounded-xl bg-black/40 border border-gold-500/20 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 block">
                  Add A Skill You Can Teach
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Skill Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, React, Figma"
                      value={teachName}
                      onChange={(e) => setTeachName(e.target.value)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                    <select
                      value={teachCategory}
                      onChange={(e) => setTeachCategory(e.target.value)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Self-Declared Level</label>
                    <select
                      value={teachLevel}
                      onChange={(e) => setTeachLevel(e.target.value as SkillLevel)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Years Experience</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={teachYears}
                      onChange={(e) => setTeachYears(Number(e.target.value))}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-gold-subtle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Teaching Passport
                </button>
              </form>

              {/* Existing List */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Current Teaching Skills
                </span>
                {profile?.skillsTeaching?.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm text-slate-200">{s.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({s.level})</span>
                      <span className="text-[10px] text-gold-400 ml-2 font-mono">• {s.verificationStatus}</span>
                    </div>
                    <button
                      onClick={() => s._id && handleRemoveTeaching(s._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Add Learning form */}
              <form onSubmit={handleAddLearning} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Add A Learning Goal
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Skill You Want To Learn</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity, Rust, UX"
                      value={learnName}
                      onChange={(e) => setLearnName(e.target.value)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                    <select
                      value={learnCategory}
                      onChange={(e) => setLearnCategory(e.target.value)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Proficiency</label>
                    <select
                      value={learnTargetLevel}
                      onChange={(e) => setLearnTargetLevel(e.target.value as SkillLevel)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
                    <select
                      value={learnPriority}
                      onChange={(e) => setLearnPriority(e.target.value as any)}
                      className="w-full bg-obsidian-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-100 hover:bg-white text-obsidian-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Learning Goal
                </button>
              </form>

              {/* Existing Learning List */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Current Learning Goals
                </span>
                {profile?.skillsLearning?.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm text-slate-200">{s.name}</span>
                      <span className="text-xs text-slate-400 ml-2">(Target: {s.targetLevel})</span>
                      <span className="text-[10px] text-amber-400 ml-2 font-mono">• {s.priority} Priority</span>
                    </div>
                    <button
                      onClick={() => s._id && handleRemoveLearning(s._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Remove goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
