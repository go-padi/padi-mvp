-- KAN-120: Fix module_assessment RLS to use profiles-based pattern
-- The JWT-based policy doesn't work because tenant_id is not in the JWT

drop policy if exists "module assessment tenant access" on public.module_assessment;

create policy "module assessment tenant access"
on public.module_assessment
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);
