---
id: KAN-131
title: "[Curriculum] Gate Teaching Mode Toggle and chapters by role"
type: story
status: backlog
priority: high
feature: role-split
jira_ref: https://go-padi.atlassian.net/browse/KAN-131
updated: 2026-04-19
---

### Goal
When `role === 'parent'`, hide the Teaching Mode Toggle, force Individual mode, filter out Group chapters, and strip the now-redundant "(Individual)" suffix. Teachers see no change.

### Background
Blocks KAN-135 UAT. Depends on KAN-129.

### Requirements
1. Read `role` from `useAuth()` after hydration.
2. If `role === 'parent'`:
   - Do not render `TeachingModeToggle`.
   - Force `mode = 'individual'` in the teaching-mode context consumer (prefer gating at the consumer; keep the context role-agnostic).
   - Filter out Group-mode chapters when building the render list.
   - Strip the "(Individual)" suffix from group titles.
   - Never render the "Both" section headers even if `mode` somehow resolves to `both`.
3. If `role === 'teacher'`: render exactly as today. No behavior change.
4. Unauth preview unchanged (content is always visible; toggle defaults to teacher view for guests).

### Acceptance Criteria

**Happy Path — parent**
Given a dev account with `role=parent`
When they load `/teacher/curriculum`
Then the toggle is gone, only Individual chapters render, and no "(Individual)" suffix appears.

**Happy Path — teacher**
Given a dev account with `role=teacher`
When they load `/teacher/curriculum`
Then the toggle is present and all chapters are visible.

**Auth State — logged out**
Given an unauthenticated visitor
When they load `/teacher/curriculum`
Then the preview renders as before with the toggle visible.

**Empty State**
Given `role` is null (pre-hydration)
When the page first paints
Then no toggle flashes between states.

### Out of Scope
- Separate `/parent/*` route tree.

### Notes
- Files: `app/teacher/curriculum/page.tsx`, `components/TeachingModeToggle.tsx`, possibly `lib/teachingModeContext.ts`.
- Chapters must remain in declared sequential order (no reordering).
