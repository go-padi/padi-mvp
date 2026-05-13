---
id: KAN-143
title: "Flash of 'Lesson not found.' renders before logged-out sign-in gate"
type: bug
status: open
priority: medium
severity: P2
feature: launch-readiness
parent: LR-18a
uat: LR-18a-UAT
created: 2026-05-12
updated: 2026-05-12
---

## Summary

When a logged-out visitor lands at `/teacher/curriculum/[chapter]/[group]/[module]` for a **valid, seeded** module code (e.g. `learning-sensorially-1`), the page renders the unstyled string `Lesson not found.` (with full teaching-mode toggle nav above it) for ~300 ms before the new LR-18a sign-in gate replaces it. This is a perception-only flash — the AC's 2-second time-to-gate budget is met — but it telegraphs a wrong message to an anonymous user (the lesson is not "not found"; they just need to sign in).

## Root cause

`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` has three sequential early-return blocks after all hooks:

1. Line 226: `if (!isHydrated) return <Loading ... />`
2. Line 230: `if (!moduleRow) return <Lesson not found />` ← **fires while fetch is in flight**
3. Line 405: `if (isHydrated && !isLoggedIn) return <Sign-in gate />` ← LR-18a addition

After hydration but before the Supabase `content_get_module` RPC resolves (~300 ms of wall time), `moduleRow` is still its initial `null` state, so block #2 wins. Once the RPC resolves and `setModuleRow(...)` fires, block #3 finally fires and the gate replaces "Lesson not found.".

Measured timeline on local dev (clean storage, headless Chrome, fresh nav):

```
[+89ms]  Loading...
[+484ms] Lesson not found.   ← visible for ~312ms
[+796ms] Sign in to access this lesson
```

## Reproduce

1. Sign out of Padi (or open a private window).
2. Clear localStorage / cookies for `localhost:3000` (or `go-padi.com`).
3. Navigate directly to `http://localhost:3000/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1`.
4. Watch the main content area as the page hydrates: you will briefly see the teaching-mode toggle nav and "Lesson not found." card before the sign-in card appears.

## Expected

The sign-in gate should appear directly after the "Loading..." state, with no intervening "Lesson not found." flash.

## Suggested fix

Move the gate's logged-out check to fire **before** the `!moduleRow` early return. The hook-order constraint is unchanged (both blocks are still after every hook); the new ordering is:

1. `if (!isHydrated) return <Loading />`
2. **`if (isHydrated && !isLoggedIn) return <Sign-in gate />`**  ← move up
3. `if (!moduleRow) return <Lesson not found />`

This is a single-block move (lines 405–428 → relocated just below line 228, or equivalent). It also automatically fixes the related KAN-144 (bogus-module-code edge case) at the same time.

## Evidence

- Screenshot of stable state (gate): `docs/features/launch-readiness/iterations/lr-18a-gate-logged-out-lesson-detail/uat/evidence/loggedout-desktop.png`
- Timing capture (CDP, 50ms poll): `/tmp/cdp-timing.js` produced `[+484ms] notFound=true` then `[+796ms] gate=true`.

## Notes for padi-eng

Single-file fix. No new imports. No hook reordering. The two blocks both check after-hook conditions and both return JSX, so swapping order is safe. Re-run the LR-18a UAT timing probe after the fix — expected: no `notFound=true` state in the timeline for a valid module code.
