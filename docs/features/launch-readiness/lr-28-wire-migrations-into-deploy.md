---
id: LR-28
title: "[Infra] Wire Supabase migrations into the deploy pipeline so they don't silently miss prod"
type: story
status: ready
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: lr-14-bug-01-surface-2026-05-24
related: LR-14, LR-14-bug-01
handling: cc
---

### Goal

Make it impossible for a Supabase migration in
`supabase/migrations/` to ship to prod without being applied. Today every
new migration is at risk of the silent miss that broke LR-14 record →
stop end-to-end.

This is the **first priority** to fix before any further launch-readiness
ticket — every future feature touching schema, RLS, or storage has the same
failure mode.

### Background

LR-14 (in-browser audio recording) shipped its UI, hook, and migration on
2026-05-24. The migration created the `lesson_recordings` table and the
`lesson-recordings` storage bucket plus RLS. On live test the record/stop
flow errored: `StorageApiError: Bucket not found`.

Investigation: prod's `supabase_migrations.schema_migrations` only contains
3 entries (early-access, quiz, waitlist — marketing-site tables). The app's
entire schema was provisioned out-of-band, and there is no automated
`supabase db push` in the deploy pipeline. Every LR migration committed to
the repo since the initial schema dump has had to be applied by hand, and
nobody was tracking which ones had landed where.

Full root-cause writeup:
`docs/features/launch-readiness/iterations/lr-14-in-browser-audio-recording/bugs/lr-14-bug-01-prod-migration-not-applied.md`

### Requirements

1. **Automate migration application on deploy.** When a commit to `main`
   adds or modifies a file under `supabase/migrations/`, the deploy
   pipeline (Vercel build hook or a GitHub Action) must run
   `supabase db push` (or equivalent) against prod before — or as part of —
   the Vercel build that ships the matching app code. Code that depends on
   a new table/bucket must never reach prod before the schema does.

2. **Backfill the prod migration log.** The 12+ migrations that have been
   applied by hand since the marketing-site three are not in
   `supabase_migrations.schema_migrations`. Insert version + name rows for
   every migration file in `supabase/migrations/` whose objects exist in
   prod (check `pg_tables`, `pg_policies`, `storage.buckets`). After
   backfill, `supabase migration list` should show no drift.

3. **Schema-parity check in BuildLoop's deploy_prod phase.** Before the
   loop declares a ticket "shipped to prod", compare
   `supabase/migrations/` files against prod's migration log and refuse
   to declare done if there is unapplied schema in the diff. This is the
   safety net for the next failure mode (e.g. credential blip, deploy
   skipped).

4. **Runbook for the manual case.** Until #1 lands, add a one-page
   `docs/runbooks/applying-migrations.md` documenting the exact command
   to run, where the prod Supabase project lives, and which env var
   holds the access token. The deploy-checklist skill should reference it.

### Acceptance criteria

1. A new migration committed to a PR on `main` lands in prod's
   `supabase_migrations.schema_migrations` table by the time the
   accompanying Vercel deploy is live.
2. Backfilled prod migration log matches the migration filenames in the
   repo (no orphans either direction).
3. BuildLoop's `deploy_prod` phase fails loudly if a ticket's diff adds
   a migration that hasn't been applied to prod.
4. `docs/runbooks/applying-migrations.md` exists and is linked from
   `engineering:deploy-checklist`.

### Out of scope

- Branch-database setup. Prod-first.
- Migration rollback strategy. Add as a follow-up ticket.
- RLS-policy linting against the canonical tenant pattern (LR-14a got the
  pattern wrong — separate ticket if we want a check for it).

### Notes for the implementer

- Supabase project id: `rcrjfweguedbtfngeovp`.
- `supabase db push` needs `SUPABASE_ACCESS_TOKEN` + the project ref.
- Vercel deploy hook lives in the Vercel dashboard; alternative is a
  GitHub Action that runs on push to `main` and applies migrations
  before triggering the Vercel deploy.
- The LR-14a migration file in the repo has already been edited to
  match the corrected RLS that's live in prod, so a fresh `supabase
  db push` against a branch DB will pick up the right thing.
