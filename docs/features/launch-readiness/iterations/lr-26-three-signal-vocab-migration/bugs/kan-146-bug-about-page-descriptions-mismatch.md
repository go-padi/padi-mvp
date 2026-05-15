---
id: KAN-146
title: "[Bug] About-page outcome descriptions do not match LR-26 AC — Specialist Track still clinical"
type: bug
status: fixed
severity: P1
feature: launch-readiness
parent: LR-26
uat: LR-26-UAT
created: 2026-05-15
created_by: padi-uat-agent
---

### Summary

The `/teacher/about` page outcomes section renders descriptions that do
not match the EXACT strings pinned in LR-26 §Happy About page AC. The
Specialist Track description is still clinical/deficit framing — the
exact failure mode the LR-26 "Refined from spar" section called out
as worse than today.

### Steps to reproduce

1. Start dev server: `pnpm dev -- --port 3000`.
2. Open `http://localhost:3000/teacher/about` in any viewport.
3. Scroll to the outcomes section (three cards: Accelerating,
   Practicing, Specialist Track).
4. Compare each card's description against LR-26 AC.

### Expected (LR-26 §Happy About page)

The three outcomes render with these EXACT descriptions:

- **Accelerating** — "On track to read sooner — has mastered all core skills" (green tone)
- **Practicing** — "Locking in foundational skills — building confidence with practice" (amber tone)
- **Specialist Track** — "Recommended for closer review with a reading specialist" (red tone)

### Actual

Source `app/teacher/about/page.tsx` lines 65–81, confirmed in
rendered HTML at
`docs/features/launch-readiness/iterations/lr-26-three-signal-vocab-migration/bugs/about-page-evidence.html`:

- **Accelerating** — "On track for first grade — has mastered all core skills" (FAIL — "for first grade" instead of "to read sooner")
- **Practicing** — "Requires targeted support in specific areas before progressing" (FAIL — entirely different sentence; deficit framing "Requires targeted support")
- **Specialist Track** — "Requires serious, immediate specialist support" (FAIL — exactly the clinical phrasing the spar called out as a "half job")

### Why this is P1

LR-26 §Refined from spar item 1 explicitly flags this exact bug as
the reason the descriptions needed rewriting:

> "the original draft only updated the `label` field. Half-job:
> leaving 'Specialist Track: Requires serious, immediate specialist
> support' is worse than today because the label is affirmative but
> the prose is still clinical. All three descriptions now pinned in
> AC."

The implementer pinned only the labels, not the descriptions — exactly
the half-job the spar refinement said NOT to do. Since LR-26 is a
launch blocker and About is parent-facing prose, this is P1.

### Suggested fix

Edit `app/teacher/about/page.tsx` lines 65–81, replacing the three
`description` strings with the EXACT strings from LR-26 §Happy About
page AC. No other change required (labels are already correct, tone
colors are correct, order is correct).

### Evidence

- `docs/features/launch-readiness/iterations/lr-26-three-signal-vocab-migration/bugs/about-page-evidence.html` — full rendered HTML.
- Source file: `app/teacher/about/page.tsx:65-81`.

## Fix Notes

**Root cause:** The initial LR-26 implementation updated the three outcome `label` fields in `app/teacher/about/page.tsx` to the new three-signal vocabulary (Accelerating / Practicing / Specialist Track) but left the original deficit-framed `description` strings in place. This is exactly the "half-job" the LR-26 §Refined from spar item 1 warned against — an affirmative label paired with clinical prose is worse than the prior copy because the mismatch undermines parent trust.

**Files changed:**
- `app/teacher/about/page.tsx` lines 65–81 — replaced the three `description` strings with the EXACT strings pinned in LR-26 §Happy About page AC.

**Why this fix is correct:** The three outcome `description` strings now match the AC verbatim:
- Accelerating: "On track to read sooner — has mastered all core skills"
- Practicing: "Locking in foundational skills — building confidence with practice"
- Specialist Track: "Recommended for closer review with a reading specialist"

No other fields were touched — labels, tone colors, and order were already correct per the bug report's "Suggested fix" guidance, so the diff is surgical and stays inside the bug's scope.
