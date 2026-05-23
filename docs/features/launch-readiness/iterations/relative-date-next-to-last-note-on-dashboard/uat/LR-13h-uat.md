---
id: LR-13h-UAT
parent: LR-13h
feature: launch-readiness
updated: 2026-05-23
ran_by: padi-uat-agent
---

# UAT — LR-13h — Relative date next to "Last note" on dashboard cards

Verdict: PASS

## Method

Source review (per task brief — 2-change cosmetic add). Validated `app/teacher/page.tsx` against `feature-refined.md` AC, then ran `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`. Confirmed only `app/teacher/page.tsx` changed (no regression risk on hook, profile, schema, or other features).

## Scenarios

| # | Scenario | Status |
|---|----------|--------|
| UAT-01 | `relativeDays` helper present at line 19 with all branches | PASS |
| UAT-02 | `iso = null/undefined/''` → `null` (no segment) | PASS — `if (!iso) return null` |
| UAT-03 | `iso = invalid` → `null` | PASS — `!Number.isFinite(then)` guard |
| UAT-04 | Future date → `null` | PASS — `if (days < 0) return null` |
| UAT-05 | 0 days → `today` | PASS |
| UAT-06 | 1 day → `yesterday` | PASS |
| UAT-07 | 2-29 days → `N days ago` | PASS |
| UAT-08 | 30-59 days → `1 month ago` | PASS |
| UAT-09 | 90 days → `3 months ago` | PASS — `Math.floor(90/30) = 3` |
| UAT-10 | JSX at line 507 — `(timestamp)` segment between "Last note" and ":" | PASS — exact spec match |
| UAT-11 | Null timestamp → `Last note: ...` (fallback, no segment) | PASS — ternary returns `''` |
| UAT-12 | No notes → no "Last note" line at all | PASS — outer `card.latestObservationNotes?.trim()` gate intact |
| UAT-13 | Group cards (no per-student obs) → no line | PASS — `card.type === 'student'` gate intact |
| UAT-14 | `pnpm lint` exit 0, ZERO warnings (KAN-153) | PASS |
| UAT-15 | `pnpm tsc --noEmit` exit 0 | PASS |
| UAT-16 | `pnpm build` exit 0 | PASS |
| UAT-17 | Only `app/teacher/page.tsx` touched (no regression on LR-13d/e/f/g, LR-09, LR-11, LR-26, KAN-51/64) | PASS — git diff confirms |

## Notes for padi-eng

None. Surgical 2-change diff matches eng-brief exactly. Helper is pure, defensive, and inline per spec.

## Run history

### 2026-05-23 — padi-uat-agent
- Verdict: PASS
- Scenarios: 17 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Bugs filed: none
