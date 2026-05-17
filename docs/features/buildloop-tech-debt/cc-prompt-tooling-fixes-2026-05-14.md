---
id: CC-PROMPT-BLDTD-2026-05-14
title: "BuildLoop tooling fixes — 4 active bugs from 2026-05-14 loop"
type: cc-prompt
target: claude-code
created: 2026-05-14
related: BLDTD-01, BLDTD-02, BLDTD-03, BLDTD-04
---

# Task

Fix 4 active BuildLoop bugs observed across the 2026-05-13 and 2026-05-14 loops. All four are in the orchestrator (`phases.py`) or its associated subagent prompts. None are in Padi app code.

Apply each fix to **all 4 plugin file copies**:

```
~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/scripts/phases.py
~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/skills/buildloop/scripts/phases.py
~/Desktop/padi-app/padi-plugins/buildloop/scripts/phases.py
~/Desktop/padi-app/padi-plugins/buildloop/skills/buildloop/scripts/phases.py
```

For each fix: read the relevant function in ONE copy first to understand current code, plan the surgical change, then apply identically to all 4. Run `python3 -c "import ast; ast.parse(open('<path>').read())"` after each file to verify syntax.

---

## Fix 1 — Missing local feature branch on deploy_prod

### Symptom
Every iteration: deploy_prod tries to push `buildloop/<slug>` to origin, but the LOCAL branch doesn't exist. Manual workaround that was used during the runs: `git branch buildloop/<slug> HEAD` before each push.

### Root cause
The orchestrator commits to whatever branch is currently checked out (likely `main`), then tries to push that commit to a non-existent local `buildloop/<slug>`. The push fails (or, more likely, the orchestrator's git invocation creates a confusing state where the branch never gets named locally).

### Fix
In `phases.py`'s `deploy_prod` (or equivalent — search for the function that pushes to Vercel via the deploy hook AND the git push to origin). Before the push step, ensure the local branch exists at HEAD:

```python
feature_branch = state.get("feature_branch") or f"buildloop/{state.get('feature_slug')}"
# Create or reset local branch at current HEAD (idempotent)
subprocess.run(
    ["git", "-C", str(repo), "branch", "--force", feature_branch, "HEAD"],
    check=False,  # don't fail if branch exists at same SHA
)
```

If the existing code already uses `git checkout -B <branch>` somewhere in the build phase, that's fine and this fix may not be needed in deploy. Verify by checking if `feature_branch` is checked out before commits land — if so, the bug is elsewhere (maybe in the build phase failing to checkout properly). Inspect first.

### Verification
After this fix, an iteration's `feature_branch` should exist locally:
```bash
cd ~/Desktop/padi-app/padi-app-starter
git branch | grep "buildloop/lr-"
```
Should list every shipped branch from the loop. If any are missing, the fix didn't take.

---

## Fix 2 — Dev-server crash mid-run (high impact: 6 of 8 iters in last loop)

### Symptom
The UAT phase spawns `npm run dev`. The dev server crashes (port conflict, build error, or process killed unexpectedly). Required manual restart 6 out of 8 times in the 2026-05-14 loop. Without restart, UAT can't reach `localhost:3000` and the iteration pauses.

### Root cause (most likely)
Two contributing factors:
1. Previous iteration's dev server isn't being cleanly killed. The `finally:` block in the UAT phase does `os.killpg(os.getpgid(dev_proc.pid), signal.SIGTERM)`, but SIGTERM doesn't always work — the process may ignore it and linger, holding port 3000.
2. No pre-spawn check for port-3000 conflicts. New iteration's `npm run dev` collides with the old leftover process.

### Fix
Two changes to the UAT phase (`uat()` function):

**A. Pre-spawn cleanup — kill anything on port 3000 before launching:**

```python
# Before spawning dev_proc:
_kill_port_3000(repo)

def _kill_port_3000(repo):
    """Kill any process listening on port 3000. Best-effort, non-fatal."""
    try:
        # Find PID(s) holding port 3000
        proc = subprocess.run(
            ["lsof", "-ti", ":3000"],
            capture_output=True, text=True, timeout=5,
        )
        for pid in proc.stdout.strip().splitlines():
            if pid.strip():
                subprocess.run(["kill", "-9", pid.strip()], timeout=5)
                time.sleep(0.2)  # let the OS reclaim the port
    except Exception:
        pass  # best-effort
```

**B. More aggressive teardown — escalate to SIGKILL after a brief grace period:**

In the existing `finally:` block, replace the bare SIGTERM with a graceful-then-forceful sequence:

```python
finally:
    try:
        import os, signal
        pgid = os.getpgid(dev_proc.pid)
        os.killpg(pgid, signal.SIGTERM)
        # Give it 3 seconds to clean up
        for _ in range(30):
            if dev_proc.poll() is not None:
                break
            time.sleep(0.1)
        # Still alive? Force-kill the whole process group
        if dev_proc.poll() is None:
            os.killpg(pgid, signal.SIGKILL)
    except (ProcessLookupError, OSError):
        pass  # already dead
    # Always kill anything on :3000 as backstop
    _kill_port_3000(repo)
```

### Verification
- Run a 2-iter BuildLoop test. After iter 1's UAT, check:
  ```bash
  lsof -ti :3000   # should return nothing
  ```
  If empty, teardown works. If something's listed, teardown still leaks — escalate.
- The dev-server.log file in each iteration dir should NOT show port-already-in-use errors at startup of iter 2+.

---

## Fix 3 — UAT phase pre-flight sometimes fails after PASS (iters 5 + 8 of last loop)

### Symptom
After UAT PASSES, the next iteration's UAT pre-flight (dev server health check) fails. Manual dev-server restart resolves it.

### Root cause
**Same as Fix 2.** A PASS verdict transitions the orchestrator into deploy_prod, then `record`, then the NEXT iter's `pm_generate` etc. By the time the next iter's UAT spins up `npm run dev`, the previous iter's server may still be holding port 3000 (lingering process) OR may have crashed and left a stale port lock.

### Fix
**No additional code change required** — Fix 2's pre-spawn cleanup + aggressive teardown handles this case too. The `_kill_port_3000(repo)` call at the start of each UAT phase guarantees a clean slate even if the previous iter's teardown was incomplete.

### Verification
Same as Fix 2. After applying Fix 2, this issue should disappear.

---

## Fix 4 — UAT verdict file format strictness (BLDTD-03 root cause)

### Symptom
Iter 8 of the 2026-05-14 loop: the UAT agent wrote `UAT verdict: PASS` instead of `Verdict: PASS`. Orchestrator's regex (`l.strip().startswith("Verdict:")`) didn't match the `"UAT verdict:"` prefix, so the orchestrator couldn't extract the verdict and the iteration stalled.

### Root cause
Two-part:
1. **Orchestrator regex is too strict** — `startswith("Verdict:")` is brittle. Variants include `"UAT verdict:"`, `"## Verdict"`, `"**Verdict:** PASS"`, all of which should be valid.
2. **Agent prompt is too permissive** — the prompt says "write your verdict" without specifying the EXACT string format.

### Fix
**Part A — loosen the regex** in `phases.py` `uat()` function:

Replace:
```python
verdict_line = next((l for l in verdict_text.splitlines() if l.strip().startswith("Verdict:")), "")
if "PASS" in verdict_line:
    ...
```

With a more permissive extractor:

```python
import re

def _extract_verdict(text: str) -> str:
    """Extract PASS/FAIL/BLOCKED from a verdict file, tolerant of formatting."""
    # Try multiple patterns in order of specificity
    patterns = [
        # "Verdict: PASS" or "Verdict:  PASS" — strictest, line-level
        r"^\s*Verdict:\s*(PASS|FAIL|BLOCKED)\b",
        # "UAT verdict: PASS" / "## UAT Verdict: PASS" / "**Verdict:** PASS"
        r"(?:UAT\s+)?(?:##\s*)?(?:\*\*)?Verdict:?\*?\*?\s*(PASS|FAIL|BLOCKED)\b",
        # "## Verdict\n\nPASS" — markdown header, value on next non-blank line
        r"#+\s*Verdict\b[^\n]*\n+\s*(PASS|FAIL|BLOCKED)\b",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE | re.MULTILINE)
        if m:
            return m.group(1).upper()
    return ""

verdict = _extract_verdict(verdict_text)
if verdict == "PASS":
    ...
elif verdict == "BLOCKED":
    ...
elif verdict == "FAIL":
    ...
else:
    # Verdict unparseable — pause with a clear error
    record_error(state, "uat", 1, f"Verdict file present but no verdict marker found. Expected 'Verdict: PASS|FAIL|BLOCKED' on its own line.", str(verdict_path))
    pause(state, "uat verdict unparseable")
    return "pause"
```

**Part B — tighten the agent prompt** in the `PendingCoworkPhase` message:

In the `uat()` function, find the existing `raise PendingCoworkPhase(...)` call and update the prompt string to include explicit verdict format instructions:

```python
raise PendingCoworkPhase(
    f"Invoke the uat-tester subagent against http://localhost:3000 for feature {feature_slug}. "
    f"Verdict file: {verdict_path}. "
    f"Bug files (if any failures): {bugs_dir_str}/. "
    f"\n\n"
    f"VERDICT FORMAT — REQUIRED EXACTLY: the verdict file MUST contain a line "
    f"that starts with 'Verdict: ' (capital V, colon, space) followed by exactly "
    f"PASS, FAIL, or BLOCKED. Example: 'Verdict: PASS'. "
    f"Do NOT write 'UAT verdict:', '## Verdict', '**Verdict:**', or any other "
    f"variant. The orchestrator parses this line literally.",
    expected_path=verdict_path,
)
```

(The regex-loosening in Part A is still worth keeping — it's a defense-in-depth in case the agent slips. Belt + suspenders.)

### Verification
- Manually create a test verdict file with the `UAT verdict: PASS` format and run the orchestrator's UAT phase against it. Should now match.
- Check the prompt text in `phases.py` uat() function for the new "VERDICT FORMAT — REQUIRED EXACTLY" block.
- Update `docs/features/buildloop-tech-debt/bldtd-03-uat-verdict-format-regex.md` frontmatter `status: backlog` → `status: done` once this ships.

---

## Cross-cutting verification (after all 4 fixes)

After applying all four fixes to all four phases.py copies:

```bash
# 1. Syntax check every copy
for f in \
  ~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/skills/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-plugins/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-plugins/buildloop/skills/buildloop/scripts/phases.py; do
  python3 -c "import ast; ast.parse(open('$f').read())" && echo "OK $f" || echo "FAIL $f"
done

# 2. Confirm the new helpers exist in all 4
for f in <same 4 paths>; do
  echo "--- $(echo $f | sed 's|.*plugins/||') ---"
  grep -c "_kill_port_3000\|_extract_verdict" "$f"
done
# Each line should show "2" (one for each helper)

# 3. Confirm the new prompt text is present
grep -l "VERDICT FORMAT — REQUIRED EXACTLY" \
  ~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/skills/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-plugins/buildloop/scripts/phases.py \
  ~/Desktop/padi-app/padi-plugins/buildloop/skills/buildloop/scripts/phases.py
# Should list all 4 paths
```

## Ticket bookkeeping

After fixes ship:

1. Flip `docs/features/buildloop-tech-debt/bldtd-03-uat-verdict-format-regex.md` frontmatter to `status: done`.
2. **File a new BLDTD-05** for Fix 1 (missing local feature branch on deploy_prod) — it's not covered by any existing ticket.
3. **File a new BLDTD-06** for Fix 2 (dev-server crash + teardown). Note in the ticket that Fix 3 (UAT pre-flight after PASS) shares the root cause and is closed by the same patch.
4. Keep BLDTD-01, BLDTD-02, BLDTD-04 at `status: backlog` — they're separate issues, not addressed by this prompt.

## Commit message

When you commit (single commit covering all 4 file copies + ticket bookkeeping):

```
fix(buildloop): tooling patches from 2026-05-14 loop

- Fix 1: ensure local feature branch exists before deploy_prod push
- Fix 2: aggressive dev-server teardown + pre-spawn port-3000 cleanup
  (closes Fix 3's UAT pre-flight issue via shared root cause)
- Fix 3: loosen verdict regex + tighten agent prompt for verdict format

Applied to all 4 phases.py copies. Flip BLDTD-03 to done; file
BLDTD-05 + BLDTD-06 for Fix 1 and Fix 2.

Refs: BLDTD-03, BLDTD-05 (new), BLDTD-06 (new)
```

## Out of scope for this prompt

- BLDTD-01 (deploy_prod git add -A sweep) — separate fix, more invasive
- BLDTD-02 (UAT verdict file not reset between attempts) — separate
- BLDTD-04 (scratch_dir non-LR mismatch) — separate
- Migrating to a single canonical plugin location (the 4-copy architecture). Don't fix architecture today.

## Expected total time

~45 min:
- 5 min: read current phases.py uat() and deploy_prod() in one copy to understand structure
- 15 min: apply Fix 1 (deploy_prod) — small, surgical
- 10 min: apply Fix 2 (UAT teardown + port-3000 cleanup) — new helper function + finally-block edit
- 10 min: apply Fix 4 (regex + prompt) — new helper + prompt text update
- 5 min: 4-copy propagation + syntax checks + commit
