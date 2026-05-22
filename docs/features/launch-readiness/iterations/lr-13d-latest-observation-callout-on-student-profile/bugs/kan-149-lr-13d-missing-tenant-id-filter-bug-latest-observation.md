---
id: KAN-149
title: "[Bug] LR-13d latestObservation query missing tenant_id filter"
type: bug
status: fixed
priority: medium
severity: P2
feature: launch-readiness
parent: LR-13d
uat: LR-13d-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The new `latestObservation` query added in
`app/teacher/start-teaching/students/[studentId]/page.tsx` filters
only by `student_id` and omits the required `.eq('tenant_id', tenantId)`
filter that the LR-13d refined ticket (and the canonical LR-13c
pattern in
`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`,
lines 240–247) requires.

### Steps to reproduce (source inspection)

1. Open `app/teacher/start-teaching/students/[studentId]/page.tsx`.
2. Look at the try block inserted into the existing student-data
   useEffect (around lines 164–171):

   ```ts
   const { data, error } = await sb
     .from('lesson_completions')
     .select('completed_at, notes, module_id')
     .eq('student_id', studentId)
     .order('completed_at', { ascending: false })
     .limit(1);
   ```

3. Note that the canonical reference query in the lesson page
   (LR-13c, lines 240–247 of the curriculum module page) explicitly
   includes `.eq('tenant_id', tenantId)` alongside `student_id`.

### Expected (per refined ticket AC2)

> Filters by `tenant_id` and `student_id`

Per the refined ticket
(`.buildloop/iterations/002/feature-refined.md`, Requirements §1):

```ts
const { data, error } = await sb
  .from('lesson_completions')
  .select('completed_at, notes, module_id')
  .eq('tenant_id', tenantId)
  .eq('student_id', studentId)
  .order('completed_at', { ascending: false })
  .limit(1);
```

### Actual

Query in the diff filters only by `student_id`. The `tenantId` from
`useAuth()` is not destructured in the component (the file never
references it) and the `.eq('tenant_id', ...)` predicate is absent.

### Impact / Severity

- P2 (not P1): runtime safety is still upheld by the existing RLS
  policy on `lesson_completions` (`fresh-setup.sql` line 377–378,
  `for all using (tenant_id in (select tenant_id from public.profiles
  where id = auth.uid()))`), so cross-tenant data cannot actually
  leak via this query in production.
- However, this is an explicit AC violation. The refined ticket
  required the tenant_id filter as defense-in-depth — matching the
  LR-13c pattern — so the query remains correct even if RLS is
  bypassed (e.g. service-role contexts in future refactors).
- Loss of consistency with LR-13c canonical pattern increases
  cognitive load for future maintenance.

### Suggested fix

In `app/teacher/start-teaching/students/[studentId]/page.tsx`:

1. Pull `tenantId` from `useAuth()`:

   ```ts
   const { isLoggedIn, isHydrated, tenantId } = useAuth();
   ```

2. Gate the fetch on `tenantId` being present (matching LR-13c
   pattern), and add the filter:

   ```ts
   if (!tenantId) {
     setLatestObservation(null);
     return; // or skip just this block
   }
   const { data, error } = await sb
     .from('lesson_completions')
     .select('completed_at, notes, module_id')
     .eq('tenant_id', tenantId)
     .eq('student_id', studentId)
     .order('completed_at', { ascending: false })
     .limit(1);
   ```

3. Re-run `pnpm lint && pnpm tsc --noEmit && pnpm build`.

### Notes

- 42703 try/catch handling is correct.
- State shape, JSX (amber, line-clamp-3, position above Next up),
  no-regression checks, auth-store untouched, and lint/tsc/build all
  pass.
- This is the only AC violation found in source inspection.

## Fix Notes

**Root cause:** The `latestObservation` fetch was written without destructuring `tenantId` from `useAuth()`, so the canonical LR-13c filter pattern (`.eq('tenant_id', tenantId).eq('student_id', ...)`) was reduced to a `student_id`-only filter. Production was protected by RLS, but AC2 ("Filters by `tenant_id` and `student_id`") was violated and the query no longer matched the LR-13c reference implementation.

**Files changed:**
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — added `tenantId` to `useAuth()` destructuring; gated the `lesson_completions` fetch on `tenantId` being present (clears `latestObservation` to `null` when absent, matching the empty-state behavior); added `.eq('tenant_id', tenantId)` to the query (placed before `.eq('student_id', ...)` to mirror the LR-13c lesson-page pattern); added `tenantId` to the `useEffect` dependency array so the query re-runs once auth hydrates.

**Why this fix is correct:** The fetch now mirrors the canonical LR-13c query at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:240–247` exactly (modulo the `subject_id`/`module_id` filters that LR-13d intentionally omits to surface the *latest* observation across modules). Defense-in-depth is restored: the query would still return only same-tenant rows if RLS were ever bypassed (e.g. service-role context). The 42703 try/catch and the empty-state JSX above "Next up" are untouched, so no other behavior changes. Anonymous/unhydrated-auth users (`!tenantId`) fall through to the same `setLatestObservation(null)` empty state as the no-observations case, preserving the rest of the page's loading flow.
