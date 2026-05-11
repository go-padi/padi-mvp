---
id: LR-01-uat-1
parent: LR-01
title: "UAT — LR-01 Fix homepage marketing copy"
type: uat
status: fail
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-10
ran_by: padi-uat-agent
target: http://localhost:3000
buildloop_iteration: 1
---

## Scope

Validate every refined AC for LR-01: AI-claim removal, K-2 audience copy, mobile chip layout at 375x667, repo-wide regression grep, and the feature-card truthfulness audit (refined AC #5).

## Method

Tooling: Chrome devtools tools were not available in this environment. Used:
- `curl -s http://localhost:3000/` to fetch rendered DOM.
- Python regex extraction of visible text from rendered HTML.
- `grep -rEn` across `app/`, `components/`, `lib/` for AI/age-claim regression.
- Source-code review for auth-state, redirect behavior, and feature-existence verification (the protocol's Code Review Fallback path).
- Tailwind-class CSS analysis for the 375x667 chip-on-single-line check (no headless browser was installed).

## Results by AC

### AC1 — Happy path, logged out: no AI claims in rendered DOM
- Status: PASS
- Evidence: visible-text extract of `http://localhost:3000/` contains zero matches for `AI-`, `AI Enhanced`, `AI-powered`, `AI powered`, `artificial intelligence` (case-insensitive).

### AC1b — Happy path, logged out: K-2 / ages 5-7 audience stated
- Status: PASS
- Evidence: rendered DOM contains `K-2` (2 hits) and `ages 5-7` (2 hits). Hero subtitle reads: `Structured, multisensory reading lessons for K-2 readers (ages 5-7), built on the ASDEC Kickstart curriculum.` The Targeted Support card lists `K-2 (ages 5-7) focus`.

### AC1c — Happy path, logged out: every named feature is true today
- Status: FAIL
- Two visible feature-card bullets describe capabilities that do not exist in the app:
  1. `Audio pronunciation guides` (Interactive Lessons card, `app/page.tsx:42`). No pronunciation-guide implementation exists. Only audio path in the codebase is a teacher-private upload on the lesson-notes flow.
  2. `Printable PDF worksheets` (Teacher Tools card, `app/page.tsx:52`). Repo has no `public/` directory, no PDF library, and the only "printable" surface (`app/teacher/resources/page.tsx`) is three `href: '#'` stubs.
- Bug filed: `docs/features/lr-01-fix-marketing-copy/bugs/lr-01-bug-01-printable-pdf-worksheets-do-not-exist.md` (P1)
- Bug filed: `docs/features/lr-01-fix-marketing-copy/bugs/lr-01-bug-02-audio-pronunciation-guides-do-not-exist.md` (P2)

### AC2 — Auth-state, logged in: same copy, no role variation, no redirect change
- Status: PASS (verified via code review; no test credentials available, so no in-browser logged-in render was performed)
- Evidence: `app/page.tsx` is a static server component. `grep -E "user|session|redirect|useRouter"` against `app/page.tsx` returns zero hits. No `middleware.ts` exists at the repo root. The page renders identical markup regardless of auth state and applies no redirect.
- Caveat: did not load `/` while authenticated due to lack of seed creds. Code analysis is conclusive — there is no auth-aware branch on this page — but the protocol prefers a runtime check. Recording as PASS-by-code-review.

### AC3 — Mobile 375x667: chip on single line
- Status: PASS (verified via CSS analysis; no headless browser was available for a true 375x667 render)
- Evidence: chip markup is `<div class="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm"><span>📚 Structured Multisensory Reading</span></div>`. `inline-flex` sizes to content. At `text-xs` (12px), the 31-character string + emoji + horizontal padding renders at roughly 220-240px wide — well under the ~327px hero column at 375px viewport with the section's `px-6` padding. No `max-w-*` constraint on the parent `<div class="space-y-6">`. No truncation classes. No risk of wrap.
- Caveat: not visually verified at 375x667. If a headless renderer is added to the loop, this should be re-checked.

### AC4 — Mobile 375x667: subtitle wraps cleanly, no horizontal scroll, no card overflow
- Status: PASS (verified via CSS analysis)
- Evidence: subtitle `<p class="max-w-2xl text-lg text-gray-700">` is constrained by `max-w-2xl` (672px) which is wider than the 375px viewport, so the natural viewport-width-minus-padding governs and wrapping is normal. Hero uses `md:grid-cols-[1.1fr_0.9fr]` so on mobile the layout collapses to a single column — no horizontal overflow. Feature cards use `grid gap-4 sm:grid-cols-2`, so on the 375px viewport they stack vertically. No fixed widths. No `overflow-x` issues introduced by this change.
- Caveat: not visually verified at 375x667.

### AC5 — Repo-wide AI-claim regression grep
- Status: PASS
- Evidence: `grep -rEn "AI-|AI Enhanced|AI-powered|AI powered|artificial intelligence" app components lib` returns zero matches.
- Same audit for `ages? 3-4|age 3-4|3 to 4|3-year-old|4-year-old` returns zero matches.

### AC5b — Broader claim-vocabulary check on `/` (real-time, analytics, automatic, intelligent, smart, predictive)
- Status: PASS (no occurrences of those words in `app/page.tsx` or its rendered DOM).

### AC6 — Empty/error state
- N/A per ticket (static marketing surface, no data dependencies).

## Run history

### 2026-05-10 — padi-uat-agent
- Verdict: FAIL
- Scenarios: PASS 6 / FAIL 1 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | No AI claims in rendered DOM | PASS | — | — |
  | UAT-02 | K-2 / ages 5-7 audience stated | PASS | — | — |
  | UAT-03 | Every named feature true today | FAIL | bugs/lr-01-bug-01 + bugs/lr-01-bug-02 | P1 / P2 |
  | UAT-04 | Logged-in: same copy, no redirect | PASS (code review) | — | — |
  | UAT-05 | 375x667 chip single-line | PASS (CSS analysis) | — | — |
  | UAT-06 | 375x667 subtitle/cards no overflow | PASS (CSS analysis) | — | — |
  | UAT-07 | Repo-wide AI/age regression grep | PASS | — | — |
- Notes for padi-eng:
  - Two surgical edits in `app/page.tsx`: remove or "coming soon"-frame `Audio pronunciation guides` (line 42) and `Printable PDF worksheets` (line 52). LR-01 explicitly required this audit (Requirement #5 in the source ticket and AC #5 in the refined ticket) and it was missed.
  - Default per the refined ticket's ambiguity-resolution rule is **remove**, not "coming soon".
  - After the edits, re-run `grep -rEn "Printable PDF|pronunciation" app components lib` — it should yield zero hits in `app/page.tsx`.
- Notes for padi-design:
  - The Interactive Lessons card will be down to three bullets after the pronunciation-guide bullet is removed. That is fine visually — the other two cards already have four bullets, but a 3-bullet card next to two 4-bullet cards still aligns. If you want symmetry, suggest a true replacement bullet that fits Interactive Lessons (e.g. `Word-by-word reveal pacing` if that exists; do not invent).
  - Teacher Tools card has the same issue. After removing PDF worksheets, consider whether `Curriculum alignment` and `Ready-to-use lesson plans` are stronger as a 3-bullet card or whether a real replacement bullet exists.
- Missing from ticket: nothing. The refined ticket caught this category — the implementation just didn't follow through.

Verdict: FAIL
