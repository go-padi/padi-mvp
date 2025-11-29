# Status

- Teacher flows: home → About Method → Phases → Phase 1 → Learning Sensorially → LS1 lesson are wired. LS2-13 are placeholders. Phase 2/3 show “coming soon.”
- Schema: phase, module_group, module_detail, lesson_note added. Seed via `pnpm seed:curriculum`.
- RLS: enable read policies for phase/module_group/module_detail (anon or authenticated). Storage bucket `lesson-attachments` should be private with per-user prefix policies.
- Uploads/notes: LS1 lesson saves notes and uploads to `lesson-attachments` (signed URLs, per-user prefix). Requires authenticated session; Admin toggle is UI-only.
- Repo: main is up to date; build artifacts are ignored; lint passes.

## Recent updates
- Teacher-first nav and landing CTAs (Start Teaching → teacher flows; removed student nav split).
- Added teaching mode context + toggle (Individual/Group/Both) globally.
- Curriculum pages are mode-aware; “Both” shows separate sections for individual vs group.
- Schema now has `teaching_mode` enum + columns; seeds include placeholder individual curriculum (rerun `pnpm seed:curriculum` applied).
- Added mode-aware teaching cards on `/teacher` (students/groups) with placeholder group data.

# Next session goals
NEW: added Individual and Group toggle; removed student tab - made this a teacher first app for now. 
----
Still to do:
1) Add more Phase 1 content; now need to add for ind and group (Rhyming, Words and Sentences, Syllables, Phonemic Awareness) and Phase 2/3 placeholders.
    - add status bar for each module; test once Learning Sensorially has been populated
    - populate all of Learning Sensorially and add ability to only unlock when signed in - building to also add a paywall to see content (not added yet)
2) Wire auth (teacher sign-in) and align RLS/read policies to `authenticated` instead of `anon`.
3) Optionally list saved notes/attachments per module and per student.
4) Connect the Student progress to the tracker
5) automated assessments - python ML modules that live outside of core app? need to research best way to do this.
