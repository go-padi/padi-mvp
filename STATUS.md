# Status

- Teacher flows: home → About Method → Phases → Phase 1 → Learning Sensorially → LS1 lesson are wired. LS2-13 are placeholders. Phase 2/3 show “coming soon.”
- Schema: phase, module_group, module_detail, lesson_note added. Seed via `pnpm seed:curriculum`.
- RLS: enable read policies for phase/module_group/module_detail (anon or authenticated). Storage bucket `lesson-attachments` should be private with per-user prefix policies.
- Uploads/notes: LS1 lesson saves notes and uploads to `lesson-attachments` (signed URLs, per-user prefix). Requires authenticated session; Admin toggle is UI-only.
- Repo: main is up to date; build artifacts are ignored; lint passes.

# Next session goals

1) Add more Phase 1 content (Rhyming, Words and Sentences, Syllables, Phonemic Awareness) and Phase 2/3 placeholders.
2) Wire auth (teacher sign-in) and align RLS/read policies to `authenticated` instead of `anon`.
3) Optionally list saved notes/attachments per module and per student.
