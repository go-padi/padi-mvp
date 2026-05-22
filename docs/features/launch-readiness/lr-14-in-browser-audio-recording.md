---
id: LR-14
title: "[Feature] In-browser audio recording for lessons — record from the platform, no separate app needed"
type: story
status: ready
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-22
created_by: founder-direction-2026-05-22
related: LR-26, LR-27
handling: cc
---

### Goal

Mom (and every parent/teacher) can record a live lesson session from
inside the Padi web app — no separate phone recorder, no airdrop step,
no upload friction. After recording, she rates the student with the
existing 3-signal picker and saves. That's it.

This is the last UX gap before the founder's mom can run real lessons
with real students and produce the (audio + notes + signal) tuples
Nisha needs to train the readiness classifier.

### Background

The lesson page (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`)
already has:

- A notes textarea
- A file-upload input for audio (`<input type="file" accept="audio/*">`)
- 3-signal rating buttons (Accelerating / Practicing / Specialist Track)
- A full save flow that uploads to the `lesson-attachments` bucket,
  writes `teaching_notes`, writes `module_assessment.teacher_feedback`,
  and writes `lesson_completions`

The user-facing problem: file upload requires recording somewhere else
(Voice Memos, etc.), then exporting, then uploading. Mom won't do that
between lessons. She needs **press record → talk → press stop → save**.

The backend is fine. This ticket is purely the UI/UX gap.

### Requirements

1. **Add a "Record" button next to the existing upload input.**
   Keep the file upload as a fallback (for long sessions, low-battery
   situations, or unsupported browsers).

2. **Use the browser MediaRecorder API.** On press:
   - Request microphone permission via `getUserMedia({ audio: true })`
   - Pick a MIME type that works on the platform — prefer
     `audio/webm;codecs=opus` on Chrome/Firefox, fall back to
     `audio/mp4` on Safari/iOS. Use
     `MediaRecorder.isTypeSupported()` to choose.
   - Show a live recording state: a red dot + an elapsed-time counter
     ("00:42") + a "Stop" button.

3. **After Stop**, show a small audio preview block:
   - `<audio controls>` playing the just-captured Blob (use
     `URL.createObjectURL`)
   - Two buttons: **"Use this recording"** and **"Re-record"**
   - "Use this recording" converts the Blob to a `File` (with a
     sensible filename like `lesson-{moduleCode}-{timestamp}.webm`)
     and sets the existing `audioFile` state. The existing save
     pipeline takes it from there — **do not touch the save logic**.

4. **Permission denied / API unsupported**: show a friendly inline
   message:
   > Couldn't access your microphone. You can still upload an audio
   > file using the field above.
   Keep the upload input visible and functional.

5. **Disabled state**: the Record button follows the same disabled
   rules as the upload input (no student selected → disabled, with
   the existing "Select a student first" hint).

6. **Mobile**: must work on iOS Safari 14.5+ (iPad/iPhone). This is
   the most likely device for mom to use mid-lesson. Test specifically.

7. **Extract to a small component** for cleanliness:
   `components/AudioRecorder.tsx` — props `onRecorded(file: File)`,
   `disabled?: boolean`. Keep the lesson page diff small.

### Out of scope

- No schema changes (audio already attaches via
  `teaching_notes.attachment_url`)
- No new storage bucket (the `lesson-attachments` bucket already
  exists; was provisioned in the baseline migration)
- No changes to the 3-signal rating UI (already shipped via LR-26)
- No new save flow, no new analytics events
- No AI processing — Nisha is doing that separately on the model side
- No background-recording / multi-device sync — single-tab, single-take

### Acceptance criteria

1. On the lesson page (logged in, student selected), a "Record"
   button appears next to the upload input.
2. Pressing Record requests mic permission. If granted, recording
   begins; UI shows red indicator + elapsed time + Stop button.
3. Pressing Stop ends the recording. Audio preview appears with
   play/pause controls.
4. Pressing "Use this recording" attaches the recording to the
   lesson. Pressing "Mark Lesson Complete" → picking a signal →
   "Complete Lesson" saves a row to `teaching_notes` with
   `attachment_url` pointing to the recording in
   `lesson-attachments`, plus the existing `module_assessment` +
   `lesson_completions` rows.
5. Reloading the lesson with the same student loads the previous
   recording's `attachment_url` (existing behavior, must keep
   working).
6. If mic permission is denied: a friendly message appears; file
   upload still works.
7. Works in Chrome (desktop), Safari (desktop), and Safari (iPad).
8. The Record button is disabled when no student is selected
   (matches upload input behavior).

### Notes for the implementer

- `MediaRecorder.isTypeSupported('audio/webm;codecs=opus')` → use
  on Chrome/Firefox. `audio/mp4` → Safari fallback.
- Always call `stream.getTracks().forEach(t => t.stop())` after
  stop, to release the mic.
- The save code in `markComplete()` and `saveNotes()` reads from
  the `audioFile` state and uses `.name`, `.type`. Make sure the
  File constructor sets both: `new File([blob], filename, { type: mime })`.
- Use a `useRef` for the MediaRecorder + chunks array. State for
  `isRecording`, `elapsedSec`, `previewUrl`.
- Clean up `URL.createObjectURL` blobs on unmount and on re-record
  (`URL.revokeObjectURL`).
- The existing upload input copy says "Upload Audio Recording
  (optional)". Keep that exact label for the upload control;
  add the record block above it with a label like "Record this
  lesson" so it reads as the primary option.

### UAT

See `iterations/lr-14-in-browser-audio-recording/uat/LR-14-uat.md`
(file to be created at UAT time).

Key scenarios:
- Happy path on desktop Chrome with a real student
- Happy path on iPad Safari
- Permission denied → upload fallback works
- Re-record overwrites previous take
- Saved recording is retrievable (audio plays from signed URL after
  the redirect-back)
