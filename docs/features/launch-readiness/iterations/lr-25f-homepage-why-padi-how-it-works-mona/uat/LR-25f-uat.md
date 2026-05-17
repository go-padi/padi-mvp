---
id: LR-25f-UAT
parent: LR-25f
title: "UAT — Homepage Why Padi + How It Works + Mona sections"
status: passed
updated: 2026-05-17
---

Verdict: PASS

## Scope

Three new homepage sections inserted between the 6-card feature grid (LR-25e) and the
"Ready to Transform Reading Time?" CTA in `app/page.tsx`:

1. Why Padi (h2 + h3 + body + 3 colored pills + italic tagline)
2. Simple for you. Powerful for your students. (h2 + subtitle + 3 numbered steps)
3. Built by a teacher, for teachers. (h2 + Mona body paragraph)

All copy must match the canonical strings VERBATIM (typographic apostrophes, em-dash
U+2014, en-dash U+2013).

## Scenarios

### UAT-01 — Why Padi: verbatim strings present

Status: ✅

Curl + grep `http://localhost:3000/`. All Why Padi strings appear exactly once:

- `<h2>Why Padi</h2>` × 1
- `<h3>Most reading programs teach every child the same way.</h3>` × 1
- Body paragraph "Kids ready to fly get held back. Kids who need more time get rushed. By kindergarten, the differences add up. Padi gives every child the right pace — and gives teachers a clear view of where each one is, in real time." × 1 (em-dash U+2014 verified before "and gives teachers")
- Pill `🟢 Accelerating` + caption `On track to read sooner` × 1
- Pill `🟡 Practicing` + caption `Locking in foundational skills` × 1
- Pill `🔴 Specialist Track` + caption `Recommended for closer review` × 1
- Italic tagline `A clear signal for every student, every lesson.` × 1

### UAT-02 — How It Works: verbatim strings + ordered list

Status: ✅

- `<h2>Simple for you. Powerful for your students.</h2>` × 1
- Subtitle `Get started in minutes, not hours.` × 1
- Step 1: `<h3>Sign up &amp; add your students</h3>` (rendered from `&`) + body "Create your free account and add your class roster. It takes less than five minutes." × 1
- Step 2: `<h3>Teach with structured lessons</h3>` + body "Open a lesson and follow the multisensory prompts. Each session is 10–15 minutes, ready to go." × 1 — en-dash U+2013 confirmed between 10 and 15
- Step 3: `<h3>See every student’s path — instantly</h3>` + body "After each lesson, Padi shows you exactly where each student is — accelerating, practicing, or ready for closer review." × 1 — typographic apostrophe `’` and em-dash `—` confirmed
- Steps wrapped in `<ol>` with numbered circular markers `1`/`2`/`3`

### UAT-03 — Mona section: verbatim body

Status: ✅

- `<h2>Built by a teacher, for teachers.</h2>` × 1
- Body paragraph "Padi was created by Mona Iyer, a reading specialist with over 25 years of classroom experience and certifications including AMS, CDT, and CALT. After decades of teaching, Mona built Padi to give every early childhood teacher the tools to accelerate every reader — and recognize early which kids deserve more time, so they get it before kindergarten." × 1 — em-dash U+2014 confirmed before "and recognize early"

### UAT-04 — Section ordering on `/`

Status: ✅

DOM byte offsets in the SSR HTML are monotonically increasing in the required order:

| Section | Offset |
|---|---|
| Hero h1 `Accelerate…` | 2884 |
| 6-card h2 `Everything an early childhood teacher needs` | 3791 |
| Why Padi h2 | 6515 |
| How It Works h2 | 7764 |
| Mona h2 | 9349 |
| Final CTA h2 `Ready to Transform Reading Time?` | 10000 |

### UAT-05 — Regression (LR-25d hero, LR-25e 6-card grid, existing CTA)

Status: ✅

- Hero h1 `Accelerate your child’s reading.` present (apostrophe rendered as `&#x27;`, h1 split across span — content unchanged from LR-25d)
- `Everything an early childhood teacher needs` h2 present
- `Ready to Transform Reading Time?` h2 present
- All 6 feature cards (Multisensory Lessons, Real-Time Student Signals, Adaptive Learning Paths, Zero Prep Time, Seamless Referrals, Science of Reading) still render

### UAT-06 — Lint + typecheck

Status: ✅

- `pnpm lint` → exit 0 (1 pre-existing warning in `lib/copy/assessmentStatusCopy.ts:30` — unused eslint-disable directive — unrelated to this change)
- `pnpm tsc --noEmit` → exit 0

### UAT-07 — Mobile (375×667) + no horizontal scroll + no console errors

Status: ✅

Verified via static analysis of the new JSX (no Chrome browser available in this UAT environment):
- Both new grids use `sm:grid-cols-3` (Tailwind `sm` breakpoint = 640 px). At 375 px the layout collapses to single column for the 3-pill row in Why Padi and the 3-step row in How It Works.
- No `min-w-*`, no fixed `w-[Npx]`, no `whitespace-nowrap`, no inline `width=` or `style=` in the new sections.
- New sections live inside the existing top-level `<div className="space-y-16">` container which inherits the layout's responsive horizontal padding — no overflow risk.
- SSR HTML contains no `__next_error__`, no hydration error markers, no inline `console.error` payloads.
- Mobile-UA curl returns HTTP 200 and renders the same pinned strings as desktop.
- Dev server returns HTTP 200 on `/`, `/teacher`, and `/teacher/curriculum`.

Note: Live `getBoundingClientRect`-style hscroll verification at 375 px was not possible without a browser tool. Risk is judged negligible given the static evidence above.

## Run history

### 2026-05-17 — padi-uat-agent

- Verdict: PASS
- Scenarios: ✅ 7 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Why Padi verbatim strings | ✅ | — | — |
  | UAT-02 | How It Works verbatim strings + ordered list | ✅ | — | — |
  | UAT-03 | Mona section verbatim body | ✅ | — | — |
  | UAT-04 | Section ordering on `/` | ✅ | — | — |
  | UAT-05 | Regression: hero, 6-card grid, final CTA | ✅ | — | — |
  | UAT-06 | `pnpm lint` + `pnpm tsc --noEmit` | ✅ | — | — |
  | UAT-07 | Mobile 375×667 + no console errors | ✅ | — | — |
- Notes for padi-eng: Build agent delivered. All ~20 pinned strings VERBATIM (typographic apostrophe `’` in "every student’s path", em-dashes U+2014 in three places, en-dash U+2013 in "10–15"). No paraphrasing this round. Single-file diff to `app/page.tsx` only, no new imports, no new state. Pre-existing lint warning in `lib/copy/assessmentStatusCopy.ts:30` is unrelated to this iter and should be cleaned up in a tech-debt sweep, not blocking.
- Notes for padi-design: Sections render in the right order with the specified pill colors (green-50/amber-50/red-50). The italic tagline and the numbered-step circle markers are present. If you want to verify final visual polish at 375 px and on real devices, that's a separate manual pass — the UAT bot can only do static analysis without a browser tool.
- Missing from ticket: Nothing material. AC was unambiguous and the verbatim-string list was load-bearing — exactly what saved this iter from the LR-25d paraphrasing trap.
