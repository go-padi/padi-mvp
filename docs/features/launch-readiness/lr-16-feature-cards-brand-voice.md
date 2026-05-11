---
id: LR-16
title: "[Marketing] Refresh homepage feature cards with go-padi.com brand voice (coming-soon framing for unbuilt capabilities)"
type: task
status: backlog
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-11
created_by: buildloop-2026-05-11T15:55:02Z-8847
follows_up: LR-15
---

### Goal

LR-15 brought the hero (headline, subtitle, eyebrow, CTA tagline, Targeted Support age bullet) into alignment with go-padi.com brand voice. The three feature cards in the hero ("Interactive Lessons", "Teacher Tools", "Targeted Support") still use the older voice and bullets that pre-date the marketing site canonicalization. This ticket completes the brand-voice alignment on the homepage by refreshing those three card titles and bullets, using go-padi.com's vocabulary, with capability claims softened to "coming soon" per founder direction in the LR-15 spar.

### Background

go-padi.com surfaces six feature cards: `Multisensory Lessons`, `Real-Time Student Signals`, `Adaptive Learning Paths`, `Zero Prep Time`, `Seamless Referrals`, `Science of Reading`. The app's current 3-card layout (preserved per LR-15) doesn't match this set 1:1 — and the founder explicitly directed that capability-claim cards (Real-Time, Adaptive, Seamless Referrals) be brought in only with coming-soon framing on the app side, until the underlying capabilities exist.

### Requirements

1. Keep the 3-card layout (per LR-15's "preserve the layout" constraint).
2. Map the three existing cards to brand-voice equivalents that are either currently true or framed as coming soon. Suggested mapping:
   - `Interactive Lessons` → `Multisensory Lessons` (currently true — matches curriculum approach).
   - `Teacher Tools` → `Zero Prep Time` (currently defensible — lesson plans ship pre-written; bullets can stay similar).
   - `Targeted Support` → `Science of Reading` (currently true — the curriculum is SOR-aligned).
3. Update select bullets to match brand voice without introducing new false capability claims. Coming-soon framing is permitted but not preferred; remove-rather-than-frame-soon is the default for ambiguous claims.
4. Preserve LR-15's `Ages 3–7 focus` bullet placement (it currently lives in Targeted Support, which becomes Science of Reading).
5. Do NOT add new cards. Do NOT change the icon column or card-grid structure.

### Acceptance Criteria

**Happy path**
Given a visitor lands on `/`
When the feature cards render
Then the three card titles read in brand voice: `Multisensory Lessons`, `Zero Prep Time`, `Science of Reading` (or equivalent founder-approved alternatives)
And every bullet is either true today or explicitly framed coming-soon
And `Ages 3–7 focus` is preserved

**No new false claims**
- 0 matches for `Real-Time Student Signals`, `Adaptive Learning Paths`, `Lessons adjust automatically`, `Seamless Referrals` in `app/page.tsx`.
- 0 matches for `AI-`, `artificial intelligence` (LR-01/15 regression).
- 0 matches for `ages 3-4` (LR-01/15 regression).

**Mobile 375×667**
Feature cards render without overflow.

### Out of Scope

- Adding cards beyond 3.
- Building Real-Time / Adaptive / Seamless Referrals capabilities.
- Changes outside `app/page.tsx`.
- Updating go-padi.com.

### Notes

- File to edit: `app/page.tsx`.
- Complexity: **S**.
- Reference: go-padi.com brand voice and feature-card titles captured during LR-15 (see `.buildloop/iterations/001/spar-transcript.md`).
