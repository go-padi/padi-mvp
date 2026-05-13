---
id: BLDTD-01
title: "[BuildLoop] deploy_prod's `git add -A` sweeps unrelated working-tree changes into the iteration commit"
type: bug
status: backlog
priority: medium
feature: buildloop-tech-debt
launch_blocker: false
created: 2026-05-12
created_by: lr-09c-deploy-2026-05-12
repro_commit: 723ca2f
---

### Goal

Iteration commits should contain ONLY the changes that iteration
produced. Today, `phases.py`'s `deploy_prod` (and likely the `record`
phase) uses `git add -A` followed by `git commit`, which stages
anything in the working tree — including unrelated changes the
operator was authoring in a parallel session.

### Background

On 2026-05-12, BuildLoop iter-4 shipped LR-09c. The deploy_prod step
swept ~80% unrelated changes into the iteration commit
(`723ca2f`). Inventory of what got bundled:

- `docs/daily-tasks.md` (parallel PM edit)
- 3 bug ticket deletions (`bugs/kan-58`, `kan-59`, `kan-72`)
- `docs/features/launch-readiness/epic.md` (parallel PM edit)
- `docs/features/launch-readiness/lr-10-allow-lesson-reentry.md` (parallel PM edit)
- 5 newly authored tickets (`lr-17`, `lr-18`, `lr-19`, `lr-20`, `lr-21`)
- `docs/walkthroughs/walkthrough-2026-05-11-parent.md` (new research doc)

The commit message read `"BuildLoop iteration 4: LR-09c"` but the
diff was dominated by unrelated PM work. Functionally fine — nothing
was lost or broken — but the commit history is misleading and the
sweep is non-deterministic (depends on whatever's dirty at deploy time).

**Why this matters more next time:**
- If half-finished WIP from another branch is in the working tree,
  it could ship to prod silently.
- A migration file authored separately could land without review.
- The "diff per iteration" used for retros/audits no longer
  represents the iteration's actual work.

### Repro

1. Start a BuildLoop run: `/buildloop:buildloop-start 3`
2. While it's running, modify any file outside the iteration scope
   (e.g. `docs/daily-tasks.md` or another feature folder).
3. Watch the iteration commit when `deploy_prod` fires — the
   unrelated file is staged + committed under the iteration's
   commit message.

### Requirements

Two reasonable fixes, pick one:

**Option A: snapshot + delta (safer)**
1. At pm_generate start, capture the working-tree state via
   `git status --porcelain` and store the dirty-file list in
   iteration state (`.buildloop/iterations/NNN/dirty-at-start.json`).
2. At deploy_prod, stage only files NOT in the start-of-iteration
   dirty list — that's the delta the iteration produced.
3. If the iteration produced no in-scope changes, fall back to the
   existing no-op detection (commit nothing, surface the issue).

**Option B: explicit path allowlist (simpler)**
1. At deploy_prod, run `git add` with a curated allowlist of paths:
   - `app/`, `components/`, `lib/`, `supabase/`, `public/`
   - `docs/features/<current-feature-slug>.md` (the ticket file
     itself if PM phase edited it)
   - `docs/features/launch-readiness/iterations/<slug>/uat/` and
     `bugs/` (the iteration's scratch — already routed there via
     `_scratch_dir`)
   - `docs/features/SHIPPED.md` (the record phase appends here)
2. Anything outside the allowlist stays unstaged. Operator's
   parallel PM work is preserved on disk and can be committed
   manually.

Recommend **Option B** for v1 — simpler, deterministic, easier to
audit. Option A is the long-term right answer but Option B retires
the bug fast.

### Acceptance Criteria

**Happy Path**
Given BuildLoop is running iter-N for feature F
And the operator modifies `docs/daily-tasks.md` (unrelated) during the
run
When deploy_prod fires
Then the iteration commit `BuildLoop iteration N: F` contains only
changes to allowlisted paths (or only the iteration's delta, per
chosen option)
And `docs/daily-tasks.md` remains modified on disk but unstaged after
the commit

**Edge State — no iteration changes**
Given the build phase made no code changes (no-op build detected
upstream by the existing patch)
When deploy_prod fires
Then no commit is made
And the loop pauses with `build no-op` (existing behavior)

**Audit**
Given a developer reads the git log for an iteration commit
When they look at the diff
Then the changes match what the iteration ticket actually built —
no unrelated files

### Out of Scope

- Restructuring the `record` phase's commit (separate but related —
  the `chore(board)` follow-up commit also uses `git add -A` and may
  need the same treatment).
- Migrating BuildLoop to a per-iteration worktree (proper isolation,
  but much bigger change).
- Anything related to `--scope=docs-only` or hybrid commits.

### Notes

- Apply the patch to all four `phases.py` copies (same drill as the
  other tooling patches — `_scratch_dir`, `--permission-mode`,
  bugs glob).
- The `record` phase also commits things — verify what it stages.
- Found via: LR-09c deploy on 2026-05-12. Operator was authoring
  the parent walkthrough audit in a parallel Cowork session while
  BuildLoop was running.
- **Not launch-blocking** — git history cleanup is a quality-of-life
  fix, not a correctness fix. Defer to post-launch unless WIP from
  another branch ships unintentionally.
