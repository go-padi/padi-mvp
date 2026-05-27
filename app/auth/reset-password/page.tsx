'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { EyeIcon } from '@/components/auth/EyeIcon';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isLoggedIn, isHydrated, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current !== null) {
        window.clearTimeout(redirectTimer.current);
      }
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
    setLoading(true);
    try {
      await updatePassword(password);
      track(ANALYTICS_EVENTS.PASSWORD_RESET_COMPLETED);
      setSuccess(true);
      redirectTimer.current = window.setTimeout(() => {
        router.replace('/');
      }, 800);
    } catch {
      setError('Couldn’t update password. The reset link may have expired — please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || (isHydrated && !isLoggedIn)) {
    return null;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Set a new password</h1>
            <p className="text-sm text-gray-600">Choose a new password for your Padi account.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-14 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-3 text-gray-600 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="confirm-new-password">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-14 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Re-enter your password"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(prev => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-3 text-gray-600 hover:text-gray-700"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirm}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              Password updated. Redirecting…
            </div>
          )}
          <button
            type="submit"
            disabled={loading || success || !password || !confirmPassword}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
