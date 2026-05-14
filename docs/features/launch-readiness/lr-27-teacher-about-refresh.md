---
id: LR-27
title: "[Copy] /teacher/about refresh — match updated go-padi.com (Why Padi + Mona story + new 3-signal vocab)"
type: task
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-13
created_by: founder-direction-2026-05-13
related: LR-25, LR-26
---

### Goal

`/teacher/about` describes the Padi method to logged-in users
considering "is this for me." The updated go-padi.com adds a clearer
"Why Padi" positioning paragraph + a credibility section featuring
Mona Iyer by name. Align `/teacher/about` to match.

### Background

Today `app/teacher/about/page.tsx` explains the Padi method but uses
the OLD 3-signal vocab and lacks the new positioning paragraph that
landed on go-padi.com 2026-05-13.

The page is a credibility surface — visitors who clicked "About"
are evaluating whether to trust Padi enough to use it. Strong
positioning + a real human (Mona) builds that trust.

### Requirements

Adapt `app/teacher/about/page.tsx` to mirror the relevant sections
of go-padi.com:

1. **Update the "Why Padi" positioning paragraph** at the top of the
   about page:

   > Most reading programs teach every child the same way. Kids
   > ready to fly get held back. Kids who need more time get rushed.
   > By kindergarten, the differences add up. Padi gives every child
   > the right pace — and gives teachers a clear view of where each
   > one is, in real time.

2. **Update the 3-signal explanation block** to use the new vocab
   (depends on LR-26 establishing the canonical strings):
   - 🟢 **Accelerating** — On track to read sooner
   - 🟡 **Practicing** — Locking in foundational skills
   - 🔴 **Specialist Track** — Recommended for closer review
   - Tagline: *"A clear signal for every student, every lesson."*

3. **Add the "Built by a teacher, for teachers" Mona section**:

   > Padi was created by Mona Iyer, a reading specialist with over
   > 25 years of classroom experience and certifications including
   > AMS, CDT, and CALT. After decades of teaching, Mona built Padi
   > to give every early childhood teacher the tools to accelerate
   > every reader — and recognize early which kids deserve more
   > time, so they get it before kindergarten.

4. **Preserve role-aware copy** via `rolePhrase()`. Where the page
   currently switches teacher/parent flavoring, keep doing it.

5. **Update any in-page references to the OLD 3-signal vocab** that
   appear elsewhere on the about page. Search for "Needs Help" /
   "Needs Intervention" / "Ready" used as labels.

6. **Page metadata** (`<title>`, meta description) should reflect
   the updated framing — recommend mirroring go-padi.com:
   - `<title>`: `About Padi — Accelerate Reading for Ages 3–7`
   - meta description: matches go-padi.com's

### Acceptance Criteria

**Happy Path**
Given a visitor on `/teacher/about`
When the page renders
Then the "Why Padi" paragraph matches go-padi.com word-for-word
And the 3-signal block uses the new vocab (Accelerating / Practicing / Specialist Track)
And the Mona Iyer credibility section appears
And no OLD 3-signal strings remain in the page

**Role-aware**
Given a logged-in parent vs teacher
When they view the same page
Then `rolePhrase()` substitutes teacher-specific wording with
parent-friendly equivalents where applicable
And the core positioning and Mona story are unchanged (those are
universal)

**Mobile**
375×667 — Mona section + Why Padi paragraph render cleanly, no
horizontal scroll

### Out of Scope

- Restructuring the page layout (just refresh the copy)
- Adding photography (Mona's photo is a separate creative-asset ticket
  if desired)
- Adding a "team" page beyond Mona
- Translating to other languages
- Modifying the homepage (LR-25) or the 3-signal codebase (LR-26)

### Notes

- File to edit: `app/teacher/about/page.tsx`
- Depends on LR-26 (3-signal vocab migration) — the new strings need
  to exist in `lib/copy/assessmentStatusCopy.ts` before this page
  can reference them
- LR-25 + LR-26 + LR-27 form a copy-coherence cluster — ship them
  in the same BuildLoop run if possible so prod is internally
  consistent
- Mona's certifications: AMS (American Montessori Society), CDT
  (Certified Dyslexia Therapist), CALT (Certified Academic Language
  Therapist) — use abbreviations as go-padi.com does
- Complexity: S (single-file copy edit + a few `rolePhrase()` calls)
