---
id: TEACH-VIDEO-2
title: "[Dev] Render Mom video on lesson page when metadata.teach_video_url is published"
type: task
status: backlog
priority: medium
feature: teach-video
created: 2026-06-06
owner: claude-code
parent: TEACH-VIDEO-1
---

### Goal

Add a "How to teach this lesson" video block to the lesson page
when the module has a published HeyGen video. Surgical change to
one component; no new tables, no migration.

### Background

The teach-video skill (see `teach-video-skill.md` in this folder)
writes:

```json
metadata: {
  "teach_video_url": "https://...heygen.../video.mp4",
  "teach_video_duration_sec": 84,
  "teach_video_status": "pending_review" | "published",
  "teach_video_generated_at": "2026-06-06T18:42:00Z"
}
```

…onto `content.module_detail.metadata`. The RPC
`content_get_module` already returns `metadata`. The lesson page
already pulls it into the `ModuleRow` type — `metadata` is just not
read yet.

### Files to touch

Only this file:

- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`

If TypeScript complains about the `ModuleRow` type missing
`metadata`, add the field to the local type definition near the
top of that file. Do not create new shared type files.

### Requirements

1. **Extend the `ModuleRow` type** to include:
   ```ts
   metadata?: {
     teach_video_url?: string;
     teach_video_duration_sec?: number;
     teach_video_status?: 'pending_review' | 'published';
     teach_video_generated_at?: string;
   } | null;
   ```

2. **Resolve the visibility** — derive at render time:
   ```ts
   const teachVideo = moduleRow?.metadata?.teach_video_url
     && moduleRow.metadata.teach_video_status === 'published'
     ? {
         url: moduleRow.metadata.teach_video_url,
         duration: moduleRow.metadata.teach_video_duration_sec,
       }
     : null;
   const pendingPreview = role === 'teacher'
     && moduleRow?.metadata?.teach_video_url
     && moduleRow.metadata.teach_video_status === 'pending_review'
     ? moduleRow.metadata.teach_video_url
     : null;
   ```

3. **Render the published video block** above the existing
   "Materials" block. Section header: "How to teach this lesson".
   - `<video controls preload="metadata" src={teachVideo.url} />`
   - `<details>` wrapper so it's collapsible. `<summary>` shows
     the header + duration (`84s`).
   - Default open on first view per (user, module). Use
     `localStorage` key `padi:teach-video-seen:<module_code>` —
     if absent, render `<details open>`. On first close or after
     watching, set the key to `1`. Match the existing localStorage
     pattern at LR14D_LS_KEY for shape.

4. **Render the pending-preview link** (teacher role only): a
   small `▶ Preview pending video` link below the module title,
   `target="_blank"`. No styling fancier than the existing helper
   links in that file.

5. **Render nothing** when no `teach_video_url` exists. No empty
   container, no placeholder. The lesson page must look exactly
   as it does today for modules without videos.

6. **Analytics** — call `track(ANALYTICS_EVENTS.TEACH_VIDEO_PLAYED, ...)`
   on first play per session. If `ANALYTICS_EVENTS.TEACH_VIDEO_PLAYED`
   doesn't exist yet in `lib/analytics.ts`, add it as:
   ```ts
   TEACH_VIDEO_PLAYED: 'teach_video_played',
   ```
   Payload: `{ module_code, duration_sec, role }`.

### Acceptance Criteria

**Published video**
Given a module with `metadata.teach_video_url` set and
`teach_video_status: 'published'`
When a signed-in user navigates to that module's lesson page
Then a "How to teach this lesson" `<details>` section appears
above "Materials"
And the video plays in-page on tap
And after the first close, future visits render with
`<details>` closed by default

**No video**
Given a module with no `teach_video_url`
Then the section does not appear in the DOM at all
And the page layout is unchanged from today

**Pending review**
Given a module with `teach_video_url` set and
`teach_video_status: 'pending_review'`
And the viewer's role is `teacher`
Then a small "▶ Preview pending video" link appears below the
title, opening the URL in a new tab
And no published video section appears

**Pending review — non-teacher**
Given the same module as above
And the viewer's role is `parent`
Then no preview link appears AND no published section appears

**Analytics**
Given a published video plays
Then `track('teach_video_played', { module_code, duration_sec, role })`
fires once per session

**Mobile**
Video player works at 375×667. Section header tappable at 44pt
minimum target.

### Out of scope

- Auto-play. Never auto-play (annoys both parents and tutors).
- Captions. Add later; HeyGen can render captions but we're
  shipping caption-free v1.
- Sharing UI ("send to my partner"). Defer.
- A "skip the video, just give me the steps" toggle. Defer —
  `<details>` already does this.
- Any change to `lib/supabase.ts` or the RPCs.

### Notes

- Reuse the rounded-2xl border styling already used by the
  Materials / Aim / Presentation blocks for visual consistency.
- Section header color: gray-900 like the others.
- If the video URL 404s (HeyGen video deleted), the
  `<video>` element will show the broken state — that's fine for
  v1; nisha can re-render the module via `/teach-video`.
- DO NOT touch any other file. If the eng-brief looks like it
  needs touching `lib/supabase.ts`, the schema, or the
  `Lesson` type — pause and ask.

### Reference

- Skill that writes the URL:
  `.plugins/buildloop/skills/lesson-video/SKILL.md`
- Storage shape:
  `.plugins/buildloop/skills/lesson-video/scripts/generate_video.py::persist_url`
- Existing localStorage pattern to match:
  `LR14D_LS_KEY` in the same file
