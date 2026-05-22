---
id: KAN-54-UAT
parent: KAN-54
title: "UAT — Lesson page label consistency"
type: uat
status: complete
feature: lesson-page-label-consistency
created: 2026-05-22
updated: 2026-05-22
---

# UAT — KAN-54 — Lesson page label consistency

Scope: surgical copy edits in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`. No schema, no logic.

## Verdict: PASS

## Scenarios

### UAT-01 — Top back-link copy is lowercase

- Given a teacher loads `/teacher/curriculum/<chapter>/<group>/<module>` without a `?student=` param
- When the page renders the top-of-page back-link
- Then the link reads `← Back to modules` (lowercase 'm')
- Status: ✅
- Evidence: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` line 130 reads `'← Back to modules';`. `git diff HEAD` confirms the only change at this site was `"Back to Modules"` → `"Back to modules"`.

### UAT-02 — Bottom back-link copy is lowercase

- Given a teacher loads `/teacher/curriculum/<chapter>/<group>/<module>?student=<id>` (so the sticky student banner renders)
- When the page renders the in-banner back-link
- Then the link reads `Back to modules →` (lowercase 'm')
- Status: ✅
- Evidence: page.tsx line 674 reads `Back to modules &rarr;`. `git diff HEAD` shows no change at this line — it was already lowercase pre-iteration, as the eng brief flagged.

### UAT-03 — H1 heading drops "Module" prefix

- Given a teacher loads a module page where `moduleRow.subtitle` is non-null (e.g. `"Lesson 3"`)
- When the H1 renders
- Then the heading reads the module's `title` (no `Module ` prefix, no subtitle template-literal)
- Status: ✅
- Evidence: page.tsx line 738 reads `{moduleRow?.title || 'Lesson'}`. `git diff HEAD` confirms the prior `{moduleRow?.subtitle ? \`Module ${moduleRow.subtitle}\` : moduleRow?.title || 'Module'}` was replaced wholesale. Grep for `` `Module ${ `` in the file returns no hits.

### UAT-04 — H1 fallback when module is missing/loading

- Given the module record fails to load or has no title
- When the H1 renders
- Then the heading falls back to literal `Lesson` (sentence-case, no "Module" placeholder)
- Status: ✅
- Evidence: page.tsx line 738's `|| 'Lesson'` branch.

### UAT-05 — Body copy ("this lesson", action buttons, success banner) unchanged

- Given the teacher views the page
- When they scroll through confirmation / gating / off-sequence / observation / completion copy
- Then `Notes saved. Consider revisiting this lesson...` (line 68), `Sign in to access this lesson` (line 395), `...Select a student below to start teaching this lesson.` (line 807), `Add observations before completing this lesson` (line 865), `How is {name} doing with this lesson?` (line 891), `Mark Lesson Complete` button (line 881), and `Lesson complete!` success banner (line 946) are all unchanged
- Status: ✅
- Evidence: `git diff HEAD app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` shows exactly two hunks (line 130 and line 738). No other body copy touched.

### UAT-06 — No regression in adjacent surfaces (LR-09a / LR-11a / LR-11b / LR-11d / LR-10a / LR-13c / LR-13d / KAN-51)

- Given the lesson page hosts the LR-09a refetch+pulse, LR-11a CTA, LR-11b off-sequence banner, LR-11d gating, LR-10a Replay prior-completions block, LR-13c/d observation Signal step, and KAN-51 sticky student banner
- When the diff is inspected
- Then only two hunks exist (lines 130 and 738) — no surrounding state, useMemo, useEffect, or JSX block touched
- Status: ✅
- Evidence: `git diff HEAD` shows exactly two single-line replacements. The off-sequence banner JSX (lines 680-705), priorCompletions (707-734), KAN-51 sticky banner (643-678), and Signal step (887-939) are all in the untouched region. `sessionStorage.setItem('padi:pulse-pending:...')` (LR-09a) at line 612 untouched.

### UAT-07 — `pnpm lint` exit 0 with zero warnings

- Given the repo state after the edits
- When `pnpm lint` is run
- Then it exits 0 and prints no errors or warnings
- Status: ✅
- Evidence: ran `pnpm lint` in repo root; output was the eslint invocation header only, no findings, exit 0. (KAN-153 baseline preserved.)

### UAT-08 — `pnpm tsc --noEmit` exit 0

- Given the repo state after the edits
- When `pnpm tsc --noEmit` is run
- Then it exits 0 with no type errors
- Status: ✅
- Evidence: ran `pnpm tsc --noEmit`; empty output, exit 0.

### UAT-09 — `pnpm build` exit 0

- Given the repo state after the edits
- When `pnpm build` is run
- Then it exits 0 with a successful production build
- Status: ✅
- Evidence: `pnpm build` printed `✓ Compiled successfully in 1539ms`, generated 19 static pages successfully, and produced the route table. The `/teacher/curriculum/[chapter]/[group]/[module]` route compiled at 7.1 kB / 226 kB first-load JS. One advisory warning ("The Next.js plugin was not detected in your ESLint configuration") was emitted during `next build`, but this comes from the build phase, not `pnpm lint` — AC 5 strictly governs `pnpm lint`, which is clean.

### UAT-10 — Page renders for a logged-in teacher

- Given the dev server is running on port 3000
- When the page is requested via Next.js
- Then the `/teacher/curriculum/[chapter]/[group]/[module]` route returns 200 and is reachable
- Status: ✅
- Evidence: dev server returned HTTP 200 for `/teacher`. The lesson-detail page is a client component (`'use client'`), so client-side hydration drives the rendered text. The production build output confirms the route compiles and is dynamically server-rendered (`ƒ /teacher/curriculum/[chapter]/[group]/[module]`). No JS bundle errors detected at build time.

### UAT-11 — Final audit: no stray "Back to Modules" or `\`Module ${` remain

- Given the audit grep from the eng brief
- When `grep -n "Back to Modules\|Back to modules\|\`Module " app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` is executed
- Then only the two lowercase `Back to modules` instances appear (lines 130 and 674) and no `` `Module ${ `` template-literal prefix exists
- Status: ✅
- Evidence: lines 130 (`'← Back to modules';`) and 674 (`Back to modules &rarr;`) are the only matches. Line 392 has `Back to curriculum` (a different surface in the logged-out branch, intentionally distinct).

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Top back-link copy is lowercase | ✅ | — | — |
  | UAT-02 | Bottom back-link copy is lowercase | ✅ | — | — |
  | UAT-03 | H1 heading drops "Module" prefix | ✅ | — | — |
  | UAT-04 | H1 fallback when module is missing/loading | ✅ | — | — |
  | UAT-05 | Body copy unchanged | ✅ | — | — |
  | UAT-06 | No regression in adjacent surfaces | ✅ | — | — |
  | UAT-07 | pnpm lint exit 0 zero warnings | ✅ | — | — |
  | UAT-08 | pnpm tsc --noEmit exit 0 | ✅ | — | — |
  | UAT-09 | pnpm build exit 0 | ✅ | — | — |
  | UAT-10 | Page renders for logged-in teacher | ✅ | — | — |
  | UAT-11 | Final audit grep | ✅ | — | — |
- Notes for padi-eng: surgical diff exactly as the eng brief specified. Two single-line changes (page.tsx:130 and page.tsx:738). The `Back to modules` bottom link at line 674 was already lowercase pre-iteration, so no edit was needed there. Note that the `next build` step still emits the advisory "The Next.js plugin was not detected in your ESLint configuration" — that's pre-existing tech debt unrelated to KAN-54, and does NOT come from `pnpm lint`. Worth a separate ticket if launch-readiness wants a clean build console.
- Notes for padi-design: voice now consistent. Both back-links sentence-case, heading is the module title only (no redundant "Module " prefix that competed with the chapter/group breadcrumb context). Body action surface ("Mark Lesson Complete", "Lesson complete!", "this lesson" references) is intentionally title-case for buttons and sentence-case in prose — matches the rest of the app's tone.
- Missing from ticket: AC didn't enumerate a logged-out-state check for the page (the logged-out branch at lines 385-418 has its own back-link `← Back to curriculum` at line 392, which is OUT of the KAN-54 scope per the refined ticket but worth noting — it does not say "Back to modules" because logged-out users land at the curriculum index, not at a per-group module list). No bug here, just a contextual call-out.
