---
id: KAN-133b-UAT
parent: KAN-133b
title: "UAT — Move LESSON_COMPLETED emit to success branch + add role"
type: uat
status: complete
created: 2026-06-01
updated: 2026-06-01
---

Verdict: PASS

## Scope

Two surgical edits in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:
1. Remove pre-save `LESSON_COMPLETED` emit (was at ~lines 653-657, fired before the save).
2. Insert post-success emit after the `lesson_completions` try/catch and before the `SIGNAL_OPTIONS.find` lookup, with `role` added to props.

## Scenarios

### UAT-01 — Pre-save emit removed
- Status: PASS
- Verified by reading `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:651-655`.
- `markComplete` now flows directly from `if (!tenantId || !studentId || !moduleRow) return;` (line 652) to `setSaving(true)` (line 653) and `setStatus(null)` (line 654). No emit between the guard and `setSaving`.
- Repo-wide grep confirms exactly ONE `ANALYTICS_EVENTS.LESSON_COMPLETED` reference remains across `app/`, `lib/`, `components/`.

### UAT-02 — Post-success emit lives in correct location
- Status: PASS
- Located at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:726-731`.
- Sits inside the `else` (success) branch of the `module_assessment` upsert at lines 708-748.
- Placement is AFTER the `lesson_completions` try/catch (lines 712-725) and BEFORE the `SIGNAL_OPTIONS.find` lookup (line 732) — exactly as the refined ticket specifies.

### UAT-03 — Emit props include `role`
- Status: PASS
- Props are `{ module_code: moduleRow.code, signal, student_id: studentId, role }` at lines 727-730.
- `role` comes from `useAuth()` destructure at line 112 (`const { isLoggedIn, isHydrated, tenantId, role } = useAuth();`). Same source already used by `LESSON_STARTED` at line 308 (KAN-133 baseline). No new destructure or prop drilling required.

### UAT-04 — No try/catch wrap around the emit
- Status: PASS
- The emit at lines 726-731 is a bare `track(...)` call, not wrapped in try/catch. `lib/analytics.ts` `track()` already swallows errors.

### UAT-05 — No false positive on save failure
- Status: PASS (verified by code review)
- The error branch at lines 708-711 (`if (error) { console.error(error); setStatus('Failed to mark complete.'); }`) returns without entering the `else` block — so a failed `module_assessment` upsert produces NO `LESSON_COMPLETED` emit. The pre-save emit (the false-positive defect) is gone.

### UAT-06 — `lesson_completions` insert failure still emits (intentional per refined ticket)
- Status: PASS
- The refined ticket §"Refined from spar" states: "the emit reflects 'the user is about to see the success UX' — both the module_assessment upsert AND the lesson_completions insert have already resolved (including the catch)". The emit is placed after the catch (line 725) so that a soft `lesson_completions` failure (logged via `console.error('LR-10a lesson_completions insert:', lcErr)`) does not block the emit. This matches the spec — the user still sees the success UX (confirmation, pulse signal, router.push) on `lesson_completions` failure, so the analytics emit aligns with the user-visible outcome.

### UAT-07 — Untouched: state machine, sessionStorage, router.push, notes, audio
- Status: PASS
- `setSaving(true)` at line 653; `setSaving(false)` in `finally` at line 750 — unchanged.
- `setStatus(null)` at line 654 — unchanged.
- `sessionStorage.setItem('padi:pulse-pending:${studentId}', '1')` at line 742 (KAN-154) — unchanged.
- `setTimeout(() => router.push(backHref), 2500)` at line 747 — unchanged.
- Notes + `teaching_notes` insert at lines 657-689 — unchanged.
- Audio upload to `lesson-attachments` at lines 662-678 — unchanged.

### UAT-08 — No regression on KAN-133 events
- Status: PASS
- `LESSON_STARTED` at line 304 still includes `role` at line 308 — unchanged.
- ROLE_SELECTED / STUDENT_CREATED / SIGNUP_COMPLETED / password reset / LR-30b APP_ERROR / LR-14 audio recording stack — not touched by this iteration (single-file diff).

### UAT-09 — Build, lint, typecheck, tests
- Status: PASS
- `pnpm lint` → exit 0, zero warnings (KAN-153 baseline).
- `pnpm tsc --noEmit` → exit 0, no output.
- `pnpm build` → exit 0; module page compiles at 9.17 kB / 229 kB First Load JS; no Next.js advisory (KAN-167 baseline preserved).
- `pnpm vitest run` → 4/4 test files, 31/31 tests pass in 1.09s.

### UAT-10 — Sanity grep
- Status: PASS
- `grep -c "ANALYTICS_EVENTS.LESSON_COMPLETED" app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` → `1`.
- Repo-wide grep across `app/`, `lib/`, `components/` finds the same single reference at line 726 with `role` four lines below.

## Run history

### 2026-06-01 — padi-uat-agent (KAN-133b)
- Verdict: PASS
- Scenarios: PASS 10 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Pre-save emit removed | PASS | — | — |
  | UAT-02 | Post-success emit placement | PASS | — | — |
  | UAT-03 | `role` in props | PASS | — | — |
  | UAT-04 | No try/catch wrap | PASS | — | — |
  | UAT-05 | No false positive on save failure | PASS | — | — |
  | UAT-06 | lesson_completions failure semantics | PASS | — | — |
  | UAT-07 | State machine / sessionStorage / router.push / notes / audio unchanged | PASS | — | — |
  | UAT-08 | No KAN-133 regression | PASS | — | — |
  | UAT-09 | lint / tsc / build / vitest all green | PASS | — | — |
  | UAT-10 | Sanity grep | PASS | — | — |
- Notes for padi-eng: Edit lands exactly where the eng brief said — line 726 inside the success `else`, after the `lesson_completions` try/catch at line 725, before the `SIGNAL_OPTIONS.find` at line 732. `role` reused from the existing `useAuth()` destructure at line 112; no new imports or prop drilling. Clean, surgical diff.
- Notes for padi-design: N/A — no user-visible surface changed. Confirmation message, emerald pulse signal (KAN-154), and 2500 ms redirect to the student profile are untouched.
- Missing from ticket: None. The "Refined from spar" note correctly anticipated the placement-after-the-catch question.
