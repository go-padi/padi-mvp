---
id: LR-31
title: "[Feature] Static legal pages — Terms of Service, Privacy Policy, Refund Policy"
type: story
status: ready
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
related: LR-30, LR-32
handling: cc
---

### Goal

Ship the three static legal pages the app cannot launch without.
Stripe live-mode activation blocks on the Privacy Policy matching
what the app actually does. Payment can't be taken without a Refund
Policy. And ToS is baseline coverage for the platform.

**Post-launch action for Nisha:** every page has a "last updated"
date and a note that these are launch-day templates and will be
replaced with lawyer-reviewed copy before scaling paid signups
past ~100 accounts. That's an explicit follow-up ticket (LR-31b)
that doesn't block launch.

### Requirements

**1. Three routes**

- `app/legal/terms/page.tsx` → "Terms of Service"
- `app/legal/privacy/page.tsx` → "Privacy Policy"
- `app/legal/refund/page.tsx` → "Refund Policy"

Each is a plain server component that renders markdown-style content
from a co-located `.md` or inline JSX. Same layout wrapper as the
rest of the marketing site (TopNav + Footer). Readable text width
(~700px), heading anchors.

**2. Footer links on every page**

Update `components/Footer.tsx` to add three text links: "Terms",
"Privacy", "Refund". Keep the existing links (if any) — additive.

**3. Signup / signin acknowledgment**

Update the sign-up flow in `components/auth/SignInModal.tsx` (or
wherever the signup form lives) to include, below the submit button,
inline text:

> By signing up, you agree to Padi's [Terms of Service](/legal/terms)
> and [Privacy Policy](/legal/privacy).

No new checkbox — implicit consent via signup is standard practice
for a launch product. LR-32 (COPPA) adds a separate parental-consent
step where legally required.

**4. Pricing page link**

Update the `/pricing` page (shipped in LR-30) to link to the Refund
Policy near the CTA.

### Content — Terms of Service

Cover:
- Definitions (Padi, Service, User, Account, Content)
- Eligibility — Users must be 18+; accounts for children are managed
  by parent/guardian or teacher
- Account responsibility — accurate info, keep credentials safe
- Acceptable use — no reverse engineering, no harm to service or
  other users, no unlawful use
- Content ownership — User owns their notes, audio, uploaded content.
  Padi has a limited license to store, process, display back to them,
  and use in aggregated / anonymized form for improving the service
  (this covers the AI training case, so word it carefully — see notes).
- Subscription terms — reference Padi Pro, monthly / annual billing,
  auto-renewal, cancellation via Customer Portal
- Free tier — Padi may modify free-tier limits with notice; existing
  accounts grandfathered per the launch-day grandfathering rule
- Termination — either party may terminate; user data preserved for
  30 days post-termination before deletion
- Disclaimers — service provided "as is"; Padi is a teaching tool,
  not a substitute for medical / diagnostic evaluation of reading
  disorders
- Limitation of liability — capped at fees paid in the last 12 months
- Governing law — Nisha to pick (Delaware or her state of incorp)
- Contact — hello@go-padi.com (or whichever email — see LR-35)

Keep it plain-English. ~1500 words. Header: "Effective 2026-05-25.
Last updated 2026-05-25."

### Content — Privacy Policy

Cover the truth of what the app does today:
- **What data is collected:** account email, tenant metadata, student
  first names entered by parent/teacher, per-lesson notes typed by
  parent/teacher, audio recordings of lessons, 3-signal ratings,
  completion timestamps.
- **Data on children specifically:** covered under LR-32's COPPA
  section — parent/teacher enters and controls all child-related
  data. Padi does not collect data directly from children.
- **How data is used:** to render the app, to compute progress
  scores, and — in aggregated + anonymized form — to train the
  readiness classifier ML model. Individual audio + notes are NOT
  shared with other users or third parties.
- **Where data is stored:** Supabase (Postgres + Storage), hosted in
  us-east-2. Audio in the `lesson-recordings` bucket with tenant-
  scoped RLS. See existing schema.
- **Third parties:** Stripe (payment processing), Vercel (hosting).
  Both have their own privacy policies linked.
- **Retention:** account data kept while account active + 30 days
  post-deletion.
- **Rights:** users may request data export or deletion by emailing
  the support address (LR-35).
- **Children's data (COPPA-specific):** parent/teacher warrants they
  are 18+ and have authority to submit child data. Padi's
  parental-consent step at signup (LR-32) captures this in writing.
- **Contact:** hello@go-padi.com
- **Effective date + last updated.**

~1200 words. Written in second-person ("you", "your data").

### Content — Refund Policy

Short. ~400 words.

- Monthly plan: cancel anytime, no refund on the current billing
  period; access continues to end of period.
- Annual plan: full refund if requested within 14 days of purchase;
  after 14 days, prorated refund minus a $10 processing fee — OR
  no refund but access continues to period end (Nisha picks one;
  I'll write both and she picks in review).
- How to request: email the support address (LR-35); response
  within 3 business days.
- Free-tier accounts: no refund applicable.
- Effective date.

### Out of scope

- Lawyer review. Templates are launch-adequate; LR-31b tracks the
  lawyer-review pass.
- Consent-management platform (cookie banner, etc.). Padi doesn't
  set analytics cookies at launch beyond Vercel's essentials. Add
  a banner when marketing analytics ship.
- Multi-language versions. English only at launch.
- Auto-generated tables of contents. Anchor tags on headings only.

### Acceptance criteria

1. All three pages render at their routes and pass basic Lighthouse
   accessibility (headings hierarchy, contrast, alt text where used).
2. Footer links appear on every page of the app (signed-in and
   signed-out).
3. Signup flow shows the ToS + Privacy inline acknowledgment.
4. Pricing page links to the Refund Policy near the CTA.
5. All three pages have an "Effective YYYY-MM-DD. Last updated
   YYYY-MM-DD." header.
6. Privacy Policy accurately describes what the app does today —
   Nisha reads and confirms before merge.

### Notes for the implementer

- Draft the three .md files with sensible defaults for the
  policy choices (governing law placeholder = `[STATE]`, refund
  choice = both options with a comment). Nisha finalizes before
  merge.
- Reuse existing typography components. If none exist, add a
  `components/legal/LegalLayout.tsx` with prose classes.
- Do NOT commit any user data or draft PII into the policies.
