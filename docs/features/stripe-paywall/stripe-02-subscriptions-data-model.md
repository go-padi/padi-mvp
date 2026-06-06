---
id: STRIPE-2
title: "[Dev] subscriptions table + trialing-by-default on tenant create"
type: story
status: backlog
priority: highest
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
blocks: [STRIPE-3, STRIPE-4, STRIPE-5]
---

### Goal

Add a `public.subscriptions` table keyed on tenant. Every new
tenant starts a 14-day trial automatically — no Stripe roundtrip
needed at signup. Status flips to `active` when Stripe webhooks
confirm a successful checkout.

### Files to touch

- `supabase/migrations/<timestamp>_stripe_subscriptions.sql` (new)
- `supabase/rls/subscriptions.sql` (new) — readable by tenant
  members, writable only by service role
- `lib/subscription.ts` (new) — typed accessors:
  `getSubscription(tenantId)`, `isInTrial()`, `isActive()`,
  `isGated()`, `daysLeftInTrial()`
- `app/api/auth/bootstrap-tenant/route.ts` — already creates the
  tenant on first signin; add a `subscriptions` insert with
  `status: 'trialing'` and `trial_ends_at: now() + 14 days`

### Schema

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique
    references public.tenants(id) on delete cascade,
  status text not null check (status in (
    'trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete'
  )),
  plan_id text,                          -- 'parent_monthly' | 'parent_annual' | 'tutor_pro_monthly' | 'tutor_pro_annual'
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  student_count_at_billing integer,      -- for sibling add-on accounting in STRIPE-6
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_tenant_id_idx on public.subscriptions(tenant_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);
```

### Requirements

1. **Migration creates the table** and the indexes above.
2. **RLS:** any profile in the tenant can `SELECT`; only the
   service role can `INSERT` / `UPDATE` / `DELETE`. Webhook handler
   uses the service role.
3. **Trial-on-tenant-create.** Modify
   `app/api/auth/bootstrap-tenant/route.ts` (or wherever the
   tenant is first inserted) so that immediately after the tenant
   row is created, a `subscriptions` row is created with:
   ```ts
   { tenant_id, status: 'trialing', trial_ends_at: now + 14 days }
   ```
4. **`lib/subscription.ts`** — exports:
   ```ts
   type Subscription = { ... } // mirror schema
   getSubscription(tenantId: string): Promise<Subscription | null>
   isInTrial(s: Subscription): boolean
   isActive(s: Subscription): boolean   // trialing OR active OR cancel_at_period_end-and-not-past-period-end
   isGated(s: Subscription): boolean    // expired OR past_due-after-grace OR canceled-after-period-end
   daysLeftInTrial(s: Subscription): number
   ```
5. **Backfill existing tenants** in the same migration:
   ```sql
   insert into public.subscriptions (tenant_id, status, trial_ends_at)
   select id, 'trialing', now() + interval '14 days'
   from public.tenants
   where id not in (select tenant_id from public.subscriptions);
   ```
   *Note:* this gives every existing test tenant a fresh 14-day
   trial. Acceptable for pre-launch; review before launch run.

### Acceptance Criteria

**New signup gets trial automatically**
Given a brand new user signs up and gets a tenant bootstrapped
When the bootstrap completes
Then a `subscriptions` row exists for that tenant with
`status='trialing'` and `trial_ends_at` exactly 14 days from
the tenant `created_at`

**RLS**
Given user A in tenant 1 and user B in tenant 2
When A queries `subscriptions`
Then A sees only tenant 1's row (or nothing if their join is missing)
And A can't write any row

**`isGated` correctness**
- `status='trialing'` and `trial_ends_at` in the future → `false`
- `status='trialing'` and `trial_ends_at` in the past → `true`
- `status='active'` and `current_period_end` in the future → `false`
- `status='canceled'` and `current_period_end` in the future → `false`
- `status='canceled'` and `current_period_end` in the past → `true`
- `status='past_due'` for less than 72h → `false`
- `status='past_due'` for more than 72h → `true`
- `status='expired'` → always `true`

### Out of scope

- Stripe webhook handler (STRIPE-3)
- UI for trial state (STRIPE-4)
- Sibling counting logic (STRIPE-6)

### Notes

- Don't store any PII in this table beyond what Stripe gives us.
- `stripe_customer_id` and `stripe_subscription_id` are nullable —
  they get populated by the webhook (STRIPE-3) after first
  checkout.
- 3-day past-due grace is hard-coded for v1; revisit if churn data
  shows otherwise.
- Reuse the existing migration timestamp format —
  `YYYYMMDDhhmmss_name.sql`.
