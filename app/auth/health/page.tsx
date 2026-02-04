'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

type AuthHealth = {
  sessionEmail: string | null;
  sessionUserId: string | null;
  hasSession: boolean;
  hasAuthToken: boolean;
  checked: boolean;
};

export default function AuthHealthPage() {
  const [health, setHealth] = useState<AuthHealth>({
    sessionEmail: null,
    sessionUserId: null,
    hasSession: false,
    hasAuthToken: false,
    checked: false,
  });

  useEffect(() => {
    const run = async () => {
      const sb = supabaseClient();
      const { data } = await sb.auth.getSession();
      const sessionUser = data.session?.user || null;
      const hasAuthToken =
        typeof window !== 'undefined' &&
        Object.keys(window.localStorage).some(key => key.startsWith('sb-') && key.endsWith('-auth-token'));

      setHealth({
        sessionEmail: sessionUser?.email ?? null,
        sessionUserId: sessionUser?.id ?? null,
        hasSession: Boolean(sessionUser),
        hasAuthToken,
        checked: true,
      });
    };
    run();
  }, []);

  const summary = useMemo(() => {
    if (!health.checked) return 'Checking auth status...';
    if (health.hasSession && health.hasAuthToken) return 'Supabase auth is connected.';
    if (health.hasSession && !health.hasAuthToken) return 'Session exists, but auth token not found in localStorage.';
    return 'No active Supabase session.';
  }, [health]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Auth health</h1>
        <p className="text-sm text-gray-700">{summary}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span>Session active</span>
          <span className="font-semibold text-gray-900">{health.hasSession ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Auth token in localStorage</span>
          <span className="font-semibold text-gray-900">{health.hasAuthToken ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Session user email</span>
          <span className="font-semibold text-gray-900">{health.sessionEmail || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Session user id</span>
          <span className="font-semibold text-gray-900">{health.sessionUserId || '—'}</span>
        </div>
      </div>
    </div>
  );
}
