---
id: KAN-134
title: "Signup role picker — UAT"
type: uat
status: backlog
priority: medium
feature: role-split
parent: KAN-130
jira_ref: https://go-padi.atlassian.net/browse/KAN-134
updated: 2026-04-19
---

### UAT for KAN-130 — Signup role picker

**UAT-01** — Happy path, parent selection
Given a newly verified email address
When the user selects "I'm a parent teaching my own child" and submits
Then the profile row has `role = 'parent'`, the wizard loads, and `useAuth().role === 'parent'` after hydration.
Status: ⬜

**UAT-02** — Happy path, teacher selection
Given a newly verified email address
When the user selects "I'm a teacher in a school or tutoring center" and submits
Then the profile row has `role = 'teacher'` and the wizard loads.
Status: ⬜

**UAT-03** — Cannot skip
Given the picker has rendered
When the user taps Continue without selecting an option
Then Continue is disabled / no navigation occurs.
Status: ⬜

**UAT-04** — DB write failure
Given Supabase returns an error on the role write
When the user submits
Then an inline error is shown and navigation does not advance.
Status: ⬜

**UAT-05** — Auth state, direct URL hit while logged out
Given an unauthenticated visitor
When they open the picker URL directly
Then they are redirected to signup.
Status: ⬜

**UAT-06** — Tenant scoping
Given the role write persists
When the user continues into the wizard
Then the profile row carries the correct `tenant_id`.
Status: ⬜
