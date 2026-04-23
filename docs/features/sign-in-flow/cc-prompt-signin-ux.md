# CC Prompt — SIGNIN-1: Split Sign In and Create Account modes

**Ticket:** [`SIGNIN-1`](./signin-1-split-signin-signup-modes.md) · **UAT:** [`SIGNIN-1-uat`](./signin-1-uat.md) · **Priority:** P0 / highest

**Branching & review:** do the work on a feature branch, not directly on `main`. Codex reviews the diff before merge. No Jira writes.

## Problem

The current `SignInModal` shows a single Email + Password form. If a user does not have an account yet, they are expected to type a new email and password and hit a secondary "Don't have an account? Create one" button. This is counterintuitive:

- There is no signal that they are in "sign in" vs "create account" mode
- There is no confirm-password field, so typos silently create a broken account
- Passwords cannot be revealed — users who mistype have no way to verify
- Users have reported that sign in feels "broken" because of the ambiguous flow

## Goal

Redesign the modal into an intuitive two-mode flow in-place (same modal, no new route). One clear default state for existing users, a distinct create-account state for new users, with the affordances users expect.

## Scope

Surgical edit to **one** component: `components/auth/SignInModal.tsx`.

Do NOT change:
- `lib/auth-store.tsx` (`login`, `signup` signatures stay the same)
- `components/TopNav.tsx` (the modal is opened the same way)
- Any route, DB schema, or RLS
- Any other styling patterns (stay within Tailwind + existing rounded-2xl / ring style)

Keep the modal's existing shell (overlay, close X, Escape key, outside-click to close).

## Requirements

### Mode state

Add local state `mode: 'signin' | 'signup'`. Default `'signin'`. Toggled via the bottom link inside the modal — no new component, no new route.

Clear `error`, `info`, `password`, `confirmPassword` fields when `mode` flips so stale values don't leak between flows.

### Sign In mode (default)

- Title: `Sign In`
- Subtitle: `Sign in to access your teaching dashboard`
- Fields: Email, Password
- Primary button: `Sign In` → calls `login(email, password)` (unchanged behavior)
- Bottom link: `Don't have an account? Create one` → switches `mode` to `'signup'`
- On success: close modal (existing behavior)
- On failure: existing error handling stays

### Create Account mode

- Title: `Create Account`
- Subtitle: `Create an account to save your students and lessons`
- Fields, in order:
  1. Email (`type="email"`, required)
  2. Password (masked by default, required, `minLength={8}`)
  3. Confirm Password (masked by default, required)
- Primary button: `Create Account`
- Bottom link: `Already have an account? Sign in` → switches `mode` to `'signin'`
- Client-side validation (before calling `signup`):
  - Passwords must match — otherwise show inline error: `Passwords don't match. Please re-enter.` and do NOT call `signup`
  - Password length ≥ 8 — otherwise show inline error: `Password must be at least 8 characters.`
- On successful signup:
  - If a session is returned (`session?.access_token` truthy) → close modal (same as today)
  - If NO session (Supabase email-confirmation case) → switch `mode` back to `'signin'`, pre-fill `email`, clear both password fields, and show the existing info banner: `Check your email to confirm your account, then sign in.`
- On signup error: keep existing error-mapping logic (already handles "email exists" etc.)

### Show / hide password (eye icon)

Apply to **both** Password and Confirm Password fields (in their respective modes).

- Default input `type="password"` so characters render as dots/asterisks
- A button inside the input row toggles `type="password"` ↔ `type="text"`
- Use an inline SVG eye / eye-off icon (keep the bundle lean — do NOT add a new dep). Two tiny SVGs inside a `button type="button"` with `aria-label="Show password"` / `aria-label="Hide password"` and `aria-pressed` are enough.
- Each password field has its own independent visibility state (`showPassword`, `showConfirm`). Revealing one must not reveal the other.
- Position the eye button absolutely inside the input wrapper on the right side, vertically centered. Tailwind pattern: wrap each input in a `relative` div, add `pr-10` to the input, absolutely position the button `right-2 top-1/2 -translate-y-1/2`.
- Icon color: `text-gray-500` default, `text-gray-700` on hover. 20px square (`h-5 w-5`).

### Accessibility and UX

- Submitting the form with Enter triggers the active mode's primary action
- Disable the primary button while `loading`
- Disable the primary button in signup mode when password or confirm-password is empty
- Labels remain visible above fields (keep the current pattern, don't switch to floating labels)
- Tab order flows naturally: email → password → (confirm password) → primary button → bottom link
- Keep the existing Escape / outside-click / X close behaviors working in both modes

## Exact file to change

`components/auth/SignInModal.tsx` — rewrite the component body to support both modes. Keep the exported name (`SignInModal`) and props (`{ onClose: () => void }`) identical.

## Verification

1. `pnpm lint` — clean
2. `npx tsc --noEmit` — clean
3. Manual QA on `pnpm dev -- --port 3010`:
   - Open modal from "Sign in" in TopNav → default view is Sign In mode
   - Click "Don't have an account? Create one" → title flips to "Create Account", confirm password field appears, email/password stay cleared
   - Type a password, click the eye icon → password becomes visible; click again → masked
   - Eye on Password does NOT reveal Confirm Password, and vice versa
   - Enter mismatched passwords + click Create Account → inline error, no network call
   - Enter 7-char password → inline error, no network call
   - Enter valid matching passwords for a brand-new email → either modal closes (if Supabase confirmation is OFF) OR mode flips back to Sign In with info banner and email pre-filled (if confirmation is ON)
   - In Sign In mode, correct creds → modal closes and TopNav shows `Logged in as …`
   - Escape / clicking backdrop / X button close the modal from either mode

## Out of scope

- Forgot password flow
- Magic link / OAuth
- Password strength meter
- Any DB or RLS change
- Any change to `lib/auth-store.tsx`
