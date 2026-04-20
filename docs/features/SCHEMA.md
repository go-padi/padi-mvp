# Ticket frontmatter schema

## Required fields

| Field      | Type     | Allowed values / format                                  |
|------------|----------|----------------------------------------------------------|
| `id`       | string   | `KAN-XXX` for ported tickets; `<feature>-<n>` otherwise  |
| `title`    | string   | Human-readable, matches Jira summary for ported tickets  |
| `type`     | enum     | `epic` \| `story` \| `task` \| `bug` \| `feature`        |
| `status`   | enum     | `backlog` \| `in-progress` \| `done`                     |
| `priority` | enum     | `highest` \| `high` \| `medium` \| `low`                 |
| `feature`  | string   | Feature folder slug (e.g. `role-split`)                  |

## Optional fields

| Field       | Type     | Notes                                                     |
|-------------|----------|-----------------------------------------------------------|
| `epic`      | string   | Parent epic id (`KAN-127`). Omit for orphaned tickets.    |
| `jira_ref`  | URL      | Link back to Jira source if ported.                       |
| `blocks`    | list     | `[KAN-130]` — downstream work gated by this ticket.       |
| `blocked_by`| list     | Upstream prerequisites.                                   |
| `uat`       | string   | Sibling uat file path if present (`./role-picker-uat.md`) |
| `created`   | date     | YYYY-MM-DD                                                |
| `updated`   | date     | YYYY-MM-DD                                                |
| `owner`     | string   | Claude Code / Codex / nisha                               |

## Body sections (tickets)

Order fixed, skip any that don't apply:

```
### Goal
### Background
### Requirements
### Acceptance Criteria
### Out of Scope
### Notes
```

## Body sections (UAT)

```
### Preconditions
### Scenarios
  UAT-01 ... Given/When/Then/Status
### Bugs Found
```

Status emoji inside UAT scenarios: ✅ pass · ❌ fail · 🐛 bug found.
