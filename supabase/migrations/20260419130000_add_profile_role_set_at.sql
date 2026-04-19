-- KAN-130: track whether the role was explicitly chosen by the user.
-- NULL means "role has not been explicitly set — show the picker" regardless
-- of the bootstrap value written by the handle_new_user trigger.
alter table public.profiles
  add column if not exists role_set_at timestamptz;
