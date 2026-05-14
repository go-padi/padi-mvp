---
id: LR-23
title: "[Tooling] Wire eslint-plugin-react-hooks so Rules of Hooks violations fail validate, not UAT"
type: task
status: backlog
priority: high
feature: launch-readiness
launch_blocker: false
created: 2026-05-13
created_by: 2026-05-13-loop-iter-2
related: KAN-142
---

### Goal

A Rules of Hooks violation slipped through validate (lint passed)
and was caught only by UAT. Lint should catch this at the validate
stage so eng_fix doesn't need to re-run from a UAT failure for a
class of bugs that are statically detectable.

### Background

In iter 2 (LR-17) of the 2026-05-13 loop, the eng-brief specified
the wrong placement for a React hook. The build agent followed the
brief; lint passed (because `eslint-plugin-react-hooks` isn't
configured in the project); UAT caught the runtime error and filed
KAN-142, which was fixed in eng_fix.

KAN-142 (the actual code bug) is resolved. This ticket addresses the
**tooling gap**: lint should have caught the violation, saving an
eng_fix cycle and preventing the class of bug from shipping
mid-development.

Rules of Hooks violations include:
- Calling hooks conditionally
- Calling hooks inside loops
- Calling hooks after early returns
- Calling hooks from non-component functions

All statically detectable by `eslint-plugin-react-hooks`.

### Requirements

1. **Install the plugin:**
   ```bash
   pnpm add -D eslint-plugin-react-hooks
   ```
2. **Wire it in `.eslintrc.js` (or `eslint.config.mjs` depending on
   project setup):**
   ```js
   plugins: { 'react-hooks': require('eslint-plugin-react-hooks') },
   rules: {
     'react-hooks/rules-of-hooks': 'error',
     'react-hooks/exhaustive-deps': 'warn',
   },
   ```
3. **Verify by running lint** — should produce 0 new errors on
   current main (since KAN-142 fixed the known violation). If new
   violations surface elsewhere, file follow-up tickets.
4. **Verify validate.sh (or whichever script runs in the BuildLoop
   validate phase)** runs `pnpm lint` and fails on errors. Today
   it does — but confirm `rules-of-hooks` errors actually fail the
   build (not just warn).
5. **Document** the addition in the project's lint config comments
   so future config edits don't accidentally remove it.

### Acceptance Criteria

**Happy Path**
Given a PR with a Rules of Hooks violation
When `pnpm lint` runs
Then it reports a `react-hooks/rules-of-hooks` error
And the validate phase in BuildLoop fails
And the build retry kicks in with the lint error in context

**Regression check**
Given main with KAN-142 fixed
When `pnpm lint` runs after this ticket
Then 0 new errors are produced
And the existing test/build pipeline passes

### Out of Scope

- Adopting other React lint plugins (jsx-a11y, etc.) — separate
  ticket if desired.
- Migrating to a stricter type-aware lint (typescript-eslint
  `strict-type-checked`) — separate ticket.
- Pre-commit hook integration (lint already runs in BuildLoop
  validate; pre-commit is a separate concern).

### Notes

- Estimated work: 10-15 min (install, config, verify lint runs clean).
- This is a validation-stage hardening, not a feature; could ship in
  a non-BuildLoop manual PR rather than a full BuildLoop iteration if
  preferred.
- Related: KAN-142 (the original bug, resolved).
