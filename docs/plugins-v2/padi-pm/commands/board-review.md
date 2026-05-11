---
description: Review the current Padi board (docs/features/) and summarize status, blockers, and sequencing gaps
---

You are reviewing the Padi product board. The board is a file tree at `padi-app-starter/docs/features/` — no Jira. Do NOT call any Jira MCP tool.

## Step 1: State the product north star

"Get a teacher from curious to actively teaching and tracking real students."

## Step 2: Walk the file tree

Read `padi-app-starter/docs/features/README.md` and `SCHEMA.md` if you need a refresher on the format. Then list every feature folder (ignore `_review.md` for now).

For each feature folder:
1. Read `epic.md` — capture title, status, priority.
2. List every `*.md` that isn't `epic.md` and isn't a `*-uat.md`. Those are the tasks.
3. For each task, grab `id`, `title`, `status`, `priority`, and whether a sibling `<slug>-uat.md` exists.

## Step 3: Group by status

Produce a table with columns: Feature | ID | Title | Type | Status | Priority | Has UAT?

Then a top-line summary:
- **In progress**: how many, which features
- **Review**: how many
- **Backlog**: how many
- **Epics without any non-backlog tickets** (potentially stale)

## Step 4: Read the review queue

Open `docs/features/_review.md`. Surface anything still flagged.

## Step 5: Identify gaps

Flag:
- Tickets with empty / placeholder Acceptance Criteria but status ≠ backlog
- UAT files still holding scaffold text but parent is in-progress
- Epics with no open child tickets

## Step 6: Ask the PM

End with 3–5 targeted questions — sequencing, blockers, or whether a flagged stale item should be closed. Don't propose changes; ask.
