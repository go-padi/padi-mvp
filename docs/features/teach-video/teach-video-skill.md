---
id: TEACH-VIDEO-1
title: "[Feature] Teach-video skill — Mom video walkthroughs per module"
type: feature
status: in-progress
priority: medium
feature: teach-video
created: 2026-06-06
owner: nisha
---

### Goal

Give every Padi module a 60–90 sec "how to teach this lesson" video
narrated by the Padi teacher persona (a stock HeyGen avatar +
stock ElevenLabs voice, chosen once). Videos embed on the lesson
page so parents and tutors see a warm, calm teacher walking them
through the lesson before they teach it.

### Background

Parents and tutors using Padi don't have a reading specialist on
call. The curriculum is rich but text-heavy — the
`presentation_steps` in each module's lesson JSON tell you WHAT to
do but a first-time teacher needs to hear HOW.

Stack:
- HeyGen stock avatar ("Padi teacher persona"), chosen once
- ElevenLabs stock voice (recommended: Rachel or Sarah), chosen once
- HeyGen ↔ ElevenLabs connection (one-time UI step)
- This skill drafts scripts grounded in the module's lesson JSON
  and the ASDEC corpus, then renders via HeyGen API.

No custom voice/face cloning. The premium signal comes from:
1. Specialist-DESIGNED curriculum (ASDEC / real reading specialist
   authored the modules)
2. Every module has a walkthrough (competitors don't)
3. Consistent, warm teacher voice on every lesson
See `docs/features/pricing/` for how this fits pricing.

### Build pieces

Three deliverables in this feature folder:

1. **The skill itself** — lives at
   `.plugins/buildloop/skills/lesson-video/`. SKILL.md +
   templates + references + Python render script. Triggered by
   `/teach-video <MODULE_CODE>` or `/teach-video --all-missing`.
2. **The render on the lesson page** — surgical change to
   `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
   to display the video when `metadata.teach_video_url` exists
   and `teach_video_status === 'published'`. See sibling CC
   prompt: `cc-prompt-teach-video-render.md`.
3. **Storage decision** — use existing `content.module_detail.metadata`
   jsonb. No migration. Keys:
   - `teach_video_url` (string, HeyGen-hosted mp4 URL)
   - `teach_video_duration_sec` (number)
   - `teach_video_status` ("pending_review" | "published")
   - `teach_video_generated_at` (ISO 8601 string)

### Why metadata, not a new column

- `metadata jsonb` already exists on `content.module_detail` and
  the RPC `content_get_module` already returns it.
- No migration, no schema review, no RLS changes — surgical.
- Easy to extend later (e.g. add `teach_video_captions_url`).
- If we later want to query "all modules with published videos,"
  a partial GIN index on the jsonb field is cheap to add.

### Acceptance Criteria

**Skill (PRECONDITION: HeyGen + ElevenLabs accounts set up, stock
avatar and stock voice chosen, config.yaml populated)**

Given nisha runs `/teach-video S-3`
When the skill executes
Then a prompt is drafted from S-3's lesson JSON
And nisha (or Claude in the slash command) writes a 60–90 sec
script that passes the rubric
And HeyGen renders the video using the configured stock avatar +
stock voice
And `content.module_detail.metadata.teach_video_url` is populated
for S-3 with `teach_video_status: pending_review`

**Bulk authoring**

Given nisha runs `/teach-video --all-missing`
When the skill executes
Then prompts are drafted for every module missing a video
And the skill stops short of rendering (human reviews scripts
first)
And no HeyGen credits are burned without explicit per-module
render confirmation

**Lesson page render** (covered by `cc-prompt-teach-video-render.md`)

Given a module has `metadata.teach_video_url` and
`teach_video_status === 'published'`
When a logged-in user views that module's lesson page
Then a "How to teach this lesson" section renders ABOVE
"Materials" with an `<video>` element pointing to the URL
And the video is collapsible (default open on first view per
module, collapsed on subsequent views — use localStorage)

**Pending-review modules**

Given a module has `teach_video_url` but status is
`pending_review`
Then the video does NOT render to end users
And the curriculum admin (anyone with role='teacher') sees a
small "▶ Preview pending video" link below the title (for
internal QA only)

**Off — module has no video**

Given a module has no `teach_video_url`
Then the lesson page renders exactly as it does today (no empty
container, no placeholder)

### Out of scope

- Custom voice or face cloning (out for v1 and probably v2 — stock
  is doing the job and consistency matters more than "our own
  person").
- Captions / transcripts (revisit in v1.1 for accessibility).
- Per-student personalized videos (Tavus-style).
- Localization (English only for v1).
- Video analytics (view-through rate, drop-off). Defer.
- Parent-side share button ("send this video to my partner").

### Notes

- HeyGen Creator tier supports ~10 videos/mo. To bulk-author the
  full 200-module backlog, bump to Team tier or batch over months.
- Always throttle bulk renders — HeyGen rate-limits at ~5
  concurrent renders.
- Test mode: `/teach-video S-3 --script-only` drafts the script
  without burning HeyGen credits.
- Cost watch: at $1.60/min video and 200 modules × 1.5 min, the
  full pass is ~$480 of HeyGen credits. Worth it once for v1
  signal; ongoing maintenance is per-new-module.
- Re-render trigger: if a module's `lesson` JSON changes
  materially, regenerate the video. Add a hash check in v1.1.

### Cross-links

- `docs/features/pricing/pricing-strategy.md` — videos are the
  premium signal that justifies our pricing band.
- `.plugins/buildloop/skills/lesson-video/SKILL.md` — full skill
  spec.
- `cc-prompt-teach-video-render.md` (this folder) — CC ticket for
  the lesson-page render piece.
