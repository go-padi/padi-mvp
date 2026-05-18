---
id: KAN-56
title: "[UX] Contextual Add buttons on /teacher/grouping — distinct Add Group vs Add Student affordances"
type: task
status: backlog
priority: medium
feature: start-teaching-flow
launch_blocker: false
jira_ref: https://go-padi.atlassian.net/browse/KAN-56
updated: 2026-05-18
authored_acs_by: cc-author-pass-2026-05-18
might_require_migration: false
related: KAN-64 (group membership display), LR-21b (add-student flow shipped)
---

### Goal

On `/teacher/grouping` (the page that shows both groups and
individual students), surface **two distinct Add affordances**:
"Add group" and "Add student" — each scoped to the relevant
section. Today the page either has no Add CTAs visible, or has a
single generic CTA that doesn't make the action obvious.

A teacher who wants to add a NEW group shouldn't have to leave
the grouping page to find the right form. Same for adding a new
student to an existing group.

### Background

`/teacher/grouping` already loads both groups + students data
(via `useGroupingProgressData`). It renders:

- **Groups section** — list of groups with student counts and
  per-group progress
- **Individual students section** — students not in any group
  (or all individual-track students)

Today (per `app/teacher/grouping/page.tsx`):
- The page uses `TeachingModeToggle` and conditional
  `showGroupMode` / `showStudentMode` flags
- An `EmptyStateStartTeachingCTA` fires when there are zero
  students
- There's no inline "Add group" / "Add student" CTA visible on
  each section

The student-add flow exists at `/students` (LR-21b shipped the
post-add-child redirect). Group creation flow likely exists
elsewhere or via Supabase admin — verify before scoping.

### Requirements

1. **Audit existing add flows.** Before authoring UI changes,
   verify in code:
   - Does a "create group" route exist? (Search for `/groups/new`,
     `addGroup`, `groups.insert`)
   - Does the existing `/students` flow remain the canonical
     add-student entry? (Yes per LR-21b.)
   - If no create-group flow exists, this ticket adds the CTA but
     punts the actual flow to a follow-up (separate ticket — note
     in scope).

2. **Add "Add group" CTA** to the Groups section header on
   `/teacher/grouping`. Visible whenever `showGroupMode === true`
   and the user is logged in. CTA position: top-right of the
   Groups section heading.
   - Label: `Add group`
   - Target: if a create-group route exists, link there. If not,
     dispatch a `padi-open-add-group` event for a follow-up to
     wire OR link to a TBD route with a clear "Coming soon"
     fallback (decide in build phase based on what exists).

3. **Add "Add student" CTA** to the Individual Students section
   header. Visible whenever `showStudentMode === true` and the
   user is logged in. CTA position: top-right of the section
   heading.
   - Label: `Add student`
   - Target: `/students` (the existing add-student page from
     LR-21b)

4. **Visual treatment.** Both CTAs use the existing `btn` class
   (no `btn-primary` — secondary visual weight; the page is for
   browsing, adding is a secondary action). Right-align within the
   section header row using `flex items-center justify-between`.

5. **Don't break the empty state.** `EmptyStateStartTeachingCTA`
   already fires when there are zero students AND
   `dataMode === 'live'`. Keep that empty state separate from the
   new contextual CTAs — when there are zero students, the empty
   state takes precedence and the per-section Add CTAs don't need
   to render (a follow-up could show "Add your first student" in
   the empty state, but that's KAN-21 territory, not this ticket).

6. **Logged-out behavior** — preserve the existing locked-state
   that fires when `!isLoggedIn`. No Add CTAs render in that
   state.

7. **DO NOT touch:**
   - The `useGroupingProgressData` hook
   - Demo data path
   - TeachingModeToggle behavior
   - The 3-signal display on student cards
   - Other routes

### Acceptance Criteria

**Happy path — logged-in user, has both groups and students**
- Given a logged-in user on `/teacher/grouping` with at least one
  group and one student
- When the page renders
- Then the Groups section header shows an "Add group" button
  right-aligned
- And the Individual Students section header shows an "Add
  student" button right-aligned
- And clicking "Add student" navigates to `/students` (existing
  LR-21b add flow)

**Happy path — group-only mode**
- Given the user toggles TeachingModeToggle to "group" mode
- When the page renders
- Then only the Groups section is visible
- And only the "Add group" CTA is visible
- And the "Add student" CTA is NOT rendered

**Happy path — individual-only mode**
- Mirror: only "Add student" renders

**Empty state — no students at all**
- Given a logged-in user with zero students in their tenant
- When the page renders
- Then the existing `EmptyStateStartTeachingCTA` renders
- And the per-section Add CTAs do NOT render (no clutter; the
  empty state handles the primary action)

**Auth state — logged out**
- Given a logged-out visitor on `/teacher/grouping`
- When the page renders
- Then the existing locked-state / preview banner renders
- And NO Add CTAs are visible

**Loading state**
- During `isLoading === true` from `useGroupingProgressData`
- Then the existing loading state renders
- And the new CTAs are hidden until data resolves

**Error state**
- Given `useGroupingProgressData` returns `error !== null`
- Then the existing error state renders
- And the new CTAs are hidden (don't pretend the page works when
  data load failed)

**Mobile (375 × 667)**
- Section header with title + Add CTA fits on a single row
- If the section title is long, the Add CTA wraps to the next line
  without breaking layout (use `flex-wrap` if needed)
- CTAs tappable (`btn` class meets 44 × 44 target)

**Lint + typecheck**
- `pnpm lint` exit 0
- `pnpm tsc --noEmit` exit 0
- `pnpm build` exit 0

**No new console errors**

### Out of Scope

- Building a create-group form / route (separate ticket — this
  one only adds the CTA; if no route exists, the CTA can no-op
  or use a placeholder href documented in build notes)
- Inline-add UX (i.e. expanding a form inline rather than
  navigating to `/students`) — separate UX call
- Adding student-to-group assignment from this CTA (KAN-64
  related)
- Authoring the actual student-create or group-create database
  logic
- Notifications / toasts after add
- Mobile-specific Add affordances (FAB pattern, swipe gestures)
- Tests beyond build/lint/tsc

### Notes

- **Single file:** `app/teacher/grouping/page.tsx`
- **No new imports** likely needed beyond `Link` (already used)
- **Complexity S** — ~10 lines of JSX added inside the section
  headers
- **Build phase TODO** — verify whether a `/groups/new` or
  equivalent route exists for the Add-group CTA target. If not,
  document the TBD in `build-summary.md` and ship the CTA pointing
  at a `# TODO` href that a future ticket wires up.
- Original Jira: https://go-padi.atlassian.net/browse/KAN-56
