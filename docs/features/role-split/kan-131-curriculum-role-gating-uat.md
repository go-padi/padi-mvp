---
id: KAN-135
title: "Curriculum role gating — UAT"
type: uat
status: backlog
priority: medium
feature: role-split
parent: KAN-131
jira_ref: https://go-padi.atlassian.net/browse/KAN-135
updated: 2026-04-19
---

### UAT for KAN-131 — Curriculum role gating

**UAT-01** — Parent view hides toggle
Given a dev account flipped to `role=parent`
When they load `/teacher/curriculum`
Then the Teaching Mode Toggle is not rendered and only Individual chapters appear.
Status: ⬜

**UAT-02** — Parent view strips "(Individual)" suffix
Given a dev account with `role=parent`
When they view chapter titles
Then no title contains "(Individual)".
Status: ⬜

**UAT-03** — Teacher view unchanged
Given a dev account with `role=teacher`
When they load `/teacher/curriculum`
Then the toggle renders and all chapters (Individual, Group, Both) are visible.
Status: ⬜

**UAT-04** — Logged-out preview unchanged
Given an unauthenticated visitor
When they load `/teacher/curriculum`
Then the preview matches the pre-ticket teacher view (content always visible).
Status: ⬜

**UAT-05** — Sequential order preserved
Given either role
When chapters render
Then the declared sequential order is preserved (no reordering).
Status: ⬜

**UAT-06** — Hydration flicker
Given a fresh page load
When the store is still hydrating
Then no toggle briefly flashes before disappearing for the parent role.
Status: ⬜
