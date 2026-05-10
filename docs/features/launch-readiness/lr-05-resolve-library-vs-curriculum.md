---
id: LR-05
title: "[Routes] Resolve `/library` vs `/teacher/curriculum` redundancy"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
related_audit: open question — "is the curriculum browser the right shape?" in instructional-design/SKILL.md
---

### Goal

Pick one canonical curriculum browser and retire the other, so the
app has a single source of truth for "where the lessons live."

### Background

Two surfaces today both browse the same `module` rows from Supabase:

- **`/library`** (`app/library/page.tsx`) — a flat list with
  domain / section / search filters. Renders `<ModuleCard>` for
  each row.
- **`/teacher/curriculum`** with nested `[chapter]/[group]/[module]`
  routes — hierarchical browser matching the curriculum's actual
  structure (chapter → group → module).

Two browsers for the same content is confusing for users (which is
the "real" curriculum?) and double-work for the team (every
curriculum-related ticket has to consider both surfaces).

The instructional-design lens has an OPEN question on this:
*"Is the curriculum browser the right shape? Padi's library
currently presents content as a hierarchical browser. Montessori-aligned
would be a prepared-environment shelf the teacher curates, not a
Netflix-style catalog."* That's a deeper question; this ticket
only resolves the IMMEDIATE redundancy. The deeper question
(prepared shelf vs catalog) is deferred.

### Requirements

1. **Decide which surface to keep.** Recommendation: keep
   `/teacher/curriculum` because:
   - It matches the actual structure of the curriculum (chapter →
     group → module per `ind.pdf`).
   - It's authenticated-aware (lives under `/teacher` which has
     dashboard layout).
   - It's where lessons are launched from in the existing flow.
   `/library` is older and simpler but doesn't match curriculum
   structure.
2. **Delete `app/library/page.tsx`** OR convert it to a redirect
   to `/teacher/curriculum`. Recommend redirect, since "library"
   may be a more public-friendly URL teachers might bookmark or
   share.
3. **Decide what happens to the search/filter UX from `/library`.**
   The hierarchical browser doesn't have search. Two paths:
   - Add a search box to `/teacher/curriculum` that searches across
     all modules and links to the canonical `[chapter]/[group]/[module]`
     URL when clicked.
   - Defer search to a future ticket; ship redundancy resolution
     without search for v1.
   Pick the second for v1 unless teachers explicitly tell you they
   need search to find modules. The hierarchical structure is
   small enough (~7 chapters in the K-Reading curriculum) to
   browse without search.
4. **Search the codebase** for any link to `/library` and either
   update to `/teacher/curriculum` or rely on the redirect.
5. **Update `<ModuleCard>` if it's only used by `/library`.** If
   it's also used by `/teacher/curriculum`, leave it alone. If
   only `/library`, decide whether to preserve it for future use
   or delete.

### Acceptance Criteria

**Happy Path**
Given a user navigates to `/library`
When the route resolves
Then they are redirected to `/teacher/curriculum`
And the hierarchical browser appears

**Happy Path (curriculum browse)**
Given a logged-in teacher on `/teacher/curriculum`
When they navigate down chapter → group → module
Then they reach a lesson page and can complete lessons
And no functionality is lost relative to what `/library` offered

**Empty State**
Given the database has zero modules (e.g. seed not run)
When `/teacher/curriculum` loads
Then an empty state explains the curriculum hasn't loaded and
suggests running the seed (or contacting support if running
in production)

**Error State**
Given the Supabase query fails
When the page renders
Then an error state is shown (consistent with rest of app's
error patterns)

**Auth State**
Given a logged-out user visits `/library` or `/teacher/curriculum`
When the redirect runs
Then they land on `/teacher/curriculum` with preview-mode behavior
(per existing pattern)

**Mobile**
The hierarchical browser must work at 375×667 — confirm the
chapter/group/module nav is finger-friendly.

### Out of Scope

- The deeper instructional-design question (catalog browser vs
  prepared-environment shelf). That requires a separate
  curriculum-shape audit and is post-launch.
- Adding search to `/teacher/curriculum` (deferred per requirement 3).
- Ranking / recommending modules based on student readiness
  (separate ML readiness epic).

### Notes

- File to redirect: `app/library/page.tsx` → either delete or replace
  with `redirect('/teacher/curriculum')`
- File to verify: `components/ModuleCard.tsx` — check usage
- Search inbound links: `grep -r '"/library"\|href="/library"' app components lib`
- This is M complexity because it touches two routes plus possibly
  the ModuleCard component, plus the question of search UX. Should
  ship in <half a day.
