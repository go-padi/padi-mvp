'use client';
import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';

type Mode = 'signIn' | 'createAccount';

export function SignInModal({ onClose }: { onClose: () => void }) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('teacher@school.edu');
  const [password, setPassword] = useState('1234!');
  const [mode, setMode] = useState<Mode>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signIn') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const headline = mode === 'signIn' ? 'Sign In' : 'Create Account';
  const subtitle =
    mode === 'signIn'
      ? 'Sign in to access your teaching dashboard'
      : 'Create an account to access your teaching dashboard';
  const primaryLabel = mode === 'signIn' ? 'Sign In' : 'Create Account';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close sign in"
        >
          ✕
        </button>
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">{headline}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
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
              placeholder="1234!"
              required
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {loading ? 'Working...' : primaryLabel}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'createAccount' : 'signIn')}
            className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
          >
            {mode === 'signIn' ? "Don't have an account? Create one" : 'Have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
