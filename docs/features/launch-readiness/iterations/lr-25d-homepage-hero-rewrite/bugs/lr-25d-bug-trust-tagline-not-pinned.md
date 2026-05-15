---
id: LR-25d-BUG-04
title: "[LR-25d] Trust tagline paraphrased — missing two of three signals + wrong separators"
type: bug
status: fixed
priority: highest
feature: launch-readiness
parent: LR-25d
uat: LR-25d-UAT
severity: P0
created: 2026-05-15
created_by: padi-uat-agent
---

### Summary

The trust tagline added in the hero is "Built on the Science of Reading. Loved by teachers and parents." This drops two of the three pinned trust signals (`Multisensory` and `Designed by a 25-year reading specialist`) and uses period separators rather than the pinned middle-dot (`·`, U+00B7) separators. LR-25d §Requirements item 9 pins this string verbatim.

### Steps to reproduce

1. `curl -s http://localhost:3000/ | grep -oE '<p class="text-xs text-gray-500">[^<]*</p>'`
2. Observe both tagline `<p>` elements.

### Actual

Source — `app/page.tsx:45-47`:
```tsx
<p className="text-xs text-gray-500">
  Built on the Science of Reading. Loved by teachers and parents.
</p>
```

### Expected

Per LR-25d §Requirements item 9, the tagline must be exactly:

```tsx
<p className="text-xs text-gray-500">
  Built on the Science of Reading · Multisensory · Designed by a 25-year reading specialist
</p>
```

Separator is U+00B7 MIDDLE DOT (`·`) with a single space on each side. No trailing punctuation.

### Fix

Replace the text in the `<p>` at `app/page.tsx:45-47` with the exact pinned string above. The disclaimer at `app/page.tsx:48-50` ("Free during early access. No credit card needed.") is correct and must remain unchanged.

### Notes

- This is the load-bearing trust strip — dropping "Multisensory" and "25-year reading specialist" removes the two strongest credibility signals.
- The "Loved by teachers and parents" phrase is not in the approved copy at all; it was invented at build time.
- Three signals separated by middle dots is the pattern go-padi.com uses; matching it is the entire point of LR-25d.

## Fix Notes

**Root cause:** The trust tagline was paraphrased at build time to "Built on the Science of Reading. Loved by teachers and parents.", which dropped two of the three pinned trust signals (Multisensory, 25-year reading specialist), substituted an unapproved "Loved by teachers and parents" phrase, and used period separators instead of the pinned U+00B7 middle dot.

**Files changed:** `app/page.tsx` (lines 45–47).

**Why this fix is correct:** The `<p className="text-xs text-gray-500">` body now reads exactly "Built on the Science of Reading · Multisensory · Designed by a 25-year reading specialist" per LR-25d §Requirements item 9 — all three trust signals are present, the separators are U+00B7 MIDDLE DOT with single spaces on each side, and there is no trailing punctuation. The unaffected disclaimer `<p>` on lines 48–50 ("Free during early access. No credit card needed.") was left unchanged as instructed.
