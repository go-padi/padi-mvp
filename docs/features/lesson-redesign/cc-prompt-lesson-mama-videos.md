---
id: lesson-mama-videos
title: "Lesson page — embed Mama teaching clips"
type: story
status: backlog
priority: high
feature: lesson-redesign
created: 2026-05-03
updated: 2026-05-03
---

# Lesson page — embed Mama teaching clips

## Goal

Let teachers watch Mama demonstrate a lesson. Each module gets one short intro video (~30 seconds) at the top of the page. Optionally, each presentation step can carry its own clip. This is the actual pedagogy — written steps don't capture cadence, hand position, or voice.

## Background

Surfaced in a design review on 2026-05-03. Written presentation steps are not enough — Mama's enunciation and physical demonstration are what teachers need to copy. We want clips embedded directly in the lesson page, not links to YouTube (the recommendations sidebar is a credibility killer for a children's teaching tool).

This ticket assumes the data split from `cc-prompt-lesson-visual-redesign.md` has shipped — per-step videos require `presentation_steps` items to be objects, not strings. The intro video alone is independent of that ticket and can ship first if needed.

## Requirements

### Part 1 — Schema

1. Add to the `lesson` JSONB blob on `module_detail`:
   - `intro_video_url: string | null` — top-of-page intro clip
   - `intro_video_thumbnail_url: string | null` — poster image
2. Extend the `presentation_steps` item shape to optionally carry per-step video:
   ```ts
   { text: string; video_url?: string; thumbnail_url?: string }
   ```
3. Update the `Lesson` type and `ModuleRow` type in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`.
4. No DB migration needed (it's all inside the JSONB blob), but update `scripts/seed-curriculum.ts` to seed `intro_video_url` for the pilot modules listed below.

### Part 2 — Storage

For MVP, use Supabase storage. **Do not** reuse the `lesson-attachments` bucket — that's teacher-uploaded session audio, totally different access pattern. Create a new public-read bucket:

1. Create `lesson-videos` bucket in Supabase (public read, authenticated write).
2. Upload the pilot clips manually for now — no admin UI in this ticket.
3. Document the bucket setup in `docs/features/lesson-redesign/storage-setup.md`.
4. **Note for follow-up:** before the library exceeds ~10 modules with video, plan a migration to Cloudflare Stream or Mux for adaptive bitrate and bandwidth cost. Track as a follow-up under this feature, do not block this ticket on it.

### Part 3 — Player component

Create `components/LessonVideoPlayer.tsx`:

1. Renders a thumbnail with a centered play triangle overlay.
2. Click opens a modal with an `<video controls preload="metadata">` element.
3. Auto-pauses when modal closes.
4. **No autoplay on the page** — teachers will be on mute in classrooms.
5. Captions track support: `<track kind="subtitles">` if `captions_url` is provided. Captions are required for production clips (see below) but the component should render gracefully without them.
6. Falls back to nothing (no broken-image icon) if `video_url` is null.

### Part 4 — Lesson page integration

1. **Intro video.** Below the H1 + breadcrumb + chip row, above the presentation steps, render `<LessonVideoPlayer src={lesson.intro_video_url} />`. Hidden if no URL.
2. **Per-step videos.** In the numbered timeline rendered by the visual redesign ticket, each step row gets a small "▶ Watch this step" pill on the right. Clicking opens the player modal. Hidden if step has no `video_url`.

### Part 5 — Pilot content

This ticket includes the first batch of clips. Mama records and we upload:

1. Intro clips for these 5 modules (full chapter 1 group):
   - `learning-sensorially-1` (Silence Game)
   - `learning-sensorially-2` (Guessing the Instrument)
   - `learning-sensorially-3` (Sequencing Sounds Game)
   - `learning-sensorially-4` (Guess the Direction)
   - `learning-sensorially-5` (Guessing the Sounds)
2. No per-step clips in this ticket — validate the intro pattern first.

### Part 6 — Filming guardrails (for the Mama record session)

Document these in `docs/features/lesson-redesign/filming-guidelines.md`:

- **30 seconds max** per clip
- **Captions required** — burn-in or upload SRT alongside (this is a reading curriculum, accessibility is non-negotiable)
- **Frame:** head + hands + materials visible
- **Aspect:** 16:9 horizontal for now (revisit if parent app goes mobile)
- **Audio:** close mic, no background music
- **Background:** plain wall, daylight, minimal distraction
- **File:** MP4 H.264, target 1080p, ≤ 5 MB per clip

## Acceptance criteria

**Schema**
- Given I open a module with `intro_video_url` set
- When the page loads
- Then the player thumbnail appears below the breadcrumb

**Player behavior**
- Given I click the thumbnail
- Then a modal opens with the video controls visible
- And the video does NOT autoplay
- When I close the modal
- Then the video pauses

**Captions**
- Given a clip has `captions_url`
- Then a CC track is available in the player

**Empty states**
- Given a module has no `intro_video_url`
- Then no player and no broken-image placeholder appears
- Given a presentation step has no `video_url`
- Then no "Watch this step" pill appears for that step

**Pilot content live**
- Given the 5 listening-skills modules
- Then each has a working intro clip on staging

**No autoplay anywhere on the lesson page** — verify on Chrome desktop and Safari iOS.

## Out of scope

- Admin UI for uploading clips (defer until ≥5 clips exist and pattern is validated)
- Cloudflare Stream / Mux migration (follow-up ticket)
- Per-step clips (next batch — validate intro first)
- Parent-side lesson video access
- Video search, transcripts, chapters

## Notes

- Player file: `components/LessonVideoPlayer.tsx` (new)
- Lesson page: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- Storage bucket: `lesson-videos` (new, public read)
- Depends on: `cc-prompt-lesson-visual-redesign.md` for per-step videos; intro video alone is independent
- Bandwidth note: Supabase storage is fine for the pilot 5 clips. Watch egress when we expand.
