import React, { createContext, useContext, useEffect, useState } from 'react';
import { SkillProfile, User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: SkillProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  updateProfile: (updatedProfile: SkillProfile) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillx_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('skillx_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.login({ identifier, password });
    if (res.token && res.user) {
      localStorage.setItem('skillx_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile || null);
    }
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    if (res.token && res.user) {
      localStorage.setItem('skillx_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile || null);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillx_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const updateProfile = (updatedProfile: SkillProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
