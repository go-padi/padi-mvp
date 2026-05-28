---
id: LR-30-UAT
title: "UAT: Branded global-error boundary"
type: uat
status: in_review
parent: LR-30
feature: launch-readiness
created: 2026-05-28
ran_by: cowork-source-review-fallback
methodology: source-review + validators (build CLI socket-dropped on return after writing files + summary; orchestrator-resident session fixed the one lint error it left, then statically verified. Error boundaries can't be exercised without forcing a throw, so source-review is the appropriate verification.)
---

Verdict: PASS

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| 1 | `app/global-error.tsx` exists, `'use client'` | PASS | `:1` `'use client'` |
| 2 | Renders own `<html>` + `<body>` | PASS | `:20` `<html lang="en">`, `:21` `<body ...>` — required since it replaces the root layout |
| 3 | "Try again" button calls `reset()` | PASS | `:50` `onClick={() => reset()}` |
| 4 | "Home" uses plain `<a href="/">` not next/link | PASS | `:69` `<a href="/">`; `:67` scoped `eslint-disable-next-line @next/next/no-html-link-for-pages` + a justification comment (router context may be dead in a root-layout failure → full navigation is the only reliable path home; Next.js docs endorse `<a>` here) |
| 5 | Error logged on mount (global) | PASS | `:13` `console.error('[global-error]', error)` in useEffect |
| 6 | `app/error.tsx` un-ignores error + logs | PASS | renamed export `GlobalError`→`RouteError` (`:6`, accurate naming); `:13-14` `useEffect` → `console.error('[route-error]', error)`; "We've logged the error" copy is now truthful |
| 7 | Resilient styling (inline critical + Tailwind enhancement) | PASS | global-error uses inline styles for centering/font/padding/buttons so it renders legibly even if Tailwind's stylesheet didn't load |
| 8 | Analytics kept out of degraded context | PASS | both boundaries leave `// TODO(analytics)` markers; `lib/analytics.ts` untouched (per spar — console.error is the reliable capture) |
| 9 | `pnpm lint` 0 warnings, 0 errors | PASS | clean after the scoped eslint-disable (KAN-153 baseline; the partial build had left 1 lint error which was fixed) |
| 10 | `pnpm tsc --noEmit` exit 0 | PASS | no output |
| 11 | `pnpm build` exit 0, no Next.js advisory | PASS | "✓ Compiled successfully in 1777ms"; `/_not-found` route present |
| 12 | `pnpm vitest run` all pass | PASS | 4 files / 31 tests |
| 13 | No regression — error.tsx branded UI intact, not-found unchanged, layout untouched | PASS | error.tsx keeps btn UI + Try again/Home; `app/layout.tsx` + `app/not-found.tsx` untouched; diff confined to global-error.tsx (new) + error.tsx |

## Lint-error caught + fixed during this iter

The partial build wrote both files but left a lint ERROR: `@next/next/no-html-link-for-pages` flagging the intentional `<a href="/">` in global-error. This is a genuine rule-vs-context tension — the rule assumes the Next router is available, which is precisely what's NOT guaranteed in a root-layout failure. Resolved correctly with a scoped `eslint-disable-next-line` + a 3-line justification comment (rather than caving to `next/link`, which would defeat the purpose). Re-lint: 0 errors, 0 warnings — KAN-153 baseline preserved.

## Run history

### 2026-05-28 — cowork source-review fallback (iter-006)
- Verdict: PASS — 13/13 ACs, 1 lint error caught + fixed, 0 bugs
