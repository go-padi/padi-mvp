# PADI MVP - Claude Code Project Context

Use this repository as the source of truth. Make incremental edits that match existing patterns.

## Stack
- Next.js App Router
- React + TypeScript
- Tailwind
- Supabase

## Guardrails
- Do not introduce new features unless explicitly requested.
- Do not modify auth, routing, DB schema, or app-wide state unless explicitly requested.
- Prefer small, surgical diffs.
- Keep strong TypeScript types.
- Reuse existing Supabase client in `lib/supabase.ts`.
- Follow established UI and file patterns already in the repo.

## High-Value Paths
- `app/teacher/*` teacher dashboard and phases flow
- `app/library/page.tsx` module library querying Supabase
- `app/students/page.tsx` student list and insert flow
- `lib/supabase.ts` browser Supabase client
- `supabase/schema.sql` schema source
- `scripts/seed-curriculum.ts` and `scripts/seed-modules.ts` seed scripts
- `docs/STATUS.md` latest project status and next goals

## Runbook
- Install deps: `pnpm install`
- Start dev server: `pnpm dev -- --port 3010`
- Lint: `pnpm lint`
- Seed curriculum: `pnpm seed:curriculum`

## Working Style
- Read relevant files before editing.
- Edit only what is required for the task.
- Keep backwards compatibility unless asked to break it.
- If requirements are ambiguous, ask for clarification before broad changes.
