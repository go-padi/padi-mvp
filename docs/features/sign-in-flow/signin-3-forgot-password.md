---
id: SIGNIN-3
title: "[Sign-in] Forgot password + magic link recovery path"
type: story
status: backlog
priority: highest
feature: sign-in-flow
parent: SIGNIN-1
buildloop_priority: next
launch_blocker: true
uat: ./uat/SIGNIN-3-uat.md
cc_prompt: ./cc-prompt-signin-3-forgot-password.md
created: 2026-05-26
updated: 2026-05-26
---

# SIGNIN-3 — Forgot password + magic link

## Goal

Add a self-serve recovery path to `components/auth/SignInModal.tsx`. A logged-out user who forgot their password (or who signed up via OAuth and never set one) can request either a password reset link or a magic sign-in link from the same screen, complete the flow via email, and end up logged in.

Closes the loop on SIGNIN-2's deferred AC-15. Removes the need for manual `DELETE FROM auth.users` rescues from the Supabase MCP (real example: `mona.iyer@verizon.net` on 2026-05-26).

## Background

`SignInModal` has Sign In and Create Account modes (shipped SIGNIN-1, polished SIGNIN-2). There is no recovery path. Two real failure modes are already on file:

1. **Forgotten password.** Today the only fix is engineering deleting the auth row and asking the user to sign up again.
2. **OAuth-then-confused.** Some users complete signup via Google OAuth (Supabase sets `email_verified=true` automatically from the OAuth `sub`), then later try to sign in with a password they never set. Magic link bypasses this without making the user re-do signup.

SIGNIN-2 explicitly deferred the "Forgot password?" link with `"deferred to SIGNIN-3 once reset-password route reaches main"`. The reset-password route does NOT exist on `main` today (`app/auth/` contains only `health/page.tsx`); SIGNIN-3 creates it.

Full CC prompt with exact spec: [`./cc-prompt-signin-3-forgot-password.md`](./cc-prompt-signin-3-forgot-password.md).

## Requirements (summary — see CC prompt for full detail)

1. Extend `Mode` in `SignInModal` to `'signin' | 'signup' | 'forgot'`. Add a "Forgot your password?" link in Sign In mode that switches to forgot mode.
2. Forgot mode UI: one Email field, two buttons (**Send reset link** primary, **Email me a magic sign-in link** secondary), a Back-to-Sign-In link, and a confirmation panel after submit.
3. Privacy: success copy says "if an account exists for {email}" — never confirm or deny account existence.
4. Rate-limit: map Supabase rate-limit errors to a friendly "Too many requests — please wait a minute and try again."
5. New auth-store methods (additive, do NOT change existing signatures): `requestPasswordReset`, `sendMagicLink`, `updatePassword`.
6. New route `app/auth/callback` (server route handler OR thin client page — whichever matches the SSR pattern already in the repo) that exchanges the email link's `code` for a session, then redirects to `/auth/reset-password` for recovery or `/` for magic-link sign-in.
7. New page `app/auth/reset-password/page.tsx` — New Password + Confirm Password with the same EyeIcon toggle pattern, ≥8 char validation, mismatch check; on success shows brief banner and `router.replace('/')`.
8. Analytics events (additive to `lib/analytics.ts` if it exists; comment-only TODO if not — same pattern as SIGNIN-2): `PASSWORD_RESET_REQUESTED`, `MAGIC_LINK_REQUESTED`, `PASSWORD_RESET_COMPLETED`.
9. **Manual Supabase config** (call out in PR description, not in code): add `http://localhost:3010/auth/callback`, `https://padi-mvp.vercel.app/auth/callback`, and the Vercel preview pattern to the Auth redirect allowlist.

## Acceptance Criteria

- **AC-01** Sign In mode shows a visible "Forgot your password?" link below the primary button; clicking it switches to forgot mode with the email field carried over.
- **AC-02** Forgot mode renders Email + two buttons (Send reset link, Email me a magic sign-in link) + Back-to-Sign-In link. Both buttons share a single `loading` state.
- **AC-03** Successful **reset-link** request shows the privacy-safe confirmation panel ("if an account exists for {email}…") and offers Back to sign in.
- **AC-04** Successful **magic-link** request shows the same privacy-safe pattern with the magic-link copy variant.
- **AC-05** Clicking the password-reset email link lands the user on `/auth/reset-password` with an authenticated session; setting a valid new password (≥8 chars, matches confirm) updates the password and redirects to `/`.
- **AC-06** Clicking the magic-link email link lands the user on `/` already signed in.
- **AC-07** Mismatched or short new password on `/auth/reset-password` shows inline error and does NOT call `updateUser`.
- **AC-08** Cold visit to `/auth/reset-password` (no recovery session in flight) redirects to `/`.
- **AC-09** Rate-limit error from Supabase surfaces as the friendly rate-limit copy, not a raw error.
- **AC-10** No enumeration leak — UI does not distinguish "email not found" from "email sent" in either flow.
- **AC-11** No regression — SIGNIN-1 UAT (UAT-01 through UAT-12) and SIGNIN-2 ACs still pass behaviorally.
- **AC-12** `magic link` flow uses `shouldCreateUser: false` — must not create a new account from the forgot screen.
- **AC-13** Analytics events (`PASSWORD_RESET_REQUESTED`, `MAGIC_LINK_REQUESTED`, `PASSWORD_RESET_COMPLETED`) are fired if `lib/analytics.ts` exposes a `track` helper; otherwise a `// TODO(analytics):` marker is left at each emit site.
- **AC-14** Scope: changes confined to `components/auth/SignInModal.tsx`, `lib/auth-store.tsx`, `app/auth/callback/`, `app/auth/reset-password/`, and (optionally) `components/auth/EyeIcon.tsx` if the eye icon is extracted for reuse. No edits to `components/TopNav.tsx`, DB schema, RLS, role-picker, or any tenant logic.

## Files to touch

- `components/auth/SignInModal.tsx`
- `lib/auth-store.tsx`
- `app/auth/callback/route.ts` (or `app/auth/callback/page.tsx` — pick whichever matches the existing SSR pattern in the repo)
- `app/auth/reset-password/page.tsx`
- `components/auth/EyeIcon.tsx` (optional — only if extracting the EyeIcon helper)
- `lib/analytics.ts` (only if it already exists and only to add three event names)

## Files NOT to touch

- `components/TopNav.tsx`
- `app/teacher/*`, `app/library/*`, `app/students/*`
- `supabase/schema.sql`, `supabase/migrations/*`
- Any RLS policy
- `app/welcome/role/*` (role picker)

## Out of scope

- OAuth providers (Google / Apple)
- Password strength meter / leaked-password check
- Custom-branded email templates
- Account lockout policy
- Any change to the role picker or tenant bootstrap

## Estimated complexity

**M** — one new mode in a known component, two new methods on the auth store, two new app-router routes, and a Supabase dashboard config step. No new dependencies, no schema changes.

## Verification

1. `pnpm lint` clean
2. `npx tsc --noEmit` clean
3. Manual QA per the 14-step checklist in the CC prompt (run on `pnpm dev -- --port 3010` after Supabase redirect URL is allowlisted for localhost)
4. Codex diff review before merge
5. UAT subagent run against [`./uat/SIGNIN-3-uat.md`](./uat/SIGNIN-3-uat.md)

## Notes

- Use `mona.iyer@verizon.net` as the canonical re-signup smoke test — the auth row was deleted on 2026-05-26, so a fresh signup + reset cycle on her email exercises the full flow end to end.
- Branch `followup-parent-redirect-resolution` (commit `94b1035`) historically had an `/auth/reset-password` stub but never merged. Do not attempt to revive it — write fresh against the current `main`.
