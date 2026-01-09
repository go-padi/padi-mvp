-- Teacher workspace v1 (tenant-scoped)
-- Additive migration; preserves existing content tables

-- Ensure UUID generation is available
create extension if not exists "pgcrypto";

-- Safely rename legacy student table if present
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'student'
  ) then
    alter table public.student rename to student_legacy;
  end if;
end $$;

-- Tenants
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

-- Profiles (auth.users -> tenant)
create table if not exists public.profiles (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_tenant_id_idx on public.profiles(tenant_id);

-- Subjects (Reading now, Math later)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  key text not null, -- e.g. 'reading', 'math'
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create index if not exists subjects_tenant_id_idx on public.subjects (tenant_id);

-- updated_at helper function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Students (tenant-scoped)
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_tenant_id_idx on public.students(tenant_id);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

-- Groups (per tenant, per subject)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, subject_id, name)
);

create index if not exists groups_tenant_id_idx on public.groups(tenant_id);
create index if not exists groups_subject_id_idx on public.groups(subject_id);

-- Student group memberships (enforce one active group per subject per student)
create table if not exists public.student_group_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  active boolean not null default true,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sgm_tenant_id_idx on public.student_group_memberships(tenant_id);
create index if not exists sgm_student_id_idx on public.student_group_memberships(student_id);
create index if not exists sgm_group_id_idx on public.student_group_memberships(group_id);
create index if not exists sgm_subject_id_idx on public.student_group_memberships(subject_id);

create unique index if not exists sgm_one_active_group_per_subject
on public.student_group_memberships(tenant_id, student_id, subject_id)
where active = true;

-- Ensure membership.subject_id matches groups.subject_id
create or replace function public.sgm_subject_matches_group()
returns trigger as $$
declare
  grp_subject uuid;
begin
  select subject_id into grp_subject from public.groups where id = new.group_id;

  if grp_subject is null then
    raise exception 'Group not found';
  end if;

  if new.subject_id <> grp_subject then
    raise exception 'Membership subject_id must match group.subject_id';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists sgm_subject_matches_group_trg on public.student_group_memberships;
create trigger sgm_subject_matches_group_trg
before insert or update on public.student_group_memberships
for each row execute function public.sgm_subject_matches_group();

-- Lesson completions (lesson-level progress)
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,

  phase_id text not null,
  developmental_area_id text not null,
  module_id text not null,
  lesson_id text not null,

  completed_at timestamptz not null default now(),
  unique (tenant_id, student_id, subject_id, lesson_id)
);

create index if not exists lc_tenant_id_idx on public.lesson_completions(tenant_id);
create index if not exists lc_student_module_idx on public.lesson_completions(tenant_id, student_id, subject_id, module_id);
create index if not exists lc_student_phase_idx on public.lesson_completions(tenant_id, student_id, subject_id, phase_id);

-- Module assessments (notes; drives "Completed" status)
create table if not exists public.module_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,

  module_id text not null,
  notes text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (tenant_id, student_id, subject_id, module_id)
);

create index if not exists ma_tenant_id_idx on public.module_assessments(tenant_id);
create index if not exists ma_student_module_idx on public.module_assessments(tenant_id, student_id, subject_id, module_id);

drop trigger if exists module_assessments_set_updated_at on public.module_assessments;
create trigger module_assessments_set_updated_at
before update on public.module_assessments
for each row execute function public.set_updated_at();
