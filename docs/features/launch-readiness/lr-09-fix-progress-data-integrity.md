---
id: LR-09
title: "[Data] Fix progress-number integrity — wrong totals, stale counts, duplicate sections"
type: bug
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: walkthrough-audit-2026-05-10
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-10-teacher.md
---

### Goal

Fix the progress numbers shown on student-context surfaces so they
reflect reality. Today multiple numbers are wrong, stale, or
duplicated — destroying teacher trust on first glance.

### Background

Walkthrough findings (`walkthrough-2026-05-10-teacher.md`):

1. **Stale total.** Ali Sosna shows "Lesson 13 of 197" on her
   student page. After completing a lesson, the number doesn't
   update. Either the total is wrong, the increment doesn't fire,
   or the page doesn't refetch.
2. **Mismatched students.** Ali shows "13 of 197"; Maggie (similar
   profile, similar interactions) shows "1 module done." Two
   students should display in the same shape — wildly different
   formats indicate the count comes from different code paths or
   different tables.
3. **Section duplicates with mismatched counts.** Same section
   title (e.g. Phonological Awareness) appears twice in the same
   view, once as "1 of 88" and once as "0 of 73." Indicates either
   a database join issue or duplicate rows in the `module`/`section`
   tables.
4. **"197" looks suspicious.** The K-Reading curriculum has 7
   sections with module counts that, by inspection of the PDF
   appendices, are nowhere near 197 individual modules at the
   Individual track. Either the curriculum content was seeded with
   duplicates, or "lessons" is being counted at sub-module
   granularity (every micro-step counted).

The teacher said: *"Something's going on with the way the data's
coming in here."* Confirmed. The fix needs both **data layer**
investigation (are there duplicate rows? is the total right?) and
**rendering layer** investigation (does it refetch? does it use
the right query?).

### Requirements

1. **Audit the `module` table** for duplicates. Expected per the
   curriculum (Individual track, ind.pdf):
   - Section 1 Phonological Awareness: ~5 sub-sections (Learning
     Sensorially, Rhyming, Words & Sentences, Syllables, Phonemic
     Awareness with 4 children)
   - Section 2 Alphabet
   - Section 3 Phonics
   - Section 4 Reading (with Reading Exercises)
   - Section 5 Handwriting
   - Section 6 Spelling (with Spelling Exercises SE-1 through SE-9)
   - Section 7 Vocabulary, Comprehension, Fluency
   Each section has a finite known module count. If `module`
   contains duplicates, dedupe.
2. **Decide what "Lesson X of Y" actually means.** Per the
   curriculum, a "lesson" is a teacher-student session. A "module"
   is a curriculum unit. The spelling SE-1 to SE-9 sequence is 9
   modules, each could be done as multiple lessons. The teacher
   said "Lesson 13 of 197" — that number is some count, but the
   denominator should match what teachers expect to see. Pick:
   - **Modules:** total count of modules across all sections
   - **Lessons:** total count of completable units (smaller? bigger?)
   - **Per-section:** "Lesson 3 of 9 in Spelling Exercises"
   Recommend per-section + a separate "Total modules completed"
   counter. Avoid "X of Y" totals across the whole curriculum
   unless it's a meaningful denominator.
3. **Fix the refetch.** When a teacher marks a lesson complete and
   navigates back to the student page, the count must reflect the
   completion. Either invalidate the query cache or force-refetch.
4. **Unify the count display** across student profile, start-teaching
   roster, and any other surface that shows a progress number.
   One source of truth, one rendering helper.
5. **Spot-check the section duplication issue (Finding 3).** Is it
   the database (two `section` rows with the same title) or the
   join (the query produces duplicate rows)? Fix at the right layer.

### Acceptance Criteria

**Happy Path**
Given a teacher views a student's profile
When the page loads
Then the progress number reflects the student's actual completed
modules in the correct denominator
And the number matches what shows on the start-teaching roster

**Refetch on completion**
Given a teacher marks a lesson complete and navigates back to the
student profile
When the page renders
Then the progress number has incremented (or the section count has
incremented per requirement 2)
And no manual refresh is needed

**No section duplicates**
Given a teacher views any list of curriculum sections
When the list renders
Then each section appears exactly once
And section module counts are consistent across views

**Empty state**
Given a brand-new student with zero completions
When the teacher views their profile
Then the progress shows "0 of N" or "Not started" — not undefined or
NaN

**Auth state / mobile**
Display works at 375×667 and in preview mode (logged out).

### Out of Scope

- Re-architecting the progress model entirely (separate ticket if
  the data layer is too tangled to fix in place).
- Adding "next recommended module" guidance — that's LR-11.
- UI for the progress display (this ticket fixes the data; LR-13
  redesigns the broader progress surface).

### Notes

- Files likely involved:
  - `lib/startTeaching/useStartTeachingData.ts`
  - `lib/hooks/useGroupingProgressData.ts`
  - `app/teacher/start-teaching/students/[studentId]/page.tsx`
  - `app/start-teaching/students/[studentId]/page.tsx` (if both
    exist post-LR-04)
  - The Supabase RPC layer if there's a `content_get_modules` etc.
- Start with a database-level audit: `SELECT section_title,
  COUNT(*) FROM module GROUP BY section_title` — if any group has
  count > expected, dedupe.
- Then trace the React-Query / state path that produces the "13 of
  197" string to find the broken total.
- This is a real BUG ticket, not just a feature. Should ship in
  ~1 day including the data audit.
