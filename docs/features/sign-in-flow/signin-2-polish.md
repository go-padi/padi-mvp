---
id: SIGNIN-2
title: "[Sign-in] SIGNIN-1 polish — eye-button a11y + mobile autofill + telemetry marker"
type: task
status: in-progress
priority: high
feature: sign-in-flow
parent: SIGNIN-1
buildloop_iteration: 1
buildloop_loop_id: 2026-05-08T21:29:47Z-13de
created: 2026-05-08
updated: 2026-05-08
---

# SIGNIN-2 — SIGNIN-1 polish

## Goal

Tighten three quality gaps in the shipped `components/auth/SignInModal.tsx` that affect activation conversion: eye-button accessibility, mobile autofill, and a telemetry marker for the activation-event follow-up. Strictly additive — no behavior changes to login/signup flows.

## Background

SIGNIN-1 (commit `10eecf9`, 2026-04-22) shipped the two-mode signin/signup modal. BuildLoop iteration 1's PM/Design spar surfaced six gaps against the source ticket; three of those are still open on `main` and small enough to ship as a single follow-up:

- **A11y:** the eye-button hit area is ~28×28 (currently `p-1`) — fails mobile 44×44. Icon color is `text-gray-500` (~3:1 contrast) — fails WCAG AA non-text 4.5:1.
- **Mobile autofill:** email + password fields lack `autoComplete`, `autoCapitalize`, and `inputMode`, so iOS keychain doesn't surface saved passwords. Returning users on mobile retype = bounce risk.
- **Activation-telemetry marker:** no event is emitted on signup-success today, and there's no marker pointing at where the future event should live. Without a marker, the follow-up ticket has no concrete anchor.

**Out of this ticket (deferred):**
- AC-15 of SIGNIN-1's spar refinement (visible "Forgot password?" link). Blocked: the `/auth/reset-password` route exists on branch `followup-parent-redirect-resolution` (commit `94b1035`) but has not merged to main. Once that lands, file as SIGNIN-3.

## Requirements

### Eye button (R1)
1. Wrap the inline SVG in a `<button>` whose tap area is ≥44×44. Use `p-2` padding around the `h-5 w-5` icon (gives ~36×36 inner) plus the existing `right-2 top-1/2 -translate-y-1/2` positioning, then bump the input's right padding from `pr-10` to `pr-12` to make room.
2. Apply `text-gray-600 hover:text-gray-700` (≥4.5:1 contrast on white).
3. Preserve all existing button attributes: `type="button"`, `aria-label`, `aria-pressed`, independent state per field.

### Mobile autofill (R2)
4. Email input: add `autoComplete="email"`, `autoCapitalize="off"`, `inputMode="email"`. Keep existing `type="email"`.
5. Password input in **Sign In** mode: `autoComplete="current-password"`.
6. Password input in **Create Account** mode: `autoComplete="new-password"`.
7. Confirm Password input (Create Account only): `autoComplete="new-password"`.
8. The `autoComplete` value on the password field must depend on `mode`. When `mode === 'signin'` use `current-password`; when `'signup'` use `new-password`.

### Activation-telemetry marker (R3)
9. In `attemptSignup`, on the success branch where `session?.access_token` is truthy and the modal is about to close, leave exactly this comment immediately before `onClose()`:
   ```
   // TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands
   ```
10. No telemetry library, no event call, no new dependency. Comment only.

## Acceptance Criteria

- **AC-01** Eye button (Password and Confirm Password) has a tap area ≥44×44 px (verifiable via `getBoundingClientRect()`); icon color is `text-gray-600`, hover is `text-gray-700`.
- **AC-02** Email input has `autoComplete="email"`, `autoCapitalize="off"`, `inputMode="email"` attributes set in the rendered DOM.
- **AC-03** In Sign In mode, the password input has `autoComplete="current-password"`. In Create Account mode, both Password and Confirm Password have `autoComplete="new-password"`.
- **AC-04** The signup success branch (where the modal closes after a session is returned) contains the exact comment `// TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands` immediately before the `onClose()` call.
- **AC-05** No regression — all SIGNIN-1 UAT scenarios (`signin-1-uat.md` UAT-01 through UAT-12) still pass behaviorally.
- **AC-06** Scope: only `components/auth/SignInModal.tsx` is modified. `lib/auth-store.tsx`, `components/TopNav.tsx`, routes, schema, and RLS untouched.

## Files to touch

- `components/auth/SignInModal.tsx` — only file modified.

## Files NOT to touch

- `lib/auth-store.tsx`
- `components/TopNav.tsx`
- Anything under `app/auth/` (forgot-password not in scope)
- Anything under `supabase/` or `app/api/`

## Out of scope

- Visible "Forgot password?" link (deferred to SIGNIN-3 once reset-password route reaches main).
- Actually emitting a telemetry event (marker comment only).
- Any wording / copy changes outside the items above.
- Any change to mode-toggle, validation, error-mapping, or post-signup logic.

## Estimated complexity

**S** — additive attribute and class-name changes on one file; no new logic.
