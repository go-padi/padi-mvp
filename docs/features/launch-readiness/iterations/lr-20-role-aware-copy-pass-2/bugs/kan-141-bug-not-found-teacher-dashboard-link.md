---
id: KAN-141
title: "[Bug] not-found.tsx shows 'Teacher dashboard' link to logged-in parents"
type: bug
status: open
priority: low
severity: P3
feature: launch-readiness
parent: LR-20
uat: LR-20-UAT
related: LR-06, LR-20
discovered_by: padi-uat-agent
buildloop_iteration: 1
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
created: 2026-05-13
---

## Summary

`app/not-found.tsx:10` renders a button labeled "Teacher dashboard" regardless of user role. A logged-in parent who hits a 404 sees the same role-mismatch bug LR-20 was created to fix — but on a surface LR-20 explicitly scoped out (the original 2026-05-11 audit missed it because the casing differs from the other six call sites).

## Steps to reproduce

1. Sign in as a parent (role === 'parent', confirmed via `useAuth()`).
2. Navigate to any path that does not exist, e.g. `http://localhost:3000/does-not-exist`.
3. Observe the 404 page.

## Actual behavior

The page renders two buttons: "Home" and "Teacher dashboard". The "Teacher dashboard" button uses Padi's primary `.btn` styling and links to `/teacher`. A parent sees teacher-role vocabulary on a surface they were never told they'd land on.

```tsx
// app/not-found.tsx:10
<Link href="/teacher" className="btn">Teacher dashboard</Link>
```

## Expected behavior

Either:
1. **Role-neutral (preferred, matches the homepage pattern from LR-20):** Render "Dashboard" universally. `not-found.tsx` is an RSC; it can't read `useAuth()` directly without a `'use client'` extraction. The homepage (`app/page.tsx:28`) made this exact tradeoff — RSC + role-neutral "Dashboard". Same call here.
2. **Role-aware via small client extraction:** Mirror the `app/teacher/layout.tsx` approach — but the 404 surface is low-traffic enough that the RSC simplicity probably wins.

Recommended fix:

```tsx
// app/not-found.tsx:10
<Link href="/teacher" className="btn">Dashboard</Link>
```

## Severity rationale

P3 (low). The 404 surface is low-traffic and not part of the activation funnel. The parent walkthrough that prompted LR-20 hit the active-dashboard CTA path, not the 404. Filing as a follow-up rather than a blocker.

## Out of scope of LR-20

The LR-20 eng brief was explicit: "audit-listed surfaces only" (six call sites). This surface was not in the 2026-05-11 audit grep because the audit was case-sensitive — `app/not-found.tsx` uses sentence case "Teacher dashboard" (lowercase "d") rather than title case "Teacher Dashboard". A case-insensitive `grep -ni` would have caught it.

## Repro evidence

```bash
$ grep -rEn "Teacher dashboard|Teacher Dashboard|teacher dashboard" app components lib
app/not-found.tsx:10:        <Link href="/teacher" className="btn">Teacher dashboard</Link>
app/teacher/layout.tsx:31:                <h1 ...>{rolePhrase(role, 'Teacher Dashboard', 'My Dashboard')}</h1>
app/teacher/page.tsx:433:          <p ...>Browse every developmental area in {rolePhrase(role, 'the teacher dashboard', 'my dashboard')}.</p>
app/teacher/page.tsx:436:          {rolePhrase(role, 'Go to Teacher Dashboard', 'Go to My Dashboard')}
app/students/page.tsx:51:            ... {rolePhrase(role, 'from the Teacher Dashboard', 'from My Dashboard')}.
```

Four of five lines are wrapped (LR-20 in-scope). One is not (`app/not-found.tsx:10`).

## Suggested follow-up

Single-line fix. Likely candidate for a future role-aware-copy sweep (LR-21?) that uses a case-insensitive grep audit. Alternatively, bundle into any general 404-page polish ticket.

## Files implicated

- `app/not-found.tsx` (line 10).

## Not modified by LR-20

Confirmed: this file was not touched in LR-20 iteration 1. See `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/.buildloop/iterations/001/build-summary.md` — modified files list is `app/page.tsx`, `app/teacher/layout.tsx`, `app/teacher/page.tsx`, `app/students/page.tsx`. `app/not-found.tsx` is not in the diff.
