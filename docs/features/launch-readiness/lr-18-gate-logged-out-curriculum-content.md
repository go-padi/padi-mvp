---
id: LR-18
title: "[Curriculum] Replace logged-out curriculum browser with overview cards — gate full content behind login"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
partial_shipped: LR-18a (lesson detail gating) on 2026-05-13; remainder = chapter overview cards
created: 2026-05-11
updated: 2026-05-13
created_by: parent-walkthrough-2026-05-11
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-11-parent.md
supersedes_pm_rule: "Content is always visible regardless of auth state"
---

### Goal

When a visitor isn't logged in, the curriculum browser should show
**chapter and section overview cards** — names, short descriptions,
lesson counts, time estimates — and gate the actual lesson content
behind sign-in. Today, all lesson content is exposed to anyone who
clicks through `/teacher/curriculum/[chapter]/[group]/[module]`.
That's both an IP-exposure problem and a confused-purpose problem
for visitors who don't yet understand what they're looking at.

### Background

From the parent walkthrough:

> "If I go to Curriculum, I see every single one of the lessons,
> this is bad, this should not be what happens when I'm not logged
> in, I can just then take the content, right, I should just see
> what's available, and maybe when it drops down, it just tells me
> what happens in the each of these areas, so what does phonological
> awareness have, what does individual alphabet, and how much time
> does it take... it should not expose all the content."

This finding **explicitly retires** the padi-pm skill's existing
Key Product Rule: *"Content is always visible regardless of auth
state."* That rule was correct earlier in the project (when the
priority was eliminating friction for evaluators), but the
walkthrough makes clear it's no longer correct: visitors don't need
the lesson content to decide whether to sign up — they need enough
to TRUST that Padi knows what it's doing. Chapter overviews +
time estimates do that without giving away the curriculum.

The curriculum source-of-truth is `docs/curriculum/ind.pdf`
(Individual track) and `docs/curriculum/group.pdf` (Group track).
Both have chapter and section introductions that can be condensed
into 1-2 sentence descriptions per section.

### Requirements

1. **Author chapter/section overview copy.** For each chapter in the
   K-Reading Kickstart curriculum (Phonological Awareness, Alphabet,
   Phonics, Reading, Handwriting, Spelling, VCF), draft:
   - Chapter name
   - 1-2 sentence "what's in this chapter" description (parent-
     friendly language)
   - For each section within the chapter (Listening Skills, Rhyme &
     Mama, Word Sounds, Syllables, etc.): 1-sentence section
     description + estimated time to complete the section
   - Total lesson count per section
   Source from `ind.pdf` / `group.pdf`. Surface to founder for
   sign-off before shipping (this is brand-voice copy).
2. **Build logged-out curriculum view.** Replace the current
   logged-out experience at `/teacher/curriculum` (and nested
   routes) with overview cards. Each card:
   - Chapter title + description
   - Section breakdown (collapsible: section name, description,
     time, lesson count)
   - Sign-in CTA at the bottom of each card and at any drill-down
     attempt
3. **Gate the lesson detail pages.** Routes like
   `/teacher/curriculum/[chapter]/[group]/[module]` MUST redirect
   logged-out users to the overview view (or a sign-in modal) rather
   than rendering the module body.
4. **Preserve logged-in behavior.** Authenticated teachers and
   parents see the full hierarchical browser as today. This change
   is logged-out only.
5. **Add a "what's behind login" teaser** to make the value clear:
   on each overview card, a small text strip like "Sign in to start
   teaching" or "Login to access full lessons + progress tracking."
6. **Mobile** — overview cards must lay out cleanly at 375×667.

### Acceptance Criteria

**Happy Path (logged-out visitor)**
Given a logged-out visitor navigates to `/teacher/curriculum`
When the page renders
Then they see 7 chapter overview cards (one per K-Reading chapter)
And each card shows the chapter name, description, and a
section breakdown with descriptions + time estimates + lesson counts
And no individual lesson content (no module body, no script, no
"Teacher: Look at my mouth and echo /am/" content) is rendered

**Happy Path (logged-out drill-down attempt)**
Given a logged-out visitor tries to open
`/teacher/curriculum/phonological-awareness/listening-skills/LS-1`
(directly via URL or via a stale link)
When the page resolves
Then they are redirected to the overview view (OR see a sign-in
modal overlay) — NOT the lesson content

**Happy Path (logged-in teacher)**
Given an authenticated teacher
When they navigate to `/teacher/curriculum` and drill down
Then they see the full hierarchical browser exactly as today (no
regression)

**Happy Path (logged-in parent)**
Same as teacher — full access preserved.

**Empty State**
Given the database has zero modules
When the logged-out overview view renders
Then a friendly "Curriculum loading" or "Coming soon" state shows —
never an unstyled error

**Error State**
Given the chapter/section data fails to load
When the page renders
Then an error state shows with a retry affordance

**Mobile (375×667)**
- Overview cards stack vertically
- Section breakdowns are tappable (not just hoverable)
- Sign-in CTAs are above the fold on the first card

### Out of Scope

- Restructuring the LOGGED-IN curriculum browser (LR-05 territory).
- Building a separate marketing-site curriculum page (that lives at
  go-padi.com — separate codebase).
- Per-module preview ("first lesson free" pattern) — keep it
  simple: chapters/sections preview, modules gated. Revisit later
  if conversion data suggests we need a freebie.
- Localizing the overview copy.

### Notes

- **PM rule update needed:** the `padi-pm:padi-pm` skill currently
  says "Content is always visible regardless of auth state." Update
  the skill's SKILL.md when next edited to: "Content overview
  (chapter/section descriptions, lesson counts, time estimates) is
  always visible. Full lesson content is gated behind login." Flagged
  as a meta-task; not blocking this ticket.

---

## Authored copy (2026-05-12)

Sourced from `docs/curriculum/ind.pdf` (Individual track) and adapted
into parent-friendly voice consistent with go-padi.com. Founder
should review + refine before merge; this is a starting draft, not
final brand copy.

**Module / lesson counts:** read live from Supabase
(`content_get_groups`, `content_get_modules` RPCs) — do NOT hardcode
in the build. Time estimates assume ~10–15 min per lesson when
delivered 1-on-1; round to nearest 15-min increment in the UI.

### Chapter 1 — Phonological Awareness

> **Hearing the sounds in words.** Before children can read written
> words, they need to hear how spoken words are built from rhymes,
> syllables, and individual sounds. This is the foundation everything
> else rests on.

**Sections**

- **Learning Sensorially** — A gentle introduction to listening
  carefully and noticing sound. *(short — about 5–10 lessons)*
- **Rhyming** — Recognizing and producing rhymes, the first
  phonological awareness skill children master. *(about 8–12
  lessons)*
- **Words & Sentences** — Counting words in a sentence, hearing
  where one word ends and the next begins. *(about 8–12 lessons)*
- **Syllables** — Clapping out, blending, and segmenting syllables.
  *(about 8–12 lessons)*
- **Phonemic Awareness** — Hearing the smallest sounds inside
  syllables. The most advanced phonological skill — required
  before phonics can take hold. Split into four parts: hearing
  initial sounds, final sounds, medial (middle) sounds, and
  combining sounds into words. *(about 25–35 lessons total
  across the four parts)*

### Chapter 2 — Alphabet

> **Letter names, letter shapes, letter order.** Children learn the
> 26 letters of the alphabet through play — tracing, naming,
> matching, and sequencing — before any letter-to-sound work begins.

**Sections** *(this chapter is structured as a single set of
~20 letter-recognition lessons, not nested sub-sections — explore
to see all activities)*

### Chapter 3 — Phonics

> **Linking sounds to letters.** Children connect what they hear (a
> phoneme) to what they see (a grapheme). Letters are taught in six
> carefully ordered color-coded clusters — red, yellow, green,
> orange, blue, purple — three sounds at a time, with each new
> sound built on top of the ones already mastered.

**Sections** *(structured as a sequence of sound introductions,
keyword cards, and three-period review lessons — roughly 30–40
lessons total)*

### Chapter 4 — Reading

> **From sounds to words to sentences.** Children blend the
> phonics they've learned into real words, then into short
> sentences, then into the first small booklets they can read on
> their own. This is where decoding becomes automatic.

**Sections**
- **Reading Exercises** — A graduated series of reading practice
  passages, beginning with closed syllables and building toward
  fluent sentence reading. *(about 20–30 lessons)*

### Chapter 5 — Handwriting

> **Building muscle memory for writing.** Children trace, copy,
> and write letters with proper formation — small enough to write
> easily, large enough to feel the shape. Tactile-kinesthetic work
> reinforces what they've learned about letter shapes in earlier
> chapters.

**Sections** *(structured as a sequence of handwriting exercises,
roughly 25–30 lessons)*

### Chapter 6 — Spelling

> **Hearing a word, writing a word.** Children sound out spoken
> words and write them. Spelling lessons are graduated by
> accumulated mastery — each exercise uses only sounds the child
> has already learned, so spelling becomes a confidence builder
> rather than a stumbling block.

**Sections**
- **Spelling Exercises** — Nine graduated spelling sequences (SE-1
  through SE-9), each introducing a small set of new sounds. The
  child moves to the next exercise when they can sound-spell the
  current set correctly. *(about 30–40 lessons total)*

### Chapter 7 — Vocabulary, Comprehension and Fluency

> **Reading for meaning.** Children build the vocabulary they need
> to understand what they read, develop comprehension strategies,
> and read with the rhythm and expression of fluent readers. This
> is where the foundations come together.

**Sections** *(structured as a sequence of vocabulary, comprehension,
and fluency activities — roughly 15–25 lessons)*

---

### Voice / style notes for review

- Each chapter blurb is 1–2 sentences in plain English. No jargon
  ("phonology," "graphemes," "VAKT," "Orton-Gillingham") in
  parent-facing copy — those terms appear inside lessons but not in
  the marketing-facing overview.
- "Children" framing throughout to match go-padi.com voice. Avoids
  "students" (school-y), "kids" (casual to the point of dismissive),
  or "learners" (corporate).
- Time estimates and lesson counts are **approximations** for the
  Individual track. The Group track (`group.pdf`) has parallel but
  not identical counts — verify before generalizing.
- Quoted blocks (">") render as the chapter card "headline." The
  sentences below render as the section list.
- The Montessori/Orton-Gillingham pedagogical names are recognizable
  to teachers but not parents. They appear in `/teacher/about` and
  inside lessons. They should NOT appear on the gated-preview cards.

### Open content questions for founder review

1. **Voice tone — gentle vs. confident?** Current draft tilts gentle
   ("careful," "play"). Marketing site at go-padi.com may want
   crisper, more confidence-projecting copy. Reconcile.
2. **Section sub-counts.** All counts above are estimates. Once the
   curriculum-pipeline seed is finalized, replace with live DB
   counts via the existing `content_get_*` RPCs (already done by
   logged-in browser; logged-out card just needs to call the same
   RPC).
3. **Chapter 2 Alphabet structure.** TOC shows Alphabet as a single
   chapter without explicit sub-sections — verify whether the seed
   reflects that or whether there are sub-groups (e.g. Uppercase
   vs. Lowercase). Adjust section list accordingly.
4. **Chapter 7 VCF.** Curriculum sub-structure is least clear from
   the TOC. Spot-read `ind.pdf` pages 273–284 to confirm sections
   before final copy.
5. **Privacy note on chapter cards.** Should each card carry a small
   "Login to access full lessons + progress tracking" affordance, or
   just one site-wide "Sign in to start teaching" CTA? Recommend
   one affordance per card to maximize signup paths; verify with
   design before commit.

### Group track verification (2026-05-12)

Read `group.pdf` table of contents (p5) and introduction (pp7–10) to
confirm structural parity with Individual. Findings:

**Structure is identical.** Group track has the same 7 chapters and
the same section subdivisions as Individual:

| Section | Individual | Group |
|---|---|---|
| Phonological Awareness → 5 sections | ✓ | ✓ |
| → Phonemic Awareness 4 sub-sections (a/b/c/d) | ✓ | ✓ |
| Alphabet | ✓ | ✓ |
| Phonics | ✓ | ✓ |
| Reading → Reading Exercises | ✓ | ✓ |
| Handwriting | ✓ | ✓ |
| Spelling → Spelling Exercises | ✓ | ✓ |
| Vocabulary, Comprehension and Fluency | ✓ | ✓ |

Same names. Same order. Same nesting. **The chapter/section overview
copy drafted above applies to BOTH tracks** with no structural
changes needed.

**Lesson counts diverge.** Group has more lessons per chapter
(visible from page offsets — Group chapters start ~10–30 pages later
than Individual equivalents). Per the Group intro, this is because
Group includes "modules that address potential learning issues using
a staggered approach enabling repetition of foundational aspects
(re-teaching) by creating sub-groups." So Group has extra re-teaching
modules that Individual omits. Live DB counts will reflect this
automatically via the `content_get_*` RPCs.

**Group-specific concepts** (do NOT appear in Individual):
- **Three-Phase structure.** The Group year-long program is split
  into three "Phases" of ~3 months each. Each Phase ends with a
  review and student grouping decision.
- **Sub-grouping at phase reviews.** After each Phase review,
  students are grouped by reading ability. Slower sub-groups repeat
  foundational lessons; faster sub-groups continue with new material.
- **End-of-year three-bucket output.** At program end, students sort
  into three groups based on readiness. The Group intro is cut off
  at the page boundary; spot-read p11 to confirm the third bucket,
  but **this is almost certainly the curriculum origin of Padi's
  Ready / Needs Help / Needs Intervention three-signal north star.**

**UX implication for LR-18 build:**

A logged-out visitor hasn't picked a track yet (Individual vs Group).
The overview cards should be **track-agnostic** — same chapter/section
descriptions either way (since structure is identical), with a small
note that lesson counts vary by track: e.g.

> "Roughly 25–35 lessons in Individual (1:1) / 30–45 lessons in
> Group (classroom). Pick a track at signup."

This avoids forcing a track choice before signup AND honestly
represents both delivery models.

**For Padi's 3-signal positioning — confirmed curriculum origin.** The
Group curriculum *literally* ends in three buckets, captured verbatim
from `group.pdf` p10–p11. **Note (2026-05-13): the Padi signal vocab
shifted from clinical to affirmative per LR-26. Updated mapping:**

| Curriculum bucket | Padi signal (post-LR-26) | Notes |
|---|---|---|
| "Students who can proceed to Grade 1 reading" | 🟢 **Accelerating** | On track to read sooner |
| "Students who need to attend a remedial Group Literacy program" | 🟡 **Practicing** | Locking in foundational skills |
| "Students who may need a one-on-one therapy for reading e.g., Sounds in Syllables (SIS) therapy program" | 🔴 **Specialist Track** | Recommended for closer review (SIS is a real ASDEC therapy program) |

So Padi's three-signal north star is not marketing-speak — it's the
**ASDEC curriculum's own end-of-year sorting output**. This is a
strong positioning asset. Marketing copy and chapter overview cards
can ground in this directly:

> "By the end of the year, every child sorts into one of three
> outcomes: ready for first grade, needs more group support, or
> needs one-on-one intervention. Padi tells you which — and gets
> you there."

Also worth noting from the same page: the curriculum acknowledges
"issues like dyslexia or dysgraphia may have to be addressed outside
the program through specialized interventions." That's the
boundary condition for Padi's **Specialist Track** signal — Padi
detects, the parent/teacher escalates to a specialist.

**Group program scale (from `group.pdf` p11 Figure 1):**
- Phase 1: 1–3 months, lessons 1–60
- Phase 2: 3–6 months, lessons 60–120
- Phase 3: 6–9 months, lessons 120–180
- Total: **~180 lessons across 9 months** for the full Group year

Individual track is shorter (no re-teaching modules); estimate ~140
lessons but verify against the seed.

**UX implication update.** With concrete lesson counts (~140 Individual,
~180 Group) and ~9-month program length confirmed, the logged-out
overview cards can say something tangible:

> *"~140 lessons (Individual, 1:1) or ~180 lessons (classroom Group)
> across a 9-month program. Three phases, three outcomes: ready for
> first grade, needs more support, or needs targeted intervention."*

That's marketing copy that doesn't expose lesson content but DOES
communicate the program's shape, scale, and outcome promise.

**Files referenced this verification:**
- `docs/curriculum/ind.pdf` pp 5–13 (TOC + Phonological Awareness intro)
- `docs/curriculum/ind.pdf` pp 145–192 (Alphabet, Phonics, Reading sub-sections)
- `docs/curriculum/group.pdf` pp 5–11 (TOC + Introduction + program figure)

**All Group-track open questions now closed.**
- Files to edit:
  - `app/teacher/curriculum/page.tsx` (logged-out branch)
  - `app/teacher/curriculum/[chapter]/page.tsx` (gating)
  - `app/teacher/curriculum/[chapter]/[group]/page.tsx` (gating)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
    (gating)
- Curriculum source: `docs/curriculum/ind.pdf` + `group.pdf`. PM/Design
  should review the overview copy before commit — this is brand voice.
- Complexity M (S for the gating, M for the overview UI + copy
  authoring).
- Should ship same batch as LR-17 (both reshape logged-out experience).
