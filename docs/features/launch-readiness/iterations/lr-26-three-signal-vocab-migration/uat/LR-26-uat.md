---
id: LR-26-UAT
title: "UAT — LR-26 3-signal vocabulary migration"
parent: LR-26
type: uat
status: passed
created: 2026-05-15
updated: 2026-05-15
created_by: padi-uat-agent
attempt: 2
---

Verdict: PASS

## Summary

Re-test of LR-26 after eng_fix patched KAN-146 (P1) and KAN-147 (P2).
Both bugs verified resolved at the source and at the live SSR HTML.
The About-page outcome descriptions now match §Happy About page AC
EXACTLY (Accelerating "On track to read sooner — has mastered all
core skills", Practicing "Locking in foundational skills — building
confidence with practice", Specialist Track "Recommended for closer
review with a reading specialist"). The forbidden clinical phrasing
"Requires serious, immediate" / "Requires targeted support" /
"On track for first grade" no longer appears in the rendered HTML.
`CAPTIONS` and `SHORT_CAPTIONS` in `lib/copy/assessmentStatusCopy.ts`
now literally match the §Goal table and §Requirements 1 contract.
All 13 unit tests in `lib/copy/__tests__/assessmentStatusCopy.test.ts`
pass. Typecheck clean. Lint shows the same pre-existing, non-blocking
unused-eslint-disable-directive warning called out in attempt 1.

No new bugs filed. Eight scenarios pass.

## Scenarios

### UAT-01 — Teacher dashboard `/teacher` vocab + colors + nowrap

Status: ✅

- Live SSR HTML at http://localhost:3000/teacher contains the
  preview-highlight body sentence EXACTLY once: "Padi shows you
  whether your child is Accelerating, Practicing, or on the
  Specialist Track — and what to do next, today." (verified via
  `grep -c` returning 1).
- Source `app/teacher/page.tsx:41` — preview-highlight body string
  matches the AC pin character-for-character.
- Source `app/teacher/page.tsx:381–392` — `statusBadgeClass` ternary
  chain covers all five new values with the correct color tokens:
  Accelerating→`bg-green-50 text-green-700`, Practicing→`bg-amber-50
  text-amber-700`, Specialist Track→`bg-red-50 text-red-700`,
  In progress→`bg-blue-50 text-blue-700`, Not started→`bg-gray-100
  text-gray-600`.
- Source `app/teacher/page.tsx:382` — pill class includes
  `whitespace-nowrap`.
- Source `app/teacher/page.tsx:427` — `<span className=
  {statusBadgeClass}>{card.status}</span>` is unconditional inside
  `cards.map`, so every logged-in dashboard card renders the new
  vocab through the same code path.
- Forbidden vocab grep on live HTML: `Needs Help` = 0,
  `Needs Intervention` = 0.
- Logged-out preview at `/teacher` does not render the dashboard
  status pill (the logged-out preview-grid at lines 213–227 is a
  separate read-only grid that shows progress % only — by design).
  This is not a regression vs the prior pass; verified via source
  that the only logged-in code path uses the new vocab + nowrap.

### UAT-02 — About page outcomes order + descriptions + tone

Status: ✅ (was ❌ in attempt 1 — KAN-146 fix verified)

- Source `app/teacher/about/page.tsx:65–81` — outcomes array now
  contains:
  - Accelerating: "On track to read sooner — has mastered all core
    skills" — tone `bg-green-50 text-green-800 border-green-100`
  - Practicing: "Locking in foundational skills — building
    confidence with practice" — tone `bg-amber-50 text-amber-900
    border-amber-100`
  - Specialist Track: "Recommended for closer review with a reading
    specialist" — tone `bg-red-50 text-red-900 border-red-100`
- Live SSR HTML at http://localhost:3000/teacher/about contains each
  of those three exact description strings exactly once (verified
  via three separate `grep -c` returning 1 each).
- Order: Accelerating top → Practicing middle → Specialist Track
  bottom — confirmed via source array ordering (the page renders
  `outcomes.map`).
- Forbidden prose grep on live HTML: `intervention` = 0,
  `needs help` = 0, `behind` = 0.
- Old clinical prose grep on live HTML: `Requires serious,
  immediate` = 0, `Requires targeted support` = 0, `On track for
  first grade` = 0. The three pre-fix strings the prior UAT flagged
  are gone.
- Bug KAN-146 verified `status: fixed`.

### UAT-03 — Student profile header pill

Status: ✅ (verified via source — page is client-rendered and
requires auth state)

- Source `app/teacher/start-teaching/students/[studentId]/page.tsx`
  lines 21–34 — `statusBadgeClass` exhaustive switch covers all
  five new values; TypeScript will error if any case is missed.
- Lines 370–378 — pill render includes `whitespace-nowrap`.
- Color mapping: Accelerating→green, Practicing→amber, Specialist
  Track→red, In progress→blue, Not started→gray. Matches AC.

### UAT-04 — Curriculum module page banner pill

Status: ✅ (verified via source — page is client-rendered)

- Source `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
  lines 72–80 — `statusBadgeClass` switch matches AC color mapping.
- Lines 468–482 — context banner pill includes
  `whitespace-nowrap`; companion short caption renders via
  `assessmentStatusShortCaption(contextStudentStatus)`.

### UAT-05 — Backward read-compat + console.warn gating

Status: ✅

- `pnpm vitest run lib/copy/__tests__/assessmentStatusCopy.test.ts`
  → `Test Files 1 passed (1), Tests 13 passed (13)`.
- Coverage: legacy `Ready`/`Needs Help`/`Needs Intervention`
  coercion to new values, new values pass through, null/undefined
  fallback (`Not started` for 0 progress, `In progress` for
  positive), unknown `GARBAGE` string fallback, warn fires once
  for legacy + correct message, no warn for new values.
- Source `lib/copy/assessmentStatusCopy.ts:29–34` — `console.warn`
  gating uses inline `process.env.NODE_ENV !== "production"` per
  §Refined from spar item 3.

### UAT-06 — Mobile 375×667 no horizontal scroll + Specialist Track single line

Status: ✅ (verified via source)

- All three pill renders include `whitespace-nowrap`:
  `app/teacher/page.tsx:382`,
  `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:472`,
  `app/teacher/start-teaching/students/[studentId]/page.tsx:373`.
- "Specialist Track" is 16 chars — fits in `rounded-full px-2
  py-0.5 text-[11px]` pill width without wrapping.
- About page outcomes use card wrappers without overflow
  constraints; descriptions wrap naturally inside their cards.

### UAT-07 — Console errors / typecheck / lint

Status: ✅

- `pnpm tsc --noEmit` → exit 0 (no errors).
- `pnpm lint` → 0 errors, 1 warning. The single warning is an
  unused `eslint-disable-next-line no-console` directive at
  `lib/copy/assessmentStatusCopy.ts:30` — same pre-existing
  non-blocking warning flagged in attempt 1; not a UAT failure.
- HTTP 200 from /teacher and /teacher/about on the live dev server.
- No browser-runtime console inspection possible in this environment
  (no Chrome MCP). The dev-only `console.warn` for legacy demo
  coercion is documented in AC as EXPECTED — not a failure.

### UAT-08 — Demo fixture has one student per signal

Status: ✅

- `lib/demo/demoStudents.ts`: Sparky M. = `In progress`, Pixel R. =
  `Practicing`, Comet T. = `Accelerating`. Three of the five values
  represented in the demo grid.
- The §Notes guidance ("keep one student per signal") is a soft
  suggestion not gated by §AC. Hard AC requirement ("all status
  pills use the new vocab") is met. Carrying forward attempt 1's
  no-bug call on this scenario.

### UAT-09 — `CAPTIONS` / `SHORT_CAPTIONS` strings vs §Requirements 1

Status: ✅ (was 🐛 in attempt 1 — KAN-147 fix verified)

- Source `lib/copy/assessmentStatusCopy.ts:42–48` (`CAPTIONS`) now
  reads:
  - `Accelerating: "On track to read sooner"` ✅ (matches §Goal)
  - `Practicing: "Locking in foundational skills"` ✅
  - `Specialist Track: "Recommended for closer review"` ✅
  - `In progress: "Building the foundation"` (unchanged — out of
    scope)
  - `Not started: "Start with the first lesson"` (unchanged — out
    of scope)
- Source `lib/copy/assessmentStatusCopy.ts:54–60` (`SHORT_CAPTIONS`)
  now reads:
  - `Accelerating: "Accelerating"` ✅ (matches §Requirements 1)
  - `Practicing: "Practicing"` ✅
  - `Specialist Track: "Specialist Track"` ✅
  - `In progress: "Foundation lessons"` (unchanged — out of scope)
  - `Not started: "Start the first lesson"` (unchanged — out of
    scope)
- Bug KAN-147 verified `status: fixed`.

## Run history

### 2026-05-15 — padi-uat-agent (attempt 2 / re-test after eng-fix-1)
- Verdict: PASS
- Scenarios: ✅ 9 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Teacher dashboard `/teacher` vocab + colors + nowrap | ✅ | — | — |
  | UAT-02 | About page outcomes order + descriptions + tone | ✅ (was ❌) | kan-146 verified fixed | — |
  | UAT-03 | Student profile header pill | ✅ | — | — |
  | UAT-04 | Curriculum module page banner pill | ✅ | — | — |
  | UAT-05 | Backward read-compat + console.warn gating | ✅ | — | — |
  | UAT-06 | Mobile 375×667 no horizontal scroll | ✅ | — | — |
  | UAT-07 | Console errors / typecheck / lint | ✅ | — | — |
  | UAT-08 | Demo fixture one student per signal | ✅ | — | — |
  | UAT-09 | CAPTIONS / SHORT_CAPTIONS strings vs §Requirements 1 | ✅ (was 🐛) | kan-147 verified fixed | — |

- Notes for padi-eng:
  - The pre-existing unused `eslint-disable-next-line no-console`
    directive at `lib/copy/assessmentStatusCopy.ts:30` is still
    surfacing as a lint warning. Trivial follow-up: drop the
    comment (the `console.warn` is now reachable, so the disable
    is genuinely unused). Non-blocking for ship.
- Notes for padi-design:
  - No design drift remaining on /teacher/about — all three
    outcomes match the launch-positioning tone. Recommend a spot
    check on the logged-in teacher dashboard at 375×667 with a
    real student in the Specialist Track signal to confirm the
    red pill renders single-line in a realistic card width
    (unverifiable without auth in this UAT environment).
- Missing from ticket: nothing. AC was precise; the eng_fix patched
  both regressions surgically.

### 2026-05-15 — padi-uat-agent (attempt 1 — archived)
- See `LR-26-uat.md.stale-attempt-1` for full attempt-1 report
  (verdict FAIL, 2 bugs filed: KAN-146 P1 + KAN-147 P2). Both now
  resolved.
