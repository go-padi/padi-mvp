# Features — source of truth

This folder is the Padi backlog. It replaces the KAN board in Jira. Every unit of work lives in a feature folder as a markdown file.

## Layout

```
docs/features/
  <feature-slug>/
    epic.md               # feature-level overview (goal, why, scope)
    <ticket-slug>.md      # task/story/bug — one per unit of work
    <ticket-slug>-uat.md  # UAT scenarios for that ticket (if applicable)
  _review.md              # tickets flagged for human triage
  README.md               # this file
  SCHEMA.md               # ticket frontmatter schema
  SHIPPED.md              # rolling shipped log
```

`_orphaned/` was retired 2026-05-11 — its contents were either superseded
by the launch-readiness epic or deleted as historical. New tickets get
placed directly under a feature folder (create one if needed).

## Frontmatter schema

See `SCHEMA.md`. Every ticket .md starts with YAML frontmatter:

```yaml
---
id: KAN-128            # preserve Jira key for continuity, or new slug if born here
title: "[Auth] Add role field to user profile schema"
type: story            # story | task | bug | feature
status: backlog        # backlog | in-progress | done
priority: highest      # highest | high | medium | low
feature: role-split
epic: KAN-127
jira_ref: https://go-padi.atlassian.net/browse/KAN-128
created: 2026-03-15
updated: 2026-04-19
---
```

## How Claude agents use this folder

- **`/board-review`** globs `features/**/epic.md` and `features/**/*.md` to summarize status.
- **`/write-ticket`** creates a new `<feature>/<ticket>.md` with the schema below.
- **`/write-uat`** creates a sibling `<ticket>-uat.md`.
- **`/run-uat`** reads `<ticket>-uat.md` and writes results back into the same folder.

## Rules

- Do not edit frontmatter `id` once set (KAN-XXX is load-bearing for old PR/commit references).
- Status transitions are done by editing the `status:` field; no branching or folder moves.
- Bugs live inside the feature folder they originated in, or in `bugs/` if cross-cutting.
