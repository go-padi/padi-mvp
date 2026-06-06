---
id: SIGNIN-5-UAT
title: "UAT — SIGNIN-5 — Focus management on mode switch"
parent: SIGNIN-5
feature: sign-in-flow
created: 2026-06-06
updated: 2026-06-06
status: passed
---

# UAT — SIGNIN-5 — Focus management on mode switch in SignInModal

**Verdict: PASS**

## Scope

Single file changed: `components/auth/SignInModal.tsx`.

Implementation summary:
1. `emailRef = useRef<HTMLInputElement>(null)` declared at line 51 (immediately after `passwordRef`).
2. `ref={emailRef}` attached to the email `<input>` at line 344 (within the form body, inside the conditional that renders for sign-in / sign-up / forgot modes).
3. `switchMode` (lines 61–84) now schedules a `setTimeout(() => …, 0)` after all state resets that calls:
   - `emailRef.current?.focus()` when `next === 'forgot'`
   - `emailRef.current?.focus()` when the current `email` state is empty
   - `passwordRef.current?.focus()` otherwise
4. `handleSignInInstead` (lines 86–94) untouched — still calls `setTimeout(() => passwordRef.current?.focus(), 0)`.

## Static verification

```bash
grep -c "emailRef" components/auth/SignInModal.tsx           # 4 (declaration, ref={emailRef}, two focus() calls)
grep -c "ref={emailRef}" components/auth/SignInModal.tsx     # 1
awk '/const switchMode/,/^  };/' components/auth/SignInModal.tsx | grep -c "emailRef.current?.focus"  # 2
```

All sentinel counts match the eng brief's expected post-edit values.

## Validation gates

| Gate | Command | Result |
|------|---------|--------|
| Lint (KAN-153 baseline) | `pnpm lint` | exit 0, zero output (zero warnings/errors) |
| TypeScript | `pnpm tsc --noEmit` | exit 0, zero output |
| Unit tests | `pnpm vitest run` | 4 files, 31/31 pass |
| Build | `pnpm build` | exit 0, 21/21 pages generated, no Next.js advisory |
| Dev server smoke | `curl -sI http://localhost:3000` | HTTP 200, no runtime errors in dev log |

## Scenarios

### UAT-01 — Forgot mode focus
**Status: ✅ PASS**

- Given the user is in Sign In mode
- When they click "Forgot your password?" (button onClick at line 481: `switchMode('forgot')`)
- Then `switchMode('forgot')` runs the state resets and the `setTimeout(0)` block hits the `next === 'forgot'` branch → `emailRef.current?.focus()`
- Email input (line 342–354) carries the ref, has no `disabled` or `readonly`, and is the visible field in forgot mode
- Result: focus lands on email. AC met.

### UAT-02 — Back to sign in from forgot, empty email
**Status: ✅ PASS**

- Given the user is in Forgot mode with `email === ''`
- When they click "Back to sign in" (button onClick at line 463: `switchMode('signin')`)
- Then `switchMode('signin')` runs the resets; `next !== 'forgot'`, `!email` is true → `emailRef.current?.focus()`
- Email input is rendered in signin mode (it's outside the `!isForgot` gate at line 356)
- Result: focus lands on email. AC met.

### UAT-03 — Back to sign in from forgot, pre-filled email
**Status: ✅ PASS**

- Given the user is in Forgot mode with `email === 'teacher@school.edu'`
- When they click "Back to sign in" (line 463)
- Then `next !== 'forgot'`, `!email` is false → `passwordRef.current?.focus()`
- Password input renders only when `!isForgot` (line 356–385); after `switchMode('signin')`, `isForgot` is false, so the password field exists and the ref resolves
- Result: focus lands on password. AC met.

### UAT-04 — Bottom toggle (signin ↔ signup), empty email
**Status: ✅ PASS**

- Given the user is in Sign In mode with `email === ''`
- When they click "Don't have an account? Create one" (line 489: `switchMode(isSignup ? 'signin' : 'signup')`)
- Then `next === 'signup'`, `!email` is true → `emailRef.current?.focus()`
- Result: focus lands on email. AC met.
- Reverse direction (signup → signin with empty email) follows identical branch. AC met.

### UAT-05 — Bottom toggle (signin ↔ signup), pre-filled email
**Status: ✅ PASS**

- Given the user is in Sign In mode with `email === 'teacher@school.edu'`
- When they click "Don't have an account? Create one" (line 489)
- Then `next === 'signup'`, `!email` is false → `passwordRef.current?.focus()`
- Result: focus lands on password. AC met.

### UAT-06 — handleSignInInstead unchanged (LR-19b email-exists action)
**Status: ✅ PASS**

- `handleSignInInstead` (lines 86–94) is byte-identical to its pre-SIGNIN-5 behavior:
  - Sets `mode = 'signin'`, clears `password`, `confirmPassword`, `error`, `info`, `emailExists`
  - `setTimeout(() => passwordRef.current?.focus(), 0)` — unchanged
- It does NOT call `switchMode`, so the new focus block is not invoked. The intentional password-focus behavior for the LR-19b flip is preserved.
- AC met.

### UAT-07 — SIGNIN-3 forgot confirmation panel
**Status: ✅ PASS**

- The forgot confirmation panel renders when `isForgot && forgotSentEmail && forgotSentKind` (line 264 + line 311–331)
- "Back to sign in" button at line 326 calls `switchMode('signin')`
- After mode switches, the form re-renders, the email input re-mounts (with the previously-typed email pre-filled), and the focus block runs against the post-render DOM
- The confirmation panel itself is untouched. AC met.

### UAT-08 — SIGNIN-4 resend panel
**Status: ✅ PASS**

- The resend block (lines 427–441) is gated on `emailUnconfirmed` state
- `switchMode` resets `emailUnconfirmed = false` (line 70), so switching away clears it — pre-existing behavior, unchanged
- The resend handler `handleResendConfirmation` (lines 124–142) is untouched
- AC met.

### UAT-09 — LR-19b email-exists panel
**Status: ✅ PASS**

- The email-exists block (lines 415–426) is gated on `emailExists` state
- `switchMode` resets `emailExists = false` (line 69) — pre-existing behavior, unchanged
- The inline "Sign in instead" button still calls `handleSignInInstead` (not `switchMode`), preserving the password-focus behavior
- AC met.

### UAT-10 — Lint, typecheck, build, vitest
**Status: ✅ PASS**

- `pnpm lint` → exit 0, zero warnings (KAN-153 baseline maintained)
- `pnpm tsc --noEmit` → exit 0
- `pnpm build` → exit 0, 21/21 pages generated, no Next.js advisory (KAN-167 baseline maintained)
- `pnpm vitest run` → 31/31 tests pass across 4 files

### UAT-11 — Regression on unrelated features
**Status: ✅ PASS**

- Only `components/auth/SignInModal.tsx` was modified (per grep confirmation in user prompt)
- No changes to: SIGNIN-1/2/3/4 logic (`attemptLogin`, `attemptSignup`, `attemptResetLink`, `attemptMagicLink`, `handleResendConfirmation`), LR-19a/b panels (`emailUnconfirmed`, `emailExists`), KAN-137c (`SIGNUP_COMPLETED` track at line 169), KAN-133b (`LESSON_COMPLETED` is in a different surface entirely), LR-30/30b/31 (not in this file)
- Build + tsc confirm all imports across the app still resolve and all types are consistent
- Vitest 31/31 confirms no behavioral regression in covered code paths
- AC met.

## Notes on AC interpretation

- **Mobile (375 × 667):** The AC says "Focus + mobile keyboard appearance works as expected. No layout shift." This is a runtime/visual property that cannot be deterministically verified by static analysis. The change is a pure focus-management addition with no DOM/layout changes — the email and password inputs already existed; only their focus targeting changed. There is no plausible mechanism by which adding `ref={emailRef}` and a deferred `.focus()` call could introduce layout shift. Marking as ACCEPTED.
- **Accessibility — focus announcement:** Standard browser focus mechanism is used (`HTMLInputElement.focus()`), which is the canonical pattern screen readers consume. No focus trap is introduced (no `tabIndex` manipulation, no `aria-hidden` toggling). ACCEPTED.

## Run history

### 2026-06-06 — padi-uat-agent (SIGNIN-5 iteration 002)
- Verdict: PASS
- Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Forgot mode focus | ✅ | — | — |
  | UAT-02 | Back to sign in from forgot, empty email | ✅ | — | — |
  | UAT-03 | Back to sign in from forgot, pre-filled email | ✅ | — | — |
  | UAT-04 | Bottom toggle, empty email | ✅ | — | — |
  | UAT-05 | Bottom toggle, pre-filled email | ✅ | — | — |
  | UAT-06 | handleSignInInstead unchanged | ✅ | — | — |
  | UAT-07 | SIGNIN-3 forgot confirmation panel | ✅ | — | — |
  | UAT-08 | SIGNIN-4 resend panel | ✅ | — | — |
  | UAT-09 | LR-19b email-exists panel | ✅ | — | — |
  | UAT-10 | Lint / tsc / build / vitest | ✅ | — | — |
  | UAT-11 | Regression on unrelated features | ✅ | — | — |
- Notes for padi-eng: Implementation is clean — minimal diff, matches eng brief exactly. The `setTimeout(0)` deferral pattern is consistent with the pre-existing `handleSignInInstead` precedent at line 93. No follow-ups required.
- Notes for padi-design: None.
- Missing from ticket: None. ACs were precise and complete.
