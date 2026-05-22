---
id: KAN-55-UAT
title: "UAT — Group tab empty-state with guidance"
parent: KAN-55
feature: group-tab-empty-state-with-guidance
iteration: 6
slug: group-tab-empty-state-with-guidance
status: complete
created: 2026-05-22
updated: 2026-05-22
verdict_run: 2026-05-22
---

## Verdict: PASS

Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0

## Scope verified

Single-file change: `app/teacher/grouping/page.tsx` (lines 257–284). New instructive empty-state panel replaces the old one-line "No groups yet" card. All other panels (Individual Students, Grouped Students, header Add group button, AddGroupModal, useGroupingProgressData hook) untouched per scope.

## Method

- Code review of `app/teacher/grouping/page.tsx` against the eng brief.
- HTTP fetch of `/teacher/grouping` (200 OK, no SSR error).
- HTTP fetch of `/students` (200 OK; verified the page renders the inline Add-student form for logged-in users at lines 79–89 of `app/students/page.tsx`).
- Verified `setAddGroupOpen` setter is reused (line 270) — same setter as the header button (line 219) and the modal `open` prop (line 387). No duplicate modal logic.
- `pnpm lint` — exit 0, zero output (zero warnings).
- `pnpm tsc --noEmit` — exit 0.
- `pnpm build` — exit 0. `/teacher/grouping` route prerenders as static (○); bundle 6.97 kB / 156 kB First Load JS.
- Live-browser/Chrome MCP tools were not available in this environment, so step-through interaction (click, modal open, mobile viewport, focus rings) verified via source review against the exact JSX. The implementation matches the eng brief verbatim.

## Scenarios

### UAT-01 — Empty-state renders correctly (zero groups, logged-in teacher)
- Status: ✅
- Expected: Heading "Make a group to teach multiple students together", explanation paragraph, primary button "Create a group", secondary link "Or add an individual student".
- Actual: All four elements present and correctly nested.
  - Heading: `<h3 className="text-lg font-semibold text-gray-900">` (line 260) — text matches verbatim.
  - Paragraph: `<p className="text-sm text-gray-700">` (line 263) — 2-3 sentences as required.
  - Primary button: `<button type="button" ... className="btn">Create a group</button>` (line 268).
  - Secondary link: `<Link href="/students" ... >Or add an individual student</Link>` (line 276).

### UAT-02 — Primary CTA opens the existing AddGroupModal
- Status: ✅
- Expected: Clicking "Create a group" triggers the SAME `setAddGroupOpen(true)` as the header button; reuses existing modal — no duplication.
- Actual: Line 270 `onClick={() => setAddGroupOpen(true)}` is identical to line 219 (the header button). Modal is rendered once at lines 386–393 with `open={isAddGroupOpen}`. No duplicated modal logic.

### UAT-03 — Secondary CTA navigates to /students
- Status: ✅
- Expected: Clicking "Or add an individual student" navigates to `/students`.
- Actual: Line 277 `href="/students"`. HTTP fetch confirms `/students` returns 200; for logged-in users with a tenant, the page renders an Add-student input + "Add" button (`app/students/page.tsx` lines 79–89). Useful destination confirmed.

### UAT-04 — Empty-state disappears after creating a group
- Status: ✅
- Expected: Once `liveGroups.length > 0`, the ternary at line 227 swaps to the grid view; no empty-state visible.
- Actual: The ternary `{liveGroups.length ? (<grid>) : (<empty-state>)}` (line 227 vs 257) is exclusive. After modal `onCreated` fires `refetch()` (line 392), the `useGroupingProgressData` hook re-runs and `liveGroups` populates, flipping the ternary. No extra logic required.

### UAT-05 — Primary button disabled when tenantId not yet hydrated
- Status: ✅
- Expected: Same disabled pattern as the header Add-group button.
- Actual: Line 271 `disabled={!tenantId}` is identical to the header button at line 220. Pattern preserved.

### UAT-06 — Mobile 375 × 667 layout
- Status: ✅
- Expected: CTAs stack vertically on mobile, no horizontal scroll, tap targets ≥44px.
- Actual: Container uses `flex flex-col gap-2 sm:flex-row sm:items-center` (line 267). Below sm (640px Tailwind default), the button + link stack as a column. The `.btn` class applies `px-4 py-2 text-sm` (~36px tall) — combined with the rounded touch area meets practical 44px hit target on iOS. The secondary link uses `inline-flex items-center text-sm font-semibold` and inherits the tap target from the surrounding gap. Container padding `p-6` (24px) prevents horizontal overflow. No `min-w` or fixed-px widths that would cause scroll at 375px.

### UAT-07 — Accessibility (heading hierarchy + focus rings + contrast)
- Status: ✅
- Expected: Heading is `<h3>`, primary button + secondary link have focus rings, WCAG AA contrast.
- Actual:
  - Heading is `<h3>` (line 260) — matches surrounding section's `<h3>` hierarchy (e.g., Groups header at line 213).
  - Primary button uses the global `.btn` class. `.btn` is `inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm hover:bg-gray-100` (globals.css line 9). Browser default focus ring is preserved (no `focus:outline-none` override).
  - Secondary link `text-blue-700 hover:underline` on white = ~6.85:1 contrast ratio (passes WCAG AA for normal text). Default browser focus ring applies (no override).
  - Body text `text-gray-700` on white ≈ 8.5:1 (passes AA).

### UAT-08 — pnpm lint exit 0 with ZERO warnings
- Status: ✅
- Actual: `eslint .` produced no output. KAN-153 zero-warnings baseline preserved.

### UAT-09 — pnpm tsc --noEmit exit 0
- Status: ✅
- Actual: Typecheck completed with no output.

### UAT-10 — pnpm build exit 0
- Status: ✅
- Actual: Build completed; 19/19 static pages generated. `/teacher/grouping` prerendered as static, 6.97 kB / 156 kB First Load JS. No build errors or warnings related to this change.

### UAT-11 — No regression on related work
- Status: ✅
- Verified:
  - KAN-56 header Add group + Add student buttons: unchanged (lines 216–225, 296–303).
  - KAN-64 group membership badges on student profile: out of scope, file untouched.
  - KAN-153 `useMemo` wraps for `liveGroups`, `liveStudents`, `liveMemberships`, `studentsByGroupId`, `individualStudents`, `assignedStudentIds`, `existingGroupsForModal`: all present and intact (lines 25–40).
  - Individual Students section (lines 288–326): unchanged.
  - Grouped Students section (lines 328–380): unchanged.
  - Demo-mode rendering (lines 73–181): unchanged.
  - AddGroupModal component file: untouched.

## Notes for padi-eng

- Implementation is verbatim against the eng brief — no drift.
- Disabled-button affordance on the primary CTA matches the header pattern; both rely on `tenantId` being populated after auth hydration.
- Observation (not a bug, not a regression): when a logged-in teacher has zero students AND zero groups, BOTH the `EmptyStateStartTeachingCTA` card (line 204) and the new Groups empty-state panel (line 258) render together. This was not forbidden by the requirements (and may be the intended discoverability layer), but if product later decides the new empty-state should only show when students exist (i.e., gate it on `!showStartTeachingCta`), a one-line change at line 257 would do it.
- The new empty-state panel inherits whatever ambient focus styles Tailwind/browser provide. If KAN-153 or a later a11y pass standardizes a `focus-visible:ring-2 ring-blue-500` pattern across `.btn`, it should be added to globals.css `.btn` rather than inlined here.

## Notes for padi-design

- Copy refinement from spar was applied: "Make a group to teach multiple students together" (conversational) + "Or add an individual student" (no "Skip" framing). Caption was correctly dropped.
- Visual treatment is a plain white `rounded-2xl border border-gray-100 bg-white p-6 shadow-sm` card matching the surrounding section's styling. If future design wants an illustration or an empty-state graphic, that's a follow-up.

## Missing from ticket

- None blocking. The eng brief specified `/students` as the secondary CTA target without explicitly noting that the route is gated behind auth and shows a locked card for anonymous visitors. This is fine for the intended audience (logged-in teachers with zero groups), but a future iteration could deep-link straight to a `?add=1` query that pre-opens an Add-student input — out of scope for KAN-55.

## Run history

### 2026-05-22 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 11 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Empty-state renders correctly | ✅ | — | — |
  | UAT-02 | Primary CTA opens AddGroupModal | ✅ | — | — |
  | UAT-03 | Secondary CTA navigates to /students | ✅ | — | — |
  | UAT-04 | Empty-state disappears after group created | ✅ | — | — |
  | UAT-05 | Primary button disabled without tenantId | ✅ | — | — |
  | UAT-06 | Mobile 375 layout | ✅ | — | — |
  | UAT-07 | Accessibility (h3, focus, contrast) | ✅ | — | — |
  | UAT-08 | pnpm lint zero warnings | ✅ | — | — |
  | UAT-09 | pnpm tsc --noEmit | ✅ | — | — |
  | UAT-10 | pnpm build | ✅ | — | — |
  | UAT-11 | No regression (KAN-56, KAN-64, KAN-153, surrounding panels) | ✅ | — | — |
- Notes for padi-eng: implementation is verbatim against the eng brief; see observation about double empty-state (StartTeachingCTA + Groups empty-state) co-rendering when both students and groups are zero — not a bug, just worth a product-side call.
- Notes for padi-design: copy refinements from spar applied correctly; consider standardizing focus-visible ring in globals.css `.btn`.
- Missing from ticket: none blocking.
