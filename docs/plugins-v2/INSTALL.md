# Plugins v2 — swap-in instructions

These are the rewritten prompt files for the three Padi plugins after the board moved from Jira to `docs/features/` on 2026-04-19. The v2 files have **no** Jira references — no MCP calls, no cloudId, no `jira_ref` requirements. Every UAT lives next to its parent ticket in `docs/features/<feature>/` as `<parent-slug>-uat.md`. Every bug is a file under a feature folder (or `docs/features/bugs/` for foundational issues).

The plugin author copies these into the installed plugin directories at `~/Library/Application Support/Claude/local-agent-mode-sessions/.../rpm/plugin_*`.

## What to replace

### `padi-pm` plugin
Replace these files in the padi-pm plugin directory (the one containing `skills/padi-pm/SKILL.md`):

| Destination (in installed plugin) | Source |
|---|---|
| `README.md` | `docs/plugins-v2/padi-pm/README.md` |
| `skills/padi-pm/SKILL.md` | `docs/plugins-v2/padi-pm/skills/padi-pm/SKILL.md` |
| `commands/board-review.md` | `docs/plugins-v2/padi-pm/commands/board-review.md` |
| `commands/write-ticket.md` | `docs/plugins-v2/padi-pm/commands/write-ticket.md` |
| `commands/write-uat.md` | `docs/plugins-v2/padi-pm/commands/write-uat.md` |
| `commands/design-review.md` | `docs/plugins-v2/padi-pm/commands/design-review.md` |

### `padi-design` plugin
Replace these in the padi-design plugin directory:

| Destination | Source |
|---|---|
| `README.md` | `docs/plugins-v2/padi-design/README.md` |
| `commands/roadmap-spar.md` | `docs/plugins-v2/padi-design/commands/roadmap-spar.md` |
| `commands/eng-brief.md` | `docs/plugins-v2/padi-design/commands/eng-brief.md` |
| `commands/status.md` | `docs/plugins-v2/padi-design/commands/status.md` |
| `skills/pm-sparring/SKILL.md` | `docs/plugins-v2/padi-design/skills/pm-sparring/SKILL.md` |

Other commands/skills under padi-design are unchanged.

### `padi-uat-agent` plugin
Replace:

| Destination | Source |
|---|---|
| `README.md` | `docs/plugins-v2/padi-uat-agent/README.md` |
| `commands/run-uat.md` | `docs/plugins-v2/padi-uat-agent/commands/run-uat.md` |
| `agents/uat-tester.md` | `docs/plugins-v2/padi-uat-agent/agents/uat-tester.md` |
| `skills/uat-testing/references/testing-protocol.md` | `docs/plugins-v2/padi-uat-agent/skills/uat-testing/references/testing-protocol.md` |
| `skills/uat-testing/references/bug-ticket-template.md` | `docs/plugins-v2/padi-uat-agent/skills/uat-testing/references/bug-ticket-template.md` |

## Verification after swap

1. Start a new Claude session.
2. Run `/board-review` — it should walk `docs/features/` and never hit Jira.
3. Run `/write-ticket "test: swap-in worked"` — should write a file under `docs/features/` and not call `createJiraIssue`.
4. Run `/run-uat KAN-131` — should locate `role-split/kan-131-curriculum-role-gating-uat.md` by greps, not `getJiraIssue`, and record results directly in that file.
5. Trigger `/design-review` with any description — Phase 2 should list tickets by file path, not JQL.
6. Ask the `uat-tester` agent to file a bug — it should produce a new file under `docs/features/<feature>/` or `docs/features/bugs/` via `/write-ticket`, not call `createJiraIssue`.

If any command or agent still references Jira MCP tools, the old version is still installed — the replacement didn't land.
