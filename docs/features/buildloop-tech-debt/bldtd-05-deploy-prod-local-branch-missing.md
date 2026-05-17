---
id: BLDTD-05
title: "[BuildLoop] deploy_prod / deploy_staging push fails because local feature branch doesn't exist"
type: bug
status: done
priority: medium
handling: manual — fix outside BuildLoop (orchestrator self-edit is fragile)
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-17
created_by: cc-prompt-tooling-fixes-2026-05-14 (observed across 2026-05-13 and 2026-05-14 loops, plus the 2026-05-17 loop)
fixed_in: cc-prompt-tooling-fixes-2026-05-14 (4-copy patch: `git branch --force feature_branch HEAD` inserted before push in both deploy_staging and deploy_prod)
---

### Goal

Eliminate the recurring "git push feature branch failed: src refspec
buildloop/<slug> does not match any" failure that fired on EVERY
iteration of the 2026-05-13, 2026-05-14, and 2026-05-17 loops.

### Background

The deploy_prod / deploy_staging phases commit the build agent's
working tree to whatever branch is currently checked out (typically
`main`), then attempt `git push origin buildloop/<slug>`. The push
fails because the local branch `buildloop/<slug>` doesn't exist —
the orchestrator never created it.

Manual workaround used in every loop was:

```bash
git branch buildloop/<slug> HEAD
```

before the push. The fix inlines this into the orchestrator.

### Fix shipped

In `phases.py` `deploy_staging()` and `deploy_prod()`, after the
`commit` step and BEFORE the `push origin feature_branch` step:

```python
# Ensure local feature branch exists at HEAD before push (BLDTD-05).
_git(["branch", "--force", feature_branch, "HEAD"], repo)
```

`--force` makes it idempotent (existing branch is reset to HEAD,
same SHA, no-op). `_git()` swallows the return code (return value
unused) since the operation is best-effort defensive.

Applied to all 4 phases.py copies per cc-prompt-tooling-fixes-2026-05-14.

### Verification

After a successful loop iteration, the local repo should have the
feature branch present:

```bash
git branch | grep "buildloop/lr-"
# Should list every shipped branch from the loop
```

### Notes

- Sister fix: BLDTD-06 (dev-server crash + teardown), shipped in the
  same patch.
- Closes the symptom: future loops should NOT hit "src refspec does
  not match any" on push.
