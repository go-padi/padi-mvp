---
id: LR-10-bug-01
title: "[Bug] Lesson re-entry hides prior completion state — no history, wrong title, wrong status banner"
type: bug
status: open
priority: highest
feature: launch-readiness
parent: LR-10
launch_blocker: true
created: 2026-05-22
created_by: live-app-verification-2026-05-22
verified_on: padi-mvp.vercel.app, signed in as nriyer25@gmail.com, student Olivia Iyer (id 8157759e-2abe-474c-a8b4-afcaec5700c2), module learning-sensorially-1 (The Silence Game)
handling: cc
---

### Summary

The Replay button on the student profile navigates correctly to the
completed lesson, but the lesson page itself behaves as if it has
never been touched. The teacher has no visible signal that she's
re-entered a completed lesson, which is why this feature feels broken
even though the underlying nav works.

LR-10's navigation half is shipped. LR-10's "show that this lesson
has been done before" half is not.

### Reproduction (verified live 2026-05-22)

1. Sign in to padi-mvp.vercel.app
2. Navigate to a student who has completed modules (e.g. Olivia
   Iyer — has 3 of 328 complete)
3. Scroll to a completed module row (green checkmark) — see the
   "Replay" button on the right
4. Click Replay → lands on
   `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1?student=8157759e-2abe-474c-a8b4-afcaec5700c2`
5. Observe the page

### What's broken

1. **No "Completed N times. Last: <date>" header.**
   The code at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
   lines 707-712 renders this when `priorCompletions.count > 0`.
   In production, `priorCompletions.count === 0` for a student who
   clearly completed the module (`document.body.innerText.includes('Completed')`
   returns `false`).

2. **No "Prior observations" expandable section.**
   Code lines 714-734. Same root cause as #1.

3. **Lesson H2 title shows "Module learning-sensorially-1"** instead
   of "The Silence Game". The student-context banner correctly shows
   "The Silence Game", but the main H2 (line 738) is:
   `{moduleRow?.subtitle ? 'Module ${moduleRow.subtitle}' : moduleRow?.title || 'Module'}`
   — and `subtitle` is set to the module code, not a human-readable
   label. Looks like a debug string to the user.

4. **Student-context banner says "Not started — Start the first lesson"**
   even though the student is mid-curriculum. This is the global
   `assessment_status` field on the student row being null/unset and
   `normalizeAssessmentStatus` defaulting to "Not started" when
   progressPercent is 0 (line 36-38 of `lib/copy/assessmentStatusCopy.ts`).
   On a re-entry to a completed module this is actively misleading.

### Root cause hypothesis

The lesson page's "Completed N times" + "Prior observations" UI
reads from `lesson_completions`, but `module_assessment` is the
table that holds the actual completion records that drive the
student-profile checkmark + module-count progress. They're allowed
to drift.

`markComplete()` (line 522 onwards) writes to BOTH tables, but the
`lesson_completions` insert is wrapped in a try/catch that swallows
errors and just logs to console (line 597-601). If a past completion
fired before the `lesson_completions` table existed in the user's
project, or if RLS blocked the insert, the completion would still
land in `module_assessment` but not in `lesson_completions` — exactly
the divergence we see.

For Olivia, `module_assessment` has 3 rows (matches the home-page
"3 of 328 complete" count), but `lesson_completions` may have 0 or
fewer rows for the same student+module pairs.

### Acceptance criteria

1. On re-entry to a completed module, the page shows a clear
   indicator: "Completed N times. Last: <date>." where N is the
   actual count and date is the latest completion timestamp.
2. The "Prior observations" expandable section renders the past
   notes (already works if data is there — fix is to ensure the
   data source is correct).
3. The lesson H2 title shows the lesson's human-readable title
   (e.g. "The Silence Game"), not the module code.
4. The student-context banner does not say "Not started" when the
   student has any completed module. Either suppress the
   status-line in re-entry context, or compute it from
   `module_assessment` instead of the static `assessment_status`
   column.

### Recommended fix

1. **Re-source `priorCompletions` from `module_assessment` (or
   union both tables).** `module_assessment` is the authoritative
   source for "this student completed this module." Either:
   - Change the query at line 240-247 to read from `module_assessment`
     (cols `updated_at`, `notes`, `teacher_feedback`), OR
   - Keep `lesson_completions` as the source but BACKFILL the table
     from `module_assessment` so it matches (one-time migration), AND
     change `markComplete` to upsert into `lesson_completions` so future
     re-completions append cleanly.

   Option A is the smaller, safer change for the launch window.

2. **Fix the H2 title.** Change line 738 to
   `moduleRow?.title || moduleRow?.subtitle || 'Module'` — title
   first, subtitle as fallback (rather than always preferring subtitle
   when present). Verify the visual against the design.

3. **Fix the status banner copy on re-entry.** Either compute
   `contextStudentStatus` from `module_assessment` aggregates (richer
   but slower) or hide the "Start the first lesson" CTA when the
   student already has completed modules.

### Notes for the implementer

- The full file is `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- Schema: `module_assessment` has `(tenant_id, student_id, subject_id, module_id, updated_at, notes, teacher_feedback, status)`.
  `lesson_completions` has `(tenant_id, student_id, subject_id, module_id, completed_at, notes)`.
- Both tables have RLS; existing queries already work for the signed-in
  user, so no policy changes are needed — just re-pointing the source.
- Keep the existing 42703-fallback if you keep `lesson_completions` as
  the read source.

### UAT

Re-run the reproduction above after the fix:
- Replay → page shows "Completed N times. Last: <date>"
- Prior observations details block lists past notes
- H2 title is "The Silence Game" (or the actual lesson name)
- No "Not started" banner for Olivia
- Marking complete again increments the count on next re-entry
