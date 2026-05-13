---
id: LR-21a-UAT
parent: LR-21a
title: "UAT — Parent first-lesson prompt above roster (LR-21a)"
type: uat
status: complete
feature: launch-readiness
buildloop_iteration: 7
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
created: 2026-05-12
updated: 2026-05-12
spec: .buildloop/iterations/007/feature-refined.md
implementation: app/teacher/page.tsx
verification_mode: code-review + dev-server HTML probe + validate.sh (no browser-control tools available in this harness)
---

Verdict: PASS

## Scope

LR-21a is a single-file additive UI change to `app/teacher/page.tsx`. When
`isHydrated && isLoggedIn && tenantId && isParent && startData.students.length === 1`,
a focused CTA card renders ABOVE the roster grid in the live (non-demo)
branch, reading "<name>'s first lesson is ready" with subcopy
"Browse the curriculum to pick where to start. Start with Phonological
Awareness — the foundation for reading." and a primary `Link` →
`/teacher/curriculum` labeled "Start <name>'s first lesson →".
For all other states (0 students, 2+ students, teacher role, logged-out,
pre-hydration) the card MUST NOT render.

## Verification mode

No Chrome/Puppeteer/Playwright MCP tools are exposed in this harness, so
verification combined:

- Line-by-line code review of the new block in `app/teacher/page.tsx` against
  the refined spec (`.buildloop/iterations/007/feature-refined.md`).
- Confirmation of the `isFirstChildParent` gate composition against the
  hydration semantics documented in `lib/auth-store.tsx` (`isHydrated`,
  `role`, `tenantId`) and the data shape from `lib/startTeaching/useStartTeachingData.ts`
  (`startData.students`).
- Live HTTP probe of the dev server on `http://localhost:3000/teacher`
  (PID 21515) in its initial logged-out / pre-hydration state — confirmed
  the rendered HTML takes the demo branch (no "first lesson is ready"
  string, no `bg-blue-50` CTA card emitted by SSR).
- Implementation-side review of the gate's placement: the card sits inside
  the live branch at lines 338-355, AFTER the page header (lines 292-329)
  and the tenant-missing banner (lines 325-329) and the parent-zero-students
  empty card (lines 331-336), and BEFORE the roster grid (lines 357-450) —
  matches "above the roster grid, below any existing wizard / empty-state."
- BuildLoop validate gates: `tsc`, `next build` (24/24 routes), `vitest`
  (18/18), and `eslint` all pass — see
  `.buildloop/iterations/007/validate-1.log`.

## Scenarios

### UAT-01 — Parent with exactly one child → card renders above roster
Status: PASS

- Given an authenticated parent where
  `isHydrated === true`, `isLoggedIn === true`, `tenantId !== null`,
  `role === 'parent'`, and `startData.students.length === 1` with
  `students[0].name === 'Maya'`.
- The `isFirstChildParent` derivation at lines 277-278 of
  `app/teacher/page.tsx` evaluates true: `isHydrated && isLoggedIn &&
  !!tenantId && isParent && startData.students.length === 1`. `isParent`
  is itself gated by `isHydrated && role === 'parent'` at line 56, so the
  hydration guard is redundant-but-correct.
- The JSX block at lines 338-355 renders:
  - Outer wrapper: `<div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">`.
  - Heading: `<p className="text-sm font-semibold text-blue-900">{startData.students[0].name}&rsquo;s first lesson is ready</p>` — produces `Maya's first lesson is ready` (curly apostrophe per `&rsquo;`).
  - Subcopy: `<p className="text-xs text-blue-700">Browse the curriculum to pick where to start. Start with Phonological Awareness — the foundation for reading.</p>`.
  - CTA: `<Link href="/teacher/curriculum" className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">Start {startData.students[0].name}&rsquo;s first lesson →</Link>` — produces `Start Maya's first lesson →`.
- The card sits between the `cards.length === 0` empty card (which is gated
  on `isParent && cards.length === 0` and so cannot coexist with this card
  in the `students.length === 1` state) and the roster grid (line 357).
  Visual order: header → tenant banner (if any) → first-lesson card → roster.
- The spec's subcopy includes the literal "Browse the curriculum to pick
  where to start." preamble in addition to the "Start with Phonological
  Awareness — the foundation for reading." sentence. The user-supplied
  task summary in this UAT prompt collapsed these into the shorter form.
  The implementation matches the refined spec (`.buildloop/iterations/007/feature-refined.md`
  lines 55-57), which is the contract of record. Recording this as an
  observation, not a finding — the implementation is on-spec.

### UAT-02 — Parent with zero children → existing wizard, NO card
Status: PASS

- Given `isHydrated && isLoggedIn && tenantId` and `role === 'parent'` and
  `startData.students.length === 0`.
- `showWizard` at lines 274-275 evaluates `isHydrated && tenantId &&
  startData.students.length === 0 && !wizardSkipped && !isParent`. The
  `!isParent` clause means parents do NOT see the wizard — they fall
  through to the live roster branch at line 290.
- In the live branch the `isFirstChildParent` gate is FALSE (because
  `students.length === 0 !== 1`), so the card does NOT render.
- Instead, the `isParent && cards.length === 0` block at lines 331-336
  renders an "Add your child to get started" empty card pointing at the
  Add Child button — confirmed the expected zero-students experience.
- Note: the prompt summary calls this "existing empty wizard"; the actual
  behavior for parents is the empty roster card, not the wizard. Either
  way, the LR-21a card does not render. PASS.

### UAT-03 — Parent with 2+ children → roster only, NO card
Status: PASS

- Given `startData.students.length >= 2`.
- `isFirstChildParent` requires `=== 1` exactly (strict equality, line
  278). With `length === 2` (or more) the gate is FALSE and the card does
  not render.
- The roster grid at lines 357-450 renders both/all student cards via
  `cards.map`. The roster is unchanged; no visual regression.
- This matches spec requirement 4 ("For NTH-child parents (students.length
  > 1): do NOT render the card. The roster itself serves as the
  navigation").

### UAT-04 — Teacher (any student count) → NO card
Status: PASS

- Given `isHydrated && isLoggedIn && tenantId && role === 'teacher'`.
- `isParent` at line 56 evaluates `isHydrated && role === 'parent'` →
  FALSE. The `isFirstChildParent` short-circuits on `isParent`, so the
  card does not render regardless of student count.
- This matches spec requirement 5 ("For teachers: do NOT render the card
  (the source ticket's req 4 punts the teacher case; defer)").
- Defensive: even if a teacher somehow had `students.length === 1`, the
  `isParent` clause guarantees the card stays hidden.

### UAT-05 — Logged-out → NO card
Status: PASS

- Given `isLoggedIn === false`.
- `dataMode` at line 51 is `'demo'`, so the page takes the demo branch at
  lines 136-270 and `return`s before reaching the live branch where the
  card lives. The card JSX is not in the demo branch — confirmed by
  inspection of lines 161-269.
- HTTP probe of `GET http://localhost:3000/teacher` in the logged-out
  state returned a 200 with no occurrence of "first lesson is ready",
  "Phonological Awareness", or `bg-blue-50` CTA markup in the rendered
  HTML. The demo "Preview mode — sign in to use your own data." banner
  is present instead, alongside the demo students grid (Sparky M., Pixel
  R., Comet T.). The LR-21a card does not leak into the logged-out
  surface.
- Pre-hydration is a strictly stricter subset: even if `isLoggedIn` flips
  true mid-render, `isHydrated === false` keeps `isParent === false`
  (line 56) which keeps `isFirstChildParent === false`. The card cannot
  flash before hydration completes.

### UAT-06 — Pre-hydration → NO card
Status: PASS

- Given `isHydrated === false`.
- `isParent` at line 56 is `isHydrated && role === 'parent'` → FALSE while
  hydrating.
- `isFirstChildParent` short-circuits → FALSE.
- During the brief pre-hydration window the page falls through to the
  teacher-view live branch (per the comment at lines 131-134) with the
  card hidden. No flash-of-wrong-state.

### UAT-07 — Tenant-missing parent with one child → NO card
Status: PASS (observation)

- Given `isHydrated && isLoggedIn && role === 'parent'` but
  `tenantId === null` (e.g. bootstrap-tenant failed).
- `isFirstChildParent` requires `!!tenantId`, which is FALSE → card hidden.
- Instead, the amber tenant-not-connected banner at lines 325-329 renders.
- This is correct: the CTA points at `/teacher/curriculum`, which itself
  depends on tenant-scoped data, so suppressing the card here avoids
  routing a parent into a broken downstream state.

### UAT-08 — Mobile 375×667 layout (Tailwind inspection)
Status: PASS (inspection)

- Outer `<main>` is `container py-8` (root layout) with horizontal
  padding from `container`. At 375px viewport this collapses to a fluid
  full-width minus standard container padding (~`px-4` worth = 32px),
  leaving ~343px of content width.
- Card wrapper is `rounded-2xl border border-blue-200 bg-blue-50 p-5
  space-y-3` (line 339). With `p-5` (20px) the inner content area is
  ~303px wide — comfortable for the heading, subcopy, and CTA.
- Heading `<p>` is `text-sm font-semibold text-blue-900` (no fixed width),
  wraps naturally. "Maya's first lesson is ready" is ~26 characters at
  ~14px — fits on a single line at 303px; longer names will wrap.
- Subcopy `<p>` is `text-xs text-blue-700`, also wraps naturally. The
  full string "Browse the curriculum to pick where to start. Start with
  Phonological Awareness — the foundation for reading." is ~115 chars
  and will wrap across ~4-5 lines at 12px — well within layout norms.
- CTA `Link` is `inline-flex items-center justify-center rounded-xl
  bg-gray-900 px-4 py-2 text-sm font-semibold text-white` — width
  intrinsic to text. At 14px font-size, "Start Maya's first lesson →"
  (~28 chars) is ~196px wide; with `px-4` (16px each side) the button is
  ~228px wide. Sits inside the 303px content area with margin to spare.
  For longer child names (e.g. "Christopher's first lesson →" ~30 chars
  ≈ 210px text + 32px padding = 242px) still fits.
- `space-y-3` between the text block and the CTA gives 12px vertical
  rhythm — no overlap. Above the card, the roster grid retains its
  responsive `md:grid-cols-2 lg:grid-cols-3` and collapses to a single
  column at 375px (md breakpoint is 768px), so the card never competes
  for horizontal space with a multi-column roster.
- No horizontal scroll introduced. Card is additive and contained.
- A literal 375×667 screenshot would require a browser-control tool,
  which is not exposed in this harness. The inspection above is
  sufficient given the absence of fixed widths, the modest character
  counts, and the parent container's fluid behavior.

### UAT-09 — Routing target
Status: PASS

- `<Link href="/teacher/curriculum">` at line 349 routes to the existing
  `/teacher/curriculum` page (confirmed present in the build log's route
  manifest: `○ /teacher/curriculum  3.31 kB  157 kB`). No new routing
  logic, no `?student=<id>` param — matches spec requirement 1 and the
  "Out of Scope" carve-out for deferred lesson-id computation.
- No regression: `/teacher/curriculum` is also the existing destination
  of the page's other "Need the full curriculum?" footer CTA (line 457),
  so this CTA is consistent with existing navigation.

### UAT-10 — Rules of Hooks
Status: PASS

- `isFirstChildParent` is a derived boolean, not a hook. No new
  `useState`/`useEffect`/`useMemo` was added for this feature. The
  existing hooks at lines 47-52 (`useTeachingMode`, `useAuth`, three
  `useState`, `useStartTeachingData`) are unchanged. The `useEffect` at
  lines 59-64 and `useMemo` at lines 66-129 are unchanged. Hook order is
  stable across all gate branches.

### UAT-11 — Validate gates green
Status: PASS

- `.buildloop/iterations/007/validate-1.log` confirms tsc ✓,
  `next build` ✓ (24/24 routes), vitest 18/18, eslint ✓, exit 0.
- No console errors from the new JSX (it is pure conditional render with
  no side effects).

## Findings / observations (non-blocking)

- The implementation matches the refined spec verbatim, including the
  use of `&rsquo;` HTML entity for the curly apostrophe in both the
  heading and the CTA label, and the right-arrow `→` character at the
  end of the CTA.
- The placement comment at lines 131-134 documents the rationale for the
  current ordering (header → tenant banner → empty-state card →
  first-lesson card → roster), so future maintainers won't accidentally
  move this above the tenant-missing banner where it would link to a
  broken downstream surface.
- The strict `=== 1` check (rather than `>= 1`) is intentional and
  spec-aligned: a parent who has added a second child is past the
  "first lesson" framing and the roster itself becomes the navigation.
  This is good restraint and avoids prescribing a "next" beyond the
  first child.
- The `cards.length === 0` empty card (lines 331-336) is exclusive with
  `isFirstChildParent` (which requires `students.length === 1`). No
  scenario exists where both render simultaneously.
- The CTA reuses the page's existing `gray-900` primary-button treatment
  rather than the `blue-600` primary used in the bottom-of-page
  "Go to Teacher Dashboard" CTA — this is internally consistent with the
  page header's Add Student button styling.
- The user-supplied UAT scenario summary collapses the subcopy to just
  "Start with Phonological Awareness — the foundation for reading."
  while the refined spec (and implementation) prepends "Browse the
  curriculum to pick where to start." Recorded as an observation; the
  refined spec is the contract of record and the implementation is
  on-spec.

## Run history

### 2026-05-12 — padi-uat-agent (BuildLoop iter 7, loop 2026-05-13T00:50:20Z-cc45)
- Verdict: PASS
- Scenarios: PASS 11 / FAIL 0 / BUG 0 / BLOCKED 0
- Verification mode: code review + dev-server HTML probe + validate.sh (no browser tools in harness)
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Parent + 1 child → card renders above roster | PASS | — | — |
  | UAT-02 | Parent + 0 children → empty card, no LR-21a card | PASS | — | — |
  | UAT-03 | Parent + 2+ children → roster only, no card | PASS | — | — |
  | UAT-04 | Teacher (any count) → no card | PASS | — | — |
  | UAT-05 | Logged-out → no card | PASS | — | — |
  | UAT-06 | Pre-hydration → no card | PASS | — | — |
  | UAT-07 | Tenant-missing parent + 1 child → no card | PASS | — | — |
  | UAT-08 | Mobile 375×667 layout (inspection) | PASS | — | — |
  | UAT-09 | CTA routes to `/teacher/curriculum` | PASS | — | — |
  | UAT-10 | Rules of Hooks preserved | PASS | — | — |
  | UAT-11 | tsc / build / tests / lint green | PASS | — | — |
- Notes for padi-eng: implementation is on-spec at `app/teacher/page.tsx` lines 277-278 (gate) and 338-355 (JSX). The gate composition `isHydrated && isLoggedIn && !!tenantId && isParent && students.length === 1` is correct and defensive — `isParent` already requires hydration, but the redundancy is harmless and reads clearly. No new hooks, no new imports, no schema/auth/routing changes. Card placement respects the existing header/banner/empty-state stack so it never competes with the tenant-not-connected banner for attention. No regressions in the demo branch, teacher branch, or the existing parent-empty-state path.
- Notes for padi-design: the card uses the `blue-50 / blue-200 / blue-900 / blue-700` informational palette consistent with other onboarding/info treatments in the app (LR-19a banner, demo preview banner). CTA uses the page's primary `gray-900` treatment matching the Add Student / Add Child header buttons. Card sits flush above the roster with `space-y-8` from the page wrapper providing breathing room. If a future iteration introduces a curriculum-section illustration or a true "Start LS-1" deep-link CTA (per full LR-21 scope), this card is the natural surface to extend.
- Missing from ticket: nothing blocking. AC-mobile (375×667) cannot be screenshot-verified in this harness; verdict is based on Tailwind class inspection of `p-5`, `space-y-3`, intrinsic-width CTA, and the fluid `container` parent — recommend a manual 375×667 spot-check during human review. Out-of-scope LR-21-main items (compute the actual first-module-id, route with `?student=<id>`, teacher-track equivalent, instructional-designer signoff on "Phonological Awareness" as the recommended start) remain deferred per the refined spec's "Out of Scope" carve-out — these are NOT gaps in LR-21a, they are the scope-split with the parent ticket.
