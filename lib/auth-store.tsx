'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AuthUser = { email: string };

export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'padi_auth_state';
const defaultState: Pick<AuthState, 'isLoggedIn' | 'user'> = {
  isLoggedIn: false,
  user: null,
};

async function authenticate(email: string, password: string): Promise<AuthUser> {
  if (password !== '1234!') {
    throw new Error('Test mode: use password 1234! to sign in.');
  }
  const trimmedEmail = email.trim();
  return { email: trimmedEmail || 'teacher@school.edu' };
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(defaultState.isLoggedIn);
  const [user, setUser] = useState<AuthUser | null>(defaultState.user);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<AuthState>;
      setIsLoggedIn(Boolean(parsed.isLoggedIn));
      setUser(parsed.user ?? null);
    } catch {
      setIsLoggedIn(defaultState.isLoggedIn);
      setUser(defaultState.user);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isLoggedIn, user }));
  }, [isLoggedIn, user]);

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await authenticate(email, password);
    setIsLoggedIn(true);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(defaultState.isLoggedIn);
    setUser(defaultState.user);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      logout,
    }),
    [isLoggedIn, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
