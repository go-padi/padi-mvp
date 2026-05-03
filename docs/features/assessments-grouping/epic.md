---
id: KAN-36
title: "Assessments & Grouping — Logged-in Teacher Workspace"
type: epic
status: backlog
priority: medium
feature: assessments-grouping
jira_ref: https://go-padi.atlassian.net/browse/KAN-36
created: 2026-02-26
updated: 2026-02-26
---

# KAN-36 — Assessments & Grouping — Logged-in Teacher Workspace

## Description

Teacher workspace for tracking student progress with real data: live assessment table, grouping management, and progress visualization.

**Covers:**

- Assessments tab with live student data (replacing demo data for logged-in teachers)
- Grouping & Progress tab with real group management
- Teaching Mode Toggle behavior with live students
- Empty states with CTAs when no students are added yet

**Relates to:** KAN-13 (logged-in dashboard), KAN-29 (logged-in UAT with students).
**Depends on:** KAN-1 auth and KAN-18 schema being complete.

**Key files:** `app/teacher/assessments/page.tsx`, `app/teacher/grouping/page.tsx`, `lib/demo/`

## Comments

_No comments in Jira at time of migration._

## Children

- KAN-80 — Align all assessment/outcome language to the 3-signal north star (Ready / Needs Help / Needs Intervention)
- KAN-83 — Assessment table not responsive — 4-column grid overflows on mobile
- KAN-112 — Readiness signal step on lesson completion — inline teacher assessment (Done)
  - KAN-116 — Readiness Signal Inline Assessment — UAT (Done)
