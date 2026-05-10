---
id: LAUNCH
title: "Launch Readiness"
type: epic
status: in-progress
priority: highest
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-10
created_by: launch-readiness-audit
---

# Launch Readiness

Pre-launch hygiene epic. Findings come from the launch-readiness audit
(`launch-readiness-audit-2026-05-10.md`), which applied PM + Design +
Instructional Design lenses to the whole app. Children of this epic are
the prioritized tickets to ship before the app goes live.

## Children

See sibling files in this folder. Each child ticket has its own .md with
frontmatter. Order roughly by priority (highest first):

**From the surface-area audit (2026-05-10):**

1. LR-01 — Fix marketing copy: target audience age + AI claim ✅ done
2. LR-02 — Add legal pages (privacy, terms, 404, error)
3. LR-03 — Retire `/teacher/assessments` route per redundancy audit
4. LR-04 — Delete orphan / placeholder routes
5. LR-05 — Resolve `/library` vs `/teacher/curriculum` redundancy
6. LR-06 — Role-aware navigation (parent vs teacher entry experience)
7. LR-07 — Wire `/teacher/resources` links or hide the page
8. LR-08 — Demo-data exposure review

**From the teacher walkthrough audit (2026-05-10):**

9. LR-09 — Fix progress-number data integrity (BLOCKER — broken numbers destroy trust)
10. LR-10 — Allow re-entry to completed lessons (Montessori repetition)
11. LR-11 — Surface curriculum sequencing — make 'next module' obvious
12. LR-12 — Disambiguate "Continue Teaching" CTA
13. LR-13 — Student progress view (replaces `/teacher/assessments`)
14. LR-14 — Audio recording at module level (deferrable to v1.1 if needed)

**Pending parent walkthrough audit** — TBD findings.

## Status

- **In progress** — audit completed, tickets filed, none built yet.
- This epic gates v1 launch. Until LR-01 through LR-04 ship, the app
  has misleading marketing copy, no legal pages, audit-known-redundant
  surfaces, and orphan routes — none of which a public launch can absorb.
