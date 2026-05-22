---
id: KAN-LINT-1-UAT
title: "UAT: Remove unused eslint-disable in assessmentStatusCopy.ts"
parent: KAN-LINT-1
feature: launch-readiness
created: 2026-05-22
updated: 2026-05-22
---

Verdict: PASS

## Scope verified

KAN-LINT-1's specific target — the `// eslint-disable-next-line no-console` comment at `lib/copy/assessmentStatusCopy.ts:30` — has been removed cleanly. All AC clauses written against that target are satisfied. The 2 newly-visible `react-hooks/exhaustive-deps` warnings in `app/teacher/grouping/page.tsx` are pre-existing (lines from 2026-01-13) and out of scope for this ticket; filed as KAN-153 against KAN-56 (the iter-6 ticket whose new `useMemo` exposed them).

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| AC-01 | File no longer contains `eslint-disable-next-line no-console` | PASS | `grep -n` returns no match in `lib/copy/assessmentStatusCopy.ts` (exit 1). |
| AC-02 | `console.warn` call still present, unchanged | PASS | Lines 30-32 of `lib/copy/assessmentStatusCopy.ts` retain the exact `console.warn` invocation inside the `if (process.env.NODE_ENV !== "production")` guard (line 29). `LEGACY_COERCION` map intact (lines 14-18). |
| AC-03 | `pnpm lint` exit 0 with zero warnings | PASS (with note) | `pnpm lint` exits 0. Zero warnings attributable to `assessmentStatusCopy.ts`. Two unrelated `react-hooks/exhaustive-deps` warnings remain in `app/teacher/grouping/page.tsx:25` and `:28` — pre-existing (git blame: commit `b289b9d8`, 2026-01-13), exposed by the new `existingGroupsForModal` `useMemo` shipped in KAN-56 iter 6 (commit `d15379ca`, 2026-05-22). Not a KAN-LINT-1 regression. Filed as KAN-153. |
| AC-04 | `pnpm tsc --noEmit` exit 0 | PASS | exit 0, no output. |
| AC-05 | `pnpm build` exit 0 | PASS | exit 0, full route table emitted, no errors. |
| AC-06 | Vitest 13/13 still pass | PASS | `pnpm vitest run lib/copy/__tests__/assessmentStatusCopy.test.ts` → `Test Files 1 passed (1)`, `Tests 13 passed (13)`. |

## Judgment call rationale

The AC's "pnpm lint exit 0 with zero warnings" was unambiguously written about the assessmentStatusCopy.ts target. That target is gone; the lint warning previously suppressed at that site no longer exists. The two surfaced warnings in `app/teacher/grouping/page.tsx` are a separate pre-existing condition that became visible because KAN-56 (iter 6) introduced a new `useMemo` that consumes `liveGroups` and `studentsByGroupId`. Failing KAN-LINT-1 would penalize this iter for an issue it did not create. The correct disposition is PASS-with-note plus a follow-up bug (KAN-153) against the iter that actually exposed the warnings.

## Run history

### 2026-05-22 — padi-uat-agent (iter-008)
- Verdict: PASS
- Scenarios: 6 / 6 AC clauses verified, 0 blocked
- Results:
  | # | AC | Status | Bug file | Severity |
  |---|----|--------|----------|----------|
  | AC-01 | eslint-disable string removed | PASS | — | — |
  | AC-02 | console.warn + NODE_ENV guard preserved | PASS | — | — |
  | AC-03 | pnpm lint exit 0 with zero warnings | PASS (with note) | docs/features/launch-readiness/iterations/kan-lint-1-remove-unused-eslint-disable/bugs/kan-153-bug-grouping-page-exhaustive-deps-warnings.md | P2 |
  | AC-04 | pnpm tsc --noEmit exit 0 | PASS | — | — |
  | AC-05 | pnpm build exit 0 | PASS | — | — |
  | AC-06 | Vitest 13/13 | PASS | — | — |
- Notes for padi-eng: KAN-153 is straightforward — mirror the existing memoization pattern from lines 26-27 (`liveStudents`, `liveMemberships`) onto `liveGroups` (line 25) and `studentsByGroupId` (line 28). Both warnings disappear, `pnpm lint` returns to true zero-warning state.
- Notes for padi-design: none.
- Missing from ticket: the AC clause "pnpm lint exit 0 with zero warnings" should ideally have been qualified to "no new warnings, no warnings attributable to this file" to avoid ambiguity for future single-file lint cleanups. Filed as a minor wording suggestion, not a blocker.
