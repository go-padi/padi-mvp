---
description: Generate a UAT file next to a Padi ticket
argument-hint: [KAN ticket number or ticket filename, e.g. KAN-130 or kan-130-onboarding-role-picker.md]
---

You are generating a UAT file for a Padi ticket. The board is files, not Jira. Do NOT call `createJiraIssue`.

## Step 1: Find the parent ticket

If $ARGUMENTS contains a KAN-NNN id, grep `docs/features/**/*.md` for `^id: KAN-NNN` and open the match. Otherwise ask: "Which ticket needs a UAT? Give me the KAN id or the filename."

Read the parent ticket's `Goal`, `Requirements`, `Acceptance Criteria`, and `Notes` sections.

## Step 2: Understand the feature

From the parent:
- What does the feature do?
- Who uses it (teacher, parent, logged-out user)?
- Does it write data? (tenant-scoping check required)
- Auth-dependent behavior?
- Empty state exists?

## Step 3: Compose scenarios

Group as:

### Happy Path
Core successful flows. Main user journey and important variations.

### Empty State
First-time use, no data exists.

### Error State
Network failure, Supabase error, invalid input, edge cases that should fail gracefully.

### Auth State
- Logged-in behavior (tenant-scoped, no demo data).
- Logged-out direct URL access → redirect to login or preview mode per the product rules.

Each scenario:

```
**UAT-XX** — <scenario name>
Given <context>
When <action>
Then <expected result>
Status: ⬜
```

Status emoji key: ⬜ not run, ✅ pass, ❌ fail, 🐛 bug found.

## Step 4: Product-rule checks to include

If the feature touches students or groups, include a scenario asserting Individual and Group students are never mixed.

If the feature involves module or lesson state, include a scenario for Not Started → In Progress → Completed progression.

Always include tenant-scoping and demo-data-invisibility checks when the feature involves logged-in data.

## Step 5: Write the file

Filename: same slug as the parent, with `-uat.md` appended. So `kan-130-onboarding-role-picker.md` → `kan-130-onboarding-role-picker-uat.md` in the same folder.

Frontmatter:

```
---
id: KAN-NNN-UAT   # or a reused UAT id if one was already assigned in the old Jira
title: "<parent title> — UAT"
type: uat
status: backlog
priority: <parent priority>
feature: <same as parent>
parent: KAN-NNN
updated: YYYY-MM-DD
---
```

Before creating, show the draft to the PM and ask for approval. After approval, use the Write tool.
