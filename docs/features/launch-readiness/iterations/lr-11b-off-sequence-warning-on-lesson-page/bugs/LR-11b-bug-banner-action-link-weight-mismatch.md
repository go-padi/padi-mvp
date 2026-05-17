---
id: LR-11b-BUG-01
title: Off-sequence banner action links are not visually equal weight
type: bug
status: open
priority: P2
feature: launch-readiness
parent: LR-11b
uat: LR-11b-UAT
file: app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx
created: 2026-05-17
created_by: padi-uat-agent
severity: P2
---

### Summary

The off-sequence soft-warning banner renders its two action affordances ("Continue anyway" and "Go to {Prereq}") with **unequal visual weight**, violating refined-ticket refinement #1 which explicitly pinned: _"'Continue anyway' and 'Go to [Prereq]' links: visually equal weight (both `font-semibold underline` in amber)."_

In the shipped implementation, the **`<Link>`** has `underline` but the **`<button>`** does not. They are not visually equal weight — the button reads as a tertiary text action while the link reads as the primary action. This makes "Continue anyway" feel like the lesser-emphasis affordance, which inverts the soft-warning intent (the banner should give equal weight to both paths, not nudge the teacher toward leaving).

### Evidence

`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` lines 647-659:

```tsx
<button
  type="button"
  onClick={() => setWarningDismissed(true)}
  className="text-sm font-semibold text-amber-800 hover:text-amber-900"   // ❌ no underline
>
  Continue anyway
</button>
<Link
  href={offSequenceWarning.prereqHref}
  className="text-sm font-semibold text-amber-800 hover:text-amber-900 underline"   // ✅ has underline
>
  Go to {offSequenceWarning.prereqModuleTitle} &rarr;
</Link>
```

### Steps to reproduce

1. Sign in as a teacher with a student who has 0 completed modules.
2. Navigate to a module that is NOT the first module in curriculum display_order
   (e.g., `/teacher/curriculum/phonological-awareness/<g>/<m>` for any non-first module),
   passing `?student=<studentId>`.
3. Observe the amber off-sequence banner.
4. Compare "Continue anyway" (no underline, plain text) vs "Go to {Prereq}" (underlined).

### Expected

Both action affordances render with `font-semibold` AND `underline` in amber, per refined-ticket refinement #1.

### Actual

"Continue anyway" is `font-semibold` only (no underline). "Go to {Prereq}" is `font-semibold underline`. The visual weight is unequal.

### Suggested fix

Add `underline` to the button's className:

```tsx
className="text-sm font-semibold text-amber-800 hover:text-amber-900 underline"
```

### Out of scope

- Re-wording the banner copy (tracked separately in LR-11b-bug-banner-copy-text-deviation).
