# Paste this into Claude Code to ship STRIPE-2

STRIPE-2 (data model + trialing-by-default) doesn't need any
Stripe account setup. It's a pure code + migration change. Ship
this while you're setting up your Stripe Dashboard in parallel.

## Prompt

```
Read docs/features/stripe-paywall/stripe-02-subscriptions-data-model.md
and ship it end-to-end. Follow the acceptance criteria exactly.
Don't touch STRIPE-3, STRIPE-4, or STRIPE-5 — those are separate
tickets that depend on Stripe env vars I haven't set yet.

Constraints:
- Follow the guardrails in CLAUDE.md (small diffs, reuse existing
  supabase client, keep TypeScript strict).
- Do NOT modify auth or routing. STRIPE-2 only touches the
  bootstrap-tenant route to add a subscriptions insert.
- Migration must use the existing YYYYMMDDhhmmss_name.sql filename
  format.
- lib/subscription.ts must export the six functions listed in the
  ticket with correct types.
- Include the backfill query so existing test tenants get a fresh
  14-day trial.

When done:
1. Run `pnpm lint` and fix any issues.
2. Run `npx tsc --noEmit` and confirm zero errors.
3. Show me the diff summary before committing.
```

## After it ships

Once STRIPE-2 is merged:

1. Do your Stripe Dashboard setup (or use the plugin) — see
   `stripe-dashboard-checklist.md` in this folder.
2. Add the 7 env vars to `.env.local` and Vercel.
3. Paste this next prompt for STRIPE-3:

```
Now ship docs/features/stripe-paywall/stripe-03-checkout-and-webhook.md.
Verify all 7 STRIPE_* env vars from the ticket are set in
.env.local before starting. If any are missing, stop and tell me
which. Same guardrails as before — small diffs, no auth changes.
Test the checkout endpoint with a curl POST after the routes are
wired.
```

4. Then STRIPE-1, STRIPE-4, STRIPE-5 in that order (see epic.md
   for the full ship order).

## Or use BuildLoop

If you'd rather chain STRIPE-1 → STRIPE-4 → STRIPE-5 hands-off:

```
/buildloop-start 3
```

BuildLoop's pm_generate will pick STRIPE-1 as the next feature
(it's next in ship order after STRIPE-2 and STRIPE-3), then chain
through the others.
