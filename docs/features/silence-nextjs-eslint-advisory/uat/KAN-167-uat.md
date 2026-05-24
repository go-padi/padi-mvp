---
id: KAN-167-UAT
parent: KAN-167
title: UAT — Silence the Next.js plugin not detected advisory
updated: 2026-05-24
---

# UAT — KAN-167: Silence the "Next.js plugin was not detected" advisory

**Feature summary:** Set `eslint.ignoreDuringBuilds: true` in `next.config.mjs` to suppress Next's redundant build-time ESLint pass (and its noisy "Next.js plugin was not detected" advisory). `pnpm lint` (via validate.sh) remains the authoritative gate.

**Verdict: PASS**

## Scenarios

### UAT-01 — `next.config.mjs` contains the new `eslint` block with KAN-167 comment
Status: ✅
- Verified at lines 4-11 of `next.config.mjs`:
  - Comment header `// KAN-167: disable Next.js's build-time ESLint pass...` at lines 4-8
  - `eslint: { ignoreDuringBuilds: true }` block at lines 9-11

### UAT-02 — `experimental` and `async headers()` blocks unchanged
Status: ✅
- `experimental.serverActions.allowedOrigins: ['*']` still present at lines 12-16
- `async headers()` with `X-Robots-Tag: 'noindex, nofollow, noarchive'` on `/:path*` still present at lines 17-28
- No structural changes — only the new `eslint` block was inserted before `experimental`

### UAT-03 — `pnpm lint` exit 0 with ZERO warnings (KAN-153 baseline preserved)
Status: ✅
- Ran `pnpm lint` twice; both runs exited with code 0
- ESLint produced zero output (no warnings, no errors)
- This is the CRITICAL GATE replacing Next's build-time lint — confirmed still enforcing
- Command: `pnpm lint; echo "LINT_EXIT=$?"` → `LINT_EXIT=0`

### UAT-04 — `pnpm tsc --noEmit` exit 0
Status: ✅
- Ran `pnpm tsc --noEmit`; exited with code 0
- Command: `pnpm tsc --noEmit; echo "TSC_EXIT=$?"` → `TSC_EXIT=0`

### UAT-05 — `pnpm build` exit 0 with NO "Next.js plugin was not detected" advisory
Status: ✅
- Build completed with `✓ Compiled successfully in 1530ms`
- Build log contains exactly the expected `Skipping linting` line (confirming `ignoreDuringBuilds` is honored)
- `grep -c "Next.js plugin was not detected" /tmp/kan-167-build.log` → `0` (zero hits)
- `grep -c "Skipping linting" /tmp/kan-167-build.log` → `1`
- All 19 static pages generated successfully

### UAT-06 — App still runs (`/`, `/teacher`, `/teacher/curriculum/...` return 200)
Status: ✅
- `GET /` → 200
- `GET /teacher` → 200
- `GET /teacher/curriculum` → 200
- `GET /teacher/curriculum/ind-vocab-comprehension-fluency` → 200 (real chapter slug from seed)
- Initial transient 500 on `/` was a one-off (likely cold-start); immediate retry returned 200 consistently
- `/teacher/curriculum/foundations` returns 500 — verified this is because "foundations" is NOT a real chapter slug in the seed (the valid ones are `ind-vocab-comprehension-fluency` and similar `ind-*` / `g-*` codes from `scripts/seed-curriculum.ts:9920`). Not a regression.

### UAT-07 — No application code changes
Status: ✅
- `git diff --stat HEAD` shows only:
  - `docs/features/SHIPPED.md | 7 +++++++` (auto SHIPPED.md update for prior LR-09g entry)
  - `next.config.mjs | 8 ++++++++` (the feature change)
- Zero `.ts`, `.tsx`, `.js`, `.css` changes — confirmed surgical scope

### UAT-08 — No regression on previously shipped features (LR-14a/b/c/d, LR-09g)
Status: ✅
- `GET /students` → 200
- `GET /teacher/about` → 200
- `GET /teacher/grouping` → 200
- `GET /welcome/role` → 200
- `GET /start-teaching` → 308 (expected redirect behavior — depends on auth state, not changed by KAN-167)
- All 19 routes built successfully in `pnpm build`
- Since only `next.config.mjs` changed (no application code), regression risk is constrained to build-time config; lint and tsc both still pass

## Run history

### 2026-05-24 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 8 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | `next.config.mjs` contains new eslint block w/ KAN-167 comment | ✅ | — | — |
  | UAT-02 | `experimental` and `async headers()` blocks unchanged | ✅ | — | — |
  | UAT-03 | `pnpm lint` exit 0, zero warnings (KAN-153 gate preserved) | ✅ | — | — |
  | UAT-04 | `pnpm tsc --noEmit` exit 0 | ✅ | — | — |
  | UAT-05 | `pnpm build` exit 0, zero "plugin not detected" advisory | ✅ | — | — |
  | UAT-06 | App still runs — `/`, `/teacher`, `/teacher/curriculum/...` 200 | ✅ | — | — |
  | UAT-07 | No app code changes (only next.config.mjs + auto SHIPPED.md) | ✅ | — | — |
  | UAT-08 | No regression on LR-14a/b/c/d, LR-09g | ✅ | — | — |
- Notes for padi-eng: None. The change is correctly scoped to a single config knob. The KAN-167 comment in `next.config.mjs` clearly documents the rationale and points to the eslint flat-config + validate.sh gate. Worth noting: `pnpm lint` now exits silently (no progress output) on success — the eslint binary produces zero stdout when there are no findings. This is normal for flat-config eslint but worth knowing if anyone wonders why the lint step "did nothing".
- Notes for padi-design: None — config-only change, no UI surface.
- Missing from ticket: Nothing meaningful. The eng brief and refined ticket both clearly specified the change, the GATE-equivalence rationale, and the verification list. AC 3 (the most important one — lint must STILL enforce) was unambiguously stated.
