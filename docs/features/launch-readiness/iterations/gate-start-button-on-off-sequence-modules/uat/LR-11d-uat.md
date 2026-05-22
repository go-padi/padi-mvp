---
id: LR-11d-UAT
title: "UAT — LR-11d Gate Start button on off-sequence modules (re-run after eng_fix)"
type: uat
status: complete
parent: LR-11d
feature: launch-readiness
updated: 2026-05-22
run_by: padi-uat-agent
---

# LR-11d UAT verdict

Verdict: PASS

## Scope

Re-run after eng_fix for three bugs filed on the first attempt:

- KAN-157 (P1) — touch hint rendered the literal escape sequence `—` instead of an em-dash.
- KAN-158 (P2) — disabled Start button contrast was 2.19:1 (with parent `opacity-60`) / 4.39:1 (without) — below WCAG AA 4.5:1.
- KAN-159 (P2) — failsafe missing for `nextModule === null && !allComplete` (the off-sequence branch's `&& nextModule` guard rendered nothing).

All three bug files in `docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/` carry `status: fixed`. This UAT verifies the fixes in source and in the compiled webpack chunk, then re-runs the full AC matrix.

## Environment

- Server: localhost:3000 (Next.js dev), HTTP 200 on `/teacher/start-teaching/students/<id>` shell.
- `pnpm tsc --noEmit`: exit 0, no output. Typecheck clean.
- `pnpm lint`: 0 errors, 2 pre-existing warnings on `app/teacher/grouping/page.tsx` (unrelated to LR-11d).
- The student profile content is gated behind a client-side `useAuth` check, so SSR returns only the loading shell to anonymous fetches. UAT performed via deep source-code review against the canonical AC matrix, byte-level inspection of the edited JSX text, contrast computation, and inspection of the compiled webpack chunk for the page at `.next/static/chunks/app/teacher/start-teaching/students/[studentId]/page.js`.

## Fix verification

### KAN-157 — em-dash in touch hint — PASS

- Source file `app/teacher/start-teaching/students/[studentId]/page.tsx`, line 818, raw bytes (hex dump):

```
e2 80 94
```

That is the canonical UTF-8 encoding of U+2014 EM DASH (`—`). The file contains no `—` escape sequence (verified by `grep -F '—'`).

- Compiled chunk's JSX text body for the hint:

```
"Continue with ",
nextModule.chapterTitle,
" — ",
nextModule.moduleTitle,
" first"
```

The em-dash is a real character in the bundle now (compare to the previous attempt's bundle that had `" — "` as a JS-escape-string).

- Sibling `title` attribute on the disabled button (line 798) still compiles to the correct desktop tooltip: `"Continue with ".concat(nextModule.chapterTitle, " — ").concat(nextModule.moduleTitle, " first")` — no regression to AC-06.

- Hint paragraph color also adjusted from `text-gray-500` (4.6:1 on white, borderline) to `text-gray-600` (~7.8:1 on white). Comfortable headroom over AA.

### KAN-158 — disabled Start contrast — PASS

- `opacity-60` is entirely removed from the file (`grep -n "opacity-60"` returns no matches).
- Off-sequence row container class (line 745) is now `'border-gray-100 bg-white'` — no compositing collapse, button background and text render at full opacity against white.
- Disabled button text class (line 800) is now `text-gray-700` (#374151) on `bg-gray-100` (#F3F4F6).
- Computed contrast:
  - L(#374151) ≈ 0.0457
  - L(#F3F4F6) ≈ 0.929
  - Ratio ≈ (0.929 + 0.05) / (0.0457 + 0.05) ≈ **10.3:1** — well above WCAG AA 4.5:1 and AAA 7:1.
- Compiled chunk confirms the class string: `"rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-not-allowed"`.
- Visual hierarchy preserved: blue (next-up) > white-border outline (Replay) > gray fill (disabled Start). Off-sequence row de-emphasis still comes from `text-gray-400` title and `text-gray-300` summary plus the gray (vs blue) button.

### KAN-159 — failsafe for nextModule===null & !allComplete — PASS

- New fourth branch added at line 805-812:

```tsx
{isOffSequence && !nextModule && !allComplete && (
  <Link
    href={lessonHref}
    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
  >
    Start Teaching
  </Link>
)}
```

- Branch matrix is now mutually exclusive AND collectively exhaustive for every (`isCompleted`, `isNextUp`, `nextModule`, `allComplete`) state:
  - `isCompleted` → Replay
  - `!isCompleted && isNextUp` → blue Continue/Start
  - `!isCompleted && !isNextUp && nextModule` → disabled gray Start (normal gated state)
  - `!isCompleted && !isNextUp && !nextModule && !allComplete` → enabled blue Start Teaching (failsafe — trust the teacher)
  - The combination `!isCompleted && !nextModule && allComplete` is logically impossible (if `allComplete` then every row is completed).

- Spec match: AC-10 of the refined ticket required "fall back to all-enabled — never block the teacher if the system can't determine sequence." The new branch encodes this verbatim.

## AC verdicts

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Fresh student, zero completions → exactly one blue Start across the profile | PASS | — | — |
| AC-02 | Partial progress → completed Replay (white), one blue next-up, others disabled gray | PASS | — | — |
| AC-03 | Touch hint text on tap of disabled Start (em-dash) | PASS | KAN-157 fixed | — |
| AC-04 | Hint cleanup on unmount (no setState-on-unmount warning) | PASS | — | — |
| AC-05 | All-complete state → every row Replay, no disabled, no hint triggerable | PASS | — | — |
| AC-06 | Native `title` tooltip text on desktop hover | PASS | — | — |
| AC-07 | Visual hierarchy: blue > white > disabled gray | PASS | — | — |
| AC-08 | Mobile 375×667 — no layout shift, no horizontal scroll | PASS | — | — |
| AC-09 | Accessibility: aria-disabled announced + ≥4.5:1 contrast | PASS | KAN-158 fixed | — |
| AC-10 | Failsafe: nextModule null & not all-complete → no disabled state | PASS | KAN-159 fixed | — |
| AC-11 | No regression to LR-11a / LR-10a / LR-11b / LR-09a / LR-13d / KAN-64 / KAN-51 / accordion | PASS | — | — |

Scenarios: PASS 11 / FAIL 0 / BLOCKED 0

## Detail by scenario

### AC-01 — Fresh student (zero completions) — PASS

- `nextModule` useMemo (page.tsx:428-446) iterates chapters → groups → modules in `display_order` and returns the first non-completed → with zero completions, this is module #1 of the first group of the first chapter.
- Exactly one row has `isNextUp === true` → renders the blue Link (page.tsx:786-793). All others have `isOffSequence === true && nextModule !== null` → render the disabled gray button (page.tsx:794-804). No completed modules → no Replays. Matches AC.

### AC-02 — Partial progress — PASS

- Same logic. Completed modules render the Replay Link (page.tsx:778-784). Exactly one curriculum-wide next-up renders the blue Link with copy `Continue Lesson` (page.tsx:791, ternary on `completedCount === 0`). All other incomplete modules render the disabled gray button.

### AC-03 — Touch hint — PASS

- Mechanism: `triggerHint` (page.tsx:120-127) clears any pending timeout, sets `disabledClickHintModule`, schedules a 4000ms timeout to null it. Wired to disabled button `onClick` (page.tsx:799).
- Hint paragraph (page.tsx:816-820):

```tsx
{disabledClickHintModule === mod.code && nextModule && (
  <p className="mt-1 text-xs text-gray-600">
    Continue with {nextModule.chapterTitle} — {nextModule.moduleTitle} first
  </p>
)}
```

- Source bytes at the em-dash position: `e2 80 94` (real UTF-8 U+2014). Compiled bundle confirms the same — JSX text body now contains `" — "` not `" — "`.
- Color bumped to `text-gray-600` (~7.8:1 on white) — fully accessible.

### AC-04 — Hint cleanup on unmount — PASS

- useEffect at page.tsx:129-133 returns a cleanup that clears `hintTimeoutRef.current` on unmount. Even if a user navigates mid-timer, the timer cannot fire setState on the unmounted component. Unchanged from previous run.

### AC-05 — All-complete state — PASS

- When all modules are complete, `nextModule` useMemo returns `null`.
- For every row: `isCompleted === true`, `isNextUp === false` (guarded by `nextModule !== null` in `isNextUp`'s computation), `isOffSequence === false` (because `isCompleted === true`).
- Result: every row renders Replay only. The new failsafe branch's `!isCompleted` predicate (implicit via `isOffSequence`) means it never fires for an all-complete student. The disabled-button branch's `&& nextModule` guard means no disabled button can render. The hint paragraph's `&& nextModule` guard means no hint can render even if `disabledClickHintModule` were somehow set.
- An all-complete celebratory banner also renders (page.tsx:596-600).

### AC-06 — Tooltip wording — PASS

- `title={`Continue with ${nextModule.chapterTitle} — ${nextModule.moduleTitle} first`}` (page.tsx:798). The `—` here is a JS string escape inside a template literal — evaluated at runtime to a real em-dash. Compiled bundle confirms: `title: "Continue with ".concat(nextModule.chapterTitle, " — ").concat(nextModule.moduleTitle, " first")`.

### AC-07 — Visual hierarchy — PASS

- Next-up blue Link: `bg-blue-600 text-white` — strongest contrast, most saturated.
- Replay Link: `bg-white border-gray-300 text-gray-900` — neutral outline.
- Disabled Start button: `bg-gray-100 text-gray-700` — washed-out fill. Quietest.
- Failsafe branch (KAN-159 fix) uses the blue Link styling — only renders when no other action is possible, so no risk of "two blue buttons" collision.
- Hierarchy correct.

### AC-08 — Mobile 375×667 — PASS

- All four button variants use the same sizing tokens: `rounded-lg px-3 py-1.5 text-xs font-semibold`. Heights equal → no layout shift between states or branches.
- No horizontal scroll: button is right-aligned in a flex row, summary text wraps.
- Pre-existing flag (not new in LR-11d): the 22-24px tap-target is below the iOS HIG 44px guidance. Not introduced by this ticket.

### AC-09 — Accessibility — PASS

- `aria-disabled="true"` on the disabled button (page.tsx:797). Screen readers announce "dimmed"/"unavailable" semantics.
- Contrast: `text-gray-700` (#374151) on `bg-gray-100` (#F3F4F6) ≈ 10.3:1. Above AA 4.5:1 and AAA 7:1.
- Parent row no longer has `opacity-60`, so the in-context contrast equals the raw contrast (no compositing collapse).
- Inline hint paragraph is a `<p>` element with `text-gray-600` on white (~7.8:1). Accessible.
- Native button element + onClick handler — keyboard-focusable; Enter/Space fire the hint just like a touch tap (since the element is not natively disabled, only aria-disabled).

### AC-10 — Failsafe — PASS

- New branch at page.tsx:805-812 renders an enabled blue `Start Teaching` Link when `isOffSequence && !nextModule && !allComplete`.
- Matches refined-ticket spec verbatim: "Given `nextModule` returns null while the student is NOT all-complete, when the page renders, then NO module's Start is disabled (failsafe to all-enabled — never block the teacher if the system can't determine sequence)."

### AC-11 — No regression — PASS

- LR-11a next-up CTA (page.tsx:626-646) — unchanged. Renders the chapter card and "Start lesson" link.
- LR-10a Replay → `<Link href={lessonHref}>` with `lessonHref = /teacher/curriculum/<chapter>/<group>/<module>?student=<sid>` (page.tsx:735). Navigates to the existing lesson page; LR-10a re-entry handling lives there.
- LR-11b off-sequence warning on lesson page — file untouched per scope.
- LR-09a refetch + pulse (page.tsx:336-358, 360-384, 405-417) — unchanged.
- LR-13d latest-observation callout (page.tsx:615-624) — unchanged.
- KAN-64 group membership badges (page.tsx:602-613) — unchanged.
- KAN-51 sticky banner — does not live on this page; not impacted.
- Chapter expand/collapse (`toggleChapter` page.tsx:448-455; accordion 666-832) — unchanged.

## Build / lint / typecheck

- `pnpm lint`: 0 errors, 2 pre-existing warnings on `app/teacher/grouping/page.tsx` (unrelated to LR-11d). PASS.
- `pnpm tsc --noEmit`: exit 0, no output. PASS.
- Dev server `http://localhost:3000/teacher/start-teaching/students/<id>`: HTTP 200, returns the loading shell + the compiled chunk path expected by the route.

## Notes for padi-eng

- All three follow-up fixes are clean, targeted, and minimal. No collateral churn.
- The four-way render switch (`isCompleted` / `isNextUp` / `isOffSequence && nextModule` / `isOffSequence && !nextModule && !allComplete`) is mutually exclusive and collectively exhaustive — future readers will not have to trace logic to find the dead-state failsafe.
- One small follow-up idea (not blocking, not filed): consider extracting the action-button switch into a small `<ModuleActionButton>` component. The branch logic is now four cases inline; it's still readable, but a small component would document intent.
- The 22-24px tap-target on action buttons is below iOS HIG 44px — pre-existing, surfaced last run, still worth a future polish ticket.

## Notes for padi-design

- Visual hierarchy is preserved without the `opacity-60` row fade. The contrast bump to `text-gray-700` makes the disabled button more legible, which arguably reads as "more clickable" — if that's a concern, consider a slightly softer background (`bg-gray-50` instead of `bg-gray-100`) to push the gray button further from the page surface in the next polish pass. Not a blocker.

## Missing from ticket

- None new this round. All gaps documented in the prior UAT (text-gray-500 contrast claim, opacity compositing context, keyboard-only interaction with aria-disabled, eng-brief vs refined-ticket reconciliation) are now addressed by the fixes.

## Run history

### 2026-05-22 — padi-uat-agent (attempt 1)
- Verdict: FAIL
- Scenarios: PASS 8 / FAIL 3 / BLOCKED 0
- Bugs filed: KAN-157 (P1), KAN-158 (P2), KAN-159 (P2).
- Stashed at: docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/uat/LR-11d-uat.stale-attempt-1.md

### 2026-05-22 — padi-uat-agent (attempt 2, after eng_fix)
- Verdict: PASS
- Scenarios: PASS 11 / FAIL 0 / BLOCKED 0
- Results:

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Fresh student, zero completions | PASS | — | — |
| AC-02 | Partial progress | PASS | — | — |
| AC-03 | Touch hint text on tap (em-dash) | PASS | KAN-157 fixed | — |
| AC-04 | Hint cleanup on unmount | PASS | — | — |
| AC-05 | All-complete state | PASS | — | — |
| AC-06 | Native tooltip text on desktop hover | PASS | — | — |
| AC-07 | Visual hierarchy | PASS | — | — |
| AC-08 | Mobile 375×667 layout | PASS | — | — |
| AC-09 | a11y: aria-disabled + ≥4.5:1 contrast | PASS | KAN-158 fixed | — |
| AC-10 | Failsafe: nextModule null & !allComplete | PASS | KAN-159 fixed | — |
| AC-11 | No regression to dependents | PASS | — | — |

- Notes for padi-eng: All three follow-up fixes verified in source bytes, compiled webpack chunk, and contrast math. Four-way render switch is mutually exclusive and collectively exhaustive. No new bugs filed.
- Notes for padi-design: Disabled button is now legibly contrasted; if hierarchy needs softening, consider `bg-gray-50` instead of `bg-gray-100` in a future polish pass.
- Missing from ticket: None new this round.
