# PADI MVP

## Overview
This project is a Next.js 15 application that uses Supabase for data storage. It provides a landing page with navigation to a module library, student management, and demo class routes. The app uses a shared root layout to apply global styles, render a top navigation bar, and wrap page content in a container.

## Key Areas
### Navigation & Layout
- `components/TopNav.tsx` builds a navigation bar with active-route highlighting via `usePathname` and `clsx`, linking to Dashboard, Library, and Students.
- Global styles live in `app/globals.css` with reusable Tailwind utility classes such as `.card`, `.btn`, and `.container` for consistent styling.

### Library (Modules)
- `app/library/page.tsx` is a client component that queries Supabase for module records with optional domain, section, and search filters. It refetches data on filter changes and renders results with `ModuleCard`.
- `components/ModuleCard.tsx` displays each module's code, section, title, objective, and domain in a card layout.

### Students
- `app/students/page.tsx` is a client page for managing students per `classId`. It loads students from Supabase, supports adding a new student name, and re-queries after inserts.

### Supabase Integration & Data
- `lib/supabase.ts` creates a browser Supabase client using environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The database schema includes `module` and `student` tables for lesson metadata and student/class relationships.
- `scripts/seed-modules.ts` reads `scripts/modules.json` and inserts the sample modules into Supabase using a service role key. Run it with `pnpm seed:modules` after configuring `.env.local`.

## Getting Started
1. Install dependencies with `pnpm install`.
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for seeding)
3. Seed sample modules with `pnpm seed:modules`.
4. Start the development server with `pnpm dev`.

## Next Steps
- Extend placeholder class routes (`app/classes/[id]/plan` and `app/classes/[id]/today`) and assessments to add planning/teaching flows and data models.
- Add Supabase row-level security policies and error/loading states in client components for production readiness.
- Explore `app/globals.css` to keep new UI elements consistent with existing card, button, and link patterns.
