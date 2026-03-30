-- (Use the full schema I provided earlier in chat if you need all policies.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'teaching_mode') THEN
    CREATE TYPE teaching_mode AS ENUM ('individual', 'group');
  END IF;
END$$;

create table if not exists module (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  domain text not null,
  section text,
  title text not null,
  objective text not null,
  materials jsonb,
  steps jsonb,
  extension jsonb,
  summary_hint text
);

-- Curriculum chapters
create table if not exists curriculum_chapter (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  display_order int default 0,
  teaching_mode teaching_mode not null default 'group'
);

-- Curriculum structure
create table if not exists module_group (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  module_count int default 0,
  is_locked boolean default false,
  teaching_mode teaching_mode not null default 'group',
  display_order int default 0
);

create table if not exists module_detail (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references module_group(id) on delete cascade,
  code text not null unique,
  title text not null,
  subtitle text,
  summary text,
  is_locked boolean default false,
  teaching_mode teaching_mode not null default 'group',
  display_order int default 0,
  lesson jsonb,
  metadata jsonb
);

create table if not exists lesson_note (
  id uuid primary key default gen_random_uuid(),
  module_detail_id uuid references module_detail(id) on delete cascade,
  teacher_id text,
  student_id uuid references student(id),
  notes text,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  created_at timestamptz default now()
);
create table if not exists student (
  id uuid primary key default gen_random_uuid(),
  class_id text not null,
  full_name text not null,
  created_at timestamptz default now()
);

alter table module_group
  add column if not exists teaching_mode teaching_mode not null default 'group';

alter table module_group
  add column if not exists chapter_id uuid references curriculum_chapter(id) on delete cascade;

alter table module_detail
  add column if not exists teaching_mode teaching_mode not null default 'group';
