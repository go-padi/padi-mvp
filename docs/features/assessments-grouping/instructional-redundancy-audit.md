# Instructional Review — Assessments-Grouping Surface

**Verdict:** **REVISE — strong redundancy with curriculum's built-in assessment moment.** The standalone `/teacher/assessments` status roster duplicates work the curriculum already does inside each lesson module. Recommend retiring the standalone surface and surfacing per-student status as a lightweight roster inline with the curriculum / start-teaching flow.

**Reviewed against:**
- `docs/curriculum/ind.pdf` — Introduction (p7–11), Lesson Planning appendix and module scripts (p284–301)
- `docs/curriculum/group.pdf` — assumed parallel pattern; spot-check recommended before final decision
- Montessori principles 1, 2, 4 (child-led, materials-based, observation-as-assessment)

---

## Curriculum alignment

**Finding (CONCERN, leaning BLOCKER):** The curriculum has no notion of a separate assessment screen, event, or document. Every lesson module is structured as a teacher↔student script with built-in observable checks. The teacher's job during the lesson is to *watch and listen* — that **is** the assessment.

Concrete evidence from `ind.pdf`:

- **Module S-3 "Sound Out"** (p284) prescribes exactly:
  > Teacher: Look at my mouth and echo the word /am/
  > Student: Echoes /am/
  > Teacher: Now sound out as you write the word /am/
  > Student: /a/ /m/
  > Teacher: Read the word that is written
  > Student: /am/

  Three observable checks per pass: did the student echo, did they correctly sound-spell, did they read what they wrote. No quiz follows.

- **Spelling Exercises SE-1 through SE-9** are graduated by accumulated mastery. SE-1's "Presented sounds: m, t, a" → SE-2's "m, t, a, s, b, c" → ... SE-9 introduces digraphs. **Movement to the next exercise IS the assessment moment.** The teacher decides "ready for SE-3" by observing whether the child sound-spelled SE-2's words correctly.

- The Introduction (p9) defines the curriculum's assessment philosophy as **diagnostic teaching**: *"the teaching plan is based on careful and continuous assessment of individual needs."* Continuous, not periodic. Embedded, not separate.

What the curriculum DOES need from a system: the teacher needs to remember (a) where each student is in the module sequence, and (b) what the teacher saw the student struggle with last lesson, so they can repeat or advance appropriately. That's a different shape than `/teacher/assessments`.

---

## Montessori alignment

**Finding (CONCERN):** The current `/teacher/assessments` page violates principle 4 (observation-as-assessment) by treating assessment as a status field set on the student record (`assessment_status: 'Ready' | 'Needs Help' | 'Needs Intervention' | 'Not started'`).

In Montessori, assessment is the trained adult's continuous observation, recorded in the moment via brief notes — not a categorical badge applied to the child. The four-state status enum is reductive in a way Montessori specifically pushes against. "Needs Help" and "Needs Intervention" especially imply diagnostic labels that should emerge from longitudinal observation patterns, not be set as a UI dropdown.

This may also reinforce a bad mental model in the teacher: "I need to mark Ahmed as Needs Help" is teacher-doing-assessment-as-paperwork. Montessori has the teacher doing observation-as-being-present.

Severity: CONCERN, not BLOCKER, because the data fields themselves can be useful — the teacher does need to remember *something* between lessons. The framing is the issue, not the existence of stored state.

---

## Redundancy

**Finding (BLOCKER for the standalone page; CONCERN for the underlying data fields):** `/teacher/assessments` (`app/teacher/assessments/page.tsx`) is a teacher-facing status roster showing each student's `assessment_status`, `focus_areas`, and `progress_label`. It pulls from the `students` table.

**What's already covering this ground:**
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — the lesson player, where the actual observable assessment happens per the curriculum
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — student-context view during teaching
- `lesson_completions` and `module_assessments` tables — already capture what the child has actually done (which modules, when, with what assessment_notes per recent KAN-75)
- `KAN-52` (already shipped per board) requires notes before marking lesson complete — the teacher's observation is captured AT the lesson moment, in context

So the data exists, in context, at the right moment. `/teacher/assessments` is a separate-page **dashboard** of pre-aggregated state that the teacher set elsewhere. Classic redundancy: the work happens in one place (lesson), the dashboard just reflects it.

**What `/teacher/assessments` adds that's not redundant:** a single-page roster view "at a glance, where is every student." That's a real teacher need (especially for the Group track, where you're managing 4–8 kids). But it doesn't need to be a separate route — it can be a lightweight roster widget within `/teacher/start-teaching` or `/teacher/students`.

---

## Cognitive load

**Finding (NOTE):** `/teacher/assessments` adds a tab/route the teacher must navigate to in addition to `/teacher/students`, `/teacher/curriculum`, and `/teacher/start-teaching`. That's four ways to look at "students" — one for ID-card view, one for assessment-status view, one for curriculum-progress view, one for active-teaching view.

In a phone-first context (per the brief), four tabs covering overlapping ground is friction. The teacher is in the middle of a lesson, the child is restless, they need ONE place to glance at "where are we / what's next."

---

## What this teaches the child / supports the teacher

The honest answer: **`/teacher/assessments` doesn't teach the child anything**, because the child never sees it. It supports the teacher by giving them a roster of state they themselves entered.

That's still a real support — teachers DO need a memory aid between lessons. But the memory aid should be:
- Surfaced where the teaching happens (next to the lesson, in the start-teaching flow)
- A lightweight observation log, not a status dropdown
- Phrased in observation language ("Last lesson Ahmed echoed correctly but sound-spelled /b/ as /d/. Try repeat of SE-3.") rather than diagnostic-label language ("Ahmed: Needs Help")

---

## Recommended changes

In priority order:

1. **Retire the standalone `/teacher/assessments` route.** Remove from primary nav. Redirect any inbound links to `/teacher/start-teaching` (or wherever the new roster lives).

2. **Replace the status badge model** with an observation-log model. Drop the `assessment_status` enum field from `students`. Keep `focus_areas` if it's actually used; it's the closest thing to a Montessori-aligned signal (areas the teacher is currently watching).

3. **Add a lightweight per-student observation panel** inside the lesson page (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`). Shows: last lesson date, last-lesson observation note, current module, next recommended module. The teacher writes new observations inline, in present-tense ("Sound-spelling /b/ for /d/ today"), with an explicit option to mark "ready for next module" (curriculum-aligned mastery gate, not a status enum).

4. **Add a roster-glance widget** at `/teacher/start-teaching` showing all active students with: name, current module, last-observed-at, one-line latest observation, "ready to advance" flag. Single page. No drilling.

5. **Rewrite copy** that uses diagnostic-label language ("Needs Help," "Needs Intervention") into observation language. KAN-80 was already trying to align signal language; this is the same direction but more aggressive — three-signal ("Ready / Watching / Stuck on X") still sets a state, where Montessori would have you write what you saw.

6. **Update KAN-36 (Assessments & Grouping epic)** to reflect this redirect. Likely renames to "Roster & Observation Log" or similar. KAN-45 and KAN-46 (assessments empty state, grouping empty state) become unnecessary if the standalone surfaces don't exist; close them or redirect them to the new roster widget. KAN-83 (mobile responsive for the 4-column grid) is moot if the grid goes away.

---

## What this changes about the BuildLoop pipeline

The `pm_generate` phase in BuildLoop now consults the instructional-design lens before drafting (per the standing redundancy questions in `instructional-design/SKILL.md`). With this audit landed, "the assessments page is redundant" is no longer a standing question — it's an answered one. PM should treat any new tickets that thicken `/teacher/assessments` as redundant-by-default and reroute energy to the lesson-page observation log instead.

Suggested follow-ups for the next BuildLoop iteration to pick from:
- "Retire `/teacher/assessments` route, redirect to start-teaching" (small, safe)
- "Add per-student observation log to lesson page" (M complexity)
- "Add roster-glance widget to start-teaching" (M complexity)

These three together replace the assessments-grouping work without losing the underlying teacher need.

---

## What I'm NOT confident about

I read `ind.pdf` (Individual track) closely and only spot-read `group.pdf`. The Group track may have different observation rituals — for example, a Group lesson with 6 kids may genuinely benefit from a teacher's mid-class roster view in a way 1:1 lessons don't. **Recommend a second pass focused on `group.pdf`'s lesson-planning sections before fully retiring `/teacher/assessments`.** If the Group track prescribes whole-class observation moments that need a roster, that's a real curriculum-aligned use case for a roster surface — though probably still inside `/teacher/start-teaching`, not as its own route.

BLOCKER: Standalone `/teacher/assessments` route should not have new features built against it without first deciding whether to retire it.
