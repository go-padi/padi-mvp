---
id: LR-18a-UAT
title: "UAT — LR-18a Gate lesson-detail page for logged-out users"
type: uat
status: pass-with-bugs
parent: LR-18a
feature: launch-readiness
buildloop_iteration: 3
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
created: 2026-05-12
updated: 2026-05-12
---

Verdict: PASS

(All gate-related AC met. Two follow-up bugs filed against the early-return ordering: KAN-143 P2 flash of "Lesson not found." for valid modules; KAN-144 P3 gate bypassed entirely for unknown module codes. Both are eclipsed by the same one-line fix and do not block the LR-18a ship: lesson IP is fully gated, no body content leaks, no hook errors, both desktop and mobile render the gate.)

## Test environment

- App: `http://localhost:3000` (dev server, Next.js 15.5.9)
- Backend: Supabase project `rcrjfweguedbtfngeovp.supabase.co`
- Browser: headless Chrome 148 driven via CDP (manual scripts in `/tmp/cdp-uat2.js`, `/tmp/cdp-script-leak.js`, `/tmp/cdp-timing.js`)
- Module under test: `phonological-awareness / learning-sensorially / learning-sensorially-1` ("The Silence Game" — has a full demo `lesson` body)
- Logged-in regression verified by **code review** of the git diff only — auto-mode declined creating a test user via service-role, and no shared dev credentials were available. The diff is purely additive (lines 405–429 added between existing line 404 and the unchanged main `return (` block), so all logged-in render paths are byte-identical to pre-LR-18a.

## Scenarios

### UAT-01 — Logged-out direct nav to a valid lesson URL (desktop)

Given a logged-out visitor at `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1` (cleared cookies + localStorage, fresh nav)
When the page hydrates
Then within 2 seconds the page renders the "Sign in to access this lesson" card with body copy "Anonymous visitors can browse curriculum chapters..." and a "Browse curriculum chapters →" link, plus a "← Back to curriculum" link above the card
And NO lesson body content (script steps, materials, aims, "The Silence Game" title, mark-complete CTA) is in the DOM at any point in a 4-second fast poll (50 ms cadence, 80 samples → 0 leaks detected)

Status: ✅ (with KAN-143 polish bug — see below)

- Probe: `hasGate=true, hasBrowse=true, hasAnonVisitors=true, hasBack=true, hasNotFound=false, hasLessonScript=false, hasSilenceGame=false, hasMarkComplete=false, bodyLen=562, htmlLen=28470`
- Time-to-gate: 796 ms from `Page.navigate`
- Evidence: `evidence/loggedout-desktop.png`
- Bug filed: `docs/features/launch-readiness/iterations/lr-18a-gate-logged-out-lesson-detail/bugs/kan-143-bug-flash-of-lesson-not-found-before-gate.md` (P2: a ~312 ms flash of "Lesson not found." between t+484 ms and t+796 ms, before the gate appears. AC's 2-second budget is still met; gate copy is correct.)

### UAT-02 — Logged-out direct nav at 375×667 (mobile)

Given the same precondition as UAT-01 with viewport emulated to 375×667 (`Emulation.setDeviceMetricsOverride mobile=true`)
Then the gate renders cleanly: card fits within the viewport, copy wraps without clipping, "Back to curriculum" link is above the card, "Browse curriculum chapters →" link is the only CTA inside the card.

Status: ✅

- Probe: same as UAT-01.
- Evidence: `evidence/loggedout-mobile.png`
- Note: the global TopNav crowds at 375 px (the `Padi` wordmark gets clipped by the Curriculum/Start Teaching/Sign In trio); this is a pre-existing nav layout issue, not introduced by LR-18a. Out of scope here.

### UAT-03 — Zero lesson-body leak across hydration window

Given the same precondition as UAT-01
When the page is polled every 50 ms for 4 seconds for any of: "The Silence Game", "Tell the students that they are going to play", "Set a timer for 2 minutes", "A quiet classroom", "Sharpen ... listening", "mark complete" / "mark as complete", an "Aims" header
Then NONE of those strings appear at ANY sample.

Status: ✅

- Probe: `leakDetected=false, leakStates=[]` across 80 samples.

### UAT-04 — Rules of Hooks (no "Rendered fewer hooks than expected")

Code review of `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:

- Hooks at lines: 86 (`useAuth`), 88-103 (16x `useState`), 104 (`useTeachingMode`), 105 (`useDefaultSubject`), 115 (`useMemo`), 125 (`useEffect`), 205 (`useEffect`).
- Last hook line: **205**.
- Three early-return blocks, all after every hook: 226 (`!isHydrated`), 230 (`!moduleRow`), 405 (`isHydrated && !isLoggedIn`).
- Gate at 405 > 205 → no hook can be skipped in any render path.

Runtime check: dev server log shows zero hook warnings across the UAT session; no `Rendered fewer hooks than expected` exception in CDP `Runtime.exceptionThrown` / `Log.entryAdded` streams across any scenario.

Status: ✅

### UAT-05 — Logged-in regression (code review only — see Test environment note)

Diff verified: the LR-18a change is a single additive `if (isHydrated && !isLoggedIn) { return (...) }` block inserted between the existing `};` of the `handleSaveAsComplete` function (line 403) and the unchanged main `return (` at line 431 (was 405). When `isLoggedIn === true`, control flows past line 405 into the original return — byte-identical render path. No other lines in the file are modified.

Status: ✅ (code review)

- Note: A live logged-in pass should be re-run on staging by a human with real credentials before LR-18a ships to production. The deferred-iteration loop owner has flagged this as a sign-off requirement.

### UAT-06 — Pre-hydration

Given `!isHydrated` (the few ms before `sb.auth.getSession()` resolves)
Then the existing `<Loading...>` element renders (line 227), the gate does not fire.

Status: ✅

- Probe at `[+89ms]`: `hasLoading=true, hasGate=false`. Gate only appears after hydration.

### UAT-07 — Auth-state transition (logged-out → signed in re-renders to full lesson)

Could not be exercised end-to-end without a test account (service-role user creation declined by auto-mode). Code path verified by inspection: `auth-store.tsx` `onAuthStateChange('SIGNED_IN', ...)` runs `setIsLoggedIn(true)` and `setIsHydrated(true)`. On next render, `isHydrated && !isLoggedIn` is false, gate is skipped, and the original lesson render path runs.

Status: ⏸️ BLOCKED — requires logged-in credentials. Recommend manual smoke on staging before ship.

### UAT-08 — Bookmark/search-result URL with unknown module slug (logged-out)

Given a logged-out visitor at `/teacher/curriculum/phonological-awareness/learning-sensorially/bogus-module-xyz`
Then... the page renders "Lesson not found." with the teaching-mode toggle nav, NOT the sign-in gate.

Status: 🐛 (does not strictly violate AC-1, which specifies a valid module URL, but the AC's parenthetical "bookmark, search result" precondition language implies stale URLs should also hit the gate.)

- Probe: `hasGate=false, hasNotFound=true, hasTeachingModeToggle=true` after 15 s settle.
- Evidence: `evidence/bogus-module-loggedout.png`
- Bug filed: `docs/features/launch-readiness/iterations/lr-18a-gate-logged-out-lesson-detail/bugs/kan-144-bug-gate-bypassed-for-unknown-module-codes.md` (P3)

### UAT-09 — Console / exception cleanliness

Across all UAT runs (S1 desktop, S2 mobile, bogus-module, curriculum-index smoke, fast-poll leak probe):

- Zero `Runtime.exceptionThrown` events.
- Zero `Log.entryAdded` at level `error` or `warning` related to the page (only `Failed to load resource: 404` for an attachment fetch that was already there pre-LR-18a; not caused by this change).
- Dev server log: all 200s, no compile errors, no React warnings.

Status: ✅

## Run history

### 2026-05-12 — padi-uat-agent (headless Chrome via CDP)

- Verdict: **PASS** (with KAN-143 P2 and KAN-144 P3 polish bugs filed)
- Scenarios: ✅ 7 / ❌ 0 / 🐛 1 / ⏸️ 1
- Results:

  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Logged-out direct nav (desktop, valid module) | ✅ | kan-143 (polish) | P2 |
  | UAT-02 | Logged-out at 375×667 mobile | ✅ | — | — |
  | UAT-03 | Zero lesson-body leak across hydration | ✅ | — | — |
  | UAT-04 | Rules of Hooks discipline | ✅ | — | — |
  | UAT-05 | Logged-in regression (code review) | ✅ | — | — |
  | UAT-06 | Pre-hydration shows Loading | ✅ | — | — |
  | UAT-07 | Auth-state transition logged-out → in | ⏸️ | — | — |
  | UAT-08 | Logged-out at unknown module slug | 🐛 | kan-144 | P3 |
  | UAT-09 | Console / exception cleanliness | ✅ | — | — |

- Notes for padi-eng:
  - Both KAN-143 and KAN-144 are fixed by a single edit: relocate the new `if (isHydrated && !isLoggedIn) { return ... }` block from line 405 to immediately after the `if (!isHydrated)` block (currently lines 226-228), and BEFORE the `if (!moduleRow)` block (line 230). The block stays after every hook (last hook is line 205), so Rules of Hooks remain satisfied. This single move resolves the perceived "Lesson not found" flash AND covers stale bookmark URLs.
  - File: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`.
  - Re-run `/tmp/cdp-timing.js` after the fix; expected output: only `gate=true` and `loading=true` states in the timeline, no `notFound=true` line.

- Notes for padi-design:
  - The gate copy and structure render exactly per spec on both desktop (1280×900) and mobile (375×667). No design changes requested.
  - If KAN-143 is fixed, the logged-out hydration path will go cleanly from "Loading..." (~89 ms) → gate (~800 ms) with no intermediate confusing state.

- Missing from ticket:
  - The refined ticket's "Bug fix — logged-out direct nav" AC says "within 2 seconds the page renders the 'Sign in to access this lesson' card AND NO lesson body content is in the DOM" — but doesn't speak to the **flash of `Lesson not found.`**. Strictly, that text is not "lesson body content", so the AC literally passes. The build agent did not catch the ordering issue because they only verified `405 > LAST_HOOK_LINE (205)`, not `405 < !moduleRow line (230)`. Recommend tightening LR-18a's AC for future similar tickets: "Logged-out gate must fire BEFORE any module-not-found early return."
  - No AC about the unknown-module edge case (KAN-144), though the precondition language "(direct URL, bookmark, search result)" implies it should also hit the gate.
  - UAT-07 (auth-state transition) and UAT-05 (logged-in render) need real credentials to test end-to-end. The loop should include a way to provision a throwaway test account so the UAT agent can verify these without code-review-only fallback.
