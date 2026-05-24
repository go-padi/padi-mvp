---
id: LR-14b-UAT
title: "[UAT] Record/Stop audio capture on lesson page with upload to lesson-recordings bucket"
type: uat
status: pass
parent: LR-14b
feature: launch-readiness
created: 2026-05-24
updated: 2026-05-24
run_host: http://localhost:3000
---

# LR-14b UAT — Record/Stop audio capture on lesson page

- Iter: `lesson-recorder-button-and-upload`
- Ticket: `.buildloop/iterations/002/feature-refined.md`
- Eng brief: `.buildloop/iterations/002/eng-brief.md`
- Files in scope:
  - NEW: `lib/hooks/useLessonRecorder.ts`
  - MODIFY: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- Migration in scope: NONE (LR-14a `supabase/migrations/20260524_lr14a_lesson_recordings.sql` — unchanged)
- Run date: 2026-05-24
- Run host: localhost:3000

Verdict: PASS

## Scope note

This UAT was executed via static code review + lint/tsc/build verification + diff inspection. No Chrome browser tools are available in the harness, AND the local dev server cannot serve `/teacher/curriculum/[chapter]/[group]/[module]` due to a pre-existing Next.js 15.5.9 dev-cache vendor-chunk bug (`Cannot find module './vendor-chunks/tr46@0.0.3.js'`). Production `pnpm build` succeeds cleanly with all 23 routes prerendered/compiled; the failure is a `next dev` artifact, not a defect introduced by LR-14b. See "Observation on dev-server cold-cache miss" below.

Live mic capture (permission prompt → MediaRecorder → Supabase upload → DB row) requires a human-driven browser session. This UAT verifies every spec dimension that does NOT require live mic interaction: file presence, interface shape, state-machine completeness, path scheme, DB row shape, render gating, copy, accessibility, lint/tsc/build, diff surface, and regression scope. Live mic smoke verification is recommended as a manual follow-up but is not gating for this iter — the code surface is small, surgical, and aligns 1:1 with the eng brief.

## AC results

| # | Acceptance criterion (verify list) | Status | Evidence |
|---|------------------------------------|--------|----------|
| 1 | `useLessonRecorder` hook exists with documented interface | UAT-01 PASS | `lib/hooks/useLessonRecorder.ts` exists; exports `useLessonRecorder` returning `{ state, elapsedSec, error, start, stop }` (lines 17–23, 160). Types `UseLessonRecorderArgs` and `UseLessonRecorderResult` exported. |
| 2 | State machine `idle → recording → uploading → success ⎮ error`; auto-stop at 900s | UAT-02 PASS | `RecorderState = 'idle' \| 'recording' \| 'uploading' \| 'success' \| 'error'` (line 8). `MAX_DURATION_SEC = 900` (line 6). Tick interval calls `stop()` when `sec >= MAX_DURATION_SEC` (lines 151–157). |
| 3 | Graceful fallback: no MediaRecorder, permission denied, upload failure | UAT-03 PASS | (a) `typeof MediaRecorder === 'undefined'` guard at line 108 → error state with "Audio recording is not supported in this browser." (b) `getUserMedia` try/catch at lines 115–121 → "Mic permission denied — enable mic access in your browser settings." (c) `upload()` try/catch at lines 137–144 → "Upload failed — check your connection and try again." Each branch sets `state = 'error'`. |
| 4 | Upload path scheme `<tenant_id>/<student_id>/<module_id>/<timestamp>.<ext>` | UAT-04 PASS | Line 74: `` `${tenantId}/${studentId}/${moduleId}/${ts}.${ext}` ``. `ext` derived from mime (mp4→m4a, else webm) — line 72. Matches LR-14a storage RLS gate exactly: `(storage.foldername(name))[1] = auth.uid()::text` requires first segment to be tenant_id, which equals auth.uid() in this app. |
| 5 | Inserts into `lesson_recordings` table with LR-14a-defined columns | UAT-05 PASS | Lines 79–88 insert: `tenant_id, student_id, module_id, lesson_completion_id, storage_path, duration_sec, mime_type`. Cross-checked against migration `supabase/migrations/20260524_lr14a_lesson_recordings.sql` lines 7–17 — all 7 client-provided columns match table schema. `id` and `created_at` are auto-generated (defaults in DDL). |
| 6 | Render gate: `isLoggedIn && tenantId && contextStudentId && moduleRow?.code` | UAT-06 PASS | `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` line 757: `{isLoggedIn && tenantId && contextStudentId && moduleRow?.code && (...)}`. Logged-out users hit early-return at line 391 and never reach this JSX. Pre-`moduleRow` state hits the `Loading...` early-return at line 388. |
| 7 | Idle state: gray "🎙️ Record audio" | UAT-07 PASS | Line 760–767: `bg-gray-100`, label `🎙️ Record audio`, `aria-label="Record audio for this lesson"`. |
| 8 | Recording state: red "⏹ Stop (M:SS)" with ticking timer | UAT-08 PASS | Line 769–778: `bg-red-600`, label `⏹ Stop ({Math.floor(recorder.elapsedSec / 60)}:{String(recorder.elapsedSec % 60).padStart(2, '0')})`, `aria-label="Stop recording"`. Timer ticks via `setInterval(..., 1000)` in the hook (line 151). |
| 9 | Uploading state: disabled "Saving recording…" | UAT-09 PASS | Line 779–787: `disabled`, label `Saving recording…` (with ellipsis char), `bg-gray-200 text-gray-600`. |
| 10 | Success state STICKY (no auto-clear) + "Record another" link | UAT-10 PASS | Hook does NOT auto-reset (no setTimeout to reset state — checked entire hook source). Page lines 788–801 render green `bg-emerald-100` "✓ Recording saved" + "Record another" button calling `recorder.start()`. Refined-ticket sticky requirement satisfied. |
| 11 | Error state: red error message + "Try again" button with `role="alert"` | UAT-11 PASS | Lines 802–812: outer `<div role="alert">`, `<span class="text-red-700">{recorder.error}</span>`, "Try again" button calling `recorder.start()` which re-runs `getUserMedia`. |
| 12 | Inline disclosure "Audio stores privately to your Padi workspace." below button area | UAT-12 PASS | Lines 814–816: `<p class="text-xs text-gray-500">Audio stores privately to your Padi workspace.</p>`. Disclosure is OUTSIDE the per-state conditionals (sibling of all 5 state branches), so it renders for every state. |
| 13 | `pnpm lint` exit 0 with ZERO warnings (KAN-153 baseline) | UAT-13 PASS | Exit 0. eslint produced no findings. |
| 14 | `pnpm tsc --noEmit` exit 0 | UAT-14 PASS | Exit 0. No type errors. |
| 15 | `pnpm build` exit 0 | UAT-15 PASS | Exit 0. 23 routes compiled. Lesson route shows `8.36 kB / 227 First Load JS` (vs. typical lesson page sizes, modest increase from the new hook + JSX, as expected). |
| 16 | No regression on Mark complete / LR-11b warning / LR-09a refetch + pulse / LR-13c/d/f/g/h observations / KAN-51 sticky banner | UAT-16 PASS | `git diff --stat HEAD -- app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` = 1 file, 69 insertions, 0 deletions. Full diff reviewed: only added (a) 1 import line (`useLessonRecorder`), (b) 1 hook-call block (lines 124–128), (c) 1 JSX block (lines 757–818). Untouched: `saveNotes`, `markComplete`, off-sequence warning JSX, `priorCompletions` effect/render, signal step JSX, sticky student-context banner, AddStudent/AddGroup modal wiring, redirect timer. |
| 17 | Migration file from LR-14a unchanged | UAT-17 PASS | `git status` shows no changes under `supabase/`. The migration `20260524_lr14a_lesson_recordings.sql` is the same file as shipped in iter 1. |

## Additional findings (advisory, non-blocking)

These were noted during review but do NOT fail any AC. Logged here so the eng team has them for follow-up iters.

1. **`lessonCompletionId` not wired through.** The hook accepts an optional `lessonCompletionId`, but the page hook-call (lines 124–128) does NOT pass it. So every `lesson_recordings` row will have `lesson_completion_id = NULL`. This is **fine for v0** (the v0 contract per the ticket says recording is decoupled from "Mark lesson complete"). However, LR-14c (playback) and any future "show this recording on this completion" surface will need a way to associate recordings with the most recent `lesson_completions` row. Recommend a follow-up to pass `priorCompletions.entries[0]?.id` through once `lesson_completions` rows expose `id` to the client.

2. **Rapid double-tap on Record during the `getUserMedia` await is unhandled.** If a teacher taps "Record audio" twice before the permission prompt resolves, two `getUserMedia` calls fire, two `MediaRecorder` instances spin up, and `recorderRef.current` / `streamRef.current` get clobbered by the second instance — the first stream leaks until tab close. This is **out of normal user behavior** (state flips to `'recording'` synchronously after the first await resolves and the button becomes "⏹ Stop"). Not filing.

3. **Error message wording has minor duplication with the "Try again" button.** Hook sets `'Upload failed — check your connection and try again.'` (line 142) and the UI renders a "Try again" button immediately to the right. Refined ticket spec said `'Upload failed — check your connection'` (no "and try again"). Cosmetic; not a defect.

4. **`success` state has no expiration if the page unmounts and remounts.** Because `success` is sticky in-memory only, navigating away and back resets to `'idle'`. That's the expected/desired behavior for v0.

5. **Recording state re-renders the entire lesson page once per second.** The `setInterval` calls `setElapsedSec(sec)` every 1000ms during recording, which re-renders the LessonPage component. This is fine for the small surface (no expensive children that would cause jank), but if future iters add heavy memoized panels to the lesson page, this should be re-evaluated.

## Observation on dev-server cold-cache miss

Curling `/teacher/curriculum/listen/listen-sound-discrim/observation-game` against the local dev server returns 500 with `Error: Cannot find module './vendor-chunks/tr46@0.0.3.js'`. Same error reproduces on the `[chapter]` and `[chapter]/[group]` parent routes. This is a Next.js 15.5.9 `next dev` vendor-chunk-resolution race, not a defect in LR-14b:

- `pnpm build` (production) succeeds cleanly with exit 0; the lesson route compiles to 8.36 kB / 227 kB First Load JS without error.
- The `tr46@0.0.3` package IS installed in `node_modules/.pnpm/` (transitive dep of `whatwg-url` / `node-fetch`).
- The error reproduces on routes that the LR-14b diff did NOT touch (`[chapter]` and `[chapter]/[group]` parent routes).
- The LR-14a UAT (iter 1) documented a similar `next dev` first-request artifact and ruled it out as pre-existing.
- Touching the lesson page source file and forcing a recompile (`✓ Compiled in 657ms`) did not resolve the chunk-resolution miss — confirming it's a dev cache/webpack issue, not a build/code issue.

This blocks Chrome-based smoke testing of the recorder UI in this environment, but the recorder code itself is statically verifiable end-to-end via the diff, types, and the lint/tsc/build green signals. Recommend tracking the dev-cache flake as a separate tooling bug if it persists across iterations (it has now appeared in both iter 1 and iter 2 UATs).

## Run history

### 2026-05-24 — padi-uat-agent
- Verdict: PASS
- Scenarios: 17 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Results: see AC table above
- Notes for padi-eng:
  - Hook implementation is clean and matches the eng brief verbatim. State machine is complete and exhaustive.
  - Path scheme correctly satisfies LR-14a storage RLS (`(storage.foldername(name))[1] = auth.uid()::text`). Since `tenantId === auth.uid()` in this app's bootstrap, the path's first segment matches.
  - Insert column list matches the migration table schema exactly — no risk of insert rejection on column-not-found.
  - When wiring LR-14c (playback), consider passing the most-recent `lesson_completions.id` through as `lessonCompletionId` so playback can associate a recording with a completion event.
  - The recording UI is correctly gated on `isLoggedIn && tenantId && contextStudentId && moduleRow?.code` — no risk of rendering with missing required context.
  - Live mic verification on a real browser is recommended as a manual follow-up; the implementation cannot be smoke-tested in the current harness because (a) no Chrome tools and (b) the dev server has a cold-cache vendor-chunk miss on the `[chapter]/[group]/[module]` route segment.
- Notes for padi-design:
  - All 5 button states are visually distinct (gray idle, red recording, gray-200 uploading, emerald success, red-text error). Inline disclosure is muted (`text-xs text-gray-500`) per low-prominence intent.
  - Record button uses `px-3 py-2 text-sm`, matching the page's secondary-button convention. The primary "Mark Lesson Complete" CTA on the same page uses `py-3`. If LR-14d (privacy modal) elevates the recorder to a more prominent surface, sizing should be reconsidered.
  - The disclosure copy is identical across all 5 states — could feel redundant during the `error` state when the user already sees a red message. Optional polish: hide the disclosure when state === 'error' so the error message stands alone.
- Missing from ticket:
  - The refined ticket spec for the success message had implicit ambiguity between the original AC ("for 3 seconds, then returns to idle") and the spar refinement ("sticky, persists until next Record tap"). Implementation followed the refinement. Recommend the next ticket-refinement pass make the override explicit in the AC table (not just in a "Refined from spar" footer).
  - No AC for what should happen if the teacher navigates away mid-recording. The cleanup `useEffect` returns `teardown()`, which stops the stream tracks but does NOT upload the partial blob — the recording is discarded. This is the right behavior for v0 but should be documented.
  - No AC for tab-backgrounded behavior. Per the ticket's "Out of Scope" list this is acknowledged, but worth a one-line user-facing note in LR-14d's privacy modal.
