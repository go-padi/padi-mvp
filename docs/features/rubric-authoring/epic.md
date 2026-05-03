---
id: KAN-96
title: "PADI Readiness Rubric Authoring — 328-module specialist annotation"
type: epic
status: backlog
priority: medium
feature: rubric-authoring
jira_ref: https://go-padi.atlassian.net/browse/KAN-96
created: 2026-04-16
updated: 2026-04-17
---

# KAN-96 — PADI Readiness Rubric Authoring — 328-module specialist annotation

## Goal

Fill in the **PADI Readiness Rubric** (`padi-readiness-rubric.xlsx`) — the 328-module spreadsheet that encodes reading-specialist knowledge into the Claude Sonnet classifier prompt built in **KAN-60**. Every module gets Ready / Intervention / SIS-Therapy observable behaviors, a Confidence Weight, Key Audio Cues, and Specialist Notes, in both Group and Individual modes.

This work _unblocks_ KAN-60: the classifier prompt cannot be authored until the rubric is filled.

## Approach — human-in-loop with AI annotator

The bulk drafting is done by **Mona** — an AI reading-specialist annotator packaged as a Cowork plugin (`mona-annotator`, installed from `~/Desktop/KReading/mona-annotator.plugin`). Mona drafts rubric rows from the ASDEC Kickstart PDF + `k-reading-specialist` corpus plugin. Every draft is reviewed by a human reading specialist (Mama + Neal) before it's committed to the spreadsheet. Mom's overrides feed back into Mona's style guide so future batches inherit her voice.

## Scope

- 3 global tabs: Audio Signals (~11 signal categories), Notes Keywords (~10 categories), Edge Cases (~12 scenarios)
- 7 chapters × Group/Individual = 328 module rows
  - Ch1 Phonological Awareness — 137 rows (LS/RMG/WS/SYL/IS/FS/MS/CS × G/I)
  - Ch2 Alphabet — 44 rows (AL × G/I)
  - Ch3 Phonics — 14 rows (P × G/I)
  - Ch4 Reading — 34 rows (R + RE × G/I)
  - Ch5 Handwriting — 21 rows (HW × G/I)
  - Ch6 Spelling — 36 rows (S + SE × G/I)
  - Ch7 VCF — 18 rows (VCF × G/I)
- Whole-spreadsheet QA sweep
- Encoding of final rubric into the KAN-60 classifier prompt

## Sources of truth

- `padi-readiness-rubric.xlsx` — Drive → Padi ML → Annotations
- `padi-specialist-interview-guide.docx` — Drive → Padi ML → Model training
- `ASDEC - Kickstart Reading and Numeracy.pdf` — local `~/Desktop/KReading/`

## Definition of Done

- All 328 module rows filled with non-placeholder, concrete, observable behaviors
- All 3 global tabs filled, with thresholds set by the specialist
- Whole-spreadsheet `/mona-qa` report clean (no open flags)
- Specialist (Mama) has signed off on each chapter
- Rubric content handed off to KAN-60 for prompt encoding

## Out of scope

- Phase 2 / Phase 3 rubric content (preliminary notes only)
- Classifier service build (lives in KAN-60)
- Model fine-tuning (future, post-500-labeled-samples)

## Tracking conventions

Every child task carries labels `mona`, `rubric`, `readiness-classifier`. Tasks awaiting Mom's specialist review carry `specialist-review-needed`; the label is removed when sign-off lands.

## Related

- **Blocks:** KAN-60 (ML Build — Readiness Classifier)
- **Plugins used:** `k-reading-specialist`, `mona-annotator` (in `~/Desktop/KReading/`)

## Comments

### Nisha Iyer — 2026-04-17

**Architectural decision — rubric + classifier destination**

**Decision:** The readiness classifier lives inside `padi-app-starter` at `/services/readiness-classifier/`, not as a separate repo or microservice.

**Rationale:** Current classifier is a Claude Sonnet prompt + glue code, not a trained model. No GPU, no heavy deps, no independent release cadence — nothing that justifies the microservice tax at this stage. Extract later if/when the ML side grows (real embedding model, on-device Whisper, separate team).

**Authoring vs runtime:**

- Drive `padi-readiness-rubric.xlsx` remains the **authoring surface** while Mama/Neal review (through KAN-110)
- On completion, KAN-111 exports xlsx → JSON → commits to `padi-app-starter/services/readiness-classifier/rubric/`
- Post-migration, Drive remains the source of truth for human edits; repo JSON is regenerated on demand via `export-rubric.ts`

**What does NOT move into padi-app-starter:**

- Cowork plugins (`k-reading-specialist`, `mona-annotator`) — authoring tools, not product code
- Mona's working CSVs in `~/Desktop/KReading/mona/` — scratch output, discarded after paste into Drive
- The ASDEC PDF and reference docs — stay in Drive

**New ticket added:** KAN-111 captures the migration step. Blocked by KAN-110 (rubric must be clean before migration); blocks KAN-60 (classifier consumes the in-repo rubric).

## Children

**Global tabs:**
- KAN-97 — Setup — install plugins + single-row sanity check (Done)
- KAN-98 — Global tab — Audio Signals (thresholds per bucket) (In Review)
- KAN-99 — Global tab — Notes Keywords (parent/teacher language → bucket) (In Review)
- KAN-100 — Global tab — Edge Cases (hard calls + override rules) (In Review)

**Chapter work:**
- KAN-101 — Pilot + calibration — Ch1 Learning Sensorially Group (11 modules) (In Review)
- KAN-102 — Ch1 Phonological Awareness — remaining Group rubric (RMG, WS, SYL, IS, FS, MS, CS) — 77 modules (To Do)
- KAN-103 — Ch1 Phonological Awareness — Individual rubric (all 8 sections) — 73 modules (To Do)
- KAN-104 — Ch2 Alphabet rubric (AL Group + AL Individual) — 44 modules (To Do)
- KAN-105 — Ch3 Phonics rubric (P Group + P Individual) — 14 modules (To Do)
- KAN-106 — Ch4 Reading rubric (R + RE, Group + Individual) — 34 modules (To Do)
- KAN-107 — Ch5 Handwriting rubric (HW Group + HW Individual) — 21 modules (To Do)
- KAN-108 — Ch6 Spelling rubric (S + SE, Group + Individual) — 36 modules (To Do)
- KAN-109 — Ch7 VCF rubric (Vocab/Comprehension/Fluency, Group + Individual) — 18 modules (To Do)

**Handoff:**
- KAN-110 — Whole-spreadsheet QA sweep + handoff to KAN-60 (To Do)
- KAN-111 — Migrate rubric from Drive → padi-app-starter/services/readiness-classifier/rubric/ (To Do)
