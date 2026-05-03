---
id: KAN-135
title: "Curriculum role gating — UAT"
type: uat
status: done
priority: medium
feature: role-split
parent: KAN-131
jira_ref: https://go-padi.atlassian.net/browse/KAN-135
updated: 2026-05-03
---

### UAT for KAN-131 — Curriculum role gating

**UAT-01** — Parent view hides toggle
Given a dev account flipped to `role=parent`
When they load `/teacher/curriculum`
Then the Teaching Mode Toggle is not rendered and only Individual chapters appear.
Status: ✅ Verified 2026-04-21 — toggle absent in DOM for parent dev account; only Individual chapters rendered (via in-app tab navigation).

**UAT-02** — Parent view strips "(Individual)" suffix
Given a dev account with `role=parent`
When they view chapter titles
Then no title contains "(Individual)".
Status: ✅ Verified 2026-04-21 — chapter titles for parent account contained no "(Individual)" substring.

**UAT-03** — Teacher view unchanged
Given a dev account with `role=teacher`
When they load `/teacher/curriculum`
Then the toggle renders and all chapters (Individual, Group, Both) are visible.
Status: ✅ Verified 2026-04-21 — toggle present, Individual/Group/Both chapters all rendered for teacher dev account.

**UAT-04** — Logged-out preview unchanged
Given an unauthenticated visitor
When they load `/teacher/curriculum`
Then the preview matches the pre-ticket teacher view (content always visible).
Status: ✅ Verified 2026-04-21 — logged-out preview matches pre-ticket teacher view.

**UAT-05** — Sequential order preserved
Given either role
When chapters render
Then the declared sequential order is preserved (no reordering).
Status: ✅ Verified 2026-04-21 — chapter order matches declared sequence for both parent and teacher roles.

**UAT-06** — Hydration flicker
Given a fresh page load
When the store is still hydrating
Then no toggle briefly flashes before disappearing for the parent role.
Status: ✅ Verified 2026-04-21 — no toggle flash observed on parent fresh-load (post 1462588 follow-up fix).

### Follow-ups discovered

- [followup-kan-135-teacher-landing-gating.md](followup-kan-135-teacher-landing-gating.md) — `/teacher` landing page still surfaces toggle, "Add Group" button, and group-labeled cards for parents; extend KAN-131 gating pattern to the landing page.
- [followup-kan-135-parent-redirect.md](followup-kan-135-parent-redirect.md) — direct navigation to `/teacher/curriculum` as a parent redirects to `/teacher`; gated view only reachable via in-app tab, partially undermining UAT-01/UAT-02 for deep-link users.
