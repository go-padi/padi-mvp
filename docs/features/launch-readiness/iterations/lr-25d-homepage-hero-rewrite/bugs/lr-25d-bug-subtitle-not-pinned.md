---
id: LR-25d-BUG-02
title: "[LR-25d] Subtitle paraphrased — does not match pinned string"
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

The hero subtitle on `/` is a build-time paraphrase, not the verbatim copy pinned in LR-25d §Requirements item 6. LR-25d is a copy-pinning ticket; any deviation from the pinned string is a FAIL.

### Steps to reproduce

1. `curl -s http://localhost:3000/ | grep -oE '<p class="max-w-full[^"]*">[^<]*</p>'`
2. Observe the subtitle text.

### Actual

Source — `app/page.tsx:28-30`:
```tsx
<p className="max-w-full md:max-w-2xl text-lg text-gray-700">
  Padi turns proven phonics research into short, multisensory lessons kids ages 3–7 actually enjoy — with zero prep for the grown-up guiding them.
</p>
```

### Expected

The subtitle must read exactly:

> A multisensory reading program for ages 3–7, built on the Science of Reading. Padi adapts to every child — moving ready readers forward faster, and giving emerging readers exactly the practice they need.

i.e. `app/page.tsx:28-30` must be:

```tsx
<p className="max-w-full md:max-w-2xl text-lg text-gray-700">
  A multisensory reading program for ages 3–7, built on the Science of Reading. Padi adapts to every child — moving ready readers forward faster, and giving emerging readers exactly the practice they need.
</p>
```

### Fix

Replace the `<p>` body at `app/page.tsx:28-30` with the verbatim string from LR-25d §Requirements item 6. Preserve the en-dash in "ages 3–7" (U+2013) and the em-dash after "every child" (U+2014).

### Notes

- The pinned subtitle is the load-bearing positioning copy that distinguishes Padi as a multisensory Science-of-Reading program, name-checks the "ready readers vs emerging readers" framing (the new 2-signal vocab from LR-26), and matches go-padi.com.
- The current paraphrase drops "Science of Reading", drops the "ready/emerging readers" framing entirely, and reframes Padi as a "zero prep for the grown-up" tool — none of which is what was approved.

## Fix Notes

**Root cause:** The hero subtitle was paraphrased at build time, dropping the "Science of Reading" name-check and the "ready readers / emerging readers" framing from LR-26, and substituting a "zero prep for the grown-up" angle that was never approved.

**Files changed:** `app/page.tsx` (lines 28–30).

**Why this fix is correct:** The `<p>` body now contains the verbatim string from LR-25d §Requirements item 6: "A multisensory reading program for ages 3–7, built on the Science of Reading. Padi adapts to every child — moving ready readers forward faster, and giving emerging readers exactly the practice they need." The U+2013 en-dash in "3–7" and U+2014 em-dash after "every child" are preserved, restoring the load-bearing positioning copy that matches go-padi.com.
