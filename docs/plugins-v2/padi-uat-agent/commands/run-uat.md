---
description: Run a ruthlessly critical UAT session against a Padi ticket (file-based board)
argument-hint: [KAN id or uat filename, e.g. KAN-131 or kan-131-curriculum-role-gating-uat.md]
---

You are about to run a UAT session. You are the harshest QA reviewer on the team. Nothing passes without evidence. Read the uat-testing skill for your full testing framework, severity classification, and product rules.

The Padi board is files, not Jira. Do NOT call `getJiraIssue`, `createJiraIssue`, or any other Jira MCP tool.

## Step 1: Locate the target

If $ARGUMENTS is a KAN id:
- Grep `padi-app-starter/docs/features/**/*.md` for `^id: $1` → this is your target file.
- If the match is a `*-uat.md`, set `uat_path = match`, `parent_path = match without -uat.md`.
- If the match is a parent ticket (no `-uat.md` suffix), set `parent_path = match`, `uat_path = match with -uat.md`. If that UAT file doesn't exist, warn the PM and ask if they want you to generate one via `/write-uat` first.

If $ARGUMENTS is a filename, treat that as the starting path and apply the same logic.

If no argument, ask: "Which ticket id or UAT file should I run against?"

## Step 2: Load context

Read:
1. `parent_path` — Goal, Requirements, Acceptance Criteria, Out of Scope, Notes.
2. `uat_path` — every UAT-XX scenario as written.
3. `<feature_folder>/epic.md` — the enclosing epic.
4. Any ticket referenced by id in Notes or Background — open those files too.
5. `docs/features/_review.md` — see if this ticket is flagged stale.

## Step 3: Plan scenarios

Map every Acceptance Criterion in the parent to a UAT scenario. Cross-check against the existing UAT file and ADD scenarios that ticket is missing:
- Empty state (if not covered)
- Error state (if not covered)
- Auth state — logged in AND logged out (if not covered)
- Tenant scoping verification
- Browser back/refresh behavior
- Console errors check

Present your test plan before executing. Format:

```
## Test Plan for <KAN id>
Parent: <parent_path>
UAT file: <uat_path>
Total scenarios: X

### From existing UAT file
- UAT-01: ...
- UAT-02: ...

### Added by UAT Agent (missing from the file)
- UAT-XX: <scenario name> — <why this matters>
```

Ask: "Ready to execute? Anything to add or skip?"

## Step 4: Execute

Use the uat-tester agent to run all scenarios. The agent will:
1. Open the Padi app in Chrome.
2. Test each scenario methodically.
3. Fall back to code review when Chrome can't verify something.
4. Document every result with evidence (screenshots, network / console logs).

## Step 5: Record results in the UAT file

After execution, update `uat_path` in place:
- Flip each scenario's `Status:` line from `⬜` to `✅`, `❌`, or `🐛`.
- For failures, append a sub-bulleted note with: what happened, expected, actual, evidence path.
- Append a "## Run history" section at the bottom with date, who ran it, verdict.

Also update the parent ticket's frontmatter `updated` date to today.

## Step 6: File bugs

For every failure, create a new bug file via the /write-ticket command (do NOT open Jira tickets). Drop the new bug into the appropriate feature folder, or into `bugs/` if it doesn't clearly belong to an epic. Cross-link from the UAT file.

## Step 7: Deliver verdict

Tell the PM:
- **PASS**: All scenarios verified. Parent can be marked `status: done` in the file's frontmatter when the PM is ready.
- **FAIL**: [X] bugs filed at [paths]. Not ready to ship. Here's what's blocking.
- **BLOCKED**: Cannot complete testing because [reason]. Here's what's needed.
