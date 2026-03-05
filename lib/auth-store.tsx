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
  tenantId: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ session: Session | null; user: AuthUser | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

async function fetchTenantId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/bootstrap-tenant', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.tenant_id ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const sb = supabaseClient();
    const initSession = async () => {
      const { data } = await sb.auth.getSession();
      if (!isMounted) return;
      const session = data.session;
      const sessionUser = session?.user || null;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
      setIsLoggedIn(Boolean(sessionUser));
      if (session?.access_token) {
        const tid = await fetchTenantId(session.access_token);
        if (isMounted) setTenantId(tid);
      }
      if (isMounted) setIsHydrated(true);
    };

    initSession();

    const { data: subscription } = sb.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user || null;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
        setIsLoggedIn(Boolean(sessionUser));
        if (event === 'SIGNED_IN' && session?.access_token) {
          fetchTenantId(session.access_token).then(tid => {
            if (isMounted) setTenantId(tid);
          });
        }
        setIsHydrated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setTenantId(null);
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
      tenantId,
      isHydrated,
      login,
      signup,
      logout,
    }),
    [isLoggedIn, user, tenantId, isHydrated, login, signup, logout]
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
