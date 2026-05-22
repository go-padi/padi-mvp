-- LR-11c: sequence_index column on content tables
-- Splits display_order's overloaded "curriculum sequence" + "layout order"
-- responsibilities. Backfilled from display_order so existing UI behavior
-- is preserved. RPC ORDER BY clauses updated to prefer sequence_index.

alter table content.phase
  add column if not exists sequence_index integer;
update content.phase set sequence_index = display_order where sequence_index is null;
create index if not exists phase_sequence_index_idx on content.phase (sequence_index);

alter table content.module_group
  add column if not exists sequence_index integer;
update content.module_group set sequence_index = display_order where sequence_index is null;
create index if not exists module_group_sequence_index_idx on content.module_group (sequence_index);

alter table content.module_detail
  add column if not exists sequence_index integer;
update content.module_detail set sequence_index = display_order where sequence_index is null;
create index if not exists module_detail_sequence_index_idx on content.module_detail (sequence_index);

-- Update RPCs to use sequence_index with display_order as fallback.

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
  order by g.sequence_index asc nulls last, g.display_order asc, g.code asc;
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
  order by m.sequence_index asc nulls last, m.display_order asc, m.code asc;
$$;
