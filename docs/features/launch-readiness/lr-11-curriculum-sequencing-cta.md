---
id: LR-11
title: "[UX] Surface curriculum sequencing — make 'next module' obvious"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: walkthrough-audit-2026-05-10
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-10-teacher.md
instructional_review: required — curriculum prescribes order
---

### Goal

Make the curriculum's prescribed order legible in the UI so a teacher
on any student's profile knows *exactly* what to teach next. Today
the teacher has to guess — there's no "next" affordance.

### Background

From the walkthrough: *"How do I know where to continue going? Like,
finished the sounds game, I finished Alphabet, 1 out of 22. Is there
— and this would be to the instructional designer, knowing the book
— is there a certain order I have to go through this? Like, do I
have to go from Phonological to Alphabet to Phonics, or can I just
click into any of these and do them whenever? I think the Montessori
way is you can click into anything, but then it's, like, confusing."*

**The teacher's hypothesis is wrong for this curriculum.** Per
`ind.pdf` Introduction:

> *"Systematic, Cumulative: the organization of material follows
> the logical order of the language. The sequence must begin with
> the easiest and most basic concepts and progress methodically to
> more difficult material. Each concept must also be based on
> those already learned."*

And specifically:

> *"Phonological awareness is **the** key predictor of reading in
> young children."*

Order is:
1. Phonological Awareness (Learning Sensorially → Rhyming →
   Words & Sentences → Syllables → Phonemic Awareness)
2. Alphabet
3. Phonics
4. Reading
5. Handwriting
6. Spelling
7. Vocabulary, Comprehension, Fluency

Within each section, modules are also ordered (e.g. Spelling
Exercises SE-1 introduces sounds m, t, a; SE-2 adds s, b, c; SE-3
adds n, l, i; etc — strict cumulative).

Montessori is child-led on PACE within structure, not on sequence.
The K-Reading Kickstart curriculum is structured. The UI should
reflect that.

### Requirements

1. **On each student's profile, surface a single primary CTA**:
   *"Continue with [Section] — [Module name]"* pointing at the
   next module the curriculum prescribes. The next module is:
   - The next un-completed module in the current section, OR
   - The first module of the next section if the current section
     is fully complete (per the curriculum order)
2. **De-emphasize, but don't hide, off-sequence modules.** The
   teacher CAN click into Phonics before finishing Phonological
   Awareness — but the UI should communicate "this is not where
   the curriculum says to go next." Suggest: a soft warning
   inline on the off-sequence module page, e.g. *"Per the
   curriculum, this is taught after [PrereqSection]. Continue
   anyway?"* Don't block; warn.
3. **Order the curriculum browser** by curriculum sequence in the
   left nav / chapter list. Today it may be alphabetical or
   `created_at` order — should be by section number per the
   curriculum.
4. **Encode the sequencing as data, not as hard-coded UI logic.**
   Add (or use, if it exists) a `sequence_index` column on the
   `module` and `section` tables. Seed it from the curriculum's
   table of contents structure.
5. **For the "next module" computation**, prefer:
   - Modules in the current section the student has not completed
     yet, ordered by `sequence_index`
   - Then the first module of the next section (by
     `sequence_index`)
   - Fall back to: the lowest `sequence_index` not yet completed
6. **Update the "Continue Teaching" CTA** in concert with LR-12
   (which renames the ambiguous label). The new CTA copy should
   be specific: "Continue with Phonological Awareness — Rhyming"
   not just "Continue Teaching."

### Acceptance Criteria

**Happy Path**
Given a student has completed Learning Sensorially modules 1-3 of
Section 1
When the teacher views the student's profile
Then the primary CTA reads *"Continue with Phonological Awareness —
Rhyming Module 1"* (or similar)
And clicking it navigates to that module's lesson page

**Section transition**
Given a student has completed all modules in Section 1
When the teacher views the student's profile
Then the primary CTA points at the first module of Section 2
And the section's completion is indicated visually (badge, color)

**Off-sequence click**
Given the teacher clicks into a module ahead of the prescribed
sequence
When the lesson page loads
Then a soft warning appears: *"Per the curriculum, [Module X] is
taught after [Section Y]. Continue anyway?"*
And the teacher can dismiss the warning and proceed

**Empty state**
Given a brand-new student with zero completions
When the teacher views their profile
Then the primary CTA points at Module 1 of Section 1 (Learning
Sensorially)

**No-data state (curriculum not seeded)**
Given the `module` table has zero rows
When the teacher views any student profile
Then a clear empty state explains the curriculum hasn't loaded
(consistent with LR-05's empty-state requirement)

**Auth state / mobile**
Standard. Primary CTA must be tap-friendly at 375×667.

### Out of Scope

- Hard-blocking off-sequence access. The curriculum recommends an
  order; it doesn't forbid deviation. The teacher's professional
  judgment may override.
- Per-student curriculum customization (e.g. "skip Phonological
  for this student because they've done it elsewhere"). Defer.
- ML-driven next-module recommendations beyond the curriculum's
  prescribed order. (`ml-readiness-classifier` epic territory.)

### Notes

- This depends on **knowing the curriculum order in data.**
  Today the order may not be in the database. Check
  `supabase/schema.sql`, the `seed-curriculum.ts` script, and the
  `module`/`section` tables. If `sequence_index` doesn't exist,
  add it as part of this ticket.
- Files likely involved:
  - `lib/startTeaching/useStartTeachingData.ts` (to compute next
    module)
  - `app/teacher/start-teaching/students/[studentId]/page.tsx` (to
    render the CTA)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
    (off-sequence warning)
  - `scripts/seed-curriculum.ts` (to encode order in seed)
- Coordinate with LR-09: progress numbers and "next module" pull
  from the same data path. Better to fix LR-09 first.
- Coordinate with LR-12: the CTA copy is the same string LR-12
  is disambiguating.
- ~1 day if the schema already has order; ~2 days if it needs
  migration + reseed.
