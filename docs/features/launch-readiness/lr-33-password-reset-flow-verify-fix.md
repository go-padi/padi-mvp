---
id: LR-33
title: "[Task] Verify password reset flow end-to-end, fix anything broken"
type: task
status: ready
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
handling: cc
---

### Goal

Confirm a new user who forgets their password can reset it and get
back in without hitting support. This flow uses Supabase Auth's
built-in password-reset email; the risk is that the redirect URL,
the sender email template, or the reset page has never actually
been exercised in prod.

If the flow works today, this ticket is a 30-minute verification
pass + adding a "Forgot password?" link to the sign-in modal.
If broken, fix it.

### Requirements

**1. Verify the current state, live on prod**

- Sign up a throwaway test account on padi-mvp.vercel.app.
- Sign out.
- On the sign-in modal, look for a "Forgot password?" affordance.
  If missing → add one (see #3).
- Click it → enter the test account email → confirm the reset email
  arrives (check both inbox and spam).
- Click the link in the email → land on a set-new-password page →
  set a new password → be able to sign in with the new password.

**2. Fix anything broken**

Likely failure modes and fixes:
- **No "Forgot password?" link:** add one to
  `components/auth/SignInModal.tsx` that calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo:
  '<origin>/auth/reset' })`.
- **No `/auth/reset` route:** create
  `app/auth/reset/page.tsx` that reads the recovery token from the
  URL hash / query, uses `supabase.auth.updateUser({ password })`,
  and redirects to `/teacher` (or `/parent`) on success.
- **Supabase email template not configured:** in the Supabase
  dashboard → Auth → Email Templates → Password Recovery, confirm
  the template renders the reset link with the right domain. If
  the template still points to `localhost` or a Supabase preview
  URL, update it in the dashboard (not a code change).
- **Redirect URL not allowlisted:** in Supabase Auth Settings →
  Redirect URLs, add `https://padi-mvp.vercel.app/auth/reset`.

**3. Add "Forgot password?" affordance** to
`components/auth/SignInModal.tsx` below the password field. Simple
text link that opens an inline "reset flow" state within the same
modal — no route change.

**4. Success + error copy**

- On successful email send: inline message "Check your inbox for a
  reset link. Try spam if you don't see it in 2 minutes."
- On invalid email: same message (don't leak account existence).
- On expired / invalid token at `/auth/reset`: "This reset link
  expired. Request a new one from the sign-in screen."
- On successful password change: redirect to signed-in home with
  a toast "Password updated."

### Acceptance criteria

1. Test signup → sign out → "Forgot password?" → email arrives →
   click link → set new password → sign in with new password.
2. Whole flow works on desktop Chrome + iPad Safari.
3. No console errors during the flow.
4. Expired token surfaces a friendly error, not a stack trace.

### Notes for the implementer

- If the fix is trivial (add a link + confirm Supabase settings), the
  ticket ships without a schema change.
- If Supabase Auth is missing the recovery template or the redirect
  allowlist, Nisha may need to do the dashboard change (BuildLoop
  cannot touch the Supabase dashboard). Surface any dashboard-only
  fix in the deploy notes so Nisha knows to click it.
- Reuse the existing SignInModal styling — no new modal component.
