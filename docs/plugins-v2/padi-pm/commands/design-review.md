---
description: Review a new design and surface roadmap and ticket implications
argument-hint: [describe the design or paste a link/description]
---

You are running a design review for the Padi product. The board is files at `padi-app-starter/docs/features/` — there is no Jira. Do NOT call any Jira MCP tool.

This is a two-phase process.

## Phase 1: Understand the design

### If the user provided a description in $ARGUMENTS
Use it as the starting point. If an image or mockup is attached, analyze it visually.

### Ask these questions (as a group, not one at a time)

1. What user problem does this design solve, and for whom? (teacher, parent, student, admin?)
2. Is this a new flow, a redesign of an existing flow, or an addition to an existing screen?
3. What is the intended user journey — what happens before and after this screen/feature?
4. Are there any interactions or states not shown in the design (empty, error, loading, mobile)?
5. Does this design touch any of these sensitive areas:
   - Teacher vs parent role gating
   - Individual vs Group student distinction
   - Section sequencing
   - Tenant data isolation
   - Module status progression
   - Auth-gated vs public content

Wait for the PM's answers before proceeding to Phase 2.

---

## Phase 2: Surface ticket implications

### Walk the current board

Read `padi-app-starter/docs/features/README.md` and `SCHEMA.md` if you need a format refresher. Then:

1. List every feature folder and its `epic.md` (skip `_orphaned/` and `_review.md`).
2. For each folder, list every non-epic, non-`*-uat.md` file — those are the tickets.
3. For each ticket, capture `id`, `title`, `status`, and `priority` from the frontmatter.

### Produce a ticket delta

Compare the design to the current board and surface:

**New tickets needed**
List work this design requires that doesn't exist in the board. For each:
- Suggested title (follow Padi ticket naming conventions)
- Type (Story, Task, Bug)
- Feature folder where it would live
- One-sentence goal

**Existing tickets to modify**
List tickets whose scope, requirements, or acceptance criteria need to change. For each:
- `id` and current title
- File path: `docs/features/<feature>/<slug>.md`
- What needs to change and why

**Tickets to deprioritize or defer**
List in-progress or backlog tickets that may conflict with, duplicate, or be superseded by this design. For each:
- `id` and current title
- File path
- Reason for deprioritizing

**Sequencing questions**
Ask the PM (do not assert):
- Does this design change what needs to be built before teachers can have their first real session with students?
- Should any in-progress work be paused to accommodate this design?
- Are there dependencies between the new tickets that imply a specific build order?

### Present the delta, then ask

"Would you like me to draft any of these tickets via `/write-ticket`? I'll produce the full body first and only write the file after your approval."

Do not create any tickets without explicit PM approval.
