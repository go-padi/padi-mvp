---
id: KAN-156
title: "[LR-09a followup] New lint warning: useCallback missing dep 'startData' on app/teacher/page.tsx:62"
type: bug
status: fixed
priority: low
severity: P3
feature: launch-readiness
parent: LR-09a
uat: LR-09a-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

LR-09a introduced one new lint warning the orchestrator flagged for tracking:

```
/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/teacher/page.tsx
  62:6  warning  React Hook useCallback has a missing dependency: 'startData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
```

### The hook in question

```ts
const fetchData = useCallback(async () => {
  await startData.refetch();
}, [startData.refetch]);
```

### Why it's flagged

The linter wants `startData` in the deps array because it's accessed via property lookup inside the body. Listing `startData.refetch` instead of `startData` is a known lint anti-pattern.

### Why it currently works anyway

`startData.refetch` returns `load` (a stable `useCallback` inside `useStartTeachingData`). The reference is stable across renders even as `startData` itself is a new object on every `liveStudents` / `liveGroups` change. So the lint warning is a false positive in terms of correctness — `fetchData` doesn't go stale on the wrong dependency.

### Why we still want to fix it

- Lint discipline: zero warnings target for the launch-readiness epic.
- Future-proofing: if anyone later wraps `refetch` differently in the hook (e.g. switches to inline arrow), the dep would silently go stale.
- Build-summary noise: every BuildLoop run will surface this one warning indefinitely until cleared.

### Suggested fix

Inline the call: drop the `fetchData` useCallback indirection entirely, since it's a one-liner:

```ts
useEffect(() => {
  lastFetchAtRef.current = Date.now();
  startData.refetch().finally(() => {
    mountedRef.current = true;
  });
}, [startData, pathname]);
```

Or, hoist the `refetch` reference into a local:

```ts
const refetch = startData.refetch;
const fetchData = useCallback(async () => {
  await refetch();
}, [refetch]);
```

Either makes the lint warning go away cleanly.

### Severity

P3, low-priority followup. Not a launch blocker for LR-09a; not a behavioral bug.

### Files

- `app/teacher/page.tsx:60-62`


## Fix Notes

### Root cause

The `react-hooks/exhaustive-deps` rule flags `[startData.refetch]` as a missing-dep warning for `startData` itself, because the body accesses a property on `startData`. The rule wants the whole object listed even though only one property is consumed — a known false positive in terms of correctness (the underlying `refetch` reference is stable across `startData` identity churn), but a real lint discipline issue for the zero-warnings launch-readiness target.

### Files changed

- `app/teacher/page.tsx` — hoisted `const refetch = startData.refetch;` to a local just below the `useStartTeachingData()` call, and updated `useCallback` to close over `refetch` with `[refetch]` as its dependency. The `useCallback` body now references the local, not the property lookup, so the rule sees a primitive dependency name and is satisfied.

### Why this fix is correct

- **Clears the warning.** The dep array `[refetch]` references a binding declared in the same scope, with no property access in the body, so `react-hooks/exhaustive-deps` is satisfied.
- **Preserves prior runtime behavior.** `refetch` resolves to the same stable `load` callback from `useStartTeachingData`. The `fetchData` callback's identity changes only when that underlying `load` identity changes (i.e., when `useStartTeachingData`'s `load` dependencies — `isHydrated`, `isLoggedIn`, `tenantId` — change), which matches the prior behavior exactly.
- **Future-proofs the dep.** If a future change to `useStartTeachingData` wraps `refetch` differently and breaks identity stability, this code now depends on it correctly and will re-create `fetchData` as expected, instead of silently going stale.
