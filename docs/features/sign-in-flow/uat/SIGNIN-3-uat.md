---
id: SIGNIN-3-uat
title: "Forgot password + magic link UAT"
type: uat
status: backlog
priority: highest
feature: sign-in-flow
parent: SIGNIN-3
created: 2026-05-26
updated: 2026-05-26
---

# SIGNIN-3 — Forgot password + magic link UAT

## Preconditions

- Run on `padi-mvp.vercel.app` (or local `pnpm dev -- --port 3010`).
- Supabase Auth redirect allowlist includes the env's `/auth/callback` URL — without this, the email link 404s on the Supabase side.
- Have ready:
  - One existing account with a known password (any test teacher / parent).
  - A fresh email you control that has never signed up.
  - `mona.iyer@verizon.net` — auth row was deleted 2026-05-26, ideal canonical end-to-end target.
- An inbox you can actually read in real time (Gmail tab, etc.).

## Happy path — password reset

**UAT-01 — Forgot link surfaces in Sign In mode**
Given the modal is open in Sign In mode
When the user looks below the primary `Sign In` button
Then a `Forgot your password?` link is visible and tab-reachable
Status: ⬜

**UAT-02 — Email carries over into forgot mode**
Given the user has typed `someone@example.com` into Email in Sign In mode
When they click `Forgot your password?`
Then forgot mode renders with the same email pre-filled
Status: ⬜

**UAT-03 — Send reset link → email received → reset flow completes**
Given forgot mode with a valid existing email
When the user clicks **Send reset link**, then opens the email, clicks the link, lands on `/auth/reset-password`, enters a new 8+ char password and matching confirm, and clicks the primary button
Then the password is updated, a brief success banner shows, the user is redirected to `/`, and signing in with the new password from a fresh modal session works
Status: ⬜

**UAT-04 — Mona end-to-end smoke**
Given `mona.iyer@verizon.net` (deleted 2026-05-26)
When the user signs up fresh, then signs out, then runs the full forgot-password flow on that email
Then the entire round-trip succeeds with no engineering intervention
Status: ⬜

## Happy path — magic link

**UAT-05 — Magic link sign-in**
Given forgot mode with a valid existing email
When the user clicks **Email me a magic sign-in link**, opens the email, and clicks the link
Then the user lands on `/` already signed in (TopNav shows `Logged in as …`) without entering a password
Status: ⬜

**UAT-06 — Magic link does not create accounts**
Given forgot mode with an email that has NEVER signed up
When the user clicks **Email me a magic sign-in link**
Then no new `auth.users` row is created (verify via Supabase) — UI still shows the privacy-safe confirmation
Status: ⬜

## Privacy & enumeration

**UAT-07 — Confirmation copy is enumeration-safe (reset)**
Given forgot mode
When the user clicks **Send reset link** with (a) a valid email, then (b) an email that has never signed up
Then BOTH cases show the same `If an account exists for {email}, we just sent a reset link. Check your inbox.` panel
Status: ⬜

**UAT-08 — Confirmation copy is enumeration-safe (magic)**
Same as UAT-07 but for **Email me a magic sign-in link**
Status: ⬜

## Validation — reset-password page

**UAT-09 — Short new password blocked**
Given the user is on `/auth/reset-password` via a fresh reset email click
When they enter a 7-char password
Then an inline error reads `Password must be at least 8 characters.` and no `updateUser` request is made
Status: ⬜

**UAT-10 — Mismatched new password blocked**
Given valid 8+ char password but a non-matching confirm
When the user submits
Then an inline error reads `Passwords don't match. Please re-enter.` and no `updateUser` request is made
Status: ⬜

**UAT-11 — Independent eye-toggle on new + confirm**
Given both password fields filled on `/auth/reset-password`
When the user toggles the eye icon on New Password
Then only New Password becomes visible; Confirm Password stays masked. Toggling Confirm reverses independently.
Status: ⬜

**UAT-12 — Expired or invalid reset link**
Given a reset email link clicked after it has expired (or with a tampered code)
When the user lands on `/auth/reset-password`
Then a generic error reads `Couldn't update password. The reset link may have expired — please request a new one.` with a link back home; no infinite spinner
Status: ⬜

**UAT-13 — Cold visit redirects out**
Given the user navigates directly to `/auth/reset-password` with no recovery session
When the page mounts and auth hydration completes
Then the user is redirected to `/` (not stuck on the form)
Status: ⬜

## Modal UX

**UAT-14 — Back-to-sign-in returns to Sign In mode with email kept**
Given forgot mode (either before or after submit)
When the user clicks `Back to sign in`
Then mode flips to Sign In, the email field retains its value, and password fields are empty
Status: ⬜

**UAT-15 — Enter submits the primary (reset link) action**
Given forgot mode with an email typed
When the user presses Enter in the email field
Then the **Send reset link** action fires (not the magic-link one)
Status: ⬜

**UAT-16 — Disabled state while loading**
Given an in-flight reset OR magic request
When the user inspects the two buttons
Then BOTH are disabled (visually + `disabled` attribute) until the response resolves
Status: ⬜

**UAT-17 — Empty-email submit blocked**
Given forgot mode with the Email field empty
When the user looks at the two buttons
Then both are disabled until an email is typed
Status: ⬜

## Error states

**UAT-18 — Rate-limit error mapped**
Given the user spams **Send reset link** until Supabase rate-limits
When the next click fails with a rate-limit error
Then the UI shows `Too many requests — please wait a minute and try again.` rather than the raw Supabase message
Status: ⬜

**UAT-19 — Network error generic**
Given the network is offline (DevTools throttling → Offline)
When the user clicks either button
Then a generic friendly error appears; nothing crashes; clicking the button again retries
Status: ⬜

## No regression

**UAT-20 — SIGNIN-1 / SIGNIN-2 still pass**
Given the SIGNIN-3 PR merged
When SIGNIN-1 UAT (UAT-01 through UAT-12) and SIGNIN-2 ACs are re-run
Then all pass without change
Status: ⬜

**UAT-21 — Codex diff scope check**
Given the merged PR
When Codex reviews the diff
Then changes are confined to: `components/auth/SignInModal.tsx`, `lib/auth-store.tsx`, `app/auth/callback/*`, `app/auth/reset-password/*`, optionally `components/auth/EyeIcon.tsx`, and (only if it exists) three string additions to `lib/analytics.ts`. `components/TopNav.tsx`, schema, RLS, role-picker, tenant logic untouched.
Status: ⬜

## Not applicable (documented)

- Tenant scoping: N/A — pre-auth surface.
- Demo-data leakage: N/A — pre-auth surface.
- Logged-out redirect: N/A — these screens are the auth entry / recovery.
- Individual vs Group / module progression: N/A.
- Role gating: N/A — role-picker runs after sign-in completes via the callback, unaffected by this change.

## Bugs Found

_None yet — populate inline as scenarios fail._
