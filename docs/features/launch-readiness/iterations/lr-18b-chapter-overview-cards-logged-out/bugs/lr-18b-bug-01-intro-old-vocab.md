---
id: LR-18b-BUG-01
title: "[LR-18b] Intro paragraph uses retired pre-LR-26 vocab instead of pinned three-signal copy"
type: bug
status: fixed
priority: P0
parent: LR-18b
uat: LR-18b-UAT
feature: launch-readiness
created: 2026-05-15
created_by: padi-uat-agent
---

### Summary

The `CURRICULUM_INTRO` constant in `lib/copy/curriculumOverview.ts` renders the pre-LR-26 three-outcome clinical vocabulary that the LR-18b spar (refinement #1) explicitly retired. The AC pinned an exact replacement string; the implementation shipped the old draft instead.

### Repro

1. Open `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/lib/copy/curriculumOverview.ts`.
2. Read line 15–16.
3. Compare to the AC body of refined-ticket §3 / acceptance-criteria §"Happy path — logged-out browser".

### Expected (verbatim, from AC)

> "~140 lessons (Individual, 1:1) or ~180 lessons (Group, classroom) across a 9-month program. Three phases, three signals — Accelerating, Practicing, or Specialist Track. Padi shows you which, every lesson."

### Actual (current source, lib/copy/curriculumOverview.ts:16)

> "~140 lessons (Individual, 1:1) or ~180 lessons (classroom Group) across a 9-month program. Three phases, three outcomes: ready for first grade, needs more support, or needs targeted intervention."

### Diffs

1. Track label order: AC says "(Group, classroom)"; implementation says "(classroom Group)".
2. Three-signal vocab: AC says "three signals — Accelerating, Practicing, or Specialist Track"; implementation says "three outcomes: ready for first grade, needs more support, or needs targeted intervention".
3. Trailing sentence: AC includes "Padi shows you which, every lesson."; implementation omits it entirely.

### Why this matters

This is the first sentence a logged-out visitor reads about the program shape. The pre-LR-26 vocab was retired across the rest of the app (about, grouping, three-signal-vocab-migration) precisely because it leads with deficit framing ("needs more support", "needs targeted intervention"). LR-18b's whole spar refinement #1 was to prevent this regression in the new logged-out browser. The implementer pulled the wrong string from LR-18 §Authored copy (which has the un-refined draft) instead of from the refined ticket's AC.

### Fix

Replace `CURRICULUM_INTRO` (lib/copy/curriculumOverview.ts:15–16) with:

```ts
export const CURRICULUM_INTRO =
  "~140 lessons (Individual, 1:1) or ~180 lessons (Group, classroom) across a 9-month program. Three phases, three signals — Accelerating, Practicing, or Specialist Track. Padi shows you which, every lesson.";
```

Mind the em-dash (`—`) before "Accelerating" — not a hyphen, not an en-dash.

### Severity

P0 — launch-blocker copy that the spar explicitly retired re-appearing in a new build is a process failure as well as a copy failure. Ship-blocker for LR-18b.

## Fix Notes

**Root cause:** The implementer sourced `CURRICULUM_INTRO` from the LR-18 §Authored-copy draft, which still carried the pre-LR-26 three-outcome vocabulary ("ready for first grade, needs more support, or needs targeted intervention") and an inverted track label ("classroom Group"). The LR-18b spar refinement #1 pinned a verbatim replacement in the refined ticket's AC, but the build pulled from the source spec rather than the refined AC. The trailing tagline "Padi shows you which, every lesson." was also dropped on the floor.

**Files changed:** `lib/copy/curriculumOverview.ts` (lines 15–16).

**Why this fix is correct:** The new string is byte-for-byte the AC-pinned copy: track label order matches ("Group, classroom"), the three-signal vocabulary replaces the retired deficit-framed outcomes ("Accelerating, Practicing, or Specialist Track"), the em-dash (`—`, U+2014) sits before "Accelerating", and the closing tagline is restored. This aligns the logged-out curriculum intro with the three-signal vocabulary that LR-26 propagated across the rest of the app, preventing the deficit-framing regression the spar refinement #1 existed to prevent.
