'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = { email: string };

/* eslint-disable no-unused-vars */
export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
/* eslint-enable no-unused-vars */

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = 'padi_auth_state';

async function fakeLogin(email: string, password: string): Promise<AuthUser> {
  if (password !== '1234!') {
    throw new Error('Incorrect password. Use 1234! while we are in test mode.');
  }
  return { email: email.trim() || 'teacher@school.edu' };
}

async function fakeSignup(email: string, password: string): Promise<AuthUser> {
  // Placeholder for future backend-backed signup that also provisions a tenant.
  return fakeLogin(email, password);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AuthState>;
        setIsLoggedIn(Boolean(parsed.isLoggedIn));
        setUser(parsed.user ?? null);
      } catch {
        // ignore malformed state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isLoggedIn, user }));
  }, [isLoggedIn, user]);

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await fakeLogin(email, password);
    setUser(authUser);
    setIsLoggedIn(true);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const authUser = await fakeSignup(email, password);
    setUser(authUser);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, user, login, signup, logout }),
    [isLoggedIn, user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
