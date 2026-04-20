---
id: KAN-129
title: "[Auth] Expose role in client auth store"
type: task
status: done
priority: high
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-129
updated: 2026-04-19
---

### Goal
Surface `role` through `useAuth()` so the client can gate UI for parents vs teachers without a separate fetch per component.

### Background
Blocks KAN-131 (curriculum gating). Depends on KAN-128.

### Requirements
1. Extend `AuthState` with `role: 'parent' | 'teacher' | null`. Null before hydration, null on logout.
2. Fetch `role` in the same hydration path that populates `isLoggedIn` — single round-trip to profiles.
3. Add JSDoc: "Never read `role` before `isHydrated === true`."
4. On logout, clear `role` to null.

### Acceptance Criteria

**Happy Path**
Given a signed-in user
When the store hydrates
Then `role` matches the DB value.

**Empty State**
Given a component renders on first mount
When `isHydrated === false`
Then `role` is `null`.

**Auth State**
Given the user logs out
When the store resets
Then `role` is `null`.

### Out of Scope
- Server-side role reads beyond the existing hydration path.

### Notes
- Files: `lib/auth-store.ts`.
- Verify by mounting a dev component that reads `role` on first render.
