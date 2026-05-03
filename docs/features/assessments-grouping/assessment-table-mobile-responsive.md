---
id: KAN-83
title: "Assessment table not responsive — 4-column grid overflows on mobile"
type: bug
status: backlog
priority: medium
feature: assessments-grouping
epic: KAN-36
jira_ref: https://go-padi.atlassian.net/browse/KAN-83
created: 2026-04-14
updated: 2026-04-16
---

# KAN-83 — Assessment table not responsive — 4-column grid overflows on mobile

## Description

## Bug

The Assessments page uses `grid-cols-[1.4fr_1fr_1fr_1fr]` for its table layout with no responsive breakpoint. On screens narrower than \~768px, the four columns will compress to unreadable widths or overflow.

## Location

`app/teacher/assessments/page.tsx` — lines 136 and 144 use fixed 4-column grids with no `md:` or `sm:` responsive variants.

## Acceptance Criteria

* Given a teacher views the Assessments page on a mobile device or narrow browser
* When assessment data is present
* Then all columns are readable without horizontal scrolling
* Recommendation: stack to a card layout on mobile (similar to student cards elsewhere in the app)

## Notes

The same pattern is used for both the header row and data rows, so both need updating together.

## Comments

_No comments in Jira at time of migration._
