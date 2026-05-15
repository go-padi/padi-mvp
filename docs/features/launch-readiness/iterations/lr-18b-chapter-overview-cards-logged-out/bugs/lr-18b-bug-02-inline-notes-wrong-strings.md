---
id: LR-18b-BUG-02
title: "[LR-18b] All four inline italic notes (Alphabet/Phonics/Handwriting/VCF) ship the long-form authored-copy text instead of the spar-pinned short strings"
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

The four chapters without nested sections (Alphabet, Phonics, Handwriting, VCF) render long-form descriptive paragraphs from LR-18 §Authored copy as their `inlineNote` instead of the four short pinned strings called out in LR-18b spar refinement #4. The AC lists each string verbatim; none of the four match.

### Repro

1. Open `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/lib/copy/curriculumOverview.ts`.
2. Read the `inlineNote` field on the Alphabet (line 61–62), Phonics (line 69–70), Handwriting (line 91–92), and VCF (line 113–114) chapter entries.
3. Compare each to the AC §"Solo-estimate chapters".

### Expected vs Actual

| Chapter | AC (pinned) | Implementation (curriculumOverview.ts) |
|---|---|---|
| Alphabet | `Roughly 20 lessons in this chapter.` | `this chapter is structured as a single set of ~20 letter-recognition lessons, not nested sub-sections — explore to see all activities` |
| Phonics | `Roughly 30–40 lessons in this chapter.` | `structured as a sequence of sound introductions, keyword cards, and three-period review lessons — roughly 30–40 lessons total` |
| Handwriting | `Roughly 25–30 lessons in this chapter.` | `structured as a sequence of handwriting exercises, roughly 25–30 lessons` |
| VCF | `Roughly 15–25 lessons in this chapter.` | `structured as a sequence of vocabulary, comprehension, and fluency activities — roughly 15–25 lessons` |

Zero of the four match.

### Why this matters

Spar refinement #4 pinned these strings precisely because the four solo-estimate cards need visual rhythm parallel to each other and to the `<details>`-bearing cards. The long-form text the implementer used reads as breadcrumb from the source spec, not as deliberate UI copy. It also lower-cases the verbatim short-form pattern that the spar settled on.

The implementer appears to have copied the bracketed italic notes from LR-18 §Authored copy (lines 195–197, 207–209, 231–232, 255–256) — those are notes on the chapter structure, not the UI inline italic strings. The refined LR-18b ticket and the eng-brief both list the four short strings explicitly under the "Solo-estimate chapters" AC.

### Fix

Replace the four `inlineNote` fields in `lib/copy/curriculumOverview.ts`:

```ts
// Alphabet (line 62)
inlineNote: "Roughly 20 lessons in this chapter.",

// Phonics (line 70)
inlineNote: "Roughly 30–40 lessons in this chapter.",

// Handwriting (line 92)
inlineNote: "Roughly 25–30 lessons in this chapter.",

// VCF (line 114)
inlineNote: "Roughly 15–25 lessons in this chapter.",
```

Mind the en-dash (`–`) in the ranges — not a hyphen.

### Severity

P0 — four AC strings, all four wrong. Ship-blocker for LR-18b.

## Fix Notes

**Root cause:** The implementer pulled the four solo-estimate `inlineNote` strings from LR-18 §Authored copy's bracketed structural notes (descriptions of how the chapter is *structured*) instead of from the LR-18b refined ticket's AC §"Solo-estimate chapters", which pinned four short uniform strings ("Roughly N lessons in this chapter.") so the four solo-estimate cards keep visual rhythm with one another and parallel the `<details>`-bearing cards. The long-form descriptions broke that rhythm and reintroduced source-spec breadcrumb as UI copy.

**Files changed:** `lib/copy/curriculumOverview.ts` (Alphabet line 61–62, Phonics line 69–70, Handwriting line 91–92, VCF line 113–114 in the pre-fix file).

**Why this fix is correct:** Each of the four `inlineNote` values is now the AC-pinned short string verbatim, including the en-dashes (`–`, U+2013) in the numeric ranges (30–40, 25–30, 15–25). The four strings share the same "Roughly N lessons in this chapter." pattern, restoring the parallel visual rhythm spar refinement #4 was written to enforce. No other fields on these chapter entries were touched, and the chapters with nested `sections` are unaffected.
