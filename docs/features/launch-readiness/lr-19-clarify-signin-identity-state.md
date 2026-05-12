---
id: LR-19
title: "[Sign-in] Make signed-in identity unambiguous in sign-up + sign-in flows"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: false
created: 2026-05-11
created_by: parent-walkthrough-2026-05-11
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-11-parent.md
related: sign-in-flow (epic)
---

### Goal

After sign-up or sign-in, the visitor should immediately understand
WHO they are signed in as. Today, the post-auth state is ambiguous
enough that the founder herself got confused in walkthrough.

### Background

From the parent walkthrough:

> "Let's sign in, I'm going to do a new sign in, hello, gobuddy.com,
> is that person signed in, let me see. So, it is Nisha, hello, oh,
> no Nisha, not putty, great, so, I'm actually going to sign in as
> this user. Let's do another account. Check my email. Confirm your
> mail. Okay, okay, now I can sign in."

Two distinct confusions in one segment:

1. **Stale session sharing.** When the founder opened the sign-up
   flow, an existing session ("Nisha") was already active. The UI
   didn't make that clear — she had to inspect to figure out who
   was signed in.
2. **Post-confirmation reentry friction.** After confirming email,
   it wasn't obvious that she was now signed in vs needing to sign
   in again. "Okay, okay, now I can sign in" suggests an extra step
   the user didn't expect.

This is CONCERN-level (not BLOCKER): the founder did eventually
complete sign-up, and most users won't have stale sessions in their
browser. But for any user toggling between accounts (e.g. parent who
also has a teacher account), the confusion is real.

### Requirements

1. **Reproduce the confusion.** Either with a stale session in the
   browser or with the post-email-confirmation reentry. Capture the
   exact screens and what's missing.
2. **Surface signed-in identity at every auth boundary:**
   - When the sign-up / sign-in modal opens AND a session already
     exists, show a banner: "You are currently signed in as
     <email>. Sign out first to use a different account?" with a
     visible "Sign out" button.
   - After a successful sign-up + email confirmation, the redirect
     destination should show a clear "Welcome, <name>" / "Signed in
     as <email>" state above the fold — no doubt about session
     status.
3. **No silent session reuse.** If the founder enters
   `nisha+test@go-padi.com` in the sign-up form but there's already
   a `nisha@go-padi.com` session active, the system should NOT
   silently use the existing session — it should prompt to sign out
   first.
4. **Email confirmation flow:**
   - After clicking the verification link, automatically log the user
     in (don't require a separate sign-in step).
   - If auto-sign-in isn't feasible (Supabase magic link constraint),
     surface a very clear "Click here to continue" CTA — never a
     blank "you're verified" page that requires the user to navigate
     back manually.

### Acceptance Criteria

**Happy Path (no stale session)**
Given a visitor with no active session
When they complete sign-up + email confirmation
Then they land on the post-signup page already authenticated
And the page header / nav shows "Signed in as <email>" or "Welcome,
<name>" clearly above the fold

**Happy Path (stale session)**
Given a visitor with an existing active session as user-A
When they open the sign-up or sign-in modal
Then a banner reads "You are currently signed in as user-A. Sign
out first to use a different account."
And a clearly-labeled "Sign out" button is in the banner
And the sign-up form is disabled (or warns) until sign-out occurs

**Happy Path (sign-in vs sign-up disambiguation)**
Given a returning user clicking the sign-in CTA
When the modal opens
Then it shows "Sign in" mode by default (per SIGNIN-1 split modes)
And toggling to "Sign up" mode shows the sign-up form

**Error State (email already exists)**
Given a visitor attempts sign-up with an email that already has an
account
When they submit
Then the form shows "This email already has an account. Sign in
instead?" with a one-click toggle to sign-in mode pre-filled with
the same email

**Mobile**
All banners and modals work at 375×667.

### Out of Scope

- Social sign-in (Google, Apple) — separate epic.
- Multi-account switching (signed in as both a parent and teacher
  simultaneously) — far future.
- Password reset flow polish — separate ticket.

### Notes

- Sits adjacent to the `sign-in-flow/` epic (SIGNIN-1 shipped split
  sign-in/sign-up modes; SIGNIN-2 polished). This ticket adds the
  identity-clarity layer SIGNIN-1/2 didn't cover.
- Files likely involved:
  - The sign-in modal component (look for `SignInModal` or similar
    in `components/`)
  - `lib/auth-store.tsx` (session state hooks)
  - The post-email-confirmation landing page
- Complexity S-M depending on whether email-confirmation auto-login
  needs server-side Supabase work.
- Priority `high` (not `highest`) because it's a CONCERN-grade issue
  — not actively blocking activation, just adding friction. Demote
  to `medium` post-launch if real-world signups don't surface the
  problem.
