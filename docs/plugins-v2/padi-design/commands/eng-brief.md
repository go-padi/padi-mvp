---
description: Generate an engineering handoff brief for a feature, pulling from docs/features/
argument-hint: [feature folder or KAN ticket id, e.g. role-split or KAN-131]
---

Load the eng-handoff and north-star skills. Source: file-based board at `padi-app-starter/docs/features/`. Do NOT call Jira.

## Step 1: Identify the target

If $ARGUMENTS names a feature folder, read every `.md` in it.
If $ARGUMENTS names a KAN id, grep for `^id: $1` and open the match. Also read the sibling `epic.md` and any `-uat.md`.

If neither form given, ask: "Which feature folder or ticket id?"

## Step 2: Compose the brief

Follow the 9-section eng-handoff brief, enriched with pointers back to the file tree so the engineer can open each source:

1. Summary (from epic.md Goal)
2. Scope (titles of every non-UAT ticket, with relative paths)
3. Constraints (product rules from SKILL.md — tenant scoping, sequential sections, etc.)
4. Key files and tables (from ticket Notes sections)
5. Dependencies between tickets (shipping order)
6. Data model changes (from any schema-touching ticket)
7. UX flows (from ticket Requirements + any design links)
8. Testing — point at the companion `*-uat.md` files
9. Open questions (anything with placeholder Acceptance Criteria)

## Step 3: Design-to-dev checklist

Close with the standard checklist:
- All tickets have filled Acceptance Criteria? ☐
- All tickets have matching UAT files? ☐
- Dependencies map out cleanly? ☐
- Product rules violations check — none? ☐

If any box is unchecked, flag it in the brief instead of silently moving on.
