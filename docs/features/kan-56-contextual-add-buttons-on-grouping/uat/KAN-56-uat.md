Verdict: PASS

## KAN-56 — Contextual Add buttons on /teacher/grouping (re-test after KAN-152 fix)

- Date: 2026-05-22
- Method: source-inspection canonical (per UAT instructions), plus pnpm lint / pnpm tsc --noEmit / pnpm build. Dev server on :3000 / :3010 not reachable at re-test time — runtime smoke skipped; source-level confirmation of the fix is unambiguous.
- File under test: `app/teacher/grouping/page.tsx`
- Iteration: 006
- Prior verdict: FAIL (archived to `KAN-56-uat.md.stale-attempt-1`) — sole failure was KAN-152 (CTAs not using `.btn` class). Bug now `status: fixed`.

## Bug-fix verification (KAN-152)

| Location | Expected | Actual | Status |
|---|---|---|---|
| `app/teacher/grouping/page.tsx:221` ("Add group" `<button>`) | `className="btn"` verbatim | `className="btn"` (verified via `grep -n 'className="btn"'`) | PASS |
| `app/teacher/grouping/page.tsx:276` ("Add student" `<Link href="/students">`) | `className="btn"` verbatim | `className="btn"` (verified via `grep -n 'className="btn"'`) | PASS |

The two CTAs now share the same `.btn` shared utility (defined in `app/globals.css:9`) used elsewhere in the app (`app/page.tsx`, `app/teacher/layout.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/students/[studentId]/start/page.tsx`). Visual inconsistency between the two header-row CTAs is resolved. Spec compliance restored. `disabled={!tenantId}` guard on the Add group button preserved as required.

## Full AC re-run

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | `AddGroupModal` imported + `isAddGroupOpen` state declared | PASS | Line 12 (`import { AddGroupModal } from '@/components/AddGroupModal'`), line 18 (`useState(false)`). |
| 2 | LIVE Groups header: `<button>` "Add group", `className="btn"`, `onClick={() => setAddGroupOpen(true)}`, right-aligned via `flex items-center justify-between gap-3` | PASS | Lines 217-225. `disabled={!tenantId}` is an additive guard (orthogonal to spec). |
| 3 | LIVE Individual Students header: `<Link href="/students" className="btn">Add student</Link>`, right-aligned via `flex items-center justify-between gap-3` | PASS | Lines 274-280. |
| 4 | `AddGroupModal` mounted with `open` / `onClose` / `onCreated` props | PASS | Lines 363-370. Props match `components/AddGroupModal.tsx:13-20` signature (`open`, `onClose`, `tenantId`, `students`, `existingGroups`, `onCreated`). `onCreated={async () => { await refetch(); }}`; modal closes itself internally after `await onCreated()`. |
| 5 | Demo branch unchanged — no Add CTAs on demo headers | PASS | Lines 73-181: demo branch has no Add CTAs. |
| 6 | CTAs gated on `!isLoading && !error && show*Mode` and hidden in empty state | PASS | Groups CTA gated at line 209 + additional `!showStartTeachingCta` at 216. Students CTA gated at line 265 + `!showStartTeachingCta` at 273. |
| 7a | No regression — TeachingModeToggle | PASS | Line 64 still mounted; unchanged from prior shipped state. |
| 7b | No regression — EmptyStateStartTeachingCTA | PASS | Lines 204-208 still fires when `showStartTeachingCta`; Add CTAs hidden in that case. |
| 7c | No regression — KAN-64 group badges | PASS | KAN-64 lives on student-profile surface, not touched here. |
| 7d | No regression — other shipped features | PASS | Build of all 23 routes succeeded; `/teacher/grouping` route static, 6.78 kB / 156 kB First Load JS (unchanged envelope from prior verdict). |
| 8 | Auth-store untouched | PASS | No edits in `lib/auth-store.tsx`; KAN-152 fix scoped to two `className` swaps in `app/teacher/grouping/page.tsx`. |
| 9a | `pnpm lint` exit 0 | PASS | 0 errors, 3 pre-existing warnings (lines 25/28 — useMemo deps from prior iterations; `assessmentStatusCopy.ts` unused-disable — unrelated). |
| 9b | `pnpm tsc --noEmit` exit 0 | PASS | `TSC_EXIT=0`, clean. |
| 9c | `pnpm build` exit 0 | PASS | Static build succeeded, all 19 static pages generated, no errors. |
| 10 | No new console errors | PASS (source-level) | No `console.error` / `console.warn` introduced in the diff; runtime browser smoke not run (dev server unreachable). Build output clean. |

## Bug status

- `docs/features/kan-56-contextual-add-buttons-on-grouping/bugs/kan-152-grouping-add-ctas-not-using-btn-class-bug-.md` — `status: fixed`, verified at source.
- No new bugs filed.

## Verdict rationale

The KAN-152 fix is in: both Add CTAs use `className="btn"` verbatim at the exact lines previously failing. Every other AC item that already passed in the prior run continues to pass — build / lint / tsc all clean, demo branch untouched, gating intact, modal wiring correct, no regression on TeachingModeToggle / EmptyStateStartTeachingCTA / KAN-64. Auth-store untouched. The single open failure that produced the prior FAIL is now resolved with the minimal, spec-aligned fix.

## Notes for padi-eng

- None. Fix is correct and minimal.

## Notes for padi-design

- The two header CTAs now share `.btn` styling. If a primary/secondary distinction between "Add group" and "Add student" is desired down the line, extend the design system (`.btn-primary` already exists in `app/globals.css:10`) rather than forking inline utilities.

## Missing from ticket

- None.

## Run history

### 2026-05-22 — padi-uat-agent (re-test after KAN-152 fix)
- Verdict: PASS
- Scenarios: PASS 13 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | 1 | Import + state | PASS | — | — |
  | 2 | Live Groups "Add group" button with `btn` class | PASS | — | — |
  | 3 | Live Individual Students "Add student" Link with `btn` class | PASS | — | — |
  | 4 | AddGroupModal mount + props | PASS | — | — |
  | 5 | Demo branch unchanged | PASS | — | — |
  | 6 | Conditional gating | PASS | — | — |
  | 7 | No regression (Toggle, EmptyState, KAN-64, other) | PASS | — | — |
  | 8 | Auth-store untouched | PASS | — | — |
  | 9 | lint / tsc / build exit 0 | PASS | — | — |
  | 10 | No new console errors | PASS | — | — |
- Notes for padi-eng: None — fix is minimal and correct.
- Notes for padi-design: Two CTAs now share `.btn`. Consider `.btn-primary` if a primary/secondary distinction is wanted later.
- Missing from ticket: None.

### 2026-05-22 — padi-uat-agent (initial attempt, archived)
- Verdict: FAIL
- Scenarios: PASS 9 / FAIL 2 / BUG 0 / BLOCKED 0
- Bug filed: KAN-152 (now fixed). See `KAN-56-uat.md.stale-attempt-1` for full detail.
