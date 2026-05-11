---
id: LR-01-BUG-02
title: "[LR-01] Homepage feature card claims 'Audio pronunciation guides' — no pronunciation-guide feature exists"
type: bug
status: fixed
parent: LR-01
uat: LR-01-uat-1
severity: P2
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
discovered_by: padi-uat-agent
---

## Summary

The homepage hero feature card "Interactive Lessons" lists `Audio pronunciation guides` as a present-tense capability bullet. The app does not ship pronunciation guides. The only audio path in the codebase is a teacher-side upload field on the lesson-notes flow that lets the teacher attach an arbitrary audio recording to their own notes — that is not a pronunciation-guide library and it is not student-facing.

## Steps to reproduce

1. `curl -s http://localhost:3000/` (or load the homepage in a browser).
2. Read the first feature card in the hero ("Interactive Lessons").
3. Observe the bullet list contains the literal string `Audio pronunciation guides`.

## Expected

Per LR-01 refined AC #5 ("Every named feature exists in the app today (or is explicitly framed 'coming soon')"), this bullet must either:
  - point at an actual pronunciation-guide capability that students/teachers can use, or
  - be reframed as `Audio pronunciation guides (coming soon)`, or
  - be removed.

## Actual

- `app/page.tsx:42` renders `"Audio pronunciation guides"` as a present-tense bullet.
- `grep -rEn "pronunciation"` across `app components lib` matches **only** the marketing string in `app/page.tsx`. There is no implementation of a pronunciation-guide feature — no audio asset library, no per-word audio playback for students, no model-pronunciation surface.
- The only audio handling in the app is in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` (`audioFile` state, upload to the `lesson-attachments` Supabase storage bucket). That is a teacher-private attachment on a lesson-notes form, not a pronunciation guide that the product provides.

## Evidence

- Source: `app/page.tsx:42` — `"Audio pronunciation guides",`
- `grep -rEn "pronunciation" app components lib` → 1 hit, in `app/page.tsx` only (no implementation).
- Source: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:78,255-269,535-558` — confirms audio path is a teacher upload, not a guide library.

## Suggested fix

Either:
1. Remove the bullet, or
2. Reframe as `Audio pronunciation guides (coming soon)`, or
3. Replace with a true bullet describing what does exist (e.g. `Teacher audio note attachments`, though that's a teacher-tool not an interactive-lesson feature, so it doesn't fit this card).

Recommended: remove the bullet. The other three bullets in this card ("Phonics-focused instruction", "Visual word matching", "Progress tracking") are accurate and the card stays balanced at three bullets.

## Files to touch

- `app/page.tsx` (line 42, the `bullet` array under `Interactive Lessons`).

## Severity rationale

P2 rather than P1 because the case for "teacher-uploaded pronunciation audio counts" is weakly defensible, whereas the PDF-worksheets claim has no defensible interpretation. Both should be fixed before launch.

## Fix Notes

**Root cause:** The "Interactive Lessons" hero feature card on the homepage advertised `Audio pronunciation guides` as a present-tense capability, but no pronunciation-guide feature exists. The only audio path in the app is a teacher-private lesson-notes attachment upload, which is neither a guide library nor student-facing.

**Files changed:**
- `app/page.tsx` — removed the `"Audio pronunciation guides"` entry from the `Interactive Lessons` card's `bullet` array.

**Why this fix is correct:** Per the bug's own recommended fix, removing the bullet is preferable to a "(coming soon)" reframe because (a) the other three bullets — Phonics-focused instruction, Visual word matching, Progress tracking — are all true today and leave the card visually balanced at three items, and (b) the existing teacher audio-attachment field is not a credible foundation we're "about to" turn into student pronunciation guides, so a "coming soon" promise would itself be aspirational. Removal cleanly satisfies LR-01 refined AC #5.
