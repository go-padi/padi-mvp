---
id: LR-07-uat-1
title: "UAT — Hide /teacher/resources for v1 (path B)"
type: uat
parent: LR-07
feature: lr-07-resources-hide
status: pass
buildloop_iteration: 8
buildloop_loop_id: 2026-05-10T15:58:14Z-f90e
created: 2026-05-10
updated: 2026-05-10
ran_by: padi-uat-agent
---

## Scope

Verify that `/teacher/resources` is removed from the v1 launch surface via a `permanentRedirect` to `/teacher/curriculum`, and that the corresponding tab is gone from the teacher and parent dashboard tab bars without breaking the remaining surfaces.

## Preconditions

- Dev server running at `http://localhost:3000`.
- BuildLoop iteration 8 changes applied to:
  - `app/teacher/resources/page.tsx`
  - `app/teacher/layout.tsx`
  - `components/TopNav.tsx`

## Scenarios

### UAT-01 — `/teacher/resources` returns a 308 permanent redirect to `/teacher/curriculum`

- Given the dev server is running
- When I `curl -sI http://localhost:3000/teacher/resources`
- Then the response is `308 Permanent Redirect` with header `location: /teacher/curriculum`

Status: PASS

Evidence:
```
HTTP/1.1 308 Permanent Redirect
location: /teacher/curriculum
```

### UAT-02 — Following the redirect lands on `/teacher/curriculum` (200)

- Given the dev server is running
- When I `curl -sIL http://localhost:3000/teacher/resources`
- Then the chain ends with a `200 OK` from `/teacher/curriculum`

Status: PASS

Evidence: second response in the chain is `HTTP/1.1 200 OK`.

### UAT-03 — Teacher dashboard tab bar shows exactly 3 tabs (About Method, Curriculum, Grouping & Progress); no Resources

- Given I load `/teacher/curriculum` (teacher role, default)
- When I scan the rendered HTML for tab labels
- Then I see `About Method`, `Curriculum`, `Grouping & Progress` (HTML-encoded `&amp;`) and NO `Resources` label

Status: PASS

Evidence:
- Rendered tab labels grepped from HTML: `About Method`, `Curriculum`, `Grouping &amp; Progress` (3 unique matches; no `Resources`).
- `allTabs` in `app/teacher/layout.tsx` lines 8–12 contains exactly `about`, `curriculum`, `grouping`.
- Rendered teacher hrefs from `/teacher/curriculum`: `/teacher/about`, `/teacher/curriculum`, `/teacher/grouping` only.

### UAT-04 — Parent dashboard tab bar shows 2 tabs (About Method, Curriculum)

- Given a user with `role === 'parent'` (from LR-06 filter)
- When the layout computes `tabs = role === 'parent' ? allTabs.filter((t) => t.id !== 'grouping') : allTabs`
- Then the parent sees only `About Method` and `Curriculum` (Resources is gone via this ticket; Grouping is gone via LR-06)

Status: PASS

Evidence:
- `app/teacher/layout.tsx` line 17: `const tabs = role === 'parent' ? allTabs.filter((t) => t.id !== 'grouping') : allTabs;`
- With Resources already removed from `allTabs`, the parent's filtered set is `[about, curriculum]` — 2 tabs.
- Verified via code path; browser-side verification gated behind authenticated parent session and not required by the AC.

### UAT-05 — No code references to `teacher/resources` remain outside the redirect file path

- Given the implementation
- When I run `grep -rEn 'teacher/resources' app components lib`
- Then the grep returns no content matches (exit code 1), and only the file path `app/teacher/resources/page.tsx` exists on disk

Status: PASS

Evidence:
- `grep -rEn 'teacher/resources' /Users/nishaiyer/Desktop/padi-app/padi-app-starter/app /Users/nishaiyer/Desktop/padi-app/padi-app-starter/components /Users/nishaiyer/Desktop/padi-app/padi-app-starter/lib` → EXIT=1 (no matches).
- `find app/teacher/resources -type f` → `app/teacher/resources/page.tsx` (5-line redirect stub).
- Note: The AC phrasing "only the redirect file path matches" is satisfied — the file path is the only artifact in the codebase mentioning `teacher/resources`; no source line contains the string.

### UAT-06 — TopNav `Curriculum` active state still triggers on `/teacher/curriculum`, `/teacher/about`, `/teacher/grouping`

- Given the TopNav `isDashboardActive` predicate
- When the user is on `/teacher/curriculum`, `/teacher/about`, or `/teacher/grouping`
- Then the Curriculum nav button receives the active styling (`bg-gray-100 text-gray-900 ring-2 ring-offset-2 ring-blue-200`)

Status: PASS

Evidence:
- `components/TopNav.tsx` lines 16–19:
  ```
  const isDashboardActive =
    isMatch('/teacher/curriculum') ||
    isMatch('/teacher/about') ||
    isMatch('/teacher/grouping');
  ```
- `isMatch('/teacher/resources')` is no longer present (line removed per refined ticket).
- All three remaining surfaces return 200 (UAT-08).

### UAT-07 — Mobile 375×667: remaining tabs fit without horizontal scroll

- Given 3 tabs rendered in a `flex flex-wrap gap-2` container
- When viewed at 375px width
- Then tabs wrap onto a second row rather than producing a horizontal scrollbar

Status: PASS

Evidence:
- Container class: `flex flex-wrap gap-2` (`app/teacher/layout.tsx` line 49) — `flex-wrap` guarantees no horizontal overflow.
- Tab labels are short: `About Method` (11ch), `Curriculum` (10ch), `Grouping & Progress` (19ch). Even worst-case at 375px viewport with `px-4 py-2` rounded-full pills, the longest two combined fit on one row and the third wraps naturally; no `whitespace-nowrap` on the container.
- No regression from prior 4-tab state (which also relied on `flex-wrap`).

### UAT-08 — No regression on `/teacher/curriculum`, `/teacher/about`, `/teacher/grouping`

- Given the dev server is running
- When I `curl -sI` each of the three remaining teacher routes
- Then each returns `200 OK`

Status: PASS

Evidence:
- `/teacher/curriculum` → 200 OK
- `/teacher/about` → 200 OK
- `/teacher/grouping` → 200 OK

## Run history

### 2026-05-10 — padi-uat-agent (BuildLoop iter 8, final)
- Verdict: PASS
- Scenarios: 8 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | 308 redirect with correct Location header | PASS | — | — |
  | UAT-02 | Redirect chain ends at /teacher/curriculum (200) | PASS | — | — |
  | UAT-03 | Teacher tab bar: 3 tabs, no Resources | PASS | — | — |
  | UAT-04 | Parent tab bar: 2 tabs (About Method, Curriculum) | PASS | — | — |
  | UAT-05 | No source references to teacher/resources remain | PASS | — | — |
  | UAT-06 | TopNav Curriculum active state on remaining dashboards | PASS | — | — |
  | UAT-07 | Mobile 375×667: tabs wrap, no horizontal scroll | PASS | — | — |
  | UAT-08 | No regression on curriculum/about/grouping routes | PASS | — | — |
- Notes for padi-eng: Implementation is clean and surgical — exactly the 3 files specified, no collateral changes. `app/teacher/resources/page.tsx` is a 5-line `permanentRedirect` stub; layout and TopNav each lost exactly one clause. Suggest a follow-up cleanup ticket post-v1.1 to delete `docs/features/teacher-resources/` if that surface is permanently retired.
- Notes for padi-design: Tab bar drops from 4 to 3 (teacher) and from 3 to 2 (parent) — sparser than prior state. Already acknowledged in refined ticket spar notes as acceptable. No design states changed.
- Missing from ticket: None. ACs were precise and verifiable.

Verdict: PASS
