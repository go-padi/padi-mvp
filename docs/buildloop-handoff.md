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
