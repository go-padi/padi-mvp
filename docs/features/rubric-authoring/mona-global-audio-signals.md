---
id: KAN-98
title: "[Mona] Global tab — Audio Signals (thresholds per bucket)"
type: task
status: in-progress
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-98
created: 2026-04-16
updated: 2026-04-17
---

# KAN-98 — [Mona] Global tab — Audio Signals (thresholds per bucket)

## Description

## Why

Every per-module rubric row's "Key Audio Cues" references categories from the Audio Signals tab. This tab has to be set _before_ the module tabs are filled, or categories drift and modules cite cues that don't exist.

## Scope

\~11 signal categories: Response Latency, Phoneme Accuracy, Blending Fluency, Self-Correction, Rhyme Detection, Syllable Segmentation, Letter-Sound Mapping, Word Reading Fluency, Comprehension Indicators, Engagement / Attention, Repetition Needed. Columns: Signal Category, What to Listen For, Ready / Intervention / SIS thresholds, Example.

## Steps

1. Run `/mona-schema audio signals` to get Mona's audit + draft thresholds
2. Open the draft next to Mama in a \~30-min review session
3. Mama sets the numeric thresholds (seconds, %, counts) — these become the model's numeric anchors
4. Capture all overrides to `~/Desktop/KReading/mona/overrides.md`
5. Paste the final table into `padi-readiness-rubric.xlsx → Audio Signals` tab
6. If Mama adds a new signal category, update Mona's `rubric-schema.md` reference

## Acceptance criteria

* \[ \] Mona's Audio Signals draft produced
* \[ \] Mama review session completed; overrides captured
* \[ \] All thresholds numeric (no "fast"/"slow" — actual numbers)
* \[ \] Table pasted into the xlsx Audio Signals tab
* \[ \] `overrides.md` updated
* \[ \] Any new categories reflected in Mona's schema reference

## Comments

### Nisha Iyer — 2026-04-17

## Mona's Audio Signals audit — ready for Mama calibration

Pulled the live `padi-readiness-rubric.xlsx` Audio Signals tab. The tab already has 11 first-pass rows but **8 of 11 use qualitative thresholds** ("fast," "slow," "often") — they fail the AC "All thresholds numeric."


### What I did

- **Audit** of all 11 existing rows against the AC + bucket definitions
- **Rewrote** 8 non-numeric rows to numeric anchors (seconds, X/N trials, WPM, %)
- **Proposed 3 new rows** to close gaps: Audible Distress (split from Engagement), Parent/Teacher Prompting (distinct from repetition count), Articulation Clarity (for speech-impediment edge case)
- **Flagged 2 rows for Mama's specialist review**: Word Reading Fluency 40 WPM norm, Articulation Clarity thresholds
- **Change log** of xlsx row → action (keep / rewrite / split / new)
- **Suggested 30-min Mama agenda** for the calibration session


### Deliverables (on nisha's desktop)

- `~/Desktop/KReading/mona/mona-audio-signals-draft.md` — full audit + 14-row proposed table + change log + agenda
- `~/Desktop/KReading/mona/mona-audio-signals-draft.csv` — paste-ready CSV for the xlsx tab


### Open questions for Mama (6)

1. 2-min silence threshold on LS-1 — right anchor for reception-age?
2. 40 WPM K norm — Padi-specific or mainstream?
3. How does articulation factor in when phoneme-target is correct? (speech-impediment edge case)
4. Should Parent/Teacher Prompting and Instruction Repetition stay as 2 rows or collapse?
5. Inter-phoneme pause of 0.5s for blending — too tight?
6. Any signals missing that Mama wants the classifier to listen for but Mona didn't propose?


### Status

Ticket stays with Mama until she runs the ~30-min calibration and we paste final anchors into the xlsx. Moving to **In Review**.
