---
id: LR-30b-UAT
title: "UAT: Wire app_error analytics in route error boundary"
type: uat
status: in_review
parent: LR-30b
feature: launch-readiness
created: 2026-05-28
ran_by: cowork-source-review-fallback
methodology: source-review + validators (3-line change; analytics emit fires only on a thrown error, not unit-testable without forcing a throw)
---

Verdict: PASS

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| 1 | `ANALYTICS_EVENTS.APP_ERROR === 'app_error'` | PASS | `lib/analytics.ts` — enum entry added (grep count 1) |
| 2 | Route boundary emits with digest + scope | PASS | `app/error.tsx:16` — `track(ANALYTICS_EVENTS.APP_ERROR, { digest: error.digest, scope: 'route' })` alongside `console.error` in the useEffect; import added at `:5` |
| 3 | TODO marker gone in error.tsx | PASS | the `// TODO(analytics)` line is replaced by the real emit |
| 4 | Props are digest + scope only (no PII) | PASS | grep `error.message\|error.stack` in error.tsx → 0; only `digest` + `scope: 'route'` shipped |
| 5 | Global boundary stays console-only | PASS | `app/global-error.tsx` has NO real `track()` call — the single grep hit is the `// TODO(analytics): track(...)` comment at `:14`, intentionally left as console-only per LR-30's degraded-context caution |
| 6 | Analytics-failure safe | PASS | uses the existing `track()` helper which try/catches + no-ops when PostHog unconfigured (lib/analytics.ts:27-35) |
| 7 | error.tsx branded UI unchanged | PASS | Try again / Home / copy intact below the useEffect |
| 8 | not-found / loading / layout / global-error UI unchanged | PASS | diff confined to lib/analytics.ts + app/error.tsx |
| 9 | `pnpm lint` 0 warnings | PASS | clean (KAN-153 baseline) |
| 10 | `pnpm tsc --noEmit` exit 0 | PASS | no output |
| 11 | `pnpm build` exit 0, no Next.js advisory | PASS | "✓ Compiled successfully in 1538ms" |
| 12 | `pnpm vitest run` all pass | PASS | 4 files / 31 tests |
| 13 | No regression on KAN-133/137 / SIGNIN-3/4 events | PASS | only an enum ADDITION + one new emit; existing events untouched |

## Note

Build → validate → uat advanced cleanly (no socket drop). The emit fires only inside a thrown-error render path, which can't be forced in a unit test — source-review + the full validator suite is the verification. Completes the LR-30 analytics gap for the common (route-segment) error case while keeping the global root-layout boundary console-only by design.

## Run history

### 2026-05-28 — cowork source-review fallback (iter-008)
- Verdict: PASS — 13/13 ACs, 0 bugs
