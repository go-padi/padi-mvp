---
id: LR-22-UAT
parent: LR-22
title: "UAT — Add Sign-in CTA to logged-out gate cards"
feature: launch-readiness
buildloop_iteration: 8
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
created: 2026-05-12
updated: 2026-05-12
---

## Scope

Verify that both logged-out gate cards shipped earlier in this loop (LR-17 student-profile gate, LR-18a lesson-detail gate) now expose a direct primary "Sign in" CTA that fires the existing `padi-open-signin` window event, while preserving the existing "Browse curriculum" secondary link, back-link, heading, and explanatory copy. Verify no regression to logged-in views and that the button row wraps cleanly on mobile (375×667).

## Preconditions

- App running on `http://localhost:3000` (dev server confirmed up via HTTP 200).
- `TopNav` mounted in root layout (`app/layout.tsx:26`) so its `padi-open-signin` window-event listener is registered on every route.
- Two gate files under review:
  - `app/teacher/start-teaching/students/[studentId]/page.tsx` (LR-17 gate)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` (LR-18a gate)

## Scenarios

### UAT-01 — Logged-out student profile gate exposes Sign-in button

**Given** a logged-out visitor navigates to `/teacher/start-teaching/students/<any-id>`
**When** the gate card renders
**Then** the card shows: back-link "← Back to Start Teaching", heading "Sign in to view this student", the preserved explanatory paragraph, and a button row containing a primary "Sign in" button followed by the "Browse curriculum and modules →" link. Clicking "Sign in" dispatches the `padi-open-signin` window event, which TopNav's listener (`components/TopNav.tsx:27-29`) translates to opening `SignInModal`.

Status: PASS

- Verified at `app/teacher/start-teaching/students/[studentId]/page.tsx:284-317`. Gate gated by `if (!isLoggedIn)`. Button: `type="button"`, `onClick={() => window.dispatchEvent(new Event('padi-open-signin'))}`, className `inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800` (matches spec verbatim). Browse link preserved at lines 307-312 with href `/teacher/curriculum`. Back-link preserved at lines 287-292. Heading, paragraph copy unchanged.

### UAT-02 — Logged-out lesson-detail gate exposes Sign-in button

**Given** a logged-out visitor navigates to a lesson URL `/teacher/curriculum/<ch>/<group>/<module>`
**When** the gate card renders
**Then** the card shows: back-link "← Back to curriculum", heading "Sign in to access this lesson", preserved paragraph, and a button row containing the same primary "Sign in" button followed by "Browse curriculum chapters →" link. Click on "Sign in" fires `padi-open-signin` → SignInModal opens.

Status: PASS

- Verified at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:230-263`. Gate gated by `if (!isLoggedIn)`. Button is byte-identical to the LR-17 gate's button (same className, same handler) — cross-surface consistency confirmed per spec Requirement 5. Browse link preserved at lines 253-258. Heading, paragraph, back-link all preserved.

### UAT-03 — Logged-in regression: gate does not render

**Given** a logged-in visitor on either route
**When** the page renders
**Then** the gate JSX is not rendered; the normal logged-in view is shown. No new effects, no console errors, no behavior change vs. pre-LR-22 state for logged-in users.

Status: PASS

- Both gates are inside `if (!isLoggedIn) { return (...) }` blocks placed BEFORE the loading/data-bearing returns. When `isLoggedIn` is true, execution falls through to the existing logged-in render path (student profile at line 345 onward; lesson page at line 265 onward). The added JSX is dead code for logged-in users — zero runtime effect.
- Verified no other code touched: only the gate JSX was modified in each file (button row added below the existing paragraph). No new imports required (`Link` and `useAuth` were already imported). No new state, effects, or props.

### UAT-04 — Mobile 375×667 layout: button row wraps cleanly

**Given** the gate card rendered at a viewport of 375×667
**When** the visitor views the page
**Then** the "Sign in" button and "Browse curriculum…" link fit horizontally inside the gate `card` (which is `bg-white rounded-2xl shadow p-4`), and if the link's longer label would overflow on a narrow viewport, the row wraps to a second line cleanly (no horizontal scroll, no clipped text).

Status: PASS

- Both rows use `flex flex-wrap gap-3` — `flex-wrap` is the explicit wrap directive. With `gap-3` (12px) between items, the inline-flex button (compact: `px-4 py-2`, no fixed min-width) and the inline-flex link will share a row at typical widths and wrap to two lines if the link label needs more horizontal space than remains.
- The button uses `inline-flex items-center justify-center` — no `whitespace-nowrap`, but the label "Sign in" is short enough that it will never wrap mid-word inside its own padding.
- The link uses `self-center` to vertically center against the taller button on the same row. When wrapped, each row is independently centered by flex layout.
- No fixed widths anywhere on the row. The parent `card` class has no max-width override; it inherits container width from `app/layout.tsx`. No overflow risk identified.

## Run history

### 2026-05-12 — padi-uat-agent (BuildLoop iter 8, loop 2026-05-13T00:50:20Z-cc45)

- Verdict: PASS
- Scenarios: PASS 4 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:

  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Logged-out student profile gate exposes Sign-in button | PASS | — | — |
  | UAT-02 | Logged-out lesson-detail gate exposes Sign-in button | PASS | — | — |
  | UAT-03 | Logged-in regression: gate does not render | PASS | — | — |
  | UAT-04 | Mobile 375×667 layout: button row wraps cleanly | PASS | — | — |

- Notes for padi-eng:
  - Implementation matches the refined spec exactly. Same button JSX in both files (cross-surface consistency intact). Both gates already had `'use client'`; the SSR concern called out in the spec's eng_scope notes is moot because `onClick` is browser-only.
  - `padi-open-signin` event name matches `components/TopNav.tsx:28` listener verbatim. The pattern is already used by `app/teacher/page.tsx:157` and `app/start-teaching/groups/[groupId]/page.tsx:18`, so this iteration adds two more dispatch sites with no new event name — exactly per Requirement 4.
  - `pnpm tsc --noEmit` and `pnpm lint` both clean.
- Notes for padi-design:
  - Sign-in button is gray-900 / white, rounded-xl, `text-sm font-semibold` — matches the homepage "Sign in" button styling family. Visually anchors as the primary CTA above the secondary blue-700 underline link.
  - Mobile wrap behavior relies on the link wrapping to a new flex line; at very narrow widths the link sits below the button. No design state was provided for the wrapped layout, but the result is acceptable and consistent with other gate cards on the app.
- Missing from ticket:
  - No telemetry/analytics on the new Sign-in CTA — explicitly Out of Scope, so not a gap. Flag for a future pass once we add an event-tracking layer.
  - No visual-regression evidence captured (no Chrome DevTools MCP available in this session); verification was done by exhaustive code review of both gate files plus the TopNav handler. If a future UAT cycle wants screenshots, request that the parent harness mount a headless-browser MCP.

## Verdict

PASS

Verdict: PASS
