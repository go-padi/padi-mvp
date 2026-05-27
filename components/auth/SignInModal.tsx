'use client';
import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';
import { EyeIcon } from '@/components/auth/EyeIcon';

type SignInModalProps = { onClose: () => void };

type Mode = 'signin' | 'signup' | 'forgot';

// Supabase auth returns one of these phrasings when an email is
// already registered:
//   - "User already registered"
//   - "Email already in use"
//   - "User with this email already exists"
const EMAIL_EXISTS_REGEX = /already\s+(registered|exist|in use)/i;

const RATE_LIMIT_REGEX = /over_email_send_rate_limit|rate limit|too many/i;

export function SignInModal({ onClose }: SignInModalProps) {
  const {
    login,
    signup,
    isLoggedIn,
    user,
    logout,
    requestPasswordReset,
    sendMagicLink,
  } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [forgotSentEmail, setForgotSentEmail] = useState<string | null>(null);
  const [forgotSentKind, setForgotSentKind] = useState<'reset' | 'magic' | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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
    setEmailExists(false);
    setForgotSentEmail(null);
    setForgotSentKind(null);
  };

  const handleSignInInstead = () => {
    setMode('signin');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setInfo(null);
    setEmailExists(false);
    setTimeout(() => passwordRef.current?.focus(), 0);
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
          ? 'The email or password you entered doesn’t match our records. Please check and try again.'
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
      setError('Passwords don’t match. Please re-enter.');
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
      track(ANALYTICS_EVENTS.SIGNUP_COMPLETED);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (EMAIL_EXISTS_REGEX.test(message)) {
        setEmailExists(true);
      } else {
        const isKnownError =
          err instanceof Error &&
          /already|exists|email|invalid|password/i.test(err.message);
        setError(
          isKnownError
            ? 'An account with this email may already exist. Try signing in instead.'
            : 'Unable to create account. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const mapForgotError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : '';
    // Supabase rate-limit messages and 429s.
    if (RATE_LIMIT_REGEX.test(message)) {
      return 'Too many requests — please wait a minute and try again.';
    }
    if (err && typeof err === 'object' && 'status' in err && (err as { status?: number }).status === 429) {
      return 'Too many requests — please wait a minute and try again.';
    }
    return 'Something went wrong. Please try again in a moment.';
  };

  const attemptResetLink = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      track(ANALYTICS_EVENTS.PASSWORD_RESET_REQUESTED);
      setForgotSentEmail(email.trim());
      setForgotSentKind('reset');
    } catch (err) {
      setError(mapForgotError(err));
    } finally {
      setLoading(false);
    }
  };

  const attemptMagicLink = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await sendMagicLink(email);
      track(ANALYTICS_EVENTS.MAGIC_LINK_REQUESTED);
      setForgotSentEmail(email.trim());
      setForgotSentKind('magic');
    } catch (err) {
      setError(mapForgotError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'signin') await attemptLogin();
    else if (mode === 'signup') await attemptSignup();
    else if (mode === 'forgot') await attemptResetLink();
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';
  const title = isForgot
    ? 'Reset your password'
    : isSignup
      ? 'Create Account'
      : 'Sign In';
  const subtitle = isForgot
    ? 'Enter your email — we’ll send you a link to reset your password or sign in without one.'
    : isSignup
      ? 'Create an account to save your students and lessons'
      : 'Sign in to access your teaching dashboard';
  const primaryLabel = isSignup
    ? (loading ? 'Creating account...' : 'Create Account')
    : (loading ? 'Signing in...' : 'Sign In');
  const primaryDisabled = loading || (isSignup && (!password || !confirmPassword));
  const forgotDisabled = loading || !email;
  const showConfirmation = isForgot && forgotSentEmail && forgotSentKind;

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
        {isLoggedIn && user?.email ? (
          <div className="p-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-blue-900">{`You're signed in as ${user.email}.`}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={async () => {
                    setLoggingOut(true);
                    try { await logout(); }
                    finally { setLoggingOut(false); }
                  }}
                  className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : isForgot && showConfirmation ? (
          <div className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            <div
              className="rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-800"
              role="status"
            >
              {forgotSentKind === 'reset'
                ? `If an account exists for ${forgotSentEmail}, we just sent a reset link. Check your inbox.`
                : `If an account exists for ${forgotSentEmail}, we just sent a magic sign-in link. Check your inbox.`}
            </div>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Back to sign in
            </button>
          </div>
        ) : (
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
              onChange={e => { setEmail(e.target.value); setEmailExists(false); }}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="teacher@school.edu"
              required
              autoComplete="email"
              autoCapitalize="off"
              inputMode="email"
            />
          </div>
          {!isForgot && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-14 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Your password"
                  required
                  minLength={isSignup ? 8 : undefined}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
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
          )}
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
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-14 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
          )}
          {emailExists && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              This email already has an account.{' '}
              <button
                type="button"
                onClick={handleSignInInstead}
                className="text-red-900 underline font-semibold cursor-pointer"
              >
                Sign in instead.
              </button>
            </div>
          )}
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {info && <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</div>}
          {isForgot ? (
            <>
              <button
                type="submit"
                disabled={forgotDisabled}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={attemptMagicLink}
                disabled={forgotDisabled}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-70"
              >
                {loading ? 'Sending…' : 'Email me a magic sign-in link'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              <button
                type="submit"
                disabled={primaryDisabled}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
              >
                {primaryLabel}
              </button>
              {!isSignup && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
                >
                  Forgot your password?
                </button>
              )}
              <button
                type="button"
                onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
                className="w-full text-center text-sm font-semibold text-gray-700 underline underline-offset-2"
              >
                {isSignup ? 'Already have an account? Sign in' : 'Don’t have an account? Create one'}
              </button>
            </>
          )}
        </form>
        )}
      </div>
    </div>
  );
}
