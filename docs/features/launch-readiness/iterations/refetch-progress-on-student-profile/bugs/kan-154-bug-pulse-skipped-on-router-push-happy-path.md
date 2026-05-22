---
id: KAN-154
title: "[LR-09a] Pulse never fires on the canonical happy-path (lesson → back-link → student profile)"
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

The LR-09a "Happy path" AC says: after a teacher marks a lesson complete and clicks the in-app back link to the student profile, the count should refresh AND "a subtle `bg-emerald-100` flash appears on the count number for ~220 ms." In the shipped implementation, the count refresh happens but the pulse never fires on this path.

### Root cause

The lesson page (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`) navigates back via `router.push(backHref)` (lines 516 and 607), where `backHref = /teacher/start-teaching/students/<id>`. In Next.js App Router, navigating between sibling leaf segments under the same layout unmounts the previous leaf and mounts the new one. The back-link in the lesson page header is a `<Link href={backHref}>` (line 428) — same behavior, fresh mount.

When the student profile mounts fresh, the pulse `useEffect` (at `students/[studentId]/page.tsx:372-384`) runs with `mountedRef.current === false`, which deliberately sets `prevCompletedCountRef.current = completedCount` and returns without setting `countJustChanged`. The `mountedRef.current = true` flip then occurs in the main effect's `.finally(...)` (line 322-324), but the pulse effect doesn't re-run unless `completedCount` changes again (it won't, since the data is now in steady state).

Net result: pulse never fires after a navigate-back even though the count value updates correctly. This directly violates the AC quoted above.

### AC tension

This finding is partially a spec problem. LR-09a's refined ticket contains two ACs that are mutually exclusive under the `router.push` navigation pattern that the lesson page actually uses:

- **Happy path:** pulse SHOULD fire after navigate-back
- **Pulse not on initial mount:** pulse SHOULD NOT fire on a fresh mount

`router.push` from a sibling segment IS a fresh mount. The implementation honored "Pulse not on initial mount." Either the spec resolution needs to clarify which behavior wins, or the implementation needs an additional signal (e.g. session-storage handoff of the prior completedCount, or a Router event flag set by the lesson page on completion).

### Steps to reproduce

1. Sign in as the demo teacher and navigate to `/teacher/start-teaching/students/<some-id>`.
2. Note the top-level count, e.g. "Lesson 5 of 197".
3. Click into a lesson module from the chapter accordion or the "Next up" CTA.
4. Mark the lesson complete (any signal). Wait the ~2.5 s for the auto-`router.push(backHref)`.
5. Observe the student profile page now reads "Lesson 6 of 197" — but no emerald flash appears on the count.

### Expected

- Count refreshes (verified PASS).
- An emerald-100 pulse appears for ~220 ms on the count node.

### Actual

- Count refreshes.
- No pulse — the count node renders with `inline-block rounded px-1 transition-colors duration-200` unconditionally but `bg-emerald-100` is never applied because `countJustChanged` never flips to `true` on this path.

### Where pulse DOES work (verified by code review)

- Window-focus refetch path (open profile in tab A, complete lesson in tab B, focus tab A): focus listener fires while `mountedRef.current === true`, `completedCount` increases, pulse effect fires correctly. PASS.
- visibilitychange refetch path (PWA / mobile background return): same logic, PASS.

### Proposed fixes (pick one, all out of scope for this UAT pass)

1. **Spec-side resolution:** decide which AC wins. If "no initial-mount pulse" wins (current behavior), update the Happy-Path AC to acknowledge the pulse only fires on focus/visibility/path-re-entry within the same mounted instance.
2. **Implementation-side:** persist `prevCompletedCount` to `sessionStorage` keyed by `studentId` on the lesson-complete write, so the freshly mounted profile reads the prior value and pulses on increase.
3. **Implementation-side (lighter):** swap the lesson page's `router.push(backHref)` for `router.back()` AND ensure the student profile uses a stable instance via the layout — out of scope, would conflict with KAN-153 chapter-link routing.

### Severity rationale

P2 — the count refresh (the most important behavior) works correctly. The pulse is the "legibility polish" layer; its absence on the canonical happy path means the success is functional but not legible, exactly what the refined ticket called out as the gap in the first place.

### Files

- `app/teacher/start-teaching/students/[studentId]/page.tsx:372-384` — pulse effect
- `app/teacher/start-teaching/students/[studentId]/page.tsx:319-325` — mount effect
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:516, 607` — `router.push(backHref)` call sites
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:428` — back link


## Fix Notes

### Root cause

`router.push(backHref)` from the lesson page navigates between sibling leaf segments under the same layout, which unmounts the lesson and mounts a fresh student profile. The pulse `useEffect` runs with `mountedRef.current === false` on first render (deliberate, to avoid pulsing on initial visits), so it seeds `prevCompletedCountRef` to the new count and returns without setting `countJustChanged`. The `mountedRef.current = true` flip happens in the main effect's `.finally(...)`, but the pulse effect never re-runs because `completedCount` doesn't change again from steady state.

This resolves the AC tension noted in the bug by implementing fix option 2 ("persist a signal across the navigate-back"). Specifically: the lesson page declares intent ("this navigation just completed a lesson — please pulse"), and the student profile consumes that intent. The "no pulse on initial mount" AC remains honored for fresh visits (URL paste, sidebar nav, etc.) where no signal is present.

### Files changed

- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — in `markComplete`, after a successful `module_assessment` upsert and `lesson_completions` insert, write `sessionStorage["padi:pulse-pending:<studentId>"] = "1"` right before scheduling the `router.push(backHref)`.
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — in the mount effect's `.finally(...)`, after flipping `mountedRef.current = true`, read the `padi:pulse-pending:<studentId>` flag; if present, clear it, set `countJustChanged = true`, and schedule the 220 ms clear timeout to match the existing pulse animation.

### Why this fix is correct

- **Honors both ACs.** The "happy path" AC fires the pulse on the canonical lesson-complete → navigate-back flow because the lesson page emits the signal. The "no initial-mount pulse" AC still holds for any other entry to the student profile (fresh URL, sidebar nav, refresh) because no signal is present.
- **No spec conflict left over.** The two ACs were only mutually exclusive given the `router.push` unmount/mount pattern *with no out-of-band signal*. The sessionStorage hand-off is exactly that out-of-band signal, scoped to a single navigation.
- **Scoped by `studentId`.** The key includes the studentId, so a completion on one student does not pulse another student's profile if the user navigates somewhere unexpected.
- **Single-use semantics.** The flag is removed on read, so a subsequent unrelated mount (e.g. a refresh after the pulse already fired) does not re-pulse.
- **Defensive against SSR/sandboxed environments.** Both read and write are guarded by `typeof window !== 'undefined'` and wrapped in `try {} catch {}`, so storage exceptions (private mode, quota) silently degrade to "no pulse" rather than throwing in the lesson-complete flow.
- **No interference with existing pulse paths.** The window-focus and visibilitychange listeners still fire the pulse the same way they did before, via the `completedCount > prevCompletedCountRef.current` branch of the pulse `useEffect`.
