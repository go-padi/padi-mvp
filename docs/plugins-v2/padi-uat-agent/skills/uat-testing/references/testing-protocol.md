# UAT Testing Protocol

Step-by-step procedure for running a UAT session against a Padi ticket. The board is files at `padi-app-starter/docs/features/` — there is no Jira. Do NOT call any Jira MCP tool.

## Phase 1: Gather Context

Every UAT file lives in its parent ticket's feature folder as `<parent-slug>-uat.md`, e.g. `docs/features/role-split/kan-131-curriculum-role-gating-uat.md` sits next to `kan-131-curriculum-role-gating.md`.

1. Read the UAT file — capture every `UAT-XX` scenario.
2. Read the parent ticket (same path without the `-uat.md` suffix) — capture Goal, Background, Requirements, Acceptance Criteria, Out of Scope, and Notes.
3. Read the feature folder's `epic.md` — the epic goal is what feature-level bugs relate to.
4. Follow any ticket ids referenced in Notes or Background. Grep `docs/features/**/*.md` for `^id: KAN-NNN` to locate them, then read those files.
5. If a design is referenced (Figma link, screenshot path in the repo), open or review it.

## Phase 2: Plan Test Scenarios

Map every Acceptance Criterion to a testable scenario.

For each Given/When/Then in the parent ticket:
- Write the exact navigation steps to reach the "Given" state.
- Write the exact action for "When".
- Write the exact observable result for "Then".
- Identify what constitutes pass vs fail.

Add scenarios the UAT file missed (ticket authors miss things):
- Empty state if not specified
- Error state if not specified
- Auth state if not specified (both logged-in and logged-out)
- Mobile/responsive if the feature is visible on mobile
- Browser back/forward navigation
- Page refresh mid-flow
- Direct URL access (deep linking)
- Tenant-scoping checks for any data writes

## Phase 3: Execute Tests via Chrome

For each scenario:

1. Navigate to the correct starting page using `navigate`.
2. Set up the precondition (log in, create test data if needed).
3. Perform the action described in "When".
4. Capture the result:
   - Use `read_page` to get current page state.
   - Use `computer` to take a screenshot as evidence.
   - Use `read_console_messages` to check for JavaScript errors.
   - Use `get_page_text` to verify text content.
5. Compare result against "Then" — be EXACT, not generous.
6. Record: PASS, FAIL, or BLOCKED (with reason).

## Phase 4: Execute Tests via Code Review (fallback)

When Chrome cannot verify something (tenant scoping, database writes, RPC behavior):

1. Use `Read` and `Grep` to find the relevant source files.
2. Check that queries include `tenant_id` filters.
3. Check that RLS policies exist on relevant tables.
4. Check that error boundaries exist around data-fetching components.
5. Check that loading states exist.
6. Verify route protection logic in middleware or layout files.

## Phase 5: Record Findings in the UAT File

Edit the UAT file in place — do not comment anywhere else.

For each `UAT-XX` scenario, flip its `Status:` line from `⬜` to one of:
- `✅` pass
- `❌` fail
- `🐛` bug filed
- `⏸️` blocked

For `❌` and `🐛` scenarios, append a sub-bulleted note directly under the scenario:
- what actually happened
- what was expected (quote the Acceptance Criterion)
- evidence path (screenshot filename, console quote, or observed DOM)
- bug file path if a bug was filed

## Phase 6: File Bug Tickets as Files

For every `❌` or `🐛` finding:

1. Determine severity (P0-P3) using the severity classification in the uat-testing skill.
2. Determine the file location:
   - **Feature folder** (`docs/features/<feature>/`) if the bug is specific to this feature's implementation.
   - **`docs/features/bugs/`** if the issue is foundational (auth, routing, tenant scoping, shared components, pre-existing breakage).
3. Draft the ticket via `/write-ticket` with `type: bug`, following the bug ticket template (see `bug-ticket-template.md`). Present the draft to the PM for approval before writing the file.
4. Cross-link: in the UAT file, under the failing scenario's sub-bullet, add the bug's file path.

## Phase 7: Append Run History to the UAT File

At the bottom of the UAT file, append (or update) a `## Run history` section:

```
## Run history

### YYYY-MM-DD — [who ran it]
- Verdict: PASS | FAIL | BLOCKED
- Scenarios: ✅ X / ❌ X / 🐛 X / ⏸️ X
- Bugs filed:
  - `docs/features/<feature>/kan-NNN-<slug>.md` — [one-line summary]
- Notes for padi-eng: [file paths, components, queries to look at]
- Notes for padi-design: [screens that don't match, missing states, interaction issues]
- Missing from ticket: [AC gaps, untestable scenarios, or ambiguous requirements]
```

Also bump the UAT file's frontmatter `updated:` field to today.

## Phase 8: Handoff

- If there are P0 or P1 bugs: flag immediately — this is not ready to ship.
- If there are only P2/P3 bugs: note that the feature is conditionally passable but needs polish.
- If all scenarios pass: note that the PM can flip the parent ticket's frontmatter `status:` to `done` and bump `updated:` when they're ready.
