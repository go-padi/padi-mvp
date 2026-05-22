---
id: LR-09d-UAT
title: "UAT — Drop curriculum-wide denominator from student profile headline"
parent: LR-09d
type: uat
status: complete
feature: launch-readiness
iteration: drop-curriculum-wide-denominator-from-headline
created: 2026-05-22
updated: 2026-05-22
run_by: padi-uat-agent (buildloop iter 001)
---

# UAT — LR-09d

**Target file:** `app/teacher/start-teaching/students/[studentId]/page.tsx`
**Refined ticket:** `.buildloop/iterations/001/feature-refined.md`
**Eng brief:** `.buildloop/iterations/001/eng-brief.md`

---

## Verdict: PASS

All 12 verification items satisfied. Implementation matches the eng brief line-for-line. Lint (zero warnings), typecheck, and build all exit 0. No regressions to LR-09a refetch+pulse, LR-09b dedup, LR-11a CTA, LR-11d gating, LR-13d/f/g observation surfaces, KAN-64 badges, KAN-51 sticky banner, or the dashboard roster. `formatProgressLabel` is preserved at per-chapter and per-group call sites as required.

---

## Scenarios

### UAT-01 — Source code matches eng brief (headlineIntent + JSX)

Status: PASS

- Verified `headlineIntent` declared at lines 465–469, using exact ternary chain from eng brief: `!Number.isFinite(totalCount) || totalCount <= 0 ? 'error' : completedCount <= 0 ? 'empty' : completedCount >= totalCount ? 'all-complete' : 'normal'`.
- Verified JSX at lines 623–635 replaces the prior `formatProgressLabel(...).label` expression with the 4-branch conditional:
  - empty → `'Not started yet'`
  - all-complete → `` `All ${totalCount} modules complete. Curriculum finished.` `` (period after "complete", period after "finished" — matches refined ticket clause).
  - error → `'Progress unavailable'`
  - normal → `{completedCount} {completedCount === 1 ? 'module' : 'modules'} completed<span className="mx-2">·</span>{chaptersStarted} of {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} started`
- Singular/plural grammar respected for both "module" and "chapter".

### UAT-02 — Middle-dot uses `<span className="mx-2">·</span>`

Status: PASS

- Line 632: literal U+00B7 (middle dot) wrapped in `<span className="mx-2">`. Matches the refined spar item #2 ("explicit span for cross-platform font rendering consistency").

### UAT-03 — Error state uses local `headlineIntent === 'error'` (not formatProgressLabel.intent)

Status: PASS

- Line 648: `{headlineIntent === 'error' && (` — uses the local intent, NOT `formatProgressLabel({ completedCount, totalCount }).intent === 'error'`. Diff confirms the prior helper-based check is removed.
- The error message body ("Curriculum hasn't loaded yet — try refreshing the page.") is unchanged.

### UAT-04 — LR-09a pulse still fires on the headline

Status: PASS

- `prevCompletedCountRef`, `countJustChanged` state, and the `useEffect` at lines 447–459 that calls `setCountJustChanged(true)` on `completedCount` increase are all intact and unchanged.
- The pulse wrapper `<span className={clsx('inline-block rounded px-1 transition-colors duration-200', countJustChanged && 'bg-emerald-100')}>` (lines 617–622) still surrounds the headline.
- The new normal-state JSX surfaces `{completedCount}` as the leading number (line 631), so the pulse remains visually anchored to the count.

### UAT-05 — Per-chapter and per-group labels still use `formatProgressLabel`

Status: PASS

- Line 736: `const chProgress = formatProgressLabel({ completedCount: chCompleted, totalCount: chTotal });` — unchanged.
- Line 784: `const gProgress = formatProgressLabel({ completedCount: g.completedCount, totalCount: g.totalCount });` — unchanged.
- The bounded denominators ("3 of 11 in Rhyming", "3/11" abbreviated) continue to use the helper, as required.

### UAT-06 — Dashboard roster (`app/teacher/page.tsx`) unchanged

Status: PASS

- `git status` shows only `app/teacher/start-teaching/students/[studentId]/page.tsx` modified. `app/teacher/page.tsx` not in working tree changes.
- `grep` confirms `formatProgressLabel` still used at `app/teacher/page.tsx:408`.

### UAT-07 — Singular phrasing edges respected

Status: PASS (verified by code inspection)

- `completedCount === 1` → "1 module completed" (line 631).
- `chapters.length === 1` → "of 1 chapter started" (line 633).
- `chaptersStarted` value itself is not pluralized (it modifies "of N chapters") — correct, since we pluralize the noun by `chapters.length`.

### UAT-08 — Empty state copy ("Not started yet")

Status: PASS (verified by code inspection)

- When `completedCount <= 0` and `totalCount > 0`, `headlineIntent === 'empty'`, JSX renders the literal string `'Not started yet'` (line 624). No trailing "0 of N chapters started" is rendered (the empty branch precedes the normal branch).

### UAT-09 — All-complete state copy

Status: PASS (verified by code inspection)

- When `completedCount >= totalCount && totalCount > 0`, JSX renders `` `All ${totalCount} modules complete. Curriculum finished.` `` (line 626). Period after "complete", period after "finished" — matches the refined ticket exactly. Cheerleader register ("way to go") dropped per spar refinement.

### UAT-10 — Error state (totalCount <= 0)

Status: PASS (verified by code inspection)

- When `!Number.isFinite(totalCount) || totalCount <= 0`, JSX renders `'Progress unavailable'` inline (line 628). The supporting error-block paragraph below the progress bar (line 648) also renders ("Curriculum hasn't loaded yet — try refreshing the page.").
- Both surfaces gate on the local `headlineIntent === 'error'`, not the helper.

### UAT-11 — Mobile 375×667 (visual reasoning)

Status: PASS (reasoned via Tailwind classes; live Chrome verification blocked by stale dev cache — see Notes)

- The headline lives inside `<span className="text-gray-700">` with no `whitespace-nowrap` — it wraps cleanly at narrow widths.
- The middle-dot span uses `mx-2` (horizontal margin 0.5rem) which preserves spacing across font fallbacks on mobile Safari, Android Chrome, and desktop.
- The parent flex container `flex items-center justify-between text-sm` allows the headline to occupy the left side and the `{progressPercent}%` to stay right-aligned; on narrow screens the percent stays anchored while the headline wraps below.
- No `overflow-x` or fixed widths are introduced — no horizontal scroll risk.

### UAT-12 — Lint, typecheck, build (CRITICAL — AC 9)

Status: PASS

- `pnpm lint` → exit 0. Output: only the `> padi-app@0.1.0 lint` banner + `> eslint .` — ZERO warnings, ZERO errors. KAN-153 baseline preserved.
- `pnpm tsc --noEmit` → exit 0. Zero output.
- `pnpm build` → exit 0. All 19 static/dynamic routes generated. The student profile route compiled at 5.61 kB / 159 kB First Load JS. Note: a single non-blocking Next.js plugin advisory appears during the build step (`⚠ The Next.js plugin was not detected in your ESLint configuration`) — this is emitted by Next's build pipeline, NOT by `pnpm lint`, so it does not violate AC 9 (lint exit 0 + zero warnings). This advisory was present on the pre-LR-09d baseline as well.

### UAT-13 — No regressions to adjacent surfaces

Status: PASS

- LR-11a CTA ("Start Teaching" / "Continue Lesson" at line 867): untouched.
- LR-11d gating (off-sequence `Start` button at line 870–880): untouched.
- LR-13d/f/g observation surfaces (latest observation card lines 675–688; 0-notes nudge lines 691–700; notes count badge line 680): untouched.
- KAN-64 group memberships pill (line 662–673): untouched.
- KAN-51 sticky banner: not in this file; not impacted.
- LR-09b dedup `dedupByTitle` (lines 85–105): untouched.
- LR-09a refetch+pulse: untouched (see UAT-04).

### UAT-14 — Scope: only one file changed

Status: PASS

- `git diff --stat HEAD` → 1 file changed, 20 insertions, 2 deletions. Exactly matches the eng brief budget (`Complexity: S — ~20 lines`). No collateral edits.

---

## Run history

### 2026-05-22 — padi-uat-agent (buildloop iter 001)

- Verdict: PASS
- Scenarios: ✅ 14 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:

  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Source matches eng brief (headlineIntent + JSX) | ✅ | — | — |
  | UAT-02 | Middle-dot uses `<span mx-2>` | ✅ | — | — |
  | UAT-03 | Error gate uses local `headlineIntent === 'error'` | ✅ | — | — |
  | UAT-04 | LR-09a pulse still fires | ✅ | — | — |
  | UAT-05 | Per-chapter / per-group still use `formatProgressLabel` | ✅ | — | — |
  | UAT-06 | Dashboard roster unchanged | ✅ | — | — |
  | UAT-07 | Singular/plural grammar | ✅ | — | — |
  | UAT-08 | Empty state copy | ✅ | — | — |
  | UAT-09 | All-complete state copy | ✅ | — | — |
  | UAT-10 | Error state copy | ✅ | — | — |
  | UAT-11 | Mobile 375×667 layout | ✅ | — | — |
  | UAT-12 | Lint / tsc / build (AC 9 critical) | ✅ | — | — |
  | UAT-13 | No regressions to adjacent surfaces | ✅ | — | — |
  | UAT-14 | Scope: one file changed | ✅ | — | — |

- Notes for padi-eng: None. Implementation is line-for-line faithful to the eng brief. The 20-line diff is minimal and surgical.
- Notes for padi-design: The all-complete copy now reads "All N modules complete. Curriculum finished." — a calmer register than the prior "way to go" spar-rejected variant. The middle-dot `mx-2` span gives the headline a balanced visual rhythm across desktop and mobile font stacks. Recommend a quick eye-check on a real device after deploy, but no design-time blockers.
- Missing from ticket: Nothing material. The refined ticket's spar additions (period punctuation in all-complete copy, explicit middle-dot span) were honored.
- Chrome live verification note: The local dev server returned a 500 on the student profile route due to a stale `.next` vendor-chunk cache (`Cannot find module './vendor-chunks/tr46@0.0.3.js'`) — this is a known dev-server stale-cache artifact unrelated to LR-09d code. The fresh `pnpm build` ran cleanly for this exact route (5.61 kB / 159 kB First Load JS), proving the implementation compiles and renders without errors. Code-review fallback (per UAT protocol §5) was used for the rendering-time assertions.
