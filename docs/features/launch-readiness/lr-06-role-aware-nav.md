---
id: LR-06
title: "[Nav] Role-aware navigation — parent vs teacher entry experience"
type: story
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
related_epic: KAN-127 (role-split)
---

### Goal

Make the navigation experience reflect the user's role, so a parent
doesn't see "Teacher Dashboard" everywhere. The data layer for role
exists (KAN-128 / KAN-129); this ticket finishes the visible part
of the role split.

### Background

The brief calls out two primary user types: K-2 classroom teachers
AND parents teaching at home. The role-split epic (KAN-127) added
the data: the `role` column on `profiles`, `/welcome/role` to set
it, `useAuth().roleSetAt`, and `lib/copy/roleCopy.ts` for some
role-aware copy.

But the **navigation does not reflect role.** TopNav buttons read
"Teacher Dashboard" and "Start Teaching" regardless of whether the
user is a parent or a teacher. Teacher layout's tabs say "Grouping"
even though parents teaching one child don't have groups. The
entire experience is teacher-flavored, with parent-aware copy
sprinkled in via `roleCopy.ts`.

For a parent on first login, "Teacher Dashboard" is wrong-language
at the top of every screen. That's a real friction point on the
activation north star (signup → role pick → first student → first
lesson) — the user just told us they're a parent and we're calling
them a teacher.

### Requirements

1. **TopNav role awareness.** Read `useAuth().role` (already
   available). If `role === 'parent'`:
   - Rename "Teacher Dashboard" → "Home" (or "My Dashboard", or just
     skip the button and route logic — parents don't need a separate
     dashboard surface)
   - Rename "Start Teaching" → "Start Lesson" (parents do lessons,
     not "teaching" in the school sense)
   If `role === 'teacher'` or null: keep current labels.

2. **Teacher-layout tab role awareness.** The tabs in
   `app/teacher/layout.tsx` (About Method, Curriculum, Grouping &
   Progress, Resources) should only show "Grouping & Progress" when
   `role === 'teacher'`. Parents managing one child have nothing to
   group.

3. **Route-level role enforcement (optional for this ticket).** The
   teacher layout currently renders for everyone. If we want parents
   to live under a `/parent/*` route tree instead, that's a much
   bigger change — defer to a follow-up. For now, just hide nav
   items, don't route-gate.

4. **Verify `roleCopy.ts` covers the surfaces this ticket touches.**
   If TopNav buttons or tab labels need parent variants, add them
   to `roleCopy.ts` (the established pattern). Update tests in
   `components/__tests__/role-copy.test.tsx`.

5. **Decide what `/welcome/role` redirects to per role.** Currently
   it redirects to `/teacher`. For parents that label is wrong.
   Either rename `/teacher` to a role-neutral URL (huge), or have
   `/welcome/role` redirect parents to `/start-teaching` (which is
   the activation route per existing convention). Pick the second
   for scope; revisit URL naming post-launch.

### Acceptance Criteria

**Happy Path (teacher)**
Given a logged-in user with `role === 'teacher'`
When they view any page in the app
Then TopNav shows "Teacher Dashboard" and "Start Teaching"
And the teacher layout shows all four tabs (About, Curriculum,
Grouping & Progress, Resources)

**Happy Path (parent)**
Given a logged-in user with `role === 'parent'`
When they view any page in the app
Then TopNav shows the parent-flavored labels (per requirement 1)
And the teacher layout's "Grouping & Progress" tab is hidden
And other surfaces use parent-language copy (already shipped via
KAN-132 for shared surfaces)

**Empty State**
Given a logged-in user where `role` is null (edge case — race
condition between signup and role-pick redirect)
When they view any page
Then nav defaults to teacher labels (current behavior preserved)
And the user is gently prompted to complete role setup if it's
been more than 30 seconds since session start

**Error State**
Given the role lookup fails (auth-store throws)
When TopNav and teacher layout render
Then they fall back to teacher labels rather than crashing the
nav

**Auth State**
Given a logged-out user
When they view TopNav
Then they see the "Sign In" button as today
And the dashboard / start-teaching button labels are role-neutral
(or simply default to teacher labels — pick whichever feels less
misleading on the marketing surface)

**Mobile**
All variations must lay out correctly at 375×667.

### Out of Scope

- Renaming the entire `/teacher/*` route tree to be role-neutral
  (huge refactor; separate ticket if pursued).
- Building parent-only surfaces that teachers don't see (e.g. a
  "share progress with grandparents" feature). This ticket is
  about hiding/renaming, not adding.
- Tutor / reading specialist roles (the brief mentions them as
  "secondary"; not in scope until v1.1+).

### Notes

- Files to edit:
  - `components/TopNav.tsx`
  - `app/teacher/layout.tsx`
  - `lib/copy/roleCopy.ts` (if new strings needed)
  - `app/welcome/role/page.tsx` (redirect logic per role)
  - `components/__tests__/role-copy.test.tsx` (extend tests)
- Useful pattern: most of the role-aware logic should be in
  `roleCopy.ts` to keep nav components readable.
- Should ship in ~half a day.
