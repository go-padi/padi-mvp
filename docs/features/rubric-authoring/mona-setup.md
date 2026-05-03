---
id: KAN-97
title: "[Mona] Setup — install plugins + single-row sanity check"
type: task
status: done
priority: medium
feature: rubric-authoring
epic: KAN-96
jira_ref: https://go-padi.atlassian.net/browse/KAN-97
created: 2026-04-16
updated: 2026-04-17
---

# KAN-97 — [Mona] Setup — install plugins + single-row sanity check

## Description

## Why

Get Mona wired up so every downstream task can run `/mona-annotate`, `/mona-schema`, `/mona-qa`, and `/kr-module`.

## What

1. Double-click `~/Desktop/KReading/k-reading-specialist.plugin` → accept install
2. Double-click `~/Desktop/KReading/mona-annotator.plugin` → accept install
3. In a Cowork session, run `/kr-module LS-1 Group` → confirm module-profile renders
4. Run `/mona-annotate LS-1 Group` on a single row → confirm Mona produces: markdown table + CSV code block + writes `mona-ch1-ls-group.csv` to `~/Desktop/KReading/mona/`
5. Eyeball the row: does Ready/Intervention/SIS read like mom would write? If it's way off, that's a style-guide tuning task before scaling.

## Acceptance criteria

* \[ \] Both plugins installed and visible in Cowork
* \[ \] `/kr-module LS-1 Group` returns a structured module profile
* \[ \] `/mona-annotate LS-1 Group` produces CSV + markdown artifact in `~/Desktop/KReading/mona/`
* \[ \] `~/Desktop/KReading/mona/overrides.md` created (even empty) as the running feedback file
* \[ \] No plugin errors in the session log

## Comments

### Nisha Iyer — 2026-04-17

## Sanity-check pass ✅

All five ACs met.

**Plugins.** `k-reading-specialist` and `mona-annotator` both visible in Cowork skill list. No install errors.

`/kr-module LS-1 Group`. Rendered structured module profile — chapter/section, what-it-teaches, activity, Ready thresholds, stumbling blocks, Group-vs-Individual note, related modules. Clean.

`/mona-annotate LS-1 Group`. Produced markdown review table + CSV + Completion Tracker delta. Files written to `~/Desktop/KReading/mona/`:

- `mona-ch1-ls-group.csv`
- `mona-ch1-ls-group.md`
- `overrides.md` (running feedback file, empty)

**Row quality (first eyeball):** Ready/Intervention/SIS all pass the Mona test — every bullet is audible/visible, countable or modality-named. Confidence Weight = 2 correctly flags attention-dependence (per style-guide worked example). Row includes 🔒 high-stakes marker (peer contagion) and ❓ specialist review marker on the 2-minute threshold.

**Open item for Mama/Neal to confirm before KAN-101 scales up:**

- 2-minute silence cycle — is this the right duration for reception-age kids, or should it be 90s?

No style-guide tuning needed before scaling. Moving to global tabs (KAN-98 Audio Signals next).
