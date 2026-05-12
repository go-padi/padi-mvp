---
id: LR-17
title: "[Preview] Fix logged-out students preview hang OR redirect to a meaningful state"
type: bug
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-11
created_by: parent-walkthrough-2026-05-11
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-11-parent.md
supersedes: KAN-58
---

### Goal

Logged-out visitors clicking "Students preview" hit an infinite loading
state. Either resolve the load (with sane demo data + clear preview banner)
or replace the route with a meaningful CTA. No dead-ends for prospective users.

### Background

From the parent walkthrough:

> "I can look at students preview, this doesn't work, it just keeps loading,
> unclear what happens there, so I can't really look at what's happening
> with the student, it just hangs on loading."

This is the visitor's first attempt to evaluate Padi before signing up. A
hang here is a direct activation kill — the visitor bails because the
product "looks broken."

This ticket also resolves the underlying issue tracked in KAN-58 ("Logged
out, Start Teaching — can't click into Individual Student cards") and
related KAN-72 ("Start teaching — not logged in — student card issue"),
both of which were stub-ported from Jira without bodies. The parent
walkthrough reframes the fix: the question isn't "make the broken preview
work" — it's "decide what logged-out students should show."

### Requirements

1. **Reproduce the hang** on production (padi-mvp.vercel.app, signed
   out, click "Students preview" or whichever surface the walkthrough
   referenced). Capture the network call that hangs and the failing
   query.
2. **Decide product direction** (founder/design call):
   - **Option A:** Show static demo-mode student cards (e.g. Maya,
     Ahmed) with clear "Demo data — sign in to manage your own students"
     banner.
     Pairs with the "intentionally gated preview" direction LR-18
     adopts.
   - **Option B:** Redirect logged-out users away from `/students` to
     a sign-up CTA. Treat students as authenticated-only.
   - **Option C:** Show the empty-state landing ("You haven't added
     any students yet — sign in to start") even when not authenticated,
     making the sign-in CTA the obvious next step.
   Recommend **Option A** — keeps the preview affordance LR-08
   established but fixes the hang.
3. **Implement the chosen option.** No infinite loading state remains.
4. **Wire to LR-18 demo-data direction.** If LR-18 retires the
   "demo-student" pattern for IP reasons, fall back to Option C.
5. **Eyeball padi-mvp.vercel.app after deploy** — confirm the fix
   reaches prod.

### Acceptance Criteria

**Happy Path**
Given a logged-out visitor navigates to the students preview route
When the page loads
Then within 2 seconds they see either (Option A) demo students with a
preview banner, or (Option B/C) a clear sign-in CTA
And no spinner / hang persists past 2 seconds

**Auth State**
Given a logged-in user visits the same route
When the page loads
Then their real students render as today (no regression)

**Empty State**
Given a logged-in user with zero students
When the page loads
Then the empty-state CTA "Add your first student" renders

**Error State**
Given the underlying query fails
When the page renders
Then an error message displays with a "Try again" affordance —
never an infinite spinner

**Mobile**
375×667 viewport. No horizontal scroll, no clipped buttons.

### Out of Scope

- Building new student management features.
- Tenant-scoped multi-student demo data (one set of demo students is
  enough).
- Redesigning the logged-in students page.

### Notes

- File to check: `app/students/page.tsx` (or wherever the
  "Students preview" link from the walkthrough actually points).
- Related: KAN-58 (superseded), KAN-72 (superseded), LR-18
  (decides the broader gated-preview policy), LR-08 (demo-banner
  pattern shipped on 2026-05-10 narrow slice).
- Should ship same batch as LR-18 since both shape the logged-out
  experience.
