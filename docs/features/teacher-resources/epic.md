---
id: KAN-38
title: "Teacher Resources & Print Materials"
type: epic
status: deferred
priority: low
feature: teacher-resources
jira_ref: https://go-padi.atlassian.net/browse/KAN-38
created: ported
updated: 2026-05-10
---

# Teacher Resources — DEFERRED to v1.1

The `/teacher/resources` route was hidden in LR-07 (2026-05-10)
because it shipped with three placeholder links (`href="#"`) and
no real resources behind them.

This epic stays open for v1.1: when there are real PDFs to host
(printable Silence Game instructions, classroom setup checklist,
parent communication template), unhide the route in
`app/teacher/layout.tsx` and wire the cards to real
`/public/resources/*.pdf` files (see LR-07 path A for the full plan).

## Children

None — KAN-78 (broken hashes) was deleted because the route no longer
exists. New tickets get filed here when real resources are ready to ship.
