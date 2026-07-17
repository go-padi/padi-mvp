# Runbook: Applying Supabase migrations

Context: LR-28. Prod's schema was largely provisioned out-of-band before
migrations were tracked, so `supabase_migrations.schema_migrations` in prod
is missing entries for every migration file in this repo. Going forward,
`.github/workflows/deploy-migrations.yml` runs `supabase db push`
automatically on any commit to `main` that touches `supabase/migrations/**`.
This doc covers the one-time manual backfill and general manual-push
commands for when you need to run things by hand.

## Where prod lives

- Project ref: `rcrjfweguedbtfngeovp`
- Dashboard: https://supabase.com/dashboard/project/rcrjfweguedbtfngeovp

## Access token

- Env var: `SUPABASE_ACCESS_TOKEN`
- CI: stored as a GitHub repo secret (`SUPABASE_ACCESS_TOKEN`), used by
  `.github/workflows/deploy-migrations.yml`.
- Manual/local use: run `supabase login` on your own machine (this opens a
  browser OAuth flow and stores a token in your local Supabase CLI config).
  **Never commit an access token to the repo or paste one into a migration
  file, config, or PR.**

## One-time historical backfill (manual, human-run only)

**Nothing in LR-28 automates this.** The GitHub Action added by this
ticket only handles *future* migrations pushed after it merges. The
migrations below were already applied to prod by hand, before automation
existed, so prod's migration log needs to be told they're already applied
— not have them re-run.

A human with prod access must:

1. `supabase login`
2. `supabase link --project-ref rcrjfweguedbtfngeovp`
3. For each migration file already reflected in prod's actual schema
   (verify via `pg_tables`, `pg_policies`, `storage.buckets` in the
   dashboard's SQL editor before marking it applied), run:

   ```
   supabase migration repair --status applied <version>
   ```

   where `<version>` is the numeric prefix of the filename. As of this
   ticket, the migration files in `supabase/migrations/` are:

   | Version | File |
   |---|---|
   | `20260109180959` | `20260109180959_remote_schema.sql` |
   | `20260109190222` | `20260109190222_baseline_remote_schema_ipv4.sql` |
   | `20260112120000` | `20260112120000_teacher_workspace_v1.sql` |
   | `20260113120000` | `20260113120000_align_students_groups.sql` |
   | `20260113123000` | `20260113123000_student_progress_init.sql` |
   | `20260119234500` | `20260119234500_create_profile_on_auth_user.sql` |
   | `20260221110000` | `20260221110000_create_content_schema_and_read_rpcs.sql` |
   | `20260305120000` | `20260305120000_teaching_notes.sql` |
   | `20260308120000` | `20260308120000_drop_phase_layer.sql` |
   | `20260405` | `20260405_replace_module_assessments.sql` |
   | `20260419` | `20260419_fix_module_assessment_rls.sql` |
   | `20260419120000` | `20260419120000_add_profile_role.sql` |
   | `20260419130000` | `20260419130000_add_profile_role_set_at.sql` |
   | `20260421120000` | `20260421120000_fix_profiles_rls_and_backfill.sql` |
   | `20260517` | `20260517_lr10a_lesson_completions_allow_reentry.sql` |
   | `20260522` (sequence_index) | `20260522_lr11c_sequence_index.sql` |
   | `20260522` (notes) | `20260522_lr13c_lesson_completions_notes.sql` |
   | `20260524` | `20260524_lr14a_lesson_recordings.sql` |
   | `20260716120000` | `20260716120000_stripe_subscriptions.sql` |

   Run `supabase migration list` after each repair to confirm the local
   and remote lists converge, and to catch any migration whose objects
   don't actually exist in prod (that one needs `supabase db push` instead
   of `repair`, or manual investigation — don't mark something "applied"
   that isn't).

4. Once done, `supabase migration list` should show no drift between local
   and remote.

## Manual push (outside CI, e.g. hotfix)

```
supabase login
supabase link --project-ref rcrjfweguedbtfngeovp
supabase db push
```

## Checking for drift

```
npm run migrate:check
```

wraps `supabase migration list --linked` for a quick local/CI parity check.
