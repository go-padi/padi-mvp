---
id: LR-10
title: "[UX] Allow re-entry to completed lessons (Montessori repetition principle)"
type: story
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
updated: 2026-05-11
created_by: walkthrough-audit-2026-05-10
source_walkthroughs:
  - docs/walkthroughs/walkthrough-2026-05-10-teacher.md
  - docs/walkthroughs/walkthrough-2026-05-11-parent.md (confirmed in parent flow — same broken state)
instructional_review: passed — curriculum requires repetition for automaticity
---

### Goal

Let teachers re-open completed lessons. Today, marking a lesson
complete locks it; the teacher can't go back in. This contradicts
the curriculum's mastery-via-repetition principle.

### Background

From the walkthrough: *"Sounds game is completed, but now I can't
click back into it, which I probably should be able to."*

This is **instructionally backwards.** The curriculum's
diagnostic-teaching principle (`ind.pdf`, Introduction):

> *"The content presented must be mastered step by step to the
> degree of automaticity."*

Automaticity is built through repetition. The Sound Out module
(S-3) is meant to be repeated until the child sound-spells reliably.
The Spelling Exercises (SE-1 through SE-9) are explicitly graduated
across re-doings of similar work with accumulated sounds.

Locking a lesson after one completion treats "complete" as a
one-shot event when the curriculum treats it as the start of
mastery. A teacher needs to be able to:
- Re-open a completed lesson to do it again with the same student
- Re-open to review what was noted last time before today's repeat
- Re-open to do it with a different student who hasn't done it yet

### Requirements

1. **Remove the lock on completed lessons.** From the lesson page,
   the lesson should remain accessible regardless of completion
   status.
2. **Show completion state, don't enforce it.** Visual indicator
   that the lesson has been completed (date, count of completions,
   teacher's last notes) — not a hard gate.
3. **Multiple completions are valid.** Each time the teacher
   marks complete, append a new `lesson_completion` row (or
   equivalent) rather than overwriting. This preserves history.
4. **Surface "Last completed: <date>"** prominently on the lesson
   page when the student has completed it before. Helps the
   teacher decide: "did we do this last week or six months ago?"
5. **The "Mark lesson complete" button copy** should not imply
   finality. Suggest: *"Save & Mark Complete"* (already used in
   places per KAN-114) — the rename here is to drop any "Done
   forever" connotation.
6. **Roster / progress views should count distinct modules
   completed, not completions in total.** So Maggie completing
   SE-1 three times still counts as "1 module" for the curriculum
   progress denominator. (LR-09 may already handle this.)

### Acceptance Criteria

**Happy Path**
Given a student has completed a lesson previously
When the teacher navigates to that lesson
Then the lesson page renders normally (no lock, no redirect)
And shows completion history (e.g. "Completed 2 times. Last:
2026-05-09. Notes: Sound-spelled /b/ for /d/.")
And the teacher can mark complete again

**Multiple completions**
Given a student has completed the same lesson three times
When the teacher views the student's progress
Then the lesson appears in their history with three completion
entries
And the curriculum progress denominator counts the lesson as one
distinct module mastered (not three)

**Re-entry from another teacher**
Given a co-teacher (in a school setting; v1.1+ scope, so optional)
opens a lesson the lead teacher already completed
When they view the lesson
Then they see the prior completions but can do their own
session — not blocked

**Empty state**
Given a lesson never been completed
When the teacher opens it
Then the page is the same as before (no "Last completed" info,
just the lesson)

**Auth state / mobile**
Standard.

### Out of Scope

- Comparing notes across completions (a "lesson history" view) —
  separate ticket if needed. This one just unblocks re-entry.
- Auto-suggesting which lesson to repeat based on recency or
  difficulty — separate ticket / part of LR-11.
- Rolling-up completions across students into teacher-side
  analytics — separate ticket.

### Notes

- File likely involved: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- Database: check the `lesson_completions` table — does it allow
  multiple rows per (student_id, module_id), or is there a unique
  constraint? If unique, drop the constraint.
- Visual treatment for completion history should be subtle, not
  scary. Just a one-liner near the lesson title.
- Should ship in <1 day including the schema check.
