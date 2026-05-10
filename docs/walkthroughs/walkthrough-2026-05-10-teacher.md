# Walkthrough — Teacher view, 2026-05-10

Loom: https://www.loom.com/share/adb78024d2aa4616a67bd013a7574dbb

Stream-of-consciousness transcript from a logged-in teacher walkthrough.
Two students used: Ali Sosna and Maggie.

## Transcript (timestamped highlights)

**0:00–0:30** Logged out → signed in → logged in as teacher.
Opened Ali Sosna's profile.

**0:31** *"She's on Lesson 13 of 197. So, this is really cool. It's
really confusing. It says I'm on Lesson 13 of 197, but it looks like
it's not tracking here. Like, it's just phonological awareness,
learning sensorily, silence games, start teaching. That's confusing
itself, because why do I have so much progress?"*

**1:02** Marked a lesson complete (Sounds Game). *"If I go back,
sounds game is completed, but now I can't click back into it, which
I probably should be able to. And if I go back to start teaching,
it doesn't really, like, update. She's still on 13 of 197, so that's
really confusing."*

**1:31** Switched to Maggie. *"Continue later. What does that do? It
saves, it does save the things. It does save the comments. And then
if I start teaching it now, it has comments. Great."*

**1:51** Marked Maggie's lesson complete with "needs extra support."
*"Now I'm gonna go back to start teaching. It says Maggie has one
module done. Why does Allie say lesson 13 of 197? Is this just because
it was, like, done before and it hasn't been updated, because this
doesn't make sense to me?"*

**2:06** *"It's also kind of confusing, like, what I'm supposed to do.
So I can, like, go to Phonological Awareness and I can go to Alphabet
and I can start here. Continue teaching. Looks like I might have been
teaching already here. Yeah, like, why does it say continue teaching?"*

**2:54** *"How do I know where to continue going? Like, finished the
sounds game, I finished Alphabet, 1 out of 22. Is there — and this
would be to the instructional designer, knowing the book — is there
a certain order I have to go through this? Like, do I have to go
from Phonological to Alphabet to Phonics, or can I just click into
any of these and do them whenever? I think the Montessori way is you
can click into anything, but then it's, like, confusing."*

**3:18** *"It repeats, so, like, I see Phonological, Alphabet,
Phonics, and it might be Alphabet and then all of a sudden,
Phonological Awareness happens again. 1 out of 88. Why is this 0 out
of 73? This makes no sense. It's the same thing. So I need that to
be fixed, too. Something's going on with the way the data's coming
in here."*

## Distinct findings

1. **Progress numbers are wrong / stale.** Ali shows "13 of 197"
   that doesn't update after completing a lesson. Maggie shows "1
   module done." Two students with similar interaction histories
   produce wildly different progress displays.
2. **Cannot re-enter completed lessons.** After marking complete,
   the lesson is locked.
3. **Curriculum order is unclear in the UI.** Teacher doesn't know
   if she should follow the Phonological → Alphabet → Phonics
   sequence or pick any module.
4. **"Continue teaching" is ambiguous.** Sometimes means "continue
   this in-progress lesson," sometimes means "go back to where you
   were" — teacher couldn't tell what action to expect.
5. **Sections appear to duplicate with mismatched counts.** Same
   section title shows "1 of 88" in one place and "0 of 73" in
   another. Indicates a data integrity issue, not just labeling.
6. **Status enum ("She's on track" / "She needs extra support")
   surfaces inside the lesson-complete flow.** This is the same
   `assessment_status` enum the prior audit flagged. Even though
   `/teacher/assessments` is being retired (LR-03), the underlying
   data field is still being captured at lesson-completion time.

## Lens application

### PM lens
- Findings 1 and 5 (broken progress numbers, mismatched counts)
  destroy trust. A teacher who sees nonsense numbers stops trusting
  any number the app shows. Launch-blocker.
- Finding 4 ("continue teaching" ambiguity) is friction on the
  activation north star. The teacher hesitates at every transition.
- Finding 6 echoes the prior assessment audit; need a clean answer
  for the lesson-complete UX.

### Design lens
- The teacher said *"it's really cool. It's really confusing"* —
  this exact phrase says the visual design is appealing but the
  information architecture is broken. Translates to: surface area
  is well-styled, but it doesn't tell a coherent story about what
  the teacher should do next.
- "Where to continue" is the missing affordance. There's no clear
  "your next module is X — start" call to action.
- The lesson-complete flow uses different language ("on track" vs
  "needs extra support") than the curriculum's diagnostic-teaching
  framing.

### Instructional Design lens
- **Curriculum DOES prescribe order.** From `ind.pdf` Introduction:
  *"Systematic, Cumulative: the organization of material follows the
  logical order of the language. The sequence must begin with the
  easiest and most basic concepts and progress methodically to more
  difficult material. Each concept must also be based on those
  already learned."* And: *"Phonological awareness is THE key
  predictor of reading in young children."* Section 1 (Phonological
  Awareness) → Section 2 (Alphabet) → ... Section 7 (VCF). Within
  each section, modules also progress (e.g. Spelling Exercises
  SE-1 → SE-9 explicitly accumulate sounds).
- The teacher's hypothesis *"I think the Montessori way is you can
  click into anything"* is **wrong specifically for K-Reading
  Kickstart.** Montessori has child-led PACE within a structured
  sequence; the sequence itself is fixed in this curriculum.
- **Re-entry to completed lessons (Finding 2) is instructionally
  required.** The curriculum's diagnostic-teaching principle says
  *"the content presented must be mastered step by step to the
  degree of automaticity."* Automaticity comes from repetition.
  Locking out completed lessons CONTRADICTS the curriculum.
- Finding 6 (status enum at lesson-complete) needs the same
  observation-language fix the prior audit recommended. Replace
  diagnostic labels with brief observation notes.

## Tickets generated

| ID | Title | Severity |
|---|---|---|
| LR-09 | Fix progress-number data integrity (sectional + total counts) | BLOCKER |
| LR-10 | Allow re-entry to completed lessons (Montessori repetition) | HIGH |
| LR-11 | Surface curriculum sequencing — make next-module obvious | HIGH |
| LR-12 | Disambiguate "Continue teaching" CTA | HIGH |
| LR-13 | Student progress view (replace `/teacher/assessments`) | HIGH |
| LR-14 | Audio recording at module level | MEDIUM |

Notes:
- LR-13 consolidates the prior assessment audit's recommendation #3
  (observation log) and #4 (roster glance) into a single
  launch-priority deliverable — the user explicitly asked for a
  place to see student progress.
- LR-15 (status enum at lesson-complete) is folded into LR-13.
- Parent walkthrough TBD — will produce its own audit + tickets.

## Open questions to revisit

- Are the section duplicates (Finding 5) actual database rows
  duplicated, or just rendering bugs from joining tables wrong?
  LR-09 needs to answer this before fixing.
- Should "audio recording" attach to `lesson_completion` rows or a
  new `lesson_recordings` table? (LR-14 tradeoff.)
- For curriculum sequencing (LR-11): does the app currently know the
  prescribed order from the `module` table, or does the curriculum
  PDF order need to be encoded somewhere?
