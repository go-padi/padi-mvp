---
id: LR-27-UAT
title: "UAT — LR-27 /teacher/about refresh"
parent: LR-27
status: failed
verdict: FAIL
run_date: 2026-05-15
run_by: padi-uat-agent
updated: 2026-05-15
---

## Summary

Verdict: **FAIL**.

Section order, Why Padi paragraph, Mona paragraph, role-aware swap, old-vocab sweep, lint, typecheck, and mobile structural inspection all PASS. **AC #4 fails**: the three colored rows in "Three signals at a glance" ship only the first em-dash segment each — they're missing the second em-dash chain segment required by LR-27 §Requirements 3 and the §Acceptance Criteria block.

## Scenarios

### UAT-01 — Section order top-to-bottom
- Status: ✅ PASS
- Expected order: Why Padi → Built by a teacher, for teachers → About the Padi Method → Core Concepts → Program Structure (under "How the Program Works") → Three signals at a glance → Using This App Daily.
- Verified via curl of `/teacher/about`, grep extraction of headings in DOM order. Output:
  `Why Padi → Built by a teacher → About the Padi Method → Core Concepts → Program Structure → Three signals at a glance → Using This App Daily`.

### UAT-02 — Why Padi paragraph exact copy + role swap
- Status: ✅ PASS
- Default-role (teacher) render: `Most reading programs teach every child the same way. Kids ready to fly get held back. Kids who need more time get rushed. By kindergarten, the differences add up. Padi gives every child the right pace — and gives teachers a clear view of where each one is, in real time.`
- Source uses `rolePhrase(role, 'teachers', 'you')` exactly once on the single intended phrase (`app/teacher/about/page.tsx:83`).
- `rolePhrase` (`lib/copy/roleCopy.ts`) returns the teacher value for `role === null | 'teacher'` and the parent value for `role === 'parent'` — so a parent will see "you" in that slot only.

### UAT-03 — Mona paragraph exact copy, no role swap
- Status: ✅ PASS
- Rendered: `Padi was created by Mona Iyer, a reading specialist with over 25 years of classroom experience and certifications including AMS, CDT, and CALT. After decades of teaching, Mona built Padi to give every early childhood teacher the tools to accelerate every reader — and recognize early which kids deserve more time, so they get it before kindergarten.`
- Matches §Requirements 2 word-for-word.
- No `rolePhrase` call inside the Mona `<section>` (verified at `app/teacher/about/page.tsx:86–91`).

### UAT-04 — "Three signals at a glance" block content
- Status: ❌ FAIL
- Expected (per LR-27 §Requirements 3):
  - 🟢 **Accelerating** — On track to read sooner — has mastered all core skills
  - 🟡 **Practicing** — Locking in foundational skills — building confidence with practice
  - 🔴 **Specialist Track** — Recommended for closer review with a reading specialist
- Actual (rendered DOM):
  - 🟢 Accelerating — On track to read sooner
  - 🟡 Practicing — Locking in foundational skills
  - 🔴 Specialist Track — Recommended for closer review
- Heading "Three signals at a glance" ✅ present.
- Tone classes ✅ correct (`bg-green-50/text-green-800/border-green-100`, `bg-amber-50/text-amber-900/border-amber-100`, `bg-red-50/text-red-900/border-red-100`).
- Italic tagline below ✅ present: `A clear signal for every student, every lesson.`
- All three rows are TRUNCATED — missing the second em-dash chain segment that the AC explicitly specifies.
- Bug filed: `docs/features/launch-readiness/iterations/lr-27-teacher-about-refresh/bugs/kan-148-bug-three-signals-rows-missing-second-em-dash-segment.md`

### UAT-05 — Old `outcomes` array block is gone (no duplicate 3-signal section)
- Status: ✅ PASS
- `app/teacher/about/page.tsx` no longer declares an `outcomes` array.
- The rendered DOM contains exactly one "Three signals at a glance" section and exactly one row each for Accelerating / Practicing / Specialist Track.

### UAT-06 — Vocab sweep
- Status: ✅ PASS
- `grep -nE 'Needs Help|Needs Intervention'` in `app/teacher/about/page.tsx`: 0 hits.
- `grep -nE '\bReady\b'` in `app/teacher/about/page.tsx`: 0 hits.
- The only surviving lowercase "ready" is `Track which students need repetition and who is ready to move forward` in the `dailyUse` list — that is plain English, not a 3-signal label, so it is acceptable per the AC and per LR-27 §Requirements 4.
- "kids ready to fly" in the Why Padi paragraph is plain English — acceptable.

### UAT-07 — Role-aware (parent gets "you", teacher gets "teachers")
- Status: ✅ PASS (verified via source review; runtime role-swap not exercised because no browser MCP available and the test env defaults to teacher).
- Source: `app/teacher/about/page.tsx:83` calls `rolePhrase(role, 'teachers', 'you')` exactly once.
- Helper (`lib/copy/roleCopy.ts:15`) returns the parent string only when `role === 'parent'`; teacher / null / unknown roles fall through to the teacher string. No teacher → parent flash risk.
- No other `rolePhrase` calls in the file (verified by `grep -nE 'rolePhrase' app/teacher/about/page.tsx`).

### UAT-08 — Mobile 375 × 667
- Status: ✅ PASS (structural)
- No `min-w-*`, `w-[*]`, `whitespace-nowrap`, or `overflow-x-*` in `app/teacher/about/page.tsx` — verified by grep.
- The only grid (`grid gap-4 md:grid-cols-2`) collapses to single column below the `md` breakpoint (768 px).
- All `<section>` / card wrappers use the existing `rounded-2xl border ... p-5 shadow-sm` pattern with no fixed widths.
- Once the bug fix lands and the longer two-segment row text is added, the longest line (~67 chars for the Specialist Track row) will wrap to two lines within the card — no overflow risk.

### UAT-09 — No new console errors
- Status: ⏸️ BLOCKED — no Chrome MCP available in this environment.
- Static analysis: no `console.error`, `throw`, or runtime side-effects added in `app/teacher/about/page.tsx` beyond pure render. The only external call is `useAuth()` (already on this surface pre-LR-27 indirectly through other teacher pages) and `rolePhrase` (pure function). No new error surfaces are plausible.
- Recommendation: implementer must verify dev tools on `/teacher/about` shows no new errors before sign-off. Pre-existing LR-26 dev-only legacy-coercion warn is acceptable per the ticket.

### UAT-10 — Lint + typecheck
- Status: ✅ PASS
- `pnpm lint`: 0 errors, 1 pre-existing warning in `lib/copy/assessmentStatusCopy.ts` (unused eslint-disable directive — NOT introduced by LR-27, lives in LR-26 territory).
- `pnpm tsc --noEmit`: no output (clean exit).

## Run history

### 2026-05-15 — padi-uat-agent
- Verdict: FAIL
- Scenarios: ✅ 8 / ❌ 1 / 🐛 0 / ⏸️ 1
- Results:

  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Section order | ✅ | — | — |
  | UAT-02 | Why Padi exact copy + role swap | ✅ | — | — |
  | UAT-03 | Mona paragraph exact copy | ✅ | — | — |
  | UAT-04 | Three signals at a glance content | ❌ | docs/features/launch-readiness/iterations/lr-27-teacher-about-refresh/bugs/kan-148-bug-three-signals-rows-missing-second-em-dash-segment.md | P1 |
  | UAT-05 | Old outcomes array removed | ✅ | — | — |
  | UAT-06 | Vocab sweep | ✅ | — | — |
  | UAT-07 | Role-aware swap | ✅ | — | — |
  | UAT-08 | Mobile 375 × 667 structural | ✅ | — | — |
  | UAT-09 | No new console errors | ⏸️ | — | — |
  | UAT-10 | Lint + typecheck | ✅ | — | — |

- Notes for padi-eng: Single surgical fix on `app/teacher/about/page.tsx` lines 143, 146, 149. Append the second em-dash chain segment to each of the three signal rows per LR-27 §Requirements 3 verbatim. Do not touch anything else. Bug file `kan-148` documents the exact diff.
- Notes for padi-design: The merged 3-signal block visual treatment (colored cards, emoji prefix, italic tagline) is on spec. Only the row copy is short. Once eng fixes the copy, longest row will wrap to two lines on 375 px — that's expected per AC. No design action needed.
- Missing from ticket: UAT-09 (console errors) is structurally untestable here without a browser MCP. The eng brief and ticket should call out that BuildLoop's UAT phase has no Chrome MCP in this iteration; the only way to validate console output today is the implementer's manual dev-tools check. Recommend either (a) adding a Playwright probe step to the BuildLoop UAT phase, or (b) explicitly marking "no new console errors" as a sign-off responsibility of the implementer, not the UAT agent.
