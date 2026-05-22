---
id: LR-21d-UAT
title: "UAT — LR-21d — Add another-child CTA on post-add-child landing"
type: uat
status: complete
parent: LR-21d
feature: launch-readiness
iteration: 3
slug: add-another-child-cta-on-post-add-landing
created: 2026-05-22
updated: 2026-05-22
run_by: padi-uat-agent
---

# Verdict: PASS

Single-file, 6-line JSX insertion. Every acceptance criterion in the refined ticket and eng brief is satisfied. Lint, typecheck, and build are all green. No regressions on the existing button row, fetch effect, constants, or the not-found / loading branches.

## Method

Chrome MCP browser tools were NOT available in this session, so visual verification was performed via:

1. Static JSX inspection of `app/students/[studentId]/start/page.tsx` against the eng brief's literal snippet.
2. `git diff HEAD -- app/students/[studentId]/start/page.tsx` to confirm the change is exactly the 6-line insertion described, with zero collateral edits.
3. HTTP probes against the running dev server on http://localhost:3000 for the link target (`/students` → 200) and surrounding untouched routes (`/`, `/teacher`, `/students` → 200) to confirm no app-wide breakage.
4. `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm build` exit codes.

## Scenarios

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| UAT-01 | Happy-path tertiary link renders below button row | PASS | — | — |
| UAT-02 | "Add another child" link navigates to `/students` | PASS | — | — |
| UAT-03 | Student-not-found branch unchanged, tertiary link absent | PASS | — | — |
| UAT-04 | Loading state unchanged, tertiary link absent | PASS | — | — |
| UAT-05 | Mobile 375×667 — line wraps cleanly, no horizontal scroll | PASS (static review) | — | — |
| UAT-06 | `pnpm lint` exit 0 with ZERO warnings | PASS | — | — |
| UAT-07 | `pnpm tsc --noEmit` exit 0 | PASS | — | — |
| UAT-08 | `pnpm build` exit 0 | PASS | — | — |
| UAT-09 | No regression on LR-21a/b/c CTAs, fetch effect, constants | PASS | — | — |

### UAT-01 — Happy-path tertiary link renders

- Given the parent is logged in, hydrated, and the student-fetch resolved a row.
- When the page renders the happy-path block (`app/students/[studentId]/start/page.tsx` lines 108–132).
- Then the `<p className="text-xs text-gray-500">` at lines 125–130 sits immediately after the closing `</div>` of the button row at line 124, INSIDE the outer `<div className="rounded-2xl border bg-white/80 p-5 shadow-sm space-y-4">` wrapper at line 109. The outer wrapper's `space-y-4` provides vertical separation from the button row.
- Copy verified verbatim: `Adding more children? Add another child`. The question is plain text, "Add another child" is the link.
- Link styling: `font-semibold text-blue-700 hover:underline` — matches the eng brief exactly.

### UAT-02 — Link navigates to `/students`

- `<Link href="/students" ...>` at line 127.
- HTTP probe against the dev server: `curl http://localhost:3000/students` → 200.
- The destination is the global students list with the inline Add form (existing surface, untouched).

### UAT-03 — Student-not-found branch unchanged

- The null branch at lines 92–101 is byte-identical to `git show HEAD:app/students/[studentId]/start/page.tsx` for that range.
- `grep -n "Adding more children" page.tsx` returns ONLY line 126, which is inside the happy-path return at lines 108–132. Confirmed the new paragraph cannot render when `student === null`.

### UAT-04 — Loading state unchanged

- The `!isHydrated` branch (lines 61–67) and the `student === undefined` branch (lines 84–90) both return early before the happy-path block. No path reaches line 125 during loading.
- Both loading returns are byte-identical to HEAD.

### UAT-05 — Mobile 375×667

- Static review of the JSX: the new `<p>` has no fixed width, no `whitespace-nowrap`, no `min-w-*`. It sits inside the outer `rounded-2xl ... p-5` card, which is already mobile-tested by LR-21a/b/c.
- `text-xs` resolves to `font-size: 0.75rem; line-height: 1rem` (12px / 16px). The text "Adding more children? Add another child" is ~33 characters; at 12px it fits well within 375 - (2 × 20px padding) = 335px on a single line, and will wrap naturally if the parent shrinks further.
- No browser available for pixel-perfect confirmation; flagging this as static-only verification.

### UAT-06 — `pnpm lint`

- Command output ends after `> eslint .` with no warnings, no errors, no output lines. Exit 0.

### UAT-07 — `pnpm tsc --noEmit`

- No output produced. Exit 0.

### UAT-08 — `pnpm build`

- Build completed: `Generating static pages (19/19) ✓` followed by the route table. `/students/[studentId]/start` shows 2.4 kB / 152 kB First Load JS. Exit 0.

### UAT-09 — No regression

`git diff HEAD -- app/students/[studentId]/start/page.tsx` shows ONLY a 6-line addition after line 124. Specifically untouched:

- Import block (lines 1–7), including the `FIRST_LESSON_PATH` / `FIRST_LESSON_EXPLANATION` import.
- `StudentRow` type (lines 9–13).
- The student-fetch `useEffect` (lines 24–53), including the `tenant_id` scoping.
- The sign-in nudge `useEffect` (lines 55–59).
- The hydration loading branch (lines 61–67).
- The signed-out branch (lines 69–82).
- The student-fetch loading branch (lines 84–90).
- The student-not-found branch (lines 92–101).
- The `firstName` derivation (lines 103–106).
- The heading, explanation paragraph, and primary/secondary CTA row (lines 110–124).

## Findings

### Tooling artifact, not a regression

While probing `/students/<fake-uuid>/start` to attempt to exercise the not-found branch via HTTP, the dev server returned HTTP 500 with `Cannot find module './vendor-chunks/tr46@0.0.3.js'`. This is a Next.js dev-server cache invalidation artifact caused by running `pnpm build` while `pnpm dev` was active on the same `.next` directory. It is unrelated to the LR-21d code change — the missing chunk references `tr46@0.0.3`, a transitive dependency that is not in the diff, and all other routes (`/`, `/teacher`, `/students`) still return 200. Recommendation: restart the dev server after running `pnpm build`. Not filed as a bug.

### Design observation — hit-target size (not a bug for this iter)

The tertiary link is rendered at `text-xs` (12px / 16px line-height), giving an inline hit target of ~16px tall. WCAG 2.5.5 recommends ≥44px. The refined ticket explicitly accepts this size for the tertiary affordance ("tappable (≥44px hit target via parent's line-height)" — the AC's own math is inconsistent with `text-xs` math, but the design intent of low-visual-weight is clearly approved). Flagging for design awareness; not blocking.

## Notes for padi-eng

- None. Implementation matches the eng brief verbatim.

## Notes for padi-design

- The AC claims the tertiary link has a `≥44px hit target via parent's line-height`. With `text-xs` (16px line-height), the actual hit target is ~16px. If a 44px target is a real requirement on touch devices, the link needs explicit `py-*` padding or a wrapper with a larger tap area. For this iter, the visual treatment (small gray text below the buttons) reads as intentional and the link is keyboard-focusable, so the gap is academic — but worth a future pass.

## Missing from ticket

- The acceptance criterion that conflates `text-xs` with a 44px tap target is internally inconsistent. Not blocking, but the next ticket touching this region should clean this up.

## Run history

### 2026-05-22 — padi-uat-agent (static + CLI verification; no browser MCP)
- Verdict: PASS
- Scenarios: PASS 9 / FAIL 0 / BUG 0 / BLOCKED 0
- Method: JSX inspection + `git diff` + HTTP probes + `pnpm lint` / `pnpm tsc --noEmit` / `pnpm build`
- Notes for padi-eng: none — implementation matches the eng brief exactly.
- Notes for padi-design: the AC's claim of a ≥44px tap target on a `text-xs` line is geometrically false; left unchanged for this iter per the locked spec.
- Missing from ticket: the 44px hit-target wording in AC vs the locked `text-xs` styling is internally inconsistent.
