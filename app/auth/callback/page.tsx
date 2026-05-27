'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'exchanging' | 'error'>('exchanging');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const type = url.searchParams.get('type');
        const next = type === 'recovery' ? '/auth/reset-password' : '/';

        if (!code) {
          if (!cancelled) {
            router.replace('/?auth_error=missing_code');
          }
          return;
        }

        const sb = supabaseClient();
        const { error } = await sb.auth.exchangeCodeForSession(window.location.href);
        if (cancelled) return;
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }
        router.replace(next);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        {status === 'exchanging' ? (
          <div className="space-y-2 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Signing you in…</h1>
            <p className="text-sm text-gray-600">Just a moment while we finish verifying your link.</p>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Sign-in link didn’t work</h1>
            <p className="text-sm text-gray-600">
              {errorMessage ?? 'The link may have expired or already been used.'}
            </p>
            <button
              type="button"
              onClick={() => router.replace('/')}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Back to home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
