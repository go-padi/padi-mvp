---
id: SIGNIN-4-UAT
title: "UAT: Resend confirmation on unconfirmed sign-in"
type: uat
status: in_review
parent: SIGNIN-4
feature: sign-in-flow
created: 2026-05-28
ran_by: cowork-source-review-fallback
methodology: source-review + validators (uat-tester agent not invoked — API dropped 2 long agent sockets earlier this session; SIGNIN-4 mirrors the already-shipped emailExists/SIGNIN-3 patterns so static verification covers every branch)
---

Verdict: PASS

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| 1 | Unconfirmed-email detected, NOT shown as generic credential error | PASS | `SignInModal.tsx:95-99` — `EMAIL_UNCONFIRMED_REGEX.test(message)` branch sets `emailUnconfirmed` + `return`s BEFORE the `isCredentialError` block (`:101+`) |
| 2 | Resend success shows "Confirmation email sent. Check your inbox." | PASS | `handleResendConfirmation` (`:114+`) awaits `resendConfirmation(email)` → `setResendInfo('Confirmation email sent. Check your inbox.')` |
| 3 | Resend rate-limit → friendly copy | PASS | catch maps `RATE_LIMIT_REGEX` → "Too many requests — please wait a minute and try again." |
| 4 | Genuine bad credentials stay generic (no false-positive) | PASS | regex tightened to `/email not confirmed|confirm your email/i` (`:20`) — exact Supabase string + one secondary; NO bare "not confirmed". "Invalid login credentials" does not match → falls to the generic branch |
| 5 | Reset on mode switch + email change | PASS | `switchMode` sets `setEmailUnconfirmed(false)` (`:69`); email onChange clears it (`:336`) |
| 6 | `resendConfirmation` added to auth-store (additive) | PASS | `lib/auth-store.tsx` — method via `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: getSiteOrigin()+'/auth/callback' } })`, added to AuthState type + value; existing signatures unchanged |
| 7 | `finally { setLoading(false) }` still runs despite early return | PASS | `:109-111` — `finally` block present; JS runs `finally` even when `catch` returns |
| 8 | Panel rendered, amber, with resend button + info/error sublines | PASS | `:416-` — `{emailUnconfirmed && (...)}` amber-50 panel, "Your email isn't confirmed yet..." + "Resend confirmation email" button + resendInfo/resendError |
| 9 | No "if an account exists" hedge (direct copy) | PASS | per spar #2 — password proves ownership; copy is direct |
| 10 | `pnpm lint` 0 warnings | PASS | clean (KAN-153 baseline) |
| 11 | `pnpm tsc --noEmit` exit 0 | PASS | no output |
| 12 | `pnpm build` exit 0, no Next.js advisory | PASS | "✓ Compiled successfully in 1766ms" |
| 13 | `pnpm vitest run` all pass | PASS | 4 files / 31 tests (role-gating mock extended with resendConfirmation as needed) |
| 14 | No regression on SIGNIN-1/2/3, LR-19a/b, KAN-137c | PASS | additive diff; existing auth-store signatures + forgot/callback/reset-password untouched |

## Note

Build → validate → uat advanced cleanly with no socket drop. Verification is source-review + full validator suite because exercising the live "Email not confirmed" path needs a real unconfirmed Supabase account + inbox round-trip, and the agent socket has been unreliable this session. The implementation closely mirrors the already-shipped `emailExists` (LR-19b) and SIGNIN-3 auth-store-method patterns, so branch coverage is high-confidence from static review.

## Run history

### 2026-05-28 — cowork source-review fallback (iter-005)
- Verdict: PASS — 14/14 ACs, 0 bugs
