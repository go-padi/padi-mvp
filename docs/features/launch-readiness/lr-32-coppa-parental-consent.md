---
id: LR-32
title: "[Feature] COPPA parental-consent step at signup + storage of consent record"
type: story
status: ready
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
related: LR-31
handling: cc
---

### Goal

Every account signing up on Padi is being used to teach a child
ages 3–7 ([[project-padi-target-audience]]). COPPA (US Children's
Online Privacy Protection Act) requires that we collect verifiable
parental consent before we collect any personally-identifying
information about a child. In practice, that's the child's first
name, the audio recording of their voice, and the notes about their
sessions.

Launch-adequate consent: a signup-time acknowledgment where the
parent or teacher affirms they have authority to submit child data,
timestamped and stored. Post-launch (LR-32b) we upgrade to a stronger
verification method (credit card check, signed form, or one of the
FTC-approved methods) if we grow past ~500 accounts or hear from a
regulator.

### Requirements

**1. Consent step in signup flow**

After the signup form (email + password) but before account creation
completes, show a modal or dedicated step with:

- Heading: "Consent to use Padi for teaching a child"
- Body:
  > Padi is a teaching tool for children ages 3–7. To use Padi
  > you confirm:
  >
  > - You are the parent, legal guardian, or a teacher authorized
  >   by the parent/guardian to enter information about the
  >   child.
  > - You are 18 years or older.
  > - You have read and agree to the
  >   [Privacy Policy](/legal/privacy) and
  >   [Terms of Service](/legal/terms).
  >
  > By continuing, you consent to Padi collecting the child's
  > first name, session notes, audio recordings, and progress
  > ratings as described in the Privacy Policy.

- A single checkbox: "I confirm the above and consent."
- Primary button: "Continue" (disabled until checkbox ticked).
- Secondary link: "Cancel" — dismisses without creating the account.

**2. Store the consent record**

Add columns to `profiles`:

- `consent_given_at timestamptz` — set on successful signup after
  the modal.
- `consent_ip_address text` — the IP address at consent time,
  captured from the request header. RFC-safe (mask last octet if
  Nisha wants stronger privacy posture; leave raw for launch).
- `consent_user_agent text` — the User-Agent header at consent
  time.
- `consent_version text` — string identifier for the consent
  language shown, e.g. `'2026-05-25.v1'`. Bump when the wording
  changes; older accounts retain their original version.

Migration is idempotent + follows the canonical tenant-scoped RLS
pattern.

**3. Backfill for existing accounts**

Existing accounts on prod have not gone through this flow. Migration
sets `consent_version = 'grandfathered-2026-05-24'` and
`consent_given_at = created_at` on all existing rows. This documents
their status without pretending they gave the new consent explicitly.

**4. Signup flow order**

- Email + password entered.
- Consent step shown.
- On accept: account created + `consent_*` columns populated in the
  same transaction.
- On cancel or backing out: no account creation.

**5. Session start / add-student check**

Every time a signed-in user tries to add a new student, verify
`profiles.consent_given_at IS NOT NULL`. If null (e.g. legacy account
that pre-dates the backfill, or a corrupt state), show an inline
re-consent modal before allowing the add.

### Out of scope

- Verifiable methods beyond the checkbox (credit card verification,
  signed PDF, phone call). Post-launch — LR-32b.
- Age-gate for signing users (18+). Signup ToS already asserts 18+;
  we don't verify.
- COPPA-required data-deletion request form. The Privacy Policy
  points to a support email address (LR-35) which is COPPA-adequate
  for launch.
- Non-US privacy regimes (GDPR-K, CCPA-under-13). Address per-region
  when we launch outside US.

### Acceptance criteria

1. A new signup cannot create an account without ticking the
   consent checkbox.
2. `profiles.consent_given_at`, `_ip_address`, `_user_agent`, and
   `_version` are populated for every new signup.
3. Migration backfills all existing rows with
   `consent_version = 'grandfathered-2026-05-24'` and
   `consent_given_at = created_at`.
4. If a user backs out of the consent step, no partial row is left
   in `profiles` or `auth.users`.
5. The consent copy links to `/legal/privacy` and `/legal/terms`
   (LR-31 dependency).
6. Adding a student requires a non-null `consent_given_at`.

### Notes for the implementer

- Consent step is a modal on the current signup path; do not build a
  new full-page route unless clearer.
- IP address comes from `x-forwarded-for` header on Vercel (first
  value if comma-separated).
- The consent-record migration must ship via the LR-28 pipeline. Do
  not manually apply.
- LR-31 (legal pages) is a hard dependency — the consent language
  links to them.
- Do NOT use a checkbox that's pre-ticked. COPPA and FTC guidance
  explicitly disallow implied consent.
