---
id: SIGNIN-2-bug-eye-button-tap-area
title: "Eye-button tap area is 36×36 px, fails AC-01 ≥44×44 minimum"
type: bug
status: fixed
severity: P1
priority: high
feature: sign-in-flow
parent: SIGNIN-2
uat: SIGNIN-2-uat
ac: AC-01
file: components/auth/SignInModal.tsx
created: 2026-05-08
---

## Summary

The Password and Confirm Password show/hide eye buttons render as a 36×36 px hit target, which fails AC-01's ≥44×44 px requirement. The class set `p-2` (8 px) around an `h-5 w-5` (20 px) icon yields 8 + 20 + 8 = **36 px** in both axes. WCAG 2.5.5 / iOS HIG mobile minimum is 44×44.

Spec authors appear to have miscalculated `p-2` — at Tailwind defaults `p-2` is 0.5 rem = 8 px, not the ~12 px implied. To hit ≥44 px with the existing `h-5 w-5` icon, padding needs to be ≥12 px per side (`p-3`), or the icon needs to grow, or the button needs an explicit `min-h-[44px] min-w-[44px]`.

## Steps to reproduce

1. Run `pnpm dev -- --port 3000` on branch `buildloop/signin-2-polish`.
2. Open `http://localhost:3000/`, click `Sign In` in TopNav.
3. Flip to **Create Account** so both Password and Confirm Password render.
4. In DevTools console run on either eye button:
   ```js
   const el = document.querySelector('button[aria-label*="password" i][aria-pressed]');
   const r = el.getBoundingClientRect();
   console.log(r.width, r.height);
   ```
5. Observed: `36 36`. Expected: each axis ≥ `44`.

(Verification is also deterministic from the source: `components/auth/SignInModal.tsx` line 201 / 229 sets `p-2` on a button whose only child is `<EyeIcon>` containing an `svg` with `className="h-5 w-5"`. With Tailwind defaults and no theme overrides in `tailwind.config.ts` / `app/globals.css`, the computed box is 36 × 36.)

## Expected

Both eye buttons compute to ≥44 px in width and height.

## Actual

Both eye buttons compute to 36 × 36 px.

## Suggested fix

Change `p-2` → `p-3` on lines 201 and 229 of `components/auth/SignInModal.tsx` (`p-3` = 12 px; 12 + 20 + 12 = 44 px), and bump the input `pr-12` (48 px) → `pr-14` (56 px) on lines 192 and 220 to keep the icon clear of the typed text. Alternative: add `min-h-[44px] min-w-[44px] flex items-center justify-center` to the button.

## Evidence

- Source: `components/auth/SignInModal.tsx:198-206` (Password eye button), `:226-234` (Confirm Password eye button).
- Tailwind config: `tailwind.config.ts` — no theme.extend, defaults apply.
- Global CSS: `app/globals.css` — no root font-size override.

## Fix Notes

**Root cause:** Both eye toggle buttons used `p-2` (8 px) padding around an `h-5 w-5` (20 px) icon, computing to a 36 × 36 px hit target — below the WCAG 2.5.5 / iOS HIG ≥44 × 44 minimum that AC-01 requires.

**Files changed:**
- `components/auth/SignInModal.tsx` — Password eye button (line 201) and Confirm Password eye button (line 229) now use `p-3`. Their corresponding inputs (lines 192, 220) bumped from `pr-12` to `pr-14` so the larger button does not crowd typed text.

**Why this fix is correct:** `p-3` at Tailwind defaults is 0.75 rem = 12 px per side. With the existing 20 px icon: 12 + 20 + 12 = **44 px** in both axes, exactly meeting AC-01's ≥44 × 44 px minimum. The input's right padding is increased from 48 px to 56 px (`pr-14`) so the wider button (now 44 px wide, positioned at `right-2` = 8 px) leaves clearance from typed characters. No other behavior, layout, or styling is touched.
