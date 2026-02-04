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
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';

export type AuthUser = { id: string; email: string | null };

export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ session: Session | null; user: AuthUser | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const sb = supabaseClient();
    const initSession = async () => {
      const { data } = await sb.auth.getSession();
      if (!isMounted) return;
      const sessionUser = data.session?.user || null;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
      setIsLoggedIn(Boolean(sessionUser));
      setIsHydrated(true);
    };

    initSession();

    const { data: subscription } = sb.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user || null;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
        setIsLoggedIn(Boolean(sessionUser));
        setIsHydrated(true);
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('padi.tenant_id');
          }
        } catch {}
        if (event === 'SIGNED_IN' && session?.access_token) {
          fetch('/api/auth/bootstrap-tenant', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
          }).catch(() => {});
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setIsHydrated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sb = supabaseClient();
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const sb = supabaseClient();
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
    return {
      session: data.session,
      user: data.user ? { id: data.user.id, email: data.user.email ?? null } : null,
    };
  }, []);

  const logout = useCallback(async () => {
    const sb = supabaseClient();
    await sb.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      isHydrated,
      login,
      signup,
      logout,
    }),
    [isLoggedIn, user, isHydrated, login, signup, logout]
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
