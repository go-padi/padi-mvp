---
id: SIGNIN-1
title: "[Sign-in] Split Sign In and Create Account modes with confirm password + show/hide"
type: story
status: backlog
priority: highest
feature: sign-in-flow
uat: ./signin-1-uat.md
created: 2026-04-22
updated: 2026-04-22
---

### Goal

Redesign `components/auth/SignInModal.tsx` into an intuitive two-mode flow in-place (same modal, no new route). One default state for existing users, a distinct create-account state for new users, with the affordances users expect — confirm password, show/hide toggles, clear mode signaling.

### Background

Current modal shows a single Email + Password form. Users without an account are expected to type a brand-new email/password and hit a secondary link — there's no confirm-password field, so typos silently create broken accounts, and passwords can't be revealed. Reported as "sign in is broken" by multiple users.

Full CC prompt with exact spec: see [`./cc-prompt-signin-ux.md`](./cc-prompt-signin-ux.md).

### Requirements (summary — see CC prompt for full detail)

1. Local `mode: 'signin' | 'signup'` state, default `'signin'`, toggled via bottom link. Clears `error`, `info`, `password`, `confirmPassword` on flip.
2. **Sign In mode:** Email + Password, primary button `Sign In`, bottom link to Create Account.
3. **Create Account mode:** Email + Password + Confirm Password, `minLength={8}`, inline validation for mismatch and length, primary button `Create Account`, bottom link to Sign In.
4. Post-signup: if session returned → close modal; if no session (email-confirmation case) → flip back to Sign In, pre-fill email, show info banner.
5. **Show/hide password** on both Password and Confirm Password, inline SVG eye icons (no new deps), independent per-field state.
6. Preserve Escape, outside-click, and X close behaviors in both modes.

### Acceptance Criteria

- **Sign In mode (default)** — Modal opens in Sign In; clicking "Create one" flips to Create Account with fields cleared.
- **Create Account validation** — Mismatched passwords show inline error and do NOT call `signup`. <8-char password shows inline error and does NOT call `signup`.
- **Show/hide independence** — Revealing Password must not reveal Confirm Password and vice versa.
- **Email-confirmation path** — Successful signup with no returned session flips back to Sign In, pre-fills email, clears password fields, shows info banner.
- **No regression** — Existing Sign In flow closes modal on success and shows "Logged in as …" in TopNav.
- **Close affordances** — Esc / backdrop / X close the modal in either mode.
- **No changes outside** `components/auth/SignInModal.tsx` — `lib/auth-store.tsx`, `components/TopNav.tsx`, routes, DB, RLS all untouched. Codex diff review required.

### Out of Scope

- Forgot password flow
- Magic link / OAuth
- Password strength meter
- Any DB or RLS change
- Any change to `lib/auth-store.tsx`

### Files to touch

- `components/auth/SignInModal.tsx` — rewrite the component body. Keep exported name (`SignInModal`) and props (`{ onClose: () => void }`) identical.

### Verification

1. `pnpm lint` — clean
2. `npx tsc --noEmit` — clean
3. Manual QA on `pnpm dev -- --port 3010` following the 10-step checklist in the CC prompt.
4. Codex review of the `SignInModal.tsx` diff before merge.

### Notes

- Follows the existing CC handoff pattern — this ticket is the tracked record, the prompt doc is the implementation brief.
- Ships ahead of / in parallel with the remaining KAN-127 role-split work. Independent of the epic's "ship as one release" bundle.
