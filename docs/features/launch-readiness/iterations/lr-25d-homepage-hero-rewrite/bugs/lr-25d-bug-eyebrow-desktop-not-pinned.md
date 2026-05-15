---
id: LR-25d-BUG-03
title: "[LR-25d] Desktop eyebrow chip paraphrased — does not match pinned string"
type: bug
status: fixed
priority: high
feature: launch-readiness
parent: LR-25d
uat: LR-25d-UAT
severity: P1
created: 2026-05-15
created_by: padi-uat-agent
---

### Summary

The desktop variant of the hero eyebrow chip on `/` has been paraphrased to "Now in free early access for teachers of 3- to 7-year-olds", instead of the pinned string "Now in free early access for ages 3–7". This is a copy-pinning ticket and the deviation is a FAIL.

Notably, the paraphrase also reframes the audience as "teachers", which contradicts the rest of LR-25d's positioning (the H1 says "your child's reading", and the AC describes a parent-facing hero).

### Steps to reproduce

1. `curl -s http://localhost:3000/ | grep -oE '<span class="hidden md:inline">[^<]*</span>'`
2. Observe the desktop eyebrow chip text.

### Actual

Source — `app/page.tsx:23`:
```tsx
<span className="hidden md:inline">Now in free early access for teachers of 3- to 7-year-olds</span>
```

### Expected

Per LR-25d §Requirements item 4, the desktop variant must be exactly:

```tsx
<span className="hidden md:inline">Now in free early access for ages 3–7</span>
```

(Note: "3–7" uses an en-dash U+2013, not a hyphen.)

### Fix

Replace the desktop eyebrow `<span>` at `app/page.tsx:23` with the pinned string.

### Notes

- The mobile variant `app/page.tsx:22` is correct ("Now in free early access").
- Audience framing for the homepage hero is parent-facing per LR-25d; "teachers of 3- to 7-year-olds" is the wrong audience and also the wrong copy.

## Fix Notes

**Root cause:** The desktop eyebrow chip copy was paraphrased at build time, reframing the audience as "teachers" and replacing the pinned suffix "ages 3–7" with "3- to 7-year-olds" (also using an ASCII hyphen instead of the en-dash). LR-25d is a copy-pinning ticket; paraphrasing was not allowed.

**Files changed:** `app/page.tsx` (line 23).

**Why this fix is correct:** The desktop `<span className="hidden md:inline">` now contains the exact pinned string from LR-25d §Requirements item 4 — "Now in free early access for ages 3–7" — using U+2013 en-dash in "3–7". This restores parent-facing audience framing consistent with the H1 ("your child's reading") and matches the verbatim copy approved in the refined ticket. The mobile variant on line 22 was already correct and is left unchanged.
