import React from 'react';
import { AvatarData } from '../types';
import { getAvatarOption } from '../utils/avatarCatalog';

interface UserAvatarProps {
  avatar?: AvatarData;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showGoldBorder?: boolean;
  isOnline?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
  '2xl': 'w-28 h-28 text-5xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  size = 'md',
  showGoldBorder = false,
  isOnline,
  className = '',
}) => {
  const avatarOpt = getAvatarOption(avatar);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {avatar?.customUrl ? (
        <img
          src={avatar.customUrl}
          alt="Avatar"
          className={`rounded-full object-cover ${SIZE_CLASSES[size]} ${
            showGoldBorder ? 'ring-2 ring-gold-500 shadow-gold-subtle' : 'ring-1 ring-white/10'
          }`}
        />
      ) : (
        <div
          className={`rounded-full bg-gradient-to-br ${avatarOpt.bgGradient} flex items-center justify-center select-none shadow-md ${
            SIZE_CLASSES[size]
          } ${
            showGoldBorder ? 'ring-2 ring-gold-500 shadow-gold-subtle' : 'ring-1 ring-white/10'
          }`}
        >
          <span className="leading-none drop-shadow-sm">{avatarOpt.emoji}</span>
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-obsidian-950 ${
            isOnline ? 'bg-emerald-400' : 'bg-slate-500'
          } ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
