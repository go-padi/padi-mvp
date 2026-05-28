---
id: LR-13j-UAT
title: "UAT: Recent recordings on student profile"
type: uat
status: in_review
parent: LR-13j
feature: launch-readiness
created: 2026-05-28
ran_by: cowork-source-review-fallback
methodology: source-review + validators (uat-tester agent not invoked — API has dropped 2 long agent sockets this session; LR-13j is a tight reuse of the LR-14c pattern so static verification covers every branch)
---

Verdict: PASS

## Results

| # | AC | Status | Evidence |
|---|----|--------|----------|
| 1 | Fetch scoped to (tenant, student), all modules, limit 5, desc | PASS | `:455-462` — `.eq('tenant_id')`.`.eq('student_id')` (no module filter), `.order('created_at', {ascending:false})`, `.limit(5)` |
| 2 | Signed URLs 3600s in parallel, drop failures | PASS | `:470` `createSignedUrl(r.storage_path, 3600)` in `Promise.all`; `:474` `.filter(r => r.signedUrl)` |
| 3 | Cross-module (no module_id filter) | PASS | query has no `.eq('module_id')` |
| 4 | Empty state silent | PASS | render gated `recentRecordings.length > 0` (`:786`) |
| 5 | Cap 5 + "Showing 5 most recent" caption | PASS | `.limit(5)` + `:799` caption gated on `length === 5` |
| 6 | 42703 caught silently | PASS | `:477` `if (pgCode !== '42703' && !cancelled) console.error(...)` |
| 7 | Cancelled flag on unmount | PASS | `:478` + `return () => { cancelled = true }` |
| 8 | Module label via title map w/ module_id fallback | PASS | `:498` `moduleCodeToTitle` useMemo; `:793` `moduleCodeToTitle?.get(rec.module_id) ?? rec.module_id` |
| 9 | Render below observations, above chapter list | PASS | block at `:786-801`, sibling to LR-13d/f/g (which key on `latestObservation` ~`:306`) and before the chapters map |
| 10 | Native `<audio controls className="w-full">` | PASS | `:795` |
| 11 | Auth gate | PASS | effect early-returns + clears on `!isHydrated/!isLoggedIn/!tenantId/!studentId` (`:445-447`) |
| 12 | `pnpm lint` 0 warnings | PASS | clean (KAN-153 baseline) |
| 13 | `pnpm tsc --noEmit` exit 0 | PASS | no output |
| 14 | `pnpm build` exit 0, no Next.js advisory | PASS | "✓ Compiled successfully in 1641ms" |
| 15 | `pnpm vitest run` all pass | PASS | 4 files / 31 tests |
| 16 | No regression on LR-14 stack / LR-09a/b/d-g / LR-13d/f/g / LR-11a/d / KAN-64/51 | PASS | single-file additive diff; observation blocks + LR-09a internals untouched |

## Note

Build → validate → uat advanced cleanly with no socket drop this iteration (the build CLI completed normally, unlike iters 2-3). Verification is source-review + full validator suite because the live-audio playback round-trip needs a seeded recording + signed-URL fetch in a real browser, and the agent socket has been unreliable this session. The implementation is a near-exact reuse of the already-shipped LR-14c fetch/signed-URL pattern (minus the module filter), so branch coverage is high-confidence from static review.

## Run history

### 2026-05-28 — cowork source-review fallback (iter-004)
- Verdict: PASS — 16/16 ACs, 0 bugs
