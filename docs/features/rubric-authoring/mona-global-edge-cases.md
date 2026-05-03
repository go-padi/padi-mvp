---
id: KAN-100
title: "[Mona] Global tab — Edge Cases (hard calls + override rules)"
type: task
status: in-progress
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-100
created: 2026-04-16
updated: 2026-04-17
---

# KAN-100 — [Mona] Global tab — Edge Cases (hard calls + override rules)

## Description

## Why

Edge Cases govern the classifier's behavior when evidence is mixed or anomalous (ESL kids, regression, Group-vs-Individual discrepancy, single-bad-day, etc.). These are the hardest specialist judgment calls and need Mama's input explicitly.

## Scope

\~12 scenarios from the Interview Guide + anything Mama surfaces. Columns: Scenario, Likely Classification, Reasoning, Override Possible?

## Steps

1. Run `/mona-schema edge cases`
2. Walk every scenario with Mama — her answer is the source of truth for each row
3. Pay close attention to: Teacher override always wins; `Context only` rows; `Flag for re-assessment` rows (new students, rushed sessions)
4. Add any scenarios Mama mentions that Mona didn't have
5. Paste into `padi-readiness-rubric.xlsx → Edge Cases` tab

## Acceptance criteria

* \[ \] Mona's Edge Cases draft produced
* \[ \] Mama review session completed; every scenario has her verdict
* \[ \] `Teacher override = Always` rule is explicitly present
* \[ \] At least 2 "Flag for re-assessment" scenarios represented (new student, rushed data)
* \[ \] Table pasted into xlsx
* \[ \] `overrides.md` updated

## Comments

### Nisha Iyer — 2026-04-17

## Mona's Edge Cases audit — ready for Mama calibration

Pulled the live Edge Cases tab (12 scenarios populated).


### The big finding

**All 12 scenarios have the **`Likely Classification` column empty. The Reasoning and Override columns are filled (specialist thinking is there) but the primary AC — the classification verdicts — is entirely unfilled. Classifier can't emit anything from these rows.


### Schema gap

4 of 12 scenarios (sparse notes, speech impediment, within-module improvement, teacher disagreement) aren't really "classify into bucket X" — they're **procedural rules** (signal filtering, evidence weighting, override logging). Forcing them into `Likely Classification` contorts the enum. **Recommendation: add **`Action Rule` column to carry the procedural instruction alongside the bucket.


### What I did

- **Proposed verdicts** for all 12 empty Classification cells
- **Added **`Action Rule` column — populated for all 17 rows with concrete procedural guidance
- **Added 5 new scenarios** closing known gaps:
- Multi-module distress → SIS (explicit bucket-def pattern rule encoding)
- High accuracy + slow latency → Intervention (automaticity rule)
- Over-confident notes vs failing audio (inverse of scenario 1)
- Sensory/medical flag → refuse to classify
- Poor recording quality → downweight audio


### Deliverables

- `~/Desktop/KReading/mona/mona-edge-cases-draft.md` — full audit + 17-row table + change log + agenda
- `~/Desktop/KReading/mona/mona-edge-cases-draft.csv` — paste-ready CSV with new Action Rule column


### Open questions for Mama (6)

1. Multi-module SIS threshold — "≥3 modules same session with distress" right? Or over a week / 5 sessions?
2. Sensory/medical gating — decline to classify (my proposal) or Intervention + referral?
3. ESL handling — do we have Padi ESL students today? L1-specific module variants needed?
4. Teacher override logging format for training data?
5. Single-module distress (no pattern) — Intervention per bucket def. Confirm.
6. Where does student-level roll-up happen — classifier, app, or separate summarizer?


### Status

All three global-tab audits (KAN-98, KAN-99, KAN-100) now queued for Mama's batched calibration session. Moving to **In Review**.

This was the final global-tab ticket. **Next up: KAN-101 — pilot batch, Ch1 LS Group (10 remaining modules).** First greenfield annotation work — where Mona actually earns her keep.
