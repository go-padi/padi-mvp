---
id: lesson-videos-filming-guidelines
title: "Lesson videos — filming guidelines for Mama"
type: doc
feature: lesson-redesign
created: 2026-05-03
updated: 2026-05-03
---

# Lesson videos — filming guidelines

These constraints exist so every clip looks consistent in the lesson page, plays smoothly on classroom Wi-Fi, and meets accessibility requirements for a reading curriculum. Hand to Mama before recording.

## Length

- **30 seconds maximum per clip.** Teachers scan, they don't watch.
- One clip per lesson for now (intro). Per-step clips come later.

## Captions — required

Every clip ships with captions. This is a literacy app — accessibility is non-negotiable.

- Burn-in captions on the video, **or**
- Provide an `.srt` / `.vtt` file alongside the MP4 (preferred — keeps the video clean for non-English speakers later).

If captions aren't ready, the clip does not ship.

## Frame

- Mama's **head, hands, and the materials** all visible in frame.
- If a step requires showing technique (hand position, finger spacing on a card), zoom in.

## Aspect ratio

- **16:9 horizontal.**
- Revisit if and when the parent app goes mobile-first.

## Audio

- Close mic (lavalier or shotgun). Phone mic is a fallback if needed.
- **No background music.** Children copying the lesson should hear voice and ambient room sound only.
- Quiet room. No HVAC, no traffic, no other adults talking.

## Background

- Plain wall.
- Daylight where possible. If artificial, soft warm light, no overhead fluorescents.
- Minimal visual distraction — no cluttered shelves, no busy patterns.

## File specs

- Container: **MP4**
- Codec: **H.264**
- Resolution: **1080p** target
- Frame rate: 24 or 30 fps
- File size: **≤ 5 MB per clip** (compress in HandBrake or ffmpeg if larger)

### Quick ffmpeg compress

```
ffmpeg -i input.mov -vcodec libx264 -crf 26 -preset slow -acodec aac -b:a 96k -movflags +faststart output.mp4
```

`+faststart` puts the metadata at the start of the file so the player can begin streaming before the full download.

## Naming

Match the path convention in [storage-setup.md](./storage-setup.md):

```
<module-code>/intro.mp4
<module-code>/intro.vtt
<module-code>/intro-poster.jpg
```

The `<module-code>` matches the value in `scripts/seed-curriculum.ts`, e.g. `learning-sensorially-1`.

## Review checklist (before upload)

- [ ] Under 30 seconds
- [ ] Captions present (burn-in or `.vtt`)
- [ ] Hands and materials visible
- [ ] Voice clear, no music
- [ ] Plain background
- [ ] 16:9, 1080p, ≤ 5 MB
- [ ] File named `<module-code>/intro.mp4`
