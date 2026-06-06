'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { rolePhrase } from '@/lib/copy/roleCopy';
import { SignInModal } from './auth/SignInModal';

export default function TopNav(){
  const pathname = usePathname();
  const { isLoggedIn, user, logout, role } = useAuth();
  const [isSignInOpen, setSignInOpen] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined') setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const isMatch = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const isDashboardActive =
    isMatch('/teacher/curriculum') ||
    isMatch('/teacher/about') ||
    isMatch('/teacher/grouping');

  const isStartTeachingRoute = pathname === '/teacher' || pathname === '/start-teaching' || isMatch('/teacher/start-teaching') || isMatch('/start-teaching');
  const startTeachingHighlight = isStartTeachingRoute || pathname === '/';
  const isSignInRoute = pathname === '/signin' || pathname === '/login';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setSignInOpen(true);
    window.addEventListener('padi-open-signin', handler);
    return () => window.removeEventListener('padi-open-signin', handler);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold">P</span>
            <span>Padi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/curriculum"
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-semibold',
                isDashboardActive
                  ? 'bg-gray-100 text-gray-900 ring-2 ring-offset-2 ring-blue-200'
                  : 'text-gray-800 hover:bg-gray-100'
              )}
              aria-current={isDashboardActive ? 'page' : undefined}
            >
              Curriculum
            </Link>
            <Link
              href="/teacher"
              className={clsx(
                'rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95',
                startTeachingHighlight && 'ring-2 ring-offset-2 ring-blue-200'
              )}
              aria-current={isStartTeachingRoute ? 'page' : undefined}
            >
              {rolePhrase(role, 'Start Teaching', 'Start Lesson')}
            </Link>
            {!online && (
              <span
                role="status"
                aria-live="polite"
                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
              >
                ⚠️ Offline
              </span>
            )}
            {!isLoggedIn && (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className={clsx(
                'rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50',
                isSignInRoute && 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-offset-2 ring-blue-200'
              )}
              aria-current={isSignInRoute ? 'page' : undefined}
            >
              Sign In
            </button>
          )}
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <span className="font-semibold text-gray-900">Logged in as {user?.email ?? 'User'}</span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          )}
          </div>
        </div>
      </nav>
      {isSignInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
    </>
  );
}
