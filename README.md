# PADI MVP

## Overview
This project is a Next.js 15 application that uses Supabase for data storage. It provides:
- A public marketing home with CTAs to Students and the Teacher Dashboard.
- A Teacher Dashboard with tabs (About Method, Phases, Assessments, Grouping & Progress, Resources).
- A Phases flow: Phase -> Developmental Areas -> Modules -> Lesson, seeded for Phase 1 (Learning Sensorially, LS1-13).
- A Module Library and simple Students page.

## Key Areas
### Navigation & Layout
- `components/TopNav.tsx` builds the sticky top navigation with For Students/For Teachers, Library, and Dashboard links.
- `app/teacher/layout.tsx` provides the teacher top tabs and an Admin toggle (client-side only).
- Global styles live in `app/globals.css` with reusable Tailwind utility classes such as `.card`, `.btn`, and `.container`.

### Teacher Flows
- `app/teacher/about/page.tsx` shows the method overview and program structure.
- `app/teacher/phases/page.tsx` lists Phase 1–3 cards and outcomes; `app/teacher/phases/[phase]/page.tsx` shows phase detail and developmental areas.
- `app/teacher/phases/[phase]/areas/[area]/page.tsx` lists modules for an area; `app/teacher/phases/[phase]/areas/[area]/modules/[module]/page.tsx` shows the lesson (LS1 populated, LS2-13 placeholders).
- Admin toggle only affects UI locks; no auth is wired yet.

### Library (Modules)
- `app/library/page.tsx` queries Supabase for module records with filters and renders `ModuleCard`.
- `components/ModuleCard.tsx` displays module metadata in a card layout.

### Students
- `app/students/page.tsx` manages students per `classId`, loading from Supabase and inserting new names.

### Supabase Integration & Data
- `lib/supabase.ts` creates a browser Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Schema: legacy `module` + `student`, plus new `phase`, `module_group`, `module_detail`, `lesson_note`.
- Seeds:
  - `scripts/seed-modules.ts` for legacy modules.
  - `scripts/seed-curriculum.ts` for phases/groups/modules (Phase 1 with LS1-13, LS1 populated).

## Getting Started
1. Install dependencies: `pnpm install`.
2. Set environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for seeding and server-side tasks)
3. Apply schema to Supabase (tables are in `supabase/schema.sql`).
4. Seed curriculum (Phase 1, LS1-13): `pnpm seed:curriculum` (uses service role).
   - Optional legacy modules: `pnpm seed:modules`.
5. Run dev server (pick a free port): `pnpm dev -- --port 3010` (or omit `--port`).
6. Visit:
   - `/teacher/about` (default teacher landing)
   - `/teacher/phases` (Phase cards)
   - `/teacher/phases/K_P1/areas/K_P1_LS` (Learning Sensorially modules)
   - `/teacher/phases/K_P1/areas/K_P1_LS/modules/LS-1` (Silence Game lesson)

### RLS and Storage
- If Row Level Security is on, add read policies for `phase`, `module_group`, `module_detail`, and (if used) `module`. Example for public reads: `for select to anon using (true)` (or switch to `authenticated`).
- Lesson attachments use the `lesson-attachments` storage bucket. Keep it private and add policies allowing authenticated users to read/insert within their own prefix. Upload path uses `user.id/<module>/...` and signed URLs for access.

## Next Steps
- Add more Phase 1 content (Rhyming, Words and Sentences, Syllables, Phonemic Awareness) and Phase 2/3 placeholders.
- Wire real auth for teachers and enforce uploads/notes per user with RLS.
- Expand lesson views beyond LS1 and support richer note storage/listing.

## AI Assistant Guides
- Codex guide: `docs/CODEX_GUIDE.md`
- Claude Code guide: `docs/CLAUDE_CODE_GUIDE.md`
- Repo context for Claude: `CLAUDE.md`
