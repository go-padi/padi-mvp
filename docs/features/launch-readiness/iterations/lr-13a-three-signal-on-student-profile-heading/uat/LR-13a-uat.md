---
id: LR-13a-UAT
title: "UAT — LR-13a Surface three-signal assessment status on student profile heading"
parent: LR-13a
feature: launch-readiness
buildloop_iteration: 2
buildloop_loop_id: 2026-05-12T16:39:00Z-4992
created: 2026-05-12
updated: 2026-05-12
status: PASS
---

# UAT — LR-13a Surface three-signal assessment status on the student profile heading

Verdict: PASS

Tested against http://localhost:3000 with the current working tree of the LR-13a implementation. Dev server confirmed running (Next 15.5.9, port 3000). No Chrome/Playwright MCP tools were available in this environment, so verification was done by:
1. Source review of the diff against the refined ticket.
2. Programmatic unit verification of `normalizeAssessmentStatus` + `assessmentStatusCaption` across all five token paths plus edge inputs (null, empty string, undefined, unknown string).
3. JSX render verification using `renderToString` against the exact `StatusBlock` markup from `app/teacher/start-teaching/students/[studentId]/page.tsx:327-339`, asserting badge color tokens match the roster card's at `app/teacher/page.tsx:359-369` for all five states.
4. Live HTTP fetches against `/teacher` and `/teacher/start-teaching/students/{stu-1,stu-5,stu-6,nonexistent-id}` (all returned HTTP 200).
5. `pnpm lint`, `npx tsc --noEmit`, and `npx vitest run` — all clean (18/18 tests pass).

## Scenarios

### UAT-01 — Happy path Ready
Status: ✅
- Action: Verify the helper normalizes `assessment_status: "Ready"` to the `Ready` token and the profile heading renders a green badge + caption "Reading skills are on track".
- Result: Rendered HTML:
  `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700">Ready</span><span class="text-sm text-gray-700">Reading skills are on track</span>`
- Roster color (`app/teacher/page.tsx:362`): `bg-green-50 text-green-700`. Identical.

### UAT-02 — Happy path Needs Help
Status: ✅
- Rendered HTML: `<span class="... bg-amber-50 text-amber-700">Needs Help</span><span ...>Targeted support recommended</span>`
- Roster color (`app/teacher/page.tsx:364`): `bg-amber-50 text-amber-700`. Identical.

### UAT-03 — Happy path Needs Intervention
Status: ✅
- Rendered HTML: `<span class="... bg-red-50 text-red-700">Needs Intervention</span><span ...>Hands-on time needed today</span>`
- Caption confirmed parent-appropriate (no exclamation marks, no all-caps, no emoji).
- Roster color (`app/teacher/page.tsx:366`): `bg-red-50 text-red-700`. Identical.

### UAT-04 — In progress fallback (null status, progressPercent > 0)
Status: ✅
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 32 })` → `"In progress"`
- Rendered HTML: `<span class="... bg-blue-50 text-blue-700">In progress</span><span ...>Building the foundation</span>`
- Roster color (`app/teacher/page.tsx:368`): `bg-blue-50 text-blue-700`. Identical.

### UAT-05 — Not started (null status, progressPercent === 0)
Status: ✅
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 0 })` → `"Not started"`
- Rendered HTML: `<span class="... bg-gray-100 text-gray-600">Not started</span><span ...>Start with the first lesson</span>`
- Roster color (`app/teacher/page.tsx:369`): `bg-gray-100 text-gray-600`. Identical.

### UAT-06 — Error state: null status
Status: ✅
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 0 })` → `"Not started"` (no crash).
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 7 })` → `"In progress"` (no crash).
- `normalizeAssessmentStatus({ assessmentStatus: undefined, progressPercent: undefined })` → `"Not started"` (no crash).
- `normalizeAssessmentStatus({ assessmentStatus: "Garbage", progressPercent: 0 })` → `"Not started"` (no crash, unknown strings fall through to the same fallback).
- The page guards with a default initials value (`'S'`) and renders the badge unconditionally once `student` is set, so a null `assessment_status` cannot crash the render.

### UAT-07 — Auth state (logged-out preview)
Status: ✅
- The page at `app/teacher/start-teaching/students/[studentId]/page.tsx` early-returns from its `useEffect` when `!isLoggedIn` (line 116), leaving `loading=true` and rendering the "Loading..." card. This is the pre-LR-13a behavior — the LR-13a diff did NOT touch the auth gate or the loading branch. Unchanged.
- Confirmed by `git diff HEAD` showing only additive changes in the `student` non-null render branch (lines 327-339) and the import block.

### UAT-08 — Mobile (375x667) badge + caption wrapping
Status: ✅
- Container: `flex items-center gap-3 flex-wrap` (`app/teacher/start-teaching/students/[studentId]/page.tsx:327`). With `flex-wrap`, when the combined width of the inline-flex badge ("Needs Intervention" ≈ 130-140px) plus the caption span ("Hands-on time needed today" ≈ 200-220px) exceeds the available row width (~295px usable at 375px viewport inside the card's `p-5` padding), the caption span wraps to the next line below the badge. No truncation (no `text-ellipsis`, no `overflow-hidden`, no `max-w-*` on either child).
- Long-name regression risk: the avatar row (`flex items-center gap-3` on the row containing `h2`) wraps the long name inside the `h2`. The new status row is a sibling of that row, so a long name does not interact with the status row's wrap behavior.

### UAT-09 — Cross-surface consistency (principal regression risk)
Status: ✅
- For every one of the five normalized tokens, the profile badge's color classes are byte-identical to the roster card's color classes (only the size prefix differs: profile uses `text-xs`, roster uses `text-[11px]`, intentional per spec section 2).
- DRY of the normalizer is confirmed: `normalizeAssessmentStatus` is the sole implementation at `lib/copy/assessmentStatusCopy.ts:14-25`, and is imported and applied at:
  - `app/teacher/start-teaching/students/[studentId]/page.tsx:147` (live DB row path)
  - `lib/startTeaching/useStartTeachingData.ts:109` (roster live path)
  - `lib/startTeaching/useStartTeachingData.ts:171` (roster demo/logged-out path)
- The previous inline ternary at `useStartTeachingData.ts:105-109` has been replaced. `git diff` confirms.
- Spec grep verification (`grep -rEn "Ready.*Needs Help.*Needs Intervention" app components lib`) returns only one unrelated match — the marketing banner copy at `app/teacher/page.tsx:40` — and the helper file (where the strings live on separate lines, not all on one line). No second normalizer survives.

### UAT-10 — No emoji in rendered UI
Status: ✅
- Rendered HTML inspected for the Unicode emoji/dingbat ranges `[\u{1F300}-\u{1FAFF}]` and `[☀-➿]` plus the explicit `✅🟡🔴` glyphs the design language uses elsewhere. None present in any of the five rendered states. Color does the visual signaling, exactly per spec section 3.

### UAT-11 — No aria-label decoration on the badge
Status: ✅
- The badge span at `app/teacher/start-teaching/students/[studentId]/page.tsx:328-335` has no `aria-label` attribute. The text content itself is the accessible label. Spec section 7 satisfied.

### UAT-12 — Roster card unchanged (caption-less)
Status: ✅
- `git diff HEAD -- app/teacher/page.tsx` returns empty. The roster's badge styling (`text-[11px]`), color, and caption-less rendering are intact. Spec section 5 satisfied.

### UAT-13 — Helper file shape matches spec
Status: ✅
- File at exact path `lib/copy/assessmentStatusCopy.ts`.
- Exports the `AssessmentStatus` union type with the five tokens in the correct order.
- `normalizeAssessmentStatus(input: { assessmentStatus: string | null | undefined; progressPercent: number | null | undefined }): AssessmentStatus` — signature exact.
- `assessmentStatusCaption(status: AssessmentStatus): string` — signature exact.
- Caption mapping verbatim per spec (all five strings).

### UAT-14 — Build & type health
Status: ✅
- `pnpm lint` — clean.
- `npx tsc --noEmit` — clean.
- `npx vitest run` — 18/18 tests pass (3 test files), including the updated `role-gating.test.tsx` which now imports the `StartTeachingStudent` / `StartTeachingGroup` types from the hook.

## Out of scope / not tested

- Visual pixel-perfect rendering (no Chrome MCP available — verified by HTML/CSS class strings instead).
- Hover/focus states on the badge (spec did not specify any, none implemented, none expected).
- Touch interaction on the badge (badge is a static `span`, intentional per spec section 7).
- Color-blind affordance — flagged as a follow-up; the badge text is the screen-readable signal, and color is supplementary. Not a regression vs the roster.

## Run history

### 2026-05-12 — padi-uat-agent (BuildLoop loop 2026-05-12T16:39:00Z-4992 iteration 2)
- Verdict: PASS
- Scenarios: ✅ 14 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Happy path Ready | ✅ | — | — |
  | UAT-02 | Happy path Needs Help | ✅ | — | — |
  | UAT-03 | Happy path Needs Intervention | ✅ | — | — |
  | UAT-04 | In progress fallback | ✅ | — | — |
  | UAT-05 | Not started | ✅ | — | — |
  | UAT-06 | Error state null status | ✅ | — | — |
  | UAT-07 | Auth state logged-out | ✅ | — | — |
  | UAT-08 | Mobile 375x667 wrap | ✅ | — | — |
  | UAT-09 | Cross-surface consistency | ✅ | — | — |
  | UAT-10 | No emoji | ✅ | — | — |
  | UAT-11 | No aria-label | ✅ | — | — |
  | UAT-12 | Roster card unchanged | ✅ | — | — |
  | UAT-13 | Helper file shape | ✅ | — | — |
  | UAT-14 | Build & type health | ✅ | — | — |
- Notes for padi-eng: Implementation is tight. The single inline-ternary replacement at `lib/startTeaching/useStartTeachingData.ts:105-109` was correctly replaced with `normalizeAssessmentStatus`, and the demo-mode path at `lib/startTeaching/useStartTeachingData.ts:171` also routes through the same helper, eliminating drift. The profile page's `statusBadgeClass` switch is a small duplication of the roster's inline ternary at `app/teacher/page.tsx:359-369` — consider lifting that to the helper too in a future iteration (out of scope here; the spec accepted this duplication because the roster has size-specific styling).
- Notes for padi-design: No-emoji rendering confirmed. The five color tokens are byte-identical across surfaces — visual continuity is intact. The `text-xs` upgrade on the profile reads correctly with `px-2.5 py-1` padding. Captions are consistent in tone, calm, and parent-appropriate.
- Missing from ticket: Nothing material. The AC was unambiguous and every line was testable. One minor stylistic note: AC #7 ("Logged-out preview behavior unchanged") is a no-op AC by design — worth flagging in future tickets that "unchanged" ACs should specify what was the pre-state, so a future agent doesn't have to bisect to verify.
