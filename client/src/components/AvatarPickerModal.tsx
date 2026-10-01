import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVATAR_CATALOG, AvatarOption } from '../utils/avatarCatalog';
import { AvatarData } from '../types';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar?: AvatarData;
  onSelect: (avatar: AvatarData) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAvatar,
  onSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState<string>(selectedAvatar?.customUrl || '');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Avatars' },
    { id: 'cute', label: 'Cute' },
    { id: 'professional', label: 'Professional' },
    { id: 'technical', label: 'Technical' },
    { id: 'nature', label: 'Nature' },
    { id: 'creative', label: 'Creative' },
  ];

  const filteredAvatars = activeCategory === 'all'
    ? AVATAR_CATALOG
    : AVATAR_CATALOG.filter(a => a.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-gold-500/20 rounded-2xl w-full max-w-xl p-4 sm:p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-xl font-bold font-display text-white flex items-center gap-2">
              Choose Your Skill Identity Avatar
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Select an avatar that represents you. Real photos are never required.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar border-b border-white/5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-gold-500 text-obsidian-950 font-semibold shadow-gold-subtle'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Avatars Grid */}
        <div className="overflow-y-auto py-4 flex-1 pr-1 grid grid-cols-3 sm:grid-cols-4 gap-4">
          {filteredAvatars.map((opt: AvatarOption) => {
            const isSelected = selectedAvatar?.id === opt.id && !selectedAvatar?.customUrl;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelect({ category: opt.category, id: opt.id });
                  onClose();
                }}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center group ${
                  isSelected
                    ? 'border-gold-500 bg-gold-500/10 ring-2 ring-gold-500/30'
                    : 'border-white/10 bg-white/[0.02] hover:border-gold-500/50 hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${opt.bgGradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <span>{opt.emoji}</span>
                  </div>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-gold-500 text-obsidian-950 rounded-full p-0.5 shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium mt-2 text-slate-200 line-clamp-1">
                  {opt.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {opt.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Custom Image URL */}
        <div className="pt-4 border-t border-white/10">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Or Use Custom Image URL (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/avatar.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-obsidian-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
            <button
              onClick={() => {
                if (customUrl.trim()) {
                  onSelect({ category: 'custom', id: 'custom-url', customUrl: customUrl.trim() });
                  onClose();
                }
              }}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-semibold rounded-lg transition-colors"
            >
              Use URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
