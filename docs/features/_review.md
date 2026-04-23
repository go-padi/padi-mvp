# Tickets / Epics Flagged for Review

Items here were ported from Jira on 2026-04-19 but look stale or mis-filed. PM should triage: move, close, or rewrite before working on them.

## Resolved 2026-04-22

- ✅ **`website-improvements/` (KAN-91) — DELETED.** A separate website repo owns these tickets now. All 9 child tickets + epic removed from this board.
- ✅ **`rubric-authoring/` (KAN-96) — DELETED.** Mona / KReading rubric work lives in a different project folder locally. All 14 child tickets + epic removed from this board.
- ✅ **KAN-131 — flipped `backlog` → `done`.** Shipped in commit `28dbdf5`.
- ✅ **BUG-role-save-400 — flipped `open` → `done`.** Shipped in commit `1462588`.
- ✅ **KAN-133 — re-prioritized `medium` → `low`, `defer_until: pre-launch`.** Analytics not on critical path; revisit after all critical features land.
- ✅ **`sign-in-flow/` — promoted to P0 epic.** `epic.md` + `SIGNIN-1` ticket created; existing CC prompt retained under `cc-prompt-signin-ux.md`.

## Still likely-stale epics

### `design-prototype/` (KAN-34)
No open children as of 2026-04-19. Original intent was the Lovable prototype sync effort, which is moot now that Lovable is cancelled (2026-04-19) and the live app is on padi-mvp.vercel.app.
**Recommend:** close the epic; move any residual work to `role-split/` or `start-teaching-flow/`.

### `curriculum-pipeline/` (KAN-37)
No open children as of 2026-04-19. KAN-61 (curriculum flatten / PDF populate) lives under `ml-readiness-classifier/` (parent KAN-60). KAN-82 (Teaching Mode explanation) lives under `start-teaching-flow/`.
**Recommend:** close the epic, or fold it into `ml-readiness-classifier/` if any new curriculum-pipeline work appears.

## Likely-stale tickets

### `_orphaned/kan-43-sync-lovable-prototype-with-codebase-uat.md`
Lovable was cancelled 2026-04-19. This UAT has no product left to test.
**Recommend:** close.

### `_orphaned/kan-95-transfer-google-workspace-billing-*.md`
"Transfer Google Workspace billing from Squarespace reseller to direct Google." Still valid if Google Workspace is still going through a Squarespace reseller. Otherwise close.
**Recommend:** confirm whether the billing transfer has already happened (Squarespace → direct) and close if so.

## Orphans to re-home

These live in `_orphaned/` because they have no epic parent in Jira. Each should either get a new epic or be attached to an existing one:

- **KAN-6 / KAN-13 / KAN-29 / KAN-30** — old "Logged Out Start Teaching" + "Teacher Dashboard" tickets. Possibly superseded by `start-teaching-flow/`. Review and either close or move.
- **KAN-48** — "Teacher knows they are logging observations for that specific student". Belongs in `start-teaching-flow/` next to KAN-51 (student context banner).
- **KAN-57** — "UAT: Student-centric teaching flow". Should be renamed to `kan-49-dev-student-centric-teaching-flow-uat.md` and moved into `start-teaching-flow/`.
- **KAN-124 / KAN-126** — three-signal positioning tickets. Originally flagged for `website-improvements/` or a new `positioning/` epic; `website-improvements/` is now deleted, so either fold into a positioning epic or close if covered by the external website repo.
- **KAN-125** — "Assessments: enforce three-signal status." Belongs in `assessments-grouping/`.

## How this file gets maintained

Treat `_review.md` as a work queue. When an item is resolved, move it under "Resolved <date>" above and delete the stale entry below. Items with no action for >30 days should be escalated in the next PM board review.
