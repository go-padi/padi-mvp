'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

type Status = 'verifying' | 'ready' | 'invalid' | 'submitting' | 'done';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const sb = supabaseClient();

      // PKCE flow: Supabase appends ?code=... to the redirect URL. Exchange it
      // for a session so we can call updateUser below. If there is no code,
      // the user may already be in a recovery session (legacy hash flow) — in
      // that case getSession() will return one.
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          setError('This reset link is invalid or has expired. Request a new one.');
          setStatus('invalid');
          return;
        }
        // Strip the ?code from the URL so a refresh does not retry the exchange.
        window.history.replaceState({}, '', url.pathname);
      }

      const { data } = await sb.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setError('This reset link is invalid or has expired. Request a new one.');
        setStatus('invalid');
        return;
      }
      setStatus('ready');
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match. Please re-enter.');
      return;
    }
    setStatus('submitting');
    const sb = supabaseClient();
    const { error: updateError } = await sb.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || 'Could not update password. Please try again.');
      setStatus('ready');
      return;
    }
    setStatus('done');
    setTimeout(() => router.push('/'), 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>

        {status === 'verifying' && (
          <p className="mt-4 text-sm text-gray-600">Verifying your reset link...</p>
        )}

        {status === 'invalid' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Back to home
            </button>
          </div>
        )}

        {(status === 'ready' || status === 'submitting') && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600">Enter a new password for your account.</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800" htmlFor="confirm-new-password">
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={status === 'submitting' || !password || !confirmPassword}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
            >
              {status === 'submitting' ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        {status === 'done' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Password updated. Redirecting you back...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
