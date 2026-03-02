-- Fix: allow tenant_id to be NULL on profiles.
-- The handle_new_user trigger inserts tenant_id = NULL on signup;
-- the bootstrap-tenant API sets it afterwards.
-- The original migration (20260112120000) created the column as NOT NULL,
-- which causes the auth trigger to fail on user signup.

alter table public.profiles
  alter column tenant_id drop not null;
