-- Initialize student progress defaults for live data

alter table public.students
  add column if not exists phase text not null default 'Phase 1',
  add column if not exists focus_areas text[] not null default array['Learning Sensorially'],
  add column if not exists progress_percent int not null default 0,
  add column if not exists progress_label text,
  add column if not exists assessment_status text not null default 'Not started';

update public.students
set
  phase = coalesce(phase, 'Phase 1'),
  focus_areas = coalesce(focus_areas, array['Learning Sensorially']),
  progress_percent = coalesce(progress_percent, 0),
  assessment_status = coalesce(assessment_status, 'Not started')
where phase is null
  or focus_areas is null
  or progress_percent is null
  or assessment_status is null;
