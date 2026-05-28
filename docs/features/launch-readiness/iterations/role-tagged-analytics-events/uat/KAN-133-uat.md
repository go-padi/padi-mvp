---
id: KAN-133-UAT
title: "UAT: Role-tagged analytics events"
type: uat
status: in_review
parent: KAN-133
feature: role-split
created: 2026-05-28
ran_by: cowork-source-review-fallback
methodology: source-review + validators (build CLI socket-dropped mid-build; remaining edits completed orchestrator-resident, then statically verified — uat-tester agent not invoked to avoid a third socket drop this session)
---

Verdict: PASS

## Context

The build CLI socket-dropped after completing only 1 of 4 emit sites (the lesson-page `LESSON_STARTED` augmentation). The orchestrator-resident session completed the remaining 3 emit sites directly from the eng-brief, caught + fixed a regression the partial build introduced (a new exhaustive-deps lint warning), and verified statically. Analytics events cannot be meaningfully exercised without a live PostHog key + full-funnel email round-trip, so source-review + validators is the appropriate verification (consistent with prior analytics-wiring UATs).

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| 1 | `role_selected` emitted on role-pick with `{ role }` | PASS | `app/welcome/role/page.tsx:66` — `track(ANALYTICS_EVENTS.ROLE_SELECTED, { role: selected })`, placed AFTER the successful profiles upsert + import added |
| 2 | `student_created` carries `role` (students page) | PASS | `app/students/page.tsx:48` — `{ is_first: isFirstChild, role }` |
| 3 | `student_created` emitted from AddStudentModal with `role` | PASS | `components/AddStudentModal.tsx:94` — `{ is_first: false, role }` after successful insert + import added |
| 4 | `lesson_started` carries `role` | PASS | lesson page `:308` — `role` added to props; AND `:310` — `role` added to the useEffect dep array (see regression note) |
| 5 | Props minimal on `role_selected` (no PII) | PASS | `{ role: selected }` only — no user_id/email/name |
| 6 | Reuse existing enum names (no parallel events) | PASS | All four use `ANALYTICS_EVENTS.*` from lib/analytics.ts; no new names added |
| 7 | Analytics failures swallowed | PASS | `track()` helper try/catches internally (lib/analytics.ts:30-34); emits placed after the success branch so a throw can't break the flow |
| 8 | No double-fire on role pick | PASS | emit inside `handleSubmit` after upsert success, not in render; guarded by the early `if (!selected || ...) return` |
| 9 | `pnpm lint` exit 0, ZERO warnings | PASS | clean after the dep-array fix (KAN-153 baseline restored) |
| 10 | `pnpm tsc --noEmit` exit 0 | PASS | exit 0, no output |
| 11 | `pnpm build` exit 0, no Next.js advisory | PASS | "✓ Compiled successfully in 1728ms"; KAN-167 suppression intact |
| 12 | `pnpm vitest run` all pass | PASS | 4 files / 31 tests |
| 13 | No regression on KAN-137c / SIGNIN-3 / other features | PASS | diff confined to the 4 emit-site files; lib/analytics.ts untouched; KAN-137c `signup_completed` emit untouched |

## Regression caught + fixed during this iter

The partial build added `role` to the `LESSON_STARTED` useEffect body but NOT to the effect's dependency array, introducing a `react-hooks/exhaustive-deps` warning (`310:6 ... missing dependency: 'role'`). This would have broken the KAN-153 zero-warning baseline. The orchestrator-resident session added `role` to the dep array (`}, [studentId, moduleRow?.code, chapter, role]`). Re-lint: 0 warnings. Had the build CLI completed normally, the eng-brief's validation step would have caught this — the manual completion preserved the same gate.

## Run history

### 2026-05-28 — cowork source-review fallback (iter-003)
- Verdict: PASS
- 13/13 ACs verified, 1 regression caught + fixed (exhaustive-deps), 0 bugs filed
- Build CLI socket-dropped at 1/4 emit sites; completed orchestrator-resident
