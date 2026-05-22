---
id: KAN-150
title: "[BUG] KAN-64 membership queries missing tenant_id filter and tenantId gate"
type: bug
status: fixed
priority: high
severity: P1
feature: start-teaching-flow
parent: KAN-64
uat: KAN-64-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The KAN-64 group-membership fetch in
`app/teacher/start-teaching/students/[studentId]/page.tsx` does not
filter `student_group_memberships` (or the 2-query `groups` fallback)
by `tenant_id`, and the fetch is not gated on `tenantId` being
present. The refined ticket explicitly requires both.

### Where

- File: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Lines 167–216 (the `// KAN-64: fetch active group memberships`
  block inside the student-data `useEffect`).

### Evidence

Embedded-select query (lines 169–173):
```ts
const { data: embedded, error: embedErr } = await sb
  .from('student_group_memberships')
  .select('group_id, groups(name)')
  .eq('student_id', studentId)
  .eq('active', true);
```
No `.eq('tenant_id', tenantId)`.

Two-query fallback `groups` lookup (lines 196–199):
```ts
const { data: groupsData, error: groupsErr } = await sb
  .from('groups')
  .select('id,name')
  .in('id', groupIds);
```
No `.eq('tenant_id', tenantId)`.

Effect dependency array (line 310): `[studentId, isHydrated,
isLoggedIn, tenantId, fetchCompletions]` — re-runs when `tenantId`
changes, but the membership block itself does not check `tenantId`
before issuing the query. The LR-13d `lesson_completions` query
immediately below it does gate on tenantId (line 218: `if
(!tenantId) { setLatestObservation(null); } else { ... .eq('tenant_id',
tenantId) ... }`).

### Expected (per refined ticket lines 46–54 and UAT prompt point 2)

```ts
const { data, error } = await sb
  .from('student_group_memberships')
  .select('group_id, groups(name)')
  .eq('tenant_id', tenantId)
  .eq('student_id', studentId)
  .eq('active', true);
```
With the entire block gated on `tenantId && studentId` (mirroring
the LR-13d pattern at line 218).

### Why this matters

- The refined ticket lists tenant_id filtering as a hard requirement.
- Cross-tenant leakage is only prevented by RLS today; defense-in-
  depth requires the explicit filter the spec called for.
- Without the `tenantId` gate the query fires before tenant
  resolution, which can produce a stale-empty render and a wasted
  round-trip on every navigation.

### Steps to reproduce

1. Source-inspection: `grep -n "tenant_id"
   app/teacher/start-teaching/students/[studentId]/page.tsx` returns
   exactly one hit (line 225, the LR-13d lesson_completions query).
   The KAN-64 block on lines 167–216 has no tenant_id reference.
2. Manual: a teacher in tenant A whose student row was created in
   tenant A would still see badges for that student even if RLS
   were misconfigured. There is no defense-in-depth at the query
   layer.

### Fix

1. Wrap the entire `// KAN-64` block in `if (tenantId) { ... } else
   { setMemberships([]); }` analogous to the LR-13d pattern at line
   218.
2. Add `.eq('tenant_id', tenantId)` to both the embedded-select
   query AND the 2-query fallback `groups` lookup.

### Acceptance for the fix

- Both membership queries include `.eq('tenant_id', tenantId)`.
- The block does not run when `tenantId` is falsy; `memberships`
  stays `[]`.
- `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build` all exit 0.
- Re-run KAN-64 UAT and flip verdict to PASS.

## Fix Notes

**Root cause:** The KAN-64 membership-fetch block was implemented
without mirroring the LR-13d tenant pattern that lives just below it
in the same `useEffect`. The query fired unconditionally on every
re-run of the effect and relied solely on RLS for tenant isolation,
contradicting the refined ticket's explicit "tenant_id filter +
tenantId gate" requirement.

**Files changed:**
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — wrap
  the KAN-64 block in `if (!tenantId) { setMemberships([]); } else
  { ... }`; add `.eq('tenant_id', tenantId)` to both the embedded
  `student_group_memberships` select and the 2-query fallback
  `groups` select.

**Why this fix is correct:**
- The gate matches the LR-13d pattern on the very next block, so
  the two membership-area queries now have consistent tenant
  handling.
- Adding `.eq('tenant_id', tenantId)` on `student_group_memberships`
  delivers the defense-in-depth the refined ticket called for: even
  if RLS were misconfigured, cross-tenant rows are filtered at the
  query layer.
- The fallback `groups` lookup also filters by `tenant_id`, so the
  name-resolution path can't accidentally surface another tenant's
  group name for a coincidentally-matching id.
- When `tenantId` is falsy (initial render before tenant resolves),
  `memberships` stays `[]` and no round-trip is issued; the effect
  re-runs once `tenantId` populates because it's already in the
  dependency array.
