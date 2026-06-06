---
id: LR-36-UAT
title: UAT — Online/offline indicator in TopNav
parent: LR-36
feature: launch-readiness
slug: online-offline-indicator-in-topnav
created: 2026-06-06
updated: 2026-06-06
target: http://localhost:3000
file_under_test: components/TopNav.tsx
---

# Verdict: PASS

All 12 verification items pass. Implementation is a clean, surgical diff (~22 added lines) to `components/TopNav.tsx` only; no other files touched. `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`, and `pnpm vitest run` (31/31) all exit clean.

---

## Scope under test

LR-36 adds an amber "⚠️ Offline" pill to the TopNav header row that surfaces when the browser reports `navigator.onLine === false`. The badge is gated on `!online`, has `role="status"` + `aria-live="polite"` for accessibility, and reads `navigator.onLine` on mount with `'online'`/`'offline'` event listeners (cleaned up on unmount).

Single-file change: `components/TopNav.tsx`.

---

## Verification matrix

| # | Item | Result | Evidence |
|---|------|--------|----------|
| UAT-01 | State + useEffect wired correctly with cleanup | PASS | TopNav.tsx L14–26: `const [online, setOnline] = useState(true);` + useEffect that reads `navigator.onLine` and registers both listeners with a cleanup `return` that calls `removeEventListener` on both. |
| UAT-02 | Badge gated on `!online` | PASS | TopNav.tsx L76: `{!online && (` wraps the `<span>` badge. Initial SSR HTML at `/` contains no "Offline" text (verified via curl). |
| UAT-03 | Badge has `role="status"` + `aria-live="polite"` | PASS | TopNav.tsx L78–79: `role="status"` and `aria-live="polite"` both present on the `<span>`. |
| UAT-04 | Badge styling: `bg-amber-50 text-amber-800` | PASS | TopNav.tsx L80: `className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"`. Matches notes idiom (caution, not panic). Contrast ≈ 7:1, above WCAG AA. |
| UAT-05 | Initial mount reads `navigator.onLine` on hydration (assume online before that) | PASS | useState seed is `true`. useEffect L17 reads `navigator.onLine` once mounted (guarded by `typeof navigator !== 'undefined'` for SSR safety). SSR HTML confirms no "Offline" string is rendered server-side. |
| UAT-06 | `'online'` event → badge disappears; `'offline'` event → badge appears | PASS | TopNav.tsx L18–19 wires `onOnline = () => setOnline(true)` and `onOffline = () => setOnline(false)`. Conditional `!online` rendering in JSX means the badge reactively appears/disappears via React re-render. No setTimeout / debounce / extra layer that would delay it; browser fires event synchronously. |
| UAT-07 | Existing TopNav rendering (Sign In / Sign Out / Logged in as / role indicator) unchanged | PASS | `git diff components/TopNav.tsx` shows zero deletions and zero modifications to existing lines — only two pure additions (state+effect block and the conditional badge `<span>`). `useAuth()`, `isLoggedIn`, `user`, `logout`, `role`, `rolePhrase`, `SignInModal`, `padi-open-signin` listener all untouched. SSR HTML at `/` still renders "Sign In" button. |
| UAT-08 | Badge sits in the same flex row as the auth cluster, positioned BEFORE it | PASS | Badge `<span>` lives in the outer `<div className="flex items-center gap-3">` (TopNav.tsx L53), inserted between the "Start Teaching" Link (L66–75) and the `{!isLoggedIn && ...}` Sign In button (L85). Flex-row position is BEFORE the auth cluster as specified. `gap-3` provides natural spacing. |
| UAT-09 | `pnpm lint` exit 0, ZERO warnings (KAN-153 baseline) | PASS | `> eslint .` produced no output. Exit 0. Zero warnings. |
| UAT-10 | `pnpm tsc --noEmit` exit 0 | PASS | Exit 0. No type errors. |
| UAT-11 | `pnpm build` exit 0 (no Next.js advisory after KAN-167) | PASS | `✓ Generating static pages (21/21)`. All routes compile. Exit 0. No advisory. |
| UAT-12 | `pnpm vitest run` all pass | PASS | `Test Files  4 passed (4) / Tests  31 passed (31)`. Duration 2.98s. Includes roleCopy, assessmentStatusCopy, role-gating, role-copy suites — none regressed. |

## Regression checks

| Surface | Status | Notes |
|---|---|---|
| SIGNIN-3/4/5/6 modal triggers | PASS | `padi-open-signin` window listener (L38–43) and `<SignInModal>` mount (L113) unchanged. `useState(false)` seed for `isSignInOpen` preserved. |
| LR-30/30b/31 boundaries | PASS | Not touched. Single-file diff confined to `components/TopNav.tsx`. |
| LR-13j/k recording surfaces | PASS | Not touched. |
| KAN-133/133b LESSON_COMPLETED | PASS | Not touched. |
| LR-09a–g | PASS | Not touched. |
| Logged-out `/`, `/teacher/curriculum`, `/students`, `/teacher` | PASS | All return 200. SSR HTML for logged-out home shows Padi logo, Curriculum link, Start Teaching CTA, Sign In button — auth cluster intact. |
| Build size | PASS | Routes/bundle sizes consistent with baseline (no surprise bloat). |
| Mobile layout (375 × 667) | PASS (code-review) | Badge uses `rounded-full px-2 py-0.5 text-xs` — small enough to wrap cleanly in the existing `flex items-center gap-3` container. No fixed widths. No position: absolute. Will reflow with the rest of the auth cluster. |

## Post-edit sanity greps (from eng brief)

```
grep -c "navigator.onLine" components/TopNav.tsx          → 1   ✓ expected 1
grep -c "Offline" components/TopNav.tsx                   → 4   (badge text + 3 incidental identifier matches: onOffline, 'offline', removeEventListener('offline'))
grep -cE "addEventListener\('online'\|addEventListener\('offline'" components/TopNav.tsx  → 2   ✓
grep -cE "removeEventListener\('online'\|removeEventListener\('offline'" components/TopNav.tsx → 2   ✓
```

Eng brief expected `grep -c "Offline" → 1`; actual is 4 because the brief's literal grep also matches `onOffline`, `'offline'`, and `removeEventListener('offline')`. Substantively the implementation matches: exactly one user-visible "Offline" string (`⚠️ Offline` badge text), and the rest are internal identifiers/event names required by the wiring. Not a fail — eng brief grep was undercounting.

## SSR / hydration correctness

- Server renders TopNav with seeded `online = true` → no badge in SSR HTML (verified via `curl http://localhost:3000` — no "Offline" string found).
- After hydration, useEffect runs once, reads `navigator.onLine`, and either keeps `true` (badge stays hidden) or flips to `false` (badge appears within one React commit, <100ms typical).
- No SSR/CSR mismatch risk because the badge gating depends on `online` which starts at `true` on both server and client; only after `useEffect` does it potentially flip — which is a regular React state update, not a hydration mismatch.

## Out-of-scope confirmations

- No heartbeat / ping / Supabase fetch added.
- No retry banner or "Try again" button.
- No toast on transition.
- No queue-and-replay logic.
- No new test files (build/lint/tsc/vitest only, per ticket).

All out-of-scope items honored.

## Findings / nits

None. Implementation matches the eng brief exactly. The only minor discrepancy is the eng-brief's `grep -c "Offline" → expect 1` heuristic, which is a flaw in the heuristic (not the code). Documented above.

## Bugs filed

None.

---

## Run history

### 2026-06-06 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 12 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | State + useEffect wired with cleanup | PASS | — | — |
  | UAT-02 | Badge gated on !online | PASS | — | — |
  | UAT-03 | role="status" + aria-live="polite" | PASS | — | — |
  | UAT-04 | bg-amber-50 / text-amber-800 styling | PASS | — | — |
  | UAT-05 | Initial mount reads navigator.onLine | PASS | — | — |
  | UAT-06 | 'online'/'offline' events flip badge | PASS | — | — |
  | UAT-07 | Auth cluster / role / Sign In unchanged | PASS | — | — |
  | UAT-08 | Badge before auth cluster in flex row | PASS | — | — |
  | UAT-09 | pnpm lint exit 0, zero warnings | PASS | — | — |
  | UAT-10 | pnpm tsc --noEmit exit 0 | PASS | — | — |
  | UAT-11 | pnpm build exit 0 | PASS | — | — |
  | UAT-12 | pnpm vitest run all pass (31/31) | PASS | — | — |
- Notes for padi-eng: none — implementation matches eng brief exactly; v0 limitation (`navigator.onLine` = adapter state, not true reachability) is documented in ticket and acceptable for launch.
- Notes for padi-design: none — amber pill matches notes idiom (LR-13e/h), contrast meets WCAG AA, badge sits naturally in the existing flex row.
- Missing from ticket: nothing material. The eng brief's `grep -c "Offline" → 1` sanity check undercounts because it also matches internal identifiers/event names (`onOffline`, `'offline'`); a future eng brief could use `grep -cE '>\s*⚠️ Offline'` or similar to count only user-visible strings.
