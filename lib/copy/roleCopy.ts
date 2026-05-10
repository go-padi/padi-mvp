import type { UserRole } from '@/lib/auth-store';

/**
 * Render-time substitution helper for KAN-132 role-neutral copy.
 *
 * Returns the parent value when `role === 'parent'`, otherwise the teacher
 * value. Pre-hydration (`role === null`) and unknown roles fall through to
 * the teacher default — which matches KAN-131 / KAN-135-followup behavior
 * (avoid teacher → parent text flash).
 *
 * Note: per `lib/auth-store.tsx`, `role` is bootstrapped to 'teacher' by the
 * auth trigger. `role === 'parent'` is the ONLY value that can be set without
 * an explicit user choice, so this helper does not need `roleSetAt`.
 */
export function rolePhrase<T>(role: UserRole | null, teacher: T, parent: T): T {
  return role === 'parent' ? parent : teacher;
}
