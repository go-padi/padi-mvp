---
id: LR-09a-UAT
title: "UAT — LR-09a unify progress count rendering + refetch on lesson complete"
parent: LR-09a
feature: launch-readiness
buildloop_iteration: 1
buildloop_loop_id: 2026-05-12T16:39:00Z-4992
created: 2026-05-12
updated: 2026-05-12
---

Verdict: PASS

## Scope under test

Rendering-and-refetch subset of LR-09. Two surfaces changed:
- `app/teacher/page.tsx` (roster card)
- `app/teacher/start-teaching/students/[studentId]/page.tsx` (heading line 294, chapter row line 348, group row line 377)

Plus the canonical helper `lib/copy/progressCopy.ts` and visibility-change refetch wiring in:
- `lib/startTeaching/useStartTeachingData.ts` (roster page data hook)
- `app/teacher/start-teaching/students/[studentId]/page.tsx` (`fetchCompletions`)

Mutation site for "Save & Mark Complete":
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:304` (`markComplete`) — issues `module_assessment.upsert` then `router.push(backHref)` back to the student profile, which remounts (and re-runs the initial `useEffect` fetch).

## Scenarios

### UAT-01 — Helper returns the right `{label, intent}` for all four branches
- Status: PASS
- Method: pure-function tests against `lib/copy/progressCopy.ts` via tsx runner; 9 input cases including the four required branches plus boundary cases (negative total, NaN, over-completion).
- Result:
  - `{3, 12}` → `{ label: "3 of 12 modules complete", intent: "normal" }` PASS
  - `{12, 12}` → `{ label: "All 12 modules complete", intent: "all-complete" }` PASS
  - `{0, 12}` → `{ label: "Not started", intent: "empty" }` PASS
  - `{0, 0}` → `{ label: "Progress unavailable", intent: "error" }` PASS
  - `{5, -1}` → `{ label: "Progress unavailable", intent: "error" }` PASS
  - `{NaN, 12}` → `{ label: "Progress unavailable", intent: "error" }` PASS
  - `{13, 12}` (overflow) → `{ label: "All 12 modules complete", intent: "all-complete" }` PASS (clamped to all-complete branch — defensive)
  - `{1, 197}` (suspicious denominator) → `{ label: "1 of 197 modules complete", intent: "normal" }` PASS
- All four required branches return the exact strings from the spec.

### UAT-02 — Inline templates removed from the four enumerated callsites
- Status: PASS
- Method: grep across `app components lib` for `of \${total`, `On Lesson`, `modules complete`.
- Result: Zero matches outside `lib/copy/progressCopy.ts` itself. The single remaining `modules complete` hit at `app/teacher/start-teaching/students/[studentId]/page.tsx:329` is the celebratory all-complete banner copy ("All modules complete for {student.name}!"), which is explicitly out of scope for the four enumerated count callsites.

### UAT-03 — Helper imported and used at the four enumerated callsites
- Status: PASS
- Method: grep `from '@/lib/copy/progressCopy'` and inspection of the four line references.
- Result:
  - `app/teacher/page.tsx:15` imports the helper; line 342 invokes it for the roster card.
  - `app/teacher/start-teaching/students/[studentId]/page.tsx:13` imports the helper; lines 307 (heading), 319 (intent check for error notice), 345 (chapter row), 393 (group row error guard) invoke it.
  - Chapter row composes the helper's `label` with the surface-specific "across N group(s)" suffix per spec ("they may render an abbreviated variant if the spar-finalized abbreviation rule applies, but the underlying function is the same").
  - Group row uses the abbreviated `X/Y` form and falls back to `—` when intent is `error` — matches the helper's intent-aware branch logic.

### UAT-04 — Visibility-change refetch wired on both surfaces
- Status: PASS
- Method: grep `visibilitychange` across `app components lib`; inspect each `useEffect`.
- Result:
  - `lib/startTeaching/useStartTeachingData.ts:155-156` registers + cleans up `visibilitychange` and calls `load()` when `document.visibilityState === 'visible'` and at least 500ms has elapsed since mount (debounce per the brief).
  - `app/teacher/start-teaching/students/[studentId]/page.tsx:212-213` registers + cleans up the same listener and calls `fetchCompletions(studentId)` with the same 500ms post-mount debounce.
  - Both effects gate on `isHydrated && isLoggedIn` so they no-op in the logged-out preview branch.

### UAT-05 — Mutation path triggers refetch via remount on `router.push(backHref)`
- Status: PASS
- Method: read `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:304-374` (`markComplete`) and `backHref` at line 92.
- Result: `markComplete` upserts into `module_assessment` and then `router.push(backHref)` to `/teacher/start-teaching/students/${contextStudentId}`. The student profile page is a different route, so navigating from the module page back to it remounts the page and re-runs the initial `useEffect` at line 94, which calls `fetchCompletions(studentId)`. Counts will reflect the new completion on first render after navigation. The visibility-change handler is a second safety net for the browser-back / tab-focus case.

### UAT-06 — Back-nav from the module page to `/teacher` roster updates counts
- Status: PASS
- Method: same as UAT-05, plus inspection of `useStartTeachingData.load()` to confirm it re-reads `module_assessment` and recomputes `completedCount` per student (line 110 of the hook).
- Result: On remount of `/teacher` (or via the visibility-change listener), `load()` runs and recomputes `completedCount = completedByStudent.get(student.id) || 0` from a fresh `module_assessment` query. The roster card receives the updated count via `s.completedCount ?? 0` at `app/teacher/page.tsx:106` and re-renders the helper output. No manual refresh required.

### UAT-07 — Empty state ("Not started") for brand-new student
- Status: PASS
- Method: helper unit test plus inspection of the rendered fallback paths.
- Result:
  - Roster card: when `card.completedCount === 0` and `total > 0`, the helper returns `{ label: "Not started", intent: "empty" }`, which is rendered in the progress row at `app/teacher/page.tsx:402`.
  - Student-profile heading: same return; rendered at line 307. The page does NOT show `0 of N`, `undefined`, or `NaN` because the helper guards against these.
  - The build summary notes the brand-new student auto-expands the first chapter and the first group's first module gets a visible "Start Teaching" `Link` button (the `isCurrent` branch) — primary CTA is present. No bug filed per build summary requirement 5.

### UAT-08 — Error state ("Progress unavailable") plus inline notice
- Status: PASS
- Method: read `app/teacher/start-teaching/students/[studentId]/page.tsx:319-323`.
- Result: when `intent === 'error'` (i.e. `totalCount <= 0`), the student-profile heading renders the helper's label (`"Progress unavailable"`) and an inline `<p>` notice with the exact copy required by the spec: `"Curriculum hasn't loaded yet — try refreshing the page."`. The chapter row drops the `across N group(s)` suffix in the error branch (line 347-349). The group row shows `—` instead of `0/0` (line 394-396). No crash, no `undefined`, no `NaN`, no `0 of 0` — verified by helper unit test inputs `{0, 0}`, `{5, -1}`, `{NaN, 12}`, all returning the error label.

### UAT-09 — Auth state: logged-out preview unchanged
- Status: PASS
- Method: HTTP fetch of `/teacher` while logged out (SSR shell rendered), inspect the demo branch logic.
- Result: SSR shell renders the demo branch ("Start teaching", "Preview how Padi guides your lessons and planning.", "Demo data" badge — confirmed via `curl http://localhost:3000/teacher`). The helper only fires when `card.progressLabel` matches the `/(\d+)\/(\d+)/` regex; demo students have human-readable labels like `"Chapter 1 of 7 — Listening"` which do NOT match, so `total = 0` and the helper falls back to the original demo string (per `app/teacher/page.tsx:340-342`). Behavior matches the build summary's stated demo-data behavior. The visibility-change refetch listeners gate on `isLoggedIn` and no-op in the preview branch.

### UAT-10 — Mobile 375×667 worst-case "All 12 modules complete"
- Status: PASS
- Method: layout analysis from CSS classes; no rendered headless screenshot taken (no Playwright in repo). Inspection of the flex container math.
- Result:
  - Roster card grid is `grid gap-4 md:grid-cols-2 lg:grid-cols-3`; at 375px viewport, single column. Card width = 375 − 32px page padding = 343px; minus `p-5` (20px×2) = 303px content area.
  - Progress row: `flex items-center justify-between text-sm`. Label "All 12 modules complete" at 14px ≈ 155px. Status badge "Needs Intervention" at 11px ≈ 115px. Total ≈ 270px in 303px — fits with margin.
  - No `truncate` / `whitespace-nowrap` / `overflow-hidden` on the label, so if a longer-worst-case status caused contention, the badge would wrap rather than clip; no horizontal overflow possible. With the data the spec calls out (12/12 + "Ready" badge), no wrap. The abbreviated `"All 12/12"` fallback was therefore not required for this iteration's worst case.
  - Student-profile heading: wider container (no `max-w-*` constraint, full-width card with `p-5`). 24-char label + percent — fits without ambiguity.
  - Chapter row "All 12 modules complete across 3 groups" (40 chars at `text-xs` ≈ 200px) + 20px progress bar + 32px percent label ≈ 252px in 303px — fits.
  - Group row: abbreviated `12/12` (~5 chars at `text-xs` ≈ 25px) + 16px progress bar — fits comfortably.

### UAT-11 — Test suite + typecheck + lint pass
- Status: PASS
- Method: `pnpm tsc --noEmit`; `pnpm lint`; `pnpm vitest run`.
- Result:
  - `tsc --noEmit` exit 0 (no type errors; the `completedCount: 1` fix to the role-gating fixture works).
  - `pnpm lint` exit 0 (no warnings).
  - vitest: 18/18 tests passed across 3 files; includes the role-gating tests that exercise the new `completedCount` field on `StartTeachingStudent`.

## Run history

### 2026-05-12 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Helper `{label, intent}` branches | ✅ | — | — |
  | UAT-02 | Inline templates removed | ✅ | — | — |
  | UAT-03 | Helper used at four callsites | ✅ | — | — |
  | UAT-04 | Visibility-change refetch wired | ✅ | — | — |
  | UAT-05 | Mutation path refetch (remount) | ✅ | — | — |
  | UAT-06 | Back-nav to `/teacher` updates counts | ✅ | — | — |
  | UAT-07 | Empty state "Not started" | ✅ | — | — |
  | UAT-08 | Error state + inline notice | ✅ | — | — |
  | UAT-09 | Logged-out preview unchanged | ✅ | — | — |
  | UAT-10 | Mobile 375×667 worst case | ✅ | — | — |
  | UAT-11 | tsc + lint + vitest pass | ✅ | — | — |
- Notes for padi-eng: implementation is tight. Two minor observations (not blockers, not bugs):
  1. The helper produces `"All 1 modules complete"` for `{1, 1}` — grammatical "1 modules" is awkward. The spec literally says ``"All ${totalCount} modules complete"`` so this matches spec; if you want to fix later, pluralize via `module${n === 1 ? '' : 's'}`. Out of scope for LR-09a.
  2. On the live data path, `app/teacher/page.tsx:336-338` still extracts `total` from `card.progressLabel` via the `/(\d+)\/(\d+)/` regex — that's a pre-existing pattern, but it means `total` depends on whatever `students.progress_label` string the DB chose. If the DB-side label changes shape, the helper silently degrades to the `card.progressLabel || percent` fallback. Build summary calls this out; it's the data-layer concern deferred to the LR-09 follow-up.
- Notes for padi-design: no design issues found. The "All 12 modules complete" worst case fits without wrap; the abbreviated `"All 12/12"` fallback per spec was not needed at this iteration's worst data.
- Missing from ticket: none. The refined spec was exhaustive and matched the implementation closely.
