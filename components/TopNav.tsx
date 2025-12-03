'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { SignInModal } from './SignInModal';

export default function TopNav(){
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();
  const [isSignInOpen, setSignInOpen] = useState(false);

  const goToDashboard = () => {
    if (isLoggedIn) {
      router.push('/teacher/phases');
    } else {
      setSignInOpen(true);
    }
  };

  const isDashboardActive =
    pathname === '/teacher/phases' || pathname.startsWith('/teacher/phases/') || pathname === '/teacher';

  return (
    <>
      <nav className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold">P</span>
            <span>Padi</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToDashboard}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-medium',
                isDashboardActive ? 'bg-gray-100 text-gray-900' : 'text-gray-800 hover:bg-gray-100'
              )}
            >
              Teacher Dashboard
            </button>
            <Link
              href="/teacher"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              Start Teaching
            </Link>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Sign In
              </button>
            )}
            {isLoggedIn && (
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <span>Logged in as {user?.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-gray-700 underline underline-offset-2"
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
