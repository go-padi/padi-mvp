---
id: KAN-140
type: bug
status: fixed
severity: P1
parent: LR-15
uat: LR-15-uat-1
created: 2026-05-11
---

# Homepage hero overflows the 375px mobile viewport horizontally

## Summary

At 375×667 (iPhone SE / smallest supported mobile viewport), `/` renders with the entire hero column wider than the viewport, causing page-level horizontal scroll. The eyebrow chip, H1, subtitle, and the inner "Everything You Need for Reading Success" card all clip at the right edge. The top nav's "Start Teaching" CTA also clips. LR-15 introduced a longer eyebrow chip (`Now in free early access for teachers of 3- to 7-year-olds`, 57 chars, vs the prior `📚 Structured Multisensory Reading`, ~33 chars) and a longer gradient-spanned H1 (`Spot reading gaps before they become reading struggles.` vs `Help Every Child Love Reading`). Both contribute to a hero that no longer fits at 375 — but the underlying hero is also missing a mobile-first responsive treatment, so the overflow was already present before LR-15 (subtitle and inner card clipped on the baseline too). LR-15 widens the chip past the viewport for the first time.

## Steps to reproduce

1. With `pnpm dev` running on port 3000, take a 375×667 headless screenshot:
   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=375,667 --virtual-time-budget=3000 --screenshot=/tmp/lr15-375.png http://localhost:3000/
   ```
2. Open `/tmp/lr15-375.png`.
3. Observe the chip text reads `Now in free early access for teachers of 3- to 7-year-old` — the final `s` is clipped at the right viewport edge.
4. Observe H1 reads `Spot reading gaps b...` clipped after `gaps`.
5. Observe the subtitle's last word on each line clips (`...every`, `...inte`, `...Science`, `...required.`).
6. Observe the inner card title clips: `Everything You Need for Reading Suc...`.

For comparison, repeat with the pre-LR-15 page (`git stash` LR-15 changes, restart server): the inner card and subtitle still clip, but the OLD chip `📚 Structured Multisensory Reading` fits entirely within the viewport. The chip-driven overflow is a new regression contribution from LR-15; the broader hero overflow is pre-existing.

## Expected

At 375×667:
- No horizontal scroll on `/` (LR-15 AC #9: "wraps cleanly within the hero column. No horizontal scroll on the page.").
- Eyebrow chip fits within the visible viewport (LR-15 ticket-spec AC #3 intent: "single-line within the chip bounds" AT a 375 viewport — the binding constraint is implicitly "within the viewport," not just "within the chip's own border-radius").
- H1, subtitle, and inner Everything-You-Need card all visible without horizontal scrolling.

## Actual

At 375×667 every hero element clips at the right viewport edge. The chip overflows the viewport even though its text doesn't wrap inside the rounded-full pill (the pill itself is wider than 375). The subtitle wraps but inside a `max-w-2xl` (672px) container that exceeds 375. The inner card is laid out in a 2-column hero grid (`md:grid-cols-[1.1fr_0.9fr]`) — at the `md` breakpoint this becomes 2-col, but the grid columns aren't constrained below `md` either, so the white card's intrinsic width pushes the page wide.

## Root cause (code-level)

`app/page.tsx` lines 6, 11, 13–14, 19, 34:
- Line 6: `<section className="...px-6 py-14...">` — section has 24px horizontal padding, leaving 327px of content at 375 viewport. The contents must fit in 327px.
- Line 11: `<div className="relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">` — single-column on mobile. OK.
- Lines 13–14: the eyebrow chip is `inline-flex` with `text-xs` and `px-3 py-1`. New text is 57 chars at ~12px font → measured chip width ~360–380px. Exceeds the 327px content slot, so the chip pushes the hero column wider than the viewport.
- Line 19: subtitle `<p className="max-w-2xl ...">` — `max-w-2xl` = 42rem = 672px. On mobile this should be `w-full` or `max-w-prose` or simply have no explicit max so it shrinks to the parent. As written the subtitle's natural width exceeds 327px.
- Line 34: the inner promo card `<div className="relative rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-blue-100">` contains a 2-col sub-grid (`grid gap-4 sm:grid-cols-2`) — at 375 it's 1-col (good), but the card itself has padding (`p-6` = 24px each side) and contains an `<h3 className="text-lg ...">Everything You Need for Reading Success</h3>` whose natural width exceeds 327 - 48 = 279px at 18px font, pushing the card wide.

Net effect: the hero column's children (chip, max-w-2xl `<p>`, inner card) all set widths or have intrinsic widths > 327px, and there's no `overflow-hidden` / `min-w-0` / mobile-clamp utility on the parent grid cell to contain them. The `<section>` does have `overflow-hidden`, so the visual overflow is clipped at the section edge, but the document body still scrolls horizontally because the hero section's content exceeds it.

## Fix options

1. **Smallest diff — use the LR-15 fallback chip and constrain subtitle on mobile.**
   - `app/page.tsx:14`: change chip text to `Free early access for ages 3–7` (the LR-15-ticket-specified fallback) OR keep the long form behind a `hidden md:inline` / `md:hidden` split that renders the fallback on mobile and the long form on `md+`.
   - `app/page.tsx:19`: replace `max-w-2xl` with `max-w-full md:max-w-2xl`.
   - This fully removes the chip-driven and subtitle-driven overflow on mobile and preserves the founder-approved long-form copy on tablet/desktop, which is the more probable case for marketing-site cross-traffic.

2. **Layout fix — make the hero grid cell `min-w-0`.**
   - `app/page.tsx:12`: change `<div className="space-y-6">` to `<div className="space-y-6 min-w-0">`.
   - And replace `max-w-2xl` on the subtitle as above.
   - And add `whitespace-nowrap`-free constraints; let the chip wrap on narrow viewports (this would violate the LR-15 AC #3 single-line spirit unless we accept wrap as graceful on truly narrow screens).
   - More invasive but fixes the structural issue.

3. **Combination (recommended):** chip falls back to short form on mobile (option 1 chip half), and subtitle gets `max-w-full md:max-w-2xl` (option 1 subtitle half), and inner card gets `min-w-0` on its grid cell.

## Severity rationale

P1, not P0. The page renders, the copy is correct, and at all viewports `>= md` (768px) the layout is clean. iPhone SE / 375 viewport is the smallest supported mobile, used by a non-trivial share of K-2 teachers' personal phones (older devices). A teacher landing on `/` from go-padi.com on an iPhone SE sees a clipped chip and H1 and has to horizontally scroll the page — that's a visibly broken first impression for the exact "brand-voice continuity" case LR-15 was meant to solve. Blocks LR-15 verdict because it violates AC #9 ("No horizontal scroll on the page").

## Spec gap (LR-15)

LR-15 AC #3 defines "wrap" as the failure mode for the long-form chip at 375 and prescribes a `Free early access for ages 3–7` fallback. The chip in the implementation does NOT wrap (`white-space: normal` would wrap inside the pill — but `inline-flex` with no width constraint produces a single-line pill that simply expands beyond its parent). So the chip technically meets the AC-3 single-line condition, while the chip's parent column overflows the viewport — a case the spec didn't anticipate. The fallback should be triggered on "exceeds viewport," not only on "wraps."

LR-15 follow-up should clarify AC #3 wording: "If at 375 viewport the chip's outerWidth exceeds the available column width, use the fallback."

## Evidence

- Screenshot (LR-15 applied, 375×667): `/tmp/lr15-375.png` — shows chip, H1, subtitle, nav, and inner card all clipping at right edge.
- Screenshot (baseline pre-LR-15, 375×667): `/tmp/lr15-baseline-375.png` — shows old chip fits, but H1, subtitle, nav, and inner card still clip. Confirms pre-existing layout overflow on baseline plus LR-15-introduced chip overflow.
- Screenshot (LR-15 applied, 375×1400 full page): `/tmp/lr15-375-full.png` — shows entire hero section overflow extends through the Targeted Support card row.
- Screenshot (LR-15 applied, 1200×800 desktop): `/tmp/lr15-wide.png` — clean, all copy fits, gradient `reading struggles` visible. Confirms desktop ACs all pass.
- Console: no JS errors at 375 or 1200 viewport during render (verified via `--enable-logging=stderr`, only Chrome-internals warnings present).

## Fix Notes

**Root cause.** The hero's left grid cell on `app/page.tsx` had three children with intrinsic widths greater than the 327px content slot available at the 375px viewport: (a) a `rounded-full` inline-flex chip whose new 57-char text expanded the pill past the viewport, (b) a subtitle pinned to `max-w-2xl` (672px) on every breakpoint, and (c) a right-column promo card whose padded `<h3>` had an intrinsic width >279px. Because grid items default to `min-width: auto`, neither grid cell could shrink below its content's intrinsic width, so the page body scrolled horizontally even though the `<section>` had `overflow-hidden`.

**Files changed.**
- `app/page.tsx`: added `min-w-0` to both hero grid cells (the left text column at line 12 and the right promo card at line 35); split the eyebrow chip into a short mobile copy (`Free early access for ages 3–7`) shown via `md:hidden` and the founder-approved long form shown via `hidden md:inline` (the LR-15-AC-3 fallback); changed the subtitle from `max-w-2xl` to `max-w-full md:max-w-2xl` so it shrinks to the parent on mobile.

**Why this fix is correct.** `min-w-0` on grid cells removes the implicit `min-width: auto` that pinned each column to its content's intrinsic width — this lets the inner promo card's `<h3>` text wrap rather than force-widen the page, satisfying AC #9 ("No horizontal scroll"). The chip swap is the exact fallback prescribed by LR-15 AC #3, applied via Tailwind's `md` breakpoint (768px), which preserves the long-form "founder-approved" copy on tablet/desktop (the AC's primary case) while honoring the AC's single-line-pill intent on mobile. The subtitle constraint `max-w-full md:max-w-2xl` removes the 672px lower bound on mobile while keeping the desktop measure cap. The H1 was not modified — it already wraps naturally inside the cell once the cell can shrink. No behavior changes apply at `md+` (≥768px) viewports, so all desktop ACs remain satisfied.
