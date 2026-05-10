---
id: LR-06-UAT
parent: LR-06
title: UAT — role-aware nav (Start Teaching → Start Lesson, hide Grouping for parent)
status: passed
updated: 2026-05-10
---

# LR-06 UAT — role-aware nav

Tested against `http://localhost:3000` plus targeted code review for the parent
variant (no seed parent account is available in this environment, so the parent
UI was verified by exercising `rolePhrase` and the layout filter directly).

## Scope under test

- `components/TopNav.tsx` — pulls `role` from `useAuth()` and wraps the "Start
  Teaching" link text in `rolePhrase(role, 'Start Teaching', 'Start Lesson')`.
- `app/teacher/layout.tsx` — pulls `role` from `useAuth()`, renames `tabs` to
  `allTabs`, and filters the `grouping` tab out when `role === 'parent'`.

`git status` confirms only those two files are modified:

```
 M app/teacher/layout.tsx
 M components/TopNav.tsx
```

## Scenario results

### UAT-01 — Teacher / logged-out baseline (AC1, AC3, AC4)

- Status: PASS
- TopNav on `/` renders "Start Teaching" (not "Start Lesson").
  - Evidence: `curl -s http://localhost:3000/ | grep -oE "Start Teaching|Start Lesson"` →
    only `Start Teaching` matches (5 occurrences, no `Start Lesson`).
- Teacher dashboard at `/teacher/curriculum` renders all 4 tabs.
  - Evidence: `curl -s http://localhost:3000/teacher/curriculum | grep -oE "About Method|Grouping &amp; Progress|Curriculum|Resources" | sort -u`
    returns `About Method`, `Curriculum`, `Grouping & Progress`, `Resources`.
- Teacher tab list, computed from the actual `allTabs` array with `role === 'teacher'`,
  resolves to: `About Method, Curriculum, Grouping & Progress, Resources`.

### UAT-02 — Parent variant (AC2, code review)

- Status: PASS (via code review — no seed parent account exists)
- `rolePhrase` outputs verified by executing
  `lib/copy/roleCopy.ts` against all three role values:
  - `rolePhrase(null, 'Start Teaching', 'Start Lesson')` → `"Start Teaching"` ✅
  - `rolePhrase('teacher', 'Start Teaching', 'Start Lesson')` → `"Start Teaching"` ✅
  - `rolePhrase('parent', 'Start Teaching', 'Start Lesson')` → `"Start Lesson"` ✅
- Layout filter verified the same way: with `role === 'parent'`,
  `allTabs.filter((t) => t.id !== 'grouping')` resolves to
  `About Method, Curriculum, Resources` — i.e. only `grouping` is removed; the
  other three tabs remain in their original order.

### UAT-03 — Logged-out default returns the teacher phrasing (AC3)

- Status: PASS
- `curl -s http://localhost:3000 | grep -E "Start Teaching|Start Lesson"`
  matches `Start Teaching` (count = 5). `Start Lesson` does not appear in the
  logged-out homepage HTML. This matches the KAN-132 anti-flash contract in
  `rolePhrase` (null → teacher copy).

### UAT-04 — No regression to other TopNav buttons (AC5)

- Status: PASS
- `curl -s http://localhost:3000/` confirms TopNav still renders the `Curriculum`
  link, the `Start Teaching` CTA, and the `Sign In` button (logged-out state).
  No other TopNav element was touched in this diff.

### UAT-05 — No regression to non-grouping teacher tabs (AC4)

- Status: PASS
- Logged-out teacher dashboard HTML still contains `About Method`, `Curriculum`,
  `Grouping & Progress`, and `Resources` (see UAT-01 evidence). For the parent
  role, the filter removes `grouping` only — `About Method`, `Curriculum`, and
  `Resources` survive in their original order (see UAT-02 evidence).

### UAT-06 — Mobile 375×667 (AC6)

- Status: PASS (logical / not blocked)
- "Start Lesson" (12 chars) is strictly shorter than "Start Teaching" (14 chars),
  so the parent variant cannot overflow any layout that already accommodates
  the teacher copy. The teacher copy is verified rendering at 375×667 from
  prior launch-readiness work; this change does not alter the surrounding
  TopNav structure or styles.
- The parent variant additionally drops one tab from the teacher dashboard pill
  row, reducing horizontal pressure rather than adding it.

### UAT-07 — No auth-store changes (AC7)

- Status: PASS
- `git diff lib/auth-store.tsx` returns empty. Only `app/teacher/layout.tsx`
  and `components/TopNav.tsx` are modified.

## Additional checks

- `pnpm lint` → clean, no errors or warnings.
- Hydration safety: `useAuth().role` is `null` before hydration; both call sites
  fall through to the teacher branch via `rolePhrase` (null → teacher) and via
  `role === 'parent'` evaluating false on the layout filter. No teacher → parent
  text flash possible.

## Verdict

PASS — all 7 ACs satisfied.

## Run history

### 2026-05-10 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 7 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Teacher / logged-out baseline | ✅ | — | — |
  | UAT-02 | Parent variant (code review) | ✅ | — | — |
  | UAT-03 | Logged-out default = teacher copy | ✅ | — | — |
  | UAT-04 | No regression to other TopNav buttons | ✅ | — | — |
  | UAT-05 | No regression to non-grouping teacher tabs | ✅ | — | — |
  | UAT-06 | Mobile 375×667 | ✅ | — | — |
  | UAT-07 | No auth-store changes | ✅ | — | — |
- Notes for padi-eng: Implementation is minimal and correct. `rolePhrase` is
  reused (good), the layout filter is a single-line predicate, and both call
  sites lean on the existing `useAuth()` contract. No follow-up needed.
- Notes for padi-design: "Start Lesson" is shorter than "Start Teaching" — the
  parent CTA may visually look slightly less prominent in the gradient pill;
  worth a glance once a parent account exists for real-browser verification,
  but no design change is requested by this UAT.
- Missing from ticket: No seed parent account was available to perform a live
  browser test of the parent variant. The parent-side ACs were satisfied by
  code review of `rolePhrase` and the layout filter, as the ticket explicitly
  permitted. Recommend adding a seeded parent account (or a documented way to
  flip a test user's role to `parent` in dev) before the next role-gated UAT.

Verdict: PASS
