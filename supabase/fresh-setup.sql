-- ============================================================
-- PADI Fresh Supabase Setup
-- Run this in the SQL Editor of a brand-new Supabase project
-- ============================================================
-- After running this script:
--   1. Update .env.local with your new project URL + keys
--   2. Run: pnpm seed:curriculum
--   3. Run the "STEP 2" block at the bottom to copy seeded data into the content schema
-- ============================================================


-- ============================================================
-- STEP 1: FULL SCHEMA SETUP
-- ============================================================

-- =========================
-- Extensions
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- Enums
-- =========================
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'teaching_mode' and n.nspname = 'public'
  ) then
    create type public.teaching_mode as enum ('individual', 'group');
  end if;
end $$;

-- =========================
-- Legacy / Content Tables (public schema - used by seed scripts)
-- =========================

create table if not exists public.curriculum_chapter (
  id uuid not null default gen_random_uuid(),
  code text not null,
  title text not null,
  description text,
  display_order integer default 0,
  teaching_mode public.teaching_mode not null default 'group'::public.teaching_mode
);

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_chapter_pkey ON public.curriculum_chapter USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS curriculum_chapter_code_key ON public.curriculum_chapter USING btree (code);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'curriculum_chapter_pkey') then
    alter table public.curriculum_chapter add constraint curriculum_chapter_pkey PRIMARY KEY using index curriculum_chapter_pkey;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'curriculum_chapter_code_key') then
    alter table public.curriculum_chapter add constraint curriculum_chapter_code_key UNIQUE using index curriculum_chapter_code_key;
  end if;
end $$;

create table if not exists public.module_group (
  id uuid not null default gen_random_uuid(),
  code text not null,
  title text not null,
  description text,
  module_count integer default 0,
  is_locked boolean default false,
  display_order integer default 0,
  teaching_mode public.teaching_mode not null default 'group'::public.teaching_mode
);

create table if not exists public.module_detail (
  id uuid not null default gen_random_uuid(),
  group_id uuid,
  code text not null,
  title text not null,
  subtitle text,
  summary text,
  is_locked boolean default false,
  display_order integer default 0,
  lesson jsonb,
  metadata jsonb,
  teaching_mode public.teaching_mode not null default 'group'::public.teaching_mode
);

create table if not exists public.module (
  id uuid not null default gen_random_uuid(),
  code text not null,
  domain text not null,
  section text,
  title text not null,
  objective text not null,
  materials jsonb,
  steps jsonb,
  extension jsonb,
  summary_hint text
);

-- Primary keys
CREATE UNIQUE INDEX IF NOT EXISTS module_group_pkey ON public.module_group USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS module_group_code_key ON public.module_group USING btree (code);
CREATE UNIQUE INDEX IF NOT EXISTS module_detail_pkey ON public.module_detail USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS module_detail_code_key ON public.module_detail USING btree (code);
CREATE UNIQUE INDEX IF NOT EXISTS module_pkey ON public.module USING btree (id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'module_group_pkey') then
    alter table public.module_group add constraint module_group_pkey PRIMARY KEY using index module_group_pkey;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'module_group_code_key') then
    alter table public.module_group add constraint module_group_code_key UNIQUE using index module_group_code_key;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'module_detail_pkey') then
    alter table public.module_detail add constraint module_detail_pkey PRIMARY KEY using index module_detail_pkey;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'module_detail_code_key') then
    alter table public.module_detail add constraint module_detail_code_key UNIQUE using index module_detail_code_key;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'module_pkey') then
    alter table public.module add constraint module_pkey PRIMARY KEY using index module_pkey;
  end if;
end $$;

-- Add chapter_id FK to module_group
alter table public.module_group add column if not exists chapter_id uuid;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'module_group_chapter_id_fkey') then
    alter table public.module_group add constraint module_group_chapter_id_fkey
      FOREIGN KEY (chapter_id) REFERENCES public.curriculum_chapter(id) ON DELETE CASCADE;
  end if;
end $$;

-- Foreign keys for legacy tables
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'module_detail_group_id_fkey') then
    alter table public.module_detail add constraint module_detail_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES public.module_group(id) ON DELETE CASCADE;
  end if;
end $$;

-- RLS + public read for legacy content tables
alter table public.curriculum_chapter enable row level security;
alter table public.module_group enable row level security;
alter table public.module_detail enable row level security;
alter table public.module enable row level security;

create policy "public read curriculum chapters" on public.curriculum_chapter for select to anon using (true);
create policy "public read module groups" on public.module_group for select to anon using (true);
create policy "public read module detail" on public.module_detail for select to anon using (true);
create policy "public read module" on public.module for select to anon using (true);

-- Grants for legacy content tables
grant select, insert, update, delete, references, trigger, truncate on table public.curriculum_chapter to anon, authenticated, service_role;
grant select, insert, update, delete, references, trigger, truncate on table public.module to anon, authenticated, service_role;
grant select, insert, update, delete, references, trigger, truncate on table public.module_detail to anon, authenticated, service_role;
grant select, insert, update, delete, references, trigger, truncate on table public.module_group to anon, authenticated, service_role;


-- =========================
-- Teacher Workspace Tables (tenant-scoped)
-- =========================

-- Tenants
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

-- Profiles (auth.users -> tenant mapping)
create table if not exists public.profiles (
  id uuid primary key,
  tenant_id uuid references public.tenants(id) on delete restrict,
  email text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_tenant_id_idx on public.profiles(tenant_id);

-- Subjects (Reading now, Math later)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  key text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);
create index if not exists subjects_tenant_id_idx on public.subjects(tenant_id);

-- Helper: auto-update updated_at
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
  first_name text,
  last_name text,
  notes text,
  focus_areas text[] not null default array['Learning Sensorially'],
  progress_percent int not null default 0,
  progress_label text,
  assessment_status text not null default 'Not started',
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

-- Student group memberships
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

create unique index if not exists sgm_one_group_per_student
on public.student_group_memberships(tenant_id, student_id);

create or replace function public.sgm_subject_matches_group()
returns trigger as $$
declare
  grp_subject uuid;
begin
  select subject_id into grp_subject from public.groups where id = new.group_id;
  if grp_subject is null then raise exception 'Group not found'; end if;
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

-- Lesson completions
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  developmental_area_id text not null,
  module_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  unique (tenant_id, student_id, subject_id, lesson_id)
);
create index if not exists lc_tenant_id_idx on public.lesson_completions(tenant_id);
create index if not exists lc_student_module_idx on public.lesson_completions(tenant_id, student_id, subject_id, module_id);

-- Module assessment
create table if not exists public.module_assessment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  student_id uuid not null references public.students(id),
  subject_id uuid not null references public.subjects(id),
  module_id text not null,
  notes text,
  audio_url text,
  prediction_json jsonb,
  teacher_feedback text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'needs_review')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, student_id, subject_id, module_id)
);

drop trigger if exists module_assessment_set_updated_at on public.module_assessment;
create trigger module_assessment_set_updated_at
before update on public.module_assessment
for each row execute function public.set_updated_at();


-- =========================
-- Auth Trigger: create profile on signup
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, tenant_id, email, created_at)
  values (new.id, null, new.email, now())
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- =========================
-- RLS: Tenant-scoped workspace tables
-- =========================

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.groups enable row level security;
alter table public.student_group_memberships enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.module_assessment enable row level security;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "tenant read access" on public.tenants
  for select using (id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "subjects tenant access" on public.subjects
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "students tenant access" on public.students
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "groups tenant access" on public.groups
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "memberships tenant access" on public.student_group_memberships
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "lesson completions tenant access" on public.lesson_completions
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

create policy "module assessment tenant access" on public.module_assessment
  for all using ((auth.jwt() ->> 'tenant_id') = tenant_id::text)
  with check ((auth.jwt() ->> 'tenant_id') = tenant_id::text);


-- =========================
-- Content Schema (static curriculum)
-- =========================

create schema if not exists content;

create table if not exists content.curriculum_chapter (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  display_order integer default 0,
  teaching_mode public.teaching_mode not null default 'group'
);

create table if not exists content.module_group (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  module_count integer default 0,
  is_locked boolean default false,
  display_order integer default 0,
  teaching_mode public.teaching_mode not null default 'group'
);

create table if not exists content.module_detail (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references content.module_group(id) on delete cascade,
  code text not null unique,
  title text not null,
  subtitle text,
  summary text,
  is_locked boolean default false,
  display_order integer default 0,
  lesson jsonb,
  metadata jsonb,
  teaching_mode public.teaching_mode not null default 'group'
);

alter table content.module_group add column if not exists chapter_id uuid references content.curriculum_chapter(id) on delete cascade;

create index if not exists content_module_group_display_order_idx on content.module_group(display_order);
create index if not exists content_module_detail_group_idx on content.module_detail(group_id, display_order);

-- Content schema grants
grant usage on schema content to anon, authenticated, service_role;
grant select on all tables in schema content to anon, authenticated, service_role;
grant insert, update, delete on all tables in schema content to service_role;
alter default privileges in schema content grant select on tables to anon, authenticated, service_role;
alter default privileges in schema content grant insert, update, delete on tables to service_role;


-- =========================
-- Public RPC Functions (content reads)
-- =========================

create or replace function public.content_get_chapters(
  p_teaching_mode public.teaching_mode default null
)
returns table (
  id uuid, code text, title text, description text,
  display_order integer, teaching_mode public.teaching_mode, group_count integer
)
language sql stable security definer
set search_path = public, content
as $$
  select c.id, c.code, c.title, c.description, c.display_order, c.teaching_mode,
         (select count(*)::int from content.module_group g where g.chapter_id = c.id) as group_count
  from content.curriculum_chapter c
  where (p_teaching_mode is null or c.teaching_mode = p_teaching_mode)
  order by c.display_order asc;
$$;

create or replace function public.content_get_groups(
  p_teaching_mode public.teaching_mode default null,
  p_chapter_code text default null
)
returns table (
  id uuid, code text, title text, description text,
  module_count integer, is_locked boolean, display_order integer,
  teaching_mode public.teaching_mode
)
language sql stable security definer
set search_path = public, content
as $$
  select g.id, g.code, g.title, g.description,
         g.module_count, g.is_locked, g.display_order, g.teaching_mode
  from content.module_group g
  left join content.curriculum_chapter c on c.id = g.chapter_id
  where (p_teaching_mode is null or g.teaching_mode = p_teaching_mode)
    and (p_chapter_code is null or c.code = p_chapter_code)
  order by g.display_order asc, g.code asc;
$$;

create or replace function public.content_get_modules(
  p_group_code text,
  p_teaching_mode public.teaching_mode default null
)
returns table (
  id uuid, group_id uuid, code text, title text,
  subtitle text, summary text, is_locked boolean, display_order integer,
  lesson jsonb, metadata jsonb, teaching_mode public.teaching_mode
)
language sql stable security definer
set search_path = public, content
as $$
  select m.id, m.group_id, m.code, m.title, m.subtitle,
         m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  from content.module_detail m
  join content.module_group g on g.id = m.group_id
  where g.code = p_group_code
    and (p_teaching_mode is null or m.teaching_mode = p_teaching_mode)
  order by m.display_order asc, m.code asc;
$$;

create or replace function public.content_get_module(
  p_module_code text,
  p_teaching_mode public.teaching_mode default null
)
returns table (
  id uuid, group_id uuid, code text, title text,
  subtitle text, summary text, is_locked boolean, display_order integer,
  lesson jsonb, metadata jsonb, teaching_mode public.teaching_mode
)
language sql stable security definer
set search_path = public, content
as $$
  select m.id, m.group_id, m.code, m.title, m.subtitle,
         m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  from content.module_detail m
  where m.code = p_module_code
    and (p_teaching_mode is null or m.teaching_mode = p_teaching_mode)
  limit 1;
$$;

-- RPC grants
grant execute on function public.content_get_chapters(public.teaching_mode) to anon, authenticated, service_role;
grant execute on function public.content_get_groups(public.teaching_mode, text) to anon, authenticated, service_role;
grant execute on function public.content_get_modules(text, public.teaching_mode) to anon, authenticated, service_role;
grant execute on function public.content_get_module(text, public.teaching_mode) to anon, authenticated, service_role;


-- ============================================================
-- STEP 2: COPY SEEDED DATA INTO CONTENT SCHEMA
-- ============================================================
-- Run this AFTER `pnpm seed:curriculum` populates the public tables.
-- ============================================================

/*
insert into content.curriculum_chapter (id, code, title, description, display_order, teaching_mode)
select c.id, c.code, c.title, c.description, c.display_order, c.teaching_mode
from public.curriculum_chapter c
on conflict (code) do update
set title = excluded.title,
    description = excluded.description, display_order = excluded.display_order,
    teaching_mode = excluded.teaching_mode;

insert into content.module_group (id, code, title, description, module_count, is_locked, display_order, teaching_mode, chapter_id)
select g.id, g.code, g.title, g.description, g.module_count, g.is_locked, g.display_order, g.teaching_mode, g.chapter_id
from public.module_group g
on conflict (code) do update
set title = excluded.title,
    description = excluded.description, module_count = excluded.module_count,
    is_locked = excluded.is_locked, display_order = excluded.display_order,
    teaching_mode = excluded.teaching_mode, chapter_id = excluded.chapter_id;

insert into content.module_detail (id, group_id, code, title, subtitle, summary, is_locked, display_order, lesson, metadata, teaching_mode)
select d.id, d.group_id, d.code, d.title, d.subtitle, d.summary, d.is_locked, d.display_order, d.lesson, d.metadata, d.teaching_mode
from public.module_detail d
join content.module_group g on g.id = d.group_id
on conflict (code) do update
set group_id = excluded.group_id,
    title = excluded.title, subtitle = excluded.subtitle,
    summary = excluded.summary, is_locked = excluded.is_locked,
    display_order = excluded.display_order, lesson = excluded.lesson,
    metadata = excluded.metadata, teaching_mode = excluded.teaching_mode;
*/
