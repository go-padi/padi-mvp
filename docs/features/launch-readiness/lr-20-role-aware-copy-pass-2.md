---
id: LR-20
title: "[Copy] Role-aware copy pass #2 — sweep all 'Teacher Dashboard' strings"
type: task
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-11
created_by: parent-walkthrough-2026-05-11
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-11-parent.md
follows_up: LR-06
related: KAN-132
---

### Goal

LR-06 made the TopNav role-aware (parent sees parent labels). But
"Teacher Dashboard" still appears all over the rest of the app —
in the homepage hero, the `/teacher` layout's `<h1>`, in-page CTAs,
and copy on `/students`. A parent who navigates anywhere outside the
TopNav is still told they're a teacher. This ticket closes that gap.

### Background

From the parent walkthrough:

> "Add child. Let's do Maya. Maya. I hear Do I need to see the full
> curriculum? Go to Teacher Dashboard. Great, I see the full
> curriculum."

The parent literally clicked a button labeled "Go to Teacher
Dashboard." LR-06 scope was nav-only — the in-page strings were not
in scope and didn't get the `rolePhrase()` treatment.

Audit of remaining "Teacher Dashboard" strings (grep run 2026-05-11):

```
app/page.tsx:28           Teacher Dashboard         (homepage hero)
app/page.tsx:100          View Teacher Dashboard    (homepage CTA)
app/teacher/layout.tsx:30 <h1>Teacher Dashboard</h1> (every /teacher/* page)
app/teacher/page.tsx:432  ...the teacher dashboard. (helper text)
app/teacher/page.tsx:435  Go to Teacher Dashboard   (in-page CTA — the one the parent clicked)
app/students/page.tsx:50  ...from the Teacher Dashboard. (empty state copy)
```

For parents, all of these should use the parent-flavored label that
TopNav already uses (e.g. "My Dashboard" or "Home" — pick one and
use consistently).

### Requirements

1. **Decide the parent label.** Check what `components/TopNav.tsx`
   uses post-LR-06 and match it. Recommend "My Dashboard" — neutral
   enough to fit any role context.
2. **Add parent variants to `lib/copy/roleCopy.ts`** for each string
   listed in the audit above. Follow the `rolePhrase()` pattern
   established in KAN-132.
3. **Update each source file** to use `rolePhrase()` instead of the
   hard-coded "Teacher Dashboard" / "teacher dashboard" string.
   Specifically:
   - `app/page.tsx` lines 28 + 100 (homepage hero + CTA)
   - `app/teacher/layout.tsx` line 30 (`<h1>`)
   - `app/teacher/page.tsx` lines 432 + 435 (helper text + CTA)
   - `app/students/page.tsx` line 50 (empty state)
4. **Homepage handling.** Lines 28 + 100 on `app/page.tsx` are pre-
   auth surfaces. Use the role from `useAuth()` if present, else
   fall back to a role-neutral label ("Dashboard" or hide the
   button entirely for logged-out). Don't show "Teacher Dashboard"
   to a logged-out visitor who hasn't picked a role yet.
5. **Verify** with grep after the change:
   `grep -rn 'Teacher Dashboard\|teacher dashboard' app/ components/`
   should return 0 hits in source files (test fixtures, comments,
   and audit docs OK).
6. **Add the same parent variant to TopNav** if there's any
   inconsistency between the TopNav label and the new in-page label —
   they should match.

### Acceptance Criteria

**Happy Path (parent)**
Given an authenticated user with `role === 'parent'`
When they navigate to any of: `/`, `/teacher`, `/teacher/curriculum`,
`/teacher/about`, `/students`
Then nowhere in the page does the literal string "Teacher Dashboard"
or "teacher dashboard" appear
And the equivalent label uses the parent variant defined in
`roleCopy.ts` (e.g. "My Dashboard")

**Happy Path (teacher)**
Given an authenticated user with `role === 'teacher'`
When they navigate the same surfaces
Then the labels read "Teacher Dashboard" as today (no regression)

**Happy Path (logged-out visitor)**
Given a logged-out visitor on `/`
When the homepage renders
Then the hero heading and CTA use a role-neutral label (recommend
just "Dashboard" or hide the dashboard CTA entirely for logged-out)
And no role-presuming language appears

**Auth State (null role race)**
Given a user whose role is `null` (between signup and role-pick)
When any page renders
Then labels default to teacher (current behavior preserved)
And a gentle prompt nudges role-pick if it's been >30s since
session start (per LR-06's existing pattern)

**Mobile**
All copy fits at 375×667 — labels like "My Dashboard" don't truncate
or wrap awkwardly.

### Out of Scope

- Renaming the `/teacher/*` route tree (huge refactor; not in this
  ticket).
- Adding role variants for surfaces not listed in the audit above
  (file a follow-up if regression testing surfaces more).
- Tutor / reading-specialist role labels (v1.1+).
- Internationalization of role labels.

### Notes

- Files to edit:
  - `app/page.tsx`
  - `app/teacher/layout.tsx`
  - `app/teacher/page.tsx`
  - `app/students/page.tsx`
  - `lib/copy/roleCopy.ts` (add new keys)
  - `components/TopNav.tsx` (verify consistency, may not need a
    change if it already uses `rolePhrase()`)
  - `components/__tests__/role-copy.test.tsx` (extend coverage)
- Complexity S — pure copy/refactor, no new UI.
- This is the **next BuildLoop pick** per the parent walkthrough
  sequencing (S complexity, blocker, no design unknowns, retires
  the most visible parent-as-teacher friction).
- After this ships, the role-split epic's KAN-132 + LR-06 + LR-20
  together complete the "treat parents as parents" arc.
