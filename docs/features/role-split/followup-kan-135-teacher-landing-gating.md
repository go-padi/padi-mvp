---
id: FOLLOWUP-teacher-landing-gating
title: "[Role-split] Extend parent gating to /teacher landing page"
type: story
feature: role-split
parent: KAN-127
related: KAN-131, KAN-135
priority: high
status: done
discovered_during: UAT KAN-135 (2026-04-21)
shipped_in: 051da35 (PR #5)
updated: 2026-05-10
---

### Goal
Propagate the parent/teacher role split from `/teacher/curriculum` (KAN-131) to the `/teacher` landing page so parents see a role-appropriate dashboard. Today, a signed-in parent on `/teacher` still sees the Individual/Group/Both toggle, an "Add Group" button, and GROUP-labeled student cards (e.g. the "iyers" card) — all teacher-mode affordances that should not appear for parents.

### Background
KAN-127 (role-split epic) intentionally scoped KAN-131 to only `/teacher/curriculum`. KAN-135 UAT (2026-04-21) confirmed the curriculum page is correctly gated, but the UAT agent flagged that the `/teacher` landing page still surfaces group-mode UI for parents. This is not a KAN-135 / KAN-131 failure — it's the next logical slice of the epic.

Parent users only have Individual students (per the product rule: Individual and Group are mutually exclusive per user). Showing them group controls is confusing and undermines the "one child at a time" parent mental model. This ticket extends the same `role`-based gating pattern established in KAN-131 to the landing page.

### Data / context (as of KAN-131)
- `useAuth()` returns `{ role, isLoggedIn, isHydrated }`. `role` is `'parent' | 'teacher' | null`.
- `useTeachingMode()` returns `{ mode, setMode }` with `mode ∈ {'group','individual','both'}`.
- `/teacher` landing page currently renders: a mode toggle, an "Add Group" button, a list of student/group cards (mixed individual and group), and navigation into chapter phases.
- Groups are distinguished by a `teaching_mode === 'group'` marker on the card data source.

### Requirements
1. **Reuse the KAN-131 pattern.** Derive a local `effectiveMode` in the landing page: `role === 'parent' ? 'individual' : mode`. Do **not** plumb role through the teaching-mode context or call `setMode()` from an effect.
2. **Parent branch** (`role === 'parent'` AND `isHydrated`):
   - Do not render `<TeachingModeToggle />` on the landing page.
   - Do not render the "Add Group" button.
   - Filter student/group cards to `teaching_mode === 'individual'` (or equivalent: exclude any card flagged as a Group). The GROUP-labeled card from the UAT (e.g. "iyers") must not appear.
   - Hide any "Group" section header / tab; keep only the Individual list (or its equivalent unlabeled list).
   - The page copy above the list should read in terms of "your child" / "your students" rather than "group", matching the role-neutral pass from KAN-132.
3. **Teacher branch** (`role === 'teacher'` AND `isHydrated`): no change. Visual diff against `main` must be zero for a teacher account.
4. **Logged-out preview:** unchanged.
5. **Pre-hydration** (`isHydrated === false`): render the teacher view (toggle + full list), consistent with KAN-131's choice to avoid a teacher→parent flash for existing teachers.
6. **Unknown role:** fall through to teacher view, log `console.warn` once (same pattern as KAN-131).

### Acceptance Criteria

**Happy Path — parent**
- Given a signed-in user with `role = 'parent'`
- When they load `/teacher` after hydration
- Then: (a) `<TeachingModeToggle />` is not in the DOM; (b) "Add Group" button is not in the DOM; (c) no card with `teaching_mode === 'group'` is rendered (specifically, a card labeled "GROUP" or the "iyers" test group must not appear); (d) any "Group" section header is absent.

**Happy Path — teacher**
- Given a signed-in user with `role = 'teacher'`
- When they load `/teacher` after hydration
- Then the toggle, the "Add Group" button, and all student/group cards render exactly as they do today. Visual diff vs. `main` is zero.

**Auth State — logged out**
- Given an unauthenticated visitor
- When they load `/teacher`
- Then the preview renders unchanged (toggle and Add Group visible per today's preview).

**Empty / Pre-hydration State**
- Given `isHydrated === false`
- When the page first paints
- Then the teacher view renders. On hydration, a parent account transitions to the parent view within one render pass — no visible flash of "Add Group" disappearing for teachers.

**Empty State — parent with zero students**
- Given a signed-in parent with no students yet
- When they load `/teacher`
- Then the empty state renders with language about adding "your child" (or equivalent role-neutral copy) — not "add a group" or "add a student to your group".

**Error — unknown role**
- Given a signed-in user with `role` set to an unexpected value
- When they load `/teacher` after hydration
- Then the teacher view renders and one `console.warn` fires with `"Unknown role: <value> — defaulting to teacher view"`.

### Out of Scope
- Moving parents to a separate `/parent/*` route (epic decision: single shared route, role gates content — same as KAN-131).
- Redesigning the landing page layout.
- Removing group-related data model fields or APIs.
- Changing copy on the landing page beyond what's needed to not reference "group" for parents (fold deeper copy work into KAN-132 if additional strings surface).
- Analytics events — roll into KAN-133.

### Files likely to touch
- `app/teacher/page.tsx` — add `role` from `useAuth()`, derive `effectiveMode`, gate toggle and "Add Group" button, filter cards.
- `components/TeachingModeToggle.tsx` — no change expected; gating lives in the page.
- Any landing-page-specific card list component (grep `app/teacher/page.tsx` for imports) — may need a prop to receive `effectiveMode` and filter.
- `lib/teachingModeContext.tsx` — must remain unchanged.

### Tests
- Component / integration: add `app/teacher/__tests__/role-gating.test.tsx` covering parent hydrated, teacher hydrated, logged out, pre-hydration, unknown role. Assert presence/absence of toggle, Add Group button, and group-labeled cards. Mock `useAuth` and `useTeachingMode`.
- Visual: manual check that teacher account sees zero diff from `main`.

### Notes for the implementer
- Lift the `stripIndividualSuffix` helper from KAN-131 (`lib/curriculum/formatting.ts`) if landing-page cards also carry "(Individual)" suffixes — do not duplicate the regex.
- Keep the diff surgical. Teacher experience must be pixel-identical to today.
- Coordinate with the parent-redirect follow-up (`followup-kan-135-parent-redirect.md`) — together these two tickets complete the parent-role experience on `/teacher/*`.
