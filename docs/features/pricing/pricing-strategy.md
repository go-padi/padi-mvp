---
id: PRICING-1
title: "[Strategy] Padi pricing — parents (D2C) + tutors"
type: feature
status: backlog
priority: high
feature: pricing
created: 2026-06-06
owner: nisha
---

### Goal

Decide the v1 pricing structure for Padi: parent subscription, tutor
subscription, and the cross-side dynamics between them. This doc is
the source of truth for landing-page copy, Stripe products, and the
in-app paywall when it lands.

### Background

Padi is pre-launch with a multisensory K-reading curriculum, ages 3–7.
Two paying audiences: parents (D2C) and tutors / reading specialists.
Tutors are also a distribution channel — they recommend Padi to
families and end up driving signups.

Benchmarks for K-reading apps (as of 2026-06):

| Product | Monthly | Annual | Notes |
|---|---|---|---|
| Reading Eggs | $9.99 | $59 | Catalog play; broad |
| Hooked on Phonics | $7.99 | $69 | Phonics-focused, legacy brand |
| Homer (Begin) | $9.99 | $59.99 | Catalog play; preschool-focused |
| Lingokids | $14.99 | $89.99 | Premium positioning |
| ABCmouse | $12.99 | $59.99 | Broad early learning |
| Khan Academy Kids | Free | — | Owns the free lane |

The $9–15/mo band is the default. Khan owns free — don't try to beat
free with free.

### Strategy

**Parent plan — $14.99/mo or $99/yr.** Annual = 45% discount; push
hard to annual because K-reading is a 12–18 month journey and annual
kills churn. Premium-end pricing justified by:

1. Specialist-backed curriculum (Mom is a real reading specialist).
2. Mom video walkthroughs on every module — competitors don't have
   this. See `docs/features/teach-video/` for the build.
3. Readiness rubric / classifier — no other K-reading app has it.

Family add-on: **$4.99/mo per sibling**, same household. Lowers
per-child cost for the multi-kid parents who'd otherwise churn at
"already paying for 1, can't afford 2."

**Tutor plan — two tiers:**

1. **Tutor Free** — when a parent subscribes, the tutor they invite
   gets free read+teach access to that family's account. Zero
   friction for tutor adoption; tutor becomes a recommendation engine.
2. **Tutor Pro $29/mo** — for tutors running their own practice with
   up to 10 students they fully own (no parent account on the other
   side). Per-seat scaling beyond 10 at $3/student/mo.

### Tactical levers to test pre-launch

1. **Anchor against private tutoring.** Landing page opens with
   "Private reading tutors cost $60–150/hr. Padi gives you the same
   curriculum for $14.99/mo." Reframes price from "another app sub"
   to "1/10th the cost of a tutor."
2. **Outcome guarantee.** "If your child isn't reading CVC words in
   90 days, full refund." Padi can credibly make this claim because of
   the rubric — we can show the data. Trust unlock outweighs the
   refund cost if the product works.
3. **14-day trial, no card for first 3 modules.** Reduces signup
   friction; the rubric data collected during trial is itself a
   learning-set asset for the ML model.

### What NOT to do

- **No freemium-forever.** Khan Academy Kids owns that lane.
  Padi's differentiation (specialist-backed, rubric, audio) costs
  real money to deliver and free undermines the premium signal.
- **No one-time purchase** (Hooked on Phonics legacy model). Bad
  cash flow and zero product-led retention.
- **No standalone schools/districts pricing yet.** B2B is a
  different motion with a 6-month sales cycle. Park until parent
  + tutor revenue funds a sales hire. Schools can still come
  inbound via tutors who work in them.

### Open questions

- **Trial length: 7 vs 14 days?** 14 captures more rubric data but
  may train freeloader behavior. Test both.
- **Annual price point: $99 vs $119?** $99 is a strong psychological
  anchor; $119 = $10/mo equivalent and still a discount. Test in
  the first 200 signups.
- **Sibling discount: per-child or family-flat?** $4.99 per child is
  simpler; $24.99 flat for unlimited siblings is bolder. Bigger ARPU
  at the family-flat price if multi-child households are >30%.
- **Tutor revenue share?** Should tutors get a kickback (e.g., 20%
  recurring for 12 months) for referred parents? Increases tutor
  motivation; complicates accounting. Defer to v1.1.

### Out of scope

- Stripe wiring (separate ticket).
- In-app paywall UX (separate ticket — depends on which screen the
  paywall lives on).
- District / institutional pricing.
- Promo codes, partner pricing.
- Cancellation flow.

### Notes

- Final prices must be locked before the landing page goes live.
- Run a "smoke test" landing page with $14.99 / $99 / $29 prices
  and an email-capture before launching billing. If conversion is
  weak at these prices, the band is wrong — adjust before wiring
  Stripe.
- ASDEC curriculum is the proprietary asset that lets us hold the
  premium-end pricing. Don't undersell that in copy.
