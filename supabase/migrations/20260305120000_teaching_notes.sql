-- Teaching notes: per-student, per-module session observations
-- Replaces the legacy lesson_note table (old schema, broken FKs, no RLS)

create table if not exists public.teaching_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  module_code text not null,
  notes text not null,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  created_at timestamptz not null default now()
);

create index if not exists tn_tenant_student_idx
  on public.teaching_notes(tenant_id, student_id);
create index if not exists tn_module_code_idx
  on public.teaching_notes(tenant_id, module_code);

alter table public.teaching_notes enable row level security;

create policy "teaching notes tenant access"
on public.teaching_notes
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);
