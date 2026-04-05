-- ============================================
-- Teacher Workspace v1 - Tenant-scoped RLS
-- ============================================

-- Enable RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.groups enable row level security;
alter table public.student_group_memberships enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.module_assessment enable row level security;

-- Profiles: users can read their own profile
create policy "read own profile"
on public.profiles
for select
using (id = auth.uid());

-- Tenants: user can read their tenant
create policy "tenant read access"
on public.tenants
for select
using (
  id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Subjects: tenant scoped read/write
create policy "subjects tenant access"
on public.subjects
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Students
create policy "students tenant access"
on public.students
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Groups
create policy "groups tenant access"
on public.groups
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Student group memberships
create policy "memberships tenant access"
on public.student_group_memberships
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Lesson completions
create policy "lesson completions tenant access"
on public.lesson_completions
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);

-- Module assessment
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
