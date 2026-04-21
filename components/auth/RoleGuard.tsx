'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';

const PICKER_PATH = '/welcome/role';

/**
 * Redirects signed-in users who have not yet explicitly picked a role to the
 * picker page. The source of truth is `roleSetAt` — never `role`, which is
 * bootstrapped by the auth trigger and therefore always non-null.
 *
 * Mounted inside AuthProvider in the root layout so every route runs through
 * it. Does nothing until hydration completes to avoid flashing redirects.
 */
export function RoleGuard() {
  const { isLoggedIn, isHydrated, roleSetAt, profileFetchError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) return;
    // Fail open on fetch errors — redirecting when we couldn't read the
    // profile creates infinite redirect loops on transient failures.
    if (profileFetchError) return;
    if (roleSetAt) return;
    if (pathname === PICKER_PATH) return;
    router.replace(PICKER_PATH);
  }, [isHydrated, isLoggedIn, roleSetAt, profileFetchError, pathname, router]);

  return null;
}
