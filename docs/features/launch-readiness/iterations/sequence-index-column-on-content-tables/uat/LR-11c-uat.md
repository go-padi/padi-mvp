---
id: LR-11c-UAT
parent: LR-11c
feature: sequence-index-column-on-content-tables
updated: 2026-05-22
scope: SQL migration correctness + zero-app-code-change verification
runtime_scope: none (migration applies in a separate prod workflow; not applied to dev DB)
---

# LR-11c UAT — sequence_index column on content tables

Verdict: PASS

Migration-only iteration. UAT scope is SQL correctness, structural conformance to the eng brief, and confirmation that no application code was modified. No runtime behavior to validate — the migration has not been applied to the dev DB and the RPC return signatures are unchanged, so existing app queries continue to function.

## Artifacts inspected

- Migration file: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/supabase/migrations/20260522_lr11c_sequence_index.sql` (75 lines, 2788 bytes)
- Eng brief: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/.buildloop/iterations/004/eng-brief.md`
- Refined ticket: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/.buildloop/iterations/004/feature-refined.md`

## Scenarios

### UAT-01 — Migration file exists at expected path
Status: PASS
- Verified `supabase/migrations/20260522_lr11c_sequence_index.sql` exists and is non-empty (2788 bytes).

### UAT-02 — Three `add column if not exists sequence_index integer` statements (phase, module_group, module_detail)
Status: PASS
- `grep -c "add column if not exists sequence_index integer"` returned `3`.
- Lines 6–7 (`content.phase`), 11–12 (`content.module_group`), 16–17 (`content.module_detail`).

### UAT-03 — Three backfill `update ... set sequence_index = display_order where sequence_index is null` statements
Status: PASS
- `grep -c "set sequence_index = display_order where sequence_index is null"` returned `3`.
- Lines 8, 13, 18 — one per table, in the same order as the alter statements.

### UAT-04 — Three `create index if not exists ... (sequence_index)` statements
Status: PASS
- `grep -c "create index if not exists"` returned `3`.
- Indexes named `phase_sequence_index_idx`, `module_group_sequence_index_idx`, `module_detail_sequence_index_idx` on each respective table's `(sequence_index)` column (lines 9, 14, 19).

### UAT-05 — Two `create or replace function` blocks for `content_get_groups` and `content_get_modules` with the prescribed ORDER BY
Status: PASS
- `grep -c "create or replace function"` returned `2`.
- `content_get_groups` (lines 23–46) ends with `order by g.sequence_index asc nulls last, g.display_order asc, g.code asc;` (line 45).
- `content_get_modules` (lines 48–74) ends with `order by m.sequence_index asc nulls last, m.display_order asc, m.code asc;` (line 73).
- Return signatures preserved (same column list and types as the original RPCs — no breaking change for callers).
- Both functions retain `language sql`, `stable`, `security definer`, `set search_path = public, content` — consistent with the existing pattern in `20260221110000_create_content_schema_and_read_rpcs.sql`.

### UAT-06 — No DROP statements, RLS changes, or out-of-scope schema changes
Status: PASS
- `grep -in "drop|alter policy|row level security|enable rls|disable rls|create policy|revoke|grant"` returned NONE.
- File contains only: 3× `alter table ... add column`, 3× `update`, 3× `create index`, 2× `create or replace function`. No table drops, no policy changes, no permission changes, no signature changes on the RPCs.

### UAT-07 — `pnpm lint` exits 0 with zero warnings
Status: PASS
- `pnpm lint` exited 0. Output: just the `eslint .` invocation banner — zero errors, zero warnings.

### UAT-08 — `pnpm tsc --noEmit` exits 0
Status: PASS
- Exited 0 with no output (clean typecheck).

### UAT-09 — `pnpm build` exits 0
Status: PASS
- Full production build succeeded. All 24 routes compiled and 19/19 static pages generated. No build warnings or errors. First-load JS budgets unchanged from baseline.

### UAT-10 — No application code files modified
Status: PASS
- `git diff --name-only HEAD` shows only `docs/features/SHIPPED.md` (a documentation file, not application code).
- `git ls-files --others --exclude-standard` shows only the new migration file `supabase/migrations/20260522_lr11c_sequence_index.sql`.
- Zero changes under `app/`, `components/`, `lib/`, `hooks/`, `scripts/`, or any TypeScript/TSX source.

### UAT-11 — App still loads (sanity check — RPC signatures unchanged, migration not yet applied)
Status: PASS
- `GET http://localhost:3000/teacher` → `200`.
- `GET http://localhost:3000/` → `200` on warm requests (an initial cold `500` appeared in the dev-server log from a Next 15 devtools bundler issue, `segment-explorer-node` in `react-server-components` — pre-existing, unrelated to this migration which has not been applied to the dev DB; subsequent requests return `200`).
- Since RPC return signatures (`content_get_groups`, `content_get_modules`) are unchanged, existing app queries are unaffected even if the migration were applied.

## Code review notes

- The eng brief specified all required structural elements — they are present verbatim.
- The migration is idempotent: `add column if not exists`, `create index if not exists`, `update ... where sequence_index is null` (no-op on re-run), `create or replace function`. Safe to re-apply.
- Backfill is correct: copies `display_order` into `sequence_index` only where null, which on first run covers every existing row.
- ORDER BY tie-breaking chain (`sequence_index ASC NULLS LAST, display_order ASC, code ASC`) is deterministic and preserves the legacy ordering as a fallback. Stable across runs.
- The `security definer` + `set search_path` pattern matches the existing RPC definitions, avoiding the Supabase advisor warning class for mutable search_path.
- No application code reads `sequence_index` yet — that is by design for this iteration. Downstream iterations (LR-11d et al.) will leverage it.

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 11 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Migration file exists at expected path | PASS | — | — |
  | UAT-02 | Three `add column` statements | PASS | — | — |
  | UAT-03 | Three backfill `update` statements | PASS | — | — |
  | UAT-04 | Three `create index` statements | PASS | — | — |
  | UAT-05 | Two `create or replace function` blocks with correct ORDER BY | PASS | — | — |
  | UAT-06 | No DROP / RLS / out-of-scope schema changes | PASS | — | — |
  | UAT-07 | `pnpm lint` exit 0, zero warnings | PASS | — | — |
  | UAT-08 | `pnpm tsc --noEmit` exit 0 | PASS | — | — |
  | UAT-09 | `pnpm build` exit 0 | PASS | — | — |
  | UAT-10 | No application code modified | PASS | — | — |
  | UAT-11 | App still loads (sanity) | PASS | — | — |
- Notes for padi-eng: Migration is ready for the prod-apply workflow. After apply, follow-up tickets should (a) verify the post-apply state with `select sequence_index, display_order from content.phase` and the same for `module_group` / `module_detail` to confirm backfill, and (b) wire downstream UI consumers (LR-11d curriculum browser group order) to rely on the new ordering.
- Notes for padi-design: N/A — no UI changes in this iteration.
- Missing from ticket: None. Eng brief and ticket are tight, and the implementation matches exactly. One minor observation (not a gap): the ticket does not specify whether the new column should be backfilled with `NOT NULL` enforced afterward — current implementation leaves it nullable, which is correct for an additive migration. Any future tightening to `NOT NULL` should be a separate ticket once all writers populate it.
