---
id: LR-15-uat-1
parent: LR-15
type: uat
status: fail
created: 2026-05-11
updated: 2026-05-11
---

# UAT: LR-15 — Match homepage copy to go-padi.com canonical

Tested against `http://localhost:3000` with the LR-15 changes applied (`app/page.tsx` unstaged diff: chip + H1 + subtitle + CTA tagline + Targeted Support bullet).

## Scenarios

### UAT-01 — Hero H1 reads `Spot reading gaps before they become reading struggles.` with gradient on `reading struggles`

Status: ✅

- Action: Fetched `/` via curl + headless Chrome.
- Expected: H1 exactly `Spot reading gaps before they become reading struggles.` with the existing `text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600` span wrapping ONLY `reading struggles`, trailing period outside the span.
- Actual (DOM at `app/page.tsx:16-18`):
  ```
  <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
    Spot reading gaps before they become <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">reading struggles</span>.
  </h1>
  ```
  Period is outside the span. Gradient span wraps `reading struggles`. Visually confirmed in desktop screenshot `/tmp/lr15-wide.png`: black text `Spot reading gaps before they become`, blue-to-purple gradient `reading struggles`, then a black period.

### UAT-02 — Hero subtitle verbatim incl. em-dash + en-dash

Status: ✅

- Expected: `Padi gives teachers a clear signal for every student ages 3–7: ready, needs help, or needs intervention. Multisensory lessons built on the Science of Reading — zero prep required.` with U+2013 en-dash in `3–7` and U+2014 em-dash before `zero prep`.
- Actual (verified via `grep -oE "ages 3–7" app` → 2 matches; rendered HTML in `/tmp/lr15-page.html` contains the exact string including both U+2013 in `3–7` and U+2014 ` — `). Exact match.

### UAT-03 — Eyebrow chip single-line within chip bounds at 375×667

Status: ✅ (per spec text) but see UAT-09 for viewport overflow

- Expected per LR-15 AC #3: long-form `Now in free early access for teachers of 3- to 7-year-olds` should be single-line within the chip's rounded-full bounds. If it wraps, fall back to `Free early access for ages 3–7`.
- Actual: chip text renders as a single horizontal pill — does NOT wrap to multiple lines (the pill is one row tall). Confirmed in `/tmp/lr15-chip-zoom.png` (375×300 @2x DPR) showing one continuous capsule. The capsule itself, however, exceeds the 375 viewport width and clips at the right edge. The text is `Now in free early access for teachers of 3- to 7-year-olds` (full string in DOM); the visible portion ends at `...3- to 7-year-old` because of the clipping.
- Per LR-15 AC #3 wrap criterion: PASS (does not wrap).
- Per UAT-09 overflow criterion: this contributes to a viewport overflow — see bug KAN-140.

### UAT-04 — CTA tagline `Free during early access. No credit card needed.` below button row

Status: ✅

- Expected: New `<p>` with `text-xs text-gray-500` containing the exact string, placed under the `Start Teaching` + `Teacher Dashboard` button row.
- Actual (`app/page.tsx:30-32`):
  ```
  <p className="text-xs text-gray-500">
    Free during early access. No credit card needed.
  </p>
  ```
  Renders below the button row in the desktop screenshot `/tmp/lr15-wide.png` (and 375 screenshot `/tmp/lr15-375-full.png`). Exact string match. Class matches the spec equivalent (`text-xs text-gray-500`; the `mt-2` from the spec is functionally replaced by the parent's `space-y-6` flow, which produces the same visual separation since the `<p>` is a sibling of the button row inside the `space-y-6` column — verified visually).

### UAT-05 — Targeted Support card first bullet `Ages 3–7 focus`

Status: ✅

- Expected: Third feature card "Targeted Support" first bullet reads exactly `Ages 3–7 focus` with U+2013 en-dash.
- Actual (`app/page.tsx:63`): `"Ages 3–7 focus"` — confirmed en-dash via `grep -oE "Ages 3–7 focus" app` → match. Rendered in 375 full-page screenshot under the "Targeted Support" card. Other Targeted Support bullets (`Systematic phonics approach`, `Multi-sensory learning`, `Confidence building`) unchanged — verified in DOM lines 64–66.

### UAT-06 — Old placeholder copy removed

Status: ✅

- `grep -rEn "Structured, multisensory reading lessons for K-2" app` → 0 matches (exit 1).
- `grep -rEn "K-2 \\(ages 5-7\\) focus" app` → 0 matches (exit 1).
- `grep -rEn "📚 Structured Multisensory Reading" app` → 0 matches.
- `grep -rEn "Help Every Child Love Reading" app` → 0 matches.
- All four placeholder strings are gone from `app/`.

### UAT-07 — LR-01 guardrails preserved (no AI claims, no `ages 3-4` / `3-year-old` / `4-year-old`)

Status: ✅

- `grep -rEn "AI-|AI Enhanced|AI-powered|AI powered|artificial intelligence" app components lib` → 0 matches.
- `grep -rEn "ages? 3-4|age 3-4|3 to 4|3-year-old|4-year-old" app components lib` → 0 matches.
- New `ages 3–7` (en-dash) correctly does not match the hyphenated `3-4` regex.

### UAT-08 — Capability claims NOT imported (intentional per founder)

Status: ✅

- `grep -rEn "Real-Time Student Signals|Adaptive Learning Paths|Lessons adjust automatically|Seamless Referrals" app` → 0 matches.
- Confirmed not imported. Per founder decision in `feature-refined.md` lines 31, 47: these need coming-soon framing in a follow-up ticket.

### UAT-09 — Mobile 375×667: no horizontal scroll on the page

Status: ❌

- Expected: At 375×667, hero column wraps cleanly within the viewport with no horizontal scroll.
- Actual: Page overflows the 375 viewport horizontally. In `/tmp/lr15-375.png` the chip clips at `...3- to 7-year-old` (final `s` cut), the H1 clips at `Spot reading gaps b...`, every subtitle line clips on the right (`...every`, `...inte`, `...Science`, `...required.`), the top nav `Start Teaching` button clips, and the inner card title clips at `Everything You Need for Reading Suc...`.
- Root cause is mixed: pre-existing hero layout uses `max-w-2xl` on the subtitle (`app/page.tsx:19`, 672px max width with no mobile clamp), an `<h3>` inner card title that exceeds the available column at 375, and now a 57-char eyebrow chip whose `inline-flex` pill renders wider than the available 327px content slot (`375 - 2*px-6` = 327). Baseline (pre-LR-15) confirmed in `/tmp/lr15-baseline-375.png` — older shorter chip fit, but subtitle and inner card also clipped. LR-15 newly contributes the chip-driven overflow.
- Bug filed: `docs/features/launch-readiness/iterations/lr-15-match-go-padi-marketing-copy/bugs/kan-140-mobile-hero-horizontal-overflow.md` (P1).

### UAT-10 — Bottom CTA section (`Ready to Transform Reading Time?`) untouched

Status: ✅

- `git diff HEAD -- app/page.tsx` hunk markers: `@@ -11,13 +11,13 @@`, `@@ -27,6 +27,9 @@`, `@@ -57,7 +60,7 @@`. The bottom CTA section starts at line ~86 (`<section className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600...">`) and contains `Ready to Transform Reading Time?` and the two CTAs `Start Teaching Today` / `View Teacher Dashboard`. None of the diff hunks land inside this section.
- Confirmed in DOM via grep: `Ready to Transform Reading Time` present (line 89), `Join teachers and parents helping children build confidence and reading skills.` present (line 91), `Start Teaching Today` (line 96), `View Teacher Dashboard` (line 99). All identical to HEAD.

### UAT-11 — Auth state: logged-in and logged-out see same hero copy

Status: ✅

- `app/page.tsx` is a pure server component with no auth / session / user / role branching. `grep -nE "auth|session|user|role" app/page.tsx` → 0 matches. The same JSX renders for any visitor regardless of auth state. No redirects introduced.
- Verified by static analysis (not browser-tested in two states since the component has no conditional branches — there is nothing for auth to gate).

## Findings summary

| AC | Scenario | Status | Bug file | Severity |
|----|----------|--------|----------|----------|
| 1 | UAT-01 — H1 with gradient | ✅ | — | — |
| 2 | UAT-02 — Subtitle em/en dash | ✅ | — | — |
| 3 | UAT-03 — Chip single-line | ✅ | — | — |
| 4 | UAT-04 — CTA tagline | ✅ | — | — |
| 5 | UAT-05 — Targeted Support bullet | ✅ | — | — |
| 6 | UAT-06 — Old placeholder gone | ✅ | — | — |
| 7 | UAT-07 — LR-01 guardrails | ✅ | — | — |
| 8 | UAT-08 — Capability claims NOT imported | ✅ | — | — |
| 9 | UAT-09 — Mobile no horizontal scroll | ❌ | docs/features/launch-readiness/iterations/lr-15-match-go-padi-marketing-copy/bugs/kan-140-mobile-hero-horizontal-overflow.md | P1 |
| 10 | UAT-10 — Bottom CTA untouched | ✅ | — | — |
| 11 | UAT-11 — Auth-state parity | ✅ | — | — |

## Run history

### 2026-05-11 — padi-uat-agent

- Verdict: FAIL
- Scenarios: ✅ 10 / ❌ 1 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Hero H1 + gradient | ✅ | — | — |
  | UAT-02 | Subtitle em/en dash verbatim | ✅ | — | — |
  | UAT-03 | Eyebrow chip single-line in pill | ✅ | — | — |
  | UAT-04 | CTA tagline appears | ✅ | — | — |
  | UAT-05 | Targeted Support `Ages 3–7 focus` | ✅ | — | — |
  | UAT-06 | Old placeholder copy removed | ✅ | — | — |
  | UAT-07 | LR-01 guardrails preserved | ✅ | — | — |
  | UAT-08 | Capability claims not imported | ✅ | — | — |
  | UAT-09 | Mobile 375×667 no horizontal scroll | ❌ | docs/features/launch-readiness/iterations/lr-15-match-go-padi-marketing-copy/bugs/kan-140-mobile-hero-horizontal-overflow.md | P1 |
  | UAT-10 | Bottom CTA section untouched | ✅ | — | — |
  | UAT-11 | Auth-state copy parity | ✅ | — | — |
- Notes for padi-eng: The copy work itself is clean and matches the spec verbatim — H1, subtitle, chip text, CTA tagline, and Targeted Support bullet are all correct including em-dash (U+2014) and en-dash (U+2013). The single failure is mobile horizontal overflow at 375×667, rooted in `app/page.tsx`:
  - line 14: chip uses `inline-flex` with no width clamp; the 57-char long-form text exceeds the 327px available content slot at 375 viewport.
  - line 19: subtitle uses `max-w-2xl` (672px) with no mobile clamp; should be `max-w-full md:max-w-2xl`.
  - line 11: hero grid cell lacks `min-w-0`; children with long intrinsic widths push the column past the viewport.
  - The inner promo card (line 34) and its `<h3>Everything You Need for Reading Success</h3>` (line 35) are also unconstrained on mobile.
  Smallest fix to unblock LR-15: render the LR-15-ticket-specified fallback chip `Free early access for ages 3–7` on mobile (`<span className="md:hidden">Free early access for ages 3–7</span><span className="hidden md:inline">Now in free early access for teachers of 3- to 7-year-olds</span>`), and change `max-w-2xl` to `max-w-full md:max-w-2xl` on the subtitle. The broader hero responsive layout cleanup can be a follow-up.
- Notes for padi-design: Desktop hero is clean and the brand-voice match with go-padi.com is the strongest the app has had. Mobile hero is broken at 375 viewport — copy is invisible past the right edge. Decide whether to swap chip to short form on mobile or to keep long form and redesign the hero column for narrow viewports. The LR-15 spec already proposed the short-form fallback (`Free early access for ages 3–7`) for exactly this case.
- Missing from ticket: LR-15 AC #3 defines failure as "if it wraps" but doesn't define failure as "if the chip exceeds the viewport while remaining single-line." A single `inline-flex` capsule with no width clamp does not wrap — it pushes the parent wider. The spec should redefine the fallback trigger as "exceeds the available column width at 375" rather than "wraps." The current spec passes a chip implementation that is technically single-line but visibly overflowing — exactly the user-visible problem the fallback was supposed to prevent. KAN-140 captures this spec gap in its "Spec gap" section.

Verdict: FAIL
