# Tickets / Epics Flagged for Review

Items here were ported from Jira on 2026-04-19 but look stale or mis-filed. PM should triage: move, close, or rewrite before working on them.

## Resolved 2026-05-11

- ✅ **`_orphaned/` — DELETED.** All 11 tickets either superseded by the launch-readiness epic, marked done, or moved to `daily-tasks.md` (KAN-95 Google Workspace billing).
- ✅ **`assessments-grouping/` cleanup.** Standalone route retired in LR-03; epic.md marked superseded by LR-13. KAN-45, KAN-46, KAN-83 deleted (route gone).
- ✅ **`teacher-resources/` cleanup.** KAN-78 deleted; epic deferred to v1.1 (LR-07 hid the route).
- ✅ **Duplicate LR-15 file deleted.** Kept `lr-15-match-go-padi-marketing-copy.md`.
- ✅ **KAN-50 / KAN-53 / KAN-63** marked superseded with pointers to LR-10 / LR-09.
- ✅ **`role-split/` epic** flipped `in-progress` → `shipped`. All six children landed plus LR-06 nav layer.
- ✅ **BuildLoop iteration scratch** (`lr-01..lr-08` top-level folders) consolidated under `launch-readiness/iterations/`.

## Resolved 2026-04-22

- ✅ **`website-improvements/` (KAN-91) — DELETED.** A separate website repo owns these tickets now.
- ✅ **`rubric-authoring/` (KAN-96) — DELETED.** Mona / KReading rubric work lives in a different project folder locally.
- ✅ **KAN-131 — flipped `backlog` → `done`.** Shipped in commit `28dbdf5`.
- ✅ **BUG-role-save-400 — flipped `open` → `done`.** Shipped in commit `1462588`.
- ✅ **KAN-133 — re-prioritized `medium` → `low`, `defer_until: pre-launch`.** Analytics not on critical path.
- ✅ **`sign-in-flow/` — promoted to P0 epic.** `epic.md` + `SIGNIN-1` ticket created; existing CC prompt retained under `cc-prompt-signin-ux.md`.

## Still likely-stale epics

### `design-prototype/` (KAN-34)
No open children. Original intent was the Lovable prototype sync effort, which is moot now that Lovable is cancelled (2026-04-19) and the live app is on padi-mvp.vercel.app.
**Recommend:** close the epic; move any residual work to `role-split/` or `start-teaching-flow/`.

### `curriculum-pipeline/` (KAN-37)
No open children. KAN-61 lives under `ml-readiness-classifier/`. KAN-82 lives under `start-teaching-flow/`.
**Recommend:** close the epic, or fold into `ml-readiness-classifier/` if any new curriculum-pipeline work appears.

## How this file gets maintained

Treat `_review.md` as a work queue. When an item is resolved, move it under the most recent "Resolved <date>" above and delete the stale entry below. Items with no action for >30 days should be escalated in the next PM board review.
