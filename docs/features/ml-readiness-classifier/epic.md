---
id: KAN-60
title: "ML Build — Readiness Classifier"
type: epic
status: backlog
priority: medium
feature: ml-readiness-classifier
jira_ref: https://go-padi.atlassian.net/browse/KAN-60
created: 2026-03-06
updated: 2026-04-17
---

# KAN-60 — ML Build — Readiness Classifier

## Goal

Build the Padi Readiness Classifier — an AI model that ingests audio recordings and parent/teacher notes at the module level and classifies each child into one of three readiness buckets: **Ready for 1st Grade**, **Needs More Intervention**, or **Needs SIS / Deep Breath Therapy**.

## Background

The classifier runs as a standalone FastAPI service alongside the Padi Next.js app. Phase 1 uses a prompt-based approach (Whisper transcription + Claude Sonnet classification prompt) that requires zero training data. The classification rubric is being built module-by-module with a reading specialist.

See `ml-plan-readiness-classifier.md` in the repo root for the full lifecycle plan.

## Scope

- Supabase schema for module assessments and audio storage
- Audio recording + upload flow in the app
- Parent/teacher notes input (typed + OCR)
- FastAPI readiness classifier service (Whisper + prompt-based)
- Teacher confirmation UI (agree/disagree feedback loop)
- Integration with the existing teaching flow

## Out of Scope (for now)

- Fine-tuned ML model (requires 500+ labeled samples first)
- Phase 2 and Phase 3 content and rubrics
- Longitudinal student tracking across modules

## Comments

_No comments in Jira at time of migration._

## Children

- KAN-61 — Remove phase layer, flatten curriculum nav, and populate full content from PDFs (In Review)
  - KAN-65 — Part 1: Schema migration — drop phase table and phase_id columns (Done)
  - KAN-66 — Part 2: Flatten routes — /teacher/curriculum/[group]/[module] (Done)
  - KAN-67 — Part 3: Extract curriculum from PDFs and populate seed script (Done)
  - KAN-69 — UAT: Curriculum hierarchy (chapters/groups/modules) + Start Teaching student view (Done)
- KAN-62 — Replace module_assessments with richer module_assessment table + audio storage bucket (Done)
  - KAN-92 — Lesson Completion Flow — UAT (Done)
- KAN-76 — Pre-KAN-60: Add ML-ready columns, indexes, CHECK constraints to module_assessment (To Do)

## Related — proposed UI tickets (from classifier-ui-brief)

Not yet in Jira. See `../../design/classifier-ui-brief.md` for full context.

- Classifier service endpoint (POST /classify)
- `classifier_overrides` table + RPC
- Surface 1 — Classifier result on module completion (extends KAN-112)
- Surface 5 — Teacher override modal
- Surface 2a — Teacher student profile bucket grid
- Surface 2b — Parent student profile rollup (blocked on parent app decision)
- Settings epic shell + Privacy & AI section (NEW epic)
- Surface 3 — Opt-out toggles + confirmation flow
- Surface 4 — First-run consent modal
- Low-confidence + referral chip treatment
