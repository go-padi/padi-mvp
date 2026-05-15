---
id: LR-25d-BUG-01
title: "[LR-25d] H1 paraphrased — does not match pinned string"
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

The H1 rendered on `/` is a build-time paraphrase, not the verbatim string pinned in the LR-25d ticket. LR-25d is a copy-pinning ticket and the AC explicitly says: "the H1 reads exactly `Accelerate your child's reading.`". The current implementation reads "The science-backed way to grow your child's reading." instead.

### Steps to reproduce

1. `pnpm dev -- --port 3010` (or use the running server on `:3000`)
2. `curl -s http://localhost:3000/ | grep -o '<h1[^>]*>[^<]*<span[^>]*>[^<]*</span>[^<]*</h1>'`
3. Observe the H1 text.

### Actual

```
The science-backed way to grow <span ...>your child's reading</span>.
```

Source — `app/page.tsx:25-27`:
```tsx
<h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
  The science-backed way to grow <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">your child&apos;s reading</span>.
</h1>
```

### Expected

The H1 must read exactly:

```
Accelerate your child's reading.
```

with "your child's reading" inside the gradient span and the trailing period outside the span, per LR-25d §Requirements item 5:

```tsx
<h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
  Accelerate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">your child&apos;s reading</span>.
</h1>
```

### Fix

Replace `app/page.tsx:25-27` with the H1 markup from the refined ticket §Requirements item 5. The leading word must be `Accelerate` (not "The science-backed way to grow"), and only `your child's reading` belongs inside the gradient span.

### Notes

- This is a copy-pinning ticket. Any deviation from the pinned string is a FAIL — not "close enough".
- The ticket explicitly called out: "your child's reading" is the new noun phrase to emphasize, and "Accelerate" is the new verb framing.

## Fix Notes

**Root cause:** The H1 leading clause was paraphrased from the pinned "Accelerate" to "The science-backed way to grow", changing the verb framing entirely. The gradient span and trailing period were structurally correct, but the verb word was wrong.

**Files changed:** `app/page.tsx` (lines 25–27).

**Why this fix is correct:** The H1 now reads exactly "Accelerate your child's reading." per LR-25d §Requirements item 5, with the verb "Accelerate" outside the gradient span, only "your child's reading" inside the gradient span (preserving `&apos;` for the apostrophe), and the period outside the span. This matches the pinned markup byte-for-byte and restores the active verb framing the ticket called out.
