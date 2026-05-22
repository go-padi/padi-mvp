---
id: LR-26e-UAT
title: "UAT — Align Specialist Track legend tiles to violet on homepage + about page"
parent: LR-26e
feature: launch-readiness
iteration: 6
created: 2026-05-22
updated: 2026-05-22
status: ✅
---

Verdict: PASS

## Scope verified

Two surfaces — `app/page.tsx` homepage marketing 3-signal legend, and `app/teacher/about/page.tsx` "Three signals at a glance" legend — swapped from red palette to violet palette. Pure class-name change; emoji preserved.

## UAT-01 — Homepage legend tile renders violet (Status: ✅)

- **Precondition:** Visitor loads `/` (logged-out).
- **Action:** Inspected source `app/page.tsx:117-119` and live HTML at `http://localhost:3000/`.
- **Expected:** Specialist Track tile renders with `border-violet-100 bg-violet-50` container, `text-violet-900` title, `text-violet-800` subtitle, 🔴 emoji preserved.
- **Actual:** Source lines 117-119 render `<div class="rounded-2xl border border-violet-100 bg-violet-50 p-4"><p class="text-base font-semibold text-violet-900">🔴 Specialist Track</p><p class="mt-1 text-sm text-violet-800">Recommended for closer review</p></div>` — verified in rendered HTML.
- **Accelerating tile:** unchanged — `border-green-100 bg-green-50 text-green-800/700` ✅
- **Practicing tile:** unchanged — `border-amber-100 bg-amber-50 text-amber-900/800` ✅
- **HTTP status:** 200.

## UAT-02 — About page legend tile renders violet (Status: ✅)

- **Precondition:** Loaded `/teacher/about`.
- **Action:** Inspected source `app/teacher/about/page.tsx:148-150` and live HTML at `http://localhost:3000/teacher/about`.
- **Expected:** Specialist Track tile renders `bg-violet-50 text-violet-900 border-violet-100`, 🔴 emoji preserved.
- **Actual:** Source line 148 renders `<div class="rounded-xl border p-4 bg-violet-50 text-violet-900 border-violet-100"><p class="text-sm">🔴 <span class="font-semibold">Specialist Track</span> — Recommended for closer review with a reading specialist</p></div>` — verified in rendered HTML.
- **Accelerating + Practicing tiles** preserved with green/amber palette.
- **HTTP status:** 200.

## UAT-03 — Emoji preserved (Status: ✅)

- 🔴 emoji visible on both Specialist Track tiles in source and rendered HTML.
- Title text "Specialist Track" unchanged.
- Subtitle text unchanged on both pages.

## UAT-04 — Grep checks (Status: ✅)

- `grep -rn "bg-red-50" app/` returns 3 hits, NONE of which are the two target files:
  - `app/welcome/role/page.tsx:114` — error toast (out of scope per ticket — error state)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:74` — Specialist Track color-picker option (out of scope per ticket — color tag helper)
  - `app/teacher/grouping/page.tsx:191` — error panel (out of scope per ticket — error state)
- `grep -rn "bg-violet-50" app/` returns exactly **5** hits, matching expectations:
  1. `app/page.tsx:117` (this iter)
  2. `app/teacher/about/page.tsx:148` (this iter)
  3. `app/teacher/page.tsx:436` (LR-26d)
  4. `app/teacher/start-teaching/students/[studentId]/page.tsx:29` (LR-26d)
  5. `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:85` (LR-26d)

## UAT-05 — Lint + typecheck + build (Status: ✅)

- `pnpm lint` → exit 0, zero warnings (KAN-153 baseline preserved).
- `pnpm tsc --noEmit` → exit 0, no output.
- `pnpm build` → exit 0, all 19 static pages generated, `/` listed at 4.21 kB / `/teacher/about` at 3.73 kB.

## UAT-06 — Accessibility (Status: ✅)

- `text-violet-900` on `bg-violet-50` — ~12:1 (AAA per ticket spec).
- `text-violet-800` on `bg-violet-50` — ~9.5:1 (AAA per ticket spec).
- Verified via Tailwind palette: violet-900 (#4c1d95) on violet-50 (#f5f3ff) is well above AAA 7:1.

## UAT-07 — Regression checks (Status: ✅)

- **LR-26d teacher dashboard badge** (`app/teacher/page.tsx:436`): still `bg-violet-50 text-violet-700` ✅
- **LR-26d teacher student profile badge** (`app/teacher/start-teaching/students/[studentId]/page.tsx:29`): still `bg-violet-50 text-violet-700` ✅
- **LR-26d teacher curriculum badge helper** (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:85`): still `bg-violet-50 text-violet-700` ✅
- **Homepage hero / feature cards / footer / Why Padi / Simple section / Built by a teacher / CTA** — HTML unchanged vs pre-LR-26e (no other class diffs in app/page.tsx).
- **About page other sections** (header, daily-use steps, three-signal heading, chapter map list, etc.) — unchanged.
- **LR-26 vocab** (Accelerating / Practicing / Specialist Track copy) — unchanged.
- **LR-26b signal picker** — out of scope, not touched.

## UAT-08 — Specialist Track color-picker option (Finding — non-blocking)

- **Observation:** `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:74-75` defines an interactive Specialist Track assessment-status button that still uses `border-red-200 bg-red-50 text-red-800` / `border-red-400 bg-red-100 text-red-900`. The status badge a few lines below (line 85) is violet, so the **picker option** and the **resulting badge** are now color-inconsistent for the same status.
- **Severity:** P3 / cosmetic.
- **Scope:** Explicitly out of scope per LR-26e ticket ("error states, color tag helpers — are out of scope and may remain"). The ticket author called the same file's `bg-red-50` an acceptable remaining hit.
- **Recommendation:** File a follow-up bug/ticket — LR-26f or similar — to align the in-module color-picker option chips to violet for full palette consistency. Not blocking this iter.
- **Status:** Reported, not filed as bug under this iter.

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 7 / ❌ 0 / 🐛 0 / ⏸️ 0 (plus 1 non-blocking finding)
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Homepage legend tile renders violet | ✅ | — | — |
  | UAT-02 | About page legend tile renders violet | ✅ | — | — |
  | UAT-03 | 🔴 emoji preserved on both tiles | ✅ | — | — |
  | UAT-04 | Grep checks — bg-red-50 zero on targets, bg-violet-50 count = 5 | ✅ | — | — |
  | UAT-05 | Lint + tsc + build all exit 0 | ✅ | — | — |
  | UAT-06 | Accessibility AAA contrast | ✅ | — | — |
  | UAT-07 | No regression on LR-26d / LR-26 / LR-26b / other sections | ✅ | — | — |
  | UAT-08 | Curriculum module Specialist Track picker option still red | Finding | — | P3 |
- Notes for padi-eng: Implementation is clean and surgical — exactly the 7 class-name swaps spec'd in eng-brief, no other diff. Curriculum module color-picker option chips (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:74-75`) remain red and now visually disagree with the violet badge a few lines below — worth a follow-up LR-26f to finish palette unification.
- Notes for padi-design: Specialist Track palette is now violet across all 5 surfaces in `app/` that previously used red as the Specialist signal. Only remaining red-on-Specialist surface is the curriculum module's interactive status-selector option chip (out-of-scope per ticket). Consider whether the 🔴 emoji should also migrate to 🟣 for full color-coding alignment — currently the emoji says "alert" while the chrome says "violet/calm" which is a small semantic mismatch.
- Missing from ticket: nothing — ticket and eng-brief were precise and complete.
