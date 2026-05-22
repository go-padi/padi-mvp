-- LR-13c: Add notes column to lesson_completions so each completion can carry
-- the session observations captured by the teacher. Idempotent and safe to re-run.

alter table public.lesson_completions
  add column if not exists notes text;
