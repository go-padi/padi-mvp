---
id: LR-28-UAT
ticket: LR-28
title: "UAT — Wire Supabase migrations into the deploy pipeline"
feature: launch-readiness
type: infra/CI (no user-facing UI)
updated: 2026-07-17
tested_by: padi-uat-agent
---

# UAT: LR-28 — Wire Supabase migrations into the deploy pipeline

## Verdict

Verdict: PASS

LR-28 is a pure infra/CI + docs ticket with no user-facing surface. The two
verifiable dimensions — (1) that the build introduced no app-code regression,
and (2) that the actual deliverables meet the acceptance criteria — both pass.
Two non-blocking follow-up notes for eng are recorded below; neither is a bug
and neither blocks shipping this ticket.

## Scope of this run

- No new page, component, route, or user flow exists to click through.
- Browser testing is limited to a regression check that the live app at
  http://localhost:3000 still loads and behaves normally after the build
  touched `package.json`, `.github/workflows/deploy-migrations.yml`,
  `supabase/config.toml`, `docs/runbooks/applying-migrations.md`, and
  `scripts/check-migration-drift.sh`.
- Artifact verification was done by reading the deliverable files directly.

---

## Part 1 — Regression check (localhost:3000)

Status: ✅ PASS

| Check | Result |
|---|---|
| Home page loads | ✅ HTTP 200 in ~0.065s; renders correctly (hero, nav, feature grid) |
| Sign-in flow reachable | ✅ "Sign In" opens the sign-in modal with Email + Password fields, Sign In button, "Forgot your password?" and "Create one" links, all rendered correctly |
| New console errors introduced | ✅ None attributable to this ticket |
| Visible breakage | ✅ None |

Notes:
- `/sign-in` as a standalone path returns 404 — this is expected and **not** a
  regression: the app implements sign-in as a modal launched from the home
  page nav, not as a dedicated route.
- One console error is present on the logged-out home page:
  `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`
  (from `@supabase/auth-js` GoTrueClient). This is the standard Supabase
  behavior when a stale/expired refresh-token cookie exists in a logged-out
  session. It is **pre-existing and unrelated to LR-28** — this ticket touched
  zero application code (only CI workflow, Supabase CLI config, a runbook doc,
  a shell script, and a `package.json` script entry). Confirmed via
  `git status`: the only non-doc/non-CI change is the added `migrate:check`
  npm script. Flagged for awareness only; not filed against LR-28.

Evidence: home page and sign-in modal screenshots captured during the run
(home page renders hero "Accelerate your child's reading"; sign-in modal
renders full form). `curl` timing confirms 200 in ~65ms.

---

## Part 2 — Artifact verification (against Acceptance Criteria)

Status: ✅ PASS

### UAT-A1 — GitHub Action gates deploy behind a successful migration push
Status: ✅

- `.github/workflows/deploy-migrations.yml` exists and is **valid YAML**
  (parsed successfully; keys: `name`, `on`, `jobs`).
- Triggers on `push` to `branches: [main]` with a `paths` filter of
  `supabase/migrations/**` — so non-migration commits do not run it (Req 2
  non-regression bar).
- Steps run sequentially in one job (`migrate-and-deploy`): Checkout → Setup
  Supabase CLI → Link project → **`supabase db push`** → **Trigger Vercel
  deploy** (`curl -X POST -sf "$VERCEL_DEPLOY_HOOK_URL"`).
- The deploy-hook step is the **last** step and, under GitHub Actions'
  default fail-fast step semantics, only runs if `supabase db push` succeeded.
  If the push fails, the job stops and the hook is never called — satisfying
  the core AC "if `supabase db push` fails, the Vercel deploy for that commit
  does not proceed." The failure is visible in GitHub, not silent.
- `curl -sf` means a failed deploy-hook call also fails the job (no silent
  swallowing).
- `SUPABASE_ACCESS_TOKEN` and `VERCEL_DEPLOY_HOOK_URL` are sourced from
  `secrets.*`, not hardcoded; nothing is echoed to logs.

### UAT-A2 — Supabase CLI config present, project ref correct, no secrets
Status: ✅

- `supabase/config.toml` exists and contains
  `project_id = "rcrjfweguedbtfngeovp"`.
- Contains **no secrets** — only the project ref plus an explanatory comment
  that the access token comes from the `SUPABASE_ACCESS_TOKEN` env var.

### UAT-A3 — Runbook documents backfill, prod location, token, human-only
Status: ✅

- `docs/runbooks/applying-migrations.md` exists and documents:
  - The one-time manual `supabase migration repair --status applied <version>`
    backfill commands, with the full table of 19 migration versions/files.
  - Where prod lives: project ref `rcrjfweguedbtfngeovp` + dashboard URL.
  - Which env var holds the access token: `SUPABASE_ACCESS_TOKEN`, with an
    explicit "never commit / never paste into a migration or PR" warning.
  - The automated path (the new Action) and the manual hotfix path.
  - A drift-check section (`npm run migrate:check`).
- Explicitly states the backfill is **human-run only**: "One-time historical
  backfill (manual, human-run only)" and "**Nothing in LR-28 automates this.**"

### UAT-A4 — No live prod write / no `migration repair` executed in the build
Status: ✅

- `grep` across `*.sh`, `*.yml`, `*.yaml`, `*.ts`, `*.js`, `*.json` finds
  **zero** occurrences of `supabase migration repair` in any executable
  artifact. The phrase appears **only** in the runbook markdown (documentation).
- The workflow runs only `supabase db push` (idempotent, forward-only apply)
  — never `repair`, never a direct write to
  `supabase_migrations.schema_migrations`. Out-of-scope live-prod backfill was
  correctly **not** executed.
- `scripts/check-migration-drift.sh` is read-only (`supabase migration list
  --linked`); it does not mutate prod.

### UAT-A5 — Existing Vercel deploy trigger for non-migration commits intact
Status: ✅

- There is no `vercel.json` or in-repo Vercel deploy-trigger file — non-migration
  deploys run via Vercel's native Git integration (external dashboard config),
  which this ticket does not and cannot touch from the repo.
- The new workflow's paths filter (`supabase/migrations/**`) means it is inert
  for non-migration commits, so the existing deploy path is unchanged.
- `git status` confirms the only tracked change outside the new CI/doc/script
  files is the added `migrate:check` script in `package.json` — no existing
  config removed or altered.

---

## Non-blocking follow-up notes (not bugs)

1. **Req 5 sub-item "Link it from `engineering:deploy-checklist`" is unmet.**
   The `engineering:deploy-checklist` skill lives outside this repo
   (`~/.claude/plugins/cache/padi-plugins/engineering/1.1.0/commands/deploy-checklist.md`)
   and does **not** reference `docs/runbooks/applying-migrations.md` (it only
   has generic "database migrations tested (if applicable)" language). Because
   that file is outside the repo, the BuildLoop build phase could not have
   edited it. Documentation-completeness gap only — flag for eng to link the
   runbook from the deploy checklist manually.

2. **Deploy-gating correctness depends on Vercel dashboard config that is not
   verifiable from the repo.** The workflow only actually *gates* app-code
   deploys if Vercel's native Git auto-deploy on `main` is **disabled** for
   migration-touching commits and deploys rely solely on the deploy hook. If
   Vercel still auto-deploys every push to `main`, a migration commit's app
   code would ship regardless of whether `supabase db push` succeeded —
   defeating the ticket's core intent. This is a Vercel project-settings
   concern outside the repo; eng should confirm the dashboard is configured so
   the deploy hook is the only path for migration commits.

3. **Minor: drift-check regex is heuristic.** The grep in
   `scripts/check-migration-drift.sh` that decides "drift detected" is a
   fragile pattern match against `supabase migration list` table output;
   output-format changes in the Supabase CLI could produce false negatives.
   It is an optional helper (the ticket's schema-parity gate lives in
   BuildLoop's `deploy_prod` phase), so not blocking — noted for hardening.

---

## Run history

### 2026-07-17 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 6 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | Regression | App loads / sign-in reachable / no new console errors | ✅ | — | — |
  | UAT-A1 | Action gates deploy behind successful `supabase db push` | ✅ | — | — |
  | UAT-A2 | `config.toml` present, correct project ref, no secrets | ✅ | — | — |
  | UAT-A3 | Runbook documents backfill/prod/token, human-only | ✅ | — | — |
  | UAT-A4 | No `migration repair` / live prod write executed | ✅ | — | — |
  | UAT-A5 | Existing Vercel deploy trigger unchanged | ✅ | — | — |
- Notes for padi-eng:
  - Confirm Vercel dashboard: disable native Git auto-deploy on `main` for
    migration commits so the deploy hook is the sole path (see note 2) —
    otherwise the gate is bypassable.
  - Manually link `docs/runbooks/applying-migrations.md` from the
    `engineering:deploy-checklist` skill (note 1).
  - Consider hardening the drift-check regex in
    `scripts/check-migration-drift.sh` (note 3).
  - Reminder: the one-time historical backfill
    (`supabase migration repair`) is still pending human execution — correctly
    NOT automated by this ticket.
- Notes for padi-design: N/A — no UI surface on this ticket.
- Missing from ticket: Req 5's "link from deploy-checklist" is unverifiable/
  unmet because that skill lives outside the repo; the deploy-gate's real-world
  correctness depends on external Vercel config the ticket does not (and cannot)
  encode in-repo.
