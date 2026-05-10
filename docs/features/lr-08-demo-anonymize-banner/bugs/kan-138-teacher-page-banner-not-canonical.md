---
id: KAN-138
title: "[Bug] /teacher logged-out shows non-canonical preview banner copy ('Anonymous preview: …') instead of canonical PREVIEW_BANNER"
type: bug
status: fixed
priority: high
severity: P1
parent: LR-08
uat: LR-08-uat-1
feature: lr-08-demo-anonymize-banner
created: 2026-05-10
discovered_in_iteration: 4
---

## Summary

The logged-out `/teacher` route renders the legacy banner string `Anonymous preview: sign in to manage students, groups, and lesson progress.` from `app/teacher/page.tsx:160` instead of the canonical `Preview mode — sign in to use your own data.` defined in `lib/copy/previewCopy.ts`.

The LR-08 narrow-slice build wired `PREVIEW_BANNER` into `app/teacher/layout.tsx`, but the layout's preview banner is gated behind `isDashboardView`, which only matches `/teacher/dashboard`, `/teacher/curriculum`, `/teacher/about`, `/teacher/assessments`, `/teacher/grouping`, `/teacher/resources` — **not** `/teacher` itself. On `/teacher`, the layout banner never renders. The actual visible banner on `/teacher` is a separate `<div class="rounded-xl border border-amber-200 bg-amber-50 …">Anonymous preview: …</div>` block inside `app/teacher/page.tsx` that the iteration did not touch.

This violates LR-08 AC #2 ("Banner — consistent across affected surfaces"), which explicitly lists `/teacher` as a surface that must show `Preview mode — sign in to use your own data.`

## Steps to reproduce

1. With dev server running on `localhost:3000`, open an incognito window (logged-out state).
2. Navigate to `http://localhost:3000/teacher`.
3. Observe the amber banner directly above the preview-card grid.

## Expected

Banner reads exactly:
```
Preview mode — sign in to use your own data.
```

(Sourced from `PREVIEW_BANNER` in `lib/copy/previewCopy.ts`.)

## Actual

Banner reads:
```
Anonymous preview: sign in to manage students, groups, and lesson progress.
```

Verified via `curl -s http://localhost:3000/teacher | grep -oE "Anonymous preview[^<]*"` returning the legacy string.

## Evidence

- Rendered HTML excerpt (logged-out `/teacher`):
  `<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Anonymous preview: sign in to manage students, groups, and lesson progress.</div>`
- Source: `app/teacher/page.tsx:159-161`
- Layout gate that excludes `/teacher`: `app/teacher/layout.tsx:19-25` — `isDashboardView` checks for sub-routes only.

## Root cause

The pre-build survey listed `app/teacher/layout.tsx:39` as the banner site for the `/teacher` surface, but the layout banner is never rendered on `/teacher` because `isDashboardView` excludes it. The actual banner on `/teacher` lives in `app/teacher/page.tsx:160` and was never edited.

The verification grep in the refined ticket (`grep -rEn '"Preview mode[ :—-]|Read-only preview|This is demo data' app components`) is too narrow — it does not match `Anonymous preview:`, so the regression slipped through.

## Fix

In `app/teacher/page.tsx`, replace the inline string at line 160 with the canonical constant:

```tsx
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';
…
<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
  {PREVIEW_BANNER}
</div>
```

Optionally, update the ticket's verification grep to also catch `Anonymous preview` and any other non-canonical preview-banner phrasings that might exist elsewhere in `app/`.

## Acceptance criteria for fix

- Logged-out `/teacher` renders the exact string `Preview mode — sign in to use your own data.` and no other preview-banner phrasing.
- `grep -rEn "Anonymous preview" app components` → 0 matches.
- The 6 other affected surfaces (curriculum, curriculum/[chapter], grouping, start-teaching/students/[id], start-teaching/groups/[gid], teacher layout for sub-routes) continue to render the canonical banner unchanged.
- Logged-in branch in `app/teacher/layout.tsx` still reads `Workspace tools enabled for this session.`
- `app/teacher/assessments/page.tsx` remains untouched.

## Out of scope for this fix

- Audit of every other amber-banner-shaped block in the app (covered by LR-08's broader, deferred surface audit).
- Rewriting the "Read-only demo" sub-pill copy on the student/group preview lists.

## Fix Notes

**Root cause:** The LR-08 iteration wired `PREVIEW_BANNER` into `app/teacher/layout.tsx`, but that layout's banner is gated behind `isDashboardView`, which excludes the bare `/teacher` route. The actual banner rendered on `/teacher` is a separate inline `<div>` inside `app/teacher/page.tsx` (the demo-data branch), which still carried the legacy `Anonymous preview: …` string.

**Files changed:**
- `app/teacher/page.tsx` — added `import { PREVIEW_BANNER } from '@/lib/copy/previewCopy'` and replaced the hard-coded string at the demo-branch banner site with `{PREVIEW_BANNER}`.

**Why this fix is correct:**
- The banner now renders the canonical `PREVIEW_BANNER` constant, satisfying LR-08 AC #2 for the `/teacher` surface.
- `grep -rEn "Anonymous preview" app components` returns 0 matches.
- No other surfaces touched: the layout banner for sub-routes, logged-in copy ("Workspace tools enabled for this session."), and `app/teacher/assessments/page.tsx` are unchanged.
- The change is scoped to a single string substitution + import; no behavior outside the banner copy is modified.
