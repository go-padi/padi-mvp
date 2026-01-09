-- Seed Reading subject for all tenants (idempotent)
insert into public.subjects (tenant_id, key, name)
select t.id, 'reading', 'Reading'
from public.tenants t
where not exists (
  select 1
  from public.subjects s
  where s.tenant_id = t.id
    and s.key = 'reading'
);
