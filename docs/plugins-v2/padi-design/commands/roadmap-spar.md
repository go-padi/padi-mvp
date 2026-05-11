---
description: Spar with the PM on roadmap priorities using the file-based board at docs/features/
---

Load the pm-sparring and north-star skills. The board is a file tree at `padi-app-starter/docs/features/` — there is no Jira board. Do NOT call any Jira MCP tool.

## Step 1: Pull the current board

Walk `padi-app-starter/docs/features/` and build a current picture of the board:
- List every feature folder and its `epic.md`.
- For each folder, enumerate tickets (non-epic, non-UAT `.md` files) with their frontmatter `status` and `priority`.
- Read `docs/features/_review.md` for anything flagged stale.

## Step 2: Apply the north star

"Get a teacher from curious to actively teaching and tracking real students."

For every feature folder, ask:
1. Does this directly move teachers closer to the first real student session?
2. Is it blocking something that does?
3. Could we cut it without losing the goal?

## Step 3: Run the sparring framework

Apply the 5-test sequencing framework (loaded via pm-sparring):
1. **Right order for first real teacher?** Is anything being built before a foundational piece?
2. **Right sized epics?** Too big to ship as a unit? Too small — really tasks?
3. **Mis-filed tickets?** Anything in the wrong folder, or revealing a missing epic?
4. **Stale work?** Anything in `_review.md` that should be closed instead of re-homed?
5. **Parallel paths?** Two features where only one is on the critical path?

## Step 4: Surface as questions

Do not propose re-priorities. Give the PM the 3–5 sharpest questions that will force the decision. Reference file paths so the PM can jump straight in.
