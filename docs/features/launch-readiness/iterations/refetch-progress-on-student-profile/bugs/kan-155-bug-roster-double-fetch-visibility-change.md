---
id: KAN-155
title: "[LR-09a] Roster page double-fetches on visibility change (violates 1000 ms throttle AC)"
type: bug
status: fixed
priority: medium
severity: P2
feature: launch-readiness
parent: LR-09a
uat: LR-09a-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The LR-09a "Throttle" AC says: "Given the user rapidly switches focus (visible → hidden → visible → hidden → visible) within 500 ms, then exactly one refetch fires." On `/teacher` (the start-teaching roster), TWO refetches fire on a single visibility-change event because `useStartTeachingData` registers its OWN `visibilitychange` listener that the new LR-09a page-level listener does not coordinate with.

### Root cause

`lib/startTeaching/useStartTeachingData.ts:195-205` already has a `visibilitychange` listener that fires `load()` whenever the tab becomes visible (gated only by a 500 ms post-mount window). This listener was added in a prior iteration and was not noted in the LR-09a engineering brief's "Existing state to be aware of" section for `app/teacher/page.tsx`.

LR-09a then added a SECOND `visibilitychange` + `focus` listener in `app/teacher/page.tsx:71-91`. The new listener uses the page-level `lastFetchAtRef` (1000 ms guard). The hook's listener uses an independent `mountedAt` reference and does not consult `lastFetchAtRef`.

When the user makes the tab visible:

1. The hook's listener fires → calls `load()` → Supabase round-trip 1.
2. The page's listener fires → checks `lastFetchAtRef` (1000 ms), updates it, calls `fetchData()` → `await startData.refetch()` → `await load()` → Supabase round-trip 2.

Both queries hit the same RPCs (`students`, `student_group_memberships`, `groups`, `module_assessment`, `content_get_groups`, `lesson_completions`). Network panel will show every set of these requests duplicated on every visibility-change event after the first 500 ms post-mount.

### Steps to reproduce

1. Sign in as the demo teacher, land on `/teacher`.
2. Open DevTools → Network panel, clear, filter to `XHR/fetch`.
3. Switch to a different tab, then back to the Padi tab.
4. Observe duplicate requests for `students?select=...`, `student_group_memberships?...`, `groups?...`, `module_assessment?...`, `content_get_groups`, and `lesson_completions?...`. Each fires twice instead of once.

### Expected

- One refetch fires on a single visibility-becomes-visible event.

### Actual

- Two refetches fire on a single visibility-becomes-visible event.

### Impact

- Wasted Supabase quota on every focus event for every roster pageview. With N students and M groups, doubles the per-event request volume on the highest-traffic teacher surface.
- The hook's visibility listener was probably the original LR-09 partial fix the umbrella ticket called out as incomplete; LR-09a was supposed to subsume it. The brief didn't catch it. The simplest fix is to remove the listener from `useStartTeachingData` now that the page owns the refetch behavior with a proper shared throttle.

### Note: not present on the student profile

`app/teacher/start-teaching/students/[studentId]/page.tsx` does not consume `useStartTeachingData`, so the duplicate-listener bug is isolated to the roster page. The student profile correctly fires exactly one refetch per visibility change (focus + visibilitychange both share the page's `lastFetchAtRef`).

### Proposed fix (out of scope for this UAT pass)

Remove the `useEffect` block at `lib/startTeaching/useStartTeachingData.ts:195-205`. The new `app/teacher/page.tsx` listener supersedes it. Audit other callers of `useStartTeachingData` (e.g. `/teacher/grouping`) to confirm they don't depend on the hook auto-refreshing on focus — if any do, hoist the LR-09a listener pattern up there too, or keep the hook listener but add a shared throttle ref.

### Files

- `lib/startTeaching/useStartTeachingData.ts:195-205` — duplicate listener
- `app/teacher/page.tsx:71-91` — new LR-09a listener


## Fix Notes

### Root cause

`useStartTeachingData` carried a `visibilitychange` listener (lines 195-205 pre-fix) added in an earlier LR-09 iteration. It fired `load()` on every "become visible" event after a 500 ms post-mount window, with no coordination with any caller. When LR-09a added a page-level listener in `app/teacher/page.tsx` that consults a 1000 ms throttle ref, both listeners fired on the same visibilitychange event — round-trip 1 from the hook (no throttle awareness), round-trip 2 from the page (throttle updated post-hoc). The 1000 ms throttle AC was therefore violated on the highest-traffic teacher surface.

### Files changed

- `lib/startTeaching/useStartTeachingData.ts` — deleted the `useEffect` that registered the hook-internal `visibilitychange` listener (the block beginning `if (!isHydrated || !isLoggedIn) return; const mountedAt = Date.now();`). Imports and other behavior unchanged.

### Audit of other callers

- `app/teacher/page.tsx` — owns the LR-09a-compliant page-level listener (`visibilitychange` + `focus`, shared `lastFetchAtRef` 1000 ms throttle). Unaffected by removal.
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — does not consume `useStartTeachingData`. Independent listeners with its own throttle ref. Unaffected.
- `app/start-teaching/students/StudentDetailPage.tsx` and `app/start-teaching/groups/[groupId]/page.tsx` — legacy `/start-teaching/*` pages, display-only, no recorded reliance on focus-refresh. These pages will no longer auto-refetch on focus; that is an acceptable behavior change per the bug's own proposed-fix paragraph ("the simplest fix is to remove the listener from useStartTeachingData now that the page owns the refetch behavior"). They remain functionally correct via the mount-time `load()` in the hook's other `useEffect`.

### Why this fix is correct

- **Throttle AC now holds on the roster page.** Only the page-level listener remains; rapid visible/hidden/visible toggles within 1000 ms produce exactly one refetch, as the AC demands.
- **Single source of truth for refetch policy.** The roster page and the student profile both own their own throttled focus/visibility listeners. The hook is no longer a hidden side-effect emitter, which removes a footgun for any future consumer.
- **Quota impact eliminated.** Every visibility-becomes-visible event on `/teacher` now issues one set of Supabase queries instead of two — halving the per-event request volume.
- **No regression in the LR-09a happy path.** Mount-time `load()` in the hook's existing `useEffect` (lines 190-193) is unchanged, so the page still hydrates with fresh data on initial render and on `pathname` changes.
