---
id: lesson-redesign
title: "Lesson page redesign — clarity + Mama videos"
type: feature
status: backlog
priority: high
feature: lesson-redesign
created: 2026-05-03
updated: 2026-05-03
---

# Lesson page redesign

## Why

Teachers say the current lesson page is confusing and the written presentation steps don't capture how Mama actually teaches — cadence, hand position, voice. Two root causes, two tickets:

1. **Data + visual hierarchy.** `presentation_steps` is stored as one wall-of-text array element instead of discrete steps; `aims` is a comma-spliced run-on; the page renders four equally-weighted pastel cards (purple/green/amber/white) with no anchor for the eye. Splitting the data and calming the visuals fixes ~80% of the "confusing" feedback.
2. **No video.** The pedagogy *is* the cadence. We need short clips of Mama demonstrating the lesson, embedded at the top of each module and (eventually) per-step.

These ship as two independent tickets. (1) can ship without (2). (2) depends on the data shape introduced in (1) if we want per-step videos — otherwise (2) is just an intro video and is independent.

## Scope

- `cc-prompt-lesson-visual-redesign.md` — split lesson data into discrete steps, redo the visual hierarchy of the lesson page, fix slug-as-title bug
- `cc-prompt-lesson-mama-videos.md` — schema fields for video URLs, video player component, storage decision (Supabase MVP → Cloudflare Stream)

## Out of scope

- Admin UI for uploading videos (defer until ≥5 clips exist and pattern is validated)
- Parent-side lesson view (this is teacher-only for now)
- Audio recording from Mama as a separate "voiceover only" track
