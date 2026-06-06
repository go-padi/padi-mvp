---
id: STRIPE-1
title: "[Dev] Public /pricing page"
type: story
status: backlog
priority: high
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
---

### Goal

A single public page at `/pricing` showing parent + tutor plans,
trial messaging, and a CTA into signup → trial → checkout. Linked
from the marketing header, landing-page hero CTA, and from the
in-app billing page.

### Files to touch

- `app/pricing/page.tsx` (new, server component)
- `components/PricingCard.tsx` (new, presentational)
- `app/page.tsx` (landing) — add `/pricing` link in the nav and a
  secondary CTA below the hero
- `lib/copy/pricingCopy.ts` (new) — single source of truth for the
  prices + plan IDs so the in-app paywall can reuse the same strings

### Requirements

1. **No auth check.** Page renders for anyone.
2. **Three cards visible:**
   - Parent (Monthly $14.99 / Annual $99 toggle, annual default)
   - Tutor Pro (Monthly $29 / Annual $279 toggle, annual default)
   - Tutor Free pill on Parent card: "Includes a free seat for your
     tutor" — copy only, no separate card
3. **Anchor block above cards:**
   "Private reading tutors cost $60–150/hr. Padi gives you a
   specialist-backed curriculum for $14.99/mo." Cite source as
   "Avg US reading tutor rate, 2026" (no link required).
4. **14-day trial copy** prominent on each paid card: "14 days
   free. No card required to start."
5. **Outcome guarantee** below cards as a callout: "If your child
   isn't reading CVC words in 90 days, full refund." (Only when
   `process.env.NEXT_PUBLIC_OUTCOME_GUARANTEE_ENABLED === 'true'`
   — feature-flagged because we want to A/B this.)
6. **CTAs:**
   - On Parent / Tutor Pro cards (logged out): "Start free trial"
     → `/signin?intent=signup&plan=<plan_id>`
   - When user is already authenticated: "Manage plan" → `/account/billing`
7. **FAQ section** below: 4–6 questions. Suggested:
   - "What if I don't pay after the trial?"
   - "Can I cancel anytime?"
   - "Do I need a credit card to start?"
   - "What's the sibling discount?"
   - "Is the curriculum really specialist-backed?"
8. **Mobile-first.** Cards stack at <768px. CTA tappable at 44pt.
9. **No actual Stripe call from this page.** Checkout session is
   created from `/signin?intent=signup&plan=...` post-auth flow
   (handled by STRIPE-3).

### Acceptance Criteria

**Logged out user lands on /pricing**
Given I'm not signed in
When I navigate to `/pricing`
Then I see three plan cards with the prices above
And the "Start free trial" CTA links to the signup flow with the
plan_id encoded

**Logged in user lands on /pricing**
Given I'm signed in
When I navigate to `/pricing`
Then the same cards render
And the CTA says "Manage plan" and links to `/account/billing`

**Annual / monthly toggle**
Given the page rendered with Annual selected by default
When I tap Monthly
Then prices update to monthly and the savings badge ("Save 45%")
disappears

**Mobile**
At 375×667 cards stack, all CTAs reachable without horizontal
scroll.

### Out of scope

- Stripe API calls (STRIPE-3 handles)
- Logged-in user paywall (STRIPE-4 handles)
- Live A/B-test infra for the guarantee — feature flag only
- Localization

### Notes

- Reuse styling from `app/page.tsx` (landing hero) — same border
  rounding (`rounded-2xl`), same gradient on primary CTA.
- Prices and `plan_id` strings come from `lib/copy/pricingCopy.ts`.
  STRIPE-2 will add `STRIPE_PRICE_PARENT_MONTHLY` etc. to env;
  for now hard-code prices in copy. Plan IDs as opaque strings:
  `parent_monthly`, `parent_annual`, `tutor_pro_monthly`,
  `tutor_pro_annual`. Stripe Price IDs are resolved server-side
  in STRIPE-3, not here.
- Don't ship the outcome guarantee copy live until nisha confirms
  she's OK with refund-by-policy risk.
