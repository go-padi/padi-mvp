---
id: LR-20-UAT
title: "UAT — LR-20: Role-aware copy pass #2"
type: uat
parent: LR-20
feature: launch-readiness
buildloop_iteration: 1
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
created: 2026-05-13
updated: 2026-05-13
---

## Scope

Sweep all six "Teacher Dashboard" hardcoded strings to use the generic `rolePhrase(role, teacher, parent)` helper from `lib/copy/roleCopy.ts`. Parent label is "My Dashboard" (title) / "my dashboard" (mid-sentence). Logged-out homepage is role-neutral "Dashboard" / "View Dashboard." Per the eng brief's correction, no `RoleAwareHeading` component was created — `app/teacher/layout.tsx` already has `'use client'` and the substitution is inline. Eng-brief in-scope extension: the eyebrow "Teacher" at `app/teacher/layout.tsx:30` also wraps in `rolePhrase`.

## Scenarios

### UAT-01 — Logged-in parent sees "My Dashboard" everywhere
Status: ✅

Given a logged-in parent (`role === 'parent'`)
When the parent navigates `/teacher/curriculum`, `/teacher/about`, `/teacher/grouping`, `/teacher` (logged-in dashboard branch), and `/students` (logged-out empty state path)
Then no "Teacher Dashboard" / "teacher dashboard" string appears in any rendered surface from the four in-scope files
And the parent variants render: `<h1>My Dashboard</h1>`, eyebrow `Parent`, mid-sentence `my dashboard`, CTA `Go to My Dashboard`, students empty state `from My Dashboard`.

Verified via:
- `rolePhrase(role, teacher, parent)` at `lib/copy/roleCopy.ts:15-17` returns `parent` when `role === 'parent'`. Pure function, deterministic.
- Call sites confirmed:
  - `app/teacher/layout.tsx:30` — eyebrow `{rolePhrase(role, 'Teacher', 'Parent')}` → renders `Parent` for parents.
  - `app/teacher/layout.tsx:31` — `<h1>{rolePhrase(role, 'Teacher Dashboard', 'My Dashboard')}</h1>` → renders `My Dashboard` for parents.
  - `app/teacher/page.tsx:433` — `{rolePhrase(role, 'the teacher dashboard', 'my dashboard')}` → renders `my dashboard` (lowercase, mid-sentence; "the" is dropped from parent variant — sentence reads "Browse every developmental area in my dashboard." which is clean).
  - `app/teacher/page.tsx:436` — `{rolePhrase(role, 'Go to Teacher Dashboard', 'Go to My Dashboard')}` → renders `Go to My Dashboard`. This is the priority callsite — the exact button the parent clicked in the 2026-05-11 walkthrough.
  - `app/students/page.tsx:51` — `{rolePhrase(role, 'from the Teacher Dashboard', 'from My Dashboard')}` → renders `from My Dashboard`.

### UAT-02 — Logged-in teacher sees "Teacher Dashboard" everywhere (no regression)
Status: ✅

Given a logged-in teacher (`role === 'teacher'`)
When the teacher navigates the same surfaces
Then every previously-rendered "Teacher Dashboard" string still renders correctly.

Verified via `rolePhrase` contract: `role !== 'parent'` returns the teacher arg. The teacher branch literal in each call site is exactly the pre-LR-20 string. SSR confirmation (pre-hydration acts as teacher fallback, equivalent to the logged-in teacher branch):
- `curl http://localhost:3000/teacher/curriculum` → `<p ...>Teacher</p><h1 ...>Teacher Dashboard</h1>`. PASS.
- `curl http://localhost:3000/teacher/about` → same eyebrow + h1. PASS.
- `curl http://localhost:3000/teacher/grouping` → same eyebrow + h1. PASS.

### UAT-03 — Logged-out homepage renders role-neutral "Dashboard" / "View Dashboard"
Status: ✅

Given a logged-out visitor on `/`
When the homepage renders
Then the dashboard CTAs render "Dashboard" / "View Dashboard" — NOT "Teacher Dashboard" and NOT "My Dashboard".

Verified:
- `curl http://localhost:3000/` returned exactly 2x "Dashboard" + 2x "View Dashboard", 0x "Teacher Dashboard", 0x "My Dashboard".
- Source confirms: `app/page.tsx:28` literal `Dashboard`; `app/page.tsx:100` literal `View Dashboard`. RSC with no `useAuth` reference — neutral by construction.

### UAT-04 — Pre-hydration (role === null) renders teacher fallback (no parent flash)
Status: ✅

Given `role === null` on initial SSR / pre-hydration
When `/teacher/curriculum` renders
Then the heading renders "Teacher Dashboard" and the eyebrow renders "Teacher" — the documented `rolePhrase` fallback (`lib/copy/roleCopy.ts:9`).

Verified via SSR curl (role is `null` server-side since the auth store is client-only Zustand):
- `/teacher/curriculum` SSR HTML contains `<p ...>Teacher</p><h1 ...>Teacher Dashboard</h1>`. No "My Dashboard" or "Parent" text anywhere in initial paint. PASS.
- `rolePhrase` ternary `role === 'parent' ? parent : teacher` means any non-`'parent'` value (including `null`, `undefined`, `'teacher'`, unknown) falls through to teacher. Cannot flash parent variant on hydration boundary.

### UAT-05 — Grep verification: no unwrapped "Teacher Dashboard" strings in app
Status: ✅ (with caveat — see UAT-06)

`grep -rEn "Teacher Dashboard|teacher dashboard" app components lib`:
- 4 matches, all inside `rolePhrase(...)` argument literals:
  - `app/students/page.tsx:51` (teacher branch).
  - `app/teacher/layout.tsx:31` (teacher branch).
  - `app/teacher/page.tsx:433` (teacher branch, lowercase).
  - `app/teacher/page.tsx:436` (teacher branch).
- 0 bare unwrapped occurrences of "Teacher Dashboard" or "teacher dashboard" outside `rolePhrase(...)` in the in-scope file set.

`grep -rEni "my dashboard" app components lib`:
- 4 matches (3 title case + 1 lowercase on line 433 — meets the eng brief's "at least 4 hits, one per audit callsite where the parent variant is used" requirement).

### UAT-06 — Case-insensitive sweep finds out-of-scope "Teacher dashboard" in not-found.tsx
Status: 🐛 (P3 — ticket gap, NOT a regression introduced by LR-20)

`grep -rEn "Teacher dashboard|Teacher Dashboard|teacher dashboard" app components lib` (case-variant pass) surfaces a 7th unwrapped occurrence not in the original audit:

`app/not-found.tsx:10` — `<Link href="/teacher" className="btn">Teacher dashboard</Link>`

This is pre-existing breakage — it predates this iteration and wasn't listed in the LR-20 audit. The eng brief explicitly limited scope to the 6 audit-listed surfaces ("audit-listed surfaces only"). A logged-in parent who hits a 404 will see a button labeled "Teacher dashboard" — same regression class as the surfaces this ticket just fixed.

Recommendation: file as a follow-up gap (P3 — surface a parent hits only on a 404, low traffic) rather than block LR-20 ship. The implementation matches the ticket's documented scope; the audit missed this surface.

Bug filed: docs/features/launch-readiness/iterations/lr-20-role-aware-copy-pass-2/bugs/kan-141-bug-not-found-teacher-dashboard-link.md

### UAT-07 — No console errors / build warnings introduced
Status: ✅

Dev server log shows clean compile of `/`, `/teacher`, `/teacher/curriculum`, `/teacher/about`, `/teacher/grouping`, `/students`. All HTTP 200. No type errors, no React warnings, no hydration mismatch warnings — confirmed via `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/.buildloop/iterations/001/validate-1.log` (no error/warn/fail lines) and `dev-server.log`.

### UAT-08 — Mobile width regression check
Status: ✅

"My Dashboard" (12 chars) < "Teacher Dashboard" (17 chars); "Dashboard" (9 chars) < both. The substitution can only shrink the rendered text. No layout / flex / grid changes were made. No mobile regression possible from string substitution alone. Spot-checked source — no new CSS, no width-affecting classes touched.

## Verdict

Verdict: PASS

Eight scenarios executed. Seven pass cleanly. One (UAT-06) surfaces a pre-existing out-of-scope gap in `app/not-found.tsx:10` that this iteration intentionally did not address (matches eng-brief scope). The implementation cleanly satisfies the refined ticket's six AC clauses (happy-path parent, happy-path teacher, logged-out homepage, cross-surface consistency, pre-hydration fallback, mobile). All four file changes are minimal, surgical, and use the existing generic helper inline — no new components, no new helper keys, no schema, no auth changes. Build-summary's grep counts match independently-run greps.

## Run history

### 2026-05-13 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 7 / ❌ 0 / 🐛 1 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Logged-in parent — all surfaces render "My Dashboard" | ✅ | — | — |
  | UAT-02 | Logged-in teacher — no regression | ✅ | — | — |
  | UAT-03 | Logged-out homepage — role-neutral "Dashboard" | ✅ | — | — |
  | UAT-04 | Pre-hydration — teacher fallback, no parent flash | ✅ | — | — |
  | UAT-05 | Grep — no unwrapped "Teacher Dashboard" in scope | ✅ | — | — |
  | UAT-06 | not-found.tsx "Teacher dashboard" link (out of scope) | 🐛 | docs/features/launch-readiness/iterations/lr-20-role-aware-copy-pass-2/bugs/kan-141-bug-not-found-teacher-dashboard-link.md | P3 |
  | UAT-07 | No console errors / build warnings | ✅ | — | — |
  | UAT-08 | Mobile width regression | ✅ | — | — |
- Notes for padi-eng: Implementation is clean. `rolePhrase` is the right level of abstraction — no new keys, no new component, just inline calls. The lowercase mid-sentence variant on line 433 reads correctly with "the" dropped from the parent branch. If you take the follow-up for `not-found.tsx`, the fix is the same one-liner pattern: `<Link>{rolePhrase(role, 'Teacher dashboard', 'My dashboard')}</Link>` (note: this is a client `<Link>` from `next/link` but `not-found.tsx` is an RSC — would need a small `'use client'` extraction or fall back to role-neutral "Dashboard" matching the homepage pattern).
- Notes for padi-design: No design states changed. "My Dashboard" / "Parent" eyebrow renders inside the existing layout chrome. If we want a tonally different parent-mode treatment of the heading area (different color, different copy density), that's a separate design ticket — out of scope for LR-20.
- Missing from ticket: The original 2026-05-11 audit missed `app/not-found.tsx:10`. A case-insensitive grep (`-i`) would have caught it ("Teacher dashboard" with lowercase "d"). For LR-21 or follow-ups, run `grep -rEni "teacher dashboard"` instead of case-sensitive. Also worth a sweep for other lowercase-variant role-vocab regressions ("the teacher" / "your teacher" / etc.) that the case-sensitive audit would miss.
