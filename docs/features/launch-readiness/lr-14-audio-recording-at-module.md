---
id: LR-14
title: "[Feature] Audio recording at module level — capture the live session"
type: story
status: backlog
priority: medium
feature: launch-readiness
launch_blocker: false
created: 2026-05-10
created_by: walkthrough-audit-2026-05-10
source_walkthrough: docs/walkthroughs/walkthrough-2026-05-10-teacher.md
---

### Goal

Add a record button on the lesson page so the teacher can capture
the live student-teacher audio while the lesson is happening. The
recording attaches to the lesson and is accessible later for
review, sharing with parents, and (eventually) feeding the ML
readiness classifier.

### Background

User asked: *"We would want them to be able to record the session
live. So audio should be available at the module level for them to
just start recording. Whatever the easiest way is there."*

This has three connected use cases:

1. **Teacher review.** Replay the lesson to spot what they missed
   in the moment — useful for diagnostic teaching ("did Ahmed
   actually say /b/ for /d/, or did I mishear?")
2. **Parent sharing.** A 60-second clip of the child sound-spelling
   their first word is a high-emotion artifact — strong driver of
   parent engagement and (per the activation funnel) referrals.
3. **ML readiness signals.** The `ml-readiness-classifier` epic on
   the board needs auditory data. Real lesson audio is the richest
   training source for that.

Why this is here: it's not a launch-blocker (`launch_blocker:
false`), but it's high-leverage and the user explicitly flagged it.
Best to scope tight and ship a v0 — recording + playback + storage —
before launch if cheap, or in v1.1 if it's bigger.

### Requirements (v0 — minimum viable)

1. **Record button** on the lesson page. Big, obvious, near the
   top so the teacher can hit it before/during the session without
   hunting.
2. **Browser MediaRecorder API** (no native deps). Records to
   webm or mp4 (whatever the browser gives). Stop button writes to
   Supabase storage.
3. **Permissions handling:** if mic permission denied, show a
   friendly error explaining why we want it. Don't break the
   page.
4. **Storage:** new Supabase storage bucket `lesson-recordings`,
   with RLS so only the recording's tenant can read. Path scheme:
   `<tenant_id>/<student_id>/<module_id>/<timestamp>.webm`.
5. **DB row:** new table `lesson_recordings`
   (`id`, `tenant_id`, `student_id`, `module_id`,
   `lesson_completion_id` nullable, `storage_path`, `duration_sec`,
   `created_at`). Tenant-scoped writes.
6. **Playback:** on the lesson page, show prior recordings for
   this (student, module) pair. Click → in-browser audio playback.
   No download in v0.
7. **Limits:** max 15 min per recording in v0 (MediaRecorder
   stops automatically). Single recording per session — the next
   record-button click overwrites or starts fresh, with confirm.
8. **Privacy disclosure:** before the first recording, a one-time
   modal explains: "We'll store this audio in your Padi workspace.
   It's only visible to you. Don't record without informing
   guardians per local laws." Acknowledged → stored in user's
   `roleSetAt`-style preference, not shown again.

### Acceptance Criteria

**Happy Path**
Given the teacher is on a lesson page with mic permission granted
When they tap "Record"
Then audio capture starts (visible indicator: pulsing red dot)
And tapping "Stop" ends capture and uploads to storage
And after upload, the recording appears in the prior-recordings
list on the lesson page

**Permission denied**
Given the user denies mic permission
When they tap "Record"
Then a friendly error explains how to enable it (browser-specific
hint OK)
And the page remains usable

**Replay**
Given a prior recording exists for (student, module)
When the teacher views the lesson page
Then a "Past sessions" section shows the recordings sorted newest
first, with date and duration
And clicking plays in-browser

**Empty state**
Given no prior recordings for this (student, module)
When the page renders
Then the "Past sessions" section is hidden (or shows "No
recordings yet")

**Auth state**
Given a logged-out user is on a lesson page in preview mode
Then the record button is hidden or disabled with a "Sign in to
record" tooltip — no recording without auth

**Mobile**
Record/stop buttons must work at 375×667 (mic permission flow on
iOS Safari is the trickiest path — verify).

### Out of Scope (deferred to v1.1+)

- Auto-transcription of recordings (Whisper integration).
- Sharing recording links with parents.
- Tagging moments within a recording (timestamps for "child
  pronounced /b/ correctly").
- Server-side audio processing for ML readiness signals.
- Cross-device recording (start on phone, stop on laptop).
- Multiple parallel recordings.

### Notes

- This is the largest ticket in the launch-readiness epic by
  complexity. Realistic scope: 2–3 days for a clean v0.
- If 2–3 days is too long pre-launch, defer to v1.1 — this is
  `launch_blocker: false`. Better to ship the launch-blockers
  first.
- File scaffolding:
  - `components/LessonRecorder.tsx` (new)
  - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
    (mount the recorder)
  - `supabase/schema.sql` (new table, new bucket policy)
  - `scripts/seed-curriculum.ts` (no change; this is orthogonal)
- Cross-link with `ml-readiness-classifier` epic — that epic will
  consume what this ticket produces.
- Privacy-disclosure copy should be reviewed before launch.
  Recording children's voices has FERPA / state-law implications
  in the US.
