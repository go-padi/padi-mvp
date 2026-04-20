# CC Prompt — KAN-52: Lesson completion flow — require notes before marking done

## Context

KAN-93 (student selector fix) is done. The lesson detail page at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` already has:
- Two buttons: "Save Notes" (outline) and "Mark Lesson Complete" (gradient)
- "Mark Lesson Complete" disabled when no notes/audio/loaded attachment
- Previously saved notes load on re-entry
- No "Mark Done" exists on the student module page (`app/teacher/start-teaching/students/[studentId]/page.tsx`) — requirement #1 is already satisfied

## What needs to change

### File: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`

#### Change 1: Save Notes navigates back after saving

Current behavior (lines 196-254): `saveNotes` saves to `teaching_notes`, then sets `status('Saved.')` and stays on page.

New behavior: After a successful save, if the teacher arrived via student context (`hasStudentContext` is true), navigate back to the student module page (`backHref`). If browsing from curriculum (no student context), stay on page and show "Saved." as today.

In the `saveNotes` function, after `setStatus('Saved.')` on line 249, add:

```typescript
if (hasStudentContext) {
  router.push(backHref);
  return;
}
```

#### Change 2: Helper text when Mark Complete is disabled (but student IS selected)

Current behavior: Helper text "Select a student to record observations" only shows when no student is selected (line 426-428).

New behavior: Add a SECOND helper text that shows when a student IS selected but notes/audio are empty. Place it just before the button row (before the `<div className="flex gap-3">` on line 450):

```tsx
{(hasStudentContext || studentId) && !notes.trim() && !audioFile && !loadedAttachmentUrl && (
  <p className="text-xs text-amber-600">Add observations before completing this lesson</p>
)}
```

#### Change 3: markComplete should save notes inline (already does this) but also set proper status

Current `markComplete` (lines 256-291) already:
- Calls `saveNotes()` if notes exist
- Upserts to `module_assessment` with status `completed`
- Navigates to `backHref`

But there's a subtle bug: `saveNotes()` now navigates (from Change 1), and `markComplete` also navigates. Fix: Extract the save logic into a helper that doesn't navigate, or add a parameter to `saveNotes` to skip navigation when called from `markComplete`.

Recommended approach — add an optional `skipNav` parameter:

```typescript
const saveNotes = async (skipNav = false) => {
  // ... existing save logic ...
  // Replace the navigation block with:
  if (!skipNav && hasStudentContext) {
    router.push(backHref);
    return;
  }
};
```

Then in `markComplete`, call `await saveNotes(true)` instead of `await saveNotes()`.

The `saveNotes` button's onClick stays as `onClick={saveNotes}` (which passes no args, defaulting to `skipNav = false`).

Actually even simpler — the button onClick can stay as `() => saveNotes()` which passes `undefined` for skipNav, and `!undefined` is truthy so `skipNav` defaults correctly. But to be safe, use a default parameter.

## Files to modify

1. **`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`** — all 3 changes above

## Do NOT change

- The student module page (`app/teacher/start-teaching/students/[studentId]/page.tsx`) — no Mark Done exists, nothing to remove
- The `module_assessment` upsert logic — it already works correctly
- The teaching_notes insert logic — it already works correctly
- Auth, routing, or DB schema

## Acceptance criteria to verify

1. "Save Notes" saves and navigates back to student module page (when in student context)
2. "Save Notes" saves and stays on page with "Saved." message (when browsing from curriculum)
3. "Mark Lesson Complete" is disabled until notes textarea has content OR audio is attached OR a previously loaded attachment exists
4. When Mark Complete is disabled and a student is selected, helper text reads "Add observations before completing this lesson"
5. Completing a lesson updates `module_assessment` status to 'completed' and navigates back
6. Previously saved notes load when teacher re-enters the lesson
7. No regressions to KAN-93 behavior (student selector, disabled state without student)
