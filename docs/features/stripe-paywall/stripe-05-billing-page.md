---
id: STRIPE-5
title: "[Dev] /account/billing page + Stripe Customer Portal redirect"
type: story
status: backlog
priority: medium
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
blocked_by: [STRIPE-2, STRIPE-3]
---

### Goal

Authenticated billing page where the user sees their current
subscription state and clicks through to Stripe Customer Portal to
manage card, plan, or cancel. No billing UI built in Padi — Stripe
hosts it.

### Files to touch

- `app/account/layout.tsx` (new) — same shell as teacher/parent
  layouts; for account-level pages
- `app/account/billing/page.tsx` (new, server component)
- `components/BillingPortalButton.tsx` (new, client) — POSTs to
  `/api/stripe/portal` and redirects to returned URL
- Add a "Billing" link to the user menu / nav (find existing menu
  component — if it's `components/UserMenu.tsx` or similar, add an
  entry). Open question: where exactly does the user menu live?
  Best-effort grep — if no menu exists, add a "Billing" link in
  the teacher/parent layout header next to sign-out.

### Requirements

1. **Auth required.** Redirect to `/signin?next=/account/billing` if
   logged out.
2. **Render four states cleanly:**
   - **Trialing:** "You're on a free trial. <N> days left."
     Show plan placeholder ("No plan selected yet") + "Choose a
     plan" → `/pricing`.
   - **Active:** "Active — <plan_name>. Renews <date>." +
     "Manage billing" → portal.
   - **Cancel at period end:** "Active until <date>. Will not
     renew." + "Resume subscription" → portal.
   - **Past due / canceled / expired:** "Subscription paused"
     copy + prominent "Reactivate" → portal (if customer exists)
     else `/pricing`.
3. **`BillingPortalButton`:**
   - Disabled when `stripe_customer_id` is null (no Stripe customer
     yet — show "Choose a plan" → `/pricing` instead).
   - On click: POST `/api/stripe/portal` → window.location to the
     returned `url`.
4. **Success / cancel banners** at the top of the page when query
   params are set:
   - `?checkout=success` → green "Welcome! Subscription active."
     (auto-dismiss after 5s)
   - `?checkout=canceled` → gray "Checkout canceled. No changes
     made."
5. **Plan name display.** Map `plan_id` → human label using
   `lib/copy/pricingCopy.ts`:
   ```ts
   parent_monthly → 'Parent — Monthly'
   parent_annual  → 'Parent — Annual'
   tutor_pro_monthly → 'Tutor Pro — Monthly'
   tutor_pro_annual  → 'Tutor Pro — Annual'
   ```

### Acceptance Criteria

**Trialing**
Given a logged-in user with `status='trialing'`
When they navigate to `/account/billing`
Then they see "<N> days left in trial" and a "Choose a plan" CTA
linking to `/pricing`
And no "Manage billing" button (no customer yet)

**Active monthly subscriber**
Given `status='active'`, plan_id='parent_monthly',
current_period_end = 2026-07-06
When they view billing page
Then "Active — Parent Monthly. Renews July 6, 2026."
And "Manage billing" button is enabled
And tapping it opens the portal

**Cancel at period end**
Given `cancel_at_period_end=true`, `current_period_end` future
Then header says "Active until <date>. Will not renew."
And "Manage billing" enabled

**Past due**
Given `status='past_due'`
Then "Subscription paused" + red callout + "Reactivate" → portal

**Checkout success banner**
Given URL is `/account/billing?checkout=success`
Then green banner shows once and auto-dismisses

**Logged out**
Given no auth
Then redirect to `/signin?next=/account/billing`

### Out of scope

- In-app plan switching UI (let Stripe Portal handle it)
- Invoice history (Stripe Portal handles)
- Tax / address (Stripe Portal)
- Receipt downloads (Stripe Portal)

### Notes

- Server component pulls subscription via `lib/subscription.ts`.
- Client `BillingPortalButton` does the POST; keep the rest server-
  rendered to avoid a hydration round-trip.
- If user menu component doesn't exist, file a follow-up to add a
  proper menu (separate ticket). For now, a "Billing" link in the
  layout header is acceptable.
- Don't expose `stripe_customer_id` or `stripe_subscription_id`
  to the client — only the status / plan_id / dates.
