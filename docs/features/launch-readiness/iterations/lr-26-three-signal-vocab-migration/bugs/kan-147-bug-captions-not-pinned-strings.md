---
id: KAN-147
title: "[Bug] assessmentStatusCopy CAPTIONS / SHORT_CAPTIONS do not match LR-26 §Requirements 1 pinned strings"
type: bug
status: fixed
severity: P2
feature: launch-readiness
parent: LR-26
uat: LR-26-UAT
created: 2026-05-15
created_by: padi-uat-agent
---

### Summary

`lib/copy/assessmentStatusCopy.ts` exports `CAPTIONS` (long) and
`SHORT_CAPTIONS` (short) maps that are rendered in the UI on
student-profile and curriculum-banner surfaces. The values do not match
the strings pinned in LR-26 §Goal and §Requirements 1.

### Steps to reproduce

1. Open `lib/copy/assessmentStatusCopy.ts` lines 42–60.
2. Compare against LR-26 §Goal vocabulary mapping table and
   §Requirements 1 bullets for CAPTIONS / SHORT_CAPTIONS.

### Expected (LR-26 §Goal + §Requirements 1)

Long captions (CAPTIONS):
- Accelerating → "On track to read sooner"
- Practicing → "Locking in foundational skills"
- Specialist Track → "Recommended for closer review"

Short captions (SHORT_CAPTIONS), per §Requirements 1:
> "short captions match the new long labels (e.g. `Accelerating`
> short caption = `Accelerating`)"

So:
- Accelerating → "Accelerating"
- Practicing → "Practicing"
- Specialist Track → "Specialist Track"

### Actual

`lib/copy/assessmentStatusCopy.ts`:

```ts
const CAPTIONS = {
  "Accelerating": "Reading skills are on track",
  "Practicing": "Targeted support recommended",
  "Specialist Track": "Hands-on time needed today",
  ...
};

const SHORT_CAPTIONS = {
  "Accelerating": "On track",
  "Practicing": "Targeted support",
  "Specialist Track": "Hands-on time today",
  ...
};
```

None of the three Accelerating/Practicing/Specialist Track entries
match the pinned strings in either map.

### Why this is P2 (not P1)

The LR-26 §Acceptance Criteria for student profile and lesson banner
only state the pill text must be one of the new five values — they do
not pin the caption text on the UI. The caption strings are pinned in
§Goal (informational mapping table) and §Requirements 1 (which is the
implementation contract, not the AC). So this is a contract drift, not
a user-visible AC failure on the pill itself, but it IS a load-bearing
deviation from the spec the implementer was given.

The SHORT_CAPTIONS deviation is particularly notable — "Hands-on time
today" is a different concept entirely from "Specialist Track" and
risks confusing the user-facing meaning of the badge caption.

### Suggested fix

Update `lib/copy/assessmentStatusCopy.ts`:

- CAPTIONS: replace each three-signal value to match §Goal long captions.
- SHORT_CAPTIONS: set each three-signal short caption to be the label
  itself (`Accelerating` / `Practicing` / `Specialist Track`) per
  §Requirements 1.

### Evidence

- Source file: `lib/copy/assessmentStatusCopy.ts:42-60`.

## Fix Notes

**Root cause:** The initial LR-26 implementation introduced the new three-signal `AssessmentStatus` type and `normalizeAssessmentStatus` coercion logic but seeded the `CAPTIONS` and `SHORT_CAPTIONS` maps with copy that drifted from the spec — leftover phrases like "Hands-on time today" survived from an earlier draft that predated the §Goal vocabulary mapping. The implementer did not cross-check the caption maps against the pinned §Requirements 1 strings before shipping.

**Files changed:**
- `lib/copy/assessmentStatusCopy.ts` lines 42–60 — updated the three three-signal entries in `CAPTIONS` to the §Goal long captions, and set the three three-signal entries in `SHORT_CAPTIONS` to be the labels themselves per §Requirements 1.

**Why this fix is correct:** The caption maps now match the pinned LR-26 strings exactly:
- `CAPTIONS`: Accelerating → "On track to read sooner", Practicing → "Locking in foundational skills", Specialist Track → "Recommended for closer review".
- `SHORT_CAPTIONS`: Accelerating → "Accelerating", Practicing → "Practicing", Specialist Track → "Specialist Track".

The two non-three-signal entries (`In progress`, `Not started`) were left untouched — they are outside the scope of this bug and §Requirements 1 only pins the three-signal values. The `AssessmentStatus` type, `THREE_SIGNAL_VALUES`, `LEGACY_COERCION`, and `normalizeAssessmentStatus` logic are unchanged, so the existing test suite for normalization remains valid.
