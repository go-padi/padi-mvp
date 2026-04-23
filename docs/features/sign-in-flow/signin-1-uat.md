---
id: SIGNIN-1-uat
title: "Sign-in modal — two-mode UAT"
type: uat
status: backlog
priority: high
feature: sign-in-flow
parent: SIGNIN-1
created: 2026-04-22
updated: 2026-04-22
---

# Sign-in Modal (SIGNIN-1) — UAT

## Preconditions

- Run on `padi-mvp.vercel.app` (or local `pnpm dev -- --port 3010`).
- Have ready: one existing test account with a known password, one fresh email that has never signed up.
- Know whether Supabase email-confirmation is ON or OFF in the target env (controls UAT-08 expected path).

## Happy Path

**UAT-01 — Sign In with valid credentials**
Given an existing account with a known password
When the user opens the modal from TopNav → enters email + password → clicks **Sign In**
Then the modal closes and TopNav shows `Logged in as …`
Status: ⬜

**UAT-02 — Create a new account (session returned)**
Given Supabase email-confirmation is OFF
When the user flips to Create Account → enters a fresh email, an 8+ char password, and a matching confirm → clicks **Create Account**
Then the modal closes and TopNav shows `Logged in as …` (the user is redirected into `/welcome/role` if applicable)
Status: ⬜

**UAT-03 — Mode toggle both directions**
Given the modal is open in Sign In mode
When the user clicks `Don't have an account? Create one` then clicks `Already have an account? Sign in`
Then title + subtitle + primary-button copy flip both ways, and Password / Confirm Password fields are cleared on each flip
Status: ⬜

## Validation (Create Account)

**UAT-04 — Mismatched passwords block submit**
Given Create Account mode with email + password + non-matching confirm
When the user clicks **Create Account**
Then an inline error reads `Passwords don't match. Please re-enter.` and **no** network request to Supabase `auth/signup` is made
Status: ⬜

**UAT-05 — Short password blocked**
Given Create Account mode with a 7-character password
When the user clicks **Create Account**
Then an inline error reads `Password must be at least 8 characters.` and no signup request is made
Status: ⬜

## Show / hide password

**UAT-06 — Independent visibility per field**
Given Create Account mode with both Password and Confirm Password filled
When the user clicks the eye icon on Password
Then Password becomes visible (`type="text"`) and Confirm Password remains masked (`type="password"`). Clicking eye on Confirm reverses: Confirm visible, Password stays in its own state.
Status: ⬜

**UAT-07 — Visibility resets on mode flip**
Given Password visibility is toggled ON in Create Account
When the user flips to Sign In then back to Create Account
Then both Password and Confirm Password default back to masked and fields are empty
Status: ⬜

## Post-signup paths

**UAT-08 — Email-confirmation path flips to Sign In**
Given Supabase email-confirmation is ON
When a fresh signup succeeds but returns no session
Then mode flips back to Sign In, the email is pre-filled, password fields are cleared, and the info banner reads `Check your email to confirm your account, then sign in.`
Status: ⬜

## Error States

**UAT-09 — Wrong password on existing account**
Given an existing email with a wrong password
When the user clicks **Sign In**
Then the existing error banner surfaces (wording per current `auth-store` mapping) and focus stays in the modal
Status: ⬜

**UAT-10 — Signup with an already-registered email**
Given Create Account mode with an email that already exists
When the user submits valid passwords
Then the existing mapped "email already registered" error surfaces; mode does not auto-flip
Status: ⬜

## Close affordances

**UAT-11 — Esc / backdrop / X close in both modes**
Given the modal is open
When the user presses Esc, clicks the overlay backdrop, or clicks the X button in Sign In mode, then repeats in Create Account mode
Then each action closes the modal and body scroll is restored
Status: ⬜

## No regression

**UAT-12 — Codex diff scope check**
Given the merged PR for SIGNIN-1
When Codex reviews the diff
Then changes are scoped to `components/auth/SignInModal.tsx` only — no edits to `lib/auth-store.tsx`, `components/TopNav.tsx`, routes, schema, or RLS
Status: ⬜

## Not applicable (documented)

- Tenant scoping: N/A — modal does not query tenant data.
- Demo-data leakage: N/A — pre-auth surface.
- Logged-out redirect: N/A — the modal IS the auth entry point.
- Individual vs Group / module progression: N/A.

## Bugs Found

_None yet — populate inline as scenarios fail._
