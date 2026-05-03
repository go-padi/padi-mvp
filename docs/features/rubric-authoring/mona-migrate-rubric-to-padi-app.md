---
id: KAN-111
title: "[Mona] Migrate rubric from Drive → padi-app-starter/services/readiness-classifier/rubric/"
type: task
status: backlog
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-111
created: 2026-04-17
updated: 2026-04-17
---

# KAN-111 — [Mona] Migrate rubric from Drive → padi-app-starter/services/readiness-classifier/rubric/

## Description

## Why

The rubric spreadsheet lives in Drive while it's being authored (Mona drafts + Mama/Neal review). Once the 328 modules are filled and QA'd, the rubric becomes content that the classifier consumes at runtime — so it needs to live in the app repo next to the prompt that uses it.

Architectural decision: keep the readiness classifier inside `padi-app-starter` under `/services/readiness-classifier/` for now. Extract to a separate repo only when ML dependencies or release cadence justify it (not now — it's prompt-based, not a trained model).

## What

1. Write a one-shot export script (`scripts/export-rubric.ts` or similar) that reads `padi-readiness-rubric.xlsx` from Drive and emits structured JSON per tab:

    * `ch1-phon-awareness.json` (137 module rows)
    * `ch2-alphabet.json` (44 rows)
    * `ch3-phonics.json` (14 rows)
    * `ch4-reading.json` (34 rows)
    * `ch5-handwriting.json` (21 rows)
    * `ch6-spelling.json` (36 rows)
    * `ch7-vcf.json` (18 rows)
    * `audio-signals.json`
    * `notes-keywords.json`
    * `edge-cases.json`
    
2. Land the folder structure in `padi-app-starter`:

    ```
    services/readiness-classifier/
      rubric/                  ← the JSON above
      prompts/
        classify.md            ← the Claude Sonnet prompt template (references rubric)
      src/
        classify.ts            ← audio+notes → features → prompt → bucket
      scripts/
        export-rubric.ts       ← Drive xlsx → JSON
      eval/                    ← regression cases for later
    ```
3. Open the PR against `padi-app-starter`. Include the export script, the generated JSON, and a README explaining how to re-export when the rubric is updated.
4. Update the KAN-60 classifier ticket to point at the in-repo rubric path instead of the Drive URL.

## Acceptance criteria

* \[ \] `services/readiness-classifier/` folder exists in `padi-app-starter` with the structure above
* \[ \] All 10 JSON files generated from the current Drive xlsx and committed
* \[ \] `export-rubric.ts` runs end-to-end locally — re-running it is idempotent and produces no diff against the committed JSON when the xlsx hasn't changed
* \[ \] Classifier prompt (`classify.md`) loads the JSON at runtime, not hardcoded
* \[ \] README explains: how to update the rubric (edit in Drive, re-run export, commit), when to extract to a microservice (deps grow, release cadence diverges)
* \[ \] KAN-60 updated to reference the in-repo rubric path
* \[ \] PR merged

## Dependencies

* Blocked by KAN-110 (rubric must be 100% filled + QA-clean before migration)
* Unblocks KAN-60 (classifier can consume versioned, committed rubric)

## Notes

* Do NOT move the Cowork plugins (`k-reading-specialist`, `mona-annotator`) into padi-app-starter. They're authoring tools, not product code. They stay in the user's Cowork plugin folder.
* After this migration, Drive remains the authoring surface for human edits; the repo JSON is regenerated from Drive on demand. Drive is the source of truth while Mama reviews; repo is the source of truth at runtime.

## Comments

_No comments in Jira at time of migration._
