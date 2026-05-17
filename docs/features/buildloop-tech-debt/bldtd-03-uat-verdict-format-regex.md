---
id: BLDTD-03
title: "[BuildLoop] UAT verdict regex misses `## Verdict` markdown header style"
type: bug
status: done
priority: medium
handling: manual — fix outside BuildLoop (orchestrator self-edit is fragile)
fixed_in: cc-prompt-tooling-fixes-2026-05-14 (4-copy patch: _extract_verdict helper + tightened agent prompt)
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-13
created_by: 2026-05-13-loop-iter-8
---

### Goal

The orchestrator's UAT phase looks for a verdict line matching
`Verdict: PASS|FAIL|BLOCKED`. But the uat-tester agent sometimes
writes the verdict as a markdown header instead:

```
## Verdict

PASS
```

or:

```
## Verdict: PASS
```

Both forms are valid markdown but the current regex
`l.strip().startswith("Verdict:")` matches only the line-style form.
Result: the orchestrator can't find the verdict and either loops or
pauses incorrectly.

### Background

Surfaced in iter 8 (LR-22) of the 2026-05-13 loop. Agent wrote
verdict as a markdown header; orchestrator couldn't parse it; loop
required manual intervention to advance.

Two fixes possible:

**Option A — Loosen the regex.** Match any of:
- `Verdict: <X>` (line style — current)
- `## Verdict\n<X>` (header style, value on next line)
- `## Verdict: <X>` (header with inline value)
- `**Verdict:** <X>` (bold style)

**Option B — Tighten the agent prompt.** Tell the uat-tester subagent
EXACTLY where and how to write the verdict line: `"Verdict: PASS"` on
its own line, not as a markdown header.

Recommend **both**: loosen the regex (more robust to agent drift) AND
tighten the prompt (fewer drifts to begin with).

### Requirements

1. **Regex update** in `phases.py`'s `uat()` function. Replace:
   ```python
   verdict_line = next((l for l in verdict_text.splitlines() if l.strip().startswith("Verdict:")), "")
   ```
   With something that handles all 4 forms above. Recommend a helper:
   ```python
   def _extract_verdict(text: str) -> str:
       # Match "Verdict: X", "## Verdict: X", "**Verdict:** X" on any line
       inline = re.search(r"(?:#+\s*|\*\*)?\s*Verdict:\s*\*?\*?\s*(PASS|FAIL|BLOCKED)", text)
       if inline:
           return inline.group(1)
       # Match "## Verdict\n\nPASS" header-then-value form
       header = re.search(r"#+\s*Verdict\s*\n+\s*(PASS|FAIL|BLOCKED)", text)
       if header:
           return header.group(1)
       return ""
   ```
2. **Prompt update** in the uat-tester subagent prompt: explicit
   "Write the verdict on its own line as `Verdict: PASS` (or FAIL /
   BLOCKED). Do NOT use a markdown header for the verdict."
3. **Apply to all 4 plugin file copies.**

### Acceptance Criteria

**Happy Path — line style**
Given a UAT verdict file containing `Verdict: PASS`
When the orchestrator parses the verdict
Then it extracts "PASS"

**Happy Path — header style**
Given a UAT verdict file containing `## Verdict\n\nPASS`
When the orchestrator parses the verdict
Then it extracts "PASS"

**Happy Path — bold style**
Given a UAT verdict file containing `**Verdict:** FAIL`
When the orchestrator parses the verdict
Then it extracts "FAIL"

**Error State — no verdict**
Given a UAT verdict file with no recognizable verdict marker
When the orchestrator parses
Then it returns empty string AND the orchestrator pauses with a
clear "verdict not found, agent must write `Verdict: PASS|FAIL|BLOCKED`"
error message

### Out of Scope

- Restructuring the UAT verdict file format entirely (separate ticket
  if we want to switch to YAML frontmatter).

### Notes

- Files to edit: `phases.py` `uat()`, `uat_staging()`, and the uat-tester
  subagent system prompt (in `padi-uat-agent` plugin).
- Related: BLDTD-02 (stale verdict file — different bug).
