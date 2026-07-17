---
id: LR-35
title: "[Feature] Support contact — /help page with FAQ + support email in footer + pricing page"
type: story
status: ready
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
related: LR-31
handling: cc
---

### Goal

Give users somewhere to go when something breaks or they have a
question. For launch this is a static help page + a single support
email address, not a helpdesk / ticketing product. Get to real
users, then add tooling if volume demands it.

### Requirements

**1. Support email address decision**

Nisha to confirm the support email address before merge. Options:

- `hello@go-padi.com` — friendly, general-purpose.
- `support@go-padi.com` — clearer intent.
- `nisha@go-padi.com` — direct-to-founder, high-touch, only
  scales to ~50 accounts.

Default in the ticket: `hello@go-padi.com` (which the marketing
site already uses on go-padi.com). Change on Nisha's word.

**2. New route: `/help`**

Simple static page.

- Header: "How can we help?"
- Subhead: "Padi is early — we read every message. Reply time
  under 24 hours weekdays."
- FAQ section — 6–8 questions covering the most likely early
  friction points:
  - "How do I record a lesson?" (LR-14 explainer + iPad-Safari
    permission tip)
  - "My recording didn't save — what happened?" (mic permission,
    check the toast for the specific error, retry)
  - "How does the progress score work?" (worst-signal-wins,
    across lesson / module / group / chapter — points at LR-29)
  - "I hit the 3-lessons-per-week limit — what now?" (upgrade to
    Padi Pro, or wait a week — LR-30)
  - "How do I add another child?" (add-student modal on the
    Start Teaching page)
  - "How do I cancel my subscription?" (Stripe Customer Portal
    link; graceful copy)
  - "Where's my data stored?" (Supabase us-east-2, links to
    Privacy Policy)
  - "How do I delete my account?" (email support with subject
    "delete my account")
- Below FAQ:
  > Still stuck? Email us at [hello@go-padi.com](mailto:hello@go-padi.com)
  > and include the child's first name, the module you're on, and
  > any error message you see.

**3. Footer link**

Add "Help" to the site footer (`components/Footer.tsx`) alongside the
LR-31 legal links.

**4. Sign-in modal error state**

When sign-in fails with a system error (not "wrong password"), show:

> Something went wrong. If this keeps happening, email
> [hello@go-padi.com](mailto:hello@go-padi.com).

**5. Pricing page CTA support link**

On the `/pricing` page (shipped in LR-30), add a small line below
the plan comparison:

> Questions? Email [hello@go-padi.com](mailto:hello@go-padi.com).

### Out of scope

- Contact form. `mailto:` links are enough at launch.
- Live chat / Intercom / Zendesk. Post-launch when volume warrants.
- Multi-language FAQ. English only.
- Auto-reply / helpdesk software. Nisha reads and replies from her
  regular email client for now.

### Acceptance criteria

1. `/help` route exists and renders the FAQ + support email.
2. Footer shows "Help" link on every page.
3. Sign-in modal system-error state surfaces the support email.
4. Pricing page shows the support email line.
5. Every mailto link opens the default mail client with the
   correct recipient prefilled.

### Notes for the implementer

- Reuse the LR-31 `LegalLayout` (or equivalent) for consistency;
  this is the same rendering shape.
- Do not build a form. mailto is intentional.
- Nisha confirms the email address before merge; use
  `hello@go-padi.com` as the default in the diff.
