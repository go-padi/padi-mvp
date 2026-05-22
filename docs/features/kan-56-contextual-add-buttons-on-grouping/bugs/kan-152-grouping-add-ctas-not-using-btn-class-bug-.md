---
id: KAN-152
title: "Grouping page Add CTAs do not use shared `.btn` class — spec violation + visual inconsistency"
type: bug
status: fixed
priority: P2
severity: P2
feature: start-teaching-flow
parent: KAN-56
uat: KAN-56-UAT
launch_blocker: false
created: 2026-05-22
created_by: padi-uat-agent (iter-006)
---

## Summary

On `/teacher/grouping` (live branch), the new "Add group" `<button>` and "Add student" `<Link>` CTAs in the Groups and Individual Students section headers do NOT use the shared `.btn` utility class that the refined ticket (KAN-56) explicitly mandates. They instead use ad-hoc inline Tailwind utilities, with two different visual treatments (one bordered/white, one solid black). This violates the spec, breaks visual consistency with every other primary CTA in the app (e.g., `/teacher/curriculum` Home/Dashboard `.btn` links, `app/page.tsx`, `app/teacher/layout.tsx`), and creates two mismatched button styles side-by-side on the same page.

## Where

- File: `app/teacher/grouping/page.tsx`
- "Add group" button: lines 217-224
- "Add student" Link: lines 274-279

## Actual behavior (verbatim from source)

```tsx
// Add group (lines 217-224)
<button
  type="button"
  onClick={() => setAddGroupOpen(true)}
  disabled={!tenantId}
  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  Add group
</button>

// Add student (lines 274-279)
<Link
  href="/students"
  className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
>
  Add student
</Link>
```

## Expected behavior (per refined ticket KAN-56)

`.buildloop/iterations/006/feature-refined.md` lines 41-52, 76, 98 explicitly specify:

```tsx
<button type="button" onClick={() => setAddGroupOpen(true)} className="btn">
  Add group
</button>
```

```tsx
<Link href="/students" className="btn">
  Add student
</Link>
```

Acceptance Criteria (line 76, 98) repeats: "Live Groups header: 'Add group' button right-aligned (`btn` class)", "CTA tappable (`btn` class)".

`.btn` is a real, defined utility in `app/globals.css:9`:

```css
.btn { @apply inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm hover:bg-gray-100; }
```

It is used consistently across the codebase: `app/error.tsx`, `app/not-found.tsx`, `app/page.tsx:73`, `app/teacher/layout.tsx:47`, `app/students/[studentId]/start/page.tsx:121`.

## Why this matters (P2)

1. **Spec violation.** The refined ticket explicitly enumerated `className="btn"` four times and listed it in two AC lines. The build agent silently substituted custom utilities.
2. **Visual inconsistency.** The two CTAs render with different visual weights (light bordered vs solid dark) on the same page header row, contradicting the page-style language used elsewhere.
3. **Maintenance drift.** New ad-hoc button styles fork the design system. If `.btn` ever gets a global change (e.g., focus ring, padding tweak), these two CTAs will not pick it up.

## Steps to reproduce

1. Pull current `buildloop/lr-24c-phase-badges-on-chapters` branch HEAD.
2. Open `app/teacher/grouping/page.tsx`.
3. Search for "Add group" — observe inline rounded-xl/border classes instead of `className="btn"`.
4. Search for "Add student" — observe inline rounded-xl/bg-gray-900 classes instead of `className="btn"`.
5. Compare to `app/page.tsx:73` or `app/error.tsx:18` which both use `className="btn"` as the spec required.

## Fix

Replace both CTA `className` values with `"btn"` exactly as the refined ticket specified. Keep the `disabled={!tenantId}` guard on the "Add group" button (orthogonal concern, not blocked by class change).

```tsx
<button type="button" onClick={() => setAddGroupOpen(true)} disabled={!tenantId} className="btn">
  Add group
</button>
```

```tsx
<Link href="/students" className="btn">
  Add student
</Link>
```

## Evidence

- Refined ticket: `.buildloop/iterations/006/feature-refined.md` lines 41-52, 76, 98
- Implementation: `app/teacher/grouping/page.tsx` lines 217-224 and 274-279
- Existing `.btn` definition: `app/globals.css:9-10`
- Existing `.btn` usage references: `app/page.tsx:73`, `app/teacher/layout.tsx:47`, `app/error.tsx:18`, `app/not-found.tsx:10`

## Out of scope for this bug

- Whether the `.btn` class itself is the right primitive (it is what the codebase uses today).
- The disabled-when-no-tenant behavior on the Add group button (keep it).
- AddGroupModal internals (unchanged).

## Fix Notes

**Root cause:** During the initial build for KAN-56, the implementation substituted ad-hoc inline Tailwind utilities for the `.btn` shared utility class that the refined ticket explicitly mandated four times (and twice in the Acceptance Criteria). The two CTAs ended up with two different visual treatments (bordered/white "Add group" vs solid black "Add student"), forking the design system on a single header row.

**Files changed:**
- `app/teacher/grouping/page.tsx` — replaced the `className` value on the "Add group" `<button>` (previously a long inline rounded-xl/border/bg-white utility chain) with `className="btn"`. Replaced the `className` value on the "Add student" `<Link>` (previously a rounded-xl/bg-gray-900 utility chain) with `className="btn"`. The `disabled={!tenantId}` guard on the "Add group" button was preserved as required.

**Why this fix is correct:** The refined ticket and AC both explicitly enumerate `className="btn"` as the required class. `.btn` is a real, defined utility in `app/globals.css:9` already used consistently across the codebase (`app/page.tsx`, `app/teacher/layout.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/students/[studentId]/start/page.tsx`). Swapping to `.btn` restores spec compliance, unifies the two header CTAs visually, and keeps them on the shared design-system primitive so future global tweaks propagate automatically. No other behavior — guard logic, conditional rendering via `showStartTeachingCta`, modal wiring, or AddGroupModal internals — was touched.
