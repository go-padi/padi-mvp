---
id: LR-03-uat-1
parent: LR-03
type: uat
status: fail
created: 2026-05-10
updated: 2026-05-10
---

# LR-03 UAT — Retire /teacher/assessments

Tested against http://localhost:3000 (dev server).

## Results

### AC1 — Redirect 308 with correct Location  ✅ PASS
- Command: `curl -sI http://localhost:3000/teacher/assessments`
- Status: `HTTP/1.1 308 Permanent Redirect`
- `location: /teacher/start-teaching`

### AC2 — Following the redirect lands cleanly  ❌ FAIL
- Command: `curl -sL -o /dev/null -w "%{url_effective} %{http_code}" http://localhost:3000/teacher/assessments`
- Actual: final URL `http://localhost:3000/teacher/start-teaching`, **HTTP 404 Not Found**.
- Expected: target renders (200).
- Root cause: `permanentRedirect("/teacher/start-teaching")` points at a non-existent route. `app/teacher/start-teaching/` contains only a `students/` subdir — no `page.tsx`. The real Start Teaching page lives at `/start-teaching` (top-level), which returns 200. `/teacher` also returns 200 and is what `TopNav.tsx` uses for the "Start Teaching" CTA (`<Link href="/teacher">`).
- Bug filed: `docs/features/lr-03-retire-assessments/bugs/kan-139-redirect-target-404.md` (P1)

### AC3 — Tab removed (4 tabs, no Assessments)  ✅ PASS
- Server-rendered HTML of `/teacher/curriculum` contains exactly 4 tab labels: `About Method`, `Curriculum`, `Grouping & Progress`, `Resources`. Zero occurrences of `Assessments`.
- `app/teacher/layout.tsx` lines 8–13 confirm the `tabs` array has only the 4 entries; `isDashboardView` (lines 18–23) no longer matches `/teacher/assessments`.
- `components/TopNav.tsx` lines 20–25 confirm `isDashboardActive` no longer matches `/teacher/assessments`.

### AC4 — Mobile 375×667 no horizontal scroll  ✅ PASS (code-level inferred)
- Could not drive a browser at a 375×667 viewport from this agent. Reviewed the implementation: the tab container is `<div className="flex flex-wrap gap-2">` (`app/teacher/layout.tsx` line 51). `flex-wrap` causes the 4 pills to wrap onto a second row rather than overflow horizontally. The previous 5-tab variant already used the same container and was the original constraint that motivated LR-03; dropping a tab can only relax that constraint, not violate it.
- **Recommend** a human spot-check at 375×667 before close-out if a real browser is available — this verdict is inferred from source, not observed.

### AC5 — Active-tab indicator still works  ✅ PASS
- `curl -sL http://localhost:3000/teacher/curriculum | grep -oE 'aria-current="page"'` returns 2 matches (the Teacher Dashboard top-nav button + the Curriculum pill).
- The Curriculum pill renders with `border-blue-600 bg-blue-50 text-blue-700 font-semibold` and `aria-current="page"`, confirming the active state.
- Active-state logic (`app/teacher/layout.tsx` line 53: `pathname === tab.href || pathname.startsWith(\`${tab.href}/\`)`) is unchanged — only the `tabs` array shrank, so `/teacher/grouping` will likewise highlight "Grouping & Progress". Did not re-verify `/teacher/grouping` independently as the mechanism is identical.

### AC6 — No inbound references  ✅ PASS
- `grep -rEn "teacher/assessments" app components lib` → no matches at all. (The redirect file `app/teacher/assessments/page.tsx` itself does not contain the substring `teacher/assessments`; it just calls `permanentRedirect("/teacher/start-teaching")`.)

### AC7 — No regression to other tabs  ✅ PASS
- `curl -sI http://localhost:3000/teacher/curriculum` → 200
- `curl -sI http://localhost:3000/teacher/grouping` → 200
- `curl -sI http://localhost:3000/teacher/resources` → 200
- `curl -sI http://localhost:3000/teacher/about` → 200

## Summary

| AC | Result | Bug |
|----|--------|-----|
| AC1 Redirect 308 | ✅ | — |
| AC2 Redirect lands cleanly | ❌ | KAN-139 |
| AC3 Tab removed | ✅ | — |
| AC4 Mobile 375×667 | ✅ (inferred) | — |
| AC5 Active-state | ✅ | — |
| AC6 No inbound references | ✅ | — |
| AC7 No regression | ✅ | — |

## Notes for padi-eng
- One-line fix in `app/teacher/assessments/page.tsx`: change `permanentRedirect("/teacher/start-teaching")` to `permanentRedirect("/teacher")`. `/teacher` is what `TopNav.tsx` already treats as the canonical Start Teaching destination (line 61), and it currently returns 200.
- Re-run the curl chain after the fix:
  ```
  curl -sL -o /dev/null -w "%{url_effective} %{http_code}\n" http://localhost:3000/teacher/assessments
  ```
  should print `http://localhost:3000/teacher 200`.
- Optional cleanup (out of scope for this ticket but worth noting): the `app/teacher/start-teaching/` folder exists with only a `students/` subdir. If `/teacher/start-teaching` is never intended as a route, the subfolder structure is misleading; consider moving `app/teacher/start-teaching/students/` to `app/teacher/students/` or adding a redirect page. File a separate ticket if pursuing.

## Missing from ticket
- AC4 specifies a viewport but no automated harness or screenshot path; in a headless agent run it's only verifiable by code inspection. Consider adding a Playwright check (or an explicit "skip if no browser available — eyeball at the spec'd viewport") to the AC.
- AC2 says "logged-out preview is acceptable; just no crash" but does not define "crash". A 404 page does not throw, yet it's clearly not the intended outcome. Tightening the AC to "destination returns HTTP 200" would have made this finding unambiguous.

## Run history

### 2026-05-10 — padi-uat-agent
- Verdict: FAIL
- ACs: ✅ 6 / ❌ 1 / 🐛 0 / ⏸️ 0
- Results:
  | # | AC | Status | Bug file | Severity |
  |---|----|--------|----------|----------|
  | AC1 | Redirect 308 | ✅ | — | — |
  | AC2 | Redirect lands cleanly | ❌ | docs/features/lr-03-retire-assessments/bugs/kan-139-redirect-target-404.md | P1 |
  | AC3 | Tab removed | ✅ | — | — |
  | AC4 | Mobile 375×667 | ✅ (inferred from source; no browser) | — | — |
  | AC5 | Active-state | ✅ | — | — |
  | AC6 | No inbound references | ✅ | — | — |
  | AC7 | No regression | ✅ | — | — |
- Notes for padi-eng: change `permanentRedirect("/teacher/start-teaching")` → `permanentRedirect("/teacher")` in `app/teacher/assessments/page.tsx`.
- Notes for padi-design: none — this is purely a routing bug, the visible nav (4 tabs, active state) is correct.
- Missing from ticket: AC4 not verifiable headlessly without a browser harness; AC2's "no crash" wording let a 404 destination slip through review.

Verdict: FAIL
