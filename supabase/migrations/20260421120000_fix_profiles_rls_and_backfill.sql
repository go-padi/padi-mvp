-- BUG-role-save-400: fix role-save failures.
--
-- Root cause: public.profiles has a SELECT policy but no INSERT/UPDATE
-- policies. With RLS enabled, every client-side write is denied. The
-- handle_new_user trigger runs SECURITY DEFINER so its inserts succeed —
-- this masked the problem for new signups. Pre-existing users with no
-- profile row, or any user trying to set role via /welcome/role, hit a 400.
--
-- Fix: (1) backfill missing profile rows for users created before the
-- trigger landed, (2) add self-INSERT and self-UPDATE RLS policies so
-- the picker's upsert works.

-- 1. Backfill: create a 'teacher'-bootstrapped profile row for any
--    auth.users record that doesn't have one. role_set_at stays NULL so
--    the picker will still prompt these users to choose explicitly.
insert into public.profiles (id, email, role)
select u.id, u.email, 'teacher'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- 2. Self-insert policy (needed for client-side upsert(onConflict: 'id')
--    when no row exists yet; defense in depth against trigger hiccups).
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert
  with check (id = auth.uid());

-- 3. Self-update policy (this is the one actually blocking /welcome/role).
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());
