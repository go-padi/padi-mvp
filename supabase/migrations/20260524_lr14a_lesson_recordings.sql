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

-- Tenant-scoped access. Matches the canonical pattern used by teaching_notes,
-- module_assessment, lesson_completions, students: tenant_id is on profiles,
-- distinct from auth.uid().
drop policy if exists "lesson_recordings_select_own_tenant" on public.lesson_recordings;
drop policy if exists "lesson_recordings_insert_own_tenant" on public.lesson_recordings;
drop policy if exists "lesson recordings tenant access" on public.lesson_recordings;
create policy "lesson recordings tenant access"
  on public.lesson_recordings
  for all
  using (
    tenant_id in (select tenant_id from public.profiles where id = auth.uid())
  )
  with check (
    tenant_id in (select tenant_id from public.profiles where id = auth.uid())
  );

-- 2. Storage bucket
insert into storage.buckets (id, name, public)
values ('lesson-recordings', 'lesson-recordings', false)
on conflict (id) do nothing;

-- 3. Storage RLS — gate on the first path segment matching the user's tenant_id.
-- Path scheme: <tenant_id>/<student_id>/<module_id>/<timestamp>.<ext>
drop policy if exists "lesson_recordings_storage_select" on storage.objects;
create policy "lesson_recordings_storage_select"
  on storage.objects
  for select
  using (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "lesson_recordings_storage_insert" on storage.objects;
create policy "lesson_recordings_storage_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- Delete is needed for the in-app "delete recording" affordance (LR-14e).
drop policy if exists "lesson_recordings_storage_delete" on storage.objects;
create policy "lesson_recordings_storage_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );
