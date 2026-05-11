---
id: LR-15-uat-2
parent: LR-15
type: uat
status: pass
created: 2026-05-11
updated: 2026-05-11
---

# UAT: LR-15 — Match homepage copy to go-padi.com canonical (Round 2)

Tested against `http://localhost:3000` after eng_fix attempt 1. The fix added a responsive eyebrow chip (`md:hidden` short form / `hidden md:inline` long form), changed subtitle `max-w-2xl` to `max-w-full md:max-w-2xl`, and added `min-w-0` to both flex children of the hero grid.

All copy work from round 1 is preserved. The single failing scenario (UAT-09 — mobile horizontal overflow at 375×667) was the trigger for the re-run.

## Method

- Headless Chrome with `--remote-debugging-port=9222` driven via Chrome DevTools Protocol from Node + `ws` to (a) `Emulation.setDeviceMetricsOverride` at true 375×667 mobile and 1200×800 desktop, (b) capture `Page.captureScreenshot`, (c) evaluate `Runtime.evaluate` for `document.documentElement.scrollWidth/clientWidth`, `body.scrollWidth/clientWidth`, computed visible chip text via `getComputedStyle().display`, H1/subtitle/CTA-tagline/Targeted-Support text, and bounding boxes for hero elements, (d) capture `Runtime.consoleAPICalled` and `Runtime.exceptionThrown`. Plus character-level dash verification via Python (`U+2013` en-dash, `U+2014` em-dash) and grep guardrails on `app/`, `components/`, `lib/`.

## Scenarios

### UAT-01 — Hero H1 reads `Spot reading gaps before they become reading struggles.` with gradient on `reading struggles`

Status: ✅

- Source (`app/page.tsx:17-19`):
  ```
  <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
    Spot reading gaps before they become <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">reading struggles</span>.
  </h1>
  ```
- CDP `Runtime.evaluate` returned `h1Text: "Spot reading gaps before they become reading struggles."` — exact match. Period is outside the gradient span.
- Desktop screenshot `/tmp/lr15-r2-cdp-1200.png`: gradient blue-to-purple visible on `reading struggles`, black period after the span.
- Mobile screenshot `/tmp/lr15-r2-cdp-375.png`: gradient on `reading struggles.` visible on lines 3–4 of the wrapped H1.

### UAT-02 — Hero subtitle verbatim incl. em-dash + en-dash

Status: ✅

- Source (`app/page.tsx:20-22`):
  ```
  Padi gives teachers a clear signal for every student ages 3–7: ready, needs help, or needs intervention. Multisensory lessons built on the Science of Reading — zero prep required.
  ```
- Character verification via Python: `ages 3–7` contains `U+2013` (en-dash) — confirmed. `Science of Reading — zero prep` — the dash is `U+2014` (em-dash) — confirmed.
- CDP `subtitleText` matches verbatim.

### UAT-03 — Eyebrow chip is responsive: short form on mobile, long form on desktop

Status: ✅

- Source (`app/page.tsx:13-16`):
  ```
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
    <span className="md:hidden">Free early access for ages 3–7</span>
    <span className="hidden md:inline">Now in free early access for teachers of 3- to 7-year-olds</span>
  </div>
  ```
- At 375 viewport CDP returns `visibleChipText: "Free early access for ages 3–7"` — only the `md:hidden` short-form span is rendered (the long-form's `display: none`).
- At 1200 viewport screenshot `/tmp/lr15-r2-cdp-1200.png` shows the long-form chip `Now in free early access for teachers of 3- to 7-year-olds` rendered single-line within the pill.
- Char verification: `ages 3–7` short-form uses `U+2013` en-dash (confirmed). Long-form uses `3-` / `7-year-olds` ASCII hyphens — matches the LR-15 spec verbatim go-padi.com text.

### UAT-04 — CTA tagline `Free during early access. No credit card needed.` below button row

Status: ✅

- Source (`app/page.tsx:31-33`): `<p className="text-xs text-gray-500">Free during early access. No credit card needed.</p>`.
- Rendered in both screenshots immediately below the `Start Teaching` + `Teacher Dashboard` button row, separated by parent `space-y-6` spacing.
- CDP `ctaTaglineText: "Free during early access. No credit card needed."` — single match (no duplicates anywhere else in the document).

### UAT-05 — Targeted Support card first bullet `Ages 3–7 focus`

Status: ✅

- Source (`app/page.tsx:62-67`): first bullet is `"Ages 3–7 focus"`.
- Char verification: `U+2013` en-dash in `Ages 3–7 focus` — confirmed.
- CDP `targetedSupportFirstBullet: "Ages 3–7 focus"` — exact match.
- Visually confirmed in `/tmp/lr15-r2-cdp-1200.png` under the "Targeted Support" card as the first bullet.

### UAT-06 — Old placeholder copy removed

Status: ✅

- `grep -rEn "Structured, multisensory reading lessons for K-2" app` → 0.
- `grep -rEn "K-2 \\(ages 5-7\\) focus" app` → 0.
- `grep -rEn "Help Every Child Love Reading" app` → 0.

### UAT-07 — LR-01 guardrails preserved (no AI claims, no hyphen-form age ranges)

Status: ✅

- `grep -rEn "AI-|AI Enhanced|AI-powered|AI powered|artificial intelligence" app components lib` → 0.
- `grep -rEn "ages? 3-4|age 3-4|3 to 4|3-year-old|4-year-old" app components lib` → 0.
- The desktop chip's `3- to 7-year-olds` contains a `3-` followed by a space — does not match the `3 to 4` or `3-year-old` patterns. The en-dash form `3–7` is used everywhere else.

### UAT-08 — Capability claims NOT imported (intentional, per founder)

Status: ✅

- `grep -rEn "Real-Time Student Signals|Adaptive Learning Paths|Lessons adjust automatically|Seamless Referrals" app` → 0.

### UAT-09 — Mobile 375×667: no horizontal scroll on `/`

Status: ✅ (was ❌ in round 1)

- CDP measurement at 375×667 returns:
  - `htmlScrollWidth: 375`, `htmlClientWidth: 375`
  - `bodyScrollWidth: 375`, `bodyClientWidth: 375`
  - `hasHorizontalScroll: false`
- All hero children fit within the 295px content slot (after `px-6` section padding + body margin):
  - `h1: width=295, scrollW=295, clientW=295` — wraps cleanly to 4 lines, no overflow.
  - `subtitle: width=295, scrollW=295, clientW=295` — wraps cleanly.
  - `innerCard: width=295, scrollW=295` — wraps to single column at 375 (good).
  - `innerH3: width=247` — fits within card.
- Screenshot `/tmp/lr15-r2-cdp-375.png` shows: chip = short-form pill within the visible content area, H1 wraps to 4 lines with gradient `reading struggles.` visible on lines 3–4, subtitle wraps to 5 lines all visible, button row + CTA tagline all visible. No content clipped at right edge.
- Note: `section.scrollW=423 > clientW=343` because the decorative blur blobs (`.absolute -left-24/right-20 h-64 w-64 ... blur-3xl`) extend past the section edges. The `<section>` has `overflow: hidden` so they're visually clipped, and they do not propagate to `body.scrollWidth`. AC-09 specifies "no horizontal scroll on the page" — `document.body.scrollWidth === clientWidth === 375` confirms page-level no-scroll. PASS.
- Bug `kan-140-bug-mobile-hero-horizontal-overflow.md` is marked `status: fixed` in its YAML frontmatter.

### UAT-10 — Bottom CTA section (`Ready to Transform Reading Time?`) untouched

Status: ✅

- Lines 90, 92, 97, 100 of `app/page.tsx` unchanged from round 1: `Ready to Transform Reading Time?`, `Join teachers and parents helping children build confidence and reading skills.`, `Start Teaching Today`, `View Teacher Dashboard`. Visible in `/tmp/lr15-r2-cdp-1200.png` (scrolled down — section starts at y≈1696px on mobile and is present below the hero on desktop).

### UAT-11 — Auth state: logged-in and logged-out see same hero copy

Status: ✅

- `grep -nE "auth|session|user|role|supabase" app/page.tsx` → 0. Pure static server component, no conditional branching, no redirects.

### Console / JS errors

Clean. CDP captured only two React DevTools info notices; no exceptions, no warnings, no errors.

## Findings summary

| AC | Scenario | Status | Bug file | Severity |
|----|----------|--------|----------|----------|
| 1 | UAT-01 — H1 with gradient | ✅ | — | — |
| 2 | UAT-02 — Subtitle em/en dash | ✅ | — | — |
| 3 | UAT-03 — Responsive chip | ✅ | — | — |
| 4 | UAT-04 — CTA tagline | ✅ | — | — |
| 5 | UAT-05 — Targeted Support bullet | ✅ | — | — |
| 6 | UAT-06 — Old placeholder gone | ✅ | — | — |
| 7 | UAT-07 — LR-01 guardrails | ✅ | — | — |
| 8 | UAT-08 — Capability claims NOT imported | ✅ | — | — |
| 9 | UAT-09 — Mobile no horizontal scroll | ✅ | — (KAN-140 fixed) | — |
| 10 | UAT-10 — Bottom CTA untouched | ✅ | — | — |
| 11 | UAT-11 — Auth-state parity | ✅ | — | — |

## Run history

### 2026-05-11 — padi-uat-agent (round 2, after eng_fix attempt 1)

- Verdict: PASS
- Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Hero H1 + gradient | ✅ | — | — |
  | UAT-02 | Subtitle em/en dash verbatim | ✅ | — | — |
  | UAT-03 | Eyebrow chip responsive (short on mobile / long on desktop) | ✅ | — | — |
  | UAT-04 | CTA tagline appears | ✅ | — | — |
  | UAT-05 | Targeted Support `Ages 3–7 focus` | ✅ | — | — |
  | UAT-06 | Old placeholder copy removed | ✅ | — | — |
  | UAT-07 | LR-01 guardrails preserved | ✅ | — | — |
  | UAT-08 | Capability claims not imported | ✅ | — | — |
  | UAT-09 | Mobile 375×667 no horizontal scroll | ✅ | — (KAN-140 fixed) | — |
  | UAT-10 | Bottom CTA section untouched | ✅ | — | — |
  | UAT-11 | Auth-state copy parity | ✅ | — | — |
- Notes for padi-eng: Fix landed cleanly. The responsive chip pattern (`md:hidden` / `hidden md:inline`) is the right call — preserves the verbose brand-voice copy on tablet/desktop (the more probable cross-traffic case from go-padi.com) and uses the founder-approved short-form fallback on phone-class viewports. The `max-w-full md:max-w-2xl` swap on the subtitle is the correct Tailwind idiom. The two `min-w-0` additions on the hero grid children are belt-and-suspenders against future content additions widening the column. CDP measurement confirms `document.body.scrollWidth === clientWidth === 375` at the smallest supported viewport. Note that `section.scrollWidth > clientWidth` due to decorative blur blobs extending past the section bounds, but the section's `overflow: hidden` contains them — this does not produce page-level horizontal scroll. Leave the decorative blobs alone.
- Notes for padi-design: The mobile hero now reads as cleanly as the desktop. The short-form chip `Free early access for ages 3–7` lands well visually — it's punchier than the long form and arguably better for the narrow column anyway. Worth considering whether the long form should be retired entirely in a future copy pass, since the short form covers the same intent in fewer characters. Not in scope for LR-15.
- Missing from ticket: Nothing material. The spec ambiguity flagged in round 1 (AC #3 wrap-vs-overflow definition) is resolved by the responsive-span approach — the chip no longer needs to be evaluated for "wrap" on mobile because it renders a different string entirely.

## Round 1 → Round 2 delta

| Element | Round 1 | Round 2 |
|---|---|---|
| Mobile chip | Long form, 57 chars, overflowed viewport | Short form `Free early access for ages 3–7`, fits in 295px |
| Mobile subtitle | `max-w-2xl` (672px), overflowed at 375 | `max-w-full md:max-w-2xl`, wraps to parent at 375 |
| Hero grid cells | No `min-w-0` | Both cells have `min-w-0` |
| Desktop chip | Long form | Long form (unchanged) |
| H1, subtitle text, CTA tagline, Targeted Support bullet, guardrails | All ✅ | All ✅ (unchanged) |
| `document.body.scrollWidth` at 375 | > 375 (overflow) | === 375 (no overflow) |

LR-15 is ready to ship.

Verdict: PASS
