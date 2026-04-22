'use client';
import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-store';

type SignInModalProps = { onClose: () => void };

type Mode = 'signin' | 'signup';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    // eye-off
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.79 19.79 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.79 19.79 0 0 1-3.17 4.19" />
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  // eye
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SignInModal({ onClose }: SignInModalProps) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
  };

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

  const attemptSignup = async () => {
    setError(null);
    setInfo(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don\u2019t match. Please re-enter.');
      return;
    }
    setLoading(true);
    try {
      const { session } = await signup(email, password);
      if (!session?.access_token) {
        // Email-confirmation required — flip to Sign In with the email pre-filled.
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirm(false);
        setError(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'signin') await attemptLogin();
    else await attemptSignup();
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create Account' : 'Sign In';
  const subtitle = isSignup
    ? 'Create an account to save your students and lessons'
    : 'Sign in to access your teaching dashboard';
  const primaryLabel = isSignup
    ? (loading ? 'Creating account...' : 'Create Account')
    : (loading ? 'Signing in...' : 'Sign In');
  const primaryDisabled = loading || (isSignup && (!password || !confirmPassword));

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
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Your password"
                required
                minLength={isSignup ? 8 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          {isSignup && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirm}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
          )}
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {info && <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</div>}
          <button
            type="submit"
            disabled={primaryDisabled}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
            className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
          >
            {isSignup ? 'Already have an account? Sign in' : 'Don\u2019t have an account? Create one'}
          </button>
        </form>
      </div>
    </div>
  );
}
