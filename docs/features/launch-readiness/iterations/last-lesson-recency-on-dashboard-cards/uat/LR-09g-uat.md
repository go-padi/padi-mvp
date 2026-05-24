---
id: LR-09g-UAT
parent: LR-09g
feature: launch-readiness
iteration: 005
slug: last-lesson-recency-on-dashboard-cards
created: 2026-05-24
updated: 2026-05-24
ran_by: padi-uat-agent
ran_against: http://localhost:3000
---

# UAT — LR-09g — Last-lesson recency on dashboard cards

Verdict: PASS

## Summary

LR-09g inserts exactly one conditional JSX block at `app/teacher/page.tsx:511-515`, immediately AFTER the LR-13e snippet (lines 505–509). The new block renders `Last lesson: <relative date>` on a student card when (a) the card is a student, (b) there are no notes, (c) a completion timestamp exists, and (d) `relativeDays(...)` returns a non-null string. It reuses the single LR-13h `relativeDays` helper (line 19) and shares the LR-13e style (`text-xs italic text-amber-800 line-clamp-2`) for visual parity.

The diff is one insertion of 6 lines. No other file modified. Hook unchanged. Helper unchanged. LR-13e block unchanged.

## Scope of verification

Browser-automation MCP tools are not available in this environment, so verification was done via the documented code-review fallback (per `padi-uat-agent` protocol) plus a live HTTP probe of `http://localhost:3000` (200 OK) and `http://localhost:3000/teacher` (returns "Start teaching" route HTML, no 500).

## Scenarios

### UAT-01 — Happy path: completion exists, no note → "Last lesson: X ago" renders
Status: PASS

- Gate (line 511): `card.type === 'student' && !card.latestObservationNotes?.trim() && card.latestObservationAt && relativeDays(card.latestObservationAt)` — all 4 conjuncts present.
- Body (lines 512–514): `<p className="text-xs italic text-amber-800 line-clamp-2">Last lesson: {relativeDays(card.latestObservationAt)}</p>` — text and class match spec.
- `card.latestObservationAt` is propagated from `useStartTeachingData.ts` line 158: `latestObservationAt: latestObservation?.completed_at ?? null` — wired correctly.

### UAT-02 — Note wins when both exist (mutual exclusivity)
Status: PASS

- LR-13e gate (line 505): `card.latestObservationNotes?.trim()` truthy.
- LR-09g gate (line 511): `!card.latestObservationNotes?.trim()` falsy when notes exist.
- The two gates are logically disjoint — at most one block renders. Verified by inspection.

### UAT-03 — Brand-new student (no completion) → neither line renders
Status: PASS

- LR-13e fails on falsy notes.
- LR-09g fails on falsy `card.latestObservationAt`.
- Existing card structure (progress bar line 498, status pill line 495, CTA line 517) renders unchanged.
- Demo branch (line 134) hard-codes `latestObservationAt: null`, so demo cards continue to show no recency line — confirmed by HTTP fetch of `/teacher` (no "Last lesson" string in body).

### UAT-04 — relativeDays wording (today / yesterday / N days / 1 month / N months)
Status: PASS

- Helper at lines 19–31 is a single source. LR-09g consumes it on line 513.
- `relativeDays` returns `null` for negative deltas / NaN, and the gate (line 511) discards null — protects against rendering `Last lesson: null`.

### UAT-05 — Group cards never render this line
Status: PASS

- Gate requires `card.type === 'student'` (line 511). Group cards (`type: 'group'`) skip both LR-13e and LR-09g.
- Group cards in the live branch hard-code `latestObservationNotes: null` and `latestObservationAt: null` (lines 184–185) anyway, so the gate is doubly safe.

### UAT-06 — Mobile 375×667, no horizontal scroll
Status: PASS

- New `<p>` uses `line-clamp-2` — wraps cleanly within the existing card column (`flex flex-col gap-3`, line 460).
- No new layout primitives, no fixed widths, no new container. Parity with the already-shipped LR-13e block which has the same line-clamp/italic/amber treatment.

### UAT-07 — `pnpm lint` exit 0, ZERO warnings (KAN-153 baseline)
Status: PASS

- Output: header only (`> padi-app@0.1.0 lint` + `> eslint .`), no warning or error lines. Exit 0.

### UAT-08 — `pnpm tsc --noEmit` exit 0
Status: PASS

- No output, exit 0.

### UAT-09 — `pnpm build` exit 0
Status: PASS

- Compiled 19/19 routes. `/teacher` route size 8.96 kB (essentially unchanged — a 6-line JSX addition).

### UAT-10 — No regression on shipped surfaces
Status: PASS

Verified via diff `git diff HEAD -- app/teacher/page.tsx`:

- LR-13e snippet (lines 505–509) byte-identical to prior — diff shows only an insertion at line 511.
- LR-13h `relativeDays` helper (lines 19–31) untouched — single source, no duplication anywhere in `app/`, `lib/`, or `components/` (grep verified).
- LR-09a refetch + pulse (lines 79–106) untouched.
- LR-09d/e progress label via `formatProgressLabel` (line 422, lines 484–494) untouched.
- LR-11a CTA `inline-flex...rounded-xl` (line 517–526) untouched.
- LR-11d Add-Student/Add-Group gating (lines 364–384) untouched.
- LR-26d/e/f violet/amber/green palette on status pill (lines 446–453) untouched; classes match `bg-green-50 text-green-700`, `bg-amber-50 text-amber-700`, `bg-violet-50 text-violet-700`, `bg-blue-50 text-blue-700`, `bg-gray-100 text-gray-600`.
- LR-14a/b/c/d audio stack lives in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`, not touched in this iteration.
- KAN-51 sticky banner / KAN-64 group badges not in this file.
- Auth-store, RLS, schema: untouched (grep across iteration diff confirms zero changes outside `app/teacher/page.tsx`).

## Run history

### 2026-05-24 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 10 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Happy path: completion, no note | PASS | — | — |
  | UAT-02 | Note wins (mutual exclusivity) | PASS | — | — |
  | UAT-03 | Brand-new student (no completion) | PASS | — | — |
  | UAT-04 | relativeDays wording reuse | PASS | — | — |
  | UAT-05 | Group cards skip the line | PASS | — | — |
  | UAT-06 | Mobile 375×667 wraps cleanly | PASS | — | — |
  | UAT-07 | pnpm lint exit 0 zero warnings | PASS | — | — |
  | UAT-08 | pnpm tsc --noEmit exit 0 | PASS | — | — |
  | UAT-09 | pnpm build exit 0 | PASS | — | — |
  | UAT-10 | No regression on shipped surfaces | PASS | — | — |
- Notes for padi-eng: Implementation is minimal and surgical — a single 6-line conditional that mirrors the LR-13e snippet's structure and gates. Single-source helper preserved. No further action needed.
- Notes for padi-design: New "Last lesson: X ago" line matches LR-13e amber-800 italic treatment exactly, maintaining visual parity. Mutually exclusive with notes line — at most one recency signal per card.
- Missing from ticket: None. Acceptance criteria were exhaustive and testable.
- Verification mode: Code-review fallback (no browser MCP available in this environment) plus dev-server HTTP probe (`/teacher` returns 200, demo branch correctly omits the line since demo data has `latestObservationAt: null`).
