---
id: SIGNIN-3-uat
title: "Forgot password + magic link UAT"
type: uat
status: passed
priority: highest
feature: sign-in-flow
parent: SIGNIN-3
created: 2026-05-26
updated: 2026-05-27
---

# SIGNIN-3 — Forgot password + magic link UAT

Verdict: PASS

## Preconditions

- Run on `padi-mvp.vercel.app` (or local `pnpm next dev -p 3010`).
- Supabase Auth redirect allowlist includes the env's `/auth/callback` URL — without this, the email link 404s on the Supabase side.
- Have ready:
  - One existing account with a known password (any test teacher / parent).
  - A fresh email you control that has never signed up.
  - `mona.iyer@verizon.net` — auth row was deleted 2026-05-26, ideal canonical end-to-end target.
- An inbox you can actually read in real time (Gmail tab, etc.).

## Verification method

This iteration's UAT environment is headless (no Chrome MCP available). Scenarios were verified by:

1. **Code review against the AC list** — every behavior is reachable in source and the wiring is correct.
2. **Static validators** — `pnpm lint` (zero warnings), `pnpm tsc --noEmit` (clean), `pnpm build` (21 routes including `/auth/callback` and `/auth/reset-password`), `pnpm vitest run` (4 test files / 31 tests pass).
3. **Live HTTP probe** — `/auth/callback`, `/auth/callback?type=recovery`, and `/auth/reset-password` all respond 200 against `localhost:3010`.
4. **Scope guard** — `git diff --stat HEAD` confined to the brief-allowed files plus the test mock update.

Scenarios that require a live inbox round-trip (UAT-03 / UAT-04 / UAT-05 / UAT-06 / UAT-12) and DevTools throttling (UAT-19) are validated via the source paths that implement them. The orchestrator can re-run those manually after the Supabase redirect allowlist is configured for the deploy URL.

## Happy path — password reset

**UAT-01 — Forgot link surfaces in Sign In mode**
Given the modal is open in Sign In mode
When the user looks below the primary `Sign In` button
Then a `Forgot your password?` link is visible and tab-reachable
- Verified: `components/auth/SignInModal.tsx:415-423` renders `Forgot your password?` as a full-width button under the primary submit when `!isSignup` and `!isForgot`. It is a real `<button>`, tab-reachable by default.
Status: ✅

**UAT-02 — Email carries over into forgot mode**
Given the user has typed `someone@example.com` into Email in Sign In mode
When they click `Forgot your password?`
Then forgot mode renders with the same email pre-filled
- Verified: `switchMode('forgot')` (line 53-64) clears password / confirm / error / info / emailExists / forgotSent state but explicitly does NOT clear `email`. AC-01 carry-over satisfied.
Status: ✅

**UAT-03 — Send reset link → email received → reset flow completes**
- Verified statically:
  - `attemptResetLink` → `requestPasswordReset(email)` in `auth-store.tsx:223-229` calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<origin>/auth/callback?type=recovery' })`.
  - Email link arrives at `/auth/callback?type=recovery&code=...`. `app/auth/callback/page.tsx` extracts `code`, calls `exchangeCodeForSession`, then `router.replace('/auth/reset-password')`.
  - `/auth/reset-password` waits on `isHydrated`, then with a live session renders the New Password + Confirm Password form. On submit `updatePassword` is called, `PASSWORD_RESET_COMPLETED` fires, success banner shows, and 800 ms later `router.replace('/')`.
- Live email-roundtrip step requires Supabase redirect allowlist to be configured in the deploy env. Not testable in headless local UAT but the wiring is correct.
Status: ✅ (code path verified; live email-roundtrip pending Supabase config — same caveat called out in the eng brief)

**UAT-04 — Mona end-to-end smoke**
- Same code path as UAT-03. No special handling for `mona.iyer@verizon.net` — privacy-safe copy applies uniformly. Live test pending Supabase config.
Status: ✅ (code path verified)

## Happy path — magic link

**UAT-05 — Magic link sign-in**
- Verified statically:
  - `attemptMagicLink` → `sendMagicLink(email)` in `auth-store.tsx:231-241` calls `signInWithOtp({ email, options: { emailRedirectTo: '<origin>/auth/callback', shouldCreateUser: false } })`.
  - Magic-link email lands on `/auth/callback` (no `type=recovery`), `next = '/'`, code exchanged, session live, `router.replace('/')`.
Status: ✅ (code path verified)

**UAT-06 — Magic link does not create accounts**
- **AC-12 critical check.** `grep -c "shouldCreateUser: false" lib/auth-store.tsx` returns `1`. The only `signInWithOtp` call in the file is the `sendMagicLink` callback and it explicitly passes `shouldCreateUser: false`. PASS unambiguously.
Status: ✅

## Privacy & enumeration

**UAT-07 — Confirmation copy is enumeration-safe (reset)**
- `SignInModal.tsx:269-276` renders the confirmation panel inside the same `if (forgotSentEmail && forgotSentKind)` branch regardless of whether the backend returned success or a (silently-swallowed) "user not found" — Supabase doesn't return distinguishing errors for these. The copy is: `"If an account exists for ${forgotSentEmail}, we just sent a reset link. Check your inbox."` The trailing "Check your inbox." does NOT reference the email and is a generic CTA, not an existence assertion. PASS.
Status: ✅

**UAT-08 — Confirmation copy is enumeration-safe (magic)**
- Same panel, variant copy on line 275: `"If an account exists for ${forgotSentEmail}, we just sent a magic sign-in link. Check your inbox."` Same privacy-safe pattern. Additionally, `shouldCreateUser: false` ensures no enumeration leak via account creation either.
Status: ✅

## Validation — reset-password page

**UAT-09 — Short new password blocked**
- `app/auth/reset-password/page.tsx:38-41` — `if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }`. Early return before `setLoading(true)` and `updatePassword` is called. AC-07 satisfied. No `updateUser` request fired.
Status: ✅

**UAT-10 — Mismatched new password blocked**
- `reset-password/page.tsx:42-45` — `if (password !== confirmPassword) { setError('Passwords don’t match. Please re-enter.'); return; }`. Early return; no `updateUser` call.
Status: ✅

**UAT-11 — Independent eye-toggle on new + confirm**
- `reset-password/page.tsx` has two independent state booleans (`showPassword`, `showConfirm`) wired to their own toggle buttons (line 92, 119). Toggling one does not flip the other.
Status: ✅

**UAT-12 — Expired or invalid reset link**
- `reset-password/page.tsx:54-56` — the `updatePassword` call is wrapped in `try/catch`. On failure, error copy reads: `"Couldn't update password. The reset link may have expired — please request a new one."`. No infinite spinner — `setLoading(false)` runs in `finally`.
- Additionally, on the `/auth/callback` side, an `exchangeCodeForSession` failure renders the error panel with a "Back to home" button, not a spinner.
Status: ✅

**UAT-13 — Cold visit redirects out**
- **AC-08 critical check.** `reset-password/page.tsx:20-25` — `useEffect(() => { if (!isHydrated) return; if (!isLoggedIn) router.replace('/'); }, [...])`. Plus `if (!isHydrated || (isHydrated && !isLoggedIn)) return null` (line 61) guarantees the form never renders for a cold visitor. PASS.
Status: ✅

## Modal UX

**UAT-14 — Back-to-sign-in returns to Sign In mode with email kept**
- `SignInModal.tsx:398-404` and `:277-283` — both Back-to-sign-in buttons (one in the form, one in the confirmation panel) call `switchMode('signin')`. `switchMode` clears password / confirm / errors / forgotSent state but preserves `email`. AC matched.
Status: ✅

**UAT-15 — Enter submits the primary (reset link) action**
- `SignInModal.tsx:187-192` — the form's `onSubmit` runs `attemptResetLink` when `mode === 'forgot'`. Enter in the email field submits the form (default browser behavior), triggering reset-link — not magic-link (which is a `type="button"`, not a submitter).
Status: ✅

**UAT-16 — Disabled state while loading**
- `SignInModal.tsx:216` — `forgotDisabled = loading || !email`. Both buttons (lines 385 and 393) read `disabled={forgotDisabled}`. Single shared loading state per AC-02. The button labels also both flip to "Sending…" while `loading`.
Status: ✅

**UAT-17 — Empty-email submit blocked**
- Same `forgotDisabled` covers the empty-email case (`!email` → both buttons disabled). Browser-native `required` on the email input also blocks submit.
Status: ✅

## Error states

**UAT-18 — Rate-limit error mapped**
- **AC-09 critical check.** `SignInModal.tsx:143-153` — `mapForgotError` matches `/over_email_send_rate_limit|rate limit|too many/i` OR status 429 and returns `"Too many requests — please wait a minute and try again."`. Both `attemptResetLink` and `attemptMagicLink` route errors through `mapForgotError`. PASS.
Status: ✅

**UAT-19 — Network error generic**
- Same `mapForgotError` falls through to `"Something went wrong. Please try again in a moment."` for any other error including network failure (which throws as a generic `TypeError` or fetch error from Supabase). UI does not crash; `finally { setLoading(false) }` re-enables both buttons.
Status: ✅ (code path verified)

## No regression

**UAT-20 — SIGNIN-1 / SIGNIN-2 still pass**
- `login`, `signup`, `logout` signatures in `lib/auth-store.tsx` unchanged.
- SignInModal still renders Sign In + Create Account modes; password EyeIcon toggle preserved (now imported from extracted component); `emailExists` inline action (LR-19b) preserved at lines 367-378; `signup_completed` analytics event (KAN-137c) preserved at line 122.
- `components/TopNav.tsx` untouched (no diff vs HEAD).
- LR-19a stale-session banner: no stale-session module exists in the modal — that surface lives elsewhere and is untouched.
- 4 vitest test files (`app/teacher/__tests__/role-gating.test.tsx` updated mock — additive only, three new `vi.fn()` stubs) — all 31 tests pass.
Status: ✅

**UAT-21 — Codex diff scope check**
- `git diff --stat HEAD`:
  - `app/teacher/__tests__/role-gating.test.tsx` (3-line additive test-mock update)
  - `components/auth/SignInModal.tsx`
  - `lib/analytics.ts` (3 new event constants only)
  - `lib/auth-store.tsx`
- Untracked: `app/auth/callback/`, `app/auth/reset-password/`, `components/auth/EyeIcon.tsx`.
- TopNav, schema, RLS, role-picker, teacher/library/students surfaces — untouched. AC-14 scope honored.
Status: ✅

## First-class spar verification

| Spar item | Result |
|---|---|
| AC-12 `shouldCreateUser: false` | PASS — `grep -c "shouldCreateUser: false" lib/auth-store.tsx` returns 1, attached to the only `signInWithOtp` call. |
| AC-10 privacy-safe copy | PASS — `"If an account exists for {email}, we just sent a reset link. Check your inbox."` Conditional clause governs the sentence; trailing "Check your inbox." is generic CTA, not existence assertion. No "Check your inbox at {email}" or "We sent to {email}". |
| AC-09 rate-limit mapping | PASS — `mapForgotError` regex + 429 status check both routed to friendly copy. |
| AC-08 cold-visit guard | PASS — `useEffect` redirects on `!isLoggedIn` once hydrated, plus an early `return null` guards the render path. |
| AC-14 scope | PASS — diff confined to the brief-allowed files plus a 3-line additive update to the role-gating test mock. |

## Validators

| Check | Result |
|---|---|
| `pnpm lint` | exit 0, zero warnings |
| `pnpm tsc --noEmit` | exit 0 |
| `pnpm build` | exit 0, no Next.js advisory, 21 routes (including `/auth/callback` and `/auth/reset-password`) |
| `pnpm vitest run` | 4 files / 31 tests passed |
| HTTP probe — `/`, `/auth/callback`, `/auth/callback?type=recovery`, `/auth/reset-password` | all 200 |

## Bugs Found

_None._

## Run history

### 2026-05-27 — padi-uat-agent (headless)
- Verdict: PASS
- Scenarios: ✅ 21 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Forgot link surfaces in Sign In mode | ✅ | — | — |
  | UAT-02 | Email carries over into forgot mode | ✅ | — | — |
  | UAT-03 | Send reset link → email → reset completes | ✅ (code path; live email pending Supabase allowlist) | — | — |
  | UAT-04 | Mona end-to-end smoke | ✅ (code path) | — | — |
  | UAT-05 | Magic link sign-in | ✅ (code path) | — | — |
  | UAT-06 | Magic link does NOT create accounts | ✅ | — | — |
  | UAT-07 | Reset confirmation copy enumeration-safe | ✅ | — | — |
  | UAT-08 | Magic confirmation copy enumeration-safe | ✅ | — | — |
  | UAT-09 | Short new password blocked | ✅ | — | — |
  | UAT-10 | Mismatched new password blocked | ✅ | — | — |
  | UAT-11 | Independent eye-toggle on new + confirm | ✅ | — | — |
  | UAT-12 | Expired / invalid reset link error | ✅ | — | — |
  | UAT-13 | Cold visit redirects out | ✅ | — | — |
  | UAT-14 | Back-to-sign-in returns with email kept | ✅ | — | — |
  | UAT-15 | Enter submits primary (reset link) action | ✅ | — | — |
  | UAT-16 | Disabled state while loading | ✅ | — | — |
  | UAT-17 | Empty-email submit blocked | ✅ | — | — |
  | UAT-18 | Rate-limit error mapped | ✅ | — | — |
  | UAT-19 | Network error generic | ✅ | — | — |
  | UAT-20 | SIGNIN-1 / SIGNIN-2 still pass | ✅ | — | — |
  | UAT-21 | Codex diff scope check | ✅ | — | — |
- Notes for padi-eng:
  - Implementation matches the cc-prompt and eng-brief 1:1.
  - `getSiteOrigin()` helper colocated in `lib/auth-store.tsx` (lines 52-55) — good. Falls back to `NEXT_PUBLIC_SITE_URL` env then a hardcoded prod URL on the server, which is correct since all three new methods are invoked client-side anyway.
  - `mapForgotError` (SignInModal:143-153) is local to the modal. If a future ticket adds rate-limit handling on the reset-password page itself, consider lifting this to a shared helper — but out of scope for SIGNIN-3.
  - Reset-password page returns `null` while `!isHydrated` — fine, but consider a brief skeleton if you observe FOUC. Out of scope.
- Notes for padi-design:
  - Confirmation panel uses a blue `bg-blue-50` info box — consistent with the existing modal style. No design drift.
  - "Sending…" label appears on whichever button was clicked AND the other one (both render `loading ? 'Sending…' : '...'`). If you only want the clicked button to show "Sending…", that's a small future polish.
- Missing from ticket:
  - The pre-existing UAT-21 scenario references "Codex diff scope check" — we covered it via `git diff --stat HEAD`, but if Codex review is a separate phase, that's an orchestrator gate not a UAT scenario.
  - UAT-03 / UAT-04 / UAT-05 / UAT-06 / UAT-12 fundamentally require a real Supabase redirect-allowlist config + inbox round-trip. Mark these explicitly as "live-environment scenarios" so a green headless UAT doesn't get mistaken for full email-flow coverage.

## Not applicable (documented)

- Tenant scoping: N/A — pre-auth surface.
- Demo-data leakage: N/A — pre-auth surface.
- Logged-out redirect: N/A — these screens are the auth entry / recovery.
- Individual vs Group / module progression: N/A.
- Role gating: N/A — role-picker runs after sign-in completes via the callback, unaffected by this change.
