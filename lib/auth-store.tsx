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
export type UserRole = 'parent' | 'teacher';

/**
 * AuthState exposes the authenticated user's role alongside the session.
 *
 * IMPORTANT: Never read `role` or `roleSetAt` before `isHydrated === true`.
 * Before hydration completes, both are `null` regardless of the underlying
 * profile values, and gating UI on `null` will flash the wrong state for
 * role=parent users. Guard with `if (!isHydrated) return null` or equivalent.
 *
 * `roleSetAt` is the source of truth for "has the user explicitly picked a
 * role?". `role` is bootstrapped to 'teacher' by the auth trigger, so checking
 * `role !== null` does NOT reliably answer that question — use `roleSetAt`.
 */
export type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  tenantId: string | null;
  role: UserRole | null;
  roleSetAt: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ session: Session | null; user: AuthUser | null }>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
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

type RoleInfo = { role: UserRole | null; roleSetAt: string | null };

async function fetchRoleInfo(userId: string): Promise<RoleInfo> {
  try {
    const sb = supabaseClient();
    const { data } = await sb
      .from('profiles')
      .select('role, role_set_at')
      .eq('id', userId)
      .single();
    const row = data as { role: string; role_set_at: string | null } | null;
    const role = row?.role;
    return {
      role: role === 'parent' || role === 'teacher' ? role : null,
      roleSetAt: row?.role_set_at ?? null,
    };
  } catch {
    return { role: null, roleSetAt: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleSetAt, setRoleSetAt] = useState<string | null>(null);
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
      if (session?.access_token && sessionUser) {
        const [tid, info] = await Promise.all([
          fetchTenantId(session.access_token),
          fetchRoleInfo(sessionUser.id),
        ]);
        if (isMounted) {
          setTenantId(tid);
          setRole(info.role);
          setRoleSetAt(info.roleSetAt);
        }
      }
      if (isMounted) setIsHydrated(true);
    };

    initSession();

    const { data: subscription } = sb.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user || null;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
        setIsLoggedIn(Boolean(sessionUser));
        if (event === 'SIGNED_IN' && session?.access_token && sessionUser) {
          Promise.all([
            fetchTenantId(session.access_token),
            fetchRoleInfo(sessionUser.id),
          ]).then(([tid, info]) => {
            if (isMounted) {
              setTenantId(tid);
              setRole(info.role);
              setRoleSetAt(info.roleSetAt);
            }
          });
        }
        setIsHydrated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setTenantId(null);
        setRole(null);
        setRoleSetAt(null);
        setIsHydrated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription?.unsubscribe();
    };
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user?.id) return;
    const info = await fetchRoleInfo(user.id);
    setRole(info.role);
    setRoleSetAt(info.roleSetAt);
  }, [user?.id]);

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
    setTenantId(null);
    setRole(null);
    setRoleSetAt(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      tenantId,
      role,
      roleSetAt,
      isHydrated,
      login,
      signup,
      logout,
      refreshRole,
    }),
    [isLoggedIn, user, tenantId, role, roleSetAt, isHydrated, login, signup, logout, refreshRole]
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
