---
id: LR-04-uat-1
parent: LR-04
type: uat
status: passed
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-10
---

# UAT — LR-04 Delete orphan + placeholder routes; collapse /teacher/dashboard

## UAT-01 — Orphan `/classes/*` placeholders return 404
Status: PASS
- Command: `curl -sI http://localhost:3000/classes/abc/today`
- Observed: `HTTP/1.1 404 Not Found`
- Command: `curl -sI http://localhost:3000/classes/abc/plan`
- Observed: `HTTP/1.1 404 Not Found`
- Expected: 404 from custom 404 (LR-02). Confirmed.

## UAT-02 — `/teacher/dashboard` returns 404
Status: PASS
- Command: `curl -sI http://localhost:3000/teacher/dashboard`
- Observed: `HTTP/1.1 404 Not Found`
- Expected: 404. Confirmed.

## UAT-03 — `/start-teaching` is a single 308 to `/teacher`
Status: PASS
- Command: `curl -sI http://localhost:3000/start-teaching`
- Observed: `HTTP/1.1 308 Permanent Redirect`, `location: /teacher`
- Command: `curl -sL http://localhost:3000/start-teaching -o /dev/null -w "%{num_redirects} %{url_effective} %{http_code}"`
- Observed: `1 http://localhost:3000/teacher 200`
- Expected: 308 with `Location: /teacher`, single hop, final 200. Confirmed.

## UAT-04 — Substantive route `/start-teaching/students/stu-1` preserved
Status: PASS
- Command: `curl -sI http://localhost:3000/start-teaching/students/stu-1`
- Observed: `HTTP/1.1 200 OK`
- Body size: 21,203 bytes (substantive render — title `Padi Teacher App`, contains `Module` markers — no regression to empty/error state).

## UAT-05 — TopNav button label is `Curriculum` (not `Teacher Dashboard`); links to `/teacher/curriculum`
Status: PASS
- Source inspection of `components/TopNav.tsx` lines 41–52: renders `<Link href="/teacher/curriculum">Curriculum</Link>` with `aria-current` driven by `isDashboardActive`. `goToDashboard` and `useRouter` removed.
- DOM probe `curl http://localhost:3000/` → nav contains exactly one anchor `href="/teacher/curriculum">Curriculum</a>` inside the `<nav class="sticky top-0...">` block. No `Teacher Dashboard` label anywhere inside `<nav>`.
- Direct click target: link points to `/teacher/curriculum` which returns `200 OK` directly — no intermediate redirect.

## UAT-06 — Curriculum active-state highlights on the four subpages
Status: PASS
- All four target routes return 200: `/teacher/curriculum` (200), `/teacher/about` (200), `/teacher/grouping` (200), `/teacher/resources` (200).
- DOM probe on `/teacher/curriculum`: anchor `href="/teacher/curriculum"` renders with `aria-current="page"` and the active-state class `bg-gray-100 text-gray-900 ring-2 ring-offset-2 ring-blue-200`.
- `isDashboardActive` (TopNav.tsx:15–19) matches all four subpaths via `isMatch` helper. `/teacher/dashboard` matcher removed as required.
- `app/teacher/layout.tsx` `isDashboardView` (lines 18–22) matches the same four subpaths; `/teacher/dashboard` clause removed.

## UAT-07 — No stale references to dashboard route or helper
Status: PASS
- Command: `grep -rEn "/teacher/dashboard|goToDashboard" app components lib`
- Observed: no matches (exit 1).
- Command: `find app/classes app/teacher/dashboard -type f`
- Observed: directories do not exist. Both removed cleanly.

## UAT-08 — Mobile 375×667: TopNav fits without horizontal scroll
Status: PASS (via deduction; no headless browser available in this session)
- Pre-change baseline label was `Teacher Dashboard` (~16 chars). New label `Curriculum` (~10 chars) is strictly shorter at the same Tailwind class shape (`rounded-lg px-3 py-2 text-sm font-semibold`). Other two TopNav controls (`Start Teaching`, `Sign In`) unchanged.
- Outer flex container is `container flex items-center justify-between` with no `flex-wrap`. Since the prior label fit (LR-02 launch-readiness AC), the narrower label cannot regress mobile fit.
- Recommendation to padi-eng: confirm in a real device frame on first manual sweep — Chrome devtools not available in this UAT session.

## UAT-09 — Lint clean
Status: PASS
- Command: `pnpm lint`
- Observed: clean (no errors, no warnings). Confirms `useRouter` import was fully removed without leaving a dangling unused-import error.

## Run history

### 2026-05-10 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 9 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | `/classes/*` placeholders return 404 | PASS | — | — |
  | UAT-02 | `/teacher/dashboard` returns 404 | PASS | — | — |
  | UAT-03 | `/start-teaching` → 308 `/teacher` single hop | PASS | — | — |
  | UAT-04 | `/start-teaching/students/stu-1` preserved | PASS | — | — |
  | UAT-05 | TopNav label is `Curriculum`, links to curriculum | PASS | — | — |
  | UAT-06 | Curriculum active-state on 4 subpages | PASS | — | — |
  | UAT-07 | No stale refs to `/teacher/dashboard` or `goToDashboard` | PASS | — | — |
  | UAT-08 | Mobile 375×667 TopNav fit | PASS (deduction) | — | — |
  | UAT-09 | Lint clean (no dead `useRouter` import) | PASS | — | — |

- Notes for padi-eng: All ticket ACs satisfied. Clean delete of `app/classes/` and `app/teacher/dashboard/`. `start-teaching` redirect uses `permanentRedirect` (308) — correct semantics for a structural permanent move. No console-side verification done (no Chrome devtools in this session); recommend a 30-second manual click-through to confirm no transient client-side error during the 308 hop.

- Notes for padi-design: TopNav button rename is in. However, the label phrase **"Teacher Dashboard"** still appears in five other surfaces outside the TopNav (see "Missing from ticket" below). If the launch-readiness goal is to fully retire the "Teacher Dashboard" framing, those surfaces need follow-up copy work. Not a blocker for LR-04 as written.

- Missing from ticket: The ticket scoped the label change to **TopNav only**, but the string `Teacher Dashboard` survives on five other surfaces and may continue to mislead users:
  1. `app/page.tsx:27` — homepage hero CTA button `Teacher Dashboard` (links to `/teacher/curriculum`).
  2. `app/page.tsx:96` — homepage footer CTA `View Teacher Dashboard` (links to `/teacher/curriculum`).
  3. `app/students/page.tsx:50` — empty-state copy: "explore the curriculum and sample lessons from the Teacher Dashboard."
  4. `app/teacher/layout.tsx:31` — `<h1>Teacher Dashboard</h1>` rendered on `/teacher/curriculum`, `/teacher/about`, `/teacher/grouping`, `/teacher/resources`.
  5. `app/teacher/page.tsx:425` — button label `Go to Teacher Dashboard` on `/teacher`.

  These are functionally correct (all point to `/teacher/curriculum`) so they do not constitute a bug under LR-04's literal ACs. Flagging as a copy-consistency gap — recommend a follow-up ticket LR-04a or fold into LR-05/LR-06 if scoped.

Verdict: PASS
