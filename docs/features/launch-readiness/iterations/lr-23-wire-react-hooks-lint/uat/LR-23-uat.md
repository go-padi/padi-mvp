---
id: LR-23-UAT
parent: LR-23
title: "UAT — Wire eslint-plugin-react-hooks"
feature: launch-readiness
buildloop_iteration: 1
buildloop_loop_id: 2026-05-14T02:23:19Z-fe49
created: 2026-05-14
---

## Scope

LR-23 is a pure tooling ticket — no UI surface to test. Verification is static:
the eslint-plugin-react-hooks dependency is installed, `eslint.config.mjs` is
wired with `rules-of-hooks: error` + `exhaustive-deps: warn`, and `pnpm lint`
runs to completion against the live codebase.

## Verification

```
$ pnpm lint
> eslint .

/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/students/page.tsx
  29:6  warning  React Hook useEffect has a missing dependency: 'load'.

/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/teacher/grouping/page.tsx
  24:9  warning  ...exhaustive-deps...
  25:9  warning  ...exhaustive-deps...

/Users/nishaiyer/Desktop/padi-app/padi-app-starter/lib/startTeaching/useStartTeachingData.ts
  159:6  warning  React Hook useEffect has missing dependencies: 'isHydrated' and 'isLoggedIn'.

✖ 4 problems (0 errors, 4 warnings)
```

- **Errors: 0** — `rules-of-hooks` rule is wired as error; no violations detected.
- **Warnings: 4** — pre-existing `exhaustive-deps` issues across 3 files. Per the
  refined spec, these are NOT fixed in this ticket. Recommend filing follow-up
  tickets per file under `docs/features/launch-readiness/` (suggested IDs:
  LR-25 students-useEffect-load, LR-26 grouping-useMemo-deps, LR-27
  useStartTeachingData-useEffect-deps).
- **Exit code: 0** — warnings don't fail validate, as designed.

Synthetic violation check: introducing `if (x) useState(...)` in any component
would now produce a `react-hooks/rules-of-hooks` error and fail `pnpm lint`.
This is verified by reading the rule config in `eslint.config.mjs` post-edit;
no synthetic file was added per spec scope.

## Acceptance Criteria

| AC | Result |
|---|---|
| Plugin installed in devDependencies | ✅ `eslint-plugin-react-hooks@5.2.0` |
| Config wired with rules-of-hooks: error | ✅ verified in `eslint.config.mjs` |
| 0 NEW rules-of-hooks errors on current main | ✅ confirmed |
| Validate integration | ✅ lint exits 0 on warnings, would exit non-zero on errors |

Verdict: PASS
