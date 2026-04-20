---
id: KAN-132
title: "[Copy] Role-neutral language pass on shared surfaces"
type: task
status: backlog
priority: medium
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-132
updated: 2026-04-19
---

### Goal
Remove "class / students / roster" language from any surface a parent can reach so the copy matches the experience.

### Background
Blocks KAN-136 UAT. Pairs with KAN-131.

### Requirements
1. Grep for: `your students`, `your class`, `classroom`, `roster`, `cohort` in user-visible strings.
2. For each hit inside a page/component a parent can reach, make the copy role-aware via `useAuth().role`:
   - Teacher: leave as-is.
   - Parent: "your child" / "your child's lessons" / "add a child" — pick the closest natural substitution.
3. If the string lives inside a shared component, pass `role` as a prop rather than reaching into the auth store deeply.
4. Leave teacher-only route strings alone.
5. List any intentionally-skipped strings in a short migration note on the ticket — feeds into KAN-121 and future parent-voice work.

### Acceptance Criteria

**Happy Path — parent**
Given a parent test account
When they walk every `/teacher/*` page
Then no "class/students/roster" language appears anywhere the parent can land.

**Happy Path — teacher**
Given a teacher test account
When they walk every `/teacher/*` page
Then copy is unchanged from pre-ticket state.

### Out of Scope
- Parent-specific marketing copy, emails, help docs.

### Notes
- Grep scope limited to `app/teacher/**`, `components/**` where a parent will render.
