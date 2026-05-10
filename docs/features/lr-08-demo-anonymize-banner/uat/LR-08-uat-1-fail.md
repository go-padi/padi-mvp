---
id: LR-08-uat-1
title: "[UAT] LR-08 narrow slice — anonymize demo student names + standardize preview banner"
type: uat
status: failed
parent: LR-08
feature: lr-08-demo-anonymize-banner
created: 2026-05-10
updated: 2026-05-10
buildloop_iteration: 4
---

## Scope

Verify the narrow-slice changes shipped in iteration 4:

1. Demo student names in `lib/demo/demoStudents.ts` anonymized to `Sparky M.`, `Pixel R.`, `Comet T.`
2. New canonical banner string `PREVIEW_BANNER` exported from `lib/copy/previewCopy.ts` and used on six listed surfaces.
3. `app/teacher/assessments/page.tsx` deliberately untouched.
4. Logged-in branch in `app/teacher/layout.tsx` ternary preserved.

## Environment

- Dev server: `http://localhost:3000` (Next.js, port 3000)
- Branch under test: `buildloop/lr-08-demo-anonymize-banner`
- Diff base: `main`
- Test run: 2026-05-10, automated curl + source inspection (no headless browser available; client-only routes verified by source + SSR Loading state)

## Scenarios

### UAT-01 — Demo names anonymized in `lib/demo/demoStudents.ts`
- **Given:** the source file under test
- **When:** inspecting `lib/demo/demoStudents.ts`
- **Then:** the three students are named `Sparky M.`, `Pixel R.`, `Comet T.`; none of `Maya`, `Nia`, or `Eli` appear anywhere under `lib/demo/`.
- **Status:** ✅
- **Evidence:**
  - File contents: `name: 'Sparky M.'`, `name: 'Pixel R.'`, `name: 'Comet T.'` at `lib/demo/demoStudents.ts:14, 23, 32`.
  - `grep -rEn "Maya|Nia|Eli" lib/demo` → 0 matches.

### UAT-02 — `/teacher` (logged-out) shows canonical preview banner
- **Given:** a logged-out user
- **When:** they navigate to `http://localhost:3000/teacher`
- **Then:** the amber preview banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ❌
- **Actual:** the banner reads `Anonymous preview: sign in to manage students, groups, and lesson progress.` (rendered from `app/teacher/page.tsx:160`, untouched by this iteration). `Preview mode — sign in to use your own data.` does **not** appear in the rendered HTML for `/teacher`.
- **Expected:** `Preview mode — sign in to use your own data.`
- **Evidence:**
  - `curl -s http://localhost:3000/teacher | grep -oE "Anonymous preview[^<]*"` → `Anonymous preview: sign in to manage students, groups, and lesson progress.`
  - `curl -s http://localhost:3000/teacher | grep -oE "Preview mode[^<]*"` → empty.
  - Root cause: `app/teacher/layout.tsx:19-25` `isDashboardView` excludes `/teacher` itself, so the layout's `PREVIEW_BANNER` never renders on this route.
- **Bug filed:** `docs/features/lr-08-demo-anonymize-banner/bugs/kan-138-teacher-page-banner-not-canonical.md` (severity P1)

### UAT-03 — `/teacher/curriculum` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/curriculum`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/curriculum | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/curriculum/page.tsx:280-282` uses `{PREVIEW_BANNER}`.

### UAT-04 — `/teacher/curriculum/<chapter>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/curriculum/ch-01`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/curriculum/ch-01 | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/curriculum/[chapter]/page.tsx:67-69` uses `{PREVIEW_BANNER}`.

### UAT-05 — `/teacher/grouping` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/teacher/grouping`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅
- **Evidence:** `curl -s http://localhost:3000/teacher/grouping | grep -oE "Preview mode[^<]*"` → `Preview mode — sign in to use your own data.`. Source at `app/teacher/grouping/page.tsx:62-64` uses `{PREVIEW_BANNER}`.

### UAT-06 — `/start-teaching/students/<id>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/start-teaching/students/stu-1`
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ✅ (verified via source review; SSR returns `Loading...` because the page is `'use client'` and gates content on hydration of `useStartTeachingData` and `useAuth`).
- **Evidence:** `app/start-teaching/students/StudentDetailPage.tsx:117-120` renders `{PREVIEW_BANNER}` inside the `mode === 'preview'` branch. The import is wired (line 11). Constant resolves to the canonical string per `lib/copy/previewCopy.ts:1`. No other inline banner phrasing remains in this file.

### UAT-07 — `/start-teaching/groups/<gid>` (logged-out) shows canonical banner
- **Given:** a logged-out user
- **When:** they navigate to `/start-teaching/groups/<gid>` for any valid demo group id
- **Then:** the banner reads exactly `Preview mode — sign in to use your own data.`
- **Status:** ⏸️ BLOCKED — `lib/demo/demoGroups.ts:14` exports `demoGroups: DemoGroup[] = []`, so no fixture demo group exists to render this route's "found" branch. Source at `app/start-teaching/groups/[groupId]/page.tsx:41-43` correctly uses `{PREVIEW_BANNER}` and the import (line 6) resolves to the canonical constant; the file would render the canonical banner if a group fixture existed. Documenting per the run instructions; not filing as a bug because the source change is correct and the missing fixture is out of scope for LR-08.

### UAT-08 — Old banner phrasings gone from in-scope surfaces
- **Given:** the working tree on the branch under test
- **When:** running `grep -rEn "Preview mode[ :—-]|Read-only preview|This is demo data" app components | grep -v assessments`
- **Then:** 0 matches
- **Status:** ✅ (the specified grep returns 0 matches).
- **Note:** the verification grep is **too narrow** — it does not match `Anonymous preview:` (still present at `app/teacher/page.tsx:160`). See bug KAN-138 and the "Missing from ticket" note below. Filed as a finding against ticket completeness in addition to the surface-level bug.

### UAT-09 — Logged-in branch unchanged in `app/teacher/layout.tsx`
- **Given:** the source file under test
- **When:** inspecting line 40 of `app/teacher/layout.tsx`
- **Then:** the truthy branch of the ternary still reads `'Workspace tools enabled for this session.'`
- **Status:** ✅
- **Evidence:** `grep -n "Workspace tools enabled" app/teacher/layout.tsx` → `40:                    {isLoggedIn ? 'Workspace tools enabled for this session.' : PREVIEW_BANNER}`.

### UAT-10 — Assessments surface untouched vs `main`
- **Given:** the diff against `main`
- **When:** running `git diff --name-only main...HEAD -- app/teacher/assessments/page.tsx`
- **Then:** no output (file unchanged)
- **Status:** ✅
- **Evidence:** `git diff main...HEAD -- app/teacher/assessments/page.tsx | wc -l` → `0`.

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
- **Status:** ✅ (verified by source inspection — no headless browser available).
- **Evidence:** all banner instances use `rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800` (or `text-sm`) wrapped inside the layout's `container` (`app/layout.tsx`), with no fixed widths, no `whitespace-nowrap`, and no horizontal-overflow utilities. The string is 45 characters; at 375px viewport with `px-4` padding it has ~327px content width and wraps to two lines using browser default soft-wrap. No flex children with `flex-nowrap` constrain it.

### UAT-13 — TypeScript compiles cleanly
- **Given:** the working tree on the branch under test
- **When:** running `pnpm tsc --noEmit`
- **Then:** exit code 0, no errors
- **Status:** ✅
- **Evidence:** `pnpm tsc --noEmit` → exit 0, no diagnostics. `pnpm lint` → clean.

### UAT-14 — `PREVIEW_BANNER` imported on all 6 in-scope surfaces
- **Given:** the working tree
- **When:** running `grep -rEn "PREVIEW_BANNER" app`
- **Then:** at least 6 import lines + 6 usage lines (12 matches total across the 6 files)
- **Status:** ✅
- **Evidence:** grep returns 12 matches across `app/teacher/layout.tsx`, `app/teacher/curriculum/[chapter]/page.tsx`, `app/teacher/curriculum/page.tsx`, `app/teacher/grouping/page.tsx`, `app/start-teaching/groups/[groupId]/page.tsx`, `app/start-teaching/students/StudentDetailPage.tsx` (1 import + 1 usage each).

## Run history

### 2026-05-10 — padi-uat-agent (automated, BuildLoop iter 4)
- Verdict: FAIL
- Scenarios: ✅ 12 / ❌ 1 / 🐛 0 / ⏸️ 1
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Demo names anonymized in `demoStudents.ts` | ✅ | — | — |
  | UAT-02 | `/teacher` logged-out shows canonical banner | ❌ | docs/features/lr-08-demo-anonymize-banner/bugs/kan-138-teacher-page-banner-not-canonical.md | P1 |
  | UAT-03 | `/teacher/curriculum` logged-out shows canonical banner | ✅ | — | — |
  | UAT-04 | `/teacher/curriculum/<chapter>` logged-out shows canonical banner | ✅ | — | — |
  | UAT-05 | `/teacher/grouping` logged-out shows canonical banner | ✅ | — | — |
  | UAT-06 | `/start-teaching/students/<id>` logged-out shows canonical banner | ✅ | — | — |
  | UAT-07 | `/start-teaching/groups/<gid>` logged-out shows canonical banner | ⏸️ | — | — |
  | UAT-08 | Old banner phrasings gone from in-scope surfaces | ✅ | — | — |
  | UAT-09 | Logged-in branch in `teacher/layout.tsx` unchanged | ✅ | — | — |
  | UAT-10 | Assessments surface untouched vs `main` | ✅ | — | — |
  | UAT-11 | No PII emails in `lib/demo/*.ts` | ✅ | — | — |
  | UAT-12 | Mobile 375×667 wraps cleanly | ✅ | — | — |
  | UAT-13 | TypeScript compiles cleanly | ✅ | — | — |
  | UAT-14 | `PREVIEW_BANNER` imported on all 6 surfaces | ✅ | — | — |
- **Notes for padi-eng:**
  - `app/teacher/page.tsx:160` still hard-codes `Anonymous preview: sign in to manage students, groups, and lesson progress.` — replace with `{PREVIEW_BANNER}` and add the import. This is the route-level surface for `/teacher` that the layout-level banner never reaches because `app/teacher/layout.tsx:19-25` `isDashboardView` excludes `/teacher`.
  - Consider whether the `/teacher` page-level banner should be deleted entirely once the layout banner is shown for `/teacher` (would require expanding `isDashboardView` to include `/teacher`). Current architecture has two separate banners — the layout one for sub-routes and the page-level one for the root — which is exactly the inconsistency LR-08 tried to eliminate.
  - The "Read-only demo" pill labels at `app/teacher/page.tsx:195` and `:221` are a separate banner-shaped element on the student/group preview lists; not in LR-08 narrow-slice scope but worth flagging for the broader audit. Same for the secondary `Preview how Padi guides your lessons and planning.` sub-headline at `app/teacher/page.tsx:152`.
- **Notes for padi-design:**
  - `/teacher` shows two amber-toned signals (banner + "Demo data" pill in header) and a third sub-headline; combined with the now-canonical banner, the visual hierarchy gets noisy. After fix, consider reviewing whether all three are still needed on this route.
- **Missing from ticket:**
  - Pre-build survey listed `app/teacher/layout.tsx:39` as the banner site for the `/teacher` surface, but the layout banner is gated by `isDashboardView` and never renders on `/teacher`. The actual `/teacher` banner is in `app/teacher/page.tsx:160` and was never on the survey list.
  - Verification grep `"Preview mode[ :—-]|Read-only preview|This is demo data"` is too narrow — it does not match `Anonymous preview:`, so the missed surface slipped through. Recommend extending the grep in any follow-up ticket.
  - `/start-teaching/groups/<gid>` is in the AC but `lib/demo/demoGroups.ts` exports an empty array; no live route exists to render. AC needs either a fixture or an explicit "skip if no demo group fixture" carve-out.

Verdict: FAIL
