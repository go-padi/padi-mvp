-- Ensure a public.profiles row exists for every auth.users row.
-- 1) Create profile on signup
-- 2) Backfill missing profiles for existing users
-- Safe to rerun.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, tenant_id, email, created_at)
  values (new.id, null, new.email, now())
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

insert into public.profiles (id, tenant_id, email, created_at)
select u.id, null, u.email, now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
