---
id: LAUNCH
title: "Launch Readiness"
type: epic
status: in-progress
priority: highest
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-11
created_by: launch-readiness-audit
---

# Launch Readiness

Pre-launch hygiene epic. Findings come from:
- `launch-readiness-audit-2026-05-10.md` (PM + Design + Instructional Design lenses across the whole app)
- `../../walkthroughs/walkthrough-2026-05-10-teacher.md` (teacher Loom walkthrough)
- The instructional-redundancy audit in `../assessments-grouping/`

## Children

**Shipped via BuildLoop run 2026-05-10 (8 iterations, all to prod):**

1. ✅ LR-01 — Fix marketing copy: target audience age + AI claim
2. ✅ LR-02 — Add legal pages (privacy, terms, 404, error)
3. ✅ LR-03 — Retire `/teacher/assessments` route
4. ✅ LR-04 — Delete orphan / placeholder routes
5. ✅ LR-05 — Resolve `/library` vs `/teacher/curriculum` redundancy
6. ✅ LR-06 — Role-aware navigation
7. ✅ LR-07 — Wire `/teacher/resources` links or hide the page
8. ⚠️ LR-08 — Demo-data exposure review (NARROW SLICE — names + banner only; full surface audit deferred)

**Backlog — next prioritization batch:**

9. LR-09 — Fix progress-number data integrity (BLOCKER, supersedes KAN-53 + KAN-63)
10. LR-10 — Allow re-entry to completed lessons (supersedes KAN-50)
11. LR-11 — Surface curriculum sequencing — make 'next module' obvious
12. LR-12 — Disambiguate "Continue Teaching" CTA
13. LR-13 — Student progress view (replaces `/teacher/assessments`, succeeds the assessments-grouping epic)
14. LR-14 — Audio recording at module level
15. LR-15 — Match homepage copy to go-padi.com (BLOCKER, supersedes part of LR-01)

**Pending:** parent walkthrough audit — TBD when user records.

## Folders

- `iterations/lr-01-*` through `iterations/lr-08-*` — BuildLoop run
  artifacts (UAT verdicts, bug files) from the 2026-05-10 ship.
  Pipeline scratch, kept for audit trail.

## Status

- 8 shipped, 7 in backlog. LR-15 + LR-09 are the next blockers; LR-11
  + LR-13 + LR-10 are the walkthrough findings that move the activation
  needle.
- This epic gates v1 launch.
