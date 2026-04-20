---
id: KAN-130
title: "[Onboarding] Role picker at signup (parent vs teacher)"
type: story
status: done
priority: high
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-130
updated: 2026-04-19
---

### Goal
Require every new user to pick `parent` or `teacher` at signup so downstream UI can branch on the value.

### Background
Blocks KAN-134 UAT. Depends on KAN-128.

### Requirements
1. After email/password submit (or SSO callback) and before the first authenticated route, render a required picker with two options. No skip.
2. Copy:
   - Option A: "I'm a parent teaching my own child" — subtitle "We'll show you one-on-one lessons for your child."
   - Option B: "I'm a teacher in a school or tutoring center" — subtitle "We'll show you group and individual lessons for your class."
3. Submit writes `role` to profile, then routes to the onboarding wizard (KAN-44 landing).
4. Direct-hit on the route while unauthenticated → redirect to signup.

### Acceptance Criteria

**Happy Path — parent**
Given a newly signed-up user
When they select the parent option and submit
Then the profile row has `role = 'parent'` and the user lands on the onboarding wizard with `role=parent` in the store post-hydration.

**Happy Path — teacher**
Given a newly signed-up user
When they select the teacher option and submit
Then the profile row has `role = 'teacher'` and the user lands on the onboarding wizard.

**Error State**
Given the user clicks Continue without choosing
When the form submits
Then Continue is disabled / the form does not submit.

**Error State**
Given the profile update fails
When the user submits
Then an inline error is shown and the user stays on the picker.

**Auth State**
Given an unauthenticated user hits the picker URL directly
When the page loads
Then they are redirected to signup.

### Out of Scope
- Role-switching UI in settings.
- Parent-specific post-signup wizard content (future epic).

### Notes
- New route/component in the auth flow; persists to `profiles.role`.
- Follow existing Zustand patterns; use `lib/supabase.ts`.
