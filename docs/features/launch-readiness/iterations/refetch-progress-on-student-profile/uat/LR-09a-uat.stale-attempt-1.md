---
id: LR-09a-UAT
title: "UAT: Refetch progress on student profile + roster after lesson completion + pulse on increase"
type: uat
status: in_review
parent: LR-09a
feature: launch-readiness
created: 2026-05-22
updated: 2026-05-22
ran_by: padi-uat-agent
methodology: code-review-fallback
---

Verdict: FAIL

## Why FAIL (in one line for the orchestrator)

The canonical Happy-Path AC ("pulse fires on navigate-back from a completed lesson") cannot fire under the implementation as shipped because `router.push(backHref)` triggers a fresh mount, and the pulse effect deliberately suppresses pulses on fresh mount per the "Pulse not on initial mount" AC. Bug filed: KAN-154. Additionally, the roster double-fetches on every visibility change because `useStartTeachingData` carries its own unrelated `visibilitychange` listener that the new LR-09a page-level listener does not coordinate with — violating the 1000 ms throttle AC for the roster. Bug filed: KAN-155.

## Scope

Verify every AC in `.buildloop/iterations/001/feature-refined.md` covering:
- Happy path (complete lesson → navigate back)
- Pulse-only-on-increase, never on initial mount or decrease
- Window focus refetch
- Pathname re-entry refetch
- Throttle (1000 ms)
- No loading flicker on refetch
- Start-teaching roster refresh (no pulse)
- Empty / error / mid-flight-logout edge cases
- Mobile 375×667
- No regression to LR-11a / LR-10a / KAN-51 / KAN-64 / LR-13d / LR-13e
- Lint + tsc clean (validation context confirmed by orchestrator)

## Methodology

Chrome MCP tools are not available in this environment. UAT performed via:
- Source-of-truth read of both touched files (`app/teacher/start-teaching/students/[studentId]/page.tsx`, `app/teacher/page.tsx`) and all listed do-not-touch surfaces.
- Code-review-fallback against each AC.
- Live `pnpm lint` and `pnpm tsc --noEmit` against the working tree (both exit 0; 1 new warning per the orchestrator's note).
- Curl probes of `http://localhost:3000/teacher/start-teaching` and `http://localhost:3000/teacher/start-teaching/students/<uuid>` to confirm routes serve (both 200).
- Grep audit of every `visibilitychange` listener in the repo to verify single-listener coverage on each page.

## Results

| #     | Scenario                                                       | Status | Bug                                                                                                                          | Severity |
|-------|----------------------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------|----------|
| UAT-01 | Happy path: complete lesson → navigate back → count + pulse   | FAIL   | docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-154-pulse-skipped-on-router-push-happy-path.md | P2       |
| UAT-02 | Pulse only on increase, never on decrease                      | PASS   | —                                                                                                                            | —        |
| UAT-03 | Pulse not on initial mount                                     | PASS   | —                                                                                                                            | —        |
| UAT-04 | Window focus refresh + pulse                                   | PASS   | —                                                                                                                            | —        |
| UAT-05 | Pathname re-entry refetch (deps include pathname)              | PASS   | —                                                                                                                            | —        |
| UAT-06 | Throttle on student profile (1000 ms, focus + visibility share) | PASS   | —                                                                                                                            | —        |
| UAT-07 | Throttle on roster (1000 ms)                                   | FAIL   | docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-155-roster-double-fetch-visibility-change.md | P2       |
| UAT-08 | No loading flicker on refetch                                  | PASS   | —                                                                                                                            | —        |
| UAT-09 | Start-teaching roster card refresh after completion (no pulse) | PASS   | —                                                                                                                            | —        |
| UAT-10 | Empty state — zero completions, no pulse, no flicker           | PASS   | —                                                                                                                            | —        |
| UAT-11 | Error state — refetch failure, existing data retained          | PASS\* | —                                                                                                                            | —        |
| UAT-12 | Auth state — mid-flight logout short-circuits fetch            | PASS   | —                                                                                                                            | —        |
| UAT-13 | Mobile 375×667 — visibilitychange parity, no layout shift      | PASS   | —                                                                                                                            | —        |
| UAT-14 | No regression to LR-11a / LR-10a / KAN-51 / KAN-64             | PASS   | —                                                                                                                            | —        |
| UAT-15 | No regression to LR-13d / LR-13e / per-chapter sub-counts      | PASS   | —                                                                                                                            | —        |
| UAT-16 | Lint + tsc + build clean                                       | PASS\*\* | docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-156-followup-roster-fetchdata-missing-dep-warning.md | P3       |

\* PASS with caveat: the outer `fetchData` has no try/catch on the first Supabase call. A throw escapes through `.finally(...)` as an unhandled promise rejection (logged red by the browser) instead of a clean `console.error`. The AC says "console.error logs the failure" + "No new console errors" — slightly in tension. Existing data does stay on screen, no error UI shows, no pulse fires. Calling this PASS-with-caveat since the user-facing behavior matches the AC; the console hygiene is a paper cut. Logged as part of KAN-154's discussion section if a tidy-up pass is wanted.

\*\* PASS with one new warning the orchestrator already flagged for tracking (KAN-156).

### Scenario detail

#### UAT-01 — Happy path FAIL
- Expected: after `router.push(backHref)` from the lesson page lands the user on the student profile, the count updates AND an emerald-100 pulse appears on the count node for ~220 ms.
- Actual: count updates correctly; pulse never fires.
- Evidence (code review): `students/[studentId]/page.tsx:372-384` pulse effect bails out with `if (!mountedRef.current) { prevCompletedCountRef.current = completedCount; return; }` on the fresh mount. `mountedRef.current = true` only flips after the first fetch resolves; by then the pulse effect has already memo'd the new count as the "previous" baseline, so the subsequent re-render with the same count doesn't trigger an increase. Lesson page uses `router.push(backHref)` at lines 516 and 607, and `<Link href={backHref}>` at line 428 — all of which cause a fresh mount of the student profile.
- Bug filed: docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-154-pulse-skipped-on-router-push-happy-path.md

#### UAT-02 — Pulse only on increase PASS
- `if (completedCount > prevCompletedCountRef.current)` — equal counts and decreases both fall through. Verified at `students/[studentId]/page.tsx:377`.

#### UAT-03 — Pulse not on initial mount PASS
- The `mountedRef.current === false` guard suppresses the pulse on the first render. Verified at `students/[studentId]/page.tsx:373-376`.

#### UAT-04 — Window focus refetch + pulse PASS
- Page-level `focus` listener at `students/[studentId]/page.tsx:338-343` calls `fetchData()` when `mountedRef.current === true` and throttle window passed. The new `completedCount` flows through and the pulse effect fires the emerald flash because `mountedRef.current` is now true.

#### UAT-05 — Pathname re-entry refetch PASS
- The main `useEffect` deps include `pathname` (`students/[studentId]/page.tsx:325`). Re-entering the same student route from a different leaf fires a fresh mount and re-fetch.

#### UAT-06 — Throttle on student profile PASS
- Both `maybeRefetch` (visibility) and `onFocus` share `lastFetchAtRef` with `Date.now() - ref < 1000` guards. The mount effect ALSO updates `lastFetchAtRef.current = Date.now()` so the first focus event ~50 ms post-mount is suppressed correctly. Lines 321, 333, 340.

#### UAT-07 — Throttle on roster FAIL
- The page-level visibility/focus listeners in `app/teacher/page.tsx:71-91` correctly throttle against `lastFetchAtRef`.
- BUT `useStartTeachingData` has its OWN visibilitychange listener at `lib/startTeaching/useStartTeachingData.ts:195-205` that fires `load()` independently. Both listeners fire on a single visibility-change event after mount + 500 ms, producing two full data-fetch round-trips (students, group_memberships, groups, module_assessment, content_get_groups, lesson_completions).
- Bug filed: docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-155-roster-double-fetch-visibility-change.md

#### UAT-08 — No loading flicker PASS
- The original `fetchData` body never explicitly called `setLoading(true)` at the top — the build-summary audit note covers this. `useState(true)` only fires on the very first render. Subsequent fetches end with `setLoading(false)` which is a no-op on already-false state. No flicker.

#### UAT-09 — Roster card refresh PASS
- `app/teacher/page.tsx` mount + listener effects both call `fetchData → startData.refetch → load`. On return, `liveStudents` is replaced, which flows through the `cards` useMemo on the next render. Latest-observation snippet at line 484-487 consumes the same source. No pulse on roster — verified by absence of any `countJustChanged` logic in this file.

#### UAT-10 — Empty state PASS
- Zero completions → completedCount = 0. The pulse effect runs the `mountedRef.current === false` branch first (sets prev to 0, returns). On subsequent refetches when count is still 0, `0 > 0` is false → no pulse, no setCountJustChanged. No flicker because loading was already false.

#### UAT-11 — Error state PASS-with-caveat
- The KAN-64 memberships block and the LR-13d latest-observation block both have try/catch with `console.error` logging. The outer `fetchData` does NOT have a try/catch around its first call (`sb.from('students').select(...).single()`). A throw there escapes through `.finally(() => { mountedRef.current = true })` as an unhandled promise rejection. Existing state stays on screen (no setStudent/setChapters call fires). No error UI replaces the data. No pulse (completedCount unchanged). User-facing AC behavior satisfied. Console-hygiene AC slightly bent.

#### UAT-12 — Auth state PASS
- Both `fetchData` (line 130) and the mount effect (line 320) early-return on `!isHydrated || !isLoggedIn`. The visibility/focus listeners call `fetchData()` which also short-circuits. No Supabase calls fire when logged out.

#### UAT-13 — Mobile 375×667 PASS
- visibilitychange is the standard mobile Safari event for PWA background return — same code path, no platform branch.
- Pulse span uses `inline-block rounded px-1 transition-colors duration-200` UNCONDITIONALLY (the padding and inline-block render every time, regardless of `countJustChanged`); only `bg-emerald-100` toggles. So no layout shift when the pulse fires/un-fires.
- No horizontal scroll risk introduced by the new code.

#### UAT-14 — No regression LR-11a / LR-10a / KAN-51 / KAN-64 PASS
- LR-11a `nextModule` useMemo (line 395) consumes `chapters` and `completedModuleIds`, both refetched. Re-derives on every refetch.
- LR-10a re-entry behavior is in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`, untouched.
- KAN-51 sticky banner is in the lesson page, untouched.
- KAN-64 memberships block (line 569-580) renders from `memberships` state set inside `fetchData`. Refetches in lockstep.

#### UAT-15 — No regression LR-13d / LR-13e / per-chapter sub-counts PASS
- LR-13d `latestObservation` set inside `fetchData` (line 243). Refetches.
- LR-13e roster snippet (`latestObservationNotes` on `CardData`) comes from `startData.students`. `startData.refetch` repopulates.
- Per-chapter sub-counts: `chapters[i].groups.reduce((s, g) => s + g.completedCount, 0)` at line 624-625; `g.completedCount` is computed inside the `fetchData` build at line 290 from the freshly fetched `completionIds`. Refreshes in lockstep with top-level count — they share the same memoization seed.

#### UAT-16 — Lint + tsc + build PASS with followup
- `pnpm lint`: 0 errors, 3 warnings. 2 pre-existing in `app/teacher/grouping/page.tsx` (out of scope per orchestrator). 1 new on `app/teacher/page.tsx:62`. Filed as KAN-156.
- `pnpm tsc --noEmit`: exit 0.
- `pnpm build`: confirmed PASS by orchestrator (not re-run here).

## Notes for padi-eng

1. **KAN-154 (pulse not firing on happy path):** the simplest fix is to persist `prevCompletedCount` to `sessionStorage` keyed by `studentId` when the lesson completes, then have the student profile read it on mount as the pulse baseline. Adds ~5 lines, no schema, no new deps. Lives in two files: the lesson page (on successful `lesson_completions.insert`, write to sessionStorage), and the student profile (in the mount effect, read sessionStorage and seed `prevCompletedCountRef.current` instead of `completedCount`).
2. **KAN-155 (roster double-fetch):** remove the `useEffect` block at `lib/startTeaching/useStartTeachingData.ts:195-205`. The new `app/teacher/page.tsx` listener supersedes it. Audit `/teacher/grouping` to confirm it doesn't depend on the hook auto-refreshing on focus — if it does, hoist the LR-09a listener pattern up to that page too.
3. **KAN-156 (lint warning followup):** inline the `fetchData` callback or extract a local for `refetch`. Trivial.
4. **Outer fetchData error path (paper cut):** wrap the `await sb.from('students')...single()` in a try/catch with `console.error('LR-09a fetchData student fetch:', err)`. Aligns the console-hygiene AC with the existing KAN-64 / LR-13d catch blocks below.

## Notes for padi-design

- The pulse is the legibility signal the refined spec called out as the "fix the success feels invisible" lever. KAN-154 means that lever doesn't pull on the most common teacher journey today. If the spec resolution is "no pulse on initial mount wins," consider whether a different success signal (toast, header banner, brief Latest-observation highlight) should land on the navigate-back path to keep the trust loop legible.

## Missing from ticket

- The AC tension between "Happy path: pulse fires after navigate-back" and "Pulse not on initial mount" was not resolved. The router.push behavior of the lesson page (which already uses router.push, NOT router.back) makes these two ACs mutually exclusive in the current architecture. The refined spec's "Refined from spar" point #6 acknowledged the router.push pattern but did not address that it precludes a happy-path pulse.
- The engineering brief's "Existing state to be aware of" section for `app/teacher/page.tsx` did not mention `useStartTeachingData`'s pre-existing visibilitychange listener. That gap is the direct cause of KAN-155.

## Run history

### 2026-05-22 — padi-uat-agent (iteration 001)
- Verdict: FAIL
- Scenarios: PASS 13 / FAIL 2 / PASS-caveat 1
- Methodology: code-review-fallback (Chrome MCP not available in this environment)
- Bugs filed:
  - docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-154-pulse-skipped-on-router-push-happy-path.md (P2)
  - docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-155-roster-double-fetch-visibility-change.md (P2)
  - docs/features/launch-readiness/iterations/refetch-progress-on-student-profile/bugs/kan-156-followup-roster-fetchdata-missing-dep-warning.md (P3, followup)
- Notes for padi-eng: see "Notes for padi-eng" section above.
- Notes for padi-design: pulse legibility lever doesn't pull on canonical happy-path; consider alternate success signal.
- Missing from ticket: AC tension between Happy-Path and Pulse-Not-On-Initial-Mount under router.push; engineering brief omitted the pre-existing useStartTeachingData visibility listener.
