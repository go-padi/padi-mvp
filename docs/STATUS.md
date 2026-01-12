# Status

- Teacher flows: home → About Method → Phases → Phase 1 → Learning Sensorially → LS1 lesson are wired. LS2-13 are placeholders. Phase 2/3 show “coming soon.”
- Schema: phase, module_group, module_detail, lesson_note added. Seed via `pnpm seed:curriculum`.
- RLS: enable read policies for phase/module_group/module_detail (anon or authenticated). Storage bucket `lesson-attachments` should be private with per-user prefix policies.
- Uploads/notes: LS1 lesson saves notes and uploads to `lesson-attachments` (signed URLs, per-user prefix). Requires authenticated session; Admin toggle is UI-only.
- Repo: main is up to date; build artifacts are ignored; lint passes.

# Next session goals

----

### Creating docs for each feature rollout moving forward. 

to do: 

Areas:
1. Auth and sign in [logged in state- doing]
Pausing on row level security. pick back up here.
2. Progress and tracking for teachers [week of Jan 12]
3. Within teacher dashboard: Assessments; Grouping and Progress [logged out state- done, need to do logged in]
4. Start Teaching - determine the flow
5. Add all content from K Reading to app
