---
id: lesson-visual-redesign
title: "Lesson page — split presentation_steps + redo visual hierarchy"
type: story
status: backlog
priority: high
feature: lesson-redesign
created: 2026-05-03
updated: 2026-05-03
---

# Lesson page — split presentation_steps + redo visual hierarchy

## Goal

Make the lesson detail page (`/teacher/curriculum/[chapter]/[group]/[module]`) scannable. Teachers should see the title, aim, and the next teaching move within 5 seconds of landing — without scrolling and without parsing a wall of text.

## Background

Surfaced in a design review on 2026-05-03. Two problems compound:

1. **Data shape.** Look at `scripts/seed-curriculum.ts` line ~72: `presentation_steps` is `string[]` but each module stores ALL teaching moves jammed into element `[0]` as a single 4-sentence paragraph. The UI renders an `<ol>` with one `<li>` containing the whole paragraph. Same problem on `aims` — multiple goals comma-spliced together.
2. **Visual.** Four pastel cards (Materials/Aim/Presentation/Extension) of equal visual weight with no information hierarchy. Slug shows up as title (line 417 renders `Module learning-sensorially-1`).

The root cause of "the lessons are confusing" is the data shape, not just CSS. Both must be fixed in the same ticket or the visual redesign won't land.

## Requirements

### Part 1 — Data: split presentation_steps and aims

1. Update `Lesson` type in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:
   - Keep `presentation_steps: string[]` for backwards compat, but ALSO accept `presentation_steps` items that are objects shaped `{ text: string }` (videos come in the next ticket — keep the door open).
   - The renderer should handle both string and object items.
2. Rewrite `scripts/seed-curriculum.ts` so each presentation step is its own array element. Split on sentence boundaries, then tighten each into an imperative ("Tell students…", "Ask each child to close their eyes", "Set a 2-minute timer", "After the timer, ask what they heard"). Aim for 3–6 steps per module, one micro-action each.
3. Same treatment for `aims` — one aim per array element, not one comma-spliced string.
4. Run `pnpm seed:curriculum` and spot-check 3 modules in the live app.

### Part 2 — Title row fix

1. Lines 416–426: stop showing `Module {subtitle}` when `subtitle` is a slug. Show `moduleRow.title` as the H1. The teaching-mode badge (Individual/Group) stays.
2. Add a small breadcrumb above the H1 showing chapter → group (e.g. `Sensorial · Listening Skills`). Pull from the route params.

### Part 3 — Calm the visual hierarchy

1. **Materials → header chip row.** Replace the white Materials card (lines 430–437) with a small chip row directly under the breadcrumb: `📦 quiet classroom · timer`. If `materials` is empty, render nothing.
2. **Aim → subtitle.** Replace the purple Aim card (lines 439–446) with a single line of muted text directly under the H1: `Aim: sharpen listening skills.` If multiple aims, comma-separate. Drop the purple background entirely.
3. **Presentation → numbered timeline.** The green card (lines 448–464) becomes the page's primary content block. Each step renders as a row: a small numbered circle on the left, the step text on the right, generous vertical spacing between rows. Drop the green background — use white with a thin left border in padi's brand color. Keep the "Examples of sounds…" block but render it as muted secondary text below the steps, not a nested card.
4. **Extension → accordion, default closed.** The amber card (lines 466–473) becomes a `<details>` accordion titled "Extension Activities (optional)". No amber background.
5. **Drop the gradient CTA.** Lines 558 and 603 use `bg-gradient-to-r from-blue-600 to-purple-600`. Replace with a flat brand color. Gradients fight every other accent on the page.
6. **Sticky Notes panel on desktop.** When `?student=...` is set (`hasStudentContext === true`), float the Notes/Audio/Complete block (lines 480–637) into a right column on `lg:` breakpoint and up. Mobile keeps the current stacked layout. The lesson content (left column) should be the focus.

### Part 4 — Don't break what's working

- Keep the student-context banner (lines 395–413) — it's good.
- Keep the three-signal SIGNAL_OPTIONS step (lines 36–64) and the post-completion confirmation (lines 621–629) — copy and behavior stay.
- Keep the "Sign in to record notes" preview state for logged-out users (lines 638–649).

## Acceptance criteria

**Data**
- Given I open any module after `pnpm seed:curriculum` runs
- Then `presentation_steps` has at least 3 entries (not one giant paragraph)
- And each entry is one imperative sentence ≤ 25 words
- And `aims` has one goal per array element

**Title**
- Given I open `/teacher/curriculum/sensorial/listening-skills/learning-sensorially-1`
- Then the H1 reads `Silence Game` (not `Module learning-sensorially-1`)
- And a breadcrumb above shows `Sensorial · Listening Skills`

**Visual hierarchy (5-second test)**
- Given I land on a lesson page
- Then within 5 seconds I can identify the lesson title, the aim, and step 1 — without scrolling on a 1280×800 viewport
- And no two adjacent blocks share the same background color

**Sticky notes (desktop)**
- Given I'm in `?student=...` context on `lg:` breakpoint and up
- Then the Notes/Audio/Complete panel is in a right column and stays visible while I scroll the lesson content
- And on mobile the Notes panel is stacked below the lesson content (no sticky)

**Backwards compat**
- Given a module still has the old data shape (one paragraph in `presentation_steps[0]`)
- Then the page renders without crashing — degrade by splitting on sentence boundaries client-side

## Out of scope

- Video clips (separate ticket: `cc-prompt-lesson-mama-videos.md`)
- Admin UI for editing lessons
- Parent-facing lesson view
- Curriculum data quality beyond the splitting (don't try to rewrite Mama's wording)

## Notes

- File: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- Seed: `scripts/seed-curriculum.ts`
- Padi brand color: pull from existing usage; don't introduce new colors
- Test viewports: iPhone 12 (390), iPad portrait (768), MacBook 13 (1280)
