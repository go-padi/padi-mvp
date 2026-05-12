---
id: LR-18
title: "[Curriculum] Replace logged-out curriculum browser with overview cards — gate full content behind login"
type: story
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-11
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
