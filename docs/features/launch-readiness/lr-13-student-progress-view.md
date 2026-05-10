---
id: LR-13
title: "[UX] Student progress view — replace `/teacher/assessments` with curriculum-aligned progress on the student profile"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: walkthrough-audit-2026-05-10
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-10-teacher.md
related_audits: docs/features/assessments-grouping/instructional-redundancy-audit.md
depends_on: LR-03 (retire /teacher/assessments), LR-09 (progress data integrity)
---

### Goal

Give teachers a clear, curriculum-aligned view of where each student
is in the program — without recreating the audit-killed
`/teacher/assessments` dashboard. Consolidates the prior assessment
audit's recommendations #3 (per-student observation log on lesson
page) and #4 (roster glance) into one launch-priority deliverable.

### Background

Two inputs converge on this ticket:

1. **Walkthrough finding:** The teacher said *"we should def get rid
   of assessments but we need a place they can see the progress of
   the student."* That's the user explicitly asking for the
   replacement surface.

2. **Prior audit recommendations** (`assessments-grouping/instructional-redundancy-audit.md`, 2026-05-09):
   - Recommendation #3: Add a lightweight per-student observation
     panel to the lesson page. Shows last-completed date, last
     observation note, current module, next recommended module.
     Teacher writes new observations inline.
   - Recommendation #4: Add a roster-glance widget to
     `/teacher/start-teaching` showing all active students with
     name, current module, last-observed-at, one-line latest
     observation, "ready to advance" indicator.

3. **Walkthrough also surfaced** (Finding 6 in walkthrough audit):
   The "She's on track / She needs extra support" enum at
   lesson-complete is the same `assessment_status` field the prior
   audit recommended retiring. Even with `/teacher/assessments`
   gone, the broken metaphor lives on at lesson-complete time.

### Requirements

1. **Per-student observation panel on the lesson page.** Inline,
   not a separate route. Shows:
   - "Last completed: [date]" (per LR-10's history)
   - Last observation note (one-liner)
   - Current section / module they're on
   - Field to write a new observation (textarea, autosave)
2. **Roster-glance widget at `/teacher/start-teaching`.** Replaces
   the role of `/teacher/assessments` for the "where is everyone"
   need:
   - One row per active student
   - Columns: Name, current section / module, last-observed date,
     latest observation snippet, ready-to-advance flag
   - Click → student profile (already wired)
3. **Replace the lesson-complete status enum** ("Ready / Needs
   Help / Needs Intervention") with observation-language UX:
   - Required: a brief observation note ("What did you notice?")
   - Optional: a "ready for next module" flag (binary, the
     curriculum-aligned mastery gate)
   - Drop the four-state enum from the lesson-complete UI (the
     underlying `assessment_status` column can stay in the schema
     for now per LR-03's out-of-scope note; just don't surface it)
4. **Cross-link from student profile to lesson history** (per
   LR-10) — the new observation panel essentially IS that history
   surface.
5. **Group students vs. individual students:** the roster widget
   should sort/group by teaching-mode context (groups together,
   individual students together). Reuses
   `useTeachingMode()` if available.

### Acceptance Criteria

**Happy Path (lesson page panel)**
Given a teacher opens a lesson page for a student who has prior
completions
When the page renders
Then the observation panel shows last completion date, last
observation note, current module, and an empty observation field
And the teacher can type a new observation
And the field autosaves

**Happy Path (roster widget)**
Given a teacher is on `/teacher/start-teaching`
When the page renders
Then they see a roster row per active student
And each row shows current module + latest observation snippet
And clicking a row goes to that student's profile

**Lesson complete (no enum)**
Given a teacher is completing a lesson
When they hit "Save & Mark Complete"
Then they're prompted only for an observation note (required)
and "ready for next module" (optional)
And no Ready/Help/Intervention dropdown is shown

**Empty state**
Given a brand-new student with zero completions
When the teacher views their profile
Then the observation panel shows "No prior observations" and an
empty input field
And the roster widget shows "Hasn't started" for the module field

**Auth state**
Given a logged-out user views `/teacher/start-teaching`
Then preview-mode demo students are shown (per LR-08's resolution),
not real student data

**Mobile**
Both the observation panel and roster widget must work at 375×667.
Roster on mobile may stack or use a card layout instead of grid.

### Out of Scope

- Migrating existing `assessment_status` enum values to observation
  notes (data migration). Existing data can stay; the UI just stops
  surfacing it.
- Comparing observations across multiple students (cohort analysis).
- Sharing observations with parents (separate ticket; future).
- Searchable observation history. Just last + chronological.

### Notes

- Files likely involved:
  - `app/teacher/start-teaching/page.tsx` (roster widget)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
    (observation panel + lesson-complete UX)
  - `lib/startTeaching/useStartTeachingData.ts` (observation
    queries)
  - Possibly new: `components/StudentObservationPanel.tsx`
- Database: observations should be stored on `lesson_completions`
  (notes column already exists per KAN-52) or a new
  `observations` table if you want them decoupled from completion.
  Recommendation: stay on `lesson_completions.notes` for v1; add a
  new table only if you need observations independent of
  completions.
- Coordinate with LR-09 (data integrity) and LR-10 (re-entry) —
  both feed this surface's data.
- This is M-L complexity. Roughly 1–2 days including the new
  component.
