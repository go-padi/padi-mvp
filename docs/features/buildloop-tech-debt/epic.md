---
id: BLDTD
title: "BuildLoop tech debt"
type: epic
status: in-progress
priority: low
feature: buildloop-tech-debt
created: 2026-05-12
---

# BuildLoop tech debt

Issues with the BuildLoop orchestrator / plugin that don't block the
current launch sprint but should be cleaned up before scaling the loop
beyond Padi (or before adding more BuildLoop consumers).

## Children

- `bldtd-01-deploy-scope.md` — deploy_prod sweeps unrelated working-tree changes into iteration commit (open)
- `bldtd-02-uat-verdict-stale.md` — UAT phase re-reads stale verdict file across attempts (open)
- `bldtd-03-uat-verdict-format-regex.md` — UAT verdict regex misses `## Verdict` markdown header style (open)
- `bldtd-04-scratch-dir-non-lr-mismatch.md` — non-LR feature_ids: agent prompt + orchestrator path mismatch (open)
- (more as discovered)

## Status — 2026-05-13

4 tooling bugs filed. All medium-priority (work happens but creates
friction or requires manual intervention). BLDTD-02 and BLDTD-04 are
the most impactful — they directly cause loops to stall or require
manual file moves. Recommend fixing all 4 in a single tooling PR
before the next big BuildLoop run (LR-09 / LR-13 remainder / LR-11
batch).

## Pointer

Deep state lives in `docs/buildloop-handoff.md`. Architecture is the
four-copy plugin layout documented there. None of the items here are
launch-blocking.
