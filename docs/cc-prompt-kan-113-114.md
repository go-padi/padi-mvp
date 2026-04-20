# CC Prompt — KAN-113 + KAN-114: Save & Continue Later rename + Preview mode copy

## Context

These two tickets both change copy and UX on the same file. Do them together.

- **KAN-113**: Rename "Save Notes" → "Save & Continue Later" with a brief confirmation message
- **KAN-114**: Make the curriculum browser path feel like "Lesson Preview" until a student is selected, with guided copy

**ICP reminder**: The teacher using this may have very little intuition on how to navigate an app. Every label, helper text, and state transition should be obvious and warm.

## Key file

`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — this is the ONLY file to edit.

## Current state (post KAN-115)

The lesson page has:
- Line 411-413: Section header — `hasStudentContext ? 'Notes for ${contextStudentName}' : 'Teacher Notes & Observations'`
- Line 418: Dropdown label — `"Student (optional)"`
- Line 425: Default option — `students.length ? 'Not selected' : 'Select a student'`
- Lines 430-432: Empty dropdown shows `"No students found"` as disabled option
- Line 439-441: Helper text when no student — `"Select a student to record observations"`
- Line 472: Save button label — `'Save Notes'`
- Line 259: Save success status — `'Saved.'`
- Line 479: Complete button label — `'Mark Lesson Complete'`

## Changes

### KAN-114: Preview mode copy (do this first since it touches more lines)

**Change 1 — Section header (line 411-413):**

Replace:
```tsx
<h3 className="text-lg font-semibold text-gray-900">
  {hasStudentContext ? `Notes for ${contextStudentName}` : 'Teacher Notes & Observations'}
</h3>
```

With:
```tsx
<h3 className="text-lg font-semibold text-gray-900">
  {hasStudentContext ? `Notes for ${contextStudentName}` : 'Lesson Preview'}
</h3>
{!hasStudentContext && !studentId && (
  <p className="text-sm text-gray-600">
    You're browsing the curriculum. Select a student below to start teaching this lesson.
  </p>
)}
```

**Change 2 — Dropdown label (line 418):**

Replace:
```tsx
<label className="text-sm font-semibold text-gray-800">Student (optional)</label>
```

With:
```tsx
<label className="text-sm font-semibold text-gray-800">Who are you teaching?</label>
```

**Change 3 — Default dropdown option (line 425):**

Replace:
```tsx
<option value="">{students.length ? 'Not selected' : 'Select a student'}</option>
```

With:
```tsx
<option value="">Select a student to begin...</option>
```

**Change 4 — Zero-student state (lines 416-434):**

Replace the entire `{!hasStudentContext && (` block with logic that shows a CTA card when there are zero students instead of an empty dropdown:

```tsx
{!hasStudentContext && (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-800">Who are you teaching?</label>
    {students.length === 0 && actionOptions.length > 0 ? (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center space-y-2">
        <p className="text-sm text-gray-700">You haven't added any students yet.</p>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Add your first student
        </button>
      </div>
    ) : (
      <select
        className="w-full rounded-xl border border-gray-200 p-3 text-sm"
        value={studentId}
        onChange={e => handleStudentChange(e.target.value)}
      >
        <option value="">Select a student to begin...</option>
        {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
        {actionOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    )}
  </div>
)}
```

**Change 5 — Remove the old helper text (line 439-441):**

Replace:
```tsx
{!hasStudentContext && !studentId && (
  <p className="text-xs text-gray-500">Select a student to record observations</p>
)}
```

With nothing — this is now handled by the preview mode header from Change 1. Remove these 3 lines entirely.

### KAN-113: Save & Continue Later rename

**Change 6 — Button label (line 472):**

Replace:
```tsx
{saving ? 'Saving...' : 'Save Notes'}
```

With:
```tsx
{saving ? 'Saving...' : 'Save & Continue Later'}
```

**Change 7 — Button style — visually demote the secondary action (line 470):**

Replace:
```tsx
className="flex-1 rounded-xl border border-gray-900 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
```

With:
```tsx
className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
```

This makes it clearly secondary (gray border + gray text) vs the gradient primary button.

**Change 8 — Success status message (line 259):**

Replace:
```tsx
setStatus('Saved.');
```

With:
```tsx
setStatus('Notes saved \u2714');
```

(That's `Notes saved ✔` — the checkmark unicode character.)

**Change 9 — Brief confirmation before navigation (lines 262-265):**

The current code navigates immediately after save when in student context. Add a brief delay with a visible message:

Replace:
```tsx
if (!skipNav && hasStudentContext) {
  router.push(backHref);
  return;
}
```

With:
```tsx
if (!skipNav && hasStudentContext) {
  setStatus('Notes saved — you can come back anytime');
  setTimeout(() => router.push(backHref), 1200);
  return;
}
```

## Summary of all copy changes

| Location | Before | After |
|---|---|---|
| Section header (no student) | "Teacher Notes & Observations" | "Lesson Preview" + guidance text |
| Dropdown label | "Student (optional)" | "Who are you teaching?" |
| Default option | "Not selected" / "Select a student" | "Select a student to begin..." |
| Zero students | Empty disabled dropdown + "No students found" | CTA card: "You haven't added any students yet" + button |
| Old helper text | "Select a student to record observations" | Removed (replaced by preview header) |
| Save button | "Save Notes" | "Save & Continue Later" |
| Save button style | `border-gray-900 text-gray-900` | `border-gray-300 text-gray-600` |
| Save success (no nav) | "Saved." | "Notes saved ✔" |
| Save success (nav) | Immediate redirect | "Notes saved — you can come back anytime" → 1.2s → redirect |

## Do NOT change

- The `markComplete` function or "Mark Lesson Complete" button (that's KAN-112)
- The student selector dropdown logic or KAN-93/KAN-115 behavior
- Navigation behavior (already correct from KAN-52)
- Auth, routing, or DB schema
- Any other files

## Acceptance criteria to verify

1. Curriculum browser (no student): section header says "Lesson Preview" with guidance text
2. Dropdown label says "Who are you teaching?"
3. Zero-student state shows CTA card with "Add your first student" button (opens modal from KAN-115)
4. Save button says "Save & Continue Later" with muted gray style
5. Save from student context shows "Notes saved — you can come back anytime" then navigates
6. Save from curriculum path shows "Notes saved ✔" and stays on page
7. "Mark Lesson Complete" button label and style are unchanged
8. Logged-out preview block is unchanged
