---
id: LR-12
title: "[Copy] Disambiguate 'Continue Teaching' — currently means three different things"
type: task
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: walkthrough-audit-2026-05-10
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-10-teacher.md
---

### Goal

Resolve the "Continue Teaching" naming ambiguity. The phrase appears
on multiple surfaces with different meanings, and the teacher in the
walkthrough was confused by it.

### Background

From the walkthrough: *"It's also kind of confusing, like, what I'm
supposed to do. So I can, like, go to Phonological Awareness and I
can go to Alphabet and I can start here. Continue teaching. Looks
like I might have been teaching already here. Yeah, like, why does
it say continue teaching?"*

"Continue Teaching" today shows up in at least three places with at
least three meanings:

1. **TopNav button** — primary CTA that goes to `/teacher`.
   Effective meaning: "go to the start-teaching home." Not really
   "continue" anything; same button whether you've taught before
   or not.
2. **On a student's profile** — meaning: *"open the next module for
   this student."* This is the most useful sense.
3. **Inside a section/module list** — meaning: *"resume the
   in-progress module"* (when one exists). Different again.
4. **Continue Later** (different button, related family) — saves
   in-progress notes without marking complete. Adjacent UX.

When the same words mean different things in three places, teachers
guess. Some guesses are wrong (the walkthrough showed exactly that
guess-failure).

### Requirements

1. **Audit every place "Continue Teaching" or similar copy
   appears.** Grep for "Continue", "Start Teaching", "Continue
   Later" in `app/`, `components/`, `lib/copy/`. Build a small
   table mapping each call site to its current meaning.
2. **Pick one canonical phrase per meaning:**
   - For "go to the start-teaching home" (TopNav): *"Start
     Teaching"* (drop "Continue" entirely from this CTA — it
     doesn't fit).
   - For "open the next prescribed module for this student" (LR-11
     primary CTA): *"Continue with [Section] — [Module name]"* —
     specific, names the module.
   - For "resume an in-progress module" (when a draft exists):
     *"Resume in-progress: [Module name]"*
   - For "save my notes and exit without completing": *"Save &
     Continue Later"* (this is already used per KAN-114).
3. **Update each call site** to its canonical phrase. Pull the
   strings into `lib/copy/roleCopy.ts` (or a new
   `lib/copy/teachingActions.ts` if `roleCopy.ts` is already too
   broad).
4. **Verify no copy collisions.** After the rename, search again
   for the phrase "Continue" with "Teaching" — if any old
   instances remain, fix.

### Acceptance Criteria

**Happy Path (no in-progress module)**
Given a teacher views a student profile with no in-progress lesson
When the page renders
Then the primary CTA reads *"Continue with [Section] — [Module]"*
And no button anywhere on the page reads *"Continue Teaching"*
ambiguously

**Happy Path (in-progress module)**
Given a teacher previously hit "Save & Continue Later" on a module
When they next view the student profile
Then a banner or secondary CTA reads *"Resume in-progress: [Module]"*
And the primary CTA still points at the next-prescribed module per
LR-11 (which may or may not be the same one)

**TopNav**
Given any visitor (logged in or out) views any page
When they look at the top nav
Then the primary teaching button reads *"Start Teaching"* (not
"Continue Teaching")

**Mobile**
The new strings must fit at 375×667. The "[Section] — [Module]"
form may overflow; provide a truncated mobile variant.

### Out of Scope

- Reorganizing the UI elements themselves (this is a copy ticket
  primarily — don't move things, just rename them)
- Adding a "what would you like to do?" disambiguation UI when
  multiple actions are valid. Just pick the right primary action
  per the rules above.

### Notes

- Coordinate with LR-11 (which defines the "Continue with [Section]
  — [Module]" primary CTA shape).
- Files likely involved:
  - `components/TopNav.tsx`
  - `app/teacher/start-teaching/students/[studentId]/page.tsx`
  - `app/teacher/curriculum/[chapter]/[group]/page.tsx`
  - `lib/copy/roleCopy.ts`
- Should ship in <half a day. Mostly grepping, renaming, and
  consolidating into `roleCopy.ts`.
