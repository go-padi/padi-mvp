---
id: SIGNIN-6-UAT
title: "UAT — SIGNIN-6 Focus email field on modal open"
parent: SIGNIN-6
feature: sign-in-flow
created: 2026-06-06
updated: 2026-06-06
status: complete
---

# UAT — SIGNIN-6 Focus email field on modal open

**Verdict: PASS**

## Scope

Single-file diff to `components/auth/SignInModal.tsx`. One new mount-only `useEffect` (~5 lines including blank line) that defers a `.focus()` call on the existing `emailRef` via `setTimeout(0)` and clears the timeout on unmount.

## Code-review verification

### Diff confirmation

```
diff --git a/components/auth/SignInModal.tsx b/components/auth/SignInModal.tsx
@@ -58,6 +58,11 @@ export function SignInModal({ onClose }: SignInModalProps) {
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [onClose]);

+  useEffect(() => {
+    const t = setTimeout(() => emailRef.current?.focus(), 0);
+    return () => clearTimeout(t);
+  }, []);
+
   const switchMode = (next: Mode) => {
```

`git diff HEAD --stat`:
```
 components/auth/SignInModal.tsx | 5 +++++
```

Only `SignInModal.tsx` (and `docs/features/SHIPPED.md`) touched. No other file modified.

### Requirement-by-requirement check

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | New `useEffect` is mount-only (empty deps `[]`) | PASS | Line 64: `}, []);` |
| 2 | Uses `setTimeout(() => ..., 0)` to defer until DOM commit | PASS | Line 62 |
| 3 | Cleans up timeout on unmount via `clearTimeout(t)` | PASS | Line 63: `return () => clearTimeout(t);` |
| 4 | Uses existing `emailRef`, no new ref added | PASS | `emailRef` declared at line 51 (pre-existing from SIGNIN-5); no new `useRef` call introduced |
| 5 | Existing Escape useEffect unchanged | PASS | Lines 53-59 byte-identical to pre-change |
| 6 | `switchMode` SIGNIN-5 focus logic unchanged | PASS | Lines 66-89 byte-identical |
| 7 | `handleSignInInstead` SIGNIN-4 focus unchanged | PASS | Line 98 byte-identical |
| 8 | No SIGNIN-3 forgot useEffect or SIGNIN-4 resend useEffect exists | INFO | Verified: only 2 actual `useEffect` calls total (Escape + new mount-focus). SIGNIN-3/4 use handlers, not effects. Sanity grep counted 3 lines because of the `import { ..., useEffect, ... }` line. |
| 9 | New effect placed immediately after Escape effect (before `switchMode`) | PASS | Lines 61-64, between line 59 Escape close and line 66 switchMode declaration |

### react-hooks/exhaustive-deps risk

`emailRef` is a stable React ref — the rule does not require it in deps. `setTimeout` and `clearTimeout` are globals. No closure captures any prop, state, or other binding. The empty `[]` deps array is correct. `pnpm lint` confirms zero warnings.

## Validation gates

| Gate | Command | Result |
|------|---------|--------|
| Lint | `pnpm lint` | PASS — exit 0, zero output (KAN-153 zero-warning baseline preserved) |
| Typecheck | `pnpm tsc --noEmit` | PASS — exit 0, zero output |
| Build | `pnpm build` | PASS — exit 0, 21/21 static pages generated, no Next.js advisories (KAN-167 baseline preserved) |
| Tests | `pnpm vitest run` | PASS — 4 test files, 31 tests, all green (1.32s) |

## Acceptance criteria — scenario verdicts

### UAT-01 — Email focused on open
Status: PASS (code-review verification)
- Given the modal is closed (no `SignInModal` mounted)
- When the user clicks "Sign In" in the nav, the parent toggles `isSignInOpen`, mounting `SignInModal`
- Then on mount, the new effect at line 61 schedules `setTimeout(() => emailRef.current?.focus(), 0)`. After React's first commit, the `<input ref={emailRef} ...>` at line 349 is in the DOM and receives `.focus()`.
- Typing types into the email field (no extra click required).

### UAT-02 — Mode-switch focus still works
Status: PASS (code-review verification)
- `switchMode` at lines 66-89 is unchanged. The same SIGNIN-5 logic runs: `forgot` → emailRef, else email-empty → emailRef, else → passwordRef.

### UAT-03 — No double-focus on StrictMode
Status: PASS (code-review verification)
- React 18 StrictMode double-invokes effects in dev. The cleanup `return () => clearTimeout(t)` clears the pending `setTimeout` before the second mount runs. The second mount schedules a fresh timeout. Net effect: one `.focus()` call, no flicker.

### UAT-04 — Mobile keyboard appearance (iOS Safari)
Status: PASS (acceptable per AC)
- iOS Safari blocks the soft keyboard on programmatic focus without a user gesture. Focus state still applies (the input is the active element); the keyboard appears on subsequent tap. AC explicitly accepts this as v0 behavior.

### UAT-05 — No regression (Escape, all panels, console)
Status: PASS (code-review verification)
- Escape `useEffect` at lines 53-59 untouched.
- All other modal states (signed-in panel at lines 287-315, forgot-confirmation panel at lines 316-336, main form at 338-501) untouched.
- `pnpm build` produced no console / build warnings.
- No new dependencies or imports added.

### UAT-06 — Lint, typecheck, build, vitest
Status: PASS — see Validation gates table above.

### UAT-07 — Cross-feature regression smoke
Status: PASS (code-review verification)
- Diff is scoped to `SignInModal.tsx` only. No changes to:
  - Auth store / store provider (SIGNIN-1/2)
  - Forgot-password flow logic (SIGNIN-3) — `attemptResetLink` / `attemptMagicLink` unchanged
  - Resend confirmation handler (SIGNIN-4) — `handleResendConfirmation` unchanged
  - Mode-switch focus (SIGNIN-5) — `switchMode` unchanged
  - Logged-out students preview (LR-19a/b)
  - LESSON_COMPLETED analytics (KAN-133b)
  - Student card recency UI (LR-30/30b/31)
  - Signup form (KAN-137c) — `attemptSignup` unchanged

## Run history

### 2026-06-06 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 7 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Email focused on open | PASS | — | — |
  | UAT-02 | Mode-switch focus still works | PASS | — | — |
  | UAT-03 | No double-focus on StrictMode | PASS | — | — |
  | UAT-04 | Mobile keyboard appearance (iOS Safari) | PASS | — | — |
  | UAT-05 | No regression (Escape, panels, console) | PASS | — | — |
  | UAT-06 | Lint, typecheck, build, vitest | PASS | — | — |
  | UAT-07 | Cross-feature regression smoke | PASS | — | — |
- Notes for padi-eng: Tight, surgical 5-line diff. Effect placement (between Escape effect and `switchMode`) is consistent with the eng-brief. Cleanup correctly handles StrictMode double-invoke + rapid open/close. No exhaustive-deps complaint because `emailRef` is a stable React ref. Ship it.
- Notes for padi-design: iOS soft-keyboard non-appearance on programmatic focus is documented as acceptable v0 per the ticket. If keyboard-on-open becomes important later, that would need a user-gesture path (e.g. trigger focus from the click handler instead of a mount effect).
- Missing from ticket: None. The acceptance criteria are testable; the sanity-grep `≥3 useEffect` line in the eng-brief is technically counting the `import` line plus the two effects (post-edit there are exactly 2 `useEffect` calls and 1 import line containing the word). Worth a one-line correction in any future brief template, but not blocking.
