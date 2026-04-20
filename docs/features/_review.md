# Tickets / Epics Flagged for Review

Items here were ported from Jira on 2026-04-19 but look stale or mis-filed. PM should triage: move, close, or rewrite before working on them.

## Likely-stale epics

### `design-prototype/` (KAN-34)
No open children as of 2026-04-19. Original intent was the Lovable prototype sync effort, which is moot now that Lovable is cancelled (2026-04-19) and the live app is on padi-mvp.vercel.app.
**Recommend:** close the epic; move any residual work to `role-split/` or `start-teaching-flow/`.

### `curriculum-pipeline/` (KAN-37)
No open children as of 2026-04-19. KAN-61 (curriculum flatten / PDF populate) lives under `ml-readiness-classifier/` (parent KAN-60). KAN-82 (Teaching Mode explanation) lives under `start-teaching-flow/`.
**Recommend:** close the epic, or fold it into `ml-readiness-classifier/` if any new curriculum-pipeline work appears.

### `website-improvements/` (KAN-91)
Epic summary wording still reads "Squarespace website improvements". The live site is on Vercel (see `project_website_hosting.md`), so the epic title is misleading but the child tickets (KAN-77, 81, 84–90) are still valid.
**Recommend:** rename the epic to drop the Squarespace reference; tickets are fine.

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
- **KAN-124 / KAN-125 / KAN-126** — three-signal positioning tickets. KAN-125 belongs in `assessments-grouping/`. KAN-124 and KAN-126 should probably live in `website-improvements/` or a new `positioning/` epic.

## How this file gets maintained

Treat `_review.md` as a work queue. When an item is resolved, delete its entry. Items with no action for >30 days should be escalated in the next PM board review.
