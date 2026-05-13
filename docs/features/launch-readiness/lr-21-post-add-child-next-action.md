---
id: LR-21
title: "[Onboarding] Post-add-child clear next-action — drop parent into first recommended lesson"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-11
created_by: parent-walkthrough-2026-05-11
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-11-parent.md
related: LR-11
---

### Goal

When a parent finishes adding their first child, the next state
should make the very next action unambiguous: "Start <child>'s first
lesson." Today, the parent lands in the full curriculum browser
("197 modules across 7 chapters") and bounces off because it's
overwhelming.

### Background

From the parent walkthrough:

> "Add child. Let's do Maya. Maya. I hear Do I need to see the full
> curriculum? Go to Teacher Dashboard. Great, I see the full
> curriculum. I don't know what the hell to do with it. This is
> overwhelming. Like, I don't know what to do with it... Okay,
> great. What else am I doing? Like, what else happens here? I
> don't know. Home. Start a lesson, that's really helpful. Start
> teaching."

The parent had to wander back to Home to find the right CTA. The
right CTA should be on the post-add-child page already.

This pairs with LR-11 ("Surface curriculum sequencing — make
'next module' obvious") but differs in scope. LR-11 is general
(any-user, any-state). LR-21 is parent-onboarding-specific: it
covers the moment right after `students.insert()` succeeds for the
parent's first child.

### Requirements

1. **Define "recommended first lesson"** for a brand-new student.
   Per the ASDEC K-Reading Kickstart curriculum
   (`docs/curriculum/ind.pdf`), the systematic starting point is
   **Section 1: Phonological Awareness → Listening Skills → LS-1**
   (or whatever the first module in the Individual track is).
   Confirm with the reading specialist before scoping. For Group
   track, equivalent first module from `group.pdf`.
2. **Update the post-add-child redirect / landing.** After a parent
   successfully creates their first child, instead of dropping into
   `/teacher/curriculum`, they land on a focused "Maya's first
   lesson is ready" screen with:
   - Big primary CTA: "Start Maya's first lesson" → routes to the
     LS-1 (or equivalent) lesson page
   - Secondary CTA: "Explore the curriculum" → routes to
     `/teacher/curriculum` for self-directed browsing
   - Brief one-liner explaining WHY this is the recommended first
     lesson (e.g. "We start with listening skills — the foundation
     for everything else")
3. **For NTH children (not the first):** behavior can be the same
   (recommend first lesson) — parents adding a second child probably
   want the same start point. Or keep the current redirect if it
   works for second children. Decide based on what feels less
   prescriptive.
4. **Teacher track equivalent.** Teachers adding their first student
   should get the same affordance — this isn't parent-only, but
   parents are the primary user it serves (per the brief, parents
   only ever have 1-2 children).
5. **Don't lock down navigation.** Parent who clicks "Explore the
   curriculum" should still be able to drill in and start any module
   — the recommended-first is a default, not a constraint. Respects
   the "child-led pace" Montessori principle.

### Acceptance Criteria

**Happy Path (parent, first child)**
Given a parent who just clicked "Add child" and submitted "Maya"
When the form successfully creates the student record
Then they land on a focused landing page that prominently shows
"Start Maya's first lesson" as the primary CTA
And the secondary CTA "Explore the curriculum" is visible but
de-emphasized
And the page reads (something like) "We start with listening skills
— the foundation for everything else"

**Happy Path (start lesson)**
Given the parent clicks "Start Maya's first lesson"
When the navigation completes
Then they land on the LS-1 module page (or whatever the curriculum-
recommended first module is)
And they can complete the lesson and mark it complete (per existing
lesson-completion flow)

**Happy Path (explore curriculum)**
Given the parent clicks "Explore the curriculum"
When the navigation completes
Then they land on `/teacher/curriculum` (existing behavior)
And no regression to the curriculum browse experience

**Empty State (curriculum not loaded)**
Given the database has zero modules
When the post-add-child landing renders
Then a graceful fallback shows "Curriculum loading" — never an
unstyled error

**Error State (student creation succeeded but recommendation lookup
fails)**
Given the student record was created but the recommended-first-
module lookup throws
When the landing renders
Then the page degrades to "Maya was added. Browse the curriculum
to pick a starting lesson." with a single curriculum CTA
And the student record is preserved (no data loss)

**Auth State**
Logged-out users can't reach this surface (it requires an
authenticated session + a just-created student).

**Mobile (375×667)**
Primary CTA above the fold. Secondary CTA tappable. No horizontal
scroll.

### Out of Scope

- Building a full onboarding wizard (multiple steps, role pick,
  preferences). Keep this surgical.
- Recommending modules based on real readiness assessment (ML
  classifier — that's `ml-readiness-classifier/` epic territory).
- Setting up grouping during onboarding (Group track is separate).
- Adjusting the recommended-first based on child age (cosmetic
  later; LS-1 is curriculum-aligned for the full ages 3–7 range).

### Notes

- Files likely involved:
  - `app/students/page.tsx` (or wherever the add-child form lives)
  - The post-submit redirect logic in the student-creation handler
  - New page or component: `app/students/[studentId]/start/page.tsx`
    or similar
- Curriculum source: `docs/curriculum/ind.pdf` Section 1 for the
  Individual track first lesson; `group.pdf` Section 1 for Group.
- Complexity M — needs the new landing page, the recommended-first
  logic, and the redirect change.
- Pairs naturally with **LR-11** ("Surface curriculum sequencing")
  — both are about "what's next." Could ship in the same BuildLoop
  iteration to keep the UX consistent.
- Activation north-star direct hit: a parent who can't find their
  first lesson never reaches "lesson complete" — and never produces
  the 3-signal data Padi exists to produce.
