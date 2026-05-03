---
id: lesson-videos-storage-setup
title: "Lesson videos — Supabase storage setup"
type: doc
feature: lesson-redesign
created: 2026-05-03
updated: 2026-05-03
---

# Lesson videos — Supabase storage setup

## Bucket

Create a new bucket named `lesson-videos` in the Supabase dashboard or via SQL.

**Do not** reuse `lesson-attachments` — that bucket holds teacher-uploaded session audio (private, per-tenant). Lesson videos are part of the curriculum: read-public, write-restricted.

### Dashboard

Storage → New bucket → name `lesson-videos`, public bucket = **on**.

### SQL alternative

```sql
insert into storage.buckets (id, name, public)
values ('lesson-videos', 'lesson-videos', true)
on conflict (id) do nothing;
```

## Policies

Public read; authenticated upload only. The video URLs are baked into the curriculum JSONB so we do not rely on signed URLs.

```sql
create policy "lesson-videos public read"
  on storage.objects for select
  using (bucket_id = 'lesson-videos');

create policy "lesson-videos authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lesson-videos');

create policy "lesson-videos authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-videos');
```

(Tighten later if we add an admin-only role; for the pilot, "authenticated" is fine since only Padi staff have accounts.)

## Path convention

```
lesson-videos/<module-code>/intro.mp4
lesson-videos/<module-code>/intro.vtt        # captions, optional
lesson-videos/<module-code>/intro-poster.jpg  # thumbnail, optional
lesson-videos/<module-code>/step-<n>.mp4     # per-step clips, future
```

Example for the Silence Game:

```
lesson-videos/learning-sensorially-1/intro.mp4
lesson-videos/learning-sensorially-1/intro.vtt
lesson-videos/learning-sensorially-1/intro-poster.jpg
```

## Upload (manual, MVP)

1. Open the bucket in the Supabase dashboard.
2. Drag the file into the matching `<module-code>/` folder (create it if missing).
3. Copy the public URL.
4. Paste into `scripts/seed-curriculum.ts` under that module's `lesson.intro_video_url` (and `intro_video_thumbnail_url` / `intro_captions_url` as applicable), then run `pnpm seed:curriculum`.

## Pilot modules

The five modules wired up for the first batch of intro clips:

- `learning-sensorially-1` — The Silence Game
- `learning-sensorially-2` — Guessing the Instrument
- `learning-sensorially-3` — Sequencing Sounds Game
- `learning-sensorially-4` — Guess the Direction
- `learning-sensorially-5` — Guessing the Sounds

Each currently has `intro_video_url: null` in the seed; the lesson page hides the player when the URL is null, so it is safe to ship the schema before the clips arrive.

## Egress and the migration trigger

Supabase storage has no built-in CDN tier billing for our plan, but egress is metered. The pilot's five 5 MB clips will not move the needle. **Before the library exceeds ~10 modules with video**, plan a migration to Cloudflare Stream or Mux:

- adaptive bitrate (kids on hotel Wi-Fi will thank us)
- predictable per-minute pricing
- thumbnail and caption auto-generation

Track the migration as a follow-up under this feature.
