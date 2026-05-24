-- LR-14a: lesson_recordings table + lesson-recordings storage bucket + RLS.
-- Foundation for the LR-14 audio recording feature. No application code
-- consumes this yet; LR-14b will add the Record/Stop UI + MediaRecorder upload.
-- Idempotent (re-runs safely).

-- 1. Table
create table if not exists public.lesson_recordings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  student_id uuid not null references public.students(id) on delete cascade,
  module_id text not null,
  lesson_completion_id uuid references public.lesson_completions(id) on delete set null,
  storage_path text not null,
  duration_sec integer,
  mime_type text,
  created_at timestamp with time zone not null default now()
);

create index if not exists lesson_recordings_tenant_student_module_idx
  on public.lesson_recordings (tenant_id, student_id, module_id);

create index if not exists lesson_recordings_tenant_created_idx
  on public.lesson_recordings (tenant_id, created_at desc);

alter table public.lesson_recordings enable row level security;

-- SELECT: tenant-scoped read (a teacher can read only their own recordings)
drop policy if exists "lesson_recordings_select_own_tenant" on public.lesson_recordings;
create policy "lesson_recordings_select_own_tenant"
  on public.lesson_recordings
  for select
  using (tenant_id = auth.uid());

-- INSERT: tenant-scoped write (a teacher can only write recordings under their own tenant)
drop policy if exists "lesson_recordings_insert_own_tenant" on public.lesson_recordings;
create policy "lesson_recordings_insert_own_tenant"
  on public.lesson_recordings
  for insert
  with check (tenant_id = auth.uid());

-- (No UPDATE / DELETE policies for v0 — recordings are append-only.)

-- 2. Storage bucket
insert into storage.buckets (id, name, public)
values ('lesson-recordings', 'lesson-recordings', false)
on conflict (id) do nothing;

-- 3. Storage RLS — gate on the first path segment matching auth.uid()
-- Path scheme: <tenant_id>/<student_id>/<module_id>/<timestamp>.<ext>

drop policy if exists "lesson_recordings_storage_select" on storage.objects;
create policy "lesson_recordings_storage_select"
  on storage.objects
  for select
  using (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "lesson_recordings_storage_insert" on storage.objects;
create policy "lesson_recordings_storage_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
