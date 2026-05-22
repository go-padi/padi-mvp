---
id: KAN-151
title: "[BUG] KAN-64 badge uses px-2.5 instead of spec'd px-3"
type: bug
status: fixed
priority: low
severity: P3
feature: start-teaching-flow
parent: KAN-64
uat: KAN-64-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The group-membership badge `<span>` in the student profile uses
`px-2.5 py-1`. The refined ticket (and the UAT acceptance prompt)
specify `px-3 py-1`.

### Where

- File: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Line 523.

### Evidence

Implementation (line 523):
```
className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
```

Refined ticket (line 70 of
`.buildloop/iterations/004/feature-refined.md`):
```
className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
```

UAT prompt point 3 lists the exact same `px-3 py-1` class string.

### Expected

`px-3` (12px horizontal padding) instead of `px-2.5` (10px).

### Why this matters

- Design fidelity: the badge pill is 4px narrower than designed.
- This is cosmetic only — no functional impact — but every other
  attribute of the className matches verbatim, so this single
  deviation reads as either a typo or a copy-from-existing-pill
  mistake. The neighbouring status pill on line 477 uses
  `px-2.5`, which is likely the source of the drift.

### Fix

Change `px-2.5` to `px-3` on line 523.

### Acceptance for the fix

- The badge `<span>` className matches the refined-ticket spec
  verbatim.
- Re-run KAN-64 UAT.

## Fix Notes

**Root cause:** Drift from the nearby status-pill className on line
477, which uses `px-2.5`. The implementer likely copied the
neighbour and missed the one-character difference called for in the
spec.

**Files changed:**
- `app/teacher/start-teaching/students/[studentId]/page.tsx` —
  changed `px-2.5` to `px-3` on the group-membership badge `<span>`.

**Why this fix is correct:** The className now matches the refined
ticket's spec verbatim (`inline-flex items-center rounded-full
bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700`). Purely
cosmetic; no other attributes or behaviour changed.
