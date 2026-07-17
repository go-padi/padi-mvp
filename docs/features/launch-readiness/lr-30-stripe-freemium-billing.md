---
id: LR-30
title: "[Feature] Freemium billing via Stripe — free tier + $9.99/mo Padi Pro upgrade"
type: story
status: ready
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: founder-direction-2026-05-24
related: LR-14, LR-29
handling: cc
---

### Goal

Turn on billing without turning off adoption. Every signup gets Padi
free with enough headroom to actually try the method. Users who need
more capacity upgrade to Padi Pro. **No credit card required at signup.**

The freemium shape is chosen because Padi's most-needed users
(struggling readers in under-resourced households) are the most
price-sensitive, and audio recordings from those sessions are the
training data for the readiness classifier. Gating audio behind a
paywall would starve the model. See [[project-padi-target-audience]].

### Free tier (default)

Every account starts here. No card, no gate.

- 1 student
- 3 lesson completions per rolling 7 days
- Full curriculum browse
- Notes + audio recording + saved history
- 3-signal rating + LR-29 progress score at all levels

### Padi Pro — $9.99/month or $79/year

Upgrade unlocks:

- Unlimited students under one account
- Unlimited lesson completions
- (Post-launch) export of notes + audio + progress reports
- (Post-launch) priority AI-model access when the readiness
  classifier ships

Annual is a ~34% discount vs. monthly — same shape as ABCmouse /
Homer / Reading Eggs annual plans.

### Grandfathering rule

Every account created before the paywall flip (i.e. every current
signup + everyone from launch through the freemium rollout) is
grandfathered on the free tier as it exists today. If we ever tighten
the free tier later, they retain the launch-day limits. Trust
matters more than incremental revenue.

### Requirements

**1. Schema — plan tracking on the tenant**

- Add `tenants.subscription_tier` enum: `'free' | 'pro'`. Default
  `'free'`.
- Add `tenants.stripe_customer_id` text nullable.
- Add `tenants.stripe_subscription_id` text nullable.
- Add `tenants.subscription_status` text nullable (`'active'`,
  `'past_due'`, `'canceled'`, etc. — mirrors Stripe's own values).
- Add `tenants.subscription_current_period_end` timestamptz nullable.
- Migration is idempotent + tenant-scoped RLS follows the
  [[project-migration-pattern]] pattern from the LR-14a hotfix
  (`tenant_id in (select tenant_id from profiles where id = auth.uid())`).

**2. Usage metering table (or view)**

`lesson_completions_weekly` — a materialized view or on-demand query
that returns count of completions per (tenant_id, student_id) in the
last 7 rolling days. Used by the free-tier limit check. Keep it
simple: `select ... from lesson_completions where completed_at > now()
- interval '7 days'`. No new table needed if the query is fast; add
an index on `(tenant_id, completed_at)` if not present.

**3. Stripe integration — server-side plumbing**

- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` env vars, added to
  Vercel prod + preview environments. Do NOT commit.
- **Test mode → live mode transition.** Nisha's Stripe account is in
  test mode pending a business-verification document. Ship this
  ticket against test-mode keys (`sk_test_*`) in Vercel preview
  environment. Prod environment holds the live-mode keys
  (`sk_live_*`) but they stay empty until the Stripe document
  clears. The code MUST NOT crash when `STRIPE_SECRET_KEY` is unset
  in prod — instead, the upgrade CTA should render a "Billing
  coming soon" state and the checkout endpoint should return a
  friendly 503. See Sequencing / notes below.
- New route `app/api/stripe/create-checkout-session/route.ts` — takes
  the signed-in user's tenant, creates a Stripe Checkout session for
  the Padi Pro monthly or annual price, returns the URL for
  redirect.
- New route `app/api/stripe/webhook/route.ts` — verifies signature,
  handles `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  and `invoice.payment_failed`. Updates
  `tenants.subscription_tier`, `subscription_status`, and
  `subscription_current_period_end` accordingly.
- New route `app/api/stripe/customer-portal/route.ts` — returns a
  Stripe Customer Portal session URL so users can manage their
  subscription without us building account management UI.

**4. Enforcement — soft blocks with upgrade CTA**

- When a free-tier account has 1 student and tries to add a second:
  show the AddStudentModal with an upgrade CTA replacing the
  student-add form. Copy: *"Padi Pro lets you teach unlimited kids
  from one account."*
- When a free-tier account has completed 3 lessons in the last 7
  days and tries to mark a 4th complete: block the save with an
  upgrade CTA. Copy: *"You've completed your 3 free lessons this
  week. Padi Pro unlocks unlimited lessons — you and your student's
  progress stays saved either way."*
- Both CTAs link to a new `/upgrade` page that triggers checkout.

**5. Pricing page — `/pricing`**

Public route. Two plans side-by-side. Headline: *"Free forever, or
Padi Pro for everything."* CTA on free: "Sign up free." CTA on Pro:
"Start Padi Pro — $9.99/mo or $79/year." Ships with the ticket.

**6. Post-checkout redirect**

Stripe Checkout success URL points back to `/upgrade/success` which
shows a friendly confirmation and redirects to `/teacher` after 3s.

### Out of scope (v0)

- Team / school-tier billing. Post-launch.
- Coupons / referral codes / discount codes. Post-launch (add later
  via the Stripe dashboard, not code).
- Multiple currencies. USD only at launch.
- Trial period on Pro. Free tier IS the trial — deliberately.
- Custom account management UI. Stripe Customer Portal is enough.
- Analytics on plan conversion. Post-launch, but do log the
  `subscription.created` webhook to Vercel logs so we can eyeball
  early conversions.

### Acceptance criteria

1. New signup lands on the app, is on free tier, has no card required.
2. On the free tier, user can create 1 student, complete 3 lessons in
   7 rolling days, use audio recording + notes freely.
3. Attempting to add a second student on free tier shows the upgrade
   CTA modal.
4. Attempting a 4th completion in 7 days on free tier shows the
   upgrade CTA and blocks the save.
5. Clicking upgrade → Stripe Checkout → paying → returning to app:
   `tenants.subscription_tier = 'pro'`, limits removed.
6. Cancelling from the Stripe Customer Portal → webhook fires →
   `subscription_status = 'canceled'` → at
   `subscription_current_period_end` the tier drops back to free +
   they remain grandfathered on their pre-paywall behavior for the
   original grandfathered accounts.
7. Every existing tenant at deploy time has `subscription_tier =
   'free'` (backfill in the migration).
8. Pricing page renders on `/pricing`, both signed-in and signed-out.
9. No hardcoded prices in the app code — read the Stripe Price ID
   from env (`STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`) so
   pricing can move without a code change.

### Notes for the implementer

- Stripe SDK: `stripe` npm package. Server-only. Never expose the
  secret key to the client.
- Webhook signature verification is mandatory — use
  `stripe.webhooks.constructEvent(rawBody, signature, secret)`.
- Vercel + Next.js: webhook route must disable the default body
  parser and read the raw body. Standard pattern:
  `export const runtime = 'nodejs'; export const dynamic =
  'force-dynamic';` + `req.text()`.
- Test with Stripe CLI locally: `stripe listen --forward-to
  localhost:3010/api/stripe/webhook`.
- Grandfather via a boolean column: add
  `tenants.grandfathered_free_forever boolean not null default
  false`; backfill `true` on the existing rows in the same
  migration. Enforcement code checks this flag before blocking.
- The 3-per-week limit reads from `lesson_completions`, which
  becomes correctly append-only after LR-10a. Do NOT ship LR-30
  before LR-10-bug-01 is merged — the limit-check will read the
  wrong table otherwise.
- LR-29's progress score is not gated. Free tier sees the same
  score chips as Pro.
- Migration file goes in `supabase/migrations/` with the
  `YYYYMMDD_lr30a_subscription_columns.sql` convention. **Must be
  applied to prod via the LR-28 pipeline** — do not attempt to
  ship LR-30 before LR-28's migration-deploy fix is live.

### Sequencing

This ticket has a hard dependency chain:
1. **LR-28** (migration deploy pipeline) — required before this
   migration will actually land on prod.
2. **LR-10-bug-01** (re-entry writes to lesson_completions) —
   required for the metering query to count correctly.
3. **LR-29** (progress score) — not a dependency, but ships
   alongside so users see progress even on free tier.
4. **LR-30** (this ticket) — after 1 + 2.

**Ship path (test mode → live mode):**
- Ship LR-30 with test-mode keys in Vercel preview. Full flow
  works end-to-end for QA — signup, hit limit, upgrade, cancel,
  webhook — all against Stripe test cards.
- Prod deployment keeps live-mode env vars empty until Stripe
  clears Nisha's verification doc.
- With prod env vars unset, code path renders "Billing coming
  soon" on `/pricing` and `/upgrade`. Free tier remains fully
  functional; the two enforcement points still show the CTA modal
  but the "Upgrade to Padi Pro" button says "Billing available
  soon — check back" instead of triggering checkout.
- When Stripe activates live mode, Nisha adds the four
  `sk_live_*` / `whsec_*` / `price_*` env vars to Vercel prod
  and redeploys. No code change needed.

### UAT

- Fresh signup: no card, on free tier.
- Add a student: works. Add another: blocked with CTA.
- Complete 3 lessons: works. Complete a 4th within 7 days: blocked
  with CTA.
- Upgrade → Stripe test card `4242 4242 4242 4242` → tier flips to
  pro → limits removed.
- Cancel from portal → wait for period end → tier drops to free →
  original student + history preserved.
- Grandfathered check: run migration on prod, verify Nisha's
  existing account is `grandfathered_free_forever = true` and never
  hits the block.
