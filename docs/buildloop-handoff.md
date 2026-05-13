# BuildLoop — Session Handoff

State as of 2026-05-09. Drop this into a new chat session if context gets thin.

## What we built

**BuildLoop** — an autonomous feature-shipping loop for Padi (the multisensory K-reading teacher app, Next.js + Supabase, pre-launch). Plugin orchestrates this chain per iteration:

`pm_generate → spar (PM + Design) → eng_scope (with dependency-detection + analytics-events) → build (Claude Code CLI) → validate (tsc/build/test) → uat (uat-tester subagent vs localhost:3000) → eng_fix (on UAT fail, retry) → deploy_prod (Vercel hook) → record → next iteration`

Default 3 iterations. Built-in retry caps. Pauses on real failures (build, UAT, deploy, dependency blockers, supabase migrations).

## Plugins installed

- `buildloop` — the orchestrator (this conversation built it)
- `padi-pm` — PM phase + ticket conventions
- `padi-design` — Design spar + north-star
- `padi-uat-agent` — UAT subagent
- `engineering` — eng-scope brief writer (out-of-the-box Anthropic plugin)

## File paths that matter

- **Plugin source (edit here):** `~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/`
- **CC plugin (symlinked to source):** `~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0/`
- Phase prompts: `.plugins/buildloop/skills/buildloop/references/phase-prompts.md`
- Orchestrator: `.plugins/buildloop/skills/buildloop/scripts/orchestrator.py`
- Slash commands: `.plugins/buildloop/commands/buildloop-{init,start,step,stop,resume,status}.md`
- BuildLoop state: `~/Desktop/padi-app/padi-app-starter/.buildloop/state.json`
- Shipped log: `~/Desktop/padi-app/padi-app-starter/docs/features/SHIPPED.md`
- Symlink helper: `~/Desktop/padi-app/padi-app-starter/STAGED-symlink-buildloop.sh`
- PM hardening notes (already applied): `outputs/STAGED-pm-hardening.md`

## What's hardened (already applied)

1. **PM git-log cross-check** — pm_generate now greps `git log --grep=<id>` and `git log -- <files>` before drafting. Won't pick already-shipped tickets like SIGNIN-1 did.
2. **Dependency detection in spar** — when Design or PM identifies a missing prereq feature, files a new ticket and (if blocker-grade) pauses the loop for reprioritization.
3. **Dependency detection in eng_scope** — verifies AC prereqs exist on `main` before writing the brief; emits `BLOCKER:` marker line if not.
4. **Analytics events directive** — eng_scope must enumerate analytics events for new user actions; build phase wires them or leaves `// TODO(analytics):` markers. Reference `lib/analytics.ts` (doesn't exist yet — see KAN-137).
5. **Auto-chain in slash commands:**
   - `/buildloop-start N` runs all phases of all N iterations end-to-end. No `/buildloop-step` between phases.
   - `/buildloop-step --all` (or `--continue` / `--finish`) auto-chains a running/paused loop to completion.
   - `/buildloop-step` without args still does single-step (debug).

## Dashboard

- Cowork artifact: `padi-app-dashboard`
- Scheduled task: `refresh-padi-app-dashboard` (manual trigger; ~60s per refresh after first run)
- Refresh button on the dashboard fires the scheduled task → 90s countdown → auto-reload
- Sections: status banner, "What changed since last refresh" (user/problem framing per ship), "In flight," "Pick back up here" (todos derived from state + file checks), "What's changing in the app" (route heat-map), "Recently shipped" timeline

## Current loop state (when this doc was written)

- `iteration: 2 / 3`, `phase: build`, `status: running`
- `feature_id: KAN-132` (role-neutral copy pass)
- Iteration 1 SHIPPED: `SIGNIN-2` (sign-in modal polish), 0 UAT bugs, 0 build retries — clean run
- Currently building iter 2; iter 3 still to go

## Open todos (pickup)

| Todo | Side | Status |
|---|---|---|
| Run symlink script | code | DONE |
| Apply PM hardening | cowork | DONE |
| Auto-chain in slash commands | cowork | DONE |
| Bulk-fix stale ticket statuses (KAN-80, KAN-82, KAN-48, FOLLOWUP-teacher-landing-gating) | cowork | OPTIONAL — worth ~3 min, would prevent future false picks |
| KAN-137 analytics util (PostHog) | cowork | FILED at `priority: medium`, `launch_blocker: true`. Bump to `priority: highest` before launch and PM will pick it up. |
| Wire SIGNIN-2's `// TODO(analytics)` once KAN-137 ships | code | After KAN-137 |

## Known unsolved

- **Cowork "save here" plugin upload fails silently.** Server rejects, no error in any log file we checked. Sidestepped by symlink — irrelevant unless you want to publish BuildLoop externally. To debug for real: open Cowork DevTools (Cmd+Opt+I) → Network tab → save → look at the failing response.

## Known gotcha — CC reads a stripped slash command when symlink is missing (2026-05-12)

**Symptom:** Auto-chain stops at the first Cowork-resident phase. CC
prints something like "orchestrator signaled pm_generate is
Cowork-pending. Run /buildloop-step to fire pm_generate" instead of
executing the phase inline. The patched `buildloop-start.md` has
explicit `DO NOT STOP` directives — but CC isn't seeing them.

**Cause:** When `~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0`
doesn't exist (or isn't a valid symlink), CC's harness falls back to
a relayed/stripped version of the slash command without the auto-chain
WHILE loop and pseudocode. The source file is fine; the discovery path
is broken.

**Diagnostic:** In CC, run:
```bash
grep -c "DO NOT STOP" ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0/commands/buildloop-start.md
```
- Returns `2` → patched file is reachable, CC just needs to actually read it.
- Returns `0` or errors → symlink is broken; fall back to stripped relay.

**Fix:** Recreate the symlink. The exact commands:
```bash
mkdir -p ~/.claude/plugins/cache/padi-plugins/buildloop
rm -rf ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0
ln -sfn ~/Desktop/padi-app/padi-app-starter/.plugins/buildloop ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0
```

The symlink has been nuked at least three times across the project's
life (2026-05-08, 2026-05-10, 2026-05-12). Long-term fix is to either
add a launchd job that recreates it on login, or stop relying on
symlink discovery entirely. Deferred until post-launch.

**Workaround when running and the symlink is broken:** tell CC to
`Read` the source file directly (`~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/commands/buildloop-start.md`)
and follow those instructions. CC will then have the patched pseudocode
in its context and run the auto-chain correctly.

## Known gotcha — deploy_prod sweeps unrelated changes (2026-05-12)

The orchestrator's `deploy_prod` (and likely `record`) phase uses
`git add -A` before committing. If you edit anything in the working
tree while BuildLoop is running, those changes get swept into the
iteration commit under a misleading message. Found via LR-09c's
2026-05-12 deploy (commit `723ca2f` — see
`docs/features/buildloop-tech-debt/bldtd-01-deploy-scope.md`).

**Workaround for now:** either commit your unrelated PM/docs work
BEFORE starting the loop, or accept that whatever's dirty gets
bundled. Functionally fine; just be aware the commit history isn't
literal.

**Fix tracked in:** `docs/features/buildloop-tech-debt/bldtd-01-deploy-scope.md`. Not launch-blocking; deferred to post-launch.

## Plugin file divergence (2026-05-10) — patches persisted

There are FOUR copies of the orchestrator's Python files spread across two roots and two depths:

- `~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/scripts/` (in-app, top)
- `~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/skills/buildloop/scripts/` (in-app, nested)
- `~/Desktop/padi-app/padi-plugins/buildloop/scripts/` (sibling, top)
- `~/Desktop/padi-app/padi-plugins/buildloop/skills/buildloop/scripts/` (sibling, nested)

During the 8-iteration launch-readiness run, tooling patches landed in the sibling root but never propagated to the in-app overlay. On 2026-05-10 the following patches were applied to ALL four copies (so it doesn't matter which one CC loads):

- **`claude_cli.py`:** `cmd = ["claude", flag, "--permission-mode", "acceptEdits", "--", prompt]` and matching `cmd[4:4]` slice for `extra_args`. *Exception:* sibling NESTED keeps `--dangerously-skip-permissions` — that was a deliberate later setting for fully-headless ops; leave it.
- **`phases.py`** in `build()`: no-op build detection after CLI exit 0. Runs `git status --porcelain`; if working tree is unchanged, pauses with `build no-op`. Prevents advancing to validate on phantom progress (CC silently gave up on an unsurfaced permission prompt).
- **`phases.py`** in `eng_fix()`: bugs glob broadened from `*-bug.md` to `*bug*.md`. Matches both `<slug>-bug.md` (suffix style) AND `<id>-bug-<slug>.md` (the uat-tester agent's actual write pattern).

PHASE_PROMPTS_PATH was left location-specific in each copy — top-level uses `parent.parent / "skills" / "buildloop" / "references"`, nested uses `parent.parent / "references"`. Don't homogenize that field.

### Tech debt (defer until post-launch)

Four-copy architecture is brittle and will diverge again. Recommended cleanup:
1. Pick ONE canonical location. Recommendation: `~/Desktop/padi-app/padi-app-starter/.plugins/buildloop/` (in-app, top). Reason: lives in the repo CC operates on, ships with the source.
2. Delete the in-app nested copy (`.plugins/buildloop/skills/buildloop/scripts/`) — only the SKILL.md needs to live under `skills/buildloop/`, not duplicate Python.
3. Decide whether `~/Desktop/padi-app/padi-plugins/` stays as a publish target or gets deleted. If publishing externally, symlink scripts/ from in-app rather than copy.
4. The symlink at `~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0` should point to whichever single canonical location remains.

Not doing this now: user is in launch mode, BuildLoop currently works, refactoring file layout while shipping features risks breaking the loop mid-run.

## North star + brief

- North star metric: **Activated users** = signed up + role picked + ≥1 student created + ≥1 lesson completed
- Brief: `~/Desktop/padi-app/padi-app-starter/.buildloop/product-brief.md`

## How user wants to work

- 3 features at a time, hands-off, no per-step approvals
- Direct answers, not preachy
- Cowork dashboard refresh: button-driven snapshot is fine, doesn't need true real-time
- Symlink handles plugin-edit sync; no need to fight Cowork's save
- Keep responses concise, frame changes in user/problem terms when relevant

## Quickstart for next session

```bash
# Are we still synced?
ls -la ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0   # should show -> .plugins/buildloop

# What's the loop doing?
cat ~/Desktop/padi-app/padi-app-starter/.buildloop/state.json | head -20

# Open CC in the repo
cd ~/Desktop/padi-app/padi-app-starter
claude

# Inside CC: kick off or finish
/buildloop-start 3        # fresh run, auto-chain
/buildloop-step --all     # finish a running/paused loop
/buildloop-status         # check state
/buildloop-stop --now     # halt mid-phase
```
