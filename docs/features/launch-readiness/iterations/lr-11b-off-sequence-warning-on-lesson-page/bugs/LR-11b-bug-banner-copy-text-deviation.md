---
id: LR-11b-BUG-02
title: Off-sequence banner copy deviates from refined-ticket template
type: bug
status: open
priority: P3
feature: launch-readiness
parent: LR-11b
uat: LR-11b-UAT
file: app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx
created: 2026-05-17
created_by: padi-uat-agent
severity: P3
---

### Summary

The off-sequence banner body copy does not match the refined-ticket template
(feature-refined.md lines 60-65), and also does not match the prompt-canonical
text spec for this UAT.

Refined ticket template:
> Per the curriculum, this is taught after **{prereqChapterTitle} — {prereqModuleTitle}**.

UAT prompt-canonical text spec:
> Text "Per the curriculum, this is taught after" with the prereq chapter + module names rendered

Shipped implementation (page.tsx lines 639-645):
> Heads up: this lesson typically comes after **{prereqChapterTitle}** → **{prereqModuleTitle}**. You can continue, or start with the prereq first.

### Why this matters

The wording in the shipped banner ("Heads up: ... typically comes after") leans casual/blog-voice
and uses `→` as the chapter-to-module separator. The ticket's pinned copy ("Per the curriculum,
this is taught after ... — ...") is more declarative, gives the curriculum (not the system) the
authority, and uses an em-dash for the separator — matching the rest of the curriculum-navigation
voice in the app (see student-context banner at lines 602-635 which uses similar tone-neutral
declarative copy).

This is also a discoverability concern: the trailing sentence "You can continue, or start with
the prereq first" duplicates what the two action affordances already say. Removing it (per the
ticket template) keeps the banner tight.

### Evidence

`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` lines 639-645:

```tsx
<p className="text-sm text-amber-900">
  Heads up: this lesson typically comes after{' '}
  <span className="font-semibold">{offSequenceWarning.prereqChapterTitle}</span>
  {' → '}
  <span className="font-semibold">{offSequenceWarning.prereqModuleTitle}</span>.
  You can continue, or start with the prereq first.
</p>
```

Refined-ticket template (feature-refined.md lines 60-65):

```tsx
<p>
  Per the curriculum, this is taught after{' '}
  <strong>{offSequenceWarning.prereqChapterTitle} — {offSequenceWarning.prereqModuleTitle}</strong>.
</p>
```

### Suggested fix

Replace the `<p>` block with the refined-ticket template wording, separator (`—`),
and drop the trailing "You can continue..." sentence (the action buttons already
communicate this).

### Severity rationale

P3 (cosmetic / spec-drift) because the banner still functions correctly:
detection logic works, dismissal works, the prereq link navigates correctly with
`?student=` preserved. This is purely a copy-fidelity issue.
