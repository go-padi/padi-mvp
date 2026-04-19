# Role Split — Claude Code Handoff

Engineering handoff for the parent-vs-teacher auth split. Epic: **KAN-127**.

## Why this epic exists

Every authenticated surface in `padi-mvp` today assumes a generic "teacher" user. The Teaching Mode Toggle (Individual/Group/Both) is exposed to everyone. For the parent ICP, that's an activation killer: a parent landing on `/teacher/curriculum` sees 73 Individual + 88 Group modules with no guidance on which applies to them.

Decision: introduce a single `role` field (`parent` | `teacher`) at signup, switchable later. Gate behavior inside existing pages — do not split into `/parent/*` routes in this phase.

Product rules this serves (never violate):

- Individual and Group students are mutually exclusive per student.
- Sections must be completed sequentially.
- Demo data is never shown to logged-in users.
- Content (curriculum) is always visible regardless of auth state.

## Ticket order (do them in this sequence)

| # | Ticket | Type | What it does | Blocks |
|---|--------|------|--------------|--------|
| 1 | [KAN-128](https://go-padi.atlassian.net/browse/KAN-128) | Story | Add `role` column + CHECK constraint + backfill | 129, 130 |
| 2 | [KAN-129](https://go-padi.atlassian.net/browse/KAN-129) | Task | Expose `role` via `useAuth()` after hydration | 131 |
| 3 | [KAN-130](https://go-padi.atlassian.net/browse/KAN-130) | Story | Required role picker at signup | 133 |
| 4 | [KAN-131](https://go-padi.atlassian.net/browse/KAN-131) | Story | Hide toggle + filter chapters for `role=parent` on `/teacher/curriculum` | 132 |
| 5 | [KAN-132](https://go-padi.atlassian.net/browse/KAN-132) | Task | Copy pass — remove "class/students/roster" from shared surfaces | — |
| 6 | [KAN-133](https://go-padi.atlassian.net/browse/KAN-133) | Task | Analytics events segmented by role | — |

Ship as one coordinated release. Shipping 1+2+3 without 4 leaves parents staring at the same ambiguous curriculum. Shipping 4 before 3 means there's no way for a real user to become a parent except via a manual DB flip.

## KAN-128 — schema + backfill

**Files:** `supabase/migrations/<new>.sql`, `lib/database.types.ts`.

**Do:**

1. Create migration adding `role text not null check (role in ('parent','teacher'))` to `profiles`. No default — must be set explicitly at signup.
2. In the same migration (or a sibling), backfill existing rows: `update profiles set role = 'teacher' where role is null;` — only safe if the column is added as nullable first, then the NOT NULL constraint applied after backfill. Two-step migration is cleanest.
3. Extend the profiles RLS select policy so users can read their own `role`.
4. Regenerate types: `npx supabase gen types typescript --linked > lib/database.types.ts` (or the project's existing generate command).

**Verify:**

- New signups fail to insert without a `role`.
- Existing test account reads `role === 'teacher'`.
- Attempting `update profiles set role = 'admin'` errors with CHECK constraint violation.
- Logged-out SQL against `profiles` returns 0 rows.

## KAN-129 — auth store role

**Files:** `lib/auth-store.ts`.

**Do:**

1. Extend `AuthState` with `role: 'parent' | 'teacher' | null`. Null before hydration, null on logout.
2. Fetch `role` in the same hydration path that populates `isLoggedIn` — single round-trip to profiles.
3. Add JSDoc: "Never read `role` before `isHydrated === true`."
4. On logout, clear `role` to null.

**Verify:**

- Mount a dev component that reads `role` on first render — should be `null` until `isHydrated` flips.
- After login, `role` matches the DB value.
- After logout, `role` is `null`.

## KAN-130 — signup role picker

**Files:** new route/component in the auth flow; persists to `profiles.role`.

**Do:**

1. After email/password submit (or SSO callback) and before the first authenticated route, render a required picker with two options. No skip.
2. Copy:
   - Option A: "I'm a parent teaching my own child" — subtitle "We'll show you one-on-one lessons for your child."
   - Option B: "I'm a teacher in a school or tutoring center" — subtitle "We'll show you group and individual lessons for your class."
3. Submit writes `role` to profile, then routes to the onboarding wizard (KAN-44 landing).
4. Direct-hit on the route while unauthenticated → redirect to signup.

**Verify:**

- Cannot submit without a selection (continue button disabled).
- Parent selection lands on wizard with `role=parent` in the store post-hydration.
- Teacher selection same but with `role=teacher`.
- DB write failure shows inline error, does not forward-navigate.

## KAN-131 — curriculum role gating

**Files:** `app/teacher/curriculum/page.tsx`, `components/TeachingModeToggle.tsx`, possibly `lib/teachingModeContext.ts`.

**Do:**

1. Read `role` from `useAuth()` after hydration.
2. If `role === 'parent'`:
   - Do not render `TeachingModeToggle`.
   - Force `mode = 'individual'` in the teaching-mode context consumer (prefer gating at the consumer; keep the context role-agnostic).
   - Filter out Group-mode chapters when building the render list.
   - Strip the "(Individual)" suffix from group titles — once the toggle is hidden the suffix is redundant and noisy.
   - Never render the "Both" section headers even if `mode` somehow resolves to `both`.
3. If `role === 'teacher'`: render exactly as today. No behavior change.
4. Unauth preview stays unchanged (content is always visible per product rule; toggle defaults to teacher view for guests).

**Verify:**

- Flip a dev account's `role` to `parent` via SQL; reload `/teacher/curriculum` — toggle gone, only individual chapters visible, no "(Individual)" suffix.
- Flip back to `teacher` — toggle returns, all chapters visible.
- Logged out — preview renders as before, toggle visible.
- Chapters still appear in their declared sequential order (no reordering).

## KAN-132 — copy pass

**Files:** grep scope limited to `app/teacher/**`, `components/**` where a parent will render.

**Do:**

1. Grep for: `your students`, `your class`, `classroom`, `roster`, `cohort` in user-visible strings.
2. For each hit inside a page/component a parent can reach, make the copy role-aware via `useAuth().role`:
   - Teacher: leave as-is.
   - Parent: "your child" / "your child's lessons" / "add a child" — pick the closest natural substitution.
3. If the string lives inside a shared component, pass `role` as a prop rather than reaching into the auth store deeply.
4. Leave teacher-only route strings alone.
5. List any intentionally-skipped strings in a short migration note on the ticket — feeds into KAN-121 and future parent-voice work.

**Verify:**

- Walk every `/teacher/*` page with a parent test account; no "class/students/roster" language anywhere the parent can land.
- Teacher test account sees unchanged copy.

## KAN-133 — analytics

**Files:** wherever the analytics wrapper lives (or add a tiny helper).

**Do:**

Emit three events, all with a `role` property (`parent` | `teacher`):

1. `signup_role_selected` — on successful role pick submit (KAN-130).
2. `first_student_added` — on the user's first student/child creation.
3. `first_module_started` — on the user's first module transitioning to "In Progress" (per the Not Started → In Progress → Completed state machine).

Swallow analytics failures — never block the user flow.

**Verify:**

- New test account, run the full funnel: signup → role pick → add child → start first module. Three events fire in order with correct `role`.
- Kill the analytics endpoint; repeat — user flow completes, no user-visible error.

## Shared conventions

- **Tenant-scoped writes always.** Every write includes `tenant_id`.
- **Module status state machine:** Not Started → In Progress (any lesson completion) → Completed (assessment notes submitted). Do not invent intermediate states.
- **Sections sequential, no skipping.** UI must prevent and explain.
- **Demo data:** never shown to logged-in users. If you add any preview-only fixtures, gate them on `isLoggedIn === false`.
- **Curriculum:** always visible regardless of auth state. Don't gate content; gate *interaction* (assigning, starting).

## Testing before the full chain ships

Because KAN-130 (signup picker) must ship before real users can become parents, verify KAN-129 and KAN-131 in the meantime by flipping a dev account's `role` directly in Supabase:

```sql
update profiles set role = 'parent' where id = '<dev user id>';
-- to revert:
update profiles set role = 'teacher' where id = '<dev user id>';
```

This is a dev-only shortcut. Do not ship a UI for direct role flipping in this epic.

## Related tickets

- **KAN-1** — Auth and Sign In (done). Foundation this extends.
- **KAN-44** — Onboarding wizard for first-time Start Teaching (done). Role picker runs before this.
- **KAN-121** — Simplify demo data for parent ICP (to do, High). Downstream beneficiary — will use `role` once schema lands.

## Out of scope for this epic

- Separate `/parent/*` route tree (future epic if divergence demands it).
- Parent-specific dashboard, nav, or onboarding wizard.
- Multi-role users on one account (single role only for now).
- Role-switching UI in settings (data supports it, UI is a follow-up).
- Parent-specific marketing copy, emails, help docs.
