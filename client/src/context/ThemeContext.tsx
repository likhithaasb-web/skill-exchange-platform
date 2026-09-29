import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, InterfaceDensity, MotionPreference, ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  accent: AccentColor;
  density: InterfaceDensity;
  motion: MotionPreference;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: InterfaceDensity) => void;
  setMotion: (motion: MotionPreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('skillx_theme') as ThemeMode) || 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('skillx_accent') as AccentColor) || 'gold';
  });

  const [density, setDensityState] = useState<InterfaceDensity>(() => {
    return (localStorage.getItem('skillx_density') as InterfaceDensity) || 'comfortable';
  });

  const [motion, setMotionState] = useState<MotionPreference>(() => {
    return (localStorage.getItem('skillx_motion') as MotionPreference) || 'full';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('skillx_theme', newTheme);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem('skillx_accent', newAccent);
  };

  const setDensity = (newDensity: InterfaceDensity) => {
    setDensityState(newDensity);
    localStorage.setItem('skillx_density', newDensity);
  };

  const setMotion = (newMotion: MotionPreference) => {
    setMotionState(newMotion);
    localStorage.setItem('skillx_motion', newMotion);
  };

  // Synchronize HTML root elements
  useEffect(() => {
    const root = document.documentElement;

    // Apply dark/light
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    // Set dataset attributes for css targeting
    root.setAttribute('data-accent', accent);
    root.setAttribute('data-density', density);
    root.setAttribute('data-motion', motion);
  }, [theme, accent, density, motion]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accent,
        density,
        motion,
        setTheme,
        setAccent,
        setDensity,
        setMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
