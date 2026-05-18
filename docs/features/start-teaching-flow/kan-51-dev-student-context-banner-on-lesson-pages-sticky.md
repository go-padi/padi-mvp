---
id: KAN-51
title: "[UX] Sticky student-context banner on the curriculum module (lesson) page"
type: story
status: backlog
priority: medium
feature: start-teaching-flow
launch_blocker: false
jira_ref: https://go-padi.atlassian.net/browse/KAN-51
updated: 2026-05-18
authored_acs_by: cc-author-pass-2026-05-18
related: LR-10a (lesson reentry shipped), LR-11b (off-sequence warning shipped), LR-26b (signal picker vocab shipped)
might_require_migration: false
---

### Goal

Make the student-context banner on the curriculum module (lesson)
page **stick to the top of the viewport** as the teacher scrolls
through the lesson body, notes input, audio recorder, and signal
picker. Today the banner scrolls out of view — the teacher loses
track of which student they're teaching mid-lesson.

### Background

The lesson page at
`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
already computes `hasStudentContext`, `contextStudentName`, and
`contextStudentStatus` (lines 100-128 today). It renders a
non-sticky block at the top that names the student + shows their
3-signal status pill (post-LR-26b).

The lesson can be long — chapters like Phonics SE-5 include a
script, multisensory cues, notes input, audio recorder, signal
picker — easily 2-3 viewport heights at 375 × 667. By the time the
teacher reaches "Mark Complete," the student banner is offscreen
and easy to forget which kid they're working with.

Make the banner sticky so it's always visible while teaching.

### Requirements

1. **Wrap the existing student-context banner** in a sticky container.
   In `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`,
   find the JSX block that renders `contextStudentName` +
   `contextStudentStatus` (around the early part of the page body,
   near the `priorCompletions.count > 0` LR-10a line). Wrap it
   like:

   ```tsx
   <div className="sticky top-0 z-10 bg-white/95 backdrop-blur -mx-4 md:-mx-0 px-4 md:px-0 py-2 border-b border-gray-100 md:rounded-2xl md:border md:border-blue-100 md:bg-blue-50/80 md:py-3 md:px-4">
     {/* existing banner contents */}
   </div>
   ```

   Variants:
   - Mobile (`< md`): edge-to-edge sticky strip with white/blur
     background. Stays touchable, doesn't clip side rounded
     borders.
   - Desktop (`md+`): rounded-2xl card with blue tint — matches
     LR-27 visual rhythm.

2. **Z-index above lesson body, below TopNav.** TopNav uses `z-20`
   (per `components/TopNav.tsx`). Use `z-10` on the banner. Lesson
   content stays at base z-index. Mobile keyboard / sign-in modal
   (which uses `z-50` on overlay) stay above.

3. **`top-0` offset.** The TopNav is also sticky (`sticky top-0`)
   so technically both could overlap. In practice the TopNav comes
   first in the DOM and sits at the very top; the lesson page's
   sticky banner attaches to its own scroll container. Verify
   visually: the banner should pin to the **lesson-page main area**
   under the TopNav, not over it.

   If overlap is observed at 375 px, adjust to `top-16` (or whatever
   the TopNav height resolves to). Don't hardcode in pixels — use
   a Tailwind spacing token.

4. **Banner content unchanged.** Keep the existing student name,
   3-signal status pill, "← Back to <Name>" link, and any other
   content. This ticket is layout/positioning only.

5. **No render when there's no student context.** Today the banner
   already only renders when `hasStudentContext` is true. Preserve
   that condition — don't add a sticky empty bar when a teacher
   browses a lesson without picking a student.

6. **DO NOT touch:**
   - The signal picker (LR-26b)
   - Notes / audio recorder behavior
   - `markComplete` flow
   - LR-10a "Completed N times" line
   - LR-11b off-sequence warning banner (which sits above this
     student banner today and should NOT become sticky — only the
     student banner)

### Acceptance Criteria

**Happy path — banner stays sticky while scrolling**
- Given a teacher opens a lesson with a student context
  (`?student=<id>` in URL)
- When the page renders
- Then the student name + 3-signal pill banner appears near the
  top of the lesson body
- And when the teacher scrolls down to reach the notes input or
  signal picker
- Then the banner remains visible pinned to the top of the lesson
  scroll area (under the TopNav)
- And the banner contents (name + pill) remain readable

**Happy path — no student context**
- Given a teacher navigates directly to a lesson URL without
  `?student=<id>`
- When the page renders
- Then NO sticky banner appears
- And the student picker (existing behavior) renders inline
  instead

**Mobile (375 × 667)**
- Banner spans edge-to-edge with white/blur background
- No horizontal scroll
- Banner height stays under ~48 px so it doesn't crowd the lesson
  content
- Sticky behavior works in mobile Safari + Chrome (CSS `position:
  sticky` is supported in all modern mobile browsers)

**Desktop (md+, ≥ 768 px)**
- Banner renders as a rounded-2xl card with blue tint
- Sticky behavior identical

**Modal interaction**
- Given the sign-in modal opens (e.g. via stale session or
  navigation issue)
- Then the modal overlay (`z-50`) sits above the banner (`z-10`)
- Banner does NOT visually clip the modal

**No regression**
- LR-10a "Completed N times. Last: <date>" line still renders
  where it does today (above or below the banner — verify)
- LR-11b off-sequence warning banner still renders separately
  (NOT sticky, NOT inside the new sticky wrapper)
- LR-26b signal picker still functions identically
- `markComplete` still saves notes + writes assessment data

**Empty / Error / Auth states**
- Empty: no student context → no sticky banner (per Happy Path 2)
- Error: lesson data fetch fails → existing error state, the
  sticky wrapper doesn't render either way
- Auth: logged-out users still gated by LR-18a (no change)

**Lint + typecheck**
- `pnpm lint` exit 0
- `pnpm tsc --noEmit` exit 0
- `pnpm build` exit 0

**No new console errors**

### Out of Scope

- Restructuring the banner contents
- Adding NEW info to the banner (group membership, progress %,
  etc.)
- Making OTHER elements sticky (notes input, signal picker)
- Animation on sticky-pin (e.g., shadow fade-in when pinned —
  separate polish ticket if wanted)
- Tablet-specific layout tweaks
- Tests beyond build/lint/tsc

### Notes

- **Single file:** `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
- **No new imports** — Tailwind classes only.
- **Complexity S** — ~5 lines of className additions to one
  wrapper div. ~10 minutes of code work.
- **CSS `position: sticky` caveat:** sticky elements only stick
  within their nearest scrolling ancestor. The Next.js App Router
  layout wraps the page in `<main className="container py-8">`.
  Verify the sticky banner is INSIDE that scroll context. If the
  page's outermost wrapper uses `overflow: hidden` or sets a fixed
  height, sticky won't fire — adjust accordingly.
- Original Jira: https://go-padi.atlassian.net/browse/KAN-51
