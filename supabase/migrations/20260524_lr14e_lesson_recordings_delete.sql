-- LR-14e: DELETE policies for lesson_recordings table + lesson-recordings storage bucket.
-- Per LR-14e ticket: teachers can delete their own recordings (test misfires, etc).
-- Idempotent.

drop policy if exists "lesson_recordings_delete_own_tenant" on public.lesson_recordings;
create policy "lesson_recordings_delete_own_tenant"
  on public.lesson_recordings
  for delete
  using (tenant_id = auth.uid());

drop policy if exists "lesson_recordings_storage_delete" on storage.objects;
create policy "lesson_recordings_storage_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'lesson-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
