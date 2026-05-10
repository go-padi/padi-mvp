---
id: LR-08-uat-2
title: "[UAT] LR-08 narrow slice — re-run after eng_fix attempt 1 (KAN-138)"
type: uat
status: passed
parent: LR-08
feature: lr-08-demo-anonymize-banner
created: 2026-05-10
updated: 2026-05-10
buildloop_iteration: 4
round: 2
previous_round: LR-08-uat-1
---

## Scope

Re-run UAT after eng_fix attempt 1 against the round-1 P1 bug (`kan-138-teacher-page-banner-not-canonical.md`). The fix added `import { PREVIEW_BANNER } from '@/lib/copy/previewCopy'` to `app/teacher/page.tsx` and replaced the inline `Anonymous preview: …` string at line 160 with `{PREVIEW_BANNER}`. This round re-checks every AC from the refined LR-08 ticket, with extra attention to the previously failing surface and the previously-flagged narrow grep.

## Environment

- Dev server: `http://localhost:3000` (Next.js, port 3000, running prior to this run)
- Branch under test: `buildloop/lr-08-demo-anonymize-banner`
- Diff base: `main`
- Test run: 2026-05-10, automated curl + source inspection + tsc

## Scenarios

### UAT-01 — `/teacher` (logged-out) shows canonical banner (regression check for KAN-138)
- **Given:** a logged-out user
- **When:** they navigate to `http://localhost:3000/teacher`
- **Then:** the amber preview banner reads exactly `Preview mode — sign in to use your own data.` and the legacy `Anonymous preview:` copy is not present.
- **Status:** ✅
- **Evidence:**
  - `curl -s http://localhost:3000/teacher | grep -oE "Anonymous preview[^<]*"` → empty.
  - `curl -s http://localhost:3000/teacher | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`.
  - Rendered HTML: `<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Preview mode — sign in to use your own data.</div>`.
  - Source: `app/teacher/page.tsx:14` imports `PREVIEW_BANNER`; `app/teacher/page.tsx:160-162` renders `{PREVIEW_BANNER}` inside the amber-banner div.

### UAT-02 — Demo names anonymized in `lib/demo/demoStudents.ts`
- **Given:** the source file under test
- **When:** inspecting `lib/demo/demoStudents.ts`
- **Then:** the three students are named `Sparky M.`, `Pixel R.`, `Comet T.`; `Maya`, `Nia`, `Eli` do not appear anywhere under `lib/demo/`.
- **Status:** ✅
- **Evidence:**
  - `grep -rEn "name: '" lib/demo/demoStudents.ts` → `Sparky M.` (line 14), `Pixel R.` (line 23), `Comet T.` (line 32).
  - `grep -rEn "Maya|Nia|Eli" lib/demo` → 0 matches.

### UAT-03 — `/teacher/curriculum` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/curriculum`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/curriculum | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/curriculum/page.tsx:16, 281` imports and renders `{PREVIEW_BANNER}`.

### UAT-04 — `/teacher/curriculum/<chapter>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/curriculum/ch-01`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/curriculum/ch-01 | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/curriculum/[chapter]/page.tsx:10, 68`.

### UAT-05 — `/teacher/grouping` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/grouping`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/grouping | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/grouping/page.tsx:12, 63`.

### UAT-06 — `/start-teaching/students/<id>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/start-teaching/students/stu-1`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅ (verified via source review; SSR returns a `Loading...` shell because the page is `'use client'` and gates content on hydration of `useStartTeachingData` and `useAuth`.)
- **Evidence:** `app/start-teaching/students/StudentDetailPage.tsx:11` imports `PREVIEW_BANNER`; line 119 renders `{PREVIEW_BANNER}` inside the `mode === 'preview'` branch. No other inline banner phrasing remains in this file.

### UAT-07 — `/start-teaching/groups/<gid>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/start-teaching/groups/<gid>` for any valid demo group id
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ⏸️ BLOCKED — same as round 1. `lib/demo/demoGroups.ts:14` exports `demoGroups: DemoGroup[] = []`, so no fixture demo group exists to render the route's "found" branch. Source at `app/start-teaching/groups/[groupId]/page.tsx:6, 42` correctly imports and renders `{PREVIEW_BANNER}`; the file would render the canonical banner if a group fixture existed. Out of scope for LR-08; logging carry-over.

### UAT-08 — Old banner phrasings gone from in-scope surfaces (required grep from prompt)
- **Given:** the working tree on the branch under test
- **When:** running `grep -rEn "Anonymous preview|Read-only preview|This is demo data" app components | grep -v assessments`
- **Then:** 0 matches
- **Status:** ✅
- **Evidence:** `grep -rEn "Anonymous preview|Read-only preview|This is demo data" /Users/nishaiyer/Desktop/padi-app/padi-app-starter/app /Users/nishaiyer/Desktop/padi-app/padi-app-starter/components | grep -v assessments` → 0 matches (no output, exit 1 from final pipe).

### UAT-09 — Logged-in branch unchanged in `app/teacher/layout.tsx`
- **Given:** the source file under test
- **When:** inspecting line 40 of `app/teacher/layout.tsx`
- **Then:** the truthy branch of the ternary still reads `'Workspace tools enabled for this session.'`
- **Status:** ✅
- **Evidence:** `grep -n "Workspace tools enabled" app/teacher/layout.tsx` → line 40: `{isLoggedIn ? 'Workspace tools enabled for this session.' : PREVIEW_BANNER}`. `isDashboardView` gate at line 19 unchanged.

### UAT-10 — Assessments surface untouched vs `main`
- **Given:** the diff against `main`
- **When:** running `git diff --name-only main...HEAD -- app/teacher/assessments/page.tsx`
- **Then:** no output (file unchanged)
- **Status:** ✅
- **Evidence:** `git diff --name-only main...HEAD -- app/teacher/assessments/page.tsx` → empty output, exit 0.

### UAT-11 — No PII emails in `lib/demo/*.ts`
- **Given:** the demo data files
- **When:** running `grep -iE "@[A-Za-z0-9.-]+\.(com|org|edu|net|io)" lib/demo/*.ts`
- **Then:** 0 matches
- **Status:** ✅
- **Evidence:** grep returns no output.

### UAT-12 — Mobile (375×667) banner wraps cleanly, no horizontal scroll
- **Given:** the affected surfaces rendered at viewport 375×667
- **When:** the banner element renders
- **Then:** banner text wraps cleanly inside the container with no horizontal scrollbar
- **Status:** ✅ (verified by source/HTML inspection; no headless browser available)
- **Evidence:** the rendered banner uses `rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800` with no fixed widths, `whitespace-nowrap`, or horizontal-overflow utilities. The string is 45 characters; at 375px viewport with `px-4` padding it has ~327px content width and soft-wraps with no horizontal scroll.

### UAT-13 — TypeScript compiles cleanly
- **Given:** the working tree on the branch under test
- **When:** running `pnpm tsc --noEmit`
- **Then:** exit code 0, no errors
- **Status:** ✅
- **Evidence:** `pnpm tsc --noEmit` → exit 0, no diagnostics.

### UAT-14 — `PREVIEW_BANNER` imported on all in-scope surfaces (now 7, was 6)
- **Given:** the working tree
- **When:** running `grep -rEn "PREVIEW_BANNER" app`
- **Then:** every in-scope surface imports + uses the canonical constant
- **Status:** ✅
- **Evidence:** grep returns 14 matches across 7 files — `app/teacher/layout.tsx` (lines 6, 40), `app/teacher/page.tsx` (lines 14, 161) [newly added by KAN-138 fix], `app/teacher/curriculum/[chapter]/page.tsx` (10, 68), `app/teacher/curriculum/page.tsx` (16, 281), `app/teacher/grouping/page.tsx` (12, 63), `app/start-teaching/groups/[groupId]/page.tsx` (6, 42), `app/start-teaching/students/StudentDetailPage.tsx` (11, 119). 1 import + 1 usage each.

## Run history

### 2026-05-10 — padi-uat-agent (automated re-run after KAN-138 eng_fix attempt 1, BuildLoop iter 4)
- Verdict: PASS
- Scenarios: ✅ 13 / ❌ 0 / 🐛 0 / ⏸️ 1
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | `/teacher` logged-out shows canonical banner (KAN-138 regression) | ✅ | — | — |
  | UAT-02 | Demo names anonymized in `demoStudents.ts` | ✅ | — | — |
  | UAT-03 | `/teacher/curriculum` logged-out shows canonical banner | ✅ | — | — |
  | UAT-04 | `/teacher/curriculum/<chapter>` logged-out shows canonical banner | ✅ | — | — |
  | UAT-05 | `/teacher/grouping` logged-out shows canonical banner | ✅ | — | — |
  | UAT-06 | `/start-teaching/students/<id>` logged-out shows canonical banner | ✅ | — | — |
  | UAT-07 | `/start-teaching/groups/<gid>` logged-out shows canonical banner | ⏸️ | — | — |
  | UAT-08 | Old banner phrasings gone (full grep incl. `Anonymous preview`) | ✅ | — | — |
  | UAT-09 | Logged-in branch in `teacher/layout.tsx` unchanged | ✅ | — | — |
  | UAT-10 | Assessments surface untouched vs `main` | ✅ | — | — |
  | UAT-11 | No PII emails in `lib/demo/*.ts` | ✅ | — | — |
  | UAT-12 | Mobile 375×667 wraps cleanly | ✅ | — | — |
  | UAT-13 | TypeScript compiles cleanly | ✅ | — | — |
  | UAT-14 | `PREVIEW_BANNER` imported + used on all in-scope surfaces (7 files) | ✅ | — | — |
- **Notes for padi-eng:**
  - KAN-138 fix held cleanly: `app/teacher/page.tsx:14` imports `PREVIEW_BANNER`; line 161 renders `{PREVIEW_BANNER}`. No collateral changes detected.
  - The "Read-only demo" pill labels at `app/teacher/page.tsx:195` and `:221` and the `Preview how Padi guides your lessons and planning.` sub-headline at `app/teacher/page.tsx:152` remain — they are explicitly out of LR-08 narrow-slice scope but should be queued for the broader preview-copy audit in a follow-up ticket.
- **Notes for padi-design:**
  - `/teacher` now shows two amber signals (canonical banner + "Read-only demo" pill in header) plus the secondary sub-headline. Visual hierarchy still noisy. Recommend reviewing whether all three are needed on this route in a follow-up.
- **Missing from ticket:**
  - UAT-07 (`/start-teaching/groups/<gid>`) is still blocked because `lib/demo/demoGroups.ts` exports an empty array. AC needs either a fixture or an explicit carve-out in a follow-up.
  - Bug KAN-138 is closed by this run. The previously-flagged narrow verification grep in the LR-08 ticket has been superseded; the round-2 grep used here (`Anonymous preview|Read-only preview|This is demo data`) is the version that should be canonicalized for any follow-up audit.

Verdict: PASS
