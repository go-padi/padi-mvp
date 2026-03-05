# Padi — Account & Service Map

Last updated: March 2, 2026

## Supabase (Database + Auth)

- **Account email:** nisha.iyer@go-padi.com
- **Login:** Email sign-in at supabase.com
- **Project URL:** Check `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`
- **Keys location:** `.env.local` (anon key + service role key)
- **Exposed schemas:** public, graphql_public, content
- **Notes:** Fresh project created March 2026, replacing the old `uqzvlbkncpystwdkvaoc` project. Schema + curriculum seeded from repo files.

## GitHub

- **Org:** go-padi
- **Repo:** go-padi/padi-mvp (private)
- **Remote:** git@github.com:go-padi/padi-mvp.git (SSH)
- **Git identity:** Nisha Iyer \<nisha.iyer@go-padi.com\>

## Local Dev

- **Dev server:** `pnpm dev -- --port 3010` → http://localhost:3010
- **Node package manager:** pnpm
- **Env file:** `.env.local` (not committed — holds Supabase keys + site URL)

## What Lives Where

| Thing | Location |
|---|---|
| DB schema & migrations | `supabase/migrations/` (7 files) |
| RLS policies | `supabase/rls/` |
| Fresh setup script | `supabase/fresh-setup.sql` |
| Seed scripts | `scripts/seed-curriculum.ts`, `scripts/seed-modules.ts` |
| Supabase client | `lib/supabase.ts` |
| Env template | `.env.example` |
