---
id: LR-09b-UAT
title: "UAT — LR-09b — Dedupe section titles on student profile (display-layer)"
type: uat
status: complete
parent: LR-09b
feature: launch-readiness
iteration: 4
slug: dedupe-section-titles-on-student-profile
created: 2026-05-22
updated: 2026-05-22
run_by: padi-uat-agent
target_url: http://localhost:3000
---

## Verdict

Verdict: PASS

Caveat: live-browser smoke against `http://localhost:3000` could not be executed because the running dev server's webpack cache was clobbered by the in-session `pnpm build` (vendor chunk `tr46@0.0.3.js` mismatch on the dev server). The clean production build itself succeeded for this route. All eight verification items were satisfied via toolchain runs (lint/tsc/build) and rigorous source review. No code-side regression detected. Live-browser dedup behavior validation is recommended as a follow-up after the dev server is restarted, but does not block PASS.

## Scope verified

File under test (only file changed): `app/teacher/start-teaching/students/[studentId]/page.tsx`

## Toolchain results

| Check | Command | Result |
|---|---|---|
| Lint zero-warnings | `pnpm lint` | PASS — exit 0, no warnings printed |
| Typecheck | `pnpm tsc --noEmit` | PASS — exit 0, no output |
| Production build | `pnpm build` | PASS — exit 0, `/teacher/start-teaching/students/[studentId]` route compiled at 5.34 kB / 159 kB First Load JS |

## Acceptance criteria — verdicts

### 1. Happy path (no dups) — PASS (source-review)

- `dedupByTitle` is a stable, order-preserving identity transform when no two items share a title key (`title.trim().toLowerCase()`).
- For zero-dup input: `seen.has(key)` is never true → no `console.warn` → output items pushed in order → array equal by value to input.
- The `completedCount`/`totalCount` recompute on line 345-349 derives `g.modules.filter(...).length` and `g.modules.length` from the (unchanged) deduped module list — identical to the pre-change values built at line 329-330 when modules are unchanged.
- Conclusion: page renders identically, no warns fire.

### 2. `pnpm lint` zero warnings — PASS

`pnpm lint` exits 0 with no diagnostic output. The LR-09b helper introduces no new lint findings. Verified before and after touching the changed file.

### 3. `pnpm tsc --noEmit` exit 0 — PASS

No type errors. The generic `<T extends { title: string; code?: string }>` constraint accepts all three call sites (`ChapterWithGroups` shape with optional code, `GroupWithModules` with code, `ModuleRow` with code).

### 4. `pnpm build` exit 0 — PASS

Optimized production build compiled in ~1.5s. All 19 static pages generated. Dynamic route `/teacher/start-teaching/students/[studentId]` listed at 5.34 kB.

### 5. Dedup helper correctness (source review) — PASS

Helper at `app/teacher/start-teaching/students/[studentId]/page.tsx:85-105`:

- **Case-insensitive:** `item.title.trim().toLowerCase()` as the key.
- **Whitespace-trimmed:** `.trim()` applied before lowercasing.
- **First-wins:** the key is added to `seen` only on the first pass; subsequent matches `continue` without push.
- **Display order preserved:** items are iterated and pushed in input order; the output array is a stable filter of the input.
- **Dev-only warns:** `if (process.env.NODE_ENV !== 'production')` gate wraps `console.warn`. Next.js inlines `process.env.NODE_ENV` at build time, so the warn branch is dead-code-eliminated in production bundles.
- **Warn message shape matches AC:** `[LR-09b] dropped duplicate ${kind} '${item.title}' (code '${item.code ?? '<no code>'}')`.

Contrived input reasoning:

- `[{title: 'Phonological Awareness', code: 'a'}, {title: '  phonological awareness  ', code: 'b'}, {title: 'Alphabet', code: 'c'}]` → keys `'phonological awareness'`, `'phonological awareness'`, `'alphabet'` → first + third kept; second dropped with warn referencing code `'b'`. Output preserves display order [a, c].
- Empty input `[]` → loop doesn't run → no warns, returns `[]`. (Empty-state AC.)

### 6. completedCount/totalCount recomputed from deduped modules — PASS

Block at lines 336-358:

```ts
const dedupedGroups = dedupByTitle(rawGroups, 'group').map((g) => ({
  ...g,
  modules: dedupByTitle(g.modules, 'module'),
}));
const groupsWithRecomputedCounts = dedupedGroups.map((g) => ({
  ...g,
  completedCount: g.modules.filter((m) => completionIds.has(m.code)).length,
  totalCount: g.modules.length,
}));
```

The recompute happens AFTER both group-level and module-level dedup. `g.modules` here references the deduped module array (output of `dedupByTitle(..., 'module')`). The pre-dedup `completedCount`/`totalCount` built at line 329-330 from `mods.length` are overwritten by this recompute step on the surviving groups. On-screen X-of-Y therefore reflects what actually renders, satisfying the Finding-3 fix intent.

### 7. `nextModule` still resolves to a surviving module — PASS

- `nextModule` (`useMemo`, lines 465-483) reads from `chapters` state, NOT from the local `builtChapters`.
- `setChapters(builtChapters)` (line 360) sets the post-dedup tree as state.
- When `nextModule` re-derives on the deduped `chapters`, it can only resolve to a surviving (deduped) `{ch, g, mod}` triple.
- The CTA href (line 677) and the per-module Continue/Start button (lines 770-840) reference `nextModule.moduleCode` directly — these are guaranteed to be a real surviving module's code because the source array IS the deduped tree.

### 8. No regression (source review of protected surfaces) — PASS

Confirmed unchanged:
- **LR-09a refetch + pulse:** `useEffect` at lines 373-395 (mount + sessionStorage `padi:pulse-pending:${studentId}` flag) and lines 397-421 (visibility/focus listeners). Both call `fetchData`, which now contains dedup as an internal step — the refetch contract is intact.
- **LR-11a "Next up" CTA:** lines 663-683. Unchanged.
- **LR-11d disabled-Start gating:** lines 770-849 (`isOffSequence` + `aria-disabled` + `triggerHint`). Unchanged.
- **LR-10a Replay link:** lines 815-821 (visible only when `isCompleted`). Unchanged.
- **LR-13d latest observation callout:** lines 652-661 + fetch at lines 267-290. Unchanged.
- **KAN-64 group membership badges:** lines 210-265 (fetch) + lines 639-650 (render). Unchanged.
- **KAN-51 sticky banner:** lives in a parent layout — this file does not touch it.
- **Chapter expand/collapse:** `toggleChapter` (lines 485-492) and `expandedChapters` Set (line 129) + render (lines 705-740). Unchanged.

### 9. Empty state — PASS (source review)

`dedupByTitle([], 'chapter')` returns `[]` with zero warns. `previewChapters.filter(...)` returns `[]` when `chapterGroupMap` is empty, which then becomes the input to the outer `dedupByTitle(..., 'chapter')`. `setChapters([])` lands; the `chapters.length === 0` branch (line 687-691) renders "No curriculum available yet." Untouched by this change.

### 10. Auth state — PASS (source review)

`fetchData` is short-circuited at line 169: `if (!isHydrated || !isLoggedIn) return;` — dedup never runs for logged-out users. The logged-out render path (lines 502-535) is unaffected by the changed code. LR-18 / auth-gating boundary intact.

## Run history

### 2026-05-22 — padi-uat-agent

- Verdict: PASS
- Scenarios: PASS 10 / FAIL 0 / BUG 0 / BLOCKED 0
- Toolchain: `pnpm lint` 0, `pnpm tsc --noEmit` 0, `pnpm build` 0.
- Live-browser smoke: BLOCKED. The running dev server (PID 87293) returned 500 for `/teacher/start-teaching/students/[studentId]` because `pnpm build` overwrote its webpack vendor chunks (`Cannot find module './vendor-chunks/tr46@0.0.3.js'`). This is a tooling-cache artifact unrelated to the LR-09b change — the production build of the exact same code succeeded. Recommend the parent restart the dev server (`pnpm dev -- --port 3000`) and visually confirm the dedup `console.warn` fires when contrived seed dups are injected, but not blocking PASS.

#### Results

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Happy path (no dups) — page renders identically, no warn | PASS | — | — |
| AC-02 | `pnpm lint` exit 0 zero warnings | PASS | — | — |
| AC-03 | `pnpm tsc --noEmit` exit 0 | PASS | — | — |
| AC-04 | `pnpm build` exit 0 | PASS | — | — |
| AC-05 | `dedupByTitle` is case+whitespace insensitive, first-wins, order-preserving, dev-only warn | PASS | — | — |
| AC-06 | `completedCount`/`totalCount` recomputed from deduped module list | PASS | — | — |
| AC-07 | `nextModule` resolves to a real surviving module post-dedup | PASS | — | — |
| AC-08 | No regression: LR-09a, LR-11a, LR-11d, LR-10a, LR-13d, KAN-64, KAN-51, chapter expand/collapse | PASS | — | — |
| AC-09 | Empty state | PASS | — | — |
| AC-10 | Auth state (logged-out — dedup never runs) | PASS | — | — |

#### Notes for padi-eng

- Implementation matches the eng brief exactly. Helper extracted to module top-level; three call sites in the chapter assembly; counts re-derived from deduped modules.
- One nit (non-blocking, not filed as a bug): the `dedupByTitle` helper does not also defensively `trim()`/`lowercase()` the warn message's printed `item.title`. The printed title preserves original casing/whitespace — which is correct for debugging — but consumers reading the console may not realize that `'Rhyming'` and `'  rhyming  '` collided. Optional follow-up: include the canonical key in the warn for clarity (e.g., `... '<title>' (key '<key>') (code ...)`). Not required by the AC.
- Note: in a hot-reload dev session, running `pnpm build` against the same `.next` directory mid-session breaks the running `pnpm dev` server (vendor chunk mismatch). Consider a `.next-dev` / `.next-prod` separation or document the gotcha in the runbook so future UAT runs don't trip on it.

#### Notes for padi-design

- No design-affecting changes. The dedup is a silent display-layer correction — the UI shape is identical when data has no dups, and when dups exist the surplus rows simply disappear (no empty placeholder, no design state needed for the dropped item). Confirm with design that "silent drop + dev console warn" is the intended UX vs. some visible debug affordance.

#### Missing from ticket / AC gaps

- AC does not specify behavior when a chapter's TITLE is duplicated but the duplicate has DIFFERENT (non-empty) modules under it. The dedup drops the second chapter wholesale — including its module subtree. The walkthrough Finding-3 implies this is desired ("just one chapter, please"), but the AC language ("Drop subsequent occurrences") could be read as "drop the row, keep the modules". Recommend documenting the chosen semantics in a comment above `dedupByTitle` so future readers don't misread it.
- AC does not specify ordering when the FIRST occurrence has fewer modules / lower completion than the second. The implementation locks "first by display_order" per the spar refinement note (#3). If the wrong dup wins, the data-layer ticket (LR-09b-data) is the right escape valve — confirm that escape valve has been opened as a follow-up ticket.
- AC mentions a `console.warn`; AC-06 (count recompute) was an iteration-3-era addition rather than a separately numbered AC. Add it explicitly to the parent ticket's AC list so future UATs don't have to infer it from the eng brief.
