# Bug Ticket Template

Use this exact format when filing a bug found during a UAT session. Bugs are files under `docs/features/`. There is no Jira.

## File Placement

- **Feature-specific bug** (bug in the feature's implementation) → `docs/features/<feature>/<filename>.md`, in the same folder as the parent ticket and its UAT.
- **Foundational / cross-cutting bug** (auth, routing, tenant scoping, shared components, pre-existing breakage) → `docs/features/bugs/<filename>.md`.

## Filename

`kan-<NNN>-<slug>.md`, where:
- `<NNN>` is the next available id. Grep `^id: KAN-` across `docs/features/**/*.md` and pick the next integer.
- `<slug>` is the lowercased, hyphenated title truncated to ~60 chars.

Draft the ticket via `/write-ticket` (use `type: bug`) and only write the file after PM approval.

## Frontmatter

```
---
id: KAN-NNN
title: "Bug: [exact broken behavior] on [exact location/page]"
type: bug
status: backlog
priority: P0 | P1 | P2 | P3   # severity doubles as priority
feature: <folder>
parent: KAN-NNN                # the ticket this bug blocks
uat: KAN-NNN-UAT               # the UAT file that surfaced it (omit if N/A)
updated: YYYY-MM-DD
---
```

## Body

```
### Severity
[P0 | P1 | P2 | P3] — [one-line justification]

### Found During
UAT for [parent ticket id] — [parent ticket title]
UAT scenario: [UAT-XX reference]
UAT file: docs/features/<feature>/<parent-slug>-uat.md

### Steps to Reproduce
1. [Navigate to specific URL or page]
2. [Perform specific action — be exact about what was clicked/typed]
3. [Observe the result]

### Expected Behavior
[Exact quote from the Acceptance Criterion or design spec]

### Actual Behavior
[Exact description of what actually happened — no vagueness]

### Evidence
[Screenshot path in the repo, console error text, or specific DOM observation]

### Affected Users
[Teachers | Parents | Logged-out visitors | All users]

### Environment
[Browser, screen size, auth state, data state]

### Suggested Fix Area
[File paths, components, or queries that likely need attention]

### Notes
[Any additional context — related tickets by id, workarounds, or dependencies]
```

## Examples of Good vs Bad Bug Summaries

### Good
- `Bug: "Start Teaching" button on /library does not navigate to /teacher/start when clicked`
- `Bug: Student list shows students from all tenants instead of current tenant on /students page`
- `Bug: Module status shows "Completed" without assessment notes on student detail page`
- `Bug: Empty state message missing when teacher has no students on /students page`

### Bad (never write these)
- `Bug: Button doesn't work`
- `Bug: Page looks wrong`
- `Bug: Data issue on student page`
- `Bug: UI broken`

## Cross-linking

After writing the bug file:

- In the bug file's frontmatter, `parent:` points to the ticket the bug blocks; `uat:` points to the UAT id (if any).
- In the UAT file, under the failing scenario's sub-bullet, add a line: `Bug filed: docs/features/<feature>/kan-NNN-<slug>.md`.
