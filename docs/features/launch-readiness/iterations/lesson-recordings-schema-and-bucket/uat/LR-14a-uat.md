# LR-14a UAT — lesson_recordings schema + storage bucket + RLS

- Iter: lesson-recordings-schema-and-bucket
- Migration: `supabase/migrations/20260524_lr14a_lesson_recordings.sql`
- Ticket: `.buildloop/iterations/001/feature-refined.md`
- Eng brief: `.buildloop/iterations/001/eng-brief.md`
- Run date: 2026-05-24
- Run host: localhost:3000

Verdict: PASS

## Scope note

Migration-only iter. No UI to test. Mirrors LR-11c's UAT pattern: file-presence + content shape + idempotency + zero-app-code-delta + build/lint/tsc green + app still serves. Migration is NOT applied to the dev DB by this iter (orchestrator-managed).

## AC results

| # | Acceptance criterion | Status | Evidence |
|---|----------------------|--------|----------|
| 1 | Migration file exists at `supabase/migrations/20260524_lr14a_lesson_recordings.sql` | PASS | `ls -la` returned the file, 2591 bytes |
| 2 | Table contains all 9 required columns (id, tenant_id, student_id, module_id, lesson_completion_id, storage_path, duration_sec, mime_type, created_at) | PASS | All 9 columns present with correct types; `id uuid primary key`, `tenant_id uuid not null`, `student_id uuid not null references public.students(id) on delete cascade`, `module_id text not null`, `lesson_completion_id uuid references public.lesson_completions(id) on delete set null`, `storage_path text not null`, `duration_sec integer`, `mime_type text`, `created_at timestamp with time zone not null default now()` |
| 3 | `alter table public.lesson_recordings enable row level security` present | PASS | Line 25 |
| 4 | Exactly 4 `create policy` statements; minimum-privilege RLS — SELECT + INSERT on table (gating `tenant_id = auth.uid()`) and SELECT + INSERT on `storage.objects` (gating `bucket_id = 'lesson-recordings' AND (storage.foldername(name))[1] = auth.uid()::text`) | PASS | `grep -c "create policy"` = 4. Verbs: `for select`, `for insert`, `for select`, `for insert`. Table policies use `tenant_id = auth.uid()` exactly (lines 32, 39). Storage policies use exact bucket-id + foldername gate (lines 56-57, 65-66). No `for update`, no `for delete` anywhere. |
| 5 | Storage bucket insert: `insert into storage.buckets ... 'lesson-recordings' ... false ... on conflict do nothing` | PASS | Lines 44-46: `insert into storage.buckets (id, name, public) values ('lesson-recordings', 'lesson-recordings', false) on conflict (id) do nothing;` — bucket is private (`false`), idempotent |
| 6 | Two `create index if not exists` statements | PASS | `grep -c` = 2. Indexes: `lesson_recordings_tenant_student_module_idx` on `(tenant_id, student_id, module_id)`, `lesson_recordings_tenant_created_idx` on `(tenant_id, created_at desc)` |
| 7 | NO UPDATE or DELETE policies (append-only for v0) | PASS | `grep -iE "for update\|for delete"` returned no matches. Comment on line 41 explicitly documents this: "No UPDATE / DELETE policies for v0 — recordings are append-only." |
| 8 | NO application code changes — only the new migration file (+ docs/SHIPPED.md auto-update) | PASS | `git status --porcelain` shows ONLY `?? supabase/migrations/20260524_lr14a_lesson_recordings.sql`. `git diff HEAD -- 'app/**' 'lib/**' 'components/**' 'pages/**'` empty. (SHIPPED.md will be touched post-deploy by the orchestrator; not in scope for this UAT run.) |
| 9 | `pnpm lint` exit 0, ZERO warnings (KAN-153 baseline preserved) | PASS | Exit code 0. eslint output: no findings printed. |
| 10 | `pnpm tsc --noEmit` exit 0 | PASS | Exit code 0. No type errors. |
| 11 | `pnpm build` exit 0 | PASS | Exit code 0. 23 routes compiled (same as pre-iter). Build succeeded cleanly. |
| 12 | App still loads — `/`, `/teacher` return 200 | PASS | After warm-up, 5 consecutive `GET /` requests = 200, 3 consecutive `GET /teacher` = 200. (See "Observation on dev-server first-request 500" below — a Next.js 15.5.9 devtools-only quirk, NOT caused by this migration.) |
| 13 | Migration is idempotent (`if not exists` / `on conflict do nothing`) | PASS | Idempotency markers: `create table if not exists` × 1, `create index if not exists` × 2, `on conflict (id) do nothing` × 1, `drop policy if exists` × 4 (re-runs cleanly drop+recreate policies). All DDL statements re-runnable without error. |

## Observation on dev-server first-request 500

First curl to `GET /` returned 500 with this server-log error:

```
Error: Could not find the module "...next/dist/next-devtools/userspace/app/segment-explorer-node.js#SegmentViewNode" in the React Client Manifest. This is probably a bug in the React Server Components bundler.
```

This is a known Next.js 15.5.9 dev-tools cold-compile race (the server log literally says "this is probably a bug in the React Server Components bundler"). It is a `next dev` devtools artifact, never triggered by `next build`. Verified:

- 5 subsequent `GET /` requests all returned 200.
- `pnpm build` (production build) succeeded with exit 0 and prerendered `/` as static (`○`).
- This iter touched zero application or build-config files (`git diff HEAD -- 'app/**' 'lib/**' 'components/**' 'pages/**'` empty), so the migration cannot have introduced it.
- The dev-server.log shows the same error pattern before our scan window — a pre-existing dev-mode flake.

Not filed as a bug against LR-14a. If it persists across iterations it should be filed under `docs/features/bugs/` as a tooling issue against Next.js, not LR-14a.

## Run history

### 2026-05-24 — padi-uat-agent
- Verdict: PASS
- Scenarios: 13 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Results: see AC table above
- Notes for padi-eng:
  - Migration file is clean, minimum-privilege, and idempotent. Safe to apply via standard Supabase workflow.
  - LR-14b consumer code (Record/Stop UI + MediaRecorder upload) MUST write `tenant_id = auth.uid()` on every insert, or the INSERT policy will reject the row.
  - Storage path scheme is documented in the migration comment as `<tenant_id>/<student_id>/<module_id>/<timestamp>.<ext>`. LR-14b uploads must use this exact prefix or the storage RLS will reject them.
  - Since there are no UPDATE / DELETE policies, if LR-14b ever needs to delete a recording (e.g., user "delete recording" button), that needs an explicit DELETE policy added in a follow-up migration — the v0 contract is append-only.
- Notes for padi-design:
  - N/A — no UI in this iter.
- Missing from ticket:
  - None. AC list was concrete and fully testable.
  - Suggestion for the LR-14a-fix follow-up (if needed): once the migration is applied to the remote DB, a UAT pass should attempt a tenant-scoping smoke test via `mcp__claude_ai_Supabase__execute_sql` to prove RLS rejects cross-tenant reads/writes. This UAT could not do that because the migration is not yet applied to the dev DB.
