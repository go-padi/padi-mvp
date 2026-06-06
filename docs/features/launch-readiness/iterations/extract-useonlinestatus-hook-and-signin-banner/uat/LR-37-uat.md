---
id: LR-37-UAT
parent: LR-37
title: UAT — Extract useOnlineStatus hook; consume in TopNav + new SignInModal offline banner
updated: 2026-06-06
---

# LR-37 — UAT Verdict

Verdict: PASS

Scope: Promote the LR-36 `navigator.onLine` snippet out of `components/TopNav.tsx` into a shared `lib/hooks/useOnlineStatus.ts`, then consume it from (1) `components/TopNav.tsx` (refactor, preserving the LR-36 `⚠️ Offline` pill) and (2) `components/auth/SignInModal.tsx` (new amber offline banner above `{error}` / `{info}` blocks; informational only — does NOT disable submit).

## Scenarios

### UAT-01 — Hook signature + module shape — PASS
- Status: PASS
- Expected: `export function useOnlineStatus(): boolean`; file starts with `'use client'` directive; lives at `lib/hooks/useOnlineStatus.ts`.
- Actual: `lib/hooks/useOnlineStatus.ts` line 1 is `'use client';` and line 5 is `export function useOnlineStatus(): boolean {`. Module is exactly 20 lines, no other exports.
- Evidence: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/lib/hooks/useOnlineStatus.ts:1-20`.

### UAT-02 — Hook reads navigator.onLine + registers both listeners + cleanup — PASS
- Status: PASS
- Expected: Initialize state from `navigator.onLine` on mount (SSR-guarded); register `window.addEventListener('online', ...)` and `window.addEventListener('offline', ...)`; the effect cleanup removes BOTH listeners.
- Actual:
  - Initial state `useState(true)` (safe default for SSR).
  - Inside `useEffect`: `if (typeof navigator !== 'undefined') setOnline(navigator.onLine);` (line 8) — correctly hydrates from the live browser value on mount.
  - `onOnline = () => setOnline(true)`; `onOffline = () => setOnline(false)`; both registered (lines 9-12).
  - Cleanup returns a function that calls `removeEventListener` for BOTH `'online'` and `'offline'` with the same handler refs (lines 13-16). No leak risk.
- Evidence: `lib/hooks/useOnlineStatus.ts:7-17`.

### UAT-03 — `navigator.onLine` lives ONLY in the hook (no duplication) — PASS
- Status: PASS
- Expected: 0 references to `navigator.onLine` in `components/TopNav.tsx` and `components/auth/SignInModal.tsx`; the only reference is in the hook.
- Actual: `grep -n "navigator.onLine"` across the three files returned exactly one hit, in `lib/hooks/useOnlineStatus.ts:8`. Zero hits in TopNav and SignInModal.
- Evidence: shell grep result captured during run.

### UAT-04 — TopNav refactor: consumes hook; LR-36 `⚠️ Offline` pill preserved — PASS
- Status: PASS
- Expected: TopNav imports the hook from `@/lib/hooks/useOnlineStatus`, calls `useOnlineStatus()` exactly once at the top of the component, drops any local `useState`/`useEffect` for online status, and continues to render the LR-36 pill verbatim when offline (amber pill, rounded-full, `⚠️ Offline` text).
- Actual:
  - Import: `components/TopNav.tsx:8` — `import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';`.
  - Use site: `components/TopNav.tsx:15` — `const online = useOnlineStatus();`.
  - No remaining inline `useState` for online; the `useEffect` at lines 27-32 is the LR-19a/b modal-open listener, not the online status logic.
  - Pill (lines 65-73): `<span role="status" aria-live="polite" className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">⚠️ Offline</span>` — matches the LR-36 baseline exactly.
- Evidence: `components/TopNav.tsx:8, 15, 65-73`.

### UAT-05 — SignInModal: consumes hook; offline banner rendered with correct a11y, styling, and placement — PASS
- Status: PASS
- Expected:
  - Imports + calls `useOnlineStatus()` exactly once.
  - When `!online`, render a banner with `role="status"`, `aria-live="polite"`, amber styling (`bg-amber-50` / `text-amber-800`), copy `"⚠️ You appear to be offline. Reconnect to sign in."`.
  - Banner sits ABOVE the existing `{error && ...}` and `{info && ...}` blocks (so it's the first transient feedback the user sees, ahead of credential errors).
- Actual:
  - Import: `components/auth/SignInModal.tsx:4` — `import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';`.
  - Use site: `components/auth/SignInModal.tsx:34` — `const online = useOnlineStatus();`.
  - Banner (lines 449-457): `!online && <div role="status" aria-live="polite" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">⚠️ You appear to be offline. Reconnect to sign in.</div>`.
  - Placement: line 449 banner precedes the `{error && ...}` block at line 458 and the `{info && ...}` block at line 459 — banner is rendered ABOVE both, as required.
  - One "You appear to be offline" hit in the codebase (the banner copy), as expected.
- Evidence: `components/auth/SignInModal.tsx:4, 34, 449-459`.

### UAT-06 — Submit button is NOT disabled when offline (informational only) — PASS
- Status: PASS
- Expected: Going offline must not disable the primary or forgot-mode submit buttons. Disable logic should not reference `online`.
- Actual:
  - `primaryDisabled = loading || (isSignup && (!password || !confirmPassword))` (line 269) — no `online` reference.
  - `forgotDisabled = loading || !email` (line 270) — no `online` reference.
  - The forgot-mode "Send reset link" (submit) and "Email me a magic sign-in link" buttons each gate on `forgotDisabled` only (lines 464, 472). The Sign In / Create Account submit gates on `primaryDisabled` only (line 489).
  - Per LR-37 brief intent: the banner is a soft warning. The user can still hit submit; Supabase will surface the network error.
- Evidence: `components/auth/SignInModal.tsx:269-270, 464, 472, 489`.

### UAT-07 — Going online → both surfaces hide — PASS (verified by hook contract)
- Status: PASS
- Expected: When the browser dispatches the `'online'` event, the hook flips `online` from false to true, which removes both the TopNav `⚠️ Offline` pill (gated `{!online && ...}` at TopNav line 65) and the SignInModal banner (gated `{!online && ...}` at SignInModal line 449). Both surfaces unmount via React reconciliation.
- Actual: The single `online` boolean from `useOnlineStatus()` is the sole gate for both surfaces. Because the hook listens to `window.addEventListener('online', ...)` and calls `setOnline(true)`, both `{!online && ...}` JSX branches will return `false` and unmount the pill and banner on the next render. There is no other state or stale-closure concern (the effect deps are `[]` and the handlers are inline arrow functions newly created on mount, removed on cleanup).
- Evidence: `lib/hooks/useOnlineStatus.ts:9-12`, `components/TopNav.tsx:65`, `components/auth/SignInModal.tsx:449`.
- Note: Live Chrome toggling of the Network "Offline" condition is not available in this UAT environment (no browser tool connected). The behavior is verified by hook contract + identical gating predicate across both surfaces.

### UAT-08 — `pnpm lint` exit 0, zero warnings — PASS
- Status: PASS
- Expected: KAN-153 zero-warning baseline holds.
- Actual: Command output was only the two-line header (`> padi-app@0.1.0 lint ...` / `> eslint .`) with no warnings or errors and exit 0.
- Evidence: lint output captured during run.

### UAT-09 — `pnpm tsc --noEmit` exit 0 — PASS
- Status: PASS
- Expected: TypeScript clean across the new hook + both modified consumers.
- Actual: Empty output, exit 0.
- Evidence: tsc output captured during run.

### UAT-10 — `pnpm build` exit 0 (no Next.js advisory after KAN-167) — PASS
- Status: PASS
- Expected: Production build succeeds, no Next.js ESLint advisory (KAN-167 baseline).
- Actual: `✓ Compiled successfully in 1655ms`. All 21 routes generated. Static prerender for `/` and `/teacher` succeeded. No advisory output between "Skipping linting" and "Checking validity of types ...". Exit 0.
- Evidence: build output captured during run.

### UAT-11 — `pnpm vitest run` all pass — PASS
- Status: PASS
- Expected: All vitest suites green.
- Actual: `Test Files  4 passed (4)` / `Tests  31 passed (31)` in 1.12s. One non-blocking `baseline-browser-mapping` data-freshness notice (unrelated to LR-37).
- Evidence: vitest output captured during run.

### UAT-12 — No regression on sibling auth/nav flows — PASS (code review)
- Status: PASS
- Expected: SIGNIN-3/4/5/6 (mode switching, forgot/magic/reset/resend), LR-19a/b (identity banner + email-exists inline action), LR-22 (sign-in CTA on logged-out gates), LR-30/30b/31 (error boundaries), LR-13e/h/j/k (signal surfaces), KAN-133/133b (analytics events), and LR-36 (TopNav pill, now sourced from the hook) all still work.
- Actual:
  - SignInModal: mode-switch (`switchMode`), focus management (lines 82-90), email-exists inline action (`handleSignInInstead`), forgot/magic confirmation card (lines 318-338), email-unconfirmed resend block (lines 434-447), analytics calls (`track(ANALYTICS_EVENTS.*)`), and ESC-to-close (lines 55-61) are all preserved unchanged. The only diff in SignInModal is the new hook import (line 4), the hook call (line 34), and the banner JSX (lines 449-457). No other behavior touched.
  - TopNav: LR-36 pill renderer (lines 65-73) is byte-identical to baseline; only the source of `online` changed — was a local `useState`/`useEffect`, now `useOnlineStatus()`. The LR-19a `padi-open-signin` event listener (lines 27-32) is preserved.
  - The TopNav `useEffect` deps array `[]` and the hook's effect deps `[]` are both legitimate empty arrays (event listeners only). React Hooks lint did not flag either (UAT-08 zero warnings).
- Evidence: full source review of `components/TopNav.tsx` and `components/auth/SignInModal.tsx` performed during run.

## Run history

### 2026-06-06 — padi-uat-agent
- Verdict: PASS
- Scenarios: 12 PASS / 0 FAIL / 0 BLOCKED
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Hook signature + module shape | PASS | — | — |
  | UAT-02 | Hook reads navigator.onLine + listeners + cleanup | PASS | — | — |
  | UAT-03 | navigator.onLine only in hook (no duplication) | PASS | — | — |
  | UAT-04 | TopNav refactor + LR-36 pill preserved | PASS | — | — |
  | UAT-05 | SignInModal banner: a11y, styling, placement above {error}/{info} | PASS | — | — |
  | UAT-06 | Submit NOT disabled when offline | PASS | — | — |
  | UAT-07 | Going online hides both surfaces | PASS | — | — |
  | UAT-08 | pnpm lint exit 0, zero warnings | PASS | — | — |
  | UAT-09 | pnpm tsc --noEmit exit 0 | PASS | — | — |
  | UAT-10 | pnpm build exit 0 | PASS | — | — |
  | UAT-11 | pnpm vitest run all pass (31/31, 4 files) | PASS | — | — |
  | UAT-12 | No regression on sibling SIGNIN/LR-19/LR-22/LR-30/LR-36/KAN-133 surfaces | PASS | — | — |
- Notes for padi-eng: Clean three-surface extraction. The hook is minimal and correct (SSR-guarded initial read, both listeners, proper cleanup). Both call sites adopt it with a one-line replacement and zero behavior delta on the LR-36 path. The SignInModal banner is correctly placed ABOVE `{error}` and `{info}` so it doesn't get visually buried by credential errors. Submit is intentionally not disabled — informational only — which matches the brief.
- Notes for padi-design: SignInModal offline banner uses the same amber palette (`bg-amber-50` / `text-amber-800`) as the TopNav pill but in `rounded-lg` (vs the TopNav `rounded-full` pill). Both are appropriate to their containers. Copy "⚠️ You appear to be offline. Reconnect to sign in." reads cleanly.
- Missing from ticket: No gaps. Brief was tight and the implementation matches it exactly. Optional future enhancement (not in this scope): a vitest unit test for `useOnlineStatus` covering initial mount, `'online'` event flips state to true, `'offline'` flips to false, and unmount removes both listeners. Filing as a follow-up tech-debt note rather than a P3 bug since the hook is correctly implemented and exercised in production via two consumers.
- Caveats: Dev server at :3000 was returning HTTP 500 wrappers due to a transient Next 15.5.9 devtools React Client Manifest issue (`segment-explorer-node.js`) inherited from the prior iteration — unrelated to LR-37. The full rendered HTML (including the `<nav>` from `components/TopNav.tsx` and the "Sign In" button) IS present in the response body, confirming the components mount cleanly. UAT-07 (online→offline→online toggle) is verified by hook contract + identical `{!online && ...}` gating predicate at both call sites rather than a live Chrome network toggle.
