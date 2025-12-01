# Status

- Teacher flows: home → About Method → Phases → Phase 1 → Learning Sensorially → LS1 lesson are wired. LS2-13 are placeholders. Phase 2/3 show “coming soon.”
- Schema: phase, module_group, module_detail, lesson_note added. Seed via `pnpm seed:curriculum`.
- RLS: enable read policies for phase/module_group/module_detail (anon or authenticated). Storage bucket `lesson-attachments` should be private with per-user prefix policies.
- Uploads/notes: LS1 lesson saves notes and uploads to `lesson-attachments` (signed URLs, per-user prefix). Requires authenticated session; Admin toggle is UI-only.
- Repo: main is up to date; build artifacts are ignored; lint passes.

# Next session goals

----
*NEW: added Individual and Group toggle; removed student tab - made this a teacher first app for now.*
Need to fix:
- Teacher Dashboard still highlights Phases, need to go to About Method when user clicks in.

### Creating docs for each feature rollout moving forward. 

to do: all focused on Teacher Dashboard and Log in vs Log out state
1) Wire auth (teacher sign-in) and align RLS/read policies to `authenticated` instead of `anon`.
  - Auth and Sign In: Feature Specification (starting Dec 1 - goal to be done is Dec 7)

2) Add more Phase 1 content; now need to add for ind and group (Rhyming, Words and Sentences, Syllables, Phonemic Awareness) and Phase 2/3 placeholders.
    - add status bar for each module; test once Learning Sensorially has been populated
    - populate all of Learning Sensorially and add ability to only unlock when signed in - building to also add a paywall to see content (not added yet)
3) Optionally list saved notes/attachments per module and per student.
4) Connect the Student progress to the tracker
5) automated assessments - python ML modules that live outside of core app? need to research best way to do this.

Areas:
1. Auth and login
2. Progress and tracking for teachers
4. Within teacher dashboard: Assessments; Grouping and Progress
3. Start Teaching - entire flow (will do later)
