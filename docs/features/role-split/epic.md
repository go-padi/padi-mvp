---
id: KAN-127
title: "[Role] Parent vs Teacher roles: structural auth split"
type: epic
status: in-progress
priority: highest
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-127
created: ported
updated: 2026-04-19
---

# [Role] Parent vs Teacher roles: structural auth split

Introduce a single `role` field (parent | teacher) at signup, switchable later. Gate behavior inside existing pages — do not split into /parent/* routes in this phase. See `role-split-cc-handoff.md` at docs/ root for the full engineering handoff.

## Children

See sibling files in this folder. Each child ticket has its own .md with frontmatter.

**Progress (as of 2026-04-19):**
- KAN-128 auth role field — done (migration `20260419120000_add_profile_role.sql` + `role_set_at` follow-up landed)
- KAN-129 expose role in auth store — done (commit 6ac6d58)
- KAN-130 onboarding role picker — done (commit 8a5de05)
- KAN-131 curriculum role gating — backlog
- KAN-132 copy role-neutral pass — backlog
- KAN-133 analytics role events — backlog

Ships as one release once all six are green.
