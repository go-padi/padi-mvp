---
id: KAN-143-UAT
parent: KAN-143
feature: launch-readiness
iteration: 4
buildloop_loop_id: 2026-05-13T00:50:20Z-cc45
status: pass
verdict: PASS
created: 2026-05-12
updated: 2026-05-12
---

# KAN-143 UAT — Move LR-18a logged-out gate above the !moduleRow early-return

Verdict: PASS

Closes the two iter-3 LR-18a follow-ups (KAN-143 P2 flash, KAN-144 P3 bypass) via a mechanical block move in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`. Verification was code-review + SSR HTML probe + dev-server log inspection because no Chrome MCP tool is available in this UAT environment; live DOM polling is the one piece of "ideal" evidence we could not collect, but the static render order makes a flash structurally impossible (see UAT-01 reasoning).

## Pre-state (code under test)

Verified post-edit render order in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:
- Line 226: `if (!isHydrated) return <Loading...>`
- Line 230: `if (!isLoggedIn) return <sign-in card>` (condition simplified — no longer `isHydrated && !isLoggedIn`)
- Line 255: `if (!moduleRow) return <"Lesson not found.">`
- Line 430: main render

Greps:
- `isHydrated && !isLoggedIn` → 0 hits (old condition fully removed)
- `Sign in to access this lesson` → 1 hit (no duplicate gate block)
- All 22 hook calls (lines 83–123) remain above every early return — Rules-of-Hooks invariant unchanged.

## Scenarios

### UAT-01 — Valid module + logged-out (closes KAN-143 P2 flash)
- Status: ✅
- Given: anonymous visitor (no auth cookie) at `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1` (a real preview module from `previewModuleByCode`).
- When: GET the page.
- Then: SSR returns the `Loading...` shell (`grep -c ">Loading\.\.\.<" /tmp/valid-loggedout.html` → 1, `grep -c "Lesson not found" /tmp/valid-loggedout.html` → 0). On the client, `useAuth` resolves with `isHydrated=true, isLoggedIn=false`, and the very next render evaluates `if (!isLoggedIn)` on line 230 BEFORE `if (!moduleRow)` on line 255 — the sign-in card renders. `"Lesson not found."` is structurally unreachable for `!isLoggedIn` because the gate now precedes the not-found return.
- Evidence:
  - SSR HTML: `/tmp/valid-loggedout.html` (0 "Lesson not found" occurrences, 0 "Sign in to access this lesson" occurrences in SSR shell — both correct, only `Loading...` shows pre-hydration).
  - Source verified: line 230 gate precedes line 255 not-found return.
- Caveat (BLOCKED-on-instrument, not on outcome): no Chrome MCP available to run a sub-2s DOM polling probe for an in-flight flash. However, since the `!isLoggedIn` branch returns BEFORE the `!moduleRow` branch is even evaluated, no flash is possible regardless of `moduleRow` value. The flash bug fixed by KAN-143 required the gate to run AFTER the not-found return; that sequence no longer exists in the source.

### UAT-02 — Unknown module + logged-out (closes KAN-144 P3 bypass)
- Status: ✅
- Given: anonymous visitor at `/teacher/curriculum/bogus/bogus/BOGUS-1` (no matching DB row, no `previewModuleByCode` entry — `moduleRow` will settle to `null`).
- When: GET the page.
- Then: SSR returns the `Loading...` shell (`/tmp/unknown-loggedout.html`: 0 "Lesson not found", 0 "Sign in to access this lesson", 1 `Loading...`). On the client after hydration, `isLoggedIn=false` triggers the sign-in card on line 230 BEFORE the `moduleRow` state ever resolves and BEFORE `!moduleRow` is checked. The bypass that produced "Lesson not found." for logged-out unknown URLs in iter-3 is closed.
- Evidence:
  - SSR HTML: `/tmp/unknown-loggedout.html`
  - Source: gate at line 230 returns unconditionally when `!isLoggedIn`, regardless of `moduleRow` value.

### UAT-03 — Unknown module + logged-in — unchanged
- Status: ✅ (verified by code review; cannot exercise without an authenticated browser session in this environment)
- Given: authenticated teacher at the same `/teacher/curriculum/bogus/bogus/BOGUS-1`.
- When: page hydrates with `isLoggedIn=true`.
- Then: `if (!isLoggedIn)` evaluates to false and falls through. `useEffect` fetch returns no module + no preview fallback, `moduleRow` stays `null`, and `if (!moduleRow)` on line 255 returns the "Lesson not found." card as before. Identical behavior to iter-3 for this scenario.
- Evidence: render-order trace in source — gate only fires when `!isLoggedIn`, so logged-in flow is untouched.

### UAT-04 — Valid module + logged-in — no regression
- Status: ✅ (verified by code review)
- Given: authenticated teacher at `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1`.
- When: page hydrates with `isLoggedIn=true` and `moduleRow` populated.
- Then: both `if (!isLoggedIn)` and `if (!moduleRow)` are false; main render at line 430 fires with the full lesson UI, notes pane, signal step, etc. The only code that moved was the gate block — main render and below is byte-identical to iter-3.
- Evidence: source diff scope is exactly the cut/paste range; everything from line 276 (`const lesson = ...`) downward is untouched.

### UAT-05 — Rules of Hooks (no "Rendered fewer hooks than expected")
- Status: ✅
- Verification: greppped every hook call site in the component. All 22 hooks (lines 83–123: `use`, `useSearchParams`, `useAuth`, 16× `useState`, `useTeachingMode`, `useDefaultSubject`, `useMemo`, and two `useEffect`s declared right after) are called unconditionally before the first early return on line 226. The new gate inserted at line 230 is between two pre-existing post-hooks returns, so the per-render hook count is invariant across all branches (loading shell, sign-in card, not-found, main render).
- Dev-server log (`/tmp/kan143-dev-server.log`): clean compile, no `Rendered fewer hooks` warnings, no React reconciliation errors, no hydration mismatch warnings during the 4 GETs issued.
- Lint: `pnpm lint` exited 0 — no `react-hooks/rules-of-hooks` violations.

### UAT-06 — Mobile (sign-in card at 375×667)
- Status: ⏸️ BLOCKED-on-instrument (no Chrome MCP)
- The sign-in card markup is byte-identical to LR-18a (same `<div className="space-y-4">`, same `<Link>`, same `card space-y-2` wrapper). LR-18a's iter-3 UAT verified mobile fit; this iteration only moved the block, did not edit its JSX. Code-review verdict: PASS by inheritance. Live mobile screenshot not captured this run.

## Run history

### 2026-05-12 — padi-uat-agent (BuildLoop loop 2026-05-13T00:50:20Z-cc45, iter 4)

- Verdict: PASS
- Scenarios: ✅ 5 / ❌ 0 / 🐛 0 / ⏸️ 1 (UAT-06 inherits from LR-18a; not a fail — instrument unavailable)
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Valid module + logged-out (closes KAN-143) | ✅ | — | — |
  | UAT-02 | Unknown module + logged-out (closes KAN-144) | ✅ | — | — |
  | UAT-03 | Unknown module + logged-in — unchanged | ✅ | — | — |
  | UAT-04 | Valid module + logged-in — no regression | ✅ | — | — |
  | UAT-05 | Rules of Hooks | ✅ | — | — |
  | UAT-06 | Mobile 375×667 | ⏸️ | — | — |
- Notes for padi-eng:
  - Mechanical fix landed cleanly. Render order in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` is now `!isHydrated` (line 226) → `!isLoggedIn` (line 230) → `!moduleRow` (line 255) → main render. Single gate block, no duplicates, simplified condition `!isLoggedIn` with no redundant `isHydrated &&`. Both flagged iter-3 bugs (KAN-143 P2 flash, KAN-144 P3 bypass) are structurally closed — neither requires further runtime verification, because the not-found branch is unreachable for `!isLoggedIn`.
- Notes for padi-design: none. No copy, styling, or component changes — sign-in card markup unchanged from LR-18a.
- Missing from ticket / harness gaps:
  - No Chrome MCP tool is wired into this UAT agent environment, so we cannot run a sub-2s DOM polling probe for the in-flight flash described in the KAN-143 AC. For KAN-143 specifically the flash is structurally impossible post-fix (gate precedes not-found), so the probe would only confirm the static analysis. Worth flagging for future UATs that need real DOM evidence.
  - UAT-06 mobile screenshot inherits from LR-18a since this iteration did not touch the sign-in card JSX; if the harness ever grows a Chrome MCP, recapture for fresh evidence.
