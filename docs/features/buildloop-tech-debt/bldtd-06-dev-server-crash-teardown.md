---
id: BLDTD-06
title: "[BuildLoop] dev-server lingers on port 3000 between iterations, crashing the next iter's UAT"
type: bug
status: done
priority: medium
handling: manual — fix outside BuildLoop (orchestrator self-edit is fragile)
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-17
created_by: cc-prompt-tooling-fixes-2026-05-14 (observed 6 of 8 iters in 2026-05-14 loop)
fixed_in: cc-prompt-tooling-fixes-2026-05-14 (4-copy patch: pre-spawn `_kill_port_3000` + aggressive teardown with SIGTERM-then-SIGKILL + port-3000 backstop)
closes_also: "UAT pre-flight after PASS sometimes fails (BLDTD-2 sibling)" — shared root cause with this ticket
---

### Goal

Stop the dev-server crash that occurred 6 of 8 times in the
2026-05-14 loop, requiring manual `pkill -f "next dev"; pnpm dev`
between iterations.

### Background

The UAT phase spawns `npm run dev` and then SIGTERMs it in the
`finally:` block. Two failure modes:

1. **SIGTERM-only teardown is incomplete.** Some Next.js dev
   processes ignore SIGTERM (or fork children that detach from the
   process group). The next iteration's `npm run dev` collides with
   the lingering process holding port 3000.
2. **No pre-spawn cleanup.** New iter assumes port 3000 is free,
   spawns, then crashes when the port is already in use.

This also explains the related symptom: after a UAT PASS, the next
iter's UAT pre-flight fails because the prior server didn't tear
down cleanly.

### Fix shipped

In `phases.py` `uat()`:

**A. Pre-spawn cleanup.** New helper `_kill_port_3000(repo)` runs at
the start of `uat()` BEFORE `subprocess.Popen(["npm", "run", "dev"])`:

```python
def _kill_port_3000(repo):
    try:
        proc = subprocess.run(["lsof", "-ti", ":3000"], capture_output=True, text=True, timeout=5)
        for pid in proc.stdout.strip().splitlines():
            if pid.strip():
                subprocess.run(["kill", "-9", pid.strip()], timeout=5)
                time.sleep(0.2)
    except Exception:
        pass
```

**B. Aggressive teardown** in the `finally:` block — SIGTERM, wait
up to 3 seconds, then SIGKILL the entire process group. Plus a
final `_kill_port_3000(repo)` backstop:

```python
finally:
    try:
        import os, signal
        pgid = os.getpgid(dev_proc.pid)
        os.killpg(pgid, signal.SIGTERM)
        for _ in range(30):
            if dev_proc.poll() is not None:
                break
            time.sleep(0.1)
        if dev_proc.poll() is None:
            os.killpg(pgid, signal.SIGKILL)
    except (ProcessLookupError, OSError):
        pass
    except Exception:
        pass
    _kill_port_3000(repo)
```

Applied to all 4 phases.py copies per cc-prompt-tooling-fixes-2026-05-14.

### Verification

After applying:
- Run a 2-iter loop. After iter 1's UAT, `lsof -ti :3000` should
  return nothing.
- Each iter's dev-server.log should not contain port-already-in-use
  errors at startup.

### Notes

- Closes the sibling "UAT pre-flight after PASS sometimes fails"
  symptom via the same patch.
- Sister fix: BLDTD-05 (missing local feature branch on deploy_prod),
  shipped in the same patch.
