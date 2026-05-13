---
id: KAN-142
title: "Rules of Hooks violation — early return for logged-out branch placed before useEffect/useMemo causes hook-count change"
type: bug
status: fixed
priority: P1
severity: P1
feature: launch-readiness
parent: LR-17
uat: LR-17-UAT
created: 2026-05-12
updated: 2026-05-12
file: app/teacher/start-teaching/students/[studentId]/page.tsx
---

## Summary

The LR-17 fix introduces a Rules of Hooks violation in `app/teacher/start-teaching/students/[studentId]/page.tsx`. The new logged-out early-return at lines 115–138 is placed BEFORE two `useEffect` calls (lines 140, 253) and three `useMemo` calls (lines 265, 275, 287). Because the early return is gated on `isHydrated && !isLoggedIn`, the hook count changes between renders — the first render (pre-hydration, with `isHydrated=false`) executes all 13 hooks, while the second render (post-hydration, logged-out) executes only 8 hooks and short-circuits before the rest. React will throw "Rendered fewer hooks than expected" on the transition.

This means the very acceptance criterion the iteration was meant to satisfy — "within 2 seconds the page renders the Sign in to view this student card" — is likely broken at runtime, because hydration → state-update flips the conditional and changes hook count.

## Steps to reproduce

1. Run `pnpm dev` and navigate to `http://localhost:3000/teacher/start-teaching/students/<any-id>` while logged out.
2. Open browser devtools console.
3. Observe: after auth-store hydration completes (a few hundred ms after mount), React should throw:
   `Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
4. Alternative repro: log in, navigate to the page (renders fine), then log out via TopNav — same hook-count change, same crash.

Note: This UAT could not directly verify the runtime crash because this environment lacks a browser automation tool (no chrome-devtools MCP, no Playwright/Puppeteer installed in the repo). Static analysis is conclusive; runtime confirmation requires a browser.

## Expected

The logged-out branch should be rendered without changing hook count between renders. Two correct fixes:

**Option A (recommended — mirrors `app/students/page.tsx`):** keep all hooks at the top and render the logged-out card via a JSX ternary in the existing return statement, before any data-dependent JSX.

**Option B:** move the early-return conditional AFTER all hook calls (after the `useMemo` at line 287, before the first `return` JSX). This preserves stable hook order.

## Actual

Early return at line 115 short-circuits before `useEffect` (line 140), `useEffect` (line 253), `useMemo` (line 265), `useMemo` (line 275), `useMemo` (line 287). When `isHydrated` flips from `false` to `true` while logged-out (the central case for this iteration), React detects fewer hooks than the previous render and throws.

## Evidence

- Source: `app/teacher/start-teaching/students/[studentId]/page.tsx` lines 89–290.
- Hook list in render order:
  - line 89: `use(params)`
  - line 90: `useAuth()` (internally `useContext`)
  - lines 91–102: 5× `useState`
  - line 104: `useCallback`
  - **line 115: early return (conditional on `isHydrated && !isLoggedIn`)**
  - line 140: `useEffect`
  - line 253: `useEffect`
  - line 265: `useMemo`
  - line 275: `useMemo`
  - line 279: `useMemo`
  - line 287: `useMemo`
- React docs: https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level
- Reference for correct pattern in this codebase: `app/students/page.tsx:44–84` renders the logged-out card via a JSX ternary inside the single `return` block, never via early return.

## Impact

Blocks LR-17 success criteria:
- AC "within 2 seconds the page renders the Sign in to view this student card" — likely fails: React error boundary catches the hook violation and renders the error UI instead of the sign-in card.
- AC "Auth-state transition mid-page — signs in via TopNav → re-renders to loaded profile" — fails for the same reason.
- AC "Logged-in regression — no regression for real students" — passes in practice because the early return is never taken when `isLoggedIn=true`, but the violation is latent and would fire on logout.

## Notes for eng

Smallest correct diff: change line 115 from an early return to deferring the decision until after all hooks, and render the card from inside the existing return tree (matching `app/students/page.tsx`'s pattern). Example sketch:

```tsx
// Keep all hooks at top, then:
if (!isHydrated || loading) return <div className="...">Loading...</div>;
if (!isLoggedIn) {
  return (
    <div className="space-y-4">
      {/* sign-in card markup */}
    </div>
  );
}
if (!student) return <div>...not found...</div>;
return <div className="space-y-6">{/* full profile */}</div>;
```

This places the logged-out branch BETWEEN the spinner branch and the `!student` branch, so all hooks always execute first regardless of auth state.

## Fix Notes

**Root cause:** The LR-17 patch placed an early `return` for the logged-out path between the `useCallback` at line 104 and the `useEffect` at line 140. Because the predicate (`isHydrated && !isLoggedIn`) flips after the auth store hydrates, the render that triggers the flip executes a different number of hooks than the preceding render — triggering React's "Rendered fewer hooks than expected" invariant.

**Files changed:**
- `app/teacher/start-teaching/students/[studentId]/page.tsx`

**What changed:**
- Removed the early-return block that lived between `useCallback` and the first `useEffect`.
- After all hooks (the existing `useMemo` block and `toggleChapter` definition), the final render decision tree is now:
  1. `if (!isHydrated)` → loading spinner
  2. `if (!isLoggedIn)` → "Sign in to view this student" card
  3. `if (loading)` → loading spinner
  4. `if (!student)` → not-found card
  5. otherwise → full profile
- The original spinner block has been split into two: a pre-hydration spinner check and a post-hydration `loading` check, with the logged-out branch wedged between them.

**Why this fix is correct:**
- All hooks (`use`, `useAuth`, 5× `useState`, `useCallback`, 2× `useEffect`, 4× `useMemo`) now run unconditionally on every render, satisfying the Rules of Hooks regardless of auth state or hydration timing. React will never observe a hook-count change.
- The logged-out branch is checked **before** the `loading` branch. This matters because the data-fetching `useEffect` early-returns when `!isLoggedIn`, so `loading` never flips to `false` for anonymous visitors. If we had instead followed the bug report's literal sketch (`if (!isHydrated || loading) … if (!isLoggedIn) …`), the logged-out path would still hang on the spinner — which is exactly the LR-17 bug. The chosen ordering preserves LR-17's "within 2 seconds, render the sign-in card" acceptance criterion.
- This matches the established pattern in `app/students/page.tsx`, where the auth gate is resolved inside the single return tree rather than via an early return.
