---
id: KAN-128
title: "[Auth] Add role field to user profile schema"
type: story
status: done; validated
priority: high
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-128
updated: 2026-04-19
---

### Goal
Introduce a `role` column (`parent` | `teacher`) on `profiles` so every authenticated surface can branch behavior between the two ICPs without splitting routes.

### Background
Every authenticated surface in `padi-mvp` today assumes a generic teacher user. The Teaching Mode Toggle (Individual/Group/Both) is exposed to everyone. For the parent ICP that's an activation killer. This ticket is the schema foundation for KAN-127 (the role split epic). Blocks KAN-129 and KAN-130.

### Requirements
1. Migration adds `role text not null check (role in ('parent','teacher'))` to `profiles`. No default — must be set explicitly at signup.
2. Two-step migration: add column as nullable, backfill existing rows with `update profiles set role = 'teacher' where role is null;`, then apply `NOT NULL` + `CHECK` constraint.
3. Extend the profiles RLS select policy so users can read their own `role`.
4. Regenerate types: `npx supabase gen types typescript --linked > lib/database.types.ts`.

### Acceptance Criteria

**Happy Path**
Given a valid signup payload includes `role`
When the insert runs
Then the row persists with `role in ('parent','teacher')`.

**Error State**
Given an insert without `role`
When the insert runs
Then it fails the NOT NULL constraint.

**Error State**
Given `update profiles set role = 'admin'`
When the update runs
Then it errors with CHECK constraint violation.

**Auth State**
Given no authenticated session
When SELECT against `profiles` runs
Then it returns 0 rows (RLS).

### Out of Scope
- Role-switching UI (future follow-up).
- Multi-role users on one account.

### Notes
- Files: `supabase/migrations/<new>.sql`, `lib/database.types.ts`.
- Existing dev accounts should read `role === 'teacher'` post-backfill.
