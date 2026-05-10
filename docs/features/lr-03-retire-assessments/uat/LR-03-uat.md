---
id: LR-03-uat
parent: LR-03
type: uat
status: pass
created: 2026-05-10
updated: 2026-05-10
round: 2
prior_round: docs/features/lr-03-retire-assessments/uat/LR-03-uat-1-fail.md
---

# LR-03 UAT (round 2) — Retire /teacher/assessments

Re-run after eng_fix attempt 1 against round-1 P1 bug `kan-139-redirect-target-404`. The fix changed the redirect target in `app/teacher/assessments/page.tsx` from `/teacher/start-teaching` (404) to `/teacher` (200). No other source changes vs round 1 — tab removal, matcher cleanup, inbound-sweep cleanliness, and sibling-route regression checks were already green in round 1 and are re-verified here.

Tested against http://localhost:3000 (dev server on port 3000, per task notes).

## Results

### AC1 — Redirect 308 with correct Location  ✅ PASS
- `curl -sI http://localhost:3000/teacher/assessments`
- Status: `HTTP/1.1 308 Permanent Redirect`
- `location: /teacher`
- Change vs round 1: Location header is now `/teacher` (was `/teacher/start-teaching`). The refined ticket text specified `/teacher/start-teaching` but that route does not exist; eng_fix correctly chose `/teacher`, which is the canonical activation surface used by the in-app "Start Teaching" CTA in `components/TopNav.tsx:61` (`<Link href="/teacher">`). The intent of the AC ("redirect to the activation surface") is preserved.

### AC2 — Following the redirect lands cleanly  ✅ PASS (was FAIL in round 1)
- `curl -sL -o /dev/null -w "%{url_effective} %{http_code}\n" http://localhost:3000/teacher/assessments`
- Final URL: `http://localhost:3000/teacher`
- HTTP code: `200`
- Body renders the real activation surface (logged-out preview):
  - `<h2>Start teaching</h2>`
  - `<h3>See what your child will learn</h3>`, `<h3>Track how they're progressing</h3>`, `<h3>Know if they're ready for school</h3>`
  - `<h3>Students (preview)</h3>` + "Demo data" amber badge — confirms preview/logged-out mode renders cleanly without crashing.
- No 404 UI is shown to the user. (The literal string `Page not found` appears exactly once in the RSC payload of `/teacher`, but it also appears in `/teacher/curriculum` and `/` — it's the serialized `not-found.tsx` boundary that ships with every App Router page, not visible content.)

### AC3 — Tab removed (4 tabs, no Assessments)  ✅ PASS
- Tab-label scan of `/teacher/curriculum` rendered HTML:
  - `About Method`: 1
  - `Curriculum`: 1
  - `Grouping & Progress`: 1 (rendered as `Grouping &amp; Progress`)
  - `Resources`: 1
  - `Assessments`: 0
- `app/teacher/layout.tsx` lines 8–13: `tabs` array contains exactly the 4 non-assessments entries.
- `app/teacher/layout.tsx` lines 18–23: `isDashboardView` no longer contains a `startsWith('/teacher/assessments')` branch.

### AC4 — Mobile 375×667 no horizontal scroll  ✅ PASS (code-level inferred)
- `app/teacher/layout.tsx:51`: `<div className="flex flex-wrap gap-2">`. `flex-wrap` wraps overflowing pills to a second row rather than triggering horizontal scroll. The same container previously held 5 tabs (the prior root cause that motivated LR-03); dropping one tab can only relax the constraint.
- No real-browser viewport check available from this agent — recommend a human spot-check at 375×667 before final close-out, though the code pattern guarantees the constraint can't regress.

### AC5 — Active-state matcher still works  ✅ PASS
- `/teacher/curriculum` rendered HTML: 2 × `aria-current="page"` (the top-nav Teacher Dashboard button + the Curriculum pill).
- `/teacher/grouping` rendered HTML: 2 × `aria-current="page"` — the "Grouping & Progress" pill carries `class="...border-blue-600 bg-blue-50 text-blue-700 font-semibold..." aria-current="page" href="/teacher/grouping"`.
- `components/TopNav.tsx` lines 20–25: `isDashboardActive` matches `dashboard|curriculum|about|grouping|resources` and no longer contains the `assessments` branch. Active-state still highlights correctly for all 4 remaining tabs.

### AC6 — No inbound references  ✅ PASS
- `grep -rEn "teacher/assessments|/teacher/assessments" app components lib` → **no matches**. (The redirect page `app/teacher/assessments/page.tsx` calls `permanentRedirect("/teacher")` and does not contain the substring `teacher/assessments`.)

### AC7 — No regression on sibling routes  ✅ PASS
- `/teacher` → 200
- `/teacher/curriculum` → 200
- `/teacher/grouping` → 200
- `/teacher/resources` → 200
- `/teacher/about` → 200

## Summary

| AC | Result | Bug | Δ vs round 1 |
|----|--------|-----|--------------|
| AC1 Redirect 308 | ✅ | — | Location updated to `/teacher` (was `/teacher/start-teaching`) |
| AC2 Redirect lands cleanly | ✅ | — (kan-139 fixed) | Was ❌ 404; now ✅ 200 with real activation surface |
| AC3 Tab removed | ✅ | — | unchanged |
| AC4 Mobile 375×667 | ✅ (inferred from source) | — | unchanged |
| AC5 Active-state | ✅ | — | unchanged; also re-verified on `/teacher/grouping` |
| AC6 No inbound references | ✅ | — | unchanged |
| AC7 No regression | ✅ | — | unchanged |

## Run history

### 2026-05-10 — padi-uat-agent (round 1)
- Verdict: FAIL
- AC2 broke: redirect target `/teacher/start-teaching` was a non-existent route → 404. Bug filed as `docs/features/lr-03-retire-assessments/bugs/kan-139-redirect-target-404.md` (P1).
- See `docs/features/lr-03-retire-assessments/uat/LR-03-uat-1-fail.md` for full round-1 details.

### 2026-05-10 — padi-uat-agent (round 2, after eng_fix attempt 1)
- Verdict: **PASS**
- ACs: ✅ 7 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | AC | Status | Bug file | Severity |
  |---|----|--------|----------|----------|
  | AC1 | Redirect 308 | ✅ | — | — |
  | AC2 | Redirect lands cleanly | ✅ | kan-139 (fixed) | P1 (closed) |
  | AC3 | Tab removed | ✅ | — | — |
  | AC4 | Mobile 375×667 | ✅ (inferred from source; no browser harness) | — | — |
  | AC5 | Active-state | ✅ | — | — |
  | AC6 | No inbound references | ✅ | — | — |
  | AC7 | No regression | ✅ | — | — |
- Notes for padi-eng: redirect target is `/teacher` (not `/teacher/start-teaching` as the refined ticket text said). This was the only correct option — `/teacher/start-teaching` has no `page.tsx` and 404s. `/teacher` is the canonical activation surface and matches `TopNav.tsx:61`'s "Start Teaching" CTA link. Consider deleting the empty `app/teacher/start-teaching/` directory (it only contains a `students/` dynamic subroute and is misleading) or moving its contents — out of scope for LR-03 but worth tracking.
- Notes for padi-design: none — routing-only change; visible nav (4 tabs, active highlight) is correct.
- Missing from ticket: the refined ticket named `/teacher/start-teaching` as the redirect target but that route doesn't exist; this should have been caught in spec review. AC2 still uses the phrase "logged-out preview mode supported" — that's verified (the destination renders preview content), but tightening the AC to "destination returns HTTP 200" would make the contract unambiguous. Also worth adding a follow-up cleanup ticket for the orphan `app/teacher/start-teaching/` directory.

Verdict: PASS
