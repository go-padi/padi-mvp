---
id: KAN-101
title: "[Mona] Pilot + calibration — Ch1 Learning Sensorially Group (11 modules)"
type: task
status: in-progress
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-101
created: 2026-04-16
updated: 2026-04-17
---

# KAN-101 — [Mona] Pilot + calibration — Ch1 Learning Sensorially Group (11 modules)

## Description

## Why

Before mass-annotating 328 modules, we calibrate Mona's voice on a single high-signal section. LS Group is chosen because (a) it's the opening section of the curriculum, (b) the Interview Guide discusses it most (e.g. The Silence Game), and (c) Mama is likely to have the strongest opinions here.

The real deliverable of this task is **an updated style guide** that carries Mama's voice into every downstream batch.

## Scope

LS-1 through LS-11, Group mode. 11 rows total.

## Steps

1. Confirm global tabs (KAN audio signals, notes keywords, edge cases) are done — they're prerequisites
2. Run `/mona-annotate Ch1 Learning Sensorially Group`
3. Open the markdown review table next to Mama; walk every bullet of every row
4. Capture every push-back — even wording preferences — into `overrides.md`
5. Identify _patterns_ in Mama's feedback (not just single cells). Examples: "she always emphasizes eye-closing discipline over sound recall in LS," "she thinks Confidence Weight 5 is too strong for anything attention-dependent"
6. Hand the patterns back to me — I'll update `skills/mona-annotator/references/rubric-style-guide.md` and `bucket-definitions.md` so the next batch inherits the calibration
7. Re-run `/mona-annotate Ch1 Learning Sensorially Group` on 2 rows to verify the updated Mona hits closer
8. Run `/mona-qa` on the 11 rows, fix flags
9. Paste into `padi-readiness-rubric.xlsx → Ch1 Phon Awareness` tab (the LS-1..11 Group rows in the Group Instruction Modules section)
10. Update Completion Tracker (LS Group: 11/11, 100%)

## Acceptance criteria

* \[ \] 11 LS Group rows drafted, reviewed with Mama, and pasted into xlsx
* \[ \] Style-guide patterns captured and integrated into Mona's skill references
* \[ \] Re-run on 2 rows after style update shows tighter alignment with Mama's voice
* \[ \] `/mona-qa` pass clean
* \[ \] Completion Tracker updated
* \[ \] `overrides.md` has at least 3 reusable voice rules

## Dependencies

Blocks: all downstream chapter tasks (because the style-guide update lives in this task)

## Comments

### Nisha Iyer — 2026-04-17

## Pilot calibration batch ready for Mona's review (2026-04-17)

**Blocker resolved.** Curriculum source located: Mohana B. Iyer, _K-Reading KickStart for Classroom Group Instruction_ (2018, rev. 2023). Group PDF is 502 pp; Individual is 550 pp. Both in `/KReading/curriculum/`.

**Scope delivered — 3 of 11 LS Group modules drafted (option 2: calibrate before committing to full 11):**


| Module | Title | CW | Primary skill signal | Key flags |
| --- | --- | --- | --- | --- |
| LS-1 | The Silence Game | 2 | Auditory attention baseline | 🔒 peer contagion; ❓ 2-min threshold |
| LS-2 | Guessing the Instrument | 3 | Auditory discrimination | ⚠ hearing-screen flag rule |
| LS-3 | Sequencing Sounds Game | 4 | Working memory + ordinal reasoning | ❓ working-memory-limited edge case |
| LS-4 | Guess the Direction | 3 | Sound localization | 🔒 sensory confound (audiology referral) |

**Deliverables:**

- `mona/mona-ch1-ls-group.md` — review doc with full rationale, Audio Cues, Specialist Notes, and pilot-calibration checkpoints
- `mona/mona-ch1-ls-group.csv` — paste-ready rows for the Ch1 LS Group tab
- `mona/wall-of-questions-for-mona.md` — consolidated open-questions doc now also in Drive (Padi ML folder)

**6 calibration checkpoints Mona needs to decide before LS-5..LS-11 drafting:**

1. Numeric anchors (≥4/5, 2/3 trials, 4-sound sequences, 3-sec latency) — right for K-age?
2. Voice — "audible distress," "eyes-closed discipline," "cardinal vocabulary" — her language or re-phrase?
3. Group peer-contagion handling — downweight the trial or kill it entirely?
4. LS-2 hearing-screen flag trigger (0 correct + no distress + eyes closed) — correct diagnostic rule?
5. LS-4 first-exposure rule (≥2 sessions before classifying) — 1, 2, or 3?
6. CW spread (LS-1=2, LS-2=3, LS-3=4, LS-4=3) — correct relative ordering?

**Status change:** In Progress → In Review. Remaining 7 modules (LS-5 through LS-11) gated on Mona's calibration; projected ~25 min to propagate her voice across the remaining LS Group batch once calibrated.

**Cross-ticket context:** Calibration also informs KAN-98 (Q1–Q3), KAN-99 (Q4–Q9), KAN-100 (Q10–Q16) per the wall-of-questions doc. Batching Mona's review session to cover all four tickets is recommended — estimated 45–60 min total.

— Mona (the AI annotator)
