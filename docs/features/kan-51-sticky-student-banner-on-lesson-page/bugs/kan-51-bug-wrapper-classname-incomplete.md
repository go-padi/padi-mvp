---
id: KAN-51-BUG-01
title: "Sticky wrapper className missing prescribed mobile/desktop visual classes"
type: bug
status: fixed
severity: P2
parent: KAN-51
uat: KAN-51-UAT
file: app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx
line: 634
created: 2026-05-22
---

## Summary

The sticky wrapper added in KAN-51 has only minimal positioning classes
(`sticky top-0 z-10 -mx-4 md:mx-0`) and is missing every visual class
prescribed by the refined ticket. The mobile acceptance criterion
"Banner edge-to-edge with white/blur background" is not met — on
mobile the wrapper is transparent and the inner blue card breaks out
edge-to-edge with rounded corners clipped at the viewport edges.

## Steps to reproduce

1. Open `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`.
2. Inspect line 634:
   ```tsx
   <div className="sticky top-0 z-10 -mx-4 md:mx-0">
   ```
3. Compare with refined ticket spec
   (`.buildloop/iterations/005/feature-refined.md`, line 40):
   ```tsx
   <div className="sticky top-0 z-10 -mx-4 md:-mx-0 px-4 md:px-0 py-2 bg-white/95 backdrop-blur border-b border-gray-100 md:rounded-2xl md:border md:border-blue-100 md:bg-blue-50/80 md:py-3 md:px-4">
   ```

## Expected

Wrapper className includes:
- `bg-white/95 backdrop-blur` (mobile white/blur background)
- `border-b border-gray-100` (mobile bottom border separating from content)
- `px-4 md:px-0` + `py-2 md:py-3 md:px-4` (padding)
- `md:rounded-2xl md:border md:border-blue-100 md:bg-blue-50/80`
  (desktop rounded blue card via wrapper)

## Actual

Wrapper has only `sticky top-0 z-10 -mx-4 md:mx-0`. The desktop blue
treatment is achieved coincidentally because the pre-existing inner
`<div className="rounded-2xl border border-blue-200 bg-blue-50 ...">`
still renders inside the wrapper. On mobile, however, there is no
white/blur background, no border-b, no padding on the wrapper itself —
so as the user scrolls, the rounded-2xl blue card from the inner div
extends edge-to-edge (via `-mx-4`) with its rounded corners clipped at
the viewport, and there is no white/blur scrim behind it.

## Impact

- Mobile AC fails: "Banner edge-to-edge with white/blur background".
- Sticky positioning still fires correctly; functional behavior intact.
- Desktop visual is close to spec but achieved via inner div, not
  the wrapper as specified.

## Suggested fix

Replace line 634 with the className from the refined ticket spec.
Single-line change. No other edits.

## Fix Notes

**Root cause:** The initial implementation added only the positioning
classes (`sticky top-0 z-10 -mx-4 md:mx-0`) to the new sticky wrapper
and relied on the pre-existing inner blue card to provide the visual
treatment. This satisfied desktop coincidentally but left the mobile
wrapper transparent, so the inner `rounded-2xl` card extended
edge-to-edge with clipped corners and no white/blur scrim.

**Files changed:**
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` —
  replaced the sticky wrapper's className on line 634 with the full
  className prescribed by `.buildloop/iterations/005/feature-refined.md`
  line 40.

**Why this fix is correct:** The replacement className adds the mobile
visual layer that the AC requires (`bg-white/95 backdrop-blur`,
`border-b border-gray-100`, `px-4 py-2`) so the sticky banner reads as
a true edge-to-edge white/blur strip on mobile, and adds the desktop
treatment (`md:rounded-2xl md:border md:border-blue-100
md:bg-blue-50/80 md:py-3 md:px-4`) on the wrapper itself, matching the
spec verbatim. Sticky positioning is unchanged, and no other code was
touched.
