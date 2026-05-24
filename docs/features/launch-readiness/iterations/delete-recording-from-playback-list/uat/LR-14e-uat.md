---
id: LR-14e-UAT
title: "UAT — Delete recording from playback list (LR-14e)"
parent: LR-14e
feature: launch-readiness
iteration: 007
slug: delete-recording-from-playback-list
created: 2026-05-24
updated: 2026-05-24
ran_by: padi-uat-agent
---

# UAT — LR-14e — Delete recording from playback list

Verdict: PASS

## Summary

All 12 verification items from the test plan pass. The migration is idempotent and has exactly 2 `create policy` / 2 `for delete` / 2 `drop policy if exists` statements with the correct gating (`tenant_id = auth.uid()` on the table; `bucket_id = 'lesson-recordings'` plus first foldername segment match against `auth.uid()::text` on storage). The lesson page wiring matches the brief: `deletingId` state at line 139, `deleteRecording` useCallback at line 182 with the exact `window.confirm('Delete this recording? This cannot be undone.')` prompt and storage-then-DB-then-local-filter sequence, and a per-row Delete button at lines 946-953 that flips to "Deleting..." with `disabled={deletingId === rec.id}` (other rows stay enabled — boolean equality on the in-flight id). `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm build` all exit 0 with no warnings and no Next.js advisory.

## Scenarios

### UAT-01 — Migration file exists at expected path

Status: ✅
- Verified `supabase/migrations/20260524_lr14e_lesson_recordings_delete.sql` exists (679 bytes, dated May 24 17:33).

### UAT-02 — Migration has exactly 2 `create policy` and 2 `for delete` statements with correct gating

Status: ✅
- `grep -c "create policy" → 2`
- `grep -c "for delete" → 2`
- Table policy: `"lesson_recordings_delete_own_tenant" on public.lesson_recordings for delete using (tenant_id = auth.uid())`
- Storage policy: `"lesson_recordings_storage_delete" on storage.objects for delete using (bucket_id = 'lesson-recordings' and (storage.foldername(name))[1] = auth.uid()::text)`

### UAT-03 — Migration uses idempotent `drop policy if exists` + `create policy` pattern

Status: ✅
- `grep -c "drop policy if exists" → 2` — one before each `create policy`. Safe to re-run.

### UAT-04 — `deleteRecording` helper prompts confirm → storage.remove → db.delete → local list filter

Status: ✅
- Helper at lines 182-203 of `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`.
- Line 183: `if (!window.confirm('Delete this recording? This cannot be undone.')) return;` — exact string match.
- Line 187: `sb.storage.from('lesson-recordings').remove([rec.storage_path])` — storage first.
- Line 193: `sb.from('lesson_recordings').delete().eq('id', rec.id)` — DB next.
- Line 199: `setRecordings(prev => prev.filter(r => r.id !== rec.id))` — local filter on success.

### UAT-05 — Storage error: logs + bails (row stays)

Status: ✅
- Lines 188-192: on `rmErr`, logs `console.error('LR-14e storage delete failed:', rmErr)`, clears `setDeletingId(null)`, and returns before touching the DB. Row is preserved in local state (no filter call).

### UAT-06 — DB error after storage success: logs + bails (storage orphan acceptable per spar)

Status: ✅
- Lines 194-198: on `dbErr`, logs `console.error('LR-14e db delete failed:', dbErr)`, clears `setDeletingId(null)`, returns before the `setRecordings` filter. The row stays in the local list (it'll reappear on refetch since the DB row was never removed). Storage object is orphaned in this edge case — documented and accepted in the ticket Out of Scope (v0).

### UAT-07 — `deletingId` state tracks the in-flight row; only that row's label flips to "Deleting..."

Status: ✅
- State declared at line 139: `const [deletingId, setDeletingId] = useState<string | null>(null);`
- Line 952: `{deletingId === rec.id ? 'Deleting...' : 'Delete'}` — strict id equality means only the in-flight row swaps its label.
- Line 949: `disabled={deletingId === rec.id}` — same equality means other rows' buttons remain enabled.
- `finally` block at line 200 unconditionally resets `setDeletingId(null)`, guaranteeing the state clears on every path.

### UAT-08 — `disabled` HTML attribute set on in-flight delete button

Status: ✅
- Line 949: `disabled={deletingId === rec.id}`. Native `<button>` with `type="button"`. When the disabled boolean flips true mid-flight, the browser will block click events and apply the `disabled:text-gray-400` Tailwind variant from line 950.

### UAT-09 — `pnpm lint` exit 0, ZERO warnings (KAN-153 baseline)

Status: ✅
- Ran `pnpm lint` → exit 0, no warnings, no errors. ESLint produced zero output beyond the npm script banner.

### UAT-10 — `pnpm tsc --noEmit` exit 0

Status: ✅
- Ran `pnpm tsc --noEmit` → exit 0, no diagnostics. Matches the build's type-check pass.

### UAT-11 — `pnpm build` exit 0 (no Next.js advisory after KAN-167)

Status: ✅
- Ran `pnpm build` → exit 0. Build output is clean: `Compiled successfully in 1618ms`, all 19 static pages generated, no `@next/next` plugin advisory, no warnings. The `[module]` route weighs 9.41 kB (229 kB First Load JS) — unchanged from the baseline plus the small delete helper.

### UAT-12 — No regression on LR-14a/b/c/d, Mark complete, LR-11b, LR-09a/g, LR-13, KAN-51

Status: ✅
- LR-14a foundation migration (`supabase/migrations/`) untouched — only the new LR-14e migration was added.
- LR-14b: `useLessonRecorder` import at line 21 intact; `recorder.state` branches at lines 881/891/901/910/924 unchanged.
- LR-14c: fetch logic at lines 448-491 untouched (still selects `id, storage_path, duration_sec, created_at`, scoped by `tenant_id`, creates signed URLs). The new helper only mutates `setRecordings` locally — no fetch hook changed.
- LR-14d: `showPrivacyModal` state at line 148, `LR14D_LS_KEY` at line 150, `handleRecordTap`/`handleAcknowledge` at lines 168-180, modal cancel at line 1208 — all intact.
- Mark lesson complete: `priorCompletions` state at lines 130-134, prior observations entries panel at lines 842-848 — intact.
- LR-11b: `offSequenceWarning && !warningDismissed` banner at line 808 — intact.
- LR-09a/g: tenant-scoped queries (`.eq('tenant_id', tenantId)`) at lines 324, 344, 453, 495 — intact.
- LR-13 surfaces: `priorCompletions` panel + entries at lines 835-848 — intact.
- KAN-51 banner: not in this file path; no change.

### UAT-13 — Live route smoke check

Status: ✅
- `curl http://localhost:3000/teacher/curriculum` → 200 OK. Module route compiled (`Compiled /teacher/curriculum in 222ms (1278 modules)`).
- Dev server's pre-existing Next.js dev-tools `segment-explorer-node` 500 errors on `/` are unrelated to LR-14e (Next.js dev-tools React Client Manifest bug, surfaces on the marketing homepage only). Production `pnpm build` is clean, confirming the issue is dev-tools-only.

## Run history

### 2026-05-24 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 13 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Migration file exists | ✅ | — | — |
  | UAT-02 | 2 create policy + 2 for delete, correct gating | ✅ | — | — |
  | UAT-03 | Idempotent drop+create pattern | ✅ | — | — |
  | UAT-04 | deleteRecording helper sequence | ✅ | — | — |
  | UAT-05 | Storage error logs + bails | ✅ | — | — |
  | UAT-06 | DB error logs + bails (orphan v0 acceptable) | ✅ | — | — |
  | UAT-07 | deletingId per-row label swap | ✅ | — | — |
  | UAT-08 | disabled attribute on in-flight button | ✅ | — | — |
  | UAT-09 | pnpm lint exit 0, zero warnings | ✅ | — | — |
  | UAT-10 | pnpm tsc --noEmit exit 0 | ✅ | — | — |
  | UAT-11 | pnpm build exit 0, no advisory | ✅ | — | — |
  | UAT-12 | No regression on prior LR-14*/13/11/09 surfaces | ✅ | — | — |
  | UAT-13 | Live curriculum route 200 OK | ✅ | — | — |
- Notes for padi-eng:
  - Implementation matches the brief verbatim. No follow-up needed for v0.
  - Documented v0 caveat: if `storage.remove` succeeds but `db.delete` fails, the storage object is orphaned. Worth filing a follow-up ticket (low priority) to either reverse-order (DB first, then storage) or add a periodic reconciliation job. The current order (storage-first) was chosen per spar to ensure the audio file is gone first for privacy — a reasonable trade.
  - Pre-existing Next.js dev-tools `segment-explorer-node` errors on `/` in the dev server log are not introduced by LR-14e (they're internal Next.js 15.5.9 dev-tools React Client Manifest bugs). Production build is clean.
- Notes for padi-design:
  - Native `confirm()` is intentionally used for v0 per ticket scope. If teachers complain about the dialog feeling jarring, a follow-up could replace with a Padi-styled modal (similar to the LR-14d privacy modal).
  - Delete link uses `text-xs text-red-600 hover:underline` inline within the metadata `<p>` — visually subtle, consistent with destructive-link conventions. The `· ` separator visually integrates it with the timestamp/duration text.
- Missing from ticket: nothing — AC is unambiguous and fully testable from source + lint/tsc/build.
