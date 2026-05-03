---
id: KAN-99
title: "[Mona] Global tab — Notes Keywords (parent/teacher language → bucket)"
type: task
status: in-progress
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-99
created: 2026-04-16
updated: 2026-04-17
---

# KAN-99 — [Mona] Global tab — Notes Keywords (parent/teacher language → bucket)

## Description

## Why

Parent/teacher notes are half of the classifier's input. This tab maps actual phrases parents write ("she cried," "got it right away") to readiness buckets with confidence levels. It's authored once and reused for every module.

## Scope

\~10 categories: Positive Progress, Mild Concern, Frustration / Avoidance, Attention Issues, Memory Difficulty, Physical Difficulty, Speech Concerns, Comparison Language, Environmental Factors, Regression. Columns: Category, Parent/Teacher Language, Maps to Bucket, Confidence, Notes.

## Steps

1. Run `/mona-schema notes keywords`
2. Review with Mama — she almost certainly has phrases to add that Mona hasn't heard before
3. Pay attention to `Environmental Factors` and `Comparison Language` — both should stay `Context only` and NOT drive a classification
4. Paste into `padi-readiness-rubric.xlsx → Notes Keywords` tab

## Acceptance criteria

* \[ \] Mona's Notes Keywords draft produced
* \[ \] Mama review completed; overrides captured
* \[ \] All rows have a `Maps to Bucket` + `Confidence` value
* \[ \] Context-only rows clearly flagged (do not drive classification)
* \[ \] Table pasted into xlsx
* \[ \] `overrides.md` updated with new phrases

## Comments

### Nisha Iyer — 2026-04-17

## Mona's Notes Keywords audit — ready for Mama calibration

Pulled the live Notes Keywords tab (10 rows populated). 4 of 10 rows break the schema or contradict bucket definitions.


### What's broken

- **Row 3 Frustration/Avoidance → SIS/Therapy, High** contradicts bucket-def guardrail "pattern, not single incident" — catastrophic false-positive SIS risk
- **Row 4 Attention Issues → "Intervention or SIS"** — not a legal enum per rubric-schema.md; classifier can't parse
- **Row 7 Speech Concerns → SIS/Therapy** — bucket def says speech impediment → threshold adjustment, not auto-SIS
- **Row 8 Comparison Language → Intervention** — the row's own Notes field says "relative, not diagnostic." Should be Context only.
- **Row 10 Regression → "Intervention or SIS"** — illegal enum; should be "Flag for re-assessment"


### What I did

- **Rewrote** 4 miscalibrated rows (rows 3, 4, 7, 10)
- **Tightened** 2 rows (Physical Difficulty with age gate <7 vs ≥7; Comparison Language → Context only)
- **Kept** 4 rows (Positive Progress, Mild Concern, Memory Difficulty, Environmental Factors)
- **Proposed 5 new rows** to close gaps: Automaticity Language, Self-Correction Language, Independence Language (the 3 Ready hallmarks from bucket def), Help-Seeking/Dependence, Sensory/Medical Flags
- **Proposed schema change:** add `Audio Signal Tie-In` column to enable evidence fusion between Notes and Audio tabs


### Deliverables

- `~/Desktop/KReading/mona/mona-notes-keywords-draft.md` — full audit + 17-row proposed table + change log
- `~/Desktop/KReading/mona/mona-notes-keywords-draft.csv` — paste-ready CSV (includes new Audio Signal Tie-In column)


### Open questions for Mama (6)

1. Can strong parent language alone trigger SIS, or does bucket-def "pattern across modules" mean notes alone can never trigger SIS?
2. Speech concerns: auto-decline ("Flag for speech eval") vs Intervention + warning?
3. Sensory gating: does the classifier refuse to emit a bucket, or emit Intervention by default?
4. Should keyword weights differ per chapter (reversals matter more in Handwriting than in Rhyming)?
5. Add a Padi-app-usage language category?
6. Case/typo normalization ("cant" → "can't") — anything she wants preserved verbatim?


### Status

Batched review target: combine with KAN-98 (Audio Signals) + KAN-100 (Edge Cases, up next) for a single Mama session covering all three global tabs. Moving to **In Review**.
