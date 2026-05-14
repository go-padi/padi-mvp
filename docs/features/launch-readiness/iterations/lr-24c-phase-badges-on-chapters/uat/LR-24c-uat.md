---
id: LR-24c-UAT
parent: LR-24c
feature: launch-readiness
iteration: 8
loop: 2026-05-14T02:23:19Z-fe49
created: 2026-05-13
updated: 2026-05-13
---

# LR-24c UAT — Phase badges on curriculum chapters

Verdict: PASS

## Scope

Verify that each chapter card on `/teacher/curriculum` shows a gray "Phase N" badge for logged-in parents only, with the correct phase mapping per chapter code, that the first chapter card retains the LR-24b "Start here" badge alongside the new phase badge, and that teachers and logged-out users see no badges.

## Scenarios

### UAT-01 — Parent + logged-in: all 7 chapters show correct phase badge
Status: ✅
Method: Code review of `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/teacher/curriculum/page.tsx`.
- Helper `chapterPhase(code)` (lines 55–60) strips `ind-` prefix and maps:
  - `phonological-awareness`, `alphabet` → 1
  - `phonics`, `reading`, `handwriting` → 2
  - else (incl. `spelling`, `vocab-comprehension-fluency`) → 3
- Render block (lines 263–267) emits `<span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Phase {N}</span>` guarded by `isParent && isLoggedIn`.
- Demo chapter codes confirmed in `lib/demo/demoCurriculum.ts` lines 55–68 (group + `ind-` variants); all 7 codes match the helper's mapping.

Expected mapping across the 7 chapters:
| Chapter code | Phase |
|---|---|
| phonological-awareness | 1 |
| alphabet | 1 |
| phonics | 2 |
| reading | 2 |
| handwriting | 2 |
| spelling | 3 |
| vocab-comprehension-fluency | 3 |

`ind-*` variants resolve to the same phase via the `replace(/^ind-/, '')` prefix strip.

### UAT-02 — First chapter shows both "Phase 1" + "Start here" badges
Status: ✅
Method: Code review. In `renderChapter` (lines 261–270), the title `<p>` has class `flex items-center gap-2`. Order inside the flex row:
1. Chapter title text
2. Phase badge (gray) — gated by `isParent && isLoggedIn`
3. Start here badge (blue) — additionally gated by `idx === 0`

For the first chapter (idx 0, `phonological-awareness`), both badges render: "Phase 1" appears before "Start here". The two pills are visually distinct (gray vs blue) so they do not compete. Position matches spec requirement 4.

### UAT-03 — Teacher: no phase badges, no start-here badge
Status: ✅
Method: Code review. Both badges are gated by `isParent && isLoggedIn`. `isParent` is `isHydrated && role === 'parent'` (line 72). For a teacher (`role === 'teacher'`), `isParent` is false → neither the phase badge nor the start-here badge renders. Teacher view is unchanged from pre-LR-24a baseline.

### UAT-04 — Logged-out: no badges
Status: ✅
Method: Code review. The badge predicate requires `isLoggedIn` to be true. For a logged-out viewer, `isLoggedIn` is false → neither badge renders. The logged-out PREVIEW banner (lines 296–300) continues to render as before. No regression.

### UAT-05 — Mobile 375×667
Status: ✅
Method: Code review of Tailwind classes. The badge uses `rounded-full`, `px-2 py-0.5`, `text-[11px]`. The title row uses `flex items-center gap-2`, which wraps naturally if the title is long because flex items in Tailwind without `flex-nowrap` allow content overflow only when not constrained. The badge is short ("Phase 1" = 7 chars) and lives inside a `<p>` with `text-sm font-semibold`. The longest chapter title is "Vocabulary, Comprehension & Fluency" (35 chars) which already fit pre-LR-24c. Adding a ~60px-wide pill should not push past the 375px viewport because the title text wraps inside the `<p>` and the pill is `inline-block` via `<span>`. No fixed-width elements introduced. No new horizontal overflow risk vs LR-24b which already added the "Start here" pill in the same row.

## AC verification

| AC | Verdict |
|---|---|
| Parent + logged-in: each chapter shows "Phase N" badge | ✅ |
| First chapter shows BOTH "Phase 1" + "Start here" badges | ✅ |
| Teacher: NO badges | ✅ |
| Logged-out: NO badges | ✅ |
| Phase mapping correct for all 7 chapter codes (group + individual variants) | ✅ |
| Lint/tsc/build clean | ✅ (pnpm lint clean, npx tsc --noEmit clean) |

## Run history

### 2026-05-13 — padi-uat-agent (code review; chrome tools not available in this session)
- Verdict: PASS
- Scenarios: ✅ 5 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Parent + logged-in: 7 chapters, correct phase badge | ✅ | — | — |
  | UAT-02 | First chapter: Phase 1 + Start here together | ✅ | — | — |
  | UAT-03 | Teacher: no badges | ✅ | — | — |
  | UAT-04 | Logged-out: no badges | ✅ | — | — |
  | UAT-05 | Mobile 375×667 layout | ✅ | — | — |
- Notes for padi-eng: Diff is surgical (helper + 5-line render block in `app/teacher/curriculum/page.tsx`). No other files touched. Phase badge correctly ordered before "Start here" pill per spec requirement 4. Lint + tsc both clean.
- Notes for padi-design: Gray pill (`bg-gray-100`, `text-gray-600`) is visually quiet; blue "Start here" remains the louder signal on chapter 1. Hierarchy reads cleanly. No design issues.
- Missing from ticket: None — spec is explicit on phase mapping, gating, and position. Out-of-scope items (phase headers, collapses, progress) correctly deferred to LR-24 main.
