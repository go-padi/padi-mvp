# Claude Code Prompts — Start Teaching Flow (KAN-35)

Build order: KAN-49 → KAN-50 → KAN-51 → KAN-52 (sequential). KAN-53/54 can run alongside or after. KAN-55/56 are independent polish.

---

## KAN-49 — Student-centric teaching flow (P0)

**Jira:** https://go-padi.atlassian.net/browse/KAN-49

```
Read the CLAUDE.md file for project context.

Implement the student-centric teaching flow. Design reference: https://preview--read-spark-adventures.lovable.app/start-teaching (Lovable prototype).

1. Redesign student cards on the Start Teaching page (`app/teacher/page.tsx`):
   - Show: student name, current phase, current module name, progress ("On Lesson X of Y"), assessment status badge ("In Progress" / "Not Started" / "Complete")
   - State-aware CTA button:
     - No lessons started → "Start Teaching" (primary)
     - Lesson in progress → "Continue Teaching" (primary)
     - All lessons complete → "View Progress" (secondary/outline)
   - Clicking card or CTA navigates to student module page

2. Create student module page at `app/teacher/start-teaching/students/[studentId]/page.tsx`:
   - Header: "Teaching [Student Name]" with avatar icon
   - Subtitle: "[Phase Name] — [Module Name]"
   - Progress bar: "X of Y lessons complete" with percentage
   - Lesson list: each lesson row shows title and status
   - "← Back to Start Teaching" link at top

3. Add Individual/Group/Both tabs to Start Teaching page:
   - Three tabs always visible: Individual, Group, Both
   - Individual: student cards only
   - Group: group cards only (empty state if none exist)
   - Both: student + group cards with type badge ("Student" / "Group")

4. Query Supabase for student progress data. Reuse existing client from `lib/supabase.ts`.

5. Follow existing file patterns. Keep strong TypeScript types.

6. Run `pnpm lint` to verify no errors.

Acceptance criteria:
- Clicking a student card navigates to `/teacher/start-teaching/students/[id]`
- Module page shows correct student name, phase, module, and lesson list
- Back link returns to Start Teaching card grid
- Cards show correct state-aware CTA based on lesson progress

Out of scope: lesson locking, context banner, lesson completion flow (separate tickets).
```

---

## KAN-50 — Lesson locking (P0)

**Jira:** https://go-padi.atlassian.net/browse/KAN-50
**Depends on:** KAN-49

```
Read the CLAUDE.md file for project context.

Implement the one-lesson-at-a-time constraint on the student module page created in KAN-49. Design reference: https://preview--read-spark-adventures.lovable.app/start-teaching/students/1772645419055 (Lovable prototype).

1. Read the student module page created in KAN-49 to understand the lesson list structure.

2. Implement three lesson row states:
   a. **Completed**: checkmark icon, normal weight title, green indicator or "(Completed)" label
   b. **In Progress (active)**: play icon, highlighted row with purple/blue border + light background, "Continue Lesson" primary button
   c. **Locked**: lock icon, greyed-out title text, "Complete the current lesson first" helper text, row is not clickable

3. Enforce the state machine:
   - Only one lesson can be "In Progress" at a time per student
   - Lessons must be completed sequentially (lesson 1 before lesson 2)
   - First lesson starts as "In Progress" when module begins
   - Next lesson unlocks only when current lesson is marked complete

4. May need a `lesson_progress` table in Supabase or equivalent state tracking. Check `supabase/schema.sql` for existing tables.

5. Run `pnpm lint` to verify no errors.

Acceptance criteria:
- Only one lesson shows "Continue Lesson" at a time
- Locked lessons cannot be clicked or navigated to
- Completing a lesson unlocks the next one
- Completed lessons show checkmark indicator
```

---

## KAN-51 — Student context banner (P0)

**Jira:** https://go-padi.atlassian.net/browse/KAN-51
**Depends on:** KAN-49

```
Read the CLAUDE.md file for project context.

Add a persistent, sticky student context banner at the top of lesson detail pages. Design reference: https://preview--read-spark-adventures.lovable.app/start-teaching/students/1772645419055/lessons/LS-1 (Lovable prototype — scroll to top to see the banner).

1. Create a reusable StudentBanner component:
   - Content: student avatar icon + "Teaching [Student Name] — [Phase] • [Module Name] • Lesson [X] of [Y]"
   - Right side: "→ Switch Student" text link (navigates to Start Teaching card grid)
   - Left side: back arrow (navigates to student's module page)

2. Make the banner sticky:
   - Use CSS `position: sticky; top: 0; z-index: 10;` (below the main nav bar)
   - No JS scroll listeners — pure CSS sticky
   - White background with subtle bottom border/shadow

3. Add student-scoped Teacher Notes section on lesson detail pages:
   - Heading: "Notes for [Student Name]"
   - Subtitle: "Record observations about [Student Name]'s behavior, engagement, and progress during this activity."
   - Textarea with placeholder: "Record observations about [Student Name]'s engagement, challenges, and progress..."
   - Notes are scoped to student_id + lesson_id

4. Remove the breadcrumb navigation ("Start Teaching > Student Name > Lesson") — the sticky banner replaces it for navigation context.

5. Run `pnpm lint` to verify no errors.

Acceptance criteria:
- Banner visible on all lesson pages when accessed via student flow
- Banner stays visible while scrolling through lesson content
- "Switch Student" navigates to Start Teaching
- Back arrow navigates to student's module page
- Notes section labeled with student name
```

---

## KAN-52 — Lesson completion flow (P0)

**Jira:** https://go-padi.atlassian.net/browse/KAN-52
**Depends on:** KAN-49, KAN-50, KAN-51

```
Read the CLAUDE.md file for project context.

Implement the lesson completion flow. PM decision: teachers must record observations (notes or audio) before marking a lesson complete. No "Mark Done" on the module list.

1. Read the student module page (KAN-49/50) and lesson detail page (KAN-51).

2. Remove "Mark Done" button from lesson rows on the student module page:
   - Active lesson row shows only "Continue Lesson" button
   - No way to mark a lesson complete from the module list

3. On the lesson detail page, replace the single "Save Notes & Continue" button with TWO distinct actions:
   a. "Save Notes" (secondary/outline button):
      - Saves notes to Supabase (student_id, lesson_id, tenant_id, notes text)
      - Returns to student's module page
      - Lesson stays "In Progress"
   b. "Mark Lesson Complete" (primary button):
      - Disabled by default with helper text: "Add observations before completing this lesson"
      - Enabled only when notes textarea has content OR audio recording attached
      - On click: saves notes, marks lesson status as "completed", unlocks next lesson, navigates to student module page

4. Implement note persistence:
   - Create a `lesson_notes` table if needed (student_id, lesson_id, tenant_id, notes_text, created_at, updated_at)
   - When teacher re-enters a lesson, load previously saved notes into the textarea
   - Notes save should upsert (create or update)

5. When a lesson is marked complete, update the student card progress count on Start Teaching.

6. Run `pnpm lint` to verify no errors.

Acceptance criteria:
- No "Mark Done" button on module page lesson rows
- "Save Notes" saves and returns to module page without completing
- "Mark Lesson Complete" disabled until notes or audio exist
- Completing a lesson updates progress count and unlocks next lesson
- Previously saved notes persist when teacher re-enters a lesson
```

---

## KAN-53 — Fix progress counter (P1)

**Jira:** https://go-padi.atlassian.net/browse/KAN-53

```
Read the CLAUDE.md file for project context.

Fix the progress counter on student cards and module pages to use clear, unambiguous framing.

1. Read the student card component and student module page header.

2. Fix the progress text on student cards:
   - When a lesson is in progress but none completed: "On Lesson 1 of 6"
   - When some lessons completed: "On Lesson [X] of [Y]" where X = first incomplete lesson number
   - When all complete: "6 of 6 complete" with a checkmark icon
   - When module not started: "Lesson 1 of [Y]"

3. Fix the progress bar on student cards:
   - Fill percentage based on COMPLETED lessons only (not in-progress)
   - 0 of 6 complete = empty bar, 3 of 6 complete = 50% fill

4. Fix the module page progress header:
   - "X of Y lessons complete" where X = completed count
   - Percentage matches completed count (not in-progress)

5. Ensure progress count consistency between card and module page.

6. Run `pnpm lint` to verify no errors.
```

---

## KAN-54 — Fix "Module" → "Lesson" label (P1)

**Jira:** https://go-padi.atlassian.net/browse/KAN-54

```
Read the CLAUDE.md file for project context.

Fix incorrect heading on lesson detail pages.

1. Find the lesson detail page component that renders the heading.

2. Change the heading from "Module LS-[N]: [Title]" to "Lesson [N]: [Title]".
   - Example: "Module LS-1: The Silence Game" → "Lesson 1: The Silence Game"

3. Keep the subtitle "Learning Sensorially - Phase 1" unchanged.

4. Run `pnpm lint` to verify no errors.

This is a small copy fix — should be a 1-2 line change.
```

---

## KAN-55 — Group tab empty state (P2)

**Jira:** https://go-padi.atlassian.net/browse/KAN-55

```
Read the CLAUDE.md file for project context.

Add an empty state to the Group tab on Start Teaching when no groups exist.

1. Read the Start Teaching page tab implementation.

2. When the Group tab is selected and no groups exist, render an empty state:
   - Centered content with a group icon (use an existing icon library or SVG)
   - Heading: "No groups yet"
   - Body text: "Groups let you teach the same lesson to multiple students at once."
   - "Add Group" CTA button (same style as existing "Add Groups" button)

3. On the Both tab, if no groups exist:
   - Show student cards normally
   - Show a smaller inline message below the student cards: "No groups yet — Add Group"

4. Follow existing component patterns and Tailwind styling.

5. Run `pnpm lint` to verify no errors.
```

---

## KAN-56 — Contextual Add buttons per tab (P2)

**Jira:** https://go-padi.atlassian.net/browse/KAN-56

```
Read the CLAUDE.md file for project context.

Make the Add buttons on Start Teaching contextual to the active tab.

1. Read the Start Teaching page tab implementation.

2. Make the Add buttons conditional on the active tab:
   - Individual tab: show only "Add Students" button
   - Group tab: show only "Add Groups" button
   - Both tab: show both "Add Students" and "Add Groups" buttons

3. This is a small conditional rendering change — wrap each button in a check against the active tab state.

4. Run `pnpm lint` to verify no errors.
```
