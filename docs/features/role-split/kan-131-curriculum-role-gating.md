---
id: KAN-131
title: "[Curriculum] Gate Teaching Mode Toggle and chapters by role"
type: story
status: done
priority: high
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-131
updated: 2026-04-22
---

### Goal
When `role === 'parent'`, hide the Teaching Mode Toggle, force Individual mode, filter Group chapters out of the render list, and strip the now-redundant "(Individual)" suffix from titles. Teachers see no change. Logged-out preview is unchanged.

### Background
Second ticket in the role-split epic (KAN-127). KAN-128 added `role` to the profile, KAN-129 exposed it in the auth store — this ticket is where role first affects what the user sees. Blocks KAN-135 (UAT) and KAN-132 (copy pass).

### Data model (as of KAN-61)
- Chapters and groups carry a `teaching_mode: 'group' | 'individual'` field (see `lib/demo/demoCurriculum.ts` and the `get_chapters_with_progress` / `get_groups_by_chapter` RPCs).
- Individual variants use codes prefixed with `ind-` (e.g. `ind-alphabet`) and titles suffixed with " (Individual)". These coexist with Group variants under the same chapter.
- `useTeachingMode()` returns `{ mode: 'group' | 'individual' | 'both', setMode }`.
- `useAuth()` returns `{ role, isLoggedIn, isHydrated, ... }`. `role` is `'parent' | 'teacher' | null`.

### Requirements

1. **Read role at the consumer, not the context.** `lib/teachingModeContext.tsx` must stay role-agnostic. All gating lives in `app/teacher/curriculum/page.tsx` and `components/TeachingModeToggle.tsx`. Do not plumb role into the teaching-mode context.

2. **Parent branch** (`role === 'parent'` AND `isHydrated === true`):
   - Do not render `<TeachingModeToggle />`.
   - Treat effective mode as `'individual'` regardless of what the context holds. Implement as a local `effectiveMode = role === 'parent' ? 'individual' : mode` in the curriculum page; pass `effectiveMode` into every existing `mode === 'both' ? ... : x.teaching_mode === mode` check. Do **not** call `setMode('individual')` on mount — that's a side-effect race and pollutes the context for any shared consumers.
   - Filter chapters and groups to `teaching_mode === 'individual'`. Existing filter lines in `page.tsx` already use this field; just swap `mode` for `effectiveMode`.
   - Strip " (Individual)" suffix from titles at render time in the chapter/group card. Implement as a small pure helper (e.g. `stripIndividualSuffix(title)` in `lib/curriculum/formatting.ts`) — a regex `/\s*\(Individual\)\s*$/` is fine. Do not mutate the source data.
   - Never render the "Both" section headers: with `effectiveMode === 'individual'` the existing conditional already handles this; confirm with a unit test.

3. **Teacher branch** (`role === 'teacher'` AND `isHydrated === true`): render exactly as today. No code path differences beyond the `effectiveMode` passthrough (which equals `mode` for teachers).

4. **Logged-out preview** (`isLoggedIn === false`): render as today — toggle visible, both Group and Individual chapters shown, no suffix stripping.

5. **Pre-hydration** (`isHydrated === false`): render the **teacher view** (toggle + full list). Rationale: avoids a parent→teacher flash for existing teachers, and any extra chapters a parent briefly sees will disappear on hydration within ~1 frame. Do **not** render a skeleton — the curriculum page does not use skeletons elsewhere and adding one here is out of scope.

6. **Unknown role** (`role` is neither `'parent'` nor `'teacher'` after hydration — legacy rows, typos, future values): fall through to the teacher branch. Log a single `console.warn` with the offending value (no Sentry yet; KAN-133 will wire analytics). Rationale: never downgrade an existing user's view because of bad data.

### Acceptance Criteria

**Happy Path — parent**
- Given a dev account with `role = 'parent'`
- When they load `/teacher/curriculum` after hydration
- Then: (a) `<TeachingModeToggle />` is not in the DOM; (b) only chapters with `teaching_mode === 'individual'` render; (c) no rendered title contains the substring " (Individual)"; (d) chapter order matches the declared sequence — no reordering.

**Happy Path — teacher**
- Given a dev account with `role = 'teacher'`
- When they load `/teacher/curriculum`
- Then the toggle is present, all chapters (group + individual) render as they do today, and titles retain the "(Individual)" suffix on Individual variants. A visual diff against `main` shows zero pixel changes for the default toggle state.

**Auth State — logged out**
- Given an unauthenticated visitor
- When they load `/teacher/curriculum`
- Then the preview renders unchanged from today: toggle visible, full chapter list, suffixes intact.

**Empty / Pre-hydration State**
- Given `role === null` and `isHydrated === false`
- When the page first paints
- Then the teacher view renders (toggle + full list). On hydration, a parent account transitions to the parent view within one render pass. There is no flash of the toggle disappearing for teachers and no visible skeleton.

**Error — unknown role**
- Given a logged-in user whose `role` is `'admin'`, `''`, or some unexpected value
- When they load `/teacher/curriculum` after hydration
- Then the teacher view renders and a `console.warn` fires once with the message `"Unknown role: <value> — defaulting to teacher view"`.

### Out of Scope
- Separate `/parent/*` route tree (epic decision: single shared route, role gates content).
- Changing the `teaching_mode` field shape or the `'both'` context value.
- Updating copy/terminology on the remaining shared surfaces — that's KAN-132.
- Analytics events for role-gated views — that's KAN-133.
- Mutating the data source to remove "(Individual)" upstream — render-time stripping only.

### Files to touch
- `app/teacher/curriculum/page.tsx` — add `role` from `useAuth()`, derive `effectiveMode`, gate toggle render, swap `mode` → `effectiveMode` in existing filters, apply `stripIndividualSuffix` at render.
- `components/TeachingModeToggle.tsx` — no change expected; gating is in the page. If the component is rendered elsewhere for logged-in users, gate there too (grep first).
- `lib/curriculum/formatting.ts` — new file with `stripIndividualSuffix(title: string): string`.
- `lib/teachingModeContext.tsx` — must remain unchanged. If you find yourself editing this file, stop and reconsider.

### Tests
- Unit: `lib/curriculum/formatting.test.ts` — `stripIndividualSuffix` covers "Foo (Individual)", "Foo", "Foo (Individual) ", and "(Individual) Foo" (should not strip — only trailing).
- Component / integration: extend the existing curriculum page test (or add `app/teacher/curriculum/__tests__/role-gating.test.tsx`) with four cases matching the AC: parent hydrated, teacher hydrated, logged out, pre-hydration. Mock `useAuth` and `useTeachingMode`.
- E2E: not required for this ticket — KAN-135 (UAT) covers the end-to-end parent/teacher flow.

### Notes
- Chapter/group render order must remain the declared sequential order. No sorting changes.
- Keep the diff surgical: the goal is for a teacher-account visual diff to be exactly zero.
