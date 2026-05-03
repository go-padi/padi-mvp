---
id: FOLLOWUP-parent-redirect
title: "Parent role: /teacher/curriculum deep-link redirects to /teacher"
type: bug
feature: role-split
parent: KAN-131
related: KAN-135
severity: medium
status: review
discovered_during: UAT KAN-135 (2026-04-21)
updated: 2026-05-03
---

### Resolution (2026-05-03) — no code change

Investigation found no `role === 'parent'`-conditional redirect away from `/teacher/curriculum`. The only role-aware redirect in the app is `components/auth/RoleGuard.tsx`, which redirects logged-in users to `/welcome/role` when `roleSetAt === null` — already narrowed per Option A's "redirect only on null-role" guidance. (`roleSetAt` is the correct narrowing key, not `role`: the auth trigger bootstraps `role='teacher'`, so `role !== null` does not reliably indicate the user has picked — see comment in `lib/auth-store.tsx`.)

Verification grep `rg "teacher/curriculum" app middleware.ts lib` returns only:
- `app/teacher/layout.tsx:20` — `pathname.startsWith('/teacher/curriculum')` inside the `isDashboardView` check (renders dashboard chrome; not a redirect).
- `app/teacher/dashboard/page.tsx:4` — `redirect('/teacher/curriculum')` redirects *into* the page from the legacy `/teacher/dashboard` slug (unrelated).

All five ACs are met as-is by current code:
- Parent deep-link with `roleSetAt` set → RoleGuard returns early at the `roleSetAt` check; gated parent view renders.
- Parent in-app tab → unchanged.
- Teacher deep-link → unchanged.
- Logged-out preview → unchanged (no auth checks fire).
- `role === null` (i.e. `roleSetAt === null`) → RoleGuard still redirects to `/welcome/role`.

The UAT-observed "parent ends up on /teacher" symptom is most likely the picker handoff path: a parent with `roleSetAt === null` deep-linking to `/teacher/curriculum` is sent to `/welcome/role`, picks "parent", and `app/welcome/role/page.tsx:66` then `router.push('/teacher')`s them. The deep-link target is lost. That is a returnTo-handling issue in the picker, not a parent-specific guard, and is out of scope for this ticket — file a separate follow-up if we want to preserve the original target across the picker.

Flipping to `review` for human confirmation. If the original UAT repro can still be reproduced with `roleSetAt` set, reopen with the steps and the network/route trace.


### Goal
Preserve deep-link / bookmark access to `/teacher/curriculum` for parent-role users. Today, direct navigation to `/teacher/curriculum` under `role === 'parent'` is redirected to `/teacher`; the curriculum page is only reachable via the in-app "Teacher Dashboard → Curriculum" tab. This partly undermines KAN-131 (and UAT-01 / UAT-02 in KAN-135) for any user who arrives via a saved URL, email link, or shared link.

### Background
KAN-131 shipped role-gating on `/teacher/curriculum`: for `role === 'parent'`, the page hides the Teaching Mode Toggle, forces Individual mode, filters Group chapters, and strips the "(Individual)" suffix. During KAN-135 UAT (2026-04-21), the gated view was confirmed correct **when reached via in-app navigation**, but direct navigation to `/teacher/curriculum` as a parent now redirects to `/teacher`.

This redirect was not part of KAN-131's spec — KAN-131 explicitly called for the curriculum page to render a gated view for parents, not to redirect away. A separate redirect guard (likely added while fixing the profile-upsert 400 in BUG `bug-role-save-400.md`, or as part of the role onboarding flow) appears to be intercepting `/teacher/curriculum` for parents.

If the product decision is that parents should land on `/teacher` first, then KAN-131's UAT cases AC-01 / AC-02 need to be re-expressed in terms of the in-app tab path. If the product decision is the original KAN-131 behavior (parent can deep-link to `/teacher/curriculum` and sees the gated view), this redirect is a regression and should be removed.

### Requirements
1. **Decide the intended behavior** with Nisha / PM before coding:
   - Option A (preferred — matches KAN-131 spec): Remove the redirect. `/teacher/curriculum` must render the gated parent view directly.
   - Option B: Keep the redirect, and update KAN-131's acceptance criteria + KAN-135's UAT plan to reflect that parents reach curriculum only via the in-app tab.
2. **If Option A** (most likely):
   - Locate the guard redirecting `/teacher/curriculum` → `/teacher` for `role === 'parent'`. Likely candidates: `app/teacher/layout.tsx`, `app/teacher/curriculum/layout.tsx`, middleware in `middleware.ts`, or a client-side `useEffect` redirect in `app/teacher/curriculum/page.tsx`.
   - Remove or narrow the guard so that:
     - `role === 'parent'` + `/teacher/curriculum` → render the gated parent view (no redirect).
     - `role === 'teacher'` + `/teacher/curriculum` → render the full teacher view (unchanged).
     - Logged out + `/teacher/curriculum` → render the preview (unchanged, per KAN-131).
     - Missing role (null) + `/teacher/curriculum` → existing `/welcome/role` redirect stays.
3. **Do not touch** the Teaching Mode Toggle gating, chapter filtering, or suffix stripping — those are KAN-131 behavior and already pass UAT.

### Acceptance Criteria

**Happy Path — parent deep link**
- Given a signed-in user with `profiles.role = 'parent'`
- When they paste `https://padi-mvp.vercel.app/teacher/curriculum` into a fresh tab (or click a bookmark)
- Then the page loads at `/teacher/curriculum` with no redirect, the Teaching Mode Toggle is absent, only Individual chapters render, and no rendered title contains " (Individual)".

**Happy Path — parent in-app tab**
- Given a signed-in parent on `/teacher`
- When they click the "Curriculum" tab
- Then the behavior is unchanged from today (gated view renders as it does now).

**Regression guard — teacher deep link**
- Given a signed-in teacher
- When they paste `/teacher/curriculum` into a fresh tab
- Then the page loads unchanged, toggle visible, all chapters rendered.

**Regression guard — logged-out preview**
- Given an unauthenticated visitor
- When they paste `/teacher/curriculum`
- Then the preview renders unchanged (toggle visible, full chapter list, suffixes intact).

**Auth edge — no role yet**
- Given a signed-in user with `profiles.role = null`
- When they paste `/teacher/curriculum`
- Then they are redirected to `/welcome/role` (existing behavior, must be preserved).

### Out of Scope
- Any UI changes inside the curriculum page itself (that's KAN-131).
- Changing the role onboarding flow at `/welcome/role`.
- Adding analytics for deep-link access (can be rolled into KAN-133 if desired).

### Files likely involved
- `middleware.ts` — check for any `pathname.startsWith('/teacher/curriculum')` logic.
- `app/teacher/layout.tsx` — check for role-based `redirect()` calls.
- `app/teacher/curriculum/page.tsx` or `.../layout.tsx` — check for a client-side redirect in a `useEffect`.
- `lib/auth/*` — any shared `requireRole` / `requireTeacher` helper.

### Test plan
1. Manual: four deep-link checks per AC above (parent, teacher, logged-out, null-role).
2. Grep: after the fix, `rg "teacher/curriculum" app middleware.ts lib` should show no role-conditional redirect away from that path.
3. Regression: re-run the six KAN-135 UATs but with direct-URL navigation for each.

### Notes for the implementer
- If the redirect was introduced intentionally to support the `/welcome/role` flow for null-role users, narrow it rather than removing it — redirect only when `role === null`, not when `role === 'parent'`.
- Keep the diff small. No new hooks, no new context.
