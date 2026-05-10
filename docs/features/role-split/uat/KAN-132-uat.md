---
id: KAN-132-uat
parent: KAN-132
buildloop_iteration: 2
feature: role-split
final_verdict: PASS
type: uat-run
status: pass
priority: medium
related: KAN-136
updated: 2026-05-10
run_by: padi-uat-agent
---

# UAT Run — KAN-132 (Role-neutral copy pass on shared `/teacher/*` surfaces)

**BuildLoop iteration:** 2
**Branch under test:** `buildloop/kan-132-role-neutral-copy`
**Source documents reviewed:**
- `.buildloop/iterations/002/feature-refined.md`
- `.buildloop/iterations/002/eng-brief.md`
- `.buildloop/iterations/002/build-summary.md`
- `docs/features/role-split/kan-132-copy-role-neutral-pass-uat.md` (paired KAN-136)

**Methodology:** source-of-truth review (read each diffed file, validated each substitution against the build-summary table, grep'd for residual offending phrases, verified intentionally-skipped paths were untouched, ran the test suite, spot-checked logged-out HTML on `/teacher` and `/teacher/curriculum`). Live parent vs teacher account testing was unavailable — same fallback pattern as iter 1's SIGNIN-2 UAT.

---

Verdict: PASS

---

## Scenario results

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Happy Path — parent sees role-aware copy on shared `/teacher/*` surfaces | ✅ | — | — |
| AC-02 | Happy Path — teacher copy identical to `main` (visual diff = 0) | ✅ | — | — |
| AC-03 | Empty state — parent w/ zero students sees "To add your child, Start Teaching." | ✅ | — | — |
| AC-04 | Logged-out — copy unchanged from `main` (teacher-default) | ✅ | — | — |
| AC-05 | Pre-hydration — teacher copy renders, parents transition in one render pass | ✅ | — | — |
| AC-06 | Unknown role — teacher copy renders (defensive; `useAuth` coerces to null) | ✅ | — | — |
| AC-07 | Build-summary "Intentionally skipped" list matches diff (no scope creep) | ✅ | — | — |
| AC-08 | Tests — `lib/copy/roleCopy.test.ts` and `components/__tests__/role-copy.test.tsx` cover both roles + null path | ✅ | — | — |
| FINDING-01 | AddStudentModal sub-heading "Create a new student…" not role-aware | 🐛 | `docs/features/role-split/bugs/KAN-132-bug-add-student-modal-subheading.md` | P2 |

**Summary:** ✅ 8 / ❌ 0 / 🐛 1 / ⏸️ 0 / ⬜ 0

---

## Detailed observations

### AC-01 — Parent copy substitutions (PASS)

Verified each substitution against the build-summary table by reading the file at the line in question. All 11 enumerated substitutions in the build-summary "Substitution table actually used" are present and use `rolePhrase(role, '<teacher>', '<parent>')`:

| Surface | Verified |
|---|---|
| `EmptyStateStartTeachingCTA.tsx:11` body | ✓ |
| `AddStudentModal.tsx:24` heading | ✓ |
| `AddStudentModal.tsx:25` submit button | ✓ |
| `AddStudentModal.tsx:26` close aria-label | ✓ |
| `StartTeachingWizard.tsx:30-34` intro paragraph | ✓ |
| `StartTeachingWizard.tsx:35` step 1 indicator label | ✓ |
| `StartTeachingWizard.tsx:121` step 1 heading | ✓ |
| `StartTeachingWizard.tsx:122-126` step 1 subheading | ✓ |
| `StartTeachingWizard.tsx:127` step 1 submit button | ✓ |
| `app/teacher/curriculum/.../page.tsx:104` Add Student dropdown | ✓ |
| `app/teacher/curriculum/.../page.tsx:644` logged-out preview body | ✓ |

Forbidden-phrase grep on parent-reachable surfaces (`app/teacher/**`, `components/**`):
- "your students" — only remaining instance is the substituted teacher branch in `EmptyStateStartTeachingCTA` and `StartTeachingWizard.tsx:121,124` (parent gets "your child" / "your child to start their lessons").
- "your class" — gone from rendered parent path.
- "classroom" — only in `TeachingModeToggle.tsx:14` (toggle is hidden for parents per KAN-131; explicitly out-of-scope) and the teacher branch of `StartTeachingWizard.tsx:32`.
- "roster" — only in `app/teacher/page.tsx:243` (logged-out preview, out-of-scope) and `/teacher/grouping/` (out-of-scope, parents shouldn't reach it; tab-hide is a separate ticket).
- "cohort" — only in `TeachingModeToggle.tsx:8` (parent-hidden, out-of-scope).
- "Add Student" button text — every parent-reachable instance is `rolePhrase(role, 'Add Student', 'Add Child')`. The remaining bare "Add Student" hit is `app/teacher/page.tsx:178` which is the logged-out preview button (out-of-scope per AC).

### AC-02 — Teacher copy unchanged (PASS)

`git diff main..HEAD` shows every substitution preserves the original teacher string verbatim in the first arg of `rolePhrase()`. Smart-quote check: original used HTML entities like `&rsquo;` ("Let&rsquo;s set up your classroom…"); the new code uses the rendered Unicode glyph `’` ("Let's set up your classroom…") — the rendered HTML output is identical, only the source-code style differs. No visible diff for teachers.

`app/teacher/__tests__/role-gating.test.tsx` (KAN-135 followup regression) still passes 6/6 — confirms the teacher landing surface is unchanged.

### AC-03 — Empty state (PASS)

`EmptyStateStartTeachingCTA` renders parent copy "To add your child, Start Teaching." when role is parent. Verified by `components/__tests__/role-copy.test.tsx:89-93`. Spot-checked the rendering path: the only consumer is `app/teacher/page.tsx` empty-state branch (zero students for a parent).

### AC-04 — Logged-out preview (PASS)

For unauthenticated visitors, `useAuth().role` returns `null`. `rolePhrase(null, teacher, parent)` returns the teacher value by design. Verified:
- `curl http://localhost:3000/teacher` HTML contains "Add Student", "your roster", "cohort" — all teacher-default strings on the logged-out preview, identical to `main`.
- `curl http://localhost:3000/teacher/curriculum/.../[module]` renders 200 with the substitution-call wired but defaulting to teacher copy.
- `curl http://localhost:3000/` returns 200.

### AC-05 — Pre-hydration (PASS)

`role === null` (the pre-hydration value) maps to teacher in `rolePhrase`. No `isHydrated` check is needed at any call site, because the helper's null-fallthrough achieves the same effect. Hydration transition for parents: a single React re-render swaps to the parent value once `useAuth` populates `role`. No risk of teacher → parent flash for teacher accounts (they get teacher both pre- and post-hydration).

The roleCopy.test.ts pre-hydration unit test and the AddStudentModal "falls through to teacher copy when role is null (pre-hydration)" component test confirm this branch works.

### AC-06 — Unknown role (PASS, defensive)

Per `lib/auth-store.tsx`, `useAuth()` coerces unknown role values to `null`. `rolePhrase(null, …)` returns teacher copy. So an "unknown role" can never reach `rolePhrase` directly — it always arrives as null. This is consistent with the brief's note that the unknown-role branch is defensive only.

The eng-brief mentions adding a `console.warn` once on mount for unknown roles to match the KAN-131 / KAN-135 pattern. The shared components in this iteration (`AddStudentModal`, `EmptyStateStartTeachingCTA`, `StartTeachingWizard`, lesson page) do NOT add such a warn. This is consistent with the brief's caveat ("`useAuth()` already coerces unknown role values to `null` per `lib/auth-store.tsx:88` — so a true 'unknown role' branch may never fire. Add the `console.warn` for parity with KAN-131 / KAN-135 pattern but mark as defensive"). The page-level warns at `app/teacher/page.tsx:55-59` and `app/teacher/curriculum/page.tsx:67-72` are still in place from the prior tickets and continue to fire — that's the role-gating pattern.

This is a marginal interpretation: the brief said "add the warn for parity," and these new files don't. Logged as a finding-not-failure because (a) the brief itself flagged it as defensive-only / never-fires, and (b) the page-level warns from KAN-131/135 already cover the user's experience.

### AC-07 — Out-of-scope items untouched (PASS)

Confirmed via `git diff main` (empty) for each:
- `app/teacher/grouping/` — untouched ✓
- `app/teacher/resources/` — untouched ✓
- `components/TeachingModeToggle.tsx` — untouched ✓
- `app/welcome/role/` — untouched ✓
- `components/auth/SignInModal.tsx` — untouched ✓
- `app/students/page.tsx` — untouched ✓
- `lib/demo/demoCurriculum.ts` — untouched ✓
- `lib/auth-store.tsx` — untouched ✓
- `lib/teachingModeContext.tsx` — untouched ✓
- `app/teacher/page.tsx` — untouched (parent gating from KAN-131 + KAN-135-followup already in place at lines 52, 278-280, 291) ✓
- `middleware.ts` — does not exist (correctly not created) ✓
- "Add students in Step 1 first." (`StartTeachingWizard.tsx:459`) — left as teacher-default per intentionally-skipped list ✓
- AddStudentModal error toast (`:74`), Wizard error toasts (`:159, :172`) — left as teacher-default per intentionally-skipped list ✓
- "X student(s) added" pluralization (`StartTeachingWizard.tsx:232`) — left untouched per intentionally-skipped list ✓

No scope creep observed.

### AC-08 — Tests (PASS)

`pnpm vitest run` — 18/18 pass:
- `lib/copy/roleCopy.test.ts` — 4 unit tests (parent / teacher / null / type-preservation).
- `components/__tests__/role-copy.test.tsx` — 8 component tests covering AddStudentModal, EmptyStateStartTeachingCTA, StartTeachingWizard for both roles and null.
- `app/teacher/__tests__/role-gating.test.tsx` — 6 KAN-135-followup tests still green (no regression).

`vitest.config.ts` correctly extended `include` to pick up `components/**/__tests__/**/*.test.{ts,tsx}` — verified the new tests actually execute.

---

### FINDING-01 — AddStudentModal sub-heading not role-aware (P2 bug)

`components/AddStudentModal.tsx:117` renders `"Create a new student to start tracking progress."` with no role substitution. For a parent, the modal reads:

```
Add child
Create a new student to start tracking progress.
```

The sub-heading still says "student" while the heading says "child" — voice mismatch on a parent-reachable surface. The string is NOT in the build-summary's "Intentionally skipped" list and NOT in the eng-brief's enumerated substitution lines (the brief only cited lines 67/103/109/146 of this file). Appears overlooked rather than deliberately deferred.

**Why this is a 🐛 not a ❌:**
- The strict AC gates on the forbidden-phrase list (`your students | your class | classroom | roster | cohort`); the bare word "student" is not on that list.
- All other substitutions in this iteration are correct; the iteration's stated scope ("substitution table actually used" in build-summary) is fully delivered.
- The defect is contained, the same `rolePhrase` pattern is one-line away from a fix.

Bug filed: `docs/features/role-split/bugs/KAN-132-bug-add-student-modal-subheading.md` (severity P2).

---

## Notes for padi-eng

- **Quick follow-up fix (P2 bug):** Apply `rolePhrase` to `components/AddStudentModal.tsx:117` to swap "Create a new student to start tracking progress." → "Add your child to start tracking progress." for parents. Same pattern as the heading/button on lines 24-26.
- The two follow-ups already noted in build-summary §"Out-of-scope follow-ups suggested" are valid:
  1. Hide `/teacher/grouping` tab for parents — separate role-split ticket.
  2. Skip wizard step 2 for parents — quality-of-life follow-up; today parents reach a "Create Groups" step that has no parent affordance.
- `vitest.config.ts:include` was extended in this iteration to pick up `components/**/__tests__/**`. This is now the canonical place for component-level tests; future tickets should follow that path.

## Notes for padi-design

- The wizard intro for parents — "Let's set up Padi for your child. This takes about 2 minutes." — reads naturally; "your child" (not "your child's") matches a designer's preferred voice.
- Step 1 subheading for parents — "Add your child to start their lessons. You can update this later." — also reads cleanly.
- The AddStudentModal subheading inconsistency (FINDING-01) is the only voice issue worth a design-side review when filed.
- Every parent variant uses singular "your child" — no design need to reconsider plural/multi-child support in this surface (pluralization is a separate scope per parent-onboarding work).

## Missing from ticket

- The eng-brief enumerated AddStudentModal hits at lines 67/103/109/146 but missed line 117. The build-summary's "Intentionally skipped" list also omitted it. This is a gap in the iteration's substitution audit. Recommend: when KAN-132's follow-up bug is fixed, also pattern-match every other modal/page for `<h2>` or `<h3>` followed by `<p>` description text, since these "subheading under heading" pairs are a known blind spot.
- The brief's "unknown role: emit single console.warn per page mount" guidance was not implemented in the shared components touched in this iteration. The brief itself flagged this as defensive-only (`useAuth` coerces unknown role to null), so the omission is acceptable — but the brief should be updated to explicitly NOT require the warn in shared components, or the components should add it. As-is, eng and UAT could disagree on whether this is a miss. Recommend tightening the brief on future copy tickets.

---

## Run history

### 2026-05-10 — padi-uat-agent (BuildLoop iter 2)
- Verdict: PASS
- Scenarios: ✅ 8 / ❌ 0 / 🐛 1 / ⏸️ 0
- Method: source-of-truth review + test execution + logged-out HTML spot-check (live parent/teacher accounts unavailable; same fallback as SIGNIN-2 iter 1)
- Tests: `pnpm vitest run` → 18/18 pass (4 helper unit + 8 KAN-132 component + 6 KAN-135-followup regression)
- Dev server: `http://localhost:3000` returns 200 on `/`, `/teacher`, `/teacher/curriculum/sensorial/visual/intro-001`
- Bug filed: `docs/features/role-split/bugs/KAN-132-bug-add-student-modal-subheading.md` (P2)
- Notes for padi-eng: see "Notes for padi-eng" above.
- Notes for padi-design: see "Notes for padi-design" above.
- Missing from ticket: see "Missing from ticket" above.
