-- KAN-62: Replace module_assessments with richer module_assessment table

-- Drop old table (cascade drops RLS policies, triggers, indexes)
drop table if exists public.module_assessments cascade;

-- Create new module_assessment table
create table public.module_assessment (
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

-- RLS
alter table public.module_assessment enable row level security;

create policy "module assessment tenant access" on public.module_assessment
  for all using ((auth.jwt() ->> 'tenant_id') = tenant_id::text)
  with check ((auth.jwt() ->> 'tenant_id') = tenant_id::text);

-- Updated_at trigger
drop trigger if exists module_assessment_set_updated_at on public.module_assessment;
create trigger module_assessment_set_updated_at
before update on public.module_assessment
for each row execute function public.set_updated_at();

-- Storage bucket for audio uploads
insert into storage.buckets (id, name, public)
values ('module-audio', 'module-audio', false)
on conflict (id) do nothing;
