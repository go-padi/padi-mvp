---
id: LR-08
title: "[Privacy] Demo-data exposure review across all surfaces"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
---

### Goal

Audit every authenticated surface for whether showing demo data to
logged-out users is the right preview behavior, or whether some
surfaces should bounce / hide / show a pure marketing pitch instead.

### Background

The current pattern across the app: when a user is logged out,
authenticated surfaces (`/teacher/*`, `/students`, `/start-teaching`,
etc.) render with demo data and a yellow "Demo data" badge plus a
banner like *"Preview mode — sign in to unlock workspace features."*

Demo data files live in `lib/demo/`:
- `demoStudents.ts` — fake student names
- `demoGroups.ts` — fake groups
- `demoCurriculum.ts` — fake/preview curriculum content
- `demoAssessments.ts` — fake assessment statuses (and this
  surface is being retired per LR-03 anyway)
- `demoTeacherData.ts` — fake teacher dashboard cards

This is a deliberate "let prospects browse" design. The question for
launch: **does showing fake children's names to a prospect on
arrival serve the activation north star, or does it confuse them?**

Possible findings (need to be confirmed by walking each surface):

1. **Some surfaces benefit from preview.** Curriculum browsing
   probably does — a prospect can see "what would I be teaching"
   without signing up.

2. **Some surfaces are misleading in preview mode.** Roster /
   student-list pages with fake children's names can read as "this
   is your data already" if the demo-data badge isn't loud enough.
   Worse, the names might be culturally specific in ways that don't
   match a prospect's expectations.

3. **Some surfaces should bounce to `/`.** Action-only surfaces
   (e.g. an "Add Student" modal that doesn't make sense without an
   account) might be better gated rather than previewed.

4. **The preview banner copy varies.** Different surfaces use
   slightly different language ("Preview mode," "Demo data,"
   "Read-only preview"). Inconsistent voice — should be one phrase.

### Requirements

1. **Walk every primary surface logged-out** and document the
   experience:
   - `/`
   - `/teacher`
   - `/teacher/curriculum` (and child routes)
   - `/teacher/grouping`
   - `/start-teaching`
   - `/students`
   - `/welcome/role` (should redirect logged-out users)
   For each: what does the user see? Demo data? A marketing pitch?
   A redirect? Note the behavior in a small markdown table.

2. **Decide per-surface** whether to keep preview, change it, or
   bounce:
   - **Keep preview**: `/teacher/curriculum` (helps prospects see
     curriculum). `/teacher/about` (it's static method-explanation).
   - **Change**: Anywhere showing fake student NAMES — replace with
     anonymized labels ("Student A", "Student B") or use stylized
     placeholder names that are obviously fake (Spider-Man, Frozen
     characters — easier for prospects to mentally bucket as demo).
   - **Bounce**: action-only flows that don't make sense without
     auth — e.g. the "Add Student" modal trigger should just open
     the SignIn modal instead.
   The exact decision per-surface should be in the PR.

3. **Standardize the preview banner copy** across all surfaces that
   keep preview. Single string in `roleCopy.ts` (or a new
   `lib/copy/previewCopy.ts`). One canonical phrase.

4. **Verify no real PII is in the demo data files.** Spot-check
   `lib/demo/*.ts` for any accidentally-real names, emails, or
   identifiers. (Unlikely but worth one grep.)

### Acceptance Criteria

**Happy Path**
Given a logged-out prospect lands on any authenticated surface
When the page renders
Then they see one of: real preview content, anonymized
preview content, or a redirect to sign in / home
And no fake-looking real data (real-shaped names with fake-shape behavior)

**Anonymized data check**
Given any surface that lists students or groups in preview mode
When the user views it
Then student names are obviously placeholder (e.g. "Student A" or
clearly-fictional names)
And no name reads as a real first-grader's name they might know

**Banner consistency**
Given any surface in preview mode
When it shows the preview banner
Then the language matches across all surfaces (one canonical phrase)

**Auth state**
Given a user signs in mid-browse
When they're returned to the surface
Then demo data is replaced with their real data (no flash of demo)

**Empty state**
Given a logged-in user with no real data yet (just signed up)
When they view a surface
Then they see a real empty state, not a fallback to demo data

### Out of Scope

- Building a marketing-quality landing experience (separate
  marketing-site work).
- Internationalizing demo names (not needed for first cohort).
- Changing the demo data structure to match real production data
  more closely.

### Notes

- This is largely AUDIT work plus tactical edits, not a single
  big code change. Output is a small markdown table + a handful
  of commits per surface.
- Recommended sequencing: do this AFTER LR-04 (orphans gone) so
  the surface count is smaller.
- ~Half-day to a full day depending on how many surfaces need
  changes.
