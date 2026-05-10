---
id: HOUSEKEEPING-close-stale-statuses
title: "[CC prompt] Commit stale-status doc fixes before iter 3 pm_generate"
type: chore
feature: housekeeping
priority: high
status: ready-for-cc
created: 2026-05-10
related: KAN-80, KAN-82, KAN-48, FOLLOWUP-teacher-landing-gating
---

### Why this prompt exists

Four feature docs were stuck at pre-ship statuses on `main` even though the
work shipped weeks ago. PM's git-log cross-check (added in the PM hardening
pass) catches them, but only if the doc frontmatter accurately reflects ship
state. These four were drifting and risked being re-picked by `pm_generate`.

The Cowork session on 2026-05-10 edited the four doc files in place on the
current BuildLoop branch (`buildloop/kan-132-role-neutral-copy`). Cowork
cannot commit from its sandbox (mount permissions block `.git/index.lock`
removal), so this CC prompt asks you to land the commit.

### Files already edited on disk (uncommitted)

| Doc | Frontmatter change |
|---|---|
| `docs/features/assessments-grouping/kan-80-align-all-assessment-outcome-language-to-3-signal-north-star.md` | `status: review → done`, added `shipped_in: 65ad712`, bumped `updated` |
| `docs/features/start-teaching-flow/kan-82-teaching-mode-toggle-needs-explanation-new-teachers-don-t-kn.md` | `status: review → done`, added `shipped_in: 65ad712`, bumped `updated` |
| `docs/features/_orphaned/kan-48-teacher-knows-they-are-logging-observations-for-that-specifi.md` | `status: backlog → done`, added `shipped_in: d922536`, bumped `updated` |
| `docs/features/role-split/followup-kan-135-teacher-landing-gating.md` | `status: review → done`, added `shipped_in: 051da35 (PR #5)`, bumped `updated` |

Diffs are body-untouched, frontmatter-only. `git diff --stat docs/features/`
shows 4 files, 12 insertions, 8 deletions.

### What CC should do

1. **Verify the diffs match the table above.** Run:
   ```bash
   git diff docs/features/_orphaned/kan-48*.md \
            docs/features/assessments-grouping/kan-80*.md \
            docs/features/role-split/followup-kan-135-teacher-landing-gating.md \
            docs/features/start-teaching-flow/kan-82*.md
   ```
2. **Land them as a separate commit on the current branch** (do not bundle
   with KAN-132's iter-2 work — keep the PR diff clean):
   ```bash
   git add docs/features/_orphaned/kan-48-teacher-knows-they-are-logging-observations-for-that-specifi.md \
           docs/features/assessments-grouping/kan-80-align-all-assessment-outcome-language-to-3-signal-north-star.md \
           docs/features/role-split/followup-kan-135-teacher-landing-gating.md \
           docs/features/start-teaching-flow/kan-82-teaching-mode-toggle-needs-explanation-new-teachers-don-t-kn.md
   git commit -m "docs(features): close shipped tickets — KAN-80, KAN-82, KAN-48, FOLLOWUP-teacher-landing-gating

PM was re-picking these because main reflected pre-ship statuses.
Frontmatter only; bodies untouched. Each ticket now has shipped_in
pointing at the actual ship commit.

- KAN-80, KAN-82: shipped 65ad712 (Apr 23)
- KAN-48: shipped d922536 (Mar 5)
- FOLLOWUP-teacher-landing-gating: shipped 051da35 / merged in PR #5"
   ```
3. **Delete this prompt doc** (`docs/features/housekeeping/close-stale-statuses-cc-prompt.md`)
   in the same commit, or as a follow-up commit. It's a one-shot.
4. **Do not push the branch on its own.** It rides along when iter 2's
   KAN-132 PR lands on `main`.

### Acceptance

- New commit on `buildloop/kan-132-role-neutral-copy` whose only diff is the
  4 frontmatter lines (and this prompt doc removed).
- `git status` clean for these 4 doc paths after the commit.
- After iter 2's PR merges to `main`, `git log main --grep="KAN-80\|KAN-82\|KAN-48\|FOLLOWUP-teacher-landing-gating"` shows both the original ship commit and this closeout.
- Iter 3's `pm_generate` does not surface any of these four IDs as candidates.

### Out of scope

- Moving `kan-48-*.md` out of `_orphaned/` into a real feature folder. That's
  a tidy-up, not a status correctness issue.
- Backfilling Acceptance Criteria bodies for the three thinly-ported docs
  (KAN-80, KAN-82, KAN-48). They shipped without; revisiting now is
  archaeology.
