---
id: LR-03
title: "[Routes] Retire `/teacher/assessments` route per redundancy audit"
type: story
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
depends_on: instructional-redundancy-audit-2026-05-09
---

### Goal

Remove the `/teacher/assessments` route from the app per the prior
instructional-redundancy audit's REVISE verdict. Redirect inbound
traffic to `/teacher/start-teaching` (the activation surface where
roster glance belongs).

### Background

`docs/features/assessments-grouping/instructional-redundancy-audit.md`
(2026-05-09) verdict: **REVISE — strong redundancy.** The standalone
assessment page duplicates work the curriculum already does inside
each lesson module. The teacher↔student script in modules like S-3,
SE-1 → SE-9 is itself the assessment moment; a separate dashboard
of `assessment_status` enums is non-curriculum-aligned.

We are NOT yet implementing the audit's full recommendations
(per-student observation log on the lesson page, roster widget,
status-enum-to-observation-language migration). Those are larger
follow-ups. **This ticket is the minimal cut: remove the broken
metaphor before users see it at launch.** The deeper refactor can
come after.

### Requirements

1. Delete `app/teacher/assessments/page.tsx`.
2. Add a redirect at the route's URL. Two ways:
   - Option A (preferred): create `app/teacher/assessments/page.tsx`
     containing only `import { redirect } from 'next/navigation';
     export default function() { redirect('/teacher/start-teaching'); }`
   - Option B: configure the redirect in `next.config.ts` under
     `redirects()` so Next handles it at the edge.
   Either is fine; Option A is simpler and lives with the rest of
   the app.
3. Remove the "Assessments" tab from `app/teacher/layout.tsx`'s `tabs`
   array. Re-test that the remaining tabs lay out correctly without
   the missing tab leaving a gap.
4. Remove "assessments" from the `isDashboardActive` and any other
   matchers in TopNav and teacher layout that refer to the route.
5. Search for any inbound links to `/teacher/assessments` elsewhere in
   the app (`grep -r "teacher/assessments" app components lib`) and
   redirect them or remove them.
6. Mark related tickets affected — append a note to KAN-36
   (Assessments & Grouping epic), KAN-45, KAN-46, KAN-83 indicating
   that the standalone surface is retired and these tickets are now
   either rerouted or candidates for closure.

### Acceptance Criteria

**Happy Path**
Given a user visits `/teacher/assessments`
When the route resolves
Then they are redirected to `/teacher/start-teaching`
And no Assessments tab appears in the teacher dashboard nav

**Auth State**
Given a logged-out user visits `/teacher/assessments`
When the redirect runs
Then they land on `/teacher/start-teaching` (which has its own
preview-mode behavior)

**Error State**
Given any inbound link in the app still points to `/teacher/assessments`
When clicked
Then it redirects cleanly (no 404)

**Mobile**
Given a teacher dashboard view at 375×667
When the Assessments tab is removed
Then the remaining tabs (About Method, Curriculum, Grouping & Progress,
Resources) flow correctly without horizontal scroll

### Out of Scope

- The `assessment_status` / `focus_areas` / `progress_label` columns
  on the `students` table — leaving them in the schema for now
  (no migration). The deeper refactor that drops these is a
  separate, larger ticket.
- Per-student observation log on the lesson page (audit
  recommendation #3) — separate ticket.
- Roster glance widget on `/teacher/start-teaching` (audit
  recommendation #4) — separate ticket.
- Copy rewriting in `lib/copy/roleCopy.ts` — separate ticket if
  that copy still references "assessment" language.

### Notes

- File to delete (or replace with redirect): `app/teacher/assessments/page.tsx`
- File to edit: `app/teacher/layout.tsx` (remove tab + matcher)
- File to edit: `components/TopNav.tsx` (remove assessments from `isDashboardActive`)
- Coordinate with KAN-36 / KAN-45 / KAN-46 / KAN-83 — these may
  become noop after this lands.
- Should ship in <1 hour. The audit already did the heavy thinking.
