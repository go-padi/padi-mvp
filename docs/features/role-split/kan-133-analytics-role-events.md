---
id: KAN-133
title: "[Analytics] Track role at signup and on key activation events"
type: task
status: backlog
priority: medium
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-133
updated: 2026-04-19
---

### Goal
Emit three analytics events tagged with `role` so we can segment activation by parent vs teacher.

### Background
Supports the KAN-127 epic's product learning. No user-visible behavior change.

### Requirements
Emit three events, all with a `role` property (`parent` | `teacher`):
1. `signup_role_selected` — on successful role pick submit (KAN-130).
2. `first_student_added` — on the user's first student/child creation.
3. `first_module_started` — on the user's first module transitioning to "In Progress" (per Not Started → In Progress → Completed).

Swallow analytics failures — never block the user flow.

### Acceptance Criteria

**Happy Path**
Given a new test account
When the user runs the full funnel: signup → role pick → add child → start first module
Then three events fire in order with the correct `role` value.

**Error State**
Given the analytics endpoint is down
When the user completes any step
Then the flow completes with no user-visible error.

### Out of Scope
- Back-filling events for existing users.

### Notes
- Wherever the analytics wrapper lives (add a tiny helper if none).
