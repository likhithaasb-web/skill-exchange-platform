import React from 'react';
import { AvatarData } from '../types';

export interface AvatarOption {
  id: string;
  category: 'cute' | 'professional' | 'technical' | 'nature' | 'creative';
  name: string;
  bgGradient: string;
  emoji: string;
  accentColor: string;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  // Cute
  { id: 'cute-fox', category: 'cute', name: 'Curious Fox', bgGradient: 'from-amber-600 to-orange-500', emoji: '🦊', accentColor: '#F97316' },
  { id: 'cute-panda', category: 'cute', name: 'Zen Panda', bgGradient: 'from-emerald-700 to-teal-500', emoji: '🐼', accentColor: '#10B981' },
  { id: 'cute-cat', category: 'cute', name: 'Cosmic Cat', bgGradient: 'from-purple-700 to-indigo-500', emoji: '🐱', accentColor: '#8B5CF6' },
  { id: 'cute-dog', category: 'cute', name: 'Golden Hound', bgGradient: 'from-yellow-600 to-amber-500', emoji: '🐶', accentColor: '#EAB308' },
  { id: 'cute-rabbit', category: 'cute', name: 'Lunar Rabbit', bgGradient: 'from-pink-600 to-rose-400', emoji: '🐰', accentColor: '#F43F5E' },

  // Professional
  { id: 'prof-minimal-1', category: 'professional', name: 'Executive Minimalist', bgGradient: 'from-slate-800 to-slate-600', emoji: '💼', accentColor: '#94A3B8' },
  { id: 'prof-architect', category: 'professional', name: 'System Architect', bgGradient: 'from-sky-800 to-blue-600', emoji: '🏛️', accentColor: '#38BDF8' },
  { id: 'prof-consultant', category: 'professional', name: 'Senior Advisor', bgGradient: 'from-zinc-800 to-neutral-600', emoji: '📊', accentColor: '#D4AF37' },
  { id: 'prof-scholar', category: 'professional', name: 'Fellow Researcher', bgGradient: 'from-indigo-900 to-blue-700', emoji: '🎓', accentColor: '#6366F1' },

  // Technical
  { id: 'tech-cyber-1', category: 'technical', name: 'Cyber Sentinel', bgGradient: 'from-cyan-900 to-teal-700', emoji: '🛡️', accentColor: '#06B6D4' },
  { id: 'tech-wizard', category: 'technical', name: 'Code Craftsman', bgGradient: 'from-yellow-900 to-amber-700', emoji: '⚡', accentColor: '#D4AF37' },
  { id: 'tech-matrix', category: 'technical', name: 'Kernel Hacker', bgGradient: 'from-emerald-950 to-green-700', emoji: '💻', accentColor: '#22C55E' },
  { id: 'tech-cloud', category: 'technical', name: 'Mesh Architect', bgGradient: 'from-violet-900 to-indigo-800', emoji: '🌐', accentColor: '#A855F7' },

  // Nature
  { id: 'nature-leaf', category: 'nature', name: 'Golden Fern', bgGradient: 'from-emerald-900 to-amber-700', emoji: '🌿', accentColor: '#D4AF37' },
  { id: 'nature-lotus', category: 'nature', name: 'Mystic Lotus', bgGradient: 'from-rose-900 to-pink-600', emoji: '🪷', accentColor: '#FB7185' },
  { id: 'nature-pine', category: 'nature', name: 'Highland Pine', bgGradient: 'from-teal-950 to-emerald-800', emoji: '🌲', accentColor: '#10B981' },
  { id: 'nature-sun', category: 'nature', name: 'Solar Bloom', bgGradient: 'from-amber-800 to-yellow-500', emoji: '🌻', accentColor: '#F59E0B' },

  // Creative
  { id: 'creative-artisan', category: 'creative', name: 'Visual Artisan', bgGradient: 'from-fuchsia-900 to-purple-600', emoji: '🎨', accentColor: '#D946EF' },
  { id: 'creative-aurora', category: 'creative', name: 'Aurora Spectrum', bgGradient: 'from-indigo-800 to-teal-600', emoji: '✨', accentColor: '#E879F9' },
  { id: 'creative-writer', category: 'creative', name: 'Wordsmith', bgGradient: 'from-stone-800 to-amber-800', emoji: '✒️', accentColor: '#D4AF37' },
  { id: 'creative-prism', category: 'creative', name: 'Prism Weaver', bgGradient: 'from-blue-900 to-pink-600', emoji: '🔮', accentColor: '#EC4899' },
];

export function getAvatarOption(avatar?: AvatarData): AvatarOption {
  if (!avatar || !avatar.id) return AVATAR_CATALOG[0];
  const found = AVATAR_CATALOG.find(a => a.id === avatar.id);
  return found || AVATAR_CATALOG[0];
}
