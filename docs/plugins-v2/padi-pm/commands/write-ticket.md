---
description: Draft a new Padi ticket as a file under docs/features/<feature>/
argument-hint: [brief description of the ticket, or leave blank to be guided]
---

You are writing a new ticket for the Padi file-based board. The board lives at `padi-app-starter/docs/features/`. There is no Jira — do NOT call `createJiraIssue`.

## Step 1: Gather the basics

If the user provided a description in $ARGUMENTS, use it as the starting point. Otherwise ask: "What should this ticket cover?"

Establish:
- Is this a Story (user-facing feature), Task (technical work), Bug, or Epic?
- Which feature folder does it belong to? (Read `docs/features/` and match — or propose creating a new folder and ask.)
- What is the goal in one sentence?
- What background context does an engineer need?
- Are there related tickets to reference (by ID)?

## Step 2: Pick the next ID

Run a quick grep over `docs/features/**/*.md` for `^id: KAN-` lines and pick the next integer after the highest. Keep the `KAN-` prefix so old references don't break.

## Step 3: Compute the filename

`kan-<NNN>-<slug>.md` where `<slug>` is the lowercased, hyphenated title truncated to ~60 chars. UAT files append `-uat.md` to the parent slug.

## Step 4: Write the file

Exact structure:

```
---
id: KAN-NNN
title: "<title>"
type: story|task|bug|epic|feature
status: backlog
priority: low|medium|high
feature: <folder>
jira_ref: https://go-padi.atlassian.net/browse/KAN-NNN   # optional; omit for new tickets
updated: YYYY-MM-DD
---

### Goal
One sentence: what this ticket achieves and why it matters.

### Background
Context the engineer needs. Reference related tickets by ID.

### Requirements
1. Specific, implementable behavior.
2. Another behavior.

### Acceptance Criteria

**Happy Path**
Given ...
When ...
Then ...

**Empty State**
Given ... (no data)
When ...
Then empty state shown.

**Error State**
Given ...
When (the action fails)
Then error handled gracefully.

**Auth State**
Given the user is not logged in
When they attempt to access the feature
Then redirected to login or feature is hidden.

### Out of Scope
- What is explicitly NOT included.

### Notes
Tech hints: file paths, Supabase tables, patterns to follow.
```

## Product rules to enforce in acceptance criteria

- Individual students and Group students are mutually exclusive — never mix them in a single flow.
- Sections must be completed sequentially — no skipping.
- All writes must be tenant-scoped (`tenant_id` on every write).
- Demo data is never shown to logged-in users.
- Content (curriculum) is always visible regardless of auth state.
- Module status: Not Started → In Progress (any lesson completion) → Completed (assessment notes submitted).

## Before creating

Show the full draft to the PM and ask for approval. After approval, write the file at `padi-app-starter/docs/features/<feature>/<filename>.md` using the Write tool. Do NOT call Jira.

Then ask: "Would you like me to create a UAT file for this ticket?"
