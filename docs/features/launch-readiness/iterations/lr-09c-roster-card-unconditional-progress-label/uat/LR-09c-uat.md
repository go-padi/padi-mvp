---
id: LR-09c-UAT
parent: LR-09c
feature: launch-readiness
iteration: 4
loop_id: 2026-05-12T16:39:00Z-4992
created: 2026-05-12
updated: 2026-05-12
---

# LR-09c UAT — Roster-card progress label unconditional

Verdict: PASS

Scope: roster card label at `app/teacher/page.tsx` lines 334–426 must invoke
`formatProgressLabel({ completedCount, totalCount: data.totalCurriculumModules })`
unconditionally in live mode; the demo CardData regex at lines 68/81 must
remain; `useStartTeachingData` must thread `totalCurriculumModules` via the
existing `Promise.all`.

## Scenarios

### UAT-01 — Live mode, normal student
Status: ✅
- Given: logged-in teacher, curriculum seeded (RPC returns 32 groups summing to module_count=328), student `Olivia Iyer` with `completedCount: 3`.
- When: teacher views `/teacher`.
- Then: roster card label reads "3 of 328 modules complete" (helper `normal` intent).
- Evidence:
  - Hook: `lib/startTeaching/useStartTeachingData.ts:55` adds `sb.rpc('content_get_groups', { p_teaching_mode: null })` to the existing `Promise.all`. Sum at lines 60–63; field exposed at lines 33, 64, 211.
  - Render: `app/teacher/page.tsx:336-340` unconditionally calls helper with `data.totalCurriculumModules`. Label render at 400-402 branches on `data.mode`; live path uses `helperResult.label`.
  - DB ground truth via Supabase: `SELECT * FROM content_get_groups(p_teaching_mode := NULL)` returns 32 rows totalling `module_count = 328` (verified). Student `Olivia Iyer` shows `completed_count = 3` via `module_assessment`. Helper formula → "3 of 328 modules complete".
  - Cross-surface: `app/teacher/start-teaching/students/[studentId]/page.tsx:154-258` builds `allModules` from the same `content_get_groups(null)` plus modules across every returned group (both teaching_mode flavors). `totalCount = allModules.length` therefore equals the same 328 the roster uses, so the profile heading at line 345 produces the identical "3 of 328 modules complete" string. ✅ cross-surface consistent.

### UAT-02 — Live mode, empty student (0 completions)
Status: ✅
- Given: logged-in teacher, student `Rex Iyer` (id 7ed34369…) with `completedCount: 0`.
- When: teacher views `/teacher`.
- Then: roster card label reads "Not started".
- Evidence:
  - DB ground truth: `Rex Iyer` has zero rows in `module_assessment` (completed_count=0). `totalCurriculumModules` resolves to 328 in live mode.
  - Helper at `lib/copy/progressCopy.ts:22-23` returns `{ label: "Not started", intent: "empty" }` for `completedCount <= 0 && totalCount > 0`.
  - Render path lines 400-402: live → `helperResult.label` → "Not started".
  - Regression note: the result is independent of `students.progress_label` content because the regex gate is removed from the render block.

### UAT-03 — Live mode, all complete
Status: ✅ (code-verified; no production student currently at this state)
- Given: hypothetical student with `completedCount === totalCurriculumModules`.
- When: teacher views `/teacher`.
- Then: roster card label reads "All 328 modules complete".
- Evidence:
  - Helper at `lib/copy/progressCopy.ts:25-26` returns `{ label: "All ${totalCount} modules complete", intent: "all-complete" }` when `completedCount >= totalCount`.
  - The roster code now feeds `completedCount` from `card.completedCount` (sourced from the actual `module_assessment` count, not from a stringly-typed `progress_label`), so this branch fires correctly when a student finishes the curriculum.
  - No live student currently has 328 completions (max observed = 3), so the all-complete branch is unobservable in production data but the code path is deterministic from the unchanged helper.

### UAT-04 — Demo mode (logged out)
Status: ✅
- Given: visitor on `/teacher` not logged in (`isLoggedIn = false`).
- When: page renders.
- Then: demo card labels show the legacy strings (e.g., "32% complete", "Chapter 1 of 7 — Listening" if surfaced) — never "Progress unavailable" or helper output.
- Evidence:
  - `app/teacher/page.tsx:50` sets `dataMode = 'demo'` when not logged in. The component early-returns at line 135-269 with a fully separate demo render that does **not** go through the new roster card render block at line 334-426.
  - SSR fetch of `http://localhost:3000/teacher` (200 OK, 24798 bytes) confirms rendered output uses "32% complete", "27% complete", "61% complete" with no occurrence of "Progress unavailable", "modules complete", or "Not started".
  - Defensive correctness for the live render block: lines 400-402 branch on `startData.mode === 'preview'` and return `card.progressLabel || \`${card.progressPercent}% complete\`` — the legacy fallback string, never the helper output. So even if a future code path ever hit this block with `mode === 'preview'`, demo strings would still win.

### UAT-05 — Demo CardData regex untouched (scope guard)
Status: ✅
- Given: spec says lines 68 and 81 (demo CardData construction) should remain unchanged.
- When: grep for `match(/` in `app/teacher/page.tsx`.
- Then: matches present at exactly lines 68 and 81; the removed regex at the old line ~336 is gone.
- Evidence:
  - `grep -nE "match\(/" app/teacher/page.tsx` → returns only lines 68 and 81. No regex inside the render block.
  - `grep -nE "progressMatch|formatProgressLabel" app/teacher/page.tsx` → no `progressMatch` identifier remains; `formatProgressLabel` imported at line 15 and invoked exactly once at line 337.

### UAT-06 — Error branch live with unseeded curriculum (operator state)
Status: ✅ (code-verified; environment has curriculum seeded)
- Given: live mode where `content_get_groups(null)` returns zero rows or all `module_count: null` (operator state, not currently reproducible against the seeded prod DB).
- When: teacher views `/teacher`.
- Then: `totalCurriculumModules = 0`; helper returns `{ label: "Progress unavailable", intent: "error" }`; label renders accordingly; page does not crash; the visual progress bar continues to render from `card.progressPercent` unaffected.
- Evidence:
  - `lib/startTeaching/useStartTeachingData.ts:58-63` defends against null `module_count` (`row.module_count ?? 0`). Empty rowset → `reduce` over empty array starts at 0 → `totalCurriculumModules = 0`.
  - Helper at `lib/copy/progressCopy.ts:18-20` returns `Progress unavailable` for `totalCount <= 0`.
  - The progress bar at line 407-412 binds `style.width` to `card.progressPercent`, fully decoupled from the label.

### UAT-07 — Cross-surface consistency (live)
Status: ✅
- Given: any live student.
- When: teacher views `/teacher` (roster) and clicks into the student profile.
- Then: the label on the roster matches the label on the profile heading.
- Evidence:
  - Roster denominator: `data.totalCurriculumModules` = sum of `module_count` across `content_get_groups(null)` = 328.
  - Profile denominator: `allModules.length` from `app/teacher/start-teaching/students/[studentId]/page.tsx:251-258` = total modules across all groups returned by the same `content_get_groups(null)` RPC = 328.
  - Both numerators come from `module_assessment` counts. Both surfaces feed the unchanged helper. Strings are byte-identical.

### UAT-08 — Tests pass
Status: ✅
- Evidence: `pnpm vitest run app/teacher/__tests__/role-gating.test.tsx` → 6/6 passing, including the role-gating mock updated to include `totalCurriculumModules: 0` at line 126.

## Findings (gaps in ticket / observations)

- Observation (not a bug for this ticket): `totalCurriculumModules` is the sum across BOTH teaching_mode flavors (individual + group) because the hook passes `p_teaching_mode: null` and the helper does not filter. Denominator is therefore 328, not ~156 (individual) or ~172 (group). This matches the spec literally ("sum `module_count` across all groups") and matches the student-profile page's denominator, so cross-surface consistency holds. However, "K of 328 modules complete" may feel high to teachers in single-mode tenants. **This is the same semantic on both surfaces, so it is not a regression; flagging for product because it may confuse teachers.** Not a bug under LR-09c's scope.
- Observation: the `mode === 'preview'` branch at `app/teacher/page.tsx:400-402` is effectively unreachable in current production because the explicit `dataMode === 'demo'` early-return at line 135 short-circuits before the new render block. The branch is defensive and harmless. No action needed.
- Observation: TypeScript compiles clean (`pnpm tsc --noEmit` returns no output). No new console-error risks identified.

## Run history

### 2026-05-12 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 8 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Live, normal student → "K of N modules complete" | ✅ | — | — |
  | UAT-02 | Live, empty student → "Not started" | ✅ | — | — |
  | UAT-03 | Live, all complete → "All N modules complete" | ✅ | — | — |
  | UAT-04 | Demo mode keeps legacy strings | ✅ | — | — |
  | UAT-05 | Demo regex at lines 68/81 untouched (scope) | ✅ | — | — |
  | UAT-06 | Live + curriculum unseeded → "Progress unavailable" | ✅ | — | — |
  | UAT-07 | Cross-surface consistency (roster vs profile) | ✅ | — | — |
  | UAT-08 | Tests pass | ✅ | — | — |
- Notes for padi-eng: implementation is surgical and matches spec exactly. `Promise.all` extended to 5 members (line 47), sum at lines 60–63, type at line 33, default 0 in preview at line 202, demo render unchanged. No new dependencies, no schema changes, no auth/routing changes.
- Notes for padi-design: live roster cards now read "K of N modules complete" / "Not started" / "All N modules complete" / "Progress unavailable" — same string family as the profile heading. With N=328 (both teaching_mode flavors summed) the value is large; flag for product if teachers find this surprising in single-mode tenants. Not in LR-09c scope to fix.
- Missing from ticket: spec did not call out that `content_get_groups(null)` returns BOTH teaching_mode flavors of each chapter, so `totalCurriculumModules ≈ 328` rather than ~156 or ~172. Cross-surface consistency holds because the profile page uses the same RPC the same way. If product wants a per-mode denominator later, file a follow-up.
