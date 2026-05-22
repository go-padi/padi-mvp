---
id: LR-26d-UAT
title: UAT — Soften 'Specialist Track' badge palette from red to violet
parent: LR-26d
feature: launch-readiness
iteration: 005
status: complete
created: 2026-05-22
updated: 2026-05-22
ran_by: padi-uat-agent
verdict: PASS
---

# UAT — LR-26d — Specialist Track badge palette swap (red → violet)

Verdict: PASS

Scope per refined ticket and eng brief: **badge palette only** — three literal `bg-red-50 text-red-700` occurrences are swapped to `bg-violet-50 text-violet-700` across three files. No other behavior, vocab, schema, or palette is in scope.

## Scenarios

### UAT-01 — Pre-edit red literal eliminated from app/
Status: PASS

- Given: the badge palette literal `bg-red-50 text-red-700` previously appeared at three sites
- When: `grep -rn "bg-red-50 text-red-700" app/ components/` is run on the current tree
- Then: zero hits expected
- Actual: **0 hits in `app/`, 0 hits in `components/`**. Verified.

### UAT-02 — Violet replacement present in all three target sites
Status: PASS

- Given: three files were specified to receive the swap
- When: `grep -rn "bg-violet-50 text-violet-700" app/` is run
- Then: exactly three hits at the documented line numbers
- Actual: exactly **3 hits**:
  - `app/teacher/page.tsx:436` (inline ternary in dashboard `statusBadgeClass`)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:85` (switch case in lesson-page helper)
  - `app/teacher/start-teaching/students/[studentId]/page.tsx:29` (switch case in student-profile helper)
- Diff confirms each is a single-line literal swap; no surrounding code modified.

### UAT-03 — Student profile renders violet badge for Specialist Track
Status: PASS (code-review verification)

- Given: a student with `assessmentStatus === 'Specialist Track'`
- When: `/teacher/start-teaching/students/<id>` loads and calls `statusBadgeClass('Specialist Track')`
- Then: the helper returns `'bg-violet-50 text-violet-700'`
- Actual: `app/teacher/start-teaching/students/[studentId]/page.tsx:28-29` switch case returns the violet literal. AssessmentStatus type and consumer JSX untouched. Verified via Read.

### UAT-04 — Lesson detail / KAN-51 sticky banner renders violet
Status: PASS (code-review verification)

- Given: the sticky student-context banner on the lesson page consumes the local `statusBadgeClass` for a Specialist Track student
- When: `/teacher/curriculum/[chapter]/[group]/[module]` loads with a Specialist Track student in context
- Then: the helper returns `'bg-violet-50 text-violet-700'`
- Actual: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:85` switch case returns the violet literal. Other branches (Accelerating green, Practicing amber, In progress blue, Not started gray) verified unchanged at lines 83-87.

### UAT-05 — Dashboard roster card renders violet
Status: PASS (code-review verification)

- Given: a student card on `/teacher` has `card.status === 'Specialist Track'`
- When: the card renders and the inline ternary at line 435 evaluates the status
- Then: `statusBadgeClass` resolves to `'bg-violet-50 text-violet-700'`
- Actual: `app/teacher/page.tsx:435-436` ternary branch returns the violet literal. Adjacent branches (Accelerating, Practicing, In progress, Not started) verified intact at lines 431-439.

### UAT-06 — No regression on Accelerating / Practicing / In progress / Not started palettes
Status: PASS

- Given: four other status values share the same helpers
- When: grep across the three changed files for the other palettes
- Then: each remains present exactly as before
- Actual:
  - `bg-green-50 text-green-700` — 3 sites intact (one per file)
  - `bg-amber-50 text-amber-700` — 3 sites intact
  - `bg-blue-50 text-blue-700` — 4 sites intact (dashboard has two: status pill + a separate cohort pill at line 461; verified untouched)
  - `bg-gray-100 text-gray-600` — 3 sites intact

### UAT-07 — Lint passes with zero warnings (KAN-153 baseline)
Status: PASS

- Command: `pnpm lint`
- Exit code: **0**
- Warnings: **0**
- Output: clean — `eslint .` produced no diagnostics. KAN-153 baseline preserved.

### UAT-08 — Typecheck passes
Status: PASS

- Command: `pnpm tsc --noEmit`
- Exit code: **0**
- Output: no diagnostics.

### UAT-09 — Production build passes
Status: PASS

- Command: `pnpm build`
- Exit code: 0 (`✓ Compiled successfully in 1505ms` and `✓ Generating static pages (19/19)`)
- Note: a pre-existing benign warning printed — `⚠ The Next.js plugin was not detected in your ESLint configuration` — this is unrelated to LR-26d (it is an ESLint plugin notice present on the prior `main` baseline). Not a regression.

### UAT-10 — Accessibility contrast for violet badge
Status: PASS

- `text-violet-700` (#6d28d9) on `bg-violet-50` (#f5f3ff): luminance-derived contrast ratio ≈ 6.5:1
- Badge text is 11px / `font-semibold` → WCAG "normal text" → AA threshold 4.5:1 → **PASS**
- Also clears AAA threshold (7:1) only at large-text grade; small-text AAA threshold is 7:1, so it lands a hair short of AAA for small text. Within ticket-stated tolerance ("approximately 6.5:1 — meets WCAG AA comfortably"). No action required.

### UAT-11 — Logged-out state unaffected
Status: PASS

- `/teacher` logged-out fallback returns HTTP 200; rendered HTML contains zero violet-* or red-* class tokens (no badge rendered because no roster shown). No regression on the logged-out fallback flow surfaced by LR-17.

### UAT-12 — Out-of-scope surfaces (`AssessmentStatus`, `assessmentStatusCaption`, `normalizeAssessmentStatus`, LR-26b signal picker) untouched
Status: PASS

- Diff vs `HEAD` is limited to **three single-line changes** in the three target files. Nothing else modified.
- `git diff HEAD -- app/ components/ lib/` shows only the badge palette swap.

## Findings / Notes (NOT regressions — out of scope but worth flagging)

These are NOT failures of LR-26d. The refined ticket explicitly scoped to the badge-palette literal `bg-red-50 text-red-700`. Surfacing as gaps for the PM to consider in a follow-up ticket.

### Finding F-01 — Marketing legend cards still render Specialist Track in red
- `app/page.tsx:117-120` renders the homepage legend "Specialist Track" tile with `border-red-100 bg-red-50` and `text-red-900` / `text-red-800` plus a 🔴 emoji.
- `app/teacher/about/page.tsx:148-150` renders the same legend inside the about page with `bg-red-50 text-red-900 border-red-100` plus 🔴 emoji.
- These are explanatory marketing/legend blocks, not the per-student badge — and the refined ticket scopes only to the badge palette `text-red-700` literal. However, a teacher who reads the about page in red and then sees the badge in violet will see two competing visual codes for the same concept. **Recommendation:** new follow-up ticket (LR-26e?) to align the legend cards + 🔴 emoji with the violet palette.
- Files (absolute paths):
  - `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/page.tsx`
  - `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/teacher/about/page.tsx`

### Finding F-02 — Build emits `Next.js plugin was not detected in your ESLint configuration` warning
- Pre-existing on the baseline (not introduced by LR-26d). Falls under `eslint-config-next` integration tech debt. Mention to padi-eng for a separate sweep — not a launch blocker.

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 12 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Pre-edit red literal eliminated from app/ | ✅ | — | — |
  | UAT-02 | Violet replacement present at three sites | ✅ | — | — |
  | UAT-03 | Student profile renders violet badge | ✅ | — | — |
  | UAT-04 | Lesson detail / KAN-51 sticky banner renders violet | ✅ | — | — |
  | UAT-05 | Dashboard roster card renders violet | ✅ | — | — |
  | UAT-06 | Other statuses' palettes unchanged | ✅ | — | — |
  | UAT-07 | `pnpm lint` exit 0 zero warnings | ✅ | — | — |
  | UAT-08 | `pnpm tsc --noEmit` exit 0 | ✅ | — | — |
  | UAT-09 | `pnpm build` exit 0 | ✅ | — | — |
  | UAT-10 | Contrast AA for violet badge | ✅ | — | — |
  | UAT-11 | Logged-out `/teacher` unaffected | ✅ | — | — |
  | UAT-12 | Out-of-scope helpers / picker untouched | ✅ | — | — |
- Notes for padi-eng: implementation is exactly three single-line literal swaps with no collateral edits. Diff is clean. Build, lint, tsc all green. Nothing to fix.
- Notes for padi-design: the per-student badge now reads violet, but the homepage and about-page legend tiles still render the Specialist Track tile in a red palette (`bg-red-50` / `text-red-900`) with a 🔴 emoji. Consider follow-up ticket to align marketing-legend visuals with the new badge palette (file paths in Finding F-01). This is an inconsistency a teacher will notice across pages, but it is OUTSIDE the scope of LR-26d as written.
- Missing from ticket: the refined ticket pre-edit grep target (`bg-red-50 text-red-700`) correctly enumerated all three badge sites. It did NOT call out the two marketing-legend sites that use a related-but-different red palette (`bg-red-50 text-red-900` plus emoji). Recommend either a follow-up ticket or an explicit OOS note in any future "completes the migration" ticket framing.
