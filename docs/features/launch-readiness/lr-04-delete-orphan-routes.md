---
id: LR-04
title: "[Routes] Delete orphan and placeholder routes before launch"
type: task
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
---

### Goal

Remove four routes that have no user-facing value but are publicly
accessible: two "coming soon" placeholders, one duplicate re-export,
and one disorienting redirect-button mismatch.

### Background

The audit found four routes that should not ship to a public launch:

1. **`/classes/[id]/today`** — hardcoded `<h1>Today (coming soon)</h1>`
   placeholder. Not linked from anywhere in the nav. Routes from a
   user URL the team hasn't documented.
2. **`/classes/[id]/plan`** — same family, also a placeholder
   (probable; audit didn't read the full file).
3. **`/start-teaching/page.tsx`** — single line: `export { default }
   from '../teacher/page';`. Renders the same content as `/teacher`
   under a different URL. Two URLs for the same surface fragments
   the user mental model and SEO.
4. **`/teacher/dashboard`** — redirects to `/teacher/curriculum`.
   The TopNav button labeled "Teacher Dashboard" links here, then
   bounces to curriculum. The user clicks "Teacher Dashboard" expecting
   a dashboard and lands on a curriculum browser. Either rename the
   button or fold the redirect away; current state is misleading.

### Requirements

1. **Delete** `app/classes/[id]/today/page.tsx` and its parent route
   directory if empty. If `app/classes/[id]/plan/page.tsx` is also a
   placeholder (verify by reading it), delete it too. If the entire
   `app/classes/` tree is orphan, delete the whole directory.
2. **Delete** `app/start-teaching/page.tsx` (the re-export). If you
   want `/start-teaching` to be a stable URL (e.g. for marketing
   links), redirect it to `/teacher` via `next.config.ts` redirects()
   or a similar one-line redirect page. Otherwise just delete.
   Same for `app/start-teaching/groups/[groupId]/page.tsx` and
   `app/start-teaching/students/[studentId]/page.tsx` — verify
   whether they're real or re-exports; if re-exports, delete.
3. **Resolve `/teacher/dashboard`**:
   - Option A (preferred): rename TopNav's "Teacher Dashboard"
     button to match where it actually goes (e.g. "Curriculum").
     Delete `app/teacher/dashboard/page.tsx` and remove
     `goToDashboard` from TopNav (just use a `<Link
     href="/teacher/curriculum">`).
   - Option B: keep the redirect, but rename the button to
     something that doesn't promise a "dashboard" the user never
     sees (e.g. "Teach" or "Curriculum & Tools").
   - Option C: build an actual dashboard and delete the redirect.
     Out of scope for launch.
   Pick A.
4. Verify no inbound links elsewhere in the app or marketing point
   to deleted routes. `grep -r "/classes/\|/start-teaching\|/teacher/dashboard" app components lib`. Update or remove.

### Acceptance Criteria

**Happy Path**
Given a user navigates to any deleted route
When the route resolves
Then they see the LR-02 404 page (not a placeholder, not a re-export, not a Next.js default error)

**Happy Path (TopNav)**
Given a user clicks the "Teacher Dashboard"-replacement button in TopNav
When the button click resolves
Then they land on the page the button actually advertises (e.g. "Curriculum" → `/teacher/curriculum`)
And no intermediate redirect occurs

**Empty State**
N/A — routes are gone.

**Auth State**
Given a logged-out user navigates to a deleted route
When the route resolves
Then they get the 404 page like any other unknown URL

**Mobile**
TopNav with the renamed button must still fit at 375×667 without overflow.

### Out of Scope

- Building a real teacher dashboard (Option C above).
- Changing what `/teacher` actually shows.
- Reorganizing the broader information architecture (separate
  ticket if needed).

### Notes

- This depends on LR-02 (the 404 page). Ship LR-02 first or this
  ticket falls back to Next.js default 404, which is ugly but not
  a launch-stop.
- Files affected:
  - Delete: `app/classes/**`, `app/start-teaching/page.tsx` (and
    children if re-exports), `app/teacher/dashboard/page.tsx`
  - Edit: `components/TopNav.tsx` (rename button, drop
    `goToDashboard`, drop the matcher)
  - Edit: any inbound links found by grep
- Should ship in <1 hour. Mostly deletions plus a TopNav copy
  change.
