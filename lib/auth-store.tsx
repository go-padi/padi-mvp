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
  /**
   * True when the most recent profile fetch errored at the network/DB layer
   * (as opposed to returning a row with role=null). Use this to fail open in
   * role-gated UI — never redirect to the picker if the fetch itself failed,
   * or we create infinite redirect loops on future regressions.
   */
  profileFetchError: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ session: Session | null; user: AuthUser | null }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

export class AccountAlreadyExistsError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'AccountAlreadyExistsError';
  }
}

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

type RoleInfo = { role: UserRole | null; roleSetAt: string | null; fetchError: boolean };

async function fetchRoleInfo(userId: string): Promise<RoleInfo> {
  try {
    const sb = supabaseClient();
    const { data, error } = await sb
      .from('profiles')
      .select('role, role_set_at')
      .eq('id', userId)
      .single();
    if (error) {
      // PGRST116 ("Results contain 0 rows") is treated as missing-row, not
      // a transport failure — the picker/upsert path will create one.
      const isMissingRow = error.code === 'PGRST116';
      if (!isMissingRow) {
        console.error('fetchRoleInfo error:', error);
        return { role: null, roleSetAt: null, fetchError: true };
      }
      return { role: null, roleSetAt: null, fetchError: false };
    }
    const row = data as { role: string; role_set_at: string | null } | null;
    const role = row?.role;
    return {
      role: role === 'parent' || role === 'teacher' ? role : null,
      roleSetAt: row?.role_set_at ?? null,
      fetchError: false,
    };
  } catch (err) {
    console.error('fetchRoleInfo threw:', err);
    return { role: null, roleSetAt: null, fetchError: true };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleSetAt, setRoleSetAt] = useState<string | null>(null);
  const [profileFetchError, setProfileFetchError] = useState(false);
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
          setProfileFetchError(info.fetchError);
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
              setProfileFetchError(info.fetchError);
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
        setProfileFetchError(false);
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
    setProfileFetchError(info.fetchError);
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
      if (/already.*registered|already.*exists|user already/i.test(error.message)) {
        throw new AccountAlreadyExistsError();
      }
      throw error;
    }
    // When email confirmations are required and the email is already taken,
    // Supabase returns a fake user with an empty identities array (and no error)
    // to prevent email enumeration. Detect that here so we can surface a helpful
    // "account already exists" message instead of leaving the user stuck.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw new AccountAlreadyExistsError();
    }
    return {
      session: data.session,
      user: data.user ? { id: data.user.id, email: data.user.email ?? null } : null,
    };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const sb = supabaseClient();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const sb = supabaseClient();
    await sb.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setTenantId(null);
    setRole(null);
    setRoleSetAt(null);
    setProfileFetchError(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      tenantId,
      role,
      roleSetAt,
      profileFetchError,
      isHydrated,
      login,
      signup,
      resetPassword,
      logout,
      refreshRole,
    }),
    [isLoggedIn, user, tenantId, role, roleSetAt, profileFetchError, isHydrated, login, signup, resetPassword, logout, refreshRole]
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
