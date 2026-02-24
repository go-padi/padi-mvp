-- Static curriculum content lives in a dedicated schema.
-- App reads through public RPC functions so auth state does not change content source.

create schema if not exists content;

create table if not exists content.phase (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  months text,
  lesson_range text,
  summary text,
  outcomes jsonb,
  is_locked boolean default false,
  display_order integer default 0
);

create table if not exists content.module_group (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references content.phase(id) on delete cascade,
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
  phase_id uuid references content.phase(id) on delete cascade,
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

create index if not exists content_phase_display_order_idx on content.phase(display_order);
create index if not exists content_module_group_phase_idx on content.module_group(phase_id, display_order);
create index if not exists content_module_detail_group_idx on content.module_detail(group_id, display_order);

insert into content.phase (id, code, title, description, months, lesson_range, summary, outcomes, is_locked, display_order)
select id, code, title, description, months, lesson_range, summary, outcomes, is_locked, display_order
from public.phase
on conflict (code) do update
set title = excluded.title,
    description = excluded.description,
    months = excluded.months,
    lesson_range = excluded.lesson_range,
    summary = excluded.summary,
    outcomes = excluded.outcomes,
    is_locked = excluded.is_locked,
    display_order = excluded.display_order;

insert into content.module_group (id, phase_id, code, title, description, module_count, is_locked, display_order, teaching_mode)
select g.id, g.phase_id, g.code, g.title, g.description, g.module_count, g.is_locked, g.display_order, g.teaching_mode
from public.module_group g
join content.phase p on p.id = g.phase_id
on conflict (code) do update
set phase_id = excluded.phase_id,
    title = excluded.title,
    description = excluded.description,
    module_count = excluded.module_count,
    is_locked = excluded.is_locked,
    display_order = excluded.display_order,
    teaching_mode = excluded.teaching_mode;

insert into content.module_detail (id, phase_id, group_id, code, title, subtitle, summary, is_locked, display_order, lesson, metadata, teaching_mode)
select d.id, d.phase_id, d.group_id, d.code, d.title, d.subtitle, d.summary, d.is_locked, d.display_order, d.lesson, d.metadata, d.teaching_mode
from public.module_detail d
join content.phase p on p.id = d.phase_id
join content.module_group g on g.id = d.group_id
on conflict (code) do update
set phase_id = excluded.phase_id,
    group_id = excluded.group_id,
    title = excluded.title,
    subtitle = excluded.subtitle,
    summary = excluded.summary,
    is_locked = excluded.is_locked,
    display_order = excluded.display_order,
    lesson = excluded.lesson,
    metadata = excluded.metadata,
    teaching_mode = excluded.teaching_mode;

grant usage on schema content to anon, authenticated, service_role;
grant select on all tables in schema content to anon, authenticated, service_role;
grant insert, update, delete on all tables in schema content to service_role;
alter default privileges in schema content grant select on tables to anon, authenticated, service_role;
alter default privileges in schema content grant insert, update, delete on tables to service_role;

create or replace function public.content_get_phases()
returns table (
  id uuid,
  code text,
  title text,
  description text,
  months text,
  lesson_range text,
  summary text,
  outcomes jsonb,
  is_locked boolean,
  display_order integer
)
language sql
stable
security definer
set search_path = public, content
as $$
  select p.id, p.code, p.title, p.description, p.months, p.lesson_range, p.summary, p.outcomes, p.is_locked, p.display_order
  from content.phase p
  order by p.display_order asc, p.code asc;
$$;

create or replace function public.content_get_phase(p_code text)
returns table (
  id uuid,
  code text,
  title text,
  description text,
  summary text
)
language sql
stable
security definer
set search_path = public, content
as $$
  select p.id, p.code, p.title, p.description, p.summary
  from content.phase p
  where p.code = p_code
  limit 1;
$$;

create or replace function public.content_get_groups(p_phase_code text, p_teaching_mode public.teaching_mode default null)
returns table (
  id uuid,
  phase_id uuid,
  code text,
  title text,
  description text,
  module_count integer,
  is_locked boolean,
  display_order integer,
  teaching_mode public.teaching_mode
)
language sql
stable
security definer
set search_path = public, content
as $$
  select g.id, g.phase_id, g.code, g.title, g.description, g.module_count, g.is_locked, g.display_order, g.teaching_mode
  from content.module_group g
  join content.phase p on p.id = g.phase_id
  where p.code = p_phase_code
    and (p_teaching_mode is null or g.teaching_mode = p_teaching_mode)
  order by g.display_order asc, g.code asc;
$$;

create or replace function public.content_get_modules(p_group_code text, p_teaching_mode public.teaching_mode default null)
returns table (
  id uuid,
  phase_id uuid,
  group_id uuid,
  code text,
  title text,
  subtitle text,
  summary text,
  is_locked boolean,
  display_order integer,
  lesson jsonb,
  metadata jsonb,
  teaching_mode public.teaching_mode
)
language sql
stable
security definer
set search_path = public, content
as $$
  select m.id, m.phase_id, m.group_id, m.code, m.title, m.subtitle, m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  from content.module_detail m
  join content.module_group g on g.id = m.group_id
  where g.code = p_group_code
    and (p_teaching_mode is null or m.teaching_mode = p_teaching_mode)
  order by m.display_order asc, m.code asc;
$$;

create or replace function public.content_get_module(p_module_code text, p_teaching_mode public.teaching_mode default null)
returns table (
  id uuid,
  phase_id uuid,
  group_id uuid,
  code text,
  title text,
  subtitle text,
  summary text,
  is_locked boolean,
  display_order integer,
  lesson jsonb,
  metadata jsonb,
  teaching_mode public.teaching_mode
)
language sql
stable
security definer
set search_path = public, content
as $$
  select m.id, m.phase_id, m.group_id, m.code, m.title, m.subtitle, m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  from content.module_detail m
  where m.code = p_module_code
    and (p_teaching_mode is null or m.teaching_mode = p_teaching_mode)
  limit 1;
$$;

grant execute on function public.content_get_phases() to anon, authenticated, service_role;
grant execute on function public.content_get_phase(text) to anon, authenticated, service_role;
grant execute on function public.content_get_groups(text, public.teaching_mode) to anon, authenticated, service_role;
grant execute on function public.content_get_modules(text, public.teaching_mode) to anon, authenticated, service_role;
grant execute on function public.content_get_module(text, public.teaching_mode) to anon, authenticated, service_role;
