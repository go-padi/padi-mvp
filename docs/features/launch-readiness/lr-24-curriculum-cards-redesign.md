---
id: LR-24
title: "[Curriculum] Redesign curriculum cards — replace catalog browser with child-centered journey view"
type: story
status: done
priority: medium
feature: launch-readiness
launch_blocker: false
created: 2026-05-13
created_by: design-review-2026-05-13
source: founder request — "the cards for the curriculum could be prettier and more intuitive... seeing a large number of lessons is overwhelming"
related: assessments-grouping/instructional-redundancy-audit.md, LR-11, LR-18
---

### Goal

Replace the current chapter-accordion catalog browser at
`/teacher/curriculum` with a child-centered journey view that:

1. Leads with "where is Maya / where does Maya go next"
2. Groups the 7 chapters into the curriculum's own 3 phases
3. Shows progress visually (rings, bars) not numerically
4. Reduces visual density so the page doesn't overwhelm

This is **not a fix to broken behavior** — the current implementation
works correctly. It's a **redesign** that makes the curriculum feel
like a navigable journey rather than a 197-item catalog.

### Background

The current browser at `/teacher/curriculum` renders a flat accordion:

- 7 chapter cards collapsed
- Each chapter expands to N group cards with "N modules" counters
- Each group expands to N module rows
- Worst case: ~197 modules visible after full expansion

Founder's read after parent walkthrough (2026-05-13):

> "The cards for the curriculum could be prettier and more intuitive...
> seeing a large number of lessons is overwhelming."

Related findings already on the board:

- **Instructional-redundancy audit** (`docs/features/assessments-grouping/instructional-redundancy-audit.md`):
  *"Padi's library currently presents content as a hierarchical browser.
  Montessori-aligned would be a prepared-environment shelf the teacher
  curates, not a Netflix-style catalog."*
- **LR-11** (Surface curriculum sequencing): related, more narrow —
  focuses on "make next module obvious." LR-24 is the bigger redesign
  LR-11 could roll into.
- **LR-18** (Logged-out curriculum gating): chapter overview cards for
  logged-out visitors. LR-24 should adopt a consistent visual language
  so logged-out preview and logged-in browser feel like the same product.

### Design directions to explore

**Direction A — Phase-first, child-second**
- Top-level: 3 phase cards (Phase 1 / 2 / 3, per `group.pdf` p11)
- Each phase card shows: phase number, ~60 lessons, estimated months,
  child's % progress through this phase, recommended-next CTA
- Drilling into a phase reveals the chapters within it (still
  accordion or grid)
- **Pros:** matches curriculum's own structure; reduces top-level
  from 7 to 3; maps directly to 3-signal output
- **Cons:** parents may not know what a "phase" is yet — needs intro copy

**Direction B — "Maya's path" + secondary catalog**
- Hero section at top: "Maya's next lesson" — single recommended-next
  module, big start CTA, time estimate, 1-line "why this one"
- Below: collapsible "Explore the full curriculum" with the existing
  chapter accordion (preserved for teachers who want it)
- **Pros:** answers the dominant question first; preserves catalog
  for power users
- **Cons:** the "explore" section is still the overwhelming list — doesn't
  fully solve the density problem

**Direction C — Hybrid (recommended)**
- Hero: "Maya's next lesson" (per Direction B)
- Middle: 3 phase cards (per Direction A)
- Each phase card has progress ring + "X of Y completed" + locked
  state for future phases
- Drilling into a phase: chapter overview cards (matching LR-18's
  logged-out design — visual consistency across auth states)
- Drilling into a chapter: section list with progress per section
- Drilling into a section: module list (the existing detail view)
- **Pros:** progressive disclosure; child-first; curriculum-structure-
  faithful; visual consistency with LR-18
- **Cons:** more screens to design; bigger build

### Recommended fix direction

**Direction C (Hybrid)** with these design tokens:

- **Hero card** uses `rounded-3xl` (larger than other cards) + a
  subtle accent color to signal "primary action"
- **Phase cards** use the curriculum's color palette as accents
  (red / yellow / green for Phase 1/2/3, echoing the phonics
  color coding)
- **Progress rings** per phase (60–90px), animated on load
- **Locked state** uses 40% opacity + a small lock icon, with copy
  *"Unlocks after [previous phase] completes"*
- **Time framing** on every card: *"About 10 min per lesson"*

### Card content structure (added 2026-05-13)

Each phase card AND each chapter card should answer three questions
up front, on the surface — no expand-to-see required. Source from
`docs/curriculum/ind.pdf` chapter intros and `group.pdf` p7–11.

The three questions, in order:

1. **What is the child DOING?** (active-voice, observable, 1 sentence)
2. **What will they LEARN?** (the skill that emerges, 1 sentence)
3. **What will this TELL you?** (the signal / outcome this produces, 1 sentence — directly ties to Ready / Needs Help / Needs Intervention)

Visual structure per card:

```
┌─ Phonological Awareness ─────────────────────┐
│  [progress ring 60px]   ●  ●  ●  ○  ○  ○  ○  │
│                                              │
│  Doing:  Listening for sounds in words —     │
│          rhyming games, clapping syllables,  │
│          matching beginning sounds.          │
│  Learn:  How language is built from rhymes,  │
│          syllables, and individual sounds.   │
│  Tells:  Whether your child has the          │
│          foundation they need before phonics │
│          can take hold.                      │
│                                              │
│  ~25–35 lessons · about 10 min each          │
│                                              │
│  [Continue Maya's lesson →]                  │
└──────────────────────────────────────────────┘
```

### Authored card content (sourced from curriculum, ready for design)

**Phase 1 — Hearing & Recognizing** (Chapters 1 + 2: Phonological Awareness, Alphabet)
- **Doing:** Hearing rhymes, clapping syllables, tracing letters, and learning their names.
- **Learn:** How language is built from sound, and how each of the 26 letters looks and sounds.
- **Tells:** Whether your child is ready to start connecting sounds to letters — the foundation everything else rests on.

**Phase 2 — Connecting Sound to Print** (Chapter 3: Phonics)
- **Doing:** Matching letters to the sounds they make, working through six color-coded clusters of letters, three sounds at a time.
- **Learn:** That every letter (or letter pair) represents a sound, and how to blend them — the heart of decoding.
- **Tells:** Whether your child is **Accelerating**, **Practicing**, or on the **Specialist Track** — this is where children begin to sort by reading aptitude.

**Phase 3 — Reading, Writing, Meaning** (Chapters 4-7: Reading, Handwriting, Spelling, VCF)
- **Doing:** Reading words and short sentences, writing letters with proper formation, spelling by sound, building vocabulary.
- **Learn:** How to read fluently for meaning, write what they hear, and understand what they read.
- **Tells:** Whether your child is on track for first grade (**Accelerating**), still building foundational skills (**Practicing**), or recommended for one-on-one specialist support (**Specialist Track**).

---

**Chapter-level card content** (used inside each phase):

**Chapter 1 — Phonological Awareness**
- **Doing:** Listening for sounds in words — rhyming games, clapping syllables, matching beginning sounds.
- **Learn:** How language is built from rhymes, syllables, and individual sounds.
- **Tells:** Whether your child has the foundation they need before phonics can take hold. (*Research shows this is the single strongest predictor of early reading success.*)

**Chapter 2 — Alphabet**
- **Doing:** Tracing letter shapes, naming letters, playing alphabet games for sequence and recognition.
- **Learn:** All 26 letters by name, shape, and order — and the muscle memory needed for writing.
- **Tells:** Whether your child can recognize and recall every letter fluently, ready to attach sounds to them next.

**Chapter 3 — Phonics**
- **Doing:** Tracing letters while saying their sounds, watching their mouth in a mirror, matching letters to keyword cards.
- **Learn:** That letters represent sounds, and how to blend those sounds into words — three new sounds at a time.
- **Tells:** Whether decoding is starting to click — this is the chapter where reading aptitude becomes visible.

**Chapter 4 — Reading**
- **Doing:** Blending sounds into words, reading short sentences, then small booklets.
- **Learn:** How to decode automatically — moving from sounding out each letter to reading words at a glance.
- **Tells:** Whether your child is crossing from "learning to read" to "reading to learn."

**Chapter 5 — Handwriting**
- **Doing:** Tracing, copying, and writing letters with proper formation using tactile-kinesthetic exercises.
- **Learn:** How to form each letter precisely — the physical foundation for writing fluency.
- **Tells:** Whether motor skills are developing in step with reading skills (some children read before they can write; some the reverse).

**Chapter 6 — Spelling**
- **Doing:** Hearing a spoken word and writing it — working through nine graduated spelling exercises by accumulated mastery.
- **Learn:** How to encode words from sound — the reverse of reading. Moving to the next exercise is the assessment moment.
- **Tells:** Whether your child can apply phonics knowledge to produce written words confidently.

**Chapter 7 — Vocabulary, Comprehension and Fluency**
- **Doing:** Building word knowledge, practicing comprehension strategies, and reading aloud with expression.
- **Learn:** How to read for meaning — not just to decode, but to understand.
- **Tells:** Whether your child is **Accelerating** toward Grade 1, still **Practicing** foundational skills, or on the **Specialist Track** for closer review. This is where the three-signal outcome resolves.

### Voice rules for card content

- **Address the parent / teacher directly.** "Your child" works for
  parents; "the child" for teachers. Use `rolePhrase()` to switch.
- **Active, observable verbs only** in the Doing line. *Listening,
  clapping, tracing, blending* — not *learns to listen, develops
  awareness.*
- **The Tells line is a SIGNAL, not a feature.** It should always
  imply what the adult will observe or decide. *"Whether your child
  is ready for Grade 1"* — not *"This chapter prepares for Grade 1."*
- **No jargon in card-level copy.** Specifically avoid: *phoneme,
  grapheme, VAKT, Orton-Gillingham, Montessori, decoding,
  morphology, MSLE.* Use plain English. Module-level copy can use
  jargon for teachers; card-level is the gateway.
- **Length cap:** each line ~15–20 words. Total card content body
  ~50–70 words. If a line runs longer, cut.
- **The 3-signal language ("Ready / Needs Help / Needs
  Intervention") appears explicitly on Phase 2 and Phase 3 cards and
  on Chapter 7.** Not on earlier cards — too early in the journey
  for that language to mean anything to the parent.

### Requirements

1. **Spec the three screens** before any code:
   - Curriculum landing (hero + 3 phase cards)
   - Phase detail (chapter overview cards within the phase)
   - Chapter detail (section list, existing)
2. **Reuse the LR-18 chapter overview card component.** LR-18 ships
   the logged-out version of chapter overview cards; LR-24 uses the
   same component for the logged-in version with progress overlays
   added.
3. **Compute "recommended next module"** per student. Logic: highest
   `display_order` completed module's successor. Confirm with
   reading specialist that this matches curriculum-correct sequencing
   (per the assessments-grouping audit, "movement to the next exercise
   IS the assessment moment" — so successor logic should respect
   teacher's prior assessment notes if any).
4. **Add phase → chapter mapping** to the database (or to
   `lib/curriculum/`). The 7 chapters need explicit assignment to
   Phase 1 / 2 / 3 buckets per `group.pdf`. Source from the curriculum
   author.
5. **Preserve existing routes.** `/teacher/curriculum/[chapter]/[group]/[module]`
   continues to work — this redesign sits ON TOP of the existing routes,
   it doesn't replace them.
6. **Mobile-first.** Phase cards must work at 375×667 — 3 cards
   stacked vertically with progress ring + hero card above them
   should fit above-the-fold.
7. **Logged-out parity.** When LR-18 ships, the logged-out chapter
   overview cards should visually match what logged-in users see in
   the chapter-detail screen here.

### Acceptance Criteria

**Happy Path (parent with one student)**
Given a logged-in parent with student Maya who has completed 5 lessons
When they navigate to `/teacher/curriculum`
Then they see a hero card "Maya's next lesson — <module name>" with
a big Start CTA above the fold
And below, 3 phase cards showing Phase 1 / 2 / 3 with progress rings
And clicking a phase card drills into chapter overview cards
And clicking a chapter drills into section list (existing)
And clicking a module starts the lesson (existing)

**Happy Path (teacher with multiple students)**
Given a teacher with 5 students at different progress points
When they navigate to `/teacher/curriculum`
Then the hero shows "Continue teaching" linking to roster view (or
similar — TBD with design)
And the phase cards aggregate progress somehow (TBD)

**Empty State (new parent, no students)**
Given a parent with zero students
When they navigate to `/teacher/curriculum`
Then they see the 3 phase overview cards (no hero — no student to
recommend for)
And a prominent "Add a child" CTA where the hero would be

**Locked State**
Given a child in Phase 1
When the curriculum page renders
Then Phases 2 and 3 are visible but rendered at reduced opacity
with a lock icon and "Unlocks after Phase 1 completes" copy

**Mobile (375×667)**
- Hero card fits above the fold
- 3 phase cards stack vertically
- No horizontal scroll
- Touch targets ≥ 44px

### Out of Scope

- Restructuring the database (chapters/groups/modules tables stay as-is)
- Changing the lesson player itself
- Building a "schedule lessons by date" calendar (separate feature)
- Replacing module codes everywhere (just hide them from parent-facing
  surfaces; reading specialists still see them in the lesson page
  metadata)
- Real-time progress sync across multiple devices
- Group-mode UI variations for classroom teachers (separate ticket
  if needed — keep this parent-focused for v1)

### Notes

- **Design ticket, not eng ticket.** This needs design exploration
  before implementation. Recommend: padi-design produces 2–3 Figma
  mockups based on Direction C; founder picks; then PM splits into
  build-ready sub-tickets (LR-24a, LR-24b, etc.) for BuildLoop.
- **Priority `medium` deliberately.** Not blocking launch — current
  catalog works, just isn't elegant. After tooling fixes (BLDTD-01..04)
  and migration-required tickets (LR-09 remainder, LR-10, etc.), this
  is the next quality-of-experience uplift.
- **Curriculum source:** `docs/curriculum/ind.pdf` for module sequencing,
  `docs/curriculum/group.pdf` p11 for the phase structure.
- **Color palette source:** the phonics chapter (`ind.pdf` p187) uses
  red/yellow/green/orange/blue/purple for letter clusters. Reuse that
  palette for phase accents to create visual continuity between the
  curriculum's own conventions and Padi's UI.
- **Files likely involved:**
  - `app/teacher/curriculum/page.tsx` (rewrite of the top-level view)
  - `components/ChapterOverviewCard.tsx` (new, shared with LR-18)
  - `components/PhaseCard.tsx` (new)
  - `components/RecommendedNextCard.tsx` (new — the hero)
  - `lib/curriculum/phases.ts` (new — phase→chapter mapping)
  - `lib/curriculum/recommendation.ts` (new — "next module" logic)
- **Complexity:** L (large). Likely splits into 3–4 BuildLoop iterations:
  - LR-24a: phase mapping + data layer
  - LR-24b: phase cards + locked states
  - LR-24c: hero "next lesson" card + recommendation logic
  - LR-24d: chapter detail screen + parity with LR-18 visuals
