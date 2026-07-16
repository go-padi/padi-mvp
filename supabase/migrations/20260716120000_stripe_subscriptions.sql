-- STRIPE-2: subscriptions table + trialing-by-default on tenant create

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique
    references public.tenants(id) on delete cascade,
  status text not null check (status in (
    'trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete'
  )),
  plan_id text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  student_count_at_billing integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_tenant_id_idx on public.subscriptions(tenant_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);

-- Auto-maintain updated_at
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy "tenant members can view their subscription"
  on public.subscriptions
  for select
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- INSERT / UPDATE / DELETE: no policy → only service role can write

-- Backfill existing tenants with a fresh 14-day trial
insert into public.subscriptions (tenant_id, status, trial_ends_at)
select id, 'trialing', now() + interval '14 days'
from public.tenants
where id not in (select tenant_id from public.subscriptions);
