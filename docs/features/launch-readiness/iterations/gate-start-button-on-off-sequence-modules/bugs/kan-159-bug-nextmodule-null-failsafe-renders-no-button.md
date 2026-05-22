---
id: KAN-159
title: "[Bug] LR-11d failsafe — when nextModule is null and student is not all-complete, no button renders"
type: bug
status: fixed
priority: P2
severity: medium
feature: launch-readiness
parent: LR-11d
uat: LR-11d-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

AC #10 of LR-11d explicitly required: *"Given `nextModule` returns null while the student is NOT all-complete, when the page renders, then NO module's Start is disabled (failsafe to all-enabled — never block the teacher if the system can't determine sequence)."*

The shipped implementation diverges from spec: when `nextModule === null` for an incomplete module, no Start button is rendered at all. The teacher has no way to navigate into the lesson from the row. This is *more* blocking than the spec, not less.

### Where

- File: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Lines 777-805 — the three-way render switch

The relevant branches:

```tsx
{isCompleted && <Link>Replay</Link>}
{isNextUp && <Link>Start Teaching | Continue Lesson</Link>}
{isOffSequence && nextModule && <button aria-disabled>Start</button>}
```

When `!isCompleted && nextModule === null`:
- `isNextUp = false` (because `nextModule === null` guard)
- `isOffSequence = true` (because `!isCompleted && !isNextUp`)
- The third branch evaluates `isOffSequence && nextModule` → `true && null` → `null` → renders nothing.

Net result: no button.

### Refined ticket said

> ```ts
> const shouldGate = nextModule !== null && !allComplete;
> {shouldGate && !completed && !isNextUp(module.code) ? <DisabledStart/> : <EnabledStart/>}
> ```
>
> Fall back to all-enabled. Logic.

The eng brief silently dropped this requirement, asserting that "`nextModule === null` only when allComplete === true." That assumption is true today given `nextModule`'s useMemo logic, but it's fragile — any future bug (stale `completedModuleIds`, race with refetch, etc.) that produces `nextModule === null` while `allComplete === false` will block the teacher with no recourse.

### Reproduction (synthetic / regression scenario)

The natural state of the app today doesn't trigger this — the bug is latent. To repro:

1. In React DevTools (or temporary code change), force `nextModule` to `null` while `allComplete` is `false`.
2. Observe: every incomplete row has no action button. The teacher cannot navigate to any lesson from this surface.

### Expected (per AC #10)

When `nextModule === null` and `!allComplete`, every non-completed row should render an **enabled** Start (the blue Link) — the failsafe is "trust the teacher, don't block them."

### Actual

No button is rendered on non-completed rows in this failsafe state.

### Fix

Add a fallback enabled-Start branch when `nextModule === null && !isCompleted`:

```tsx
{!isCompleted && !nextModule && !allComplete && (
  <Link
    href={lessonHref}
    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
  >
    Start Teaching
  </Link>
)}
```

Or restructure the three-way switch to a four-way switch with the failsafe as the explicit default.

### Acceptance for fix

- With `nextModule === null && !allComplete`, every non-completed row renders an enabled blue Start linking to its lesson.
- No regression to the all-complete state (every row still renders Replay only).
- No regression to the normal state (one blue, others disabled gray, completed white Replay).


## Fix Notes

**Root cause.** The three-way render switch had no failsafe branch. When `nextModule === null` but the student was not all-complete (a latent state today, but possible under stale `completedModuleIds` or refetch races), `isOffSequence` was `true` and the gated branch's `nextModule` guard short-circuited to `null` — rendering no button at all. The eng brief assumed `nextModule === null ⇒ allComplete === true` and dropped the spec's AC #10 failsafe.

**Files changed.** `app/teacher/start-teaching/students/[studentId]/page.tsx` — added a fourth branch to the action-button switch:

```tsx
{isOffSequence && !nextModule && !allComplete && (
  <Link href={lessonHref} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
    Start Teaching
  </Link>
)}
```

**Why this fix is correct.** The four branches are now mutually exclusive and collectively exhaustive for incomplete rows: `isCompleted` → Replay; `isNextUp` → blue Continue/Start; `isOffSequence && nextModule` → disabled gray Start (normal gated state); `isOffSequence && !nextModule && !allComplete` → enabled blue Start (failsafe — trust the teacher). The all-complete state is unchanged because every row in that state has `isCompleted === true` and falls through to the Replay branch first. The normal three-state path (one blue next-up, others disabled gray, completed white Replay) is unchanged because the new branch's `!nextModule` guard excludes it. Matches the spec's AC #10 verbatim: when sequence can't be determined, never block the teacher.
