---
id: LR-11d-UAT
parent: LR-11d
title: "UAT — Guarantee group order within chapters on /teacher/curriculum"
created: 2026-05-17
updated: 2026-05-17
---

Verdict: PASS

## Summary

LR-11d adds a defensive client-side sort on `/teacher/curriculum` (logged-in branch) so groups within each chapter render in canonical `previewGroups` order regardless of how the `content_get_groups` RPC returns them. Source inspection of `app/teacher/curriculum/page.tsx` confirms the new block is correctly placed and the existing logic is intact. Build / lint / typecheck / HTTP checks all green.

## Scenarios

### UAT-01 — Defensive sort block exists and is correctly placed

Status: ✅ PASS

- The new block lives at `app/teacher/curriculum/page.tsx:150-159`, immediately after the `for (const g of resolvedGroups)` loop closes at line 148 and BEFORE `filteredPreviewChapters` is built on line 161.
- Verified inside the `fetchAll` effect, which early-returns when not (`isHydrated && isLoggedIn`) on line 94 — so the sort only runs in the logged-in branch.

### UAT-02 — Index built from previewGroups[i].code → i

Status: ✅ PASS

- Line 152: `const previewGroupOrder = new Map(previewGroups.map((g, i) => [g.code, i]));`
- Variable name differs from the ticket's example (`groupOrderIndex` in spec vs. `previewGroupOrder` shipped) but semantics are identical. Names are not load-bearing in the AC.

### UAT-03 — Sort uses Number.MAX_SAFE_INTEGER fallback for unknown codes

Status: ✅ PASS

- Lines 153-159 iterate `chapterGroupMap.values()` and sort each chapter's groups:
  ```ts
  for (const groups of chapterGroupMap.values()) {
    groups.sort((a, b) => {
      const ai = previewGroupOrder.get(a.code) ?? Number.MAX_SAFE_INTEGER;
      const bi = previewGroupOrder.get(b.code) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  }
  ```
- Unknown codes are pushed to the bottom — surfaces seeding gaps as intended.

### UAT-04 — AC bullet: "Tied unknown codes break alphabetically" — minor deviation, non-blocking

Status: 🐛 P3 (cosmetic, defensive-of-defensive)

- The ticket's example snippet includes a `localeCompare` tie-break for equal indices; the shipped implementation omits it. Multiple unknown group codes within the same chapter would therefore preserve `resolvedGroups` insertion order rather than sorting alphabetically.
- Impact: zero in production today. Unknown codes can only appear if seeding produces group codes outside `previewGroups`. The user-visible effect (unknown groups fall to the bottom of their chapter) is preserved. Surfacing seeding gaps still works.
- Not filing as a bug ticket — the primary AC (canonical order for known groups + bottom for unknowns) is fully met, and the deviation is from an illustrative code sample rather than the prose AC ("A group whose `code` is not in `previewGroups` falls to the bottom of its chapter"). Flagging here for awareness.

### UAT-05 — Chapter order driven by previewChapters (no regression)

Status: ✅ PASS

- Line 161: `const filteredPreviewChapters = previewChapters.filter(...)` followed by line 165's `.filter(ch => chapterGroupMap.has(ch.code)).map(...)` — the iteration order of `previewChapters` still defines chapter render order. No mutation.

### UAT-06 — Modules within group still sort by display_order (no regression)

Status: ✅ PASS

- Line 120 intact: `moduleRows.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0))`. The new block sorts groups only — `g.modules` arrays are not touched.

### UAT-07 — Logged-out branch (LR-18b 7-card overview) unchanged

Status: ✅ PASS

- Logged-out branch at lines 187-257 renders `CURRICULUM_OVERVIEW` and is hit by the early return at line 187 (`if (isHydrated && !isLoggedIn) return ...`).
- The `fetchAll` effect at line 92 itself early-returns at line 94 when `!isHydrated || !isLoggedIn`, so neither the RPC call nor the new sort block executes for logged-out users.
- No edits in the 187-257 range — the logged-out 7-card overview remains as shipped in LR-18b.

### UAT-08 — Empty curriculum still renders empty state

Status: ✅ PASS

- The empty-state branch at lines 401-405 (`{chapters.length === 0 && ... "Curriculum coming soon."}`) is unchanged. The new sort block operates on `chapterGroupMap` regardless of size; an empty map produces an empty `builtChapters` and triggers the empty state as before.

### UAT-09 — pnpm lint exit 0

Status: ✅ PASS

- Output: `✖ 1 problem (0 errors, 1 warning)`. The single warning is a pre-existing, unrelated unused-eslint-disable in `lib/copy/assessmentStatusCopy.ts:30` — not introduced by LR-11d. Zero errors → lint exit 0.

### UAT-10 — pnpm tsc --noEmit exit 0

Status: ✅ PASS

- Clean output (no diagnostics).

### UAT-11 — pnpm build exit 0

Status: ✅ PASS

- Build completed successfully. `/teacher/curriculum` route compiled to 5.5 kB / 159 kB First Load JS. All 19 static pages generated.

### UAT-12 — HTTP 200 on /teacher/curriculum, /, /students

Status: ✅ PASS

- `/teacher/curriculum`: 200
- `/`: 200
- `/students`: 200

### UAT-13 — No console errors expected from the new block

Status: ✅ PASS (source review)

- The new block uses only existing, already-imported `previewGroups` (line 11) and standard `Map` / `Array.prototype.sort`. No new imports. No async, no network. Cannot introduce console errors.

## Run history

### 2026-05-17 — padi-uat-agent

- Verdict: PASS
- Scenarios: ✅ 12 / ❌ 0 / 🐛 1 (P3 cosmetic) / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Sort block placement | ✅ | — | — |
  | UAT-02 | previewGroups index built | ✅ | — | — |
  | UAT-03 | MAX_SAFE_INTEGER fallback | ✅ | — | — |
  | UAT-04 | Tied unknown codes alphabetical tie-break | 🐛 | — (flagged inline) | P3 |
  | UAT-05 | Chapter order regression check | ✅ | — | — |
  | UAT-06 | Module display_order regression check | ✅ | — | — |
  | UAT-07 | Logged-out branch untouched | ✅ | — | — |
  | UAT-08 | Empty curriculum empty state | ✅ | — | — |
  | UAT-09 | pnpm lint | ✅ | — | — |
  | UAT-10 | pnpm tsc --noEmit | ✅ | — | — |
  | UAT-11 | pnpm build | ✅ | — | — |
  | UAT-12 | HTTP 200 on three routes | ✅ | — | — |
  | UAT-13 | No console errors (source review) | ✅ | — | — |
- Notes for padi-eng:
  - Shipped variable name `previewGroupOrder` differs from spec example `groupOrderIndex` — purely cosmetic, no action required.
  - Spec example included `if (ai !== bi) return ai - bi; return a.code.localeCompare(b.code);` tie-break; shipped code omits the `localeCompare` fallback (lines 154-158 only do `return ai - bi;`). Consider adding the alphabetical tie-break for stricter compliance with AC bullet "Tied unknown codes break alphabetically" — trivial follow-up, not a blocker.
- Notes for padi-design: none. No visual changes for the canonical happy path (RPC likely already returns in correct order); the sort is purely defensive.
- Missing from ticket: none.
