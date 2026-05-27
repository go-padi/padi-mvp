---
id: LR-14-bug-01
title: "[Bug] LR-14 recording fails in prod — migration never applied, RLS pattern wrong"
type: bug
status: fixed-live
priority: highest
feature: launch-readiness
parent: LR-14
launch_blocker: true
created: 2026-05-24
created_by: live-app-verification-2026-05-24
verified_on: padi-mvp.vercel.app, signed in as nriyer25@gmail.com, student Olivia Iyer
fixed_in: applied directly to prod via Supabase MCP 2026-05-24 (no PR yet)
handling: cc-followup
---

### Summary

Nisha hit record → audio captured → press stop → red error: "Upload failed —
check your connection and try again." The fix is two layers and both happened
in prod 2026-05-24:

1. The LR-14a migration (`supabase/migrations/20260524_lr14a_lesson_recordings.sql`)
   was committed to the repo but **never applied to prod**. The
   `lesson_recordings` table and `lesson-recordings` storage bucket did not
   exist on the live database.
2. After applying the migration, a second error surfaced —
   `new row violates row-level security policy`. The migration's RLS check is
   `tenant_id = auth.uid()`, but in this app `tenant_id` is a separate UUID on
   `profiles.tenant_id`, NOT equal to `auth.uid()`. The canonical pattern used
   by every other table is `tenant_id in (select tenant_id from profiles where
   id = auth.uid())`.

### What got done live

1. Applied the LR-14a SQL via Supabase MCP `apply_migration`
   (`lr14a_lesson_recordings`) → table + bucket created.
2. Applied a follow-up migration `lr14a_fix_lesson_recordings_rls` that
   replaced both the table and storage RLS policies with the tenant-via-profiles
   pattern. Also added a storage DELETE policy so the in-app delete affordance
   (LR-14e) works.
3. Re-tested record → stop → "✓ Recording saved" + recording shows in
   "PRIOR RECORDINGS" + plays back. Verified live.

### Source-of-truth sync

The migration file in the repo
(`supabase/migrations/20260524_lr14a_lesson_recordings.sql`) has been
edited to match what's now live in prod. Branch databases and local dev
will pick up the corrected version on their next `supabase db push`.

### Tech-debt to log separately

**Migration drift between repo and prod.** Prod's `supabase_migrations.schema_migrations`
table only has 3 entries (the early-access / quiz / waitlist marketing tables).
The entire app schema was provisioned out-of-band — there is no automated
`supabase db push` in the deploy pipeline. This means every LR-* migration
committed to the repo will silently fail to land on prod unless someone
remembers to run it by hand.

This is a launch-risk: any future feature that adds a table, bucket, or RLS
policy will appear to work locally and in CI, and fail silently on prod the
way LR-14 did.

**Recommended follow-ups (separate ticket):**
- Wire `supabase db push` (or equivalent) into the Vercel deploy hook OR add
  a manual deploy-checklist step.
- Backfill `supabase_migrations.schema_migrations` so the prod migration log
  reflects reality.
- BuildLoop's `deploy_prod` phase should verify schema parity before declaring
  done.

### Acceptance criteria (all met live)

1. Hit Record → audio captures, elapsed counter ticks. ✅
2. Hit Stop → "Saving recording…" → "✓ Recording saved". ✅
3. Recording appears under "PRIOR RECORDINGS" with timestamp + duration. ✅
4. Audio element plays back the recording. ✅
5. No console errors during the save flow. ✅
