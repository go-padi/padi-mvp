---
id: LR-09e-UAT
title: UAT — Drop curriculum-wide denominator from dashboard roster cards
parent: LR-09e
feature: launch-readiness
iteration: drop-denominator-from-roster-cards
status: complete
created: 2026-05-22
updated: 2026-05-22
runner: padi-uat-agent (buildloop iter-009-002)
---

## Verdict: PASS

The single-file change at `app/teacher/page.tsx:471-479` cleanly replaces the
`helperResult.label` render in the non-preview branch with an
`helperResult.intent`-keyed ternary that emits:

- `empty` → "Not started yet"
- `all-complete` → "All modules complete"
- `error` → "Progress unavailable"
- (default) → `"${completedCount} ${completedCount === 1 ? 'module' : 'modules'} completed"`

The diff is identical to the eng brief (exact line range, no drift). Lint, tsc
and build are all clean (AC 8). Preview-mode branch is untouched and was verified
live (logged-out preview at `/teacher` still renders the `"NN% complete"` strings).

---

## Scenarios

### UAT-01 — Partial progress shows count without denominator
Status: PASS
- Verified at `app/teacher/page.tsx:479`. When `helperResult.intent === 'normal'`
  (the only path remaining), the rendered string is
  `` `${card.completedCount} ${card.completedCount === 1 ? 'module' : 'modules'} completed` ``.
  No `"of N"` substring; no reference to `totalCount` in the label expression.
- Progress bar at lines 484-488 still binds `width: ${card.progressPercent}%`, so
  the visual proportion is preserved.

### UAT-02 — Singular phrasing at exactly 1 completion
Status: PASS
- Ternary `card.completedCount === 1 ? 'module' : 'modules'` uses strict equality.
- At `completedCount === 1`, label is `"1 module completed"`.
- At `completedCount === 2`, label is `"2 modules completed"`.
- At `completedCount === 0`, the upstream helper returns `intent='empty'` (see
  `lib/copy/progressCopy.ts:22`), so we never hit the count branch with zero.

### UAT-03 — Empty state → "Not started yet"
Status: PASS
- `lib/copy/progressCopy.ts:22` returns `{ intent: 'empty' }` when
  `completedCount <= 0`.
- The dashboard's outer ternary catches `intent === 'empty'` first and renders
  the literal string `'Not started yet'`. The helper's own label
  (`"Not started"`) is bypassed — copy now matches the ticket exactly.

### UAT-04 — All-complete state → "All modules complete"
Status: PASS
- `lib/copy/progressCopy.ts:25-27` returns `{ intent: 'all-complete' }` when
  `completedCount >= totalCount` (and totalCount > 0).
- Dashboard renders the literal `'All modules complete'` — no number, matching
  the AC. The helper's own label (`"All ${totalCount} modules complete"`) is
  bypassed, eliminating the trust-breaking `"All 197 modules complete"`.

### UAT-05 — Error state → "Progress unavailable"
Status: PASS
- `lib/copy/progressCopy.ts:15-21` returns `{ intent: 'error' }` when totals are
  non-finite, NaN, or `totalCount <= 0`.
- Dashboard renders the literal `'Progress unavailable'`. Matches the AC verbatim.

### UAT-06 — Preview mode unchanged
Status: PASS
- The `startData.mode === 'preview'` branch at line 471-472 was untouched. It
  still renders `card.progressLabel || \`${card.progressPercent}% complete\``.
- Live verification: `curl http://localhost:3000/teacher` (logged-out preview)
  rendered cards with `"32% complete"`, `"27% complete"`, `"61% complete"` —
  the legacy preview format is intact.

### UAT-07 — Progress bar still uses `card.progressPercent`
Status: PASS
- Lines 484-488 unchanged. `style={{ width: \`${card.progressPercent}%\` }}`
  remains the single source of visual proportion.

### UAT-08 — Status pill and CTA label switching unchanged
Status: PASS
- Status pill at line 481 (`<span className={statusBadgeClass}>{card.status}</span>`)
  unchanged.
- CTA label logic at lines 415-422 (`allComplete`, `noneStarted`, `ctaLabel`,
  `ctaIsPrimary`) unchanged. Both still read from `helperResult.intent` so the
  same intent classification powers card framing and CTA copy.

### UAT-09 — `pnpm lint` exit 0 with ZERO warnings (KAN-153 baseline) [AC 8 — ruthless]
Status: PASS
- Ran `pnpm lint`. Output:
  ```
  > padi-app@0.1.0 lint /Users/nishaiyer/Desktop/padi-app/padi-app-starter
  > eslint .
  ```
- No further lines emitted → no errors, no warnings, exit 0.

### UAT-10 — `pnpm tsc --noEmit` exit 0
Status: PASS
- Ran `pnpm tsc --noEmit`. Zero output, exit 0.

### UAT-11 — `pnpm build` exit 0
Status: PASS
- Build compiled successfully in 1623ms, generated 19 static pages, no errors.
- `/teacher` route still bundles at 8.78 kB (within expected envelope).
- The "Next.js plugin not detected in ESLint config" notice is a pre-existing
  baseline informational from `next build`'s own ESLint pass and not a lint
  warning under `pnpm lint`. Not introduced by this iter.

### UAT-12 — No regression on adjacent surfaces
Status: PASS
- Diff scope: `app/teacher/page.tsx` only (+ `docs/features/SHIPPED.md` doc).
  No source touched in:
  - `app/teacher/start-teaching/students/[studentId]/page.tsx` (LR-09d /
    student profile headline) — still uses two-piece format independently
  - `lib/copy/progressCopy.ts` (helper unchanged)
  - `app/teacher/grouping/*` (different surface, not touched)
  - LR-09a refetch wiring (lines 65-92 of teacher page) — untouched
  - LR-09b dedup logic — untouched
  - LR-11a CTA, LR-11d gating — untouched
  - LR-13d/f/g observation surfaces — untouched
  - KAN-64 phase badges, KAN-51 sticky banner — untouched

### UAT-13 — Mobile layout (375 × 667)
Status: PASS (code-review)
- Existing Tailwind grid `grid gap-4 md:grid-cols-2 lg:grid-cols-3` collapses
  to a single column under `md` (default mobile). The label container
  `<span className="text-gray-700">` sits in a flex row alongside the status
  pill. Worst-case normal-state string at typical caps ("12 modules completed",
  17 chars) is shorter than the previous "12 of 197 modules complete"
  (28 chars), so any overflow risk strictly decreases.
- "All modules complete" (20 chars) and "Progress unavailable" (20 chars)
  both fit comfortably within the existing card padding (`p-5`) on mobile.

---

## Run history

### 2026-05-22 — padi-uat-agent (BuildLoop iter-009-002)
- Verdict: PASS
- Scenarios: 13 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Results:
  | #      | Scenario                                     | Status | Bug file | Severity |
  |--------|----------------------------------------------|--------|----------|----------|
  | UAT-01 | Partial progress shows count w/o denominator | PASS   | —        | —        |
  | UAT-02 | Singular phrasing at exactly 1               | PASS   | —        | —        |
  | UAT-03 | Empty → "Not started yet"                    | PASS   | —        | —        |
  | UAT-04 | All-complete → "All modules complete"        | PASS   | —        | —        |
  | UAT-05 | Error → "Progress unavailable"               | PASS   | —        | —        |
  | UAT-06 | Preview mode unchanged                       | PASS   | —        | —        |
  | UAT-07 | Progress bar still binds progressPercent     | PASS   | —        | —        |
  | UAT-08 | Status pill + CTA switching unchanged        | PASS   | —        | —        |
  | UAT-09 | `pnpm lint` exit 0 zero warnings (AC 8)      | PASS   | —        | —        |
  | UAT-10 | `pnpm tsc --noEmit` exit 0                   | PASS   | —        | —        |
  | UAT-11 | `pnpm build` exit 0                          | PASS   | —        | —        |
  | UAT-12 | No regression on adjacent surfaces           | PASS   | —        | —        |
  | UAT-13 | Mobile (375 × 667) layout                    | PASS   | —        | —        |
- Notes for padi-eng: none. Diff matches eng brief verbatim; gates green.
- Notes for padi-design: none. Copy hits the four states from the ticket exactly.
- Missing from ticket: none. AC enumerated all four intent states and singular/plural.

## Verdict: PASS
