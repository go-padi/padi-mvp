-- Align students/groups/memberships with tenant-scoped requirements

-- Students: add first/last name columns (keep legacy name for now)
alter table public.students
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Backfill first/last name from legacy name column when possible
update public.students
set first_name = split_part(name, ' ', 1),
    last_name = nullif(btrim(substr(name, length(split_part(name, ' ', 1)) + 1)), '')
where (first_name is null or last_name is null)
  and name is not null;

-- Memberships: enforce one group per student per tenant
create unique index if not exists sgm_one_group_per_student
on public.student_group_memberships(tenant_id, student_id);
