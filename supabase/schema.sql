-- schema and policies trimmed for brevity in this starter
-- (Use the full schema I provided earlier in chat if you need all policies.)
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
create table if not exists student (
  id uuid primary key default gen_random_uuid(),
  class_id text not null,
  full_name text not null,
  created_at timestamptz default now()
);
