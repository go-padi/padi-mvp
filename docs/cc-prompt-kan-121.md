# CC Prompt — KAN-121: Simplify demo data for parent ICP

## Goal

The logged-out preview should feel like a parent previewing their own child's experience — not a teacher managing 9 students and 3 groups. Cut the demo data down, rewrite jargon, and default to Individual mode.

## Changes — 5 files

### 1. `lib/demo/demoStudents.ts` — Cut from 9 to 3 students

Replace the entire `demoStudents` array with:

```ts
export const demoStudents: DemoStudent[] = [
  {
    id: 'stu-1',
    name: 'Maya P.',
    groupId: '',
    progressPercent: 32,
    progressLabel: 'Chapter 1 of 7 — Listening',
    focusAreas: ['Listening', 'Rhyming'],
    assessmentStatus: 'In progress',
  },
  {
    id: 'stu-5',
    name: 'Nia S.',
    groupId: '',
    progressPercent: 27,
    progressLabel: 'Chapter 1 of 7 — Recognizing Sounds',
    focusAreas: ['Recognizing Sounds', 'Following Patterns'],
    assessmentStatus: 'Needs Help',
  },
  {
    id: 'stu-6',
    name: 'Eli J.',
    groupId: '',
    progressPercent: 61,
    progressLabel: 'Chapter 3 of 7 — Sounding Out Words',
    focusAreas: ['Sounding Out Words', 'Rhyming'],
    assessmentStatus: 'Ready',
  },
];
```

Key changes:
- 3 students, not 9 — each showcasing a different north star signal
- `groupId` is `''` for all (parents don't use groups)
- Focus areas rewritten in parent-friendly language: "Sound ID" → "Recognizing Sounds", "Blending" → "Sounding Out Words", "Sequencing" → "Following Patterns"
- Progress labels are journey-oriented ("Chapter 1 of 7 — Listening") instead of daunting ("12/36 lessons")
- IDs kept as `stu-1`, `stu-5`, `stu-6` so any existing bookmarks or test references still resolve

### 2. `lib/demo/demoGroups.ts` — Empty the groups array for logged-out

Replace the `demoGroups` array with an empty array:

```ts
export const demoGroups: DemoGroup[] = [];
```

Keep the type export and the derived `demoGroupIndex` / `demoStudentsByGroup` — they'll just be empty objects, which is fine. The logged-out teacher page already handles empty groups gracefully (it just doesn't render the groups section).

### 3. `app/teacher/page.tsx` — Rewrite preview highlight cards

Find the `previewHighlights` array (around line 25-38) and replace with:

```ts
const previewHighlights = [
  {
    title: 'See what your child will learn',
    body: 'Browse the full curriculum — every lesson, activity, and skill area laid out step by step.',
  },
  {
    title: 'Track how they\'re progressing',
    body: 'Watch your child move through chapters and see which areas need more practice.',
  },
  {
    title: 'Know if they\'re ready for school',
    body: 'Padi helps you determine if your child is Ready, Needs Help, or Needs Intervention — so you can act early.',
  },
];
```

### 4. `lib/teachingModeContext.tsx` — Default to Individual for new visitors

The initial state is `'both'` (line 15). Change it to `'individual'`:

```ts
const [mode, setModeState] = useState<TeachingMode>('individual');
```

This means first-time visitors (no localStorage value) see Individual mode. Teachers who switch to Group or Both will have their preference saved to localStorage and restored on return. Logged-in teachers who prefer 'both' already have it persisted.

### 5. `lib/demo/demoAssessments.ts` — No changes needed

This file derives from `demoStudents`, so it will automatically reflect the reduced student list.

## Verification

1. `npx tsc --noEmit` — clean
2. `npx next lint` — clean
3. Test logged out:
   - Start Teaching page shows 3 student cards, no group cards
   - Teaching mode defaults to Individual
   - Student cards show parent-friendly focus areas and chapter-based progress
   - Each card shows one of the 3 signals: In progress, Needs Help, Ready
   - Preview highlight cards use parent-reassurance language
4. Test logged in:
   - Logged-in teacher with existing students/groups should be unaffected
   - If teacher previously set mode to 'both' or 'group', localStorage preserves their choice
