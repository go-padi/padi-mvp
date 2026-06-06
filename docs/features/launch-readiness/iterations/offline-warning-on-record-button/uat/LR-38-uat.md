---
id: LR-38-UAT
title: "UAT — LR-38 Offline warning on Record button"
parent: LR-38
feature: launch-readiness
created: 2026-06-06
updated: 2026-06-06
ran_by: padi-uat-agent
---

Verdict: PASS

## Scope verified

Single-file change to `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:
- Line 22: `import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';`
- Line 148: `const online = useOnlineStatus();` (component scope, near other hook calls)
- Lines 940–948: conditional warning `<p>` block, rendered inside the recorder gating wrapper

`git diff HEAD~1 -- app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` shows exactly +10 / -0 lines, matching the eng-brief spec character-for-character (import, hook call, conditional block).

## Results

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| UAT-01 | Hook imported in target file | PASS | Line 22 — `import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';` |
| UAT-02 | Hook called inside the component | PASS | Line 148 — `const online = useOnlineStatus();` placed alongside `useLessonRecorder` |
| UAT-03 | Warning paragraph uses `role="status"` + `aria-live="polite"` | PASS | Lines 942–943 |
| UAT-04 | Amber styling on warning | PASS | `className="text-xs text-amber-800"` — line 944 (above WCAG AA on white card bg) |
| UAT-05 | Warning render gated on `!online` | PASS | `{!online && (...)}` — line 940 |
| UAT-06 | Warning lives INSIDE the recorder gating block | PASS | Wrapper at line 883: `{isLoggedIn && tenantId && contextStudentId && moduleRow?.code && (...)}`; warning at line 940 sits inside this block, closing `)}` at line 979. Logged-out / no-tenant / no-student-context / no-module users never see the warning. |
| UAT-07 | Position: after recorder buttons (idle/recording/uploading/success/error), before LR-14c "Prior recordings" list | PASS | Recorder state blocks end at line 939 (error state closes). Warning is lines 940–948. LR-14c `{recordings.length > 0 && ...}` block starts at line 949. Order verified. |
| UAT-08 | Record button is NOT disabled when offline | PASS | The conditional only renders the `<p>`; idle/recording buttons are untouched. No `disabled={!online}` was added anywhere. The `uploading` state remains the only button-disabling state. |
| UAT-09 | `pnpm lint` exit 0, zero warnings (KAN-153 baseline) | PASS | `pnpm lint` → `eslint .` produced no output, exit 0 |
| UAT-10 | `pnpm tsc --noEmit` exit 0 | PASS | No output, exit 0 |
| UAT-11 | `pnpm build` exit 0, no Next.js advisory (KAN-167 baseline) | PASS | Build completed; 21 routes including `/teacher/curriculum/[chapter]/[group]/[module]` (9.35 kB / 229 kB First Load JS); no Next.js advisory printed |
| UAT-12 | `pnpm vitest run` all pass | PASS | 4 test files, 31/31 tests pass, duration 1.23s |
| UAT-13 | Grep sanity — `useOnlineStatus` count == 2 | PASS | `grep -c useOnlineStatus` → 2 (import + call) |
| UAT-14 | Grep sanity — warning copy count == 1 | PASS | `grep -c "Offline — recording will fail"` → 1 |
| UAT-15 | LR-37 `useOnlineStatus` hook signature unchanged | PASS | `lib/hooks/useOnlineStatus.ts` still exports `useOnlineStatus(): boolean`; ssr-safe init to `true`; online/offline event wiring identical to LR-37 ship |
| UAT-16 | No regression on LR-14a/b/c/d/e/f stack | PASS | Diff is purely additive; no edits to `useLessonRecorder`, idle/recording/uploading/success/error blocks, `PrivacyDisclosureModal`, recordings list, delete button, or cap notice |
| UAT-17 | No regression on Mark lesson complete, LR-11b, LR-09a, LR-13c-g, KAN-51, LR-36, KAN-133b, SIGNIN-3/4/5/6, LR-30/30b/31 | PASS | None of these surfaces are touched. Only the single targeted file changed. Build of all 21 routes succeeded without warnings. |
| UAT-18 | Dev server reachable at http://localhost:3000 | PASS | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/teacher` → 200 |

## Notes for padi-eng

None. Implementation matches eng-brief exactly: one import, one hook call, one conditional `<p>` block, correctly nested inside the existing recorder gating wrapper. No new test surface is required per the eng-brief out-of-scope list, and the LR-37 hook already carries the offline-state contract.

## Notes for padi-design

None. Amber `text-amber-800` on white card background satisfies the WCAG AA contrast specified in the ticket. Copy matches the ticket verbatim. Position (between recorder buttons and prior-recordings list) is correct.

## Missing from ticket

None.

## Run history

### 2026-06-06 — padi-uat-agent
- Verdict: PASS
- Scenarios: 18 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Evidence:
  - `git diff HEAD~1 -- app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` → +10 lines, matches eng-brief
  - `grep -c useOnlineStatus <file>` → 2
  - `grep -c "Offline — recording will fail" <file>` → 1
  - `pnpm lint` → exit 0, no output
  - `pnpm tsc --noEmit` → exit 0
  - `pnpm vitest run` → 31/31 pass
  - `pnpm build` → exit 0, all 21 routes built
  - `curl http://localhost:3000/teacher` → 200
- Bugs filed: none
