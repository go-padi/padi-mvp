---
id: KAN-80
title: "Align all assessment/outcome language to the 3-signal north star (Ready / Needs Help / Needs Intervention)"
type: story
status: in-progress
priority: high
feature: assessments-grouping
epic: KAN-36
jira_ref: https://go-padi.atlassian.net/browse/KAN-80
created: 2026-04-14
updated: 2026-04-19
---

# KAN-80 — Align all assessment/outcome language to the 3-signal north star (Ready / Needs Help / Needs Intervention)

## Description

## Goal

The product's core output — determining if a child is Ready, Needs Help, or Needs Intervention — is not represented anywhere in the current UI. This story aligns all status language across the app to the three-signal framework.

## Background

Currently the app uses three different sets of terminology:

* **Assessments page**: "Not started / In progress / Ready for review" — generic workflow states, not outcomes
* **About page outcomes**: "Ready for Grade 1 / Remedial Support / SIS Therapy" — different words, and "SIS Therapy" is jargon
* **Student cards**: "Not started / Screening / Complete" — again different

None of these match the north star signals. A teacher using the app today has no way to see or assign the three outcomes that are the entire point of the product.

## Requirements

1. Define the canonical status values: **Ready**, **Needs Help**, **Needs Intervention**
2. Update the Assessments page status badges to use these values
3. Update the About page "Final Outcomes" section to use this language (replacing "Remedial Support" and "SIS Therapy")
4. Update student card status badges where they show assessment outcomes
5. Use consistent color coding: green for Ready, amber/yellow for Needs Help, red/orange for Needs Intervention

## Acceptance Criteria

* Given a teacher views any page showing student assessment status
* When the status refers to a completed assessment outcome
* Then it uses one of: Ready, Needs Help, Needs Intervention
* Given a teacher reads the About page outcomes section
* Then the three outcomes match the language used in Assessments and student cards

## Out of Scope

* Actual assessment logic/scoring (separate ticket)
* Database schema changes for assessment_status enum (may need its own migration ticket)

## Comments

### Nisha Iyer — 2026-04-19

**Implementation complete.** All assessment/outcome language aligned to the 3-signal north star across 5 files:

1. `app/teacher/about/page.tsx` — "Ready for Grade 1" → "Ready", "Remedial Support" → "Needs Help", "SIS Therapy" → "Needs Intervention". Updated descriptions and color coding (green / amber / red).
2. `lib/demo/demoStudents.ts` — "Screening" → "Needs Help", "Ready for review" → "Ready". Demo data now showcases north star signals.
3. `app/teacher/assessments/page.tsx` — Badge logic updated to handle Ready (green), Needs Help (amber), Needs Intervention (red), plus existing In progress (blue) and Not started (gray).
4. `app/teacher/page.tsx` — Student card badge logic aligned to same color scheme.
5. `lib/startTeaching/useStartTeachingData.ts` — Status derivation now preserves north star outcome values (Ready / Needs Help / Needs Intervention) from DB instead of overwriting them with generic workflow states.

No DB schema changes. TypeScript + ESLint clean.
