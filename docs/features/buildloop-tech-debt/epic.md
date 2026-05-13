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

- `bldtd-01-deploy-scope.md` — deploy_prod sweeps unrelated working-tree changes into iteration commit
- (more as discovered)

## Pointer

Deep state lives in `docs/buildloop-handoff.md`. Architecture is the
four-copy plugin layout documented there. None of the items here are
launch-blocking.
