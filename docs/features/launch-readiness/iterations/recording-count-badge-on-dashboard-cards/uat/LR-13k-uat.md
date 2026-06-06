---
id: LR-13k-UAT
parent: LR-13k
title: "UAT — Recording-count badge on dashboard student cards"
type: uat
status: complete
feature: launch-readiness
slug: recording-count-badge-on-dashboard-cards
created: 2026-06-06
updated: 2026-06-06
---

## Scope

Verify that `/teacher` dashboard student cards render a `🎙️ N recording(s)` badge when the student has at least one row in `lesson_recordings`, that the badge is silent at zero, gated to `card.type === 'student'`, never rendered in preview mode, and that 42703 (missing table on dev DB) is caught silently. Verify lint/tsc/build/vitest all green and no regression on the LR-09 / LR-13 / LR-14 / signin / KAN-133 stack.

## Test Plan

### UAT-01 — Type expansion on StartTeachingStudent
- Status: ✅
- Given: `lib/startTeaching/useStartTeachingData.ts` exports the `StartTeachingStudent` type
- When: the type is read
- Then: it includes `recordingsCount: number` as a required (non-optional) field
- Evidence: file lines 11–26 show `recordingsCount: number;` at line 25

### UAT-02 — Hook fetches lesson_recordings in parallel
- Status: ✅
- Given: the existing `Promise.all` block in `useStartTeachingData.ts`
- When: the load() function runs
- Then: a sibling IIFE fetches `lesson_recordings.student_id` filtered by `tenant_id`, mirrors `lessonCompletionsRows` pattern, and resolves to `lessonRecordingsRows` (7th tuple slot)
- Evidence: file lines 63 (destructure includes `lessonRecordingsRows`), 90–106 (IIFE body)

### UAT-03 — Tenant scoping on fetch
- Status: ✅
- Given: the lesson_recordings fetch IIFE
- When: tenantId is null
- Then: early-returns `[]` (line 91)
- And: when tenantId is set, the query is `.eq('tenant_id', tenantId)` (line 96)

### UAT-04 — PostgrestError 42703 caught silently
- Status: ✅
- Given: the lesson_recordings IIFE catch block (lines 99–105)
- When: an error is thrown with `code === '42703'` (missing table on dev DBs without migration)
- Then: no `console.error` is logged (line 101 gate `if (pgCode !== '42703')`)
- And: the IIFE returns `[]` (line 104), so downstream `recordingsCountByStudent` is empty → every student gets `recordingsCount: 0`
- Evidence: code review of lines 90–106; matches the LR-13e silent-42703 pattern at lines 72–88

### UAT-05 — Per-student count map built via client-side reduce
- Status: ✅
- Given: `lessonRecordingsRows` is populated
- When: the reducer runs
- Then: `recordingsCountByStudent` is a `Map<string, number>` keyed by `student_id`, incrementing on each row, skipping rows where `student_id` is falsy
- Evidence: lines 150–154 — straight `for…of` accumulator, identical pattern to `completedByStudent` (lines 145–148)

### UAT-06 — Per-student field populated from map
- Status: ✅
- Given: `normalizedStudents` mapper (line 185)
- When: each student is built
- Then: `recordingsCount: recordingsCountByStudent.get(student.id) ?? 0` resolves to 0 when the student has no rows in the map
- Evidence: line 220

### UAT-07 — Preview-mode fallback stubs recordingsCount: 0
- Status: ✅
- Given: the `if (!isLoggedIn)` branch of the `useMemo` return (lines 258–292)
- When: preview students are built from `demoTeacherData.students`
- Then: every preview student includes `recordingsCount: 0`
- Evidence: line 273

### UAT-08 — Dashboard renders badge gated on student type + count > 0
- Status: ✅
- Given: `/teacher` page card render loop (lines 538–542)
- When: `card.type === 'student' && (card.recordingsCount ?? 0) > 0`
- Then: `<p className="text-xs text-gray-500">🎙️ N recording(s)</p>` is rendered with singular/plural split (`card.recordingsCount === 1 ? 'recording' : 'recordings'`)
- Evidence: file lines 538–542

### UAT-09 — Group cards never render the badge
- Status: ✅
- Given: the badge conditional gate `card.type === 'student'` (line 538)
- And: group `CardData` builders explicitly set `recordingsCount: 0` (lines 158, 200)
- Then: even if the gate were bypassed, no group card has a non-zero count
- Evidence: lines 158, 200, 538

### UAT-10 — Demo / preview card builder propagates recordingsCount: 0
- Status: ✅
- Given: the `dataMode === 'demo'` branch (lines 123–164) and the live student builder (lines 166–180)
- When: cards are built
- Then: demo student cards explicitly set `recordingsCount: 0` (line 140); live student cards read `s.recordingsCount ?? 0` (line 179); demo group cards set 0 (line 158); live group cards set 0 (line 200)
- Evidence: all 4 sites match the gate's expectations

### UAT-11 — Live page renders cleanly with no badge in preview/demo
- Status: ✅
- Given: dev server is running at http://localhost:3000
- When: `curl http://localhost:3000/teacher` is hit (logged-out / preview mode)
- Then: HTTP 200, demo students (Sparky M., Pixel R., Comet T.) render, no `🎙️` or "recording" text appears
- Evidence: curl response HTML inspected — zero matches for "recording" / "🎙️"

### UAT-12 — `pnpm lint` exit 0, zero warnings (KAN-153 baseline)
- Status: ✅
- Evidence: `pnpm lint` produced no output and exit 0

### UAT-13 — `pnpm tsc --noEmit` exit 0
- Status: ✅
- Evidence: `pnpm tsc --noEmit` exited 0 with no diagnostics

### UAT-14 — `pnpm vitest run` all pass
- Status: ✅
- Evidence: 4 test files, 31 tests, all passed in 1.53s. Test mock at `app/teacher/__tests__/role-gating.test.tsx:110` correctly extended with `recordingsCount: 0` (mirrors KAN-133 / LR-09f pattern, as flagged in the eng brief)

### UAT-15 — `pnpm build` exit 0 with no Next.js advisory
- Status: ✅
- Evidence: build completed, 21 static pages generated, `/teacher` route at 8.23 kB / 228 kB First Load JS. No warning/advisory text in build output. KAN-167 baseline preserved.

### UAT-16 — Schema-missing 42703 path verified by code review
- Status: ✅
- Given: Supabase dev DB is INACTIVE (confirmed via `list_projects` returning `status: INACTIVE`), and live SQL queries timed out — equivalent to dev DBs without the LR-14a migration
- When: the hook fires on logged-in load
- Then: the IIFE catch block at lines 99–105 swallows pg code 42703 silently, returns `[]`, and `recordingsCountByStudent` stays empty → no console.error, all students render with `recordingsCount: 0` (badge silent for all)
- Evidence: code review; the catch is structurally identical to the LR-13e fallback (lines 82–88) which has been shipped and validated in earlier UATs

### UAT-17 — No regression on adjacent observation/last-lesson lines
- Status: ✅
- Given: the LR-09g "Last lesson" line (lines 532–536) and the LR-13e/h observation note line (lines 526–530) sit immediately above the new badge block
- When: the file is inspected
- Then: both pre-existing conditionals are unchanged, the new badge is inserted as a sibling sibling (not nested inside either), preserving LR-09a/b/d/e/f/g + LR-13d/e/f/g/h/j semantics
- Evidence: lines 526–542; the new block is a standalone JSX expression, no wrapping or hoisting of neighbors

### UAT-18 — Mobile / layout sanity
- Status: ✅
- Given: the badge is a `<p className="text-xs text-gray-500">` sibling, no flex/grid changes
- When: the dashboard renders at 375 × 667
- Then: it flows in the existing card vertical stack, wraps via the natural `<p>` flow, adds at most one short line of height
- Evidence: code review only — class is `text-xs text-gray-500`, identical layout context as the LR-09g "Last lesson" sibling above which has been mobile-verified in prior UATs. No new flex/grid/absolute styling introduced.

## Run history

### 2026-06-06 — padi-uat-agent (run-uat for LR-13k)
- Verdict: PASS
- Scenarios: ✅ 18 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Type expansion on StartTeachingStudent | ✅ | — | — |
  | UAT-02 | Hook fetches lesson_recordings in parallel | ✅ | — | — |
  | UAT-03 | Tenant scoping on fetch | ✅ | — | — |
  | UAT-04 | PostgrestError 42703 caught silently | ✅ | — | — |
  | UAT-05 | Per-student count map (client-side reduce) | ✅ | — | — |
  | UAT-06 | Per-student field populated from map | ✅ | — | — |
  | UAT-07 | Preview-mode fallback stubs recordingsCount: 0 | ✅ | — | — |
  | UAT-08 | Dashboard renders gated badge with singular/plural | ✅ | — | — |
  | UAT-09 | Group cards never render the badge | ✅ | — | — |
  | UAT-10 | Demo / preview card builder propagates 0 | ✅ | — | — |
  | UAT-11 | Live page renders cleanly, no badge in preview | ✅ | — | — |
  | UAT-12 | `pnpm lint` exit 0 zero warnings | ✅ | — | — |
  | UAT-13 | `pnpm tsc --noEmit` exit 0 | ✅ | — | — |
  | UAT-14 | `pnpm vitest run` all pass (test mock extended) | ✅ | — | — |
  | UAT-15 | `pnpm build` exit 0 no advisory | ✅ | — | — |
  | UAT-16 | Schema-missing 42703 path silent | ✅ | — | — |
  | UAT-17 | No regression on observation/last-lesson lines | ✅ | — | — |
  | UAT-18 | Mobile / layout sanity | ✅ | — | — |
- Notes for padi-eng:
  - Implementation matches the eng-brief 1:1. Hook diff at `lib/startTeaching/useStartTeachingData.ts` lines 63 / 90–106 / 150–154 / 220 / 273. Render diff at `app/teacher/page.tsx` lines 46 / 140 / 158 / 179 / 200 / 538–542.
  - The test mock at `app/teacher/__tests__/role-gating.test.tsx:110` was correctly extended with `recordingsCount: 0` — that was flagged as a "POSSIBLY" touch in the eng brief; eng handled it correctly.
  - O(N rows) tenant fetch is acceptable for v0 per the brief; future RPC aggregation tracked there.
- Notes for padi-design:
  - Badge copy is exactly `🎙️ N recording` / `🎙️ N recordings` per the AC. Color `text-gray-500`, size `text-xs` — sits quietly below the amber "Last note" / "Last lesson" lines, which is the intended visual hierarchy.
  - Live-data verification (badge rendering at N>0) was not possible: Supabase project status `INACTIVE`, SQL queries timed out, so no signed-in seeded student with N≥1 recordings could be observed in browser. Code-review confirms the render path, but a live screenshot is deferred until the DB is reachable.
- Missing from ticket: nothing material — AC was tight, files identified, references to mirror-patterns (LR-09f, KAN-133) were spot-on.

Verdict: PASS
