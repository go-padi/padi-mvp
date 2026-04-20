---
id: KAN-136
title: "Role-neutral copy pass — UAT"
type: uat
status: backlog
priority: medium
feature: role-split
parent: KAN-132
jira_ref: https://go-padi.atlassian.net/browse/KAN-136
updated: 2026-04-19
---

### UAT for KAN-132 — Role-neutral copy pass

**UAT-01** — Parent sees child-focused language
Given a parent test account
When they walk every `/teacher/*` route they can land on
Then no occurrence of "your students", "your class", "classroom", "roster", or "cohort" appears.
Status: ⬜

**UAT-02** — Parent copy replacements read naturally
Given the parent view
When they read updated strings
Then substitutions are "your child" / "your child's lessons" / "add a child" or a natural variant.
Status: ⬜

**UAT-03** — Teacher copy unchanged
Given a teacher test account
When they walk the same routes
Then copy matches the pre-ticket state verbatim.
Status: ⬜

**UAT-04** — Intentionally-skipped strings documented
Given a migration note on the parent ticket
When QA reviews it
Then every skipped string is listed with reason, feeding KAN-121.
Status: ⬜
