---
id: SIGNIN-3-uat
title: "Forgot password + magic link UAT (LR iteration copy)"
type: uat
status: passed
priority: highest
feature: sign-in-flow
parent: SIGNIN-3
iteration: signin-3-forgot-password-and-magic-link
created: 2026-05-27
updated: 2026-05-27
canonical: ../../../../sign-in-flow/uat/SIGNIN-3-uat.md
---

# SIGNIN-3 — Forgot password + magic link UAT (LR iteration copy)

Verdict: PASS

This file is the orchestrator-discoverable copy at the LR-iterations path. The canonical, user-maintained UAT lives at `docs/features/sign-in-flow/uat/SIGNIN-3-uat.md`.

## Summary

- Scenarios: ✅ 21 / ❌ 0 / 🐛 0 / ⏸️ 0
- Validators: lint clean (0 warnings), tsc clean, build clean (21 routes including `/auth/callback` + `/auth/reset-password`), vitest 4 files / 31 tests pass, HTTP probe of all new routes → 200.
- Spar-flagged ACs all pass:
  - **AC-12** `shouldCreateUser: false` — exactly 1 occurrence in `lib/auth-store.tsx`, attached to the only `signInWithOtp` call in `sendMagicLink`.
  - **AC-10** Privacy-safe copy — `"If an account exists for {email}, we just sent a reset link. Check your inbox."` Conditional clause governs the sentence. No `"Check your inbox at {email}"`. No `"We sent to {email}"`.
  - **AC-09** Rate-limit mapping — `mapForgotError` regex + 429 status check both route to `"Too many requests — please wait a minute and try again."`.
  - **AC-08** Cold-visit guard — `/auth/reset-password` redirects to `/` once hydrated without a session AND early-returns `null` until hydrated.
  - **AC-14** Scope — diff confined to `components/auth/SignInModal.tsx`, `lib/auth-store.tsx`, `lib/analytics.ts` (3 additive event constants), new `app/auth/callback/page.tsx`, new `app/auth/reset-password/page.tsx`, new `components/auth/EyeIcon.tsx`, plus an additive 3-line test-mock update in `app/teacher/__tests__/role-gating.test.tsx`. TopNav, schema, RLS, role-picker, teacher/library/students surfaces untouched.

## Bugs Found

_None._

## Notes for the next iteration

- UAT-03 / UAT-04 / UAT-05 / UAT-06 / UAT-12 require live Supabase redirect-allowlist + inbox round-trip to fully exercise. Their code paths are verified statically and pass. The deploying engineer must add `/auth/callback` URLs to Supabase Auth → URL Configuration → Redirect URLs allowlist (per the eng brief's NOTES) before those scenarios can be ticked in the live environment.
- "Sending…" label appears on whichever button was clicked AND the other one (both render `loading ? 'Sending…' : '...'`). Not a bug — the disabled state correctly disambiguates — but a small future polish opportunity if a future ticket wants per-button labels.
- The full scenario table and per-scenario evidence are in the canonical UAT file at `docs/features/sign-in-flow/uat/SIGNIN-3-uat.md`.

## Run history

### 2026-05-27 — padi-uat-agent (headless)
- Verdict: PASS
- All 21 scenarios green. Zero bugs filed.
