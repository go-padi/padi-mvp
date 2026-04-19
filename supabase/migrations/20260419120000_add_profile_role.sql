-- KAN-128: Add role column to profiles with CHECK constraint
-- Part of the parent/teacher split (epic KAN-127).

-- Step 1: Add role column as nullable so existing rows and the
-- handle_new_user trigger keep working during deploy.
alter table public.profiles
  add column if not exists role text;

-- Step 2: Backfill existing rows with 'teacher' (the prior implicit value).
update public.profiles set role = 'teacher' where role is null;

-- Step 3: Apply CHECK constraint restricting role to the two valid values.
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('parent','teacher'));

-- Step 4: Apply NOT NULL now that every row has a value.
alter table public.profiles
  alter column role set not null;

-- Step 5: Update handle_new_user to include role. The trigger inserts
-- with role='teacher' as a bootstrap value; the signup role picker
-- UPDATEs this to the user's explicit selection before routing to any
-- app surface. "Must be set explicitly at signup" is enforced at the
-- app layer via the picker route guard (KAN-130).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, tenant_id, email, role, created_at)
  values (new.id, null, new.email, 'teacher', now())
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

-- Note on RLS: the existing "read own profile" policy on public.profiles
-- uses row-level select (using (id = auth.uid())), which covers all
-- columns including the new role column. No policy change needed.
