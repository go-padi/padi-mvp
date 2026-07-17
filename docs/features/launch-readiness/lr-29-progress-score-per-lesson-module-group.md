---
id: LR-29
title: "[Feature] Progress score at every level — lesson, module, group — derived from existing 3-signal data"
type: story
status: ready
priority: high
feature: launch-readiness
launch_blocker: false
created: 2026-05-24
created_by: founder-direction-2026-05-24
related: LR-26, LR-14
handling: cc
---

### Goal

Give parents and teachers a legible score at three levels of the
curriculum tree so they can see progress at a glance:

1. **Per lesson** — how did this session go?
2. **Per module** — is the child mastering this module?
3. **Per group** — how are they doing across this developmental area?

**Pre-AI, the score is fully derived** from data you already collect:
per-module 3-signal picks (Accelerating / Practicing / Specialist Track)
via LR-26 + completion counts via LR-10a. No new data entry surface —
mom does not have to score anything extra. The AI-produced score
(post-launch) will slot into the same UI without a schema change.

### Background

Today the app captures:
- `module_assessment.teacher_feedback` — the 3-signal pick per
  (student, module) — writes on every "Mark Lesson Complete".
- `lesson_completions` — one row per completion of (student, module),
  append-only after LR-10a.
- `teaching_notes.notes` + `attachment_url` — session notes and audio
  attachments (LR-14).

Every screen that renders progress currently shows either raw counts
("3 of 328 modules complete") or a per-module signal chip. There is no
group-level aggregation and no session-level history readout.

### The score model (pre-AI)

**Vocabulary is the same 3 signals — Accelerating / Practicing /
Specialist Track.** No new bands, no numbers, no percentages. See
[[feedback-rating-ui-single-pick]] — one-of-three is the canonical
vocabulary and consistency matters more than richness.

Aggregation rule (worst-signal wins):
- If any child unit has `Specialist Track` → parent is **Specialist Track**
- Else if any child unit has `Practicing` → parent is **Practicing**
- Else if any child unit has `Accelerating` → parent is **Accelerating**
- Else (no data yet) → parent is **Not started**

Applied at each level:
- **Lesson score** = the signal picked for that session.
- **Module score** = aggregation of lesson signals for that (student,
  module). In practice this is the same as
  `module_assessment.teacher_feedback` today, but the query should
  compute it from `lesson_completions.signal` (or equivalent) so
  multi-completion history works after LR-10-bug-01.
- **Group score** = aggregation of module scores for the modules in
  the group that the student has any signal on. Empty modules do not
  drag the score — they show as "Not started" on the sub-row.

Reasoning for worst-signal-wins vs. average: with only 3 buckets, an
average is misleading (Accelerating + Specialist averages to
Practicing, hiding the specialist flag). The mom/teacher's job is to
notice the specialist signal early — the score must not smooth it away.

Nisha to confirm: aggregation rule (worst-signal-wins) is the launch
default. Post-AI this becomes a numeric probability distribution
behind the scenes; the UI keeps showing the 3-band top-line.

### Requirements

1. **Lesson score readout on the lesson page.** On the completed
   lesson page (LR-10-bug-01's fix ships this real estate), show
   the most recent signal + when it was set. If multiple completions:
   show a compact history of the last 3 signals with dates.

2. **Module score chip on the student profile.** The existing
   completed-module rows already show a checkmark + Replay button.
   Add a small colored chip to the right of the module title showing
   the module score (Accelerating green / Practicing amber /
   Specialist coral). Not-started modules stay unlabeled.

3. **New: Group score in the group header.** On
   `app/teacher/curriculum/[chapter]/[group]/page.tsx`, add a header
   badge that shows the group score for the current student. Include
   the tally line underneath: *"3 of 11 modules assessed. 1
   Accelerating, 1 Practicing, 1 Specialist Track."*

4. **New: Chapter roll-up on the student profile.** The chapter row
   currently shows raw counts ("2 of 86 modules complete across 8
   groups"). Add the chapter score as a chip in the same header. Same
   worst-signal-wins rule applied over the child modules with
   signals.

5. **Legend on hover / mobile tap.** Any score chip has an accessible
   label + a tooltip explaining what the color means. Use the same
   copy from `lib/copy/assessmentStatusCopy.ts`. Do not introduce new
   copy strings.

6. **Score reflects the latest signal.** On re-completions
   (LR-10-bug-01 unlocks this), the module score uses the most
   recent lesson signal, not the first. The aggregation rule at
   group/chapter uses each module's *latest* module score.

### Out of scope

- Numeric percent / letter grade / stars. Signal band only.
- Score deltas over time ("improved from Practicing → Accelerating").
  Separate ticket if the visual pattern shows it's needed.
- Cross-student comparisons ("Olivia vs. Rex"). Separate ticket.
- Parent-facing PDF / share-link of the score. Separate ticket.
- AI-produced score. Post-launch; the UI shape is designed to accept
  it later.

### Acceptance criteria

1. Given Olivia has 3 modules assessed in Phonological Awareness →
   1 Accelerating, 1 Practicing, 1 Specialist Track, when the teacher
   opens Olivia's profile, then the Phonological Awareness chapter
   header shows a **Specialist Track** chip.
2. Given the same data, when the teacher opens the Learning
   Sensorially group page for Olivia, then the group header shows
   the group score chip and the tally line.
3. Given a module has been completed twice — the first as Practicing,
   the second as Accelerating — the module chip on the profile shows
   **Accelerating** (latest wins for the module's own score).
4. Given a module with no completions yet, the module row shows no
   chip (not "Not started" — the current UI already handles the
   empty state).
5. Colors match the existing `SIGNAL_OPTIONS` mapping in
   `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`. No
   new palette introduced.
6. Accessible: each chip has `aria-label` reading the full signal
   name. Screen readers announce "Phonological Awareness, Specialist
   Track. 3 of 86 modules assessed."

### Notes for the implementer

- Source of truth for the per-module signal: use `module_assessment`
  in this ticket (matches what LR-10-bug-01 will re-source
  `priorCompletions` to). Do NOT read `lesson_completions.signal`
  until LR-10-bug-01 backfills or the data source flips.
- The aggregation is cheap. Compute it in the same `useEffect` that
  loads `completedModuleIds` on the student profile. Return a
  `Map<groupKey|chapterKey, Signal>` alongside the existing set.
- Curriculum tree lookup: `curriculum_chapter` → `module_group` →
  `module_detail`. The group page already reads this shape.
- Signal → color: reuse the constants in
  `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
  (`SIGNAL_OPTIONS` at line 51). Extract to a shared `lib/copy/`
  file if used in more than 2 places.
- Do not add a new database column. This ticket is UI + aggregation
  only.

### UAT

- Live app: seed a student with a mix of signals across modules in
  the same group.
- Verify: lesson page, module chip on profile, group score chip on
  group page, chapter chip on profile.
- Verify: a Specialist Track signal on one module in an otherwise
  Accelerating group correctly bubbles up to Specialist Track at
  the group level.
- Verify: hover / mobile tap surfaces the definition.
- Verify: no schema / migration changes.
