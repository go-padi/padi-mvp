# CC Prompt — SIGNIN-3: Forgot Password + Magic Link

**Internal ID:** `SIGNIN-3` · **Priority:** P1 · **Feature:** sign-in-flow

**Branching & review:** do the work on a feature branch, not directly on `main`. Codex reviews the diff before merge. No Jira writes.

## Problem

`SignInModal` has Sign In and Create Account modes (shipped in `SIGNIN-1`), but no recovery path. If a user forgets their password, they're stuck. Today's only workaround is manually deleting the row in `auth.users` and asking them to sign up again (just had to do this for a real user on 2026-05-26). We need a self-serve reset path, and — because some users sign up via Google OAuth and don't realize they don't have a password — also offer a passwordless magic link as a second option on the same screen.

The same modal serves both parents and teachers (role is picked post-login via the role picker from `KAN-127`), so there is exactly one auth surface to update.

## Goal

Add a third mode to the existing `SignInModal` that lets a user enter their email and choose to receive either:
1. A **password reset link** (lands on `/auth/reset-password` to set a new password), or
2. A **magic sign-in link** (logs them in directly when they click it, no password needed).

Both flows hand off via Supabase email and a new `/auth/callback` route that exchanges the code for a session.

## Scope

Surgical additions. Do **not** modify routing, DB schema, RLS, or the role-picker flow.

Files to add or change:
- `components/auth/SignInModal.tsx` — extend `Mode` to `'signin' | 'signup' | 'forgot'`, add the third view.
- `lib/auth-store.tsx` — add `requestPasswordReset(email)`, `sendMagicLink(email)`, `updatePassword(newPassword)` to the context value. Keep existing `login` / `signup` / `logout` signatures unchanged.
- `app/auth/callback/route.ts` — **new** route handler that exchanges the code in the URL for a session via `supabase.auth.exchangeCodeForSession`, then redirects:
  - to `/auth/auth/reset-password` if the URL `type` param is `recovery`,
  - to `/` (root) otherwise (magic-link sign-in lands on home; existing post-login redirects in `app/page.tsx` and the role-picker logic take it from there).
- `app/auth/auth/reset-password/page.tsx` — **new** client page with New Password + Confirm Password fields (same eye-toggle pattern as `SignInModal`), calls `updatePassword`, then redirects to `/` on success. Route convention matches existing `app/auth/health/page.tsx`.

Do NOT:
- Change `app/teacher/*`, `app/library/*`, or `app/students/*`.
- Touch RLS or `supabase/schema.sql`.
- Add a new dependency. Use inline SVGs for any icons, same as `SignInModal`.

## Requirements

### `lib/auth-store.tsx` — new context methods

All three call the existing `supabaseClient()` from `lib/supabase.ts`. None of them mutate local auth state directly — `onAuthStateChange` already handles the SIGNED_IN event after the callback completes.

```ts
requestPasswordReset: (email: string) => Promise<void>;
sendMagicLink:        (email: string) => Promise<void>;
updatePassword:       (newPassword: string) => Promise<void>;
```

Implementations (sketch — match existing `login`/`signup` style):

```ts
const requestPasswordReset = useCallback(async (email: string) => {
  const sb = supabaseClient();
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${getSiteOrigin()}/auth/callback?type=recovery`,
  });
  if (error) throw error;
}, []);

const sendMagicLink = useCallback(async (email: string) => {
  const sb = supabaseClient();
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${getSiteOrigin()}/auth/callback`,
      shouldCreateUser: false, // do NOT create accounts via magic link from forgot-flow
    },
  });
  if (error) throw error;
}, []);

const updatePassword = useCallback(async (newPassword: string) => {
  const sb = supabaseClient();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}, []);
```

Add a small helper colocated in `lib/auth-store.tsx` (or `lib/supabase.ts` if you prefer):

```ts
function getSiteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://padi-mvp.vercel.app';
}
```

Update the `AuthState` type and the `useMemo` `value` to expose the three new methods.

### `app/auth/callback/route.ts` — new route handler

Server route. Exchange `?code=` for a session, then redirect.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'; // if not already available, fall back to the SSR pattern used elsewhere

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const type = url.searchParams.get('type'); // 'recovery' from resetPasswordForEmail
  const next = type === 'recovery' ? '/auth/reset-password' : '/';

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=missing_code', url.origin));
  }

  // Exchange code for session — sets the auth cookies so /auth/reset-password
  // can call updateUser on a logged-in session.
  const supabase = /* server client wired to cookies — match the pattern used in
     other server routes; if no SSR helper exists yet, set the session via
     supabase.auth.setSession after exchangeCodeForSession on the client at /auth/reset-password */;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
```

**Important — pick whichever auth-bridge pattern is already in this repo.** If `@supabase/ssr` is not yet installed (check `package.json`) and no server cookie helper exists, do this instead: keep `/auth/callback` as a thin **client** component (`app/auth/callback/page.tsx`) that calls `supabase.auth.exchangeCodeForSession(window.location.href)` on mount, then `router.replace` to `/auth/reset-password` or `/`. That avoids introducing SSR cookie wiring just for this feature. Decide based on what's already in the repo; the requirement is that after the user clicks the email link, they end up logged in on the destination route.

### `app/auth/reset-password/page.tsx` — new client page

- `'use client'`
- Layout matches existing pages — full-bleed, centered card, same Tailwind tokens as `SignInModal` (`rounded-2xl`, `ring-1 ring-black/5`, `shadow-2xl`).
- Heading: `Set a new password`
- Subtitle: `Choose a new password for your Padi account.`
- Fields: New Password (`minLength={8}`), Confirm Password — both with the same `EyeIcon` toggle pattern as `SignInModal` (extract `EyeIcon` into `components/auth/EyeIcon.tsx` if reusing keeps the diff cleaner; otherwise inline-duplicate is fine for one page).
- Validation, before calling `updatePassword`:
  - Both fields required
  - `password.length >= 8` → else inline error `Password must be at least 8 characters.`
  - `password === confirm` → else inline error `Passwords don't match. Please re-enter.`
- On success: show a brief success banner (`Password updated. Redirecting…`), then `router.replace('/')` after ~800ms. The user is already signed in (callback set the session) so home + role-picker pick up from there.
- On error: surface a generic message `Couldn't update password. The reset link may have expired — please request a new one.` and add a link back to home where they can re-open the modal.
- If `useAuth().isLoggedIn === false` AND we are NOT mid-exchange, redirect to `/` — guards against a user landing on `/auth/reset-password` cold.

### `components/auth/SignInModal.tsx` — forgot mode

Extend the `Mode` type:
```ts
type Mode = 'signin' | 'signup' | 'forgot';
```

Update `switchMode` so flipping into `'forgot'` clears `password`, `confirmPassword`, `error`, `info`, `emailExists` (email stays — if the user already typed it, carry it over for convenience).

Add a new link in **Sign In mode** under the primary `Sign In` button, above (or as a sibling to) the existing "Don't have an account? Create one" link:

```
Forgot your password?
```

It must be a real button (`type="button"`), styled like the existing footer link (`text-sm font-semibold text-gray-700 underline underline-offset-2`), that calls `switchMode('forgot')`.

#### Forgot mode UI

- Title: `Reset your password`
- Subtitle: `Enter your email — we'll send you a link to reset your password or sign in without one.`
- Field: Email (re-uses the same input component / styling as the other modes; pre-populated if `email` state already had a value)
- Two primary buttons, stacked vertically, full width:
  1. **Send reset link** (primary, dark `bg-gray-900`) → calls `requestPasswordReset(email)`
  2. **Email me a magic sign-in link** (secondary, white with border `border-gray-300`) → calls `sendMagicLink(email)`
- Both buttons share the same `loading` state — disable both while one is in flight.
- On success (either button): replace the form body with a confirmation panel:
  - Reset link path: `If an account exists for {email}, we just sent a reset link. Check your inbox.`
  - Magic link path: `If an account exists for {email}, we just sent a sign-in link. Check your inbox.`
  - Below the message, a single button: `Back to sign in` → `switchMode('signin')`.
- On error: show the existing red-error pattern. Map any Supabase rate-limit error (`/over_email_send_rate_limit/i` or `/rate limit/i`) to `Too many requests — please wait a minute and try again.`
- Bottom of the form (below the two buttons, before the confirmation state takes over): a single link `Back to sign in` that calls `switchMode('signin')`.

**Privacy note:** the success copy intentionally says "if an account exists" to avoid leaking account existence. Do NOT distinguish "email not found" from "email sent" in the UI even though Supabase may return slightly different responses.

### Accessibility & UX

- Enter in forgot mode submits the **reset link** (primary action).
- Tab order: email → Send reset link → Magic link button → Back to sign in.
- Confirmation banner uses `role="status"` so screen readers announce it.
- Disable both buttons while `loading`; disable both if `email` is empty.
- Eye-icon visibility toggles on `/auth/reset-password` are independent for the two password fields (same as `SignInModal`).

### Analytics

If `lib/analytics.ts` is already wired (`track(ANALYTICS_EVENTS.*)`), add and fire these events. Do NOT add posthog or any new analytics dependency.

- `PASSWORD_RESET_REQUESTED` — fired on successful `requestPasswordReset`
- `MAGIC_LINK_REQUESTED` — fired on successful `sendMagicLink`
- `PASSWORD_RESET_COMPLETED` — fired on successful `updatePassword` on `/auth/reset-password`

If the events file doesn't already export those names, add them to `ANALYTICS_EVENTS` in the same diff.

## Supabase config (manual, NOT code) — call out in the PR description

The reset and magic-link emails will only work if these redirect URLs are allowlisted in the Supabase project Auth settings. Add to the PR description so reviewer adds them in the dashboard:

- `http://localhost:3010/auth/callback`
- `https://padi-mvp.vercel.app/auth/callback`
- Any staging Vercel preview URL pattern, e.g. `https://padi-mvp-*-go-padi.vercel.app/auth/callback`

Also confirm the Auth → Email Templates use the default Supabase template (it includes `{{ .ConfirmationURL }}` which respects `redirectTo`). No template edits required.

## Out of scope

- OAuth providers (Google / Apple) — separate ticket
- Password strength meter
- Email customization / branding (separate ticket if we want it later)
- Account lockout / brute-force protection (Supabase handles rate limiting server-side)
- Changes to the role picker, role gating, or any tenant logic

## Verification

1. `pnpm lint` — clean
2. `npx tsc --noEmit` — clean
3. Manual QA on `pnpm dev -- --port 3010` (after Supabase redirect URL is added for localhost):
   - Open modal → click "Forgot your password?" → forgot view renders with email pre-filled (if any) and both buttons visible
   - Click **Send reset link** with a valid existing email → confirmation banner appears; check inbox; clicking link lands on `/auth/reset-password` with the user signed in; set a new password ≥ 8 chars matching confirm → success banner → redirected home → can re-sign-in with the new password
   - Click **Magic link** with a valid existing email → confirmation banner; clicking link lands on `/` with the user signed in (no password prompted)
   - Forgot mode with a never-registered email → success copy still says "if an account exists" (no enumeration leak)
   - Mismatched passwords on `/auth/reset-password` → inline error, no network call
   - Land on `/auth/reset-password` cold (no recovery session) → redirects to `/`
   - Hit `/auth/reset-password` after the reset link expires → "link may have expired" message + link back home
   - Rate limit: trigger Supabase rate limit by spamming the reset button → friendly rate-limit message
   - All existing flows (Sign In, Create Account) still work unchanged
4. Codex review the diff before merge.

## Done means

- A logged-out user who forgot their password can recover their account without engineering intervention (no more manual `DELETE FROM auth.users`).
- A user who signed up via OAuth but never set a password can still get in via magic link from the same screen.
- The role-split flow downstream is unaffected.
