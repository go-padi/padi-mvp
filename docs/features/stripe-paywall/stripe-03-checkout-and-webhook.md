---
id: STRIPE-3
title: "[Dev] Stripe Checkout session + webhook handler"
type: story
status: backlog
priority: highest
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
blocked_by: [STRIPE-2]
blocks: [STRIPE-4, STRIPE-5]
---

### Goal

Two server routes: one creates a Stripe Checkout session for an
authenticated user, the other receives Stripe webhooks and syncs
subscription state into `public.subscriptions`. No card UI is built
in our app — Stripe Checkout hosts everything.

### Files to touch

- `app/api/stripe/checkout/route.ts` (new) — POST creates session
- `app/api/stripe/webhook/route.ts` (new) — POST receives Stripe events
- `app/api/stripe/portal/route.ts` (new) — POST creates Customer Portal session
- `lib/stripe.ts` (new) — singleton Stripe client
- `lib/env.ts` (new or edit) — validate `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` env vars at boot
- `package.json` — add `stripe` dep

### Env vars (nisha sets these in Vercel + .env.local)

```
STRIPE_SECRET_KEY=sk_test_...           # secret, server-only
STRIPE_WEBHOOK_SECRET=whsec_...         # secret
STRIPE_PRICE_PARENT_MONTHLY=price_...
STRIPE_PRICE_PARENT_ANNUAL=price_...
STRIPE_PRICE_TUTOR_PRO_MONTHLY=price_...
STRIPE_PRICE_TUTOR_PRO_ANNUAL=price_...
STRIPE_PRICE_SIBLING_ADDON_MONTHLY=price_...   # used in STRIPE-6
NEXT_PUBLIC_APP_URL=https://padi-mvp.vercel.app
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is NOT needed — Checkout is
fully hosted, no client SDK.

### Requirements

**`POST /api/stripe/checkout`**
- Auth required. Read tenant_id from session.
- Body: `{ plan_id: 'parent_monthly' | ... }`.
- Map `plan_id` → `STRIPE_PRICE_<…>` env var.
- Look up existing `subscriptions.stripe_customer_id` for the tenant;
  if absent, leave `customer` blank and pass `customer_email`.
- Create session with:
  ```ts
  {
    mode: 'subscription',
    line_items: [{ price: <resolved_price_id>, quantity: 1 }],
    success_url: `${APP_URL}/account/billing?checkout=success`,
    cancel_url: `${APP_URL}/pricing?checkout=canceled`,
    client_reference_id: tenant_id,                  // CRITICAL: webhook reads this
    subscription_data: {
      trial_period_days: <remaining_trial_days_or_undefined>,
      metadata: { tenant_id, plan_id }
    },
    metadata: { tenant_id, plan_id }
  }
  ```
- `trial_period_days`: if the tenant's `subscriptions.trial_ends_at`
  is still in the future, pass the remaining days so Stripe
  preserves the trial. If trial has ended, no `trial_period_days`.
- Return `{ url: session.url }`. Client `window.location` to it.

**`POST /api/stripe/portal`**
- Auth required. Read tenant_id.
- Look up `stripe_customer_id`; 404 if not set yet.
- Create Stripe Billing Portal session, `return_url` =
  `${APP_URL}/account/billing`.
- Return `{ url }`.

**`POST /api/stripe/webhook`**
- Verify signature with `STRIPE_WEBHOOK_SECRET`. Reject 400 on
  failure.
- Use service-role Supabase client (RLS bypass).
- Handle these event types, all by upserting into `subscriptions`
  by `tenant_id` (read from `client_reference_id` or `metadata`):
  | Event | What we set |
  |---|---|
  | `checkout.session.completed` | `stripe_customer_id`, `stripe_subscription_id`, `status` (from subscription), `plan_id` from metadata, `current_period_end`, `trial_ends_at` (if applicable) |
  | `customer.subscription.updated` | `status`, `current_period_end`, `cancel_at_period_end`, `plan_id` (re-resolve from line items) |
  | `customer.subscription.deleted` | `status='canceled'`, `current_period_end` unchanged |
  | `invoice.payment_failed` | `status='past_due'` |
  | `invoice.payment_succeeded` | if was `past_due`, flip to `active`. Update `current_period_end`. |
- Idempotency: Stripe replays events. Don't fail on a second
  apply — the upserts are idempotent by `(tenant_id)` unique key.
- Respond 200 fast (Stripe times out at 30s). Don't do slow work
  inline.

### Acceptance Criteria

**Happy path checkout (trial preserved)**
Given a tenant with `trial_ends_at` 10 days in the future
When the user POSTs `/api/stripe/checkout` with `plan_id`
Then a Stripe Checkout session is created with
`trial_period_days: 10`
And user is redirected to the hosted Stripe page

**Webhook on completed checkout**
Given a `checkout.session.completed` event arrives with
`client_reference_id = <tenant_id>`
When the webhook handler runs
Then `subscriptions` for that tenant has
`stripe_customer_id`, `stripe_subscription_id`, `status='trialing'`
(if trial still active) or `status='active'` (if paid immediately)
And `plan_id` matches the price purchased

**Cancellation flow**
Given user cancels in Stripe Customer Portal
When `customer.subscription.updated` webhook arrives with
`cancel_at_period_end: true`
Then `subscriptions.cancel_at_period_end = true`
And `status` stays `active` (user keeps access until period ends)

**Failed payment**
Given `invoice.payment_failed` arrives
Then `subscriptions.status='past_due'`
And the gate hook (STRIPE-4) shows a banner but doesn't block
until 72h later

**Replayed webhook**
Given the same event ID is delivered twice
Then the second delivery makes no DB change
And both return 200

### Out of scope

- Tax (Stripe Tax) — enable in Stripe dashboard, no code change.
- Promo codes — Stripe-side, no code change. (Optional: set
  `allow_promotion_codes: true` in Checkout session.)
- Sibling add-on quantity logic (STRIPE-6).
- Multiple subscriptions per tenant. v1 = one sub per tenant.

### Notes

- `stripe` SDK: pin to the version active when nisha sets up the
  Stripe dashboard. Don't auto-upgrade.
- All routes are App Router server routes with `export const runtime = 'nodejs'`
  (Stripe SDK needs Node, not Edge).
- Webhook handler MUST read the raw body for signature verification
  — use the App Router `req.text()` pattern, not `req.json()`.
- Test webhooks locally with `stripe listen --forward-to localhost:3010/api/stripe/webhook`.
- Log every webhook event ID + outcome to console for the first
  week post-launch. Cheap observability.
