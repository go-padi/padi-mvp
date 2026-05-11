---
id: KAN-36
title: "Assessments & Grouping — Logged-in Teacher Workspace"
type: epic
status: superseded
priority: medium
feature: assessments-grouping
jira_ref: https://go-padi.atlassian.net/browse/KAN-36
created: ported
updated: 2026-05-10
superseded_by: LR-13
---

# Assessments & Grouping — SUPERSEDED

The standalone `/teacher/assessments` route was retired in LR-03
(2026-05-10) per the instructional-redundancy audit in this folder.

The teacher's real need — "where is each student in the curriculum,
what did I see them struggle with last lesson" — moves to
**LR-13: Student progress view** (replaces `/teacher/assessments`),
which builds an observation-log-shaped surface inside the
start-teaching flow rather than a separate dashboard.

## What's preserved here

- `instructional-redundancy-audit.md` — the foundational audit that
  drove the route deletion. Keep for future reference; LR-13 and
  beyond should ground decisions in this document.
- `kan-80-align-all-assessment-outcome-language...` — status: done,
  retained as historical record.

## What was deleted

- `kan-45` (assessments tab empty state) — route gone
- `kan-46` (grouping and progress empty state) — replaced by LR-13
- `kan-83` (assessment table mobile responsive) — route gone

## Successor work

See `docs/features/launch-readiness/lr-13-student-progress-view.md`.
