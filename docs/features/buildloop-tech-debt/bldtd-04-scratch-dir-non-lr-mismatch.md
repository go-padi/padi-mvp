---
id: BLDTD-04
title: "[BuildLoop] _scratch_dir routes non-LR tickets to legacy path but agent prompt points at iterations/ path"
type: bug
status: backlog
priority: high
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-13
created_by: 2026-05-13-loop-iter-4
related: BLDTD-02
---

### Goal

The `_scratch_dir(repo, state)` helper added in 2026-05-11 routes
LR-* tickets to `docs/features/launch-readiness/iterations/<slug>/`
and falls back to legacy `docs/features/<slug>/` for non-LR
feature_ids. But the orchestrator's PendingCoworkPhase prompt — the
one passed to the uat-tester subagent — was authored assuming the
iterations/ path always. Result: when PM files a non-LR ticket
mid-loop (like KAN-143 from an LR-18a eng_fix follow-up), the agent
writes the verdict to one place and the orchestrator looks in
another. Loop stalls; verdict must be moved manually.

### Background

Surfaced in iter 4 (KAN-143) of the 2026-05-13 loop. PM filed KAN-143
as a follow-up bug from LR-18a's UAT, so its feature_id is KAN-143
(non-LR). `_scratch_dir` returned the legacy
`docs/features/kan-143-<slug>/` path. But the UAT prompt told the
agent to write to `docs/features/launch-readiness/iterations/kan-143-<slug>/`.
File ended up at the agent-chosen path; orchestrator missed it.

The root cause is that the UAT prompt I wrote on 2026-05-11 was:

```python
bugs_dir_str = str(_scratch_dir(repo, state) / "bugs")
verdict_path = _scratch_dir(repo, state) / "uat" / f"{feature_id}-uat.md"
raise PendingCoworkPhase(
    f"... write its verdict to {verdict_path} ... bug files MUST live under {bugs_dir_str}/ "
    f"(NOT under docs/features/{feature_slug}/bugs/ ...) ...",
)
```

For LR-* tickets this is correct. For KAN-* tickets, both
`_scratch_dir(...)` AND `docs/features/{feature_slug}/` resolve to
the SAME path (the legacy fallback). So the prompt's negation
("NOT under docs/features/...") is confusing the agent — it's
telling the agent NOT to use the very path the orchestrator is
actually expecting.

### Requirements

1. **Make the prompt unambiguous regardless of LR vs non-LR.** Use
   the actual resolved path (`_scratch_dir(repo, state)`) without
   the contradictory negation. Recommended replacement:

   ```python
   scratch = _scratch_dir(repo, state)
   raise PendingCoworkPhase(
       f"Invoke the uat-tester subagent against http://localhost:3000 for feature {feature_slug}. "
       f"Verdict file: {scratch / 'uat' / f'{feature_id}-uat.md'}. "
       f"Bug files (if any failures): {scratch / 'bugs'}/. "
       f"Do not write either to any other location.",
       expected_path=verdict_path,
   )
   ```
2. **Apply to all 4 plugin file copies.**
3. **Verify after fix** that both LR-* and KAN-* tickets find their
   verdict files where the orchestrator expects.

### Acceptance Criteria

**Happy Path — LR ticket**
Given a feature with `feature_id` starting with `LR-`
When the UAT phase fires
Then the verdict path and bugs path both point under
`docs/features/launch-readiness/iterations/<slug>/`
And the agent writes there
And the orchestrator reads from there

**Happy Path — non-LR ticket (KAN, BLDTD, etc.)**
Given a feature with any other `feature_id` prefix
When the UAT phase fires
Then the verdict path and bugs path both point under
`docs/features/<slug>/`
And the agent writes there
And the orchestrator reads from there

### Out of Scope

- Migrating ALL feature folders to a unified `iterations/<slug>/`
  layout (would require updating `_scratch_dir` to always route
  there, which is more disruptive).
- Tracking the feature_id → epic mapping more rigorously (today it's
  implicit via the LR- prefix).

### Notes

- Files to edit: `phases.py` UAT prompt construction.
- Apply to all 4 plugin file copies.
- Related: BLDTD-02 (stale verdict — different bug, but same uat()
  function).
