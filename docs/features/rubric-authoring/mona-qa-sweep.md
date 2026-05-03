---
id: KAN-110
title: "[Mona] Whole-spreadsheet QA sweep + handoff to KAN-60"
type: task
status: backlog
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-110
created: 2026-04-16
updated: 2026-04-17
---

# KAN-110 — [Mona] Whole-spreadsheet QA sweep + handoff to KAN-60

## Description

## Why

Per-section QA catches local issues. Only a whole-spreadsheet sweep catches cross-chapter issues: threshold drift across chapters, Confidence Weight distribution skew, unused Audio Signal categories, Notes Keyword phrases that got contradicted somewhere. This task also hands the completed rubric off to KAN-60 for prompt encoding.

## Steps

1. Run `/mona-qa whole spreadsheet`
2. Review the flag table with Mama in a final 30–45 min session
3. Fix all flags; re-run `/mona-qa` until clean
4. Mama signs off (comment on this ticket)
5. Export the final xlsx → CSV dump in `~/Desktop/KReading/mona/padi-readiness-rubric-final.csv`
6. Post a summary in KAN-60 with:

    * Final row count (should be 328 + global tabs)
    * Confidence Weight distribution
    * Signed-off-by
    * Link to the final CSV and the xlsx in Drive
    
7. Close this task and move KAN-60 forward on rubric-prompt encoding

## Acceptance criteria

* \[ \] Whole-spreadsheet `/mona-qa` report clean (zero open flags)
* \[ \] Mama sign-off captured as a ticket comment
* \[ \] Final CSV exported
* \[ \] KAN-60 updated with handoff summary
* \[ \] Phase 2 / Phase 3 preliminary notes captured in a follow-up ticket (or section of the xlsx flagged as preliminary)

## Dependencies

Blocked by: Ch1–Ch7 rubric tasks all complete

## Comments

_No comments in Jira at time of migration._
