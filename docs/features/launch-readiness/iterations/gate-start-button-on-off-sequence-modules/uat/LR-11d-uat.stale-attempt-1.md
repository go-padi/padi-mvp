---
id: LR-11d-UAT
title: "UAT — LR-11d Gate Start button on off-sequence modules"
type: uat
status: complete
parent: LR-11d
feature: launch-readiness
updated: 2026-05-22
run_by: padi-uat-agent
---

# LR-11d UAT verdict

Verdict: FAIL

## Scope

Single-file change to `app/teacher/start-teaching/students/[studentId]/page.tsx`. Three-way render switch (Replay / next-up Start / disabled off-sequence Start) gated on a curriculum-wide `nextModule` rather than per-group `firstIncompleteIdx`. Inline 4-second touch hint on tap of disabled Start.

## Environment

- Server: localhost:3000 (Next.js dev), HTTP 200 on `/teacher/start-teaching/students/<id>` shell.
- The app gates student profile content behind a client-side auth check (`useAuth`), so SSR returns only the "Loading..." shell to an anonymous fetch. I could not drive the authenticated flow interactively in this environment (no browser-automation tools available) — UAT performed via deep source-code review against the canonical AC, contrast computation, and bytecode-level inspection of the compiled webpack chunk for the page.

## AC verdicts

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Fresh student, zero completions → exactly one blue Start across the profile | PASS | — | — |
| AC-02 | Partial progress → completed Replay (white), one blue next-up, others disabled gray | PASS | — | — |
| AC-03 | Touch hint text on tap of disabled Start | FAIL | docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-157-bug-touch-hint-em-dash-renders-as-u2014-literal.md | P1 |
| AC-04 | Hint cleanup on unmount (no setState-on-unmount warning) | PASS | — | — |
| AC-05 | All-complete state → every row Replay, no disabled, no hint triggerable | PASS | — | — |
| AC-06 | Native `title` tooltip text on desktop hover | PASS | — | — |
| AC-07 | Visual hierarchy: blue > white > disabled gray | PASS | — | — |
| AC-08 | Mobile 375×667 — no layout shift, no horizontal scroll | PASS | — | — |
| AC-09 | Accessibility: aria-disabled announced + ≥4.5:1 contrast | FAIL | docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-158-bug-disabled-start-contrast-below-wcag-aa.md | P2 |
| AC-10 | Failsafe: nextModule null & not all-complete → no disabled state | FAIL | docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-159-bug-nextmodule-null-failsafe-renders-no-button.md | P2 |
| AC-11 | No regression to LR-11a / LR-10a / LR-11b / LR-09a / LR-13d / KAN-64 / KAN-51 / accordion | PASS | — | — |

Scenarios: PASS 8 / FAIL 3 / BLOCKED 0

## Detail by scenario

### AC-01 — Fresh student (zero completions) — PASS

- Logic at page.tsx:731-734: `isCompleted = completedModuleIds.has(mod.code)`, `isNextUp = nextModule !== null && mod.code === nextModule.moduleCode`, `isOffSequence = !isCompleted && !isNextUp`.
- `nextModule` useMemo (page.tsx:428-446) iterates chapters → groups → modules in `display_order` and returns the first non-completed → with zero completions, this is module #1 of the first group of the first chapter.
- Exactly one row has `isNextUp === true` → renders the blue Link (page.tsx:786-793). All others have `isOffSequence === true` (and `nextModule !== null`) → render the disabled gray button (page.tsx:794-804). No completed modules → no Replays. Matches AC.

### AC-02 — Partial progress — PASS

- Same logic. Completed modules render the Replay Link (page.tsx:778-784, `bg-white border-gray-300 text-gray-900`). Exactly one curriculum-wide next-up renders the blue Link with copy `Continue Lesson` (page.tsx:791, ternary on `completedCount === 0`). All other incomplete modules render the disabled gray button.

### AC-03 — Touch hint — FAIL

- Mechanism is correct: `triggerHint` (page.tsx:120-127) clears any pending timeout, sets `disabledClickHintModule`, schedules a 4000ms timeout to null it. Wired to disabled button's `onClick` (page.tsx:799). Hint paragraph renders below the row at page.tsx:808-812.
- BUT the hint text contains the literal string `—` rendered as 6 characters instead of the em-dash. Evidence pulled from the compiled webpack chunk at `.next/static/chunks/app/teacher/start-teaching/students/[studentId]/page.js`:

```
"Continue with ",
nextModule.chapterTitle,
" \\u2014 ",
nextModule.moduleTitle,
```

In JSX text, backslash escapes are preserved verbatim — the JSX text becomes the JS string `" — "` which after JSON-escape becomes `" \\u2014 "` in the bundle, rendering as the literal text `—` in the DOM.

For contrast, the same expression used as a JS template literal on the `title` attribute (page.tsx:798) compiles correctly:

```
title: "Continue with ".concat(nextModule.chapterTitle, " — ").concat(nextModule.moduleTitle, " first")
```

The fix is a single-character JSX-text replacement: change `—` → `—`.

- Bug filed: docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-157-bug-touch-hint-em-dash-renders-as-u2014-literal.md

### AC-04 — Hint cleanup on unmount — PASS

- useEffect at page.tsx:129-133 returns a cleanup that clears `hintTimeoutRef.current` on unmount. Even if a user navigates mid-timer, the timer cannot fire `setState` on the unmounted component.

### AC-05 — All-complete state — PASS

- When all modules are complete, the `nextModule` useMemo returns `null` (the for-loop finds no incomplete module).
- For every row: `isCompleted === true`, `isNextUp === false` (guarded by `nextModule !== null`), `isOffSequence === false` (because `isCompleted === true`).
- Result: every row renders Replay only. The disabled-button branch's `&& nextModule` guard means no disabled button can render. The hint paragraph's `&& nextModule` guard means no hint can render even if `disabledClickHintModule` were somehow set.
- An all-complete celebratory banner also renders (page.tsx:596-600). No regression.

### AC-06 — Tooltip wording — PASS

- `title={`Continue with ${nextModule.chapterTitle} — ${nextModule.moduleTitle} first`}` (page.tsx:798). Compiled bundle confirms the em-dash is processed at JS-eval time:

```
title: "Continue with ".concat(nextModule.chapterTitle, " — ").concat(nextModule.moduleTitle, " first")
```

Desktop hover will show the correct text. (The on-touch inline hint is broken — see AC-03.)

### AC-07 — Visual hierarchy — PASS

- Next-up blue Link: `bg-blue-600 text-white` (page.tsx:789) — strongest contrast, most saturated.
- Replay Link: `bg-white border-gray-300 text-gray-900` (page.tsx:781) — neutral outline, present but quieter.
- Disabled Start button: `bg-gray-100 text-gray-500` (page.tsx:800) — washed-out fill. Quietest.
- Hierarchy correct.

### AC-08 — Mobile 375×667 — PASS

- All three button variants use the same sizing tokens: `rounded-lg px-3 py-1.5 text-xs font-semibold`. Heights are equal → no layout shift between states.
- Tap hit-target: with `px-3 py-1.5 text-xs`, computed bounding box ≈ 22-24px tall. **Note:** this is below the 44px guidance the refined ticket cited. However, this is the existing Start button sizing (not new in LR-11d). Marked PASS for the no-regression interpretation, but flagged for future hit-target audit (see "Missing from ticket" below).
- No horizontal scroll: button is right-aligned in a flex row, summary text wraps. Nothing forces overflow.

### AC-09 — Accessibility — FAIL

- `aria-disabled="true"` is set on the button (page.tsx:797). Screen readers WILL announce "dimmed"/"unavailable" semantics — good.
- WCAG AA contrast: FAIL.
  - Base: `text-gray-500` (#6B7280) on `bg-gray-100` (#F3F4F6) = **4.39:1** (below 4.5:1 by 0.11).
  - The parent row class for off-sequence rows includes `opacity-60` (page.tsx:745). Composited against the page white background, the effective contrast drops to **2.19:1** — far below WCAG AA (4.5:1) and even below AA Large (3.0:1).
- Inline hint paragraph: `<p>` element (page.tsx:809) — announced on appearance. Good. (Though the text itself is broken per AC-03.)
- Bug filed: docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-158-bug-disabled-start-contrast-below-wcag-aa.md

### AC-10 — Failsafe (nextModule null & not all-complete) — FAIL

- AC explicitly required: *"Then NO module's Start is disabled (failsafe to all-enabled — never block the teacher if the system can't determine sequence)."*
- The three-way switch at page.tsx:777-805 has no enabled fallback when `nextModule === null` and a module is incomplete:
  - `isCompleted` false → no Replay
  - `isNextUp` false (because `nextModule === null`) → no blue Start
  - `isOffSequence && nextModule` → `true && null` → null → no disabled button
- Net: nothing renders. Teacher cannot navigate from this surface.
- Eng brief (line "the `{isOffSequence && nextModule && ...}` guard makes this safe") relied on the assumption that `nextModule === null` ↔ `allComplete === true`. That's true *today* given the current `nextModule` useMemo, so the failure is latent — but the refined ticket called this out as an explicit failsafe AC, and the implementation does not honor it. Future race conditions (stale `completedModuleIds`, partial fetch errors, etc.) could trigger the dead state.
- Bug filed: docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/kan-159-bug-nextmodule-null-failsafe-renders-no-button.md

### AC-11 — No regression — PASS

- LR-11a next-up CTA (page.tsx:626-646) — unchanged. Still renders, still links to `?student=<id>` lesson URL.
- LR-10a Replay → `<Link href={lessonHref}>` with `lessonHref = /teacher/curriculum/<chapter>/<group>/<module>?student=<sid>` (page.tsx:735). Navigates to the existing lesson page; LR-10a re-entry handling lives there.
- LR-11b off-sequence warning on lesson page — file untouched per build summary. PASS.
- LR-09a refetch + pulse (page.tsx:336-358, 360-384, 405-417) — unchanged.
- LR-13d latest-observation callout (page.tsx:615-624) — unchanged.
- KAN-64 group membership badges (page.tsx:602-613) — unchanged.
- KAN-51 sticky banner — does not live on this page; not impacted.
- Chapter expand/collapse (`toggleChapter` page.tsx:448-455; accordion 666-825) — unchanged.

## Build / lint / typecheck

- `pnpm lint`: 0 errors, 2 pre-existing warnings on `app/teacher/grouping/page.tsx` (unrelated to LR-11d). PASS.
- `pnpm tsc --noEmit`: exit 0, no output. PASS.
- Dev server (`pnpm dev`) is running on port 3000 and serves the page HTML with HTTP 200.

## Notes for padi-eng

- **Fix the JSX text bug first (kan-157).** One-character change. Replace `—` with `—` (literal em-dash) on line 810 of `app/teacher/start-teaching/students/[studentId]/page.tsx`. Verify the compiled chunk no longer contains `\\u2014` in the JSX text segment.
- **Fix contrast (kan-158).** Recommend dropping `opacity-60` from the off-sequence row class on line 745, and bumping disabled button text to `text-gray-700` for headroom. Re-verify with DevTools contrast picker after change.
- **Wire the failsafe (kan-159).** Add an enabled blue Start branch when `!isCompleted && !nextModule && !allComplete`, OR refactor the three-way switch so the default is enabled-Start.
- The disabled-button trick (`aria-disabled` + `onClick` instead of native `disabled`) is correctly implemented — the click does fire and the hint mechanism works structurally. Only the text and contrast are broken.

## Notes for padi-design

- Validate the disabled gray button's appearance once contrast is fixed — the parent `opacity-60` may have been added precisely to soften the row visually, so removing it could feel more aggressive. Consider a softer `bg-gray-50` or `text-gray-700 bg-gray-100` combo that meets WCAG without needing opacity.
- The 22-24px tap-target on the three action buttons (Replay / Start / disabled Start) is below the 44px iOS HIG guidance — pre-existing, not introduced by LR-11d, but worth surfacing for a future polish ticket if iPad is the primary device.

## Missing from ticket

- The refined ticket cites `text-gray-500 bg-gray-100 ≈ 4.5:1`. Actual measured is 4.39:1 (just under). The threshold check in the refined-ticket review should use a real contrast computation, not eyeball estimates, before encoding into AC.
- No AC explicitly tests the parent-row opacity interaction. The opacity-60 was inherited from the prior `isUpcoming` styling and quietly applies to the new disabled button. Future ACs should call out compositing context for color-contrast claims.
- No AC covers keyboard-only interaction with the disabled button (Tab → Enter). The implementation does let keyboard focus land and Enter fires `onClick` (since it's an `aria-disabled` button, not natively disabled). This is fine, but should be explicitly tested.
- The eng brief silently overrode the refined ticket's failsafe spec (AC-10). The brief reviewer should reconcile divergences between refined-ticket ACs and eng-brief implementation plan before approving the brief.

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: FAIL
- Scenarios: PASS 8 / FAIL 3 / BLOCKED 0
- Results: see table above.
- Three bugs filed under docs/features/launch-readiness/iterations/gate-start-button-on-off-sequence-modules/bugs/:
  - KAN-157 (P1): touch hint renders `—` literal instead of em-dash.
  - KAN-158 (P2): disabled Start contrast 4.39:1 (and 2.19:1 with parent opacity-60) — below WCAG AA.
  - KAN-159 (P2): nextModule-null failsafe renders no button for incomplete rows.
- Build/lint/typecheck all green.
- UAT executed via deep source code review + compiled webpack bundle inspection + WCAG contrast computation. No interactive browser automation was available in this environment; an in-browser pass against a seeded fresh-student fixture is recommended to confirm the runtime rendering of the inline hint and tap behavior on touch devices once kan-157 is fixed.
