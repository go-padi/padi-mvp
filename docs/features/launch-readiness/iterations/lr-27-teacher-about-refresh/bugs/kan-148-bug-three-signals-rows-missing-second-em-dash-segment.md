---
id: KAN-148
title: "[Bug] /teacher/about — 'Three signals at a glance' rows missing the second em-dash segment required by LR-27 AC #4"
type: bug
status: fixed
priority: high
severity: P1
feature: launch-readiness
parent: LR-27
uat: LR-27-UAT
created: 2026-05-15
created_by: padi-uat-agent
file_paths:
  - app/teacher/about/page.tsx
---

### Summary

On `/teacher/about`, the merged "Three signals at a glance" block renders only the FIRST half of each row's em-dash chain. The LR-27 ticket (§Requirements 3, §Acceptance Criteria — "Three signals at a glance") requires a TWO-segment em-dash chain per row. The implementer shipped a single-segment version on all three rows.

This is a copy-fidelity regression against the LR-27 spec and against the marketing surface (go-padi.com 2026-05-13 update) that LR-27 is supposed to mirror.

### Where

- File: `app/teacher/about/page.tsx`
- Section: the `<section>` element with `<h4>Three signals at a glance</h4>` (lines 138–154)
- Specifically lines 143, 146, 149.

### Steps to reproduce

1. Start the dev server: `pnpm dev -- --port 3000` (already running for UAT).
2. Navigate to `http://localhost:3000/teacher/about`.
3. Scroll to the "Three signals at a glance" section (between "How the Program Works" and "Using This App Daily").
4. Read the three colored rows.

### Expected (per LR-27 §Requirements 3 and §Acceptance Criteria — Three signals at a glance)

- Row 1 (green): `🟢 Accelerating — On track to read sooner — has mastered all core skills`
- Row 2 (amber): `🟡 Practicing — Locking in foundational skills — building confidence with practice`
- Row 3 (red): `🔴 Specialist Track — Recommended for closer review with a reading specialist`

### Actual (verified via rendered DOM at `http://localhost:3000/teacher/about` and source at `app/teacher/about/page.tsx`)

- Row 1 (green): `🟢 Accelerating — On track to read sooner`
- Row 2 (amber): `🟡 Practicing — Locking in foundational skills`
- Row 3 (red): `🔴 Specialist Track — Recommended for closer review`

Each row is missing its second em-dash segment. The shorter strings are not in the ticket — they are not in the spar refinement, not in the eng brief, and not in the marketing source they're supposed to mirror.

### Evidence

Source (`app/teacher/about/page.tsx`):

```tsx
<div className="rounded-xl border p-4 bg-green-50 text-green-800 border-green-100">
  <p className="text-sm">🟢 <span className="font-semibold">Accelerating</span> — On track to read sooner</p>
</div>
<div className="rounded-xl border p-4 bg-amber-50 text-amber-900 border-amber-100">
  <p className="text-sm">🟡 <span className="font-semibold">Practicing</span> — Locking in foundational skills</p>
</div>
<div className="rounded-xl border p-4 bg-red-50 text-red-900 border-red-100">
  <p className="text-sm">🔴 <span className="font-semibold">Specialist Track</span> — Recommended for closer review</p>
</div>
```

Rendered DOM (curl of `/teacher/about`, tags stripped):

```
🟢Accelerating — On track to read sooner
🟡 Practicing — Locking in foundational skills
🔴 Specialist Track — Recommended for closer review
```

### Fix

Edit `app/teacher/about/page.tsx` lines 143, 146, 149 to extend each `<p>` payload to the full two-segment em-dash chain:

```tsx
<p className="text-sm">🟢 <span className="font-semibold">Accelerating</span> — On track to read sooner — has mastered all core skills</p>
...
<p className="text-sm">🟡 <span className="font-semibold">Practicing</span> — Locking in foundational skills — building confidence with practice</p>
...
<p className="text-sm">🔴 <span className="font-semibold">Specialist Track</span> — Recommended for closer review with a reading specialist</p>
```

Note: the longest row will be ~67 chars and is expected to wrap to two lines on the 375 px viewport per LR-27 mobile AC. No layout change required — the card already wraps text by default.

### Out of scope for this fix

- Don't touch any other section.
- Don't add new `rolePhrase` swaps (LR-27 §Out of Scope).
- Don't restructure as a server component (LR-27 §Out of Scope; tracked separately as `LR-27-meta`).

### Acceptance for this bug

- All three signal rows render the full two-segment em-dash chain verbatim per LR-27 §Requirements 3.
- No other change in `app/teacher/about/page.tsx`.
- `pnpm lint` and `pnpm tsc --noEmit` still pass.

## Fix Notes

**Root cause:** During implementation of LR-27, the three signal rows in the "Three signals at a glance" section were truncated to the first em-dash segment only. The LR-27 spec (§Requirements 3 and §Acceptance Criteria) specifies a two-segment em-dash chain per row mirroring the go-padi.com marketing surface, but each `<p>` payload in `app/teacher/about/page.tsx` was shipped with only the first segment.

**Files changed:**
- `app/teacher/about/page.tsx` (lines 143, 146, 149) — appended the second em-dash segment to each of the three signal rows.

**Why this fix is correct:** The three `<p>` strings now match the LR-27 §Requirements 3 copy verbatim:
- Row 1: `🟢 Accelerating — On track to read sooner — has mastered all core skills`
- Row 2: `🟡 Practicing — Locking in foundational skills — building confidence with practice`
- Row 3: `🔴 Specialist Track — Recommended for closer review with a reading specialist`

The change is purely text content inside existing `<p>` tags — no structural, styling, or layout changes were introduced. The cards wrap text by default so longer strings render correctly on the 375 px mobile viewport per the LR-27 mobile AC. No other section of the file was touched, honoring the bug's out-of-scope constraints (no `rolePhrase` swaps, no server-component restructure).
