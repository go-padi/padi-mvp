---
id: LR-16-uat-1
parent: LR-16
type: uat
status: pass
updated: 2026-05-11
---

# LR-16 UAT — Homepage feature-card brand-voice rename

Narrow slice: rename three homepage feature-card titles in `app/page.tsx` to go-padi.com brand voice.

- `Interactive Lessons` → `Multisensory Lessons`
- `Teacher Tools` → `Zero Prep Time`
- `Targeted Support` → `Science of Reading`

Bullets, icons, and surrounding sections must be untouched.

## Scenarios

### UAT-01 — AC1: Three new titles render on `/`; old titles do not
Status: ✅

- Action: `curl -s http://localhost:3000/`, grep for the six title strings.
- Observed:
  - `Multisensory Lessons` → 3 occurrences (SSR HTML + RSC payload)
  - `Zero Prep Time` → 3 occurrences
  - `Science of Reading` → 5 occurrences (3 from card + 2 from pre-existing hero copy "built on the Science of Reading")
  - `Interactive Lessons` → 0
  - `Teacher Tools` → 0
  - `Targeted Support` → 0
- Verdict: PASS.

### UAT-02 — AC2: grep new titles in `app/page.tsx` → 3 matches
Status: ✅

- Command: `grep -E '"(Multisensory Lessons|Zero Prep Time|Science of Reading)"' /Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/page.tsx`
- Observed: exactly 3 lines (lines 43, 52, 62).
- Verdict: PASS.

### UAT-03 — AC3: grep old titles in `app/page.tsx` → 0 matches
Status: ✅

- Command: `grep -E '"(Interactive Lessons|Teacher Tools|Targeted Support)"' /Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/page.tsx`
- Observed: 0 matches (grep exit 1).
- Verdict: PASS.

### UAT-04 — AC4: Bullets unchanged
Status: ✅

- Verified in source (`app/page.tsx` lines 44–48, 53–58, 63–68) and in rendered HTML (`curl` of `/`):
  - Multisensory Lessons: `Phonics-focused instruction`, `Visual word matching`, `Progress tracking` — all 3 present (3 occurrences each).
  - Zero Prep Time: `Ready-to-use lesson plans`, `Printable worksheets (coming soon)`, `Student progress reports`, `Curriculum alignment` — all 4 present.
  - Science of Reading: `Ages 3–7 focus`, `Systematic phonics approach`, `Multi-sensory learning`, `Confidence building` — all 4 present.
- Verdict: PASS.

### UAT-05 — AC5: No false-claim imports
Status: ✅

- Command: `grep -rEn "Real-Time Student Signals|Adaptive Learning Paths|Lessons adjust automatically|Seamless Referrals" app components lib`
- Observed: 0 matches (grep exit 1).
- Verdict: PASS.

### UAT-06 — AC6: LR-01 / LR-15 regression preserved
Status: ✅

- 0 `AI` / `artificial intelligence` matches in `app/page.tsx` (grep exit 1).
- 0 `ages 3-4 | ages 3–4 | ages 3-5 | ages 3–5` matches in `app/page.tsx` (grep exit 1).
- LR-15 hero copy intact in rendered HTML:
  - `Spot reading gaps` (2×), `reading struggles` (2×), `ages 3–7` (2×), `Free during early access` (2×), `Now in free early access` (2×, desktop chip), `Free early access for ages 3–7` (2×, mobile chip).
- Verdict: PASS.

### UAT-07 — AC7: Mobile 375×667 no horizontal overflow / no LR-15 regression
Status: ✅

- Verified by static analysis of `app/page.tsx`:
  - Cards container: `grid gap-4 sm:grid-cols-2` — at 375px viewport this is a single column (sm = 640px in Tailwind defaults). No multi-column squeeze.
  - Card cells: `rounded-2xl border ... p-4` (no fixed widths). `h4` and `ul` flow naturally and wrap.
  - Outer hero grid uses `md:grid-cols-[1.1fr_0.9fr]` only above md (768px); at 375px it stacks. Both grid children have `min-w-0` (lines 12 and 35) — the standard overflow guard.
  - New titles (max 20 chars: "Multisensory Lessons") are shorter than existing bullet strings already shipped without overflow at 375px (e.g. "Printable worksheets (coming soon)" — 35 chars).
- LR-15 mobile chip (`md:hidden`) "Free early access for ages 3–7" and desktop chip (`hidden md:inline`) "Now in free early access for teachers of 3- to 7-year-olds" both render in HTML — untouched by this diff.
- Verdict: PASS. No CSS surface changed by this slice; no overflow risk introduced.

### UAT-08 — AC8: Diff scope is only the three `title:` line changes
Status: ✅

- Command: `git diff HEAD -- app/page.tsx` (working-tree slice not yet committed; main tip is c36d74e).
- Observed: exactly 3 hunks, each a single `-/+` `title:` line at lines 43, 52, 62. No bullet edits, no JSX shape changes, no surrounding-section edits, no whitespace drift.
- Verdict: PASS.

## Run history

### 2026-05-11 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 8 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | New titles render, old titles gone | ✅ | — | — |
  | UAT-02 | grep new titles → 3 | ✅ | — | — |
  | UAT-03 | grep old titles → 0 | ✅ | — | — |
  | UAT-04 | Bullets unchanged | ✅ | — | — |
  | UAT-05 | No false-claim imports | ✅ | — | — |
  | UAT-06 | LR-01 / LR-15 regression preserved | ✅ | — | — |
  | UAT-07 | Mobile 375×667 no overflow | ✅ | — | — |
  | UAT-08 | Diff scope only 3 title lines | ✅ | — | — |
- Notes for padi-eng: Diff is exactly the three string edits. Working tree (not yet committed) at the time of UAT — `M app/page.tsx`. Ready to commit.
- Notes for padi-design: New titles ("Multisensory Lessons", "Zero Prep Time", "Science of Reading") match go-padi.com brand voice. "Science of Reading" now appears twice on the homepage (hero copy + feature card) — intentional reinforcement, not a duplication bug.
- Missing from ticket: AC7 (mobile overflow) is a visual assertion verified here by static CSS analysis rather than a live 375×667 screenshot, since no Chrome/Playwright tool was available in this UAT environment. Future UATs touching layout should run an actual viewport screenshot.

Verdict: PASS
