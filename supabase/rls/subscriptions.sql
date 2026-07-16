-- RLS for public.subscriptions
-- Tenant members can SELECT their own subscription row.
-- INSERT / UPDATE / DELETE are restricted to the service role (no permissive policy = denied).

alter table public.subscriptions enable row level security;

create policy "tenant members can view their subscription"
  on public.subscriptions
  for select
  using (
    tenant_id in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );
