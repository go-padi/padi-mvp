# Stripe Dashboard — 60 second checklist

Fastest path. Do this after STRIPE-2 ships and before STRIPE-3.

## Option A: Use the Claude Code Stripe plugin (recommended)

1. In CC: `/plugin install stripe@claude-plugins-official`
2. Paste sandbox `sk_test_...` and `pk_test_...` from Stripe's onboarding into `.env.local`
3. Tell CC: *"Use the Stripe MCP tools to create these 5 products in the sandbox, then write the Price IDs into `.env.local`:*
   - *Parent Monthly — $14.99/mo recurring*
   - *Parent Annual — $99/yr recurring*
   - *Tutor Pro Monthly — $29/mo recurring*
   - *Tutor Pro Annual — $279/yr recurring*
   - *Sibling Add-on — $4.99/mo recurring*
   
   *Env var names: STRIPE_PRICE_PARENT_MONTHLY, STRIPE_PRICE_PARENT_ANNUAL, STRIPE_PRICE_TUTOR_PRO_MONTHLY, STRIPE_PRICE_TUTOR_PRO_ANNUAL, STRIPE_PRICE_SIBLING_ADDON_MONTHLY."*
4. Done for products. Skip to step 6 below.

## Option B: Manual dashboard clicks

1. **Products** → **Add product** — repeat 5 times:
   | Name | Price | Interval |
   |---|---|---|
   | Padi Parent Monthly | $14.99 | Monthly |
   | Padi Parent Annual | $99.00 | Yearly |
   | Padi Tutor Pro Monthly | $29.00 | Monthly |
   | Padi Tutor Pro Annual | $279.00 | Yearly |
   | Padi Sibling Add-on | $4.99 | Monthly |
2. After each: copy the **Price ID** (`price_...`) — you'll need all 5.
3. **Settings → Billing → Customer portal** → activate. Allow: cancel, change plan, update card. Save.
4. **Developers → API keys** → copy `sk_test_...` (secret key).
5. Paste into `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_PARENT_MONTHLY=price_...
   STRIPE_PRICE_PARENT_ANNUAL=price_...
   STRIPE_PRICE_TUTOR_PRO_MONTHLY=price_...
   STRIPE_PRICE_TUTOR_PRO_ANNUAL=price_...
   STRIPE_PRICE_SIBLING_ADDON_MONTHLY=price_...
   ```

## Step 6 — Webhook (both options)

For local testing:
1. Install Stripe CLI if not installed: `brew install stripe/stripe-cli/stripe`
2. `stripe login`
3. `stripe listen --forward-to localhost:3010/api/stripe/webhook`
4. Copy the `whsec_...` it prints → add to `.env.local` as `STRIPE_WEBHOOK_SECRET`
5. Leave `stripe listen` running whenever you're testing checkout locally

For production (do this after Vercel deploy of STRIPE-3):
1. **Developers → Webhooks** → **Add endpoint**
2. URL: `https://padi-mvp.vercel.app/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the endpoint's signing secret (`whsec_...`) → add to Vercel env as `STRIPE_WEBHOOK_SECRET` (production value)

## Step 7 — Verify

- All 7 env vars present in `.env.local`? (`STRIPE_SECRET_KEY`, 5x `STRIPE_PRICE_*`, `STRIPE_WEBHOOK_SECRET`)
- Test card: `4242 4242 4242 4242`, any future date, any CVC
- After STRIPE-3 ships, run one end-to-end: pricing page → checkout → return to `/account/billing` → cancel via portal.

## When to switch from test to live

Do NOT switch until:
- STRIPE-1 through STRIPE-5 all shipped and tested in sandbox
- At least one full trial → paid → cancel flow verified
- Stripe Tax configured (if you'll collect in states/countries that require it)

Then in Stripe Dashboard toggle **View test data** off, repeat the product creation in live mode, swap keys in Vercel env.
