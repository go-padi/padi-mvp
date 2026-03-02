# Lovable Update 9 — Fix Logged-In State Bugs + Deprecate Ahead-of-Prod Fields

**Date:** 2026-03-01
**Context:** Design review found 2 bugs (demo data shown to logged-in users) and 3 field-level corrections where Lovable is ahead of the codebase. This update brings Lovable back in sync.

---

## Prompt to paste into Lovable

```
This update fixes logged-in state bugs and removes fields that are ahead of the codebase.

### 1. Assessments tab — logged-in empty state (BUG FIX)

When the user is logged in (authenticated), the Assessments tab currently still shows demo data and the amber "Read-only preview: sign in to record live assessment results" banner. This is wrong — demo data should never appear for logged-in users.

Fix:
- When logged in AND no real assessment data exists, replace the entire demo table with an empty state card:
  - Heading: "No assessments recorded yet"
  - Body: "Start teaching lessons and recording observations to see assessment data here."
  - Show the green "Workspace tools enabled for this session." status line (already shown on other tabs)
- Remove the amber preview banner for authenticated users
- Keep the demo table ONLY for logged-out users (existing behavior)

### 2. Grouping & Progress tab — logged-in empty state (BUG FIX)

Same bug. When logged in, the Grouping & Progress tab still shows demo group cards (Group A, B, C) and demo individual students. Demo data should never appear for logged-in users.

Fix:
- When logged in AND no real groups/students exist, replace demo content with an empty state card:
  - Heading: "No groups created yet"
  - Body: "Add students and create groups from the Start Teaching page to see grouping and progress data here."
  - Optionally include a button/link: "Go to Start Teaching →" that navigates to /teacher/start
- Show the green "Workspace tools enabled for this session." status line
- Remove all demo group cards and demo student rows for authenticated users
- Keep the demo data ONLY for logged-out users (existing behavior)

### 3. Add Student modal — revert to First Name + Last Name

The Add Student modal in the Start Teaching onboarding wizard currently has a single "Student Name" field plus optional "Student ID" and "Notes" fields. The codebase uses First Name + Last Name (both required) with no other fields.

Fix:
- Replace the single "Student Name" field with two fields: "First Name" (required) and "Last Name" (required)
- Remove the "Student ID (Optional)" field entirely
- Remove the "Notes (Optional)" field entirely
- Keep everything else about the modal the same

### 4. Teacher Notes form — remove Teacher ID, mark Audio as coming soon

On the lesson detail page (e.g., LS-1), when logged in, the "Teacher Notes & Observations" form currently has a "Teacher ID" input field. This is redundant because we already know who the teacher is from their login session.

Fix:
- Remove the "Teacher ID" field entirely from the Teacher Notes & Observations form
- On the "Upload Audio Recording (Optional)" section, add a small gray label below the upload button: "(Coming soon)" and make the upload button disabled/grayed out
- Keep the Session Notes textarea and "Save Notes & Continue" button as-is — those are correct
```

---

## Changes summary

| # | What | Why |
|---|------|-----|
| 1 | Assessments tab empty state when logged in | Bug: demo data shown to authenticated users |
| 2 | Grouping & Progress empty state when logged in | Bug: demo data shown to authenticated users |
| 3 | Add Student modal → First Name + Last Name | Codebase uses split name fields, no Student ID/Notes |
| 4 | Remove Teacher ID, disable Audio Upload | Teacher ID redundant with auth; audio is post-MVP |

## Related tickets (codebase work, tracked separately)

- KAN-44: Onboarding wizard for first-time Start Teaching (KAN-35)
- KAN-45: Assessments tab — logged-in empty state (KAN-36)
- KAN-46: Grouping & Progress — logged-in empty state (KAN-36)
- KAN-47: Teacher Notes — save session notes on lesson detail (KAN-37)
