'use client';
import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-store';

type SignInModalProps = { onClose: () => void };

export function SignInModal({ onClose }: SignInModalProps) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const attemptLogin = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      const isCredentialError =
        err instanceof Error &&
        /invalid|credentials|password|email|not found/i.test(err.message);
      setError(
        isCredentialError
          ? 'The email or password you entered doesn\u2019t match our records. Please check and try again.'
          : 'Something went wrong. Please try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await attemptLogin();
  };

  const handleCreateAccount = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { session } = await signup(email, password);
      if (!session?.access_token) {
        setInfo('Check your email to confirm your account, then sign in.');
        return;
      }
      onClose();
    } catch (err) {
      const isKnownError =
        err instanceof Error &&
        /already|exists|email|invalid|password/i.test(err.message);
      setError(
        isKnownError
          ? 'An account with this email may already exist. Try signing in instead.'
          : 'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close sign in"
        >
          X
        </button>
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-600">Sign in to access your teaching dashboard</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="teacher@school.edu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Your password"
              required
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {info && <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</div>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
          >
            Don&apos;t have an account? Create one
          </button>
        </form>
      </div>
    </div>
  );
}
