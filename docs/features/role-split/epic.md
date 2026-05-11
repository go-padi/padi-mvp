---
id: KAN-127
title: "[Role] Parent vs Teacher roles: structural auth split"
type: epic
status: shipped
priority: highest
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-127
created: ported
updated: 2026-05-10
---

# [Role] Parent vs Teacher roles: structural auth split

Single `role` field (parent | teacher) at signup, switchable later.
Behavior gated inside existing pages — no `/parent/*` route tree yet.

## Status — SHIPPED

All six child tickets shipped to prod via the role-split release and
subsequent LR-06 (role-aware navigation):

- ✅ KAN-128 auth role field — migration `20260419120000_add_profile_role.sql` + `role_set_at` follow-up
- ✅ KAN-129 expose role in auth store — commit 6ac6d58
- ✅ KAN-130 onboarding role picker — commit 8a5de05
- ✅ KAN-131 curriculum role gating
- ✅ KAN-132 copy role-neutral pass — shipped via BuildLoop iter 2 on 2026-05-10
- ✅ Role-aware nav — shipped via LR-06 on 2026-05-10

## Open follow-ups (post-ship)

- KAN-133 analytics role events — `priority: medium`, blocked on KAN-137 analytics util shipping first
- `followup-kan-135-parent-redirect.md` — open
- UATs (kan-130-uat, kan-131-uat, kan-132-uat) — backlog, ship-blocking only if regressions found
