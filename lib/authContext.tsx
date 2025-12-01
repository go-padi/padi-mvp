'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  isLoggedIn: boolean;
  teacherName: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'padi_auth_state';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherName, setTeacherName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AuthContextValue>;
        setIsLoggedIn(Boolean(parsed.isLoggedIn));
        setTeacherName(parsed.teacherName ?? null);
      } catch {
        // ignore malformed state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isLoggedIn, teacherName }));
  }, [isLoggedIn, teacherName]);

  const login = () => {
    setIsLoggedIn(true);
    setTeacherName(prev => prev ?? 'Demo Teacher');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setTeacherName(null);
  };

  const value = useMemo(() => ({ isLoggedIn, teacherName, login, logout }), [isLoggedIn, teacherName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
