---
id: STRIPE-EPIC
title: "[Epic] Stripe paywall — trial, billing, gates"
type: epic
status: backlog
priority: highest
feature: stripe-paywall
created: 2026-06-06
owner: nisha
launch_blocker: true
---

### Goal

Take payments for Padi without breaking the activation funnel. Trial
gives parents a real taste; paywall lands on the moments where they
already feel the value; billing is hosted by Stripe so we don't
build card UI.

### North star check

North star = **activated users** (signed up + role picked + ≥1
student + ≥1 lesson completed). Any paywall surface that gates
those four actions kills the metric. So the paywall lands AFTER
the user has experienced value, not at signup.

This is why: **14-day trial, no card at signup**, paywall lands on
the *15th day's first "do-the-work" action*.

### Where pricing lives in the app

Three classes of surface:

**Public (unauthenticated):**
- `/pricing` — single page, parent + tutor plans, FAQ, anchor
  against private tutoring. Linked from header on landing, from
  every sign-up CTA, and from in-app billing.

**In-trial (authenticated, days 0–14):**
- Trial countdown chip in teacher/parent dashboard header (e.g.
  "12 days left in trial — upgrade").
- Day-7 banner on dashboard: "Halfway through — pick a plan." Soft,
  dismissible.
- Day-13 modal on next dashboard load: "Trial ends tomorrow."
  Dismissible but persistent.

**Post-trial / expired (authenticated, day 15+):**
- Paywall modal blocks *first attempt* at every gated action:
  - Start a lesson (from any student/group)
  - Add a student
  - Add a group
  - View a published Mom video (premium signal)
  - Record audio
  - Save lesson notes
- These remain accessible (read-only):
  - Dashboard, student list, group list
  - Prior lesson completions + observations (history)
  - Billing page, pricing page, sign-out
- Paywall modal CTA → Stripe Checkout (hosted) → return URL hits
  webhook + redirects to dashboard with success banner.

**Always (authenticated):**
- `/account/billing` — trial status, current plan, period end, link
  to Stripe Customer Portal for cancel / change card / change plan.

### Why these placements (PM sparring)

**Trial vs hard paywall at signup.** Hard paywall destroys
activation. K-reading is a 12–18 month relationship — parents need
to feel the "she said /b/ correctly" moment before they'll commit.
Trial captures that emotion.

**Trial vs freemium-by-module-count.** Module-count freemium
(e.g. "first 5 lessons free") trains parents to bounce in for free
modules — Padi's curriculum is 200+ modules so they could
theoretically use the app for a year without paying. Trial caps
free usage by *time*, which matches the daily-habit shape of
reading practice.

**Paywall on action, not on screen.** Paywalling whole screens
(`/teacher/curriculum` becomes inaccessible) is jarring — parent
opens the app, sees nothing. Paywalling actions ("Start lesson"
button opens a modal asking to upgrade) is contextual — they see
what they're paying for, mid-intent.

**Tutor (teacher role) paywall = same.** Tutor Pro $29/mo follows
the same trial + paywall path. The "Tutor Free when paired with
paying parent" variant is handled by the data model: when a
teacher is invited into a parent's tenant, the parent's
subscription covers them. No separate teacher subscription.

**Subscription per tenant, not per profile.** Family = one tenant
(per the existing `public.tenants` model). One subscription per
tenant means a parent + invited tutor share one bill. Tutor Pro =
its own tenant with no other profiles.

**Stripe-hosted everything.** No card forms in our app. Checkout
and Customer Portal hosted by Stripe. Less PCI surface, less UI to
maintain, faster to ship.

### Plans (locked here for v1)

| Plan | Price | Trial | Notes |
|---|---|---|---|
| Parent Monthly | $14.99/mo | 14 days | per-tenant |
| Parent Annual | $99/yr | 14 days | per-tenant, ~45% off vs monthly |
| Sibling add-on | +$4.99/mo per extra student | n/a | applied to parent plan |
| Tutor Pro Monthly | $29/mo | 14 days | per-tenant, no parent profile |
| Tutor Pro Annual | $279/yr | 14 days | per-tenant, ~20% off vs monthly |
| Tutor Free | $0 | n/a | teacher invited into a paying parent tenant |

Locked source: `docs/features/pricing/pricing-strategy.md`.

### Tickets in this epic

1. **STRIPE-1** — Public pricing page (`/pricing`)
2. **STRIPE-2** — Subscriptions data model + trialing-by-default
3. **STRIPE-3** — Stripe Checkout + webhook handler
4. **STRIPE-4** — Trial banner + paywall gate (`useSubscriptionGate`)
5. **STRIPE-5** — Account / Billing page + Customer Portal redirect
6. **STRIPE-6** *(v1.1, optional)* — Sibling add-on UI

Ship order: 2 → 3 → 1 → 4 → 5 → 6. Data model first so the rest of
the work has something to read; Stripe wiring before any UI so the
UI has real subscription states to render.

### Out of scope for this epic

- Tutor invite flow (parent → tutor). Open question: does the
  invite system exist? If not, file a separate epic. Tutor Pro
  standalone ships either way; "Tutor Free when paired" depends on
  invites.
- District / school B2B. Different motion.
- Annual prepay discount logic — Stripe handles this natively via
  product variants.
- Refunds workflow. Use Stripe dashboard manually for v1.
- Tax (Stripe Tax). Configure in Stripe dashboard.
- Email receipts. Stripe handles.
- Failed-payment dunning. Stripe handles default; configure
  Smart Retries in dashboard.

### Acceptance Criteria (epic-level)

- A new parent can sign up, get role-picked, add a student,
  complete a lesson — without seeing a single paywall during the
  14-day trial.
- On day 15, the same parent hits a paywall the first time they
  try a gated action.
- They can pay via Stripe Checkout, return to the app, and
  immediately complete the previously-gated action without
  re-attempting.
- They can cancel via Stripe Customer Portal and retain full
  access until their period ends.
- A tutor signing up alone gets the same trial → Tutor Pro paywall
  path with $29/mo plan defaulted.

### Notes / open questions

- **Parent → tutor invite flow exists?** Search `app/parent/` and
  any "Invite tutor" CTA. If absent, this epic ships parent +
  tutor-standalone first; "Tutor Free when paired" is a follow-up.
- **`role: 'tutor'` vs `role: 'teacher'`?** Padi's existing role
  enum is `parent | teacher`. "Tutor" in pricing copy = `teacher`
  role in code. Don't introduce a new role.
- **Sibling counting.** Sibling add-on price scales with active
  student count per tenant. Need to decide: count at the moment of
  billing (re-compute monthly) or fixed at the time of student
  add (locked-in)? Recommendation: re-compute monthly via webhook
  on `invoice.upcoming` — Stripe pattern. Park in STRIPE-6.
- **Demo / preview accounts.** Existing demo banner logic (LR-08)
  needs to skip paywall — demo users are read-only and shouldn't
  be asked to pay. Add a `tenant.is_demo` check to the gate hook.
- **Trial extension.** Should support team be able to extend a
  trial in the database (e.g. `trial_ends_at`)? Yes — keep the
  field nullable so we can edit it. Surface in v1.1 admin tools.

### Reference

- Pricing strategy: `docs/features/pricing/pricing-strategy.md`
- Mom-video premium signal: `docs/features/teach-video/teach-video-skill.md`
- Existing tenant model: `supabase/migrations/20260112120000_teacher_workspace_v1.sql`
- Role model: `supabase/migrations/20260419120000_add_profile_role.sql`
