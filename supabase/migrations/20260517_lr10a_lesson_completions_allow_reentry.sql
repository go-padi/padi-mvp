-- LR-10a: Allow lesson re-entry by dropping the unique constraint on
-- (tenant_id, student_id, subject_id, lesson_id) so a student can complete
-- the same lesson more than once. Idempotent and safe to re-run.

alter table public.lesson_completions
  drop constraint if exists lesson_completions_tenant_id_student_id_subject_id_lesson_id_key;
