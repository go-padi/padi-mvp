---
id: LR-15
title: "[Marketing] Replace homepage placeholder copy with go-padi.com source-of-truth"
type: task
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: founder-direction-2026-05-10
supersedes_part_of: LR-01
---

### Goal

The placeholder marketing copy I wrote during LR-01 ("Structured,
multisensory reading lessons for K-2 readers (ages 5-7), built on
the ASDEC Kickstart curriculum.") is not Padi's actual marketing
language. Replace it with the canonical copy that lives at
https://go-padi.com/ so the app's homepage matches the marketing
site visitors arrived from.

### Background

LR-01 fixed two false claims (ages 3-4 and AI claims) using a
placeholder description sourced from the curriculum + brief. That
copy is technically accurate but **not the brand voice.** The real
marketing site at https://go-padi.com/ is the canonical source
for how Padi describes itself. Visitors flowing from the marketing
site to the app should see consistent language, not a different
descriptor written ad-hoc.

### Requirements

1. **Source the copy from https://go-padi.com/.** Capture the:
   - Hero headline
   - Hero subtitle / value proposition
   - Eyebrow chip text (currently "📚 Structured Multisensory Reading")
   - Feature card titles + bullets (if the marketing site has them)
   - Any tagline or callout used near the primary CTA
2. **Replace the matching strings in `app/page.tsx`** with the
   go-padi.com versions. Don't rewrite — copy the exact phrasing.
3. **Verify the rest of the app uses brand-consistent language.**
   Spot-check `/teacher/about`, `/welcome/role`, and `lib/copy/roleCopy.ts`
   against go-padi.com voice. Flag any mismatches as follow-up
   tickets (don't fix everything in this one — scope is the
   homepage).
4. **Preserve the layout.** This is a copy-only change; don't
   reshape the hero, feature cards, or buttons.
5. **Keep the LR-01 fixes intact:** no AI claims, no wrong age
   range. If go-padi.com mentions AI or different ages, surface
   to the founder for resolution before committing — the marketing
   site might also need updating.

### Acceptance Criteria

**Happy Path**
Given a visitor lands on `/` (the app homepage)
When the hero renders
Then the headline, subtitle, and eyebrow chip match the canonical
copy at https://go-padi.com/
And no placeholder phrasing remains (specifically the
"Structured, multisensory reading lessons for K-2 readers (ages 5-7),
built on the ASDEC Kickstart curriculum." line)

**Visitor crossover test**
Given a visitor reads the marketing site at go-padi.com/ and
clicks through to the app
When the app homepage renders
Then the language feels continuous — same voice, same value
proposition, same vocabulary

**Auth state / mobile**
Same as LR-01. Copy must fit at 375×667 without layout break.

### Out of Scope

- Updating go-padi.com itself (separate marketing-site work).
- Rewriting in-app copy outside the homepage (separate
  brand-voice-pass ticket if needed).
- Building a content management surface for marketing copy.
- A/B testing copy variants.

### Notes

- File to edit: `app/page.tsx`
- Reference: https://go-padi.com/
- If go-padi.com is itself outdated, this ticket pauses with a
  question to the founder rather than guessing.
- ~30 minutes once the canonical copy is captured.
