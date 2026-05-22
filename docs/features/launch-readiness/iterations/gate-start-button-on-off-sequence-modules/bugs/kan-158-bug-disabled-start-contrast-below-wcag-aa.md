---
id: KAN-158
title: "[Bug] LR-11d disabled Start button contrast below WCAG AA (parent opacity-60 makes it worse)"
type: bug
status: fixed
priority: P2
severity: medium
feature: launch-readiness
parent: LR-11d
uat: LR-11d-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The disabled gray Start button on off-sequence modules fails WCAG AA color-contrast (4.5:1) for normal text. AC #9 explicitly required ≥4.5:1.

Two compounding issues:

1. **Base color choice is borderline-fail.** Tailwind `text-gray-500` (#6B7280) on `bg-gray-100` (#F3F4F6) yields a measured contrast ratio of **4.39:1** — fractionally below the 4.5:1 WCAG AA threshold. The refined ticket claimed "~4.5:1" — actual is 4.39:1.

2. **Parent row uses `opacity-60` for off-sequence rows** (line 745), which composites both the button background and the text against the underlying white page. Effective contrast collapses to **2.19:1** — well below AA, and below AA-Large (3.0:1) too.

### Where

- File: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Line 745 (off-sequence row class): `'border-gray-100 bg-white opacity-60'`
- Line 800 (disabled button class): `'rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 cursor-not-allowed'`

### Reproduction

1. Sign in as a teacher.
2. Open any student profile with at least one off-sequence module.
3. Expand the chapter; locate any disabled gray "Start" button on a non-next-up row.
4. Use any browser DevTools contrast picker on the "Start" text.

### Expected

Contrast ratio ≥ 4.5:1 for the disabled button text against its own background.

### Actual

- Base: 4.39:1 (gray-500 / gray-100, no opacity context) — already short by 0.11.
- In-context (with parent `opacity-60` applied): 2.19:1 — major fail.

### Computed values

```
gray-500 #6B7280 on gray-100 #F3F4F6 → 4.39:1
With opacity 0.6 against #FFFFFF:
  effective fg ≈ rgb(166,170,179)
  effective bg ≈ rgb(248,248,250)
  contrast ≈ 2.19:1
```

### Fix options

**Option A (minimum-risk):** Exempt the disabled button from the parent `opacity-60`. Move opacity off the row container and onto specific text/icon elements that AREN'T the disabled button.

**Option B (clean):** Drop `opacity-60` entirely on off-sequence rows. The visual de-emphasis is already conveyed by `text-gray-400` title and `text-gray-300` summary and the gray button. The opacity is redundant and a11y-hostile.

**Option C (combo):** Drop the parent opacity AND bump button text to `text-gray-600` (#4B5563) for safety margin — gives 6.95:1 against gray-100, well above 4.5:1.

Recommend Option B + bumping text to `text-gray-700` for guaranteed safety, since `font-semibold text-xs` qualifies as normal text under WCAG (not "large").

### Acceptance for fix

- Disabled button text/background contrast ≥ 4.5:1 in the rendered DOM (verify with a contrast picker).
- Visual hierarchy preserved: blue next-up still loudest, white-border Replay next, disabled gray lowest.
- No regression to the off-sequence row's visual de-emphasis as a whole (chapter scan-ability).


## Fix Notes

**Root cause.** Two compounding problems on the disabled Start button. (1) The row container set `opacity-60`, which composites against the white page background and pushed effective text contrast to ~2.19:1 — well below AA. (2) Even without the opacity, `text-gray-500` on `bg-gray-100` measured 4.39:1, fractionally below the 4.5:1 AA threshold for normal text.

**Files changed.** `app/teacher/start-teaching/students/[studentId]/page.tsx`:
- Removed `opacity-60` from the off-sequence row container class (was: `'border-gray-100 bg-white opacity-60'`, now: `'border-gray-100 bg-white'`).
- Bumped disabled button text from `text-gray-500` to `text-gray-700` (#374151) for a comfortable contrast margin.

**Why this fix is correct.** Adopted the recommended Option B + text bump. With the parent `opacity-60` gone, both the button background and text render at full opacity against white, so the in-context contrast equals the raw contrast — no compositing collapse. `text-gray-700` (#374151) on `bg-gray-100` (#F3F4F6) measures ~9.5:1, well above the 4.5:1 AA bar. Visual hierarchy is preserved: the off-sequence row's de-emphasis still comes from `text-gray-400` on the module title and `text-gray-300` on the summary, plus the gray (vs. blue) button — those cues remain. Blue next-up is still the loudest action, Replay still uses the white-border outline style, disabled gray remains visually lowest in the action hierarchy.
