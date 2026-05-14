---
id: BLDTD-02
title: "[BuildLoop] UAT phase re-reads stale verdict file after eng_fix; doesn't reset between attempts"
type: bug
status: backlog
priority: high
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-13
created_by: 2026-05-13-loop-iter-2-and-iter-8
---

### Goal

When UAT FAILS and eng_fix patches the code, the loop re-runs validate
→ uat. But the `uat` phase reads the existing verdict file and may
match the OLD verdict (PASS or FAIL or BLOCKED) from the previous
attempt. The verdict file should be deleted (or moved to an
attempt-numbered name) between attempts so the new run writes fresh.

### Background

Surfaced twice in the 2026-05-13 loop:
- Iter 2 (LR-17): UAT FAIL → eng_fix → re-validate succeeded but
  orchestrator re-read the old FAIL verdict and looped.
- Iter 8 (LR-22): same pattern.

Today the verdict path is `_scratch_dir(repo, state) / "uat" / f"{feature_id}-uat.md"`
and the orchestrator checks for the file's existence + a `Verdict:` line.
After eng_fix, the agent rewrites the same file with a new verdict, but
if the agent writes to a slightly different filename (or appends), the
orchestrator sees the old verdict.

### Requirements

1. **At the start of each UAT phase attempt** (after eng_fix or
   after build/validate succeeds), delete or rename the existing
   verdict file so the new run starts clean. Recommend renaming to
   `<feature_id>-uat-attempt-{N-1}.md` for audit trail.
2. **The orchestrator should also assert** the verdict file's mtime
   is newer than `last_phase_end_at` to catch the case where the
   agent didn't actually write a new file.
3. **Update the UAT prompt** (in `phase-prompts.md` or the inline
   prompt in `phases.py`'s `uat()` function) to explicitly say
   "delete or overwrite the verdict file from any previous attempt."

### Acceptance Criteria

**Happy Path**
Given UAT FAIL on attempt 1 → eng_fix patches → validate passes →
UAT attempt 2 runs
When the orchestrator checks the verdict file
Then it reads ONLY the attempt-2 verdict, never attempt-1's verdict

**Audit**
Given attempt 1 wrote a verdict, attempt 2 rewrote it
When the loop archives iteration artifacts
Then both verdicts are preserved (renamed: `-uat-1.md` and `-uat.md`)
so the audit trail shows the FAIL → PASS arc

### Out of Scope

- Restructuring the orchestrator's phase dispatch.
- Adding a verdict-history database table.

### Notes

- Files to edit: `phases.py` `uat()` and `uat_staging()` functions.
- Apply to all 4 plugin file copies (per the established 4-copy pattern).
- Related: BLDTD-03 (verdict format regex too strict — different bug).
