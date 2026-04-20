# Plugins v2 — swap-in instructions

These are the rewritten prompt files for the three Padi plugins after the board moved from Jira to `docs/features/` on 2026-04-19.

They can't be dropped into the plugin directories directly from inside this repo — the plugin cache at `~/Library/Application Support/Claude/local-agent-mode-sessions/.../rpm/plugin_*` is read-only from the sandbox. The plugin author has to copy them into the installed plugin directories manually.

## What to replace

### `padi-pm` plugin
Replace these files in the padi-pm plugin directory (the one containing `skills/padi-pm/SKILL.md`):

| Destination (in installed plugin) | Source |
|---|---|
| `skills/padi-pm/SKILL.md` | `docs/plugins-v2/padi-pm/skills/padi-pm/SKILL.md` |
| `commands/board-review.md` | `docs/plugins-v2/padi-pm/commands/board-review.md` |
| `commands/write-ticket.md` | `docs/plugins-v2/padi-pm/commands/write-ticket.md` |
| `commands/write-uat.md` | `docs/plugins-v2/padi-pm/commands/write-uat.md` |

Leave `commands/design-review.md` alone (it still works).

### `padi-design` plugin
Replace these in the padi-design plugin directory:

| Destination | Source |
|---|---|
| `commands/roadmap-spar.md` | `docs/plugins-v2/padi-design/commands/roadmap-spar.md` |
| `commands/eng-brief.md` | `docs/plugins-v2/padi-design/commands/eng-brief.md` |
| `commands/status.md` | `docs/plugins-v2/padi-design/commands/status.md` |

Other commands/skills under padi-design are unchanged.

### `padi-uat-agent` plugin
Replace:

| Destination | Source |
|---|---|
| `commands/run-uat.md` | `docs/plugins-v2/padi-uat-agent/commands/run-uat.md` |

The uat-testing skill and uat-tester agent don't need changes — they still test the live app; they only differ in where the spec lives.

## Verification after swap

1. Start a new Claude session.
2. Run `/board-review` — it should walk `docs/features/` and never hit Jira.
3. Run `/write-ticket "test: swap-in worked"` — should write a file under `docs/features/` and not call `createJiraIssue`.
4. Run `/run-uat KAN-131` — should locate `role-split/kan-131-curriculum-role-gating-uat.md` by greps, not `getJiraIssue`.

If any command still references Jira MCP tools, the old version is still installed — the replacement didn't land.
