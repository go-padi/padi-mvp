---
id: KAN-153
title: "Grouping page: react-hooks/exhaustive-deps warnings on liveGroups + studentsByGroupId exposed by new useMemo"
type: bug
status: open
priority: P2
severity: P2
feature: launch-readiness
parent: KAN-56
uat: KAN-LINT-1-UAT
launch_blocker: false
created: 2026-05-22
created_by: padi-uat-agent (iter-008 / KAN-LINT-1 UAT)
---

## Summary

`pnpm lint` reports two `react-hooks/exhaustive-deps` warnings in `app/teacher/grouping/page.tsx` (lines 25 and 28). The two flagged values — `liveGroups` and `studentsByGroupId` — are computed as logical-OR fallbacks (`data?.groups || []` and `data?.studentsByGroupId || {}`) and are now consumed by the `existingGroupsForModal` `useMemo` added on 2026-05-22 (KAN-56, BuildLoop iter 6). Because they are recomputed on every render, the `useMemo` dependency check is effectively defeated.

These two lines themselves are NOT regressions from KAN-LINT-1. Git blame confirms they date to commit `b289b9d8` on 2026-01-13. KAN-LINT-1 only removed an `eslint-disable-next-line no-console` comment in `lib/copy/assessmentStatusCopy.ts`. However, the warnings were silently exposed when KAN-56 (iter 6) introduced a new `useMemo` (`existingGroupsForModal`, lines 37-40) that depends on `liveGroups` and `studentsByGroupId`. Before that `useMemo` existed, neither variable was a hook dependency, so the lint rule never fired.

## Where

- File: `app/teacher/grouping/page.tsx`
- Warning 1: line 25 — `const liveGroups = data?.groups || [];`
- Warning 2: line 28 — `const studentsByGroupId = data?.studentsByGroupId || {};`
- Triggering consumer: lines 37-40 — `const existingGroupsForModal = useMemo(() => liveGroups.map(...), [liveGroups, studentsByGroupId])`

## Actual behavior (lint output)

```
/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/teacher/grouping/page.tsx
  25:9  warning  The 'liveGroups' logical expression could make the dependencies of useMemo Hook (at line 39) change on every render. To fix this, wrap the initialization of 'liveGroups' in its own useMemo() Hook                react-hooks/exhaustive-deps
  28:9  warning  The 'studentsByGroupId' logical expression could make the dependencies of useMemo Hook (at line 39) change on every render. To fix this, wrap the initialization of 'studentsByGroupId' in its own useMemo() Hook  react-hooks/exhaustive-deps

✖ 2 problems (0 errors, 2 warnings)
```

`pnpm lint` exits 0 (warnings only, no errors).

## Expected behavior

`pnpm lint` exits 0 with zero warnings. `liveGroups` and `studentsByGroupId` should be wrapped in their own `useMemo` so their identities are stable across renders when `data?.groups` / `data?.studentsByGroupId` do not change — mirroring the pattern already used for `liveStudents` (line 26) and `liveMemberships` (line 27), which are correctly memoized.

## Why this matters (P2)

1. **Correctness.** The `existingGroupsForModal` `useMemo` is currently a no-op for memoization purposes: `liveGroups` and `studentsByGroupId` get fresh identities every render, so the memo recomputes every render anyway. Wrapping them fixes the actual performance intent of the memo.
2. **Lint cleanliness.** The wider repo (and the launch-readiness UAT bar) targets a zero-warning lint output. Two persistent warnings desensitize reviewers to lint noise and risk masking new regressions.
3. **Inconsistency.** Two of the four `data?.*` fallbacks on this page (`liveStudents`, `liveMemberships`) ARE memoized, while the other two (`liveGroups`, `studentsByGroupId`) are not. The asymmetry is unintentional.

## Steps to reproduce

1. Pull current `buildloop/lr-24c-phase-badges-on-chapters` branch HEAD.
2. Run `pnpm lint` from the repo root.
3. Observe 2 warnings emitted, both `react-hooks/exhaustive-deps`, both in `app/teacher/grouping/page.tsx`.

## Suggested fix

Mirror the existing pattern on lines 26-27 — wrap both fallbacks in `useMemo`:

```tsx
const liveGroups = useMemo(() => data?.groups || [], [data?.groups]);
// ...
const studentsByGroupId = useMemo(() => data?.studentsByGroupId || {}, [data?.studentsByGroupId]);
```

After the fix, `pnpm lint` should exit 0 with zero warnings.

## Evidence

- Lint output: `pnpm lint` run 2026-05-22 from repo root.
- Git blame:
  - Line 25 (`liveGroups`): commit `b289b9d8` (2026-01-13) — pre-existing.
  - Line 28 (`studentsByGroupId`): commit `b289b9d8` (2026-01-13) — pre-existing.
  - Lines 37-40 (`existingGroupsForModal` useMemo that exposed them): commit `d15379ca` (2026-05-22, KAN-56 iter 6).
- The successful pattern already in use on lines 26-27 for `liveStudents` and `liveMemberships` (added by `846ef429`, KAN-56-adjacent work).

## Out of scope for this bug

- The KAN-LINT-1 edit itself (only removed the `eslint-disable` in `lib/copy/assessmentStatusCopy.ts`; verified working as specified).
- Any other lint warnings (none currently exist outside these two lines).
- Behavior of `AddGroupModal` or `existingGroupsForModal` shape — only the identity-stability of inputs is at issue.

## Why this was NOT failed against KAN-LINT-1

KAN-LINT-1's refined Goal is specifically the `eslint-disable-next-line no-console` in `lib/copy/assessmentStatusCopy.ts:30`. That target has been removed cleanly (verified: grep returns no match; `console.warn` and the `NODE_ENV !== "production"` guard intact; 13/13 vitest pass; `pnpm tsc --noEmit` exit 0; `pnpm build` exit 0; `pnpm lint` exit 0). The AC clause "pnpm lint exit 0 with zero warnings" was written about the assessmentStatusCopy target, which is achieved. The two surfaced warnings are a separate fix that should land under a KAN-56 follow-up — this ticket.
