# CC Prompt — KAN-115: Add Student/Group modal on lesson page — don't break teaching context

## Context

When a teacher selects "Add Student" or "Add Group" from the lesson page dropdown, the app currently calls `router.push('/teacher')`, dumping them back to the dashboard. They lose the lesson they were looking at. This is disorienting for teachers with low tech confidence.

The AddStudentModal and AddGroupModal already exist in `app/teacher/page.tsx` (lines 413-549 and 552-749). They work. We just need to extract them into shared components and mount them on the lesson page too.

## What to do

### Step 1: Extract AddStudentModal into `components/AddStudentModal.tsx`

Copy the `AddStudentModal` function from `app/teacher/page.tsx` lines 413-549 into a new file `components/AddStudentModal.tsx`.

**Changes needed during extraction:**

- Add `'use client';` at the top
- Import dependencies: `useState`, `useEffect`, `FormEvent`, `MouseEvent` from `react`, and `supabaseClient` from `@/lib/supabase`
- Change the `onCreated` prop signature from `() => Promise<void>` to `(newStudentId: string) => void` — the caller decides what to do with the new student ID
- After successful insert, query for the new student's ID before calling `onCreated`:
  ```typescript
  // After the insert succeeds, get the new student's ID
  const { data: newStudent } = await sb
    .from('students')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('first_name', firstName.trim())
    .eq('last_name', lastName.trim())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  onCreated(newStudent?.id || '');
  onClose();
  ```
- Export the component as a named export: `export function AddStudentModal(...)`

### Step 2: Extract AddGroupModal into `components/AddGroupModal.tsx`

Copy the `AddGroupModal` function from `app/teacher/page.tsx` lines 552-749 into a new file `components/AddGroupModal.tsx`.

**Changes needed during extraction:**

- Add `'use client';` at the top
- Import dependencies: `useState`, `useEffect`, `FormEvent`, `MouseEvent` from `react`, `supabaseClient` from `@/lib/supabase`, `useDefaultSubject` from `@/lib/startTeaching/useDefaultSubject`
- Import the types: `import type { StartTeachingStudent, StartTeachingGroup } from '@/lib/startTeaching/useStartTeachingData';`
- Keep the `onCreated` prop as `() => Promise<void>` (groups don't auto-select a student)
- Export as named export: `export function AddGroupModal(...)`

### Step 3: Update `app/teacher/page.tsx` to import from shared components

Replace the inline `AddStudentModal` and `AddGroupModal` function definitions (lines 413-749) with imports:

```typescript
import { AddStudentModal } from '@/components/AddStudentModal';
import { AddGroupModal } from '@/components/AddGroupModal';
```

**Adapt the teacher page's usage of AddStudentModal:**

The teacher page currently passes `onCreated: () => Promise<void>` which refetches data. With the new signature `onCreated: (newStudentId: string) => void`, update the teacher page's usage:

```typescript
<AddStudentModal
  open={isAddStudentOpen}
  onClose={() => setAddStudentOpen(false)}
  tenantId={tenantId}
  onCreated={async (_newId) => {
    await startData.refresh(); // or however the teacher page refetches
  }}
/>
```

Actually, look at how `onCreated` is called on the teacher page and preserve that behavior. The key is the callback signature change — the teacher page can ignore the `newStudentId` param and just refetch.

### Step 4: Use modals on the lesson page

In `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`:

**Add imports:**
```typescript
import { AddStudentModal } from '@/components/AddStudentModal';
import { AddGroupModal } from '@/components/AddGroupModal';
```

**Add state for modal visibility** (near the existing useState declarations around line 45):
```typescript
const [showAddStudentModal, setShowAddStudentModal] = useState(false);
const [showAddGroupModal, setShowAddGroupModal] = useState(false);
```

**Change `handleStudentChange`** (lines 186-194) — replace the redirect with modal open:

```typescript
const handleStudentChange = (value: string) => {
  if (value === '__action_add_student__') {
    setStudentId('');
    setShowAddStudentModal(true);
    return;
  }
  if (value === '__action_add_group__') {
    setStudentId('');
    setShowAddGroupModal(true);
    return;
  }
  const currentPath = `/teacher/curriculum/${chapter}/${group}/${module}`;
  router.push(`${currentPath}?student=${value}`);
};
```

**Add modal components** at the end of the return JSX (just before the closing `</div>`):

```tsx
<AddStudentModal
  open={showAddStudentModal}
  onClose={() => setShowAddStudentModal(false)}
  tenantId={tenantId}
  onCreated={(newStudentId) => {
    setShowAddStudentModal(false);
    if (newStudentId) {
      const currentPath = `/teacher/curriculum/${chapter}/${group}/${module}`;
      router.push(`${currentPath}?student=${newStudentId}`);
    }
  }}
/>
<AddGroupModal
  open={showAddGroupModal}
  onClose={() => setShowAddGroupModal(false)}
  tenantId={tenantId}
  students={students.map(s => ({ ...s, focus: '', status: '', type: 'student' as const, progressPercent: 0, progressLabel: null }))}
  existingGroups={[]}
  onCreated={async () => {
    setShowAddGroupModal(false);
  }}
/>
```

**Note on AddGroupModal props:** The `students` and `existingGroups` props use `StartTeachingStudent` and `StartTeachingGroup` types. The lesson page has a simpler `Student` type (`{ id: string; name: string }`). You'll need to either:
- (Preferred) Make AddGroupModal accept a simpler student type `{ id: string; name: string }[]` and map internally
- Or map the lesson page's students to the full type with placeholder values

The simplest approach: update AddGroupModal to accept `students: { id: string; name: string }[]` instead of `StartTeachingStudent[]` since it only uses `id` and `name` from each student (see lines 718-731 in the original). Then the teacher page and lesson page can both pass their student arrays directly.

## Files to modify

1. **NEW** `components/AddStudentModal.tsx` — extracted from teacher page
2. **NEW** `components/AddGroupModal.tsx` — extracted from teacher page
3. **EDIT** `app/teacher/page.tsx` — remove inline modal definitions, import from components
4. **EDIT** `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — add modal state, update handleStudentChange, render modals

## Do NOT change

- The modal's visual design, form fields, or validation logic
- The teacher page's existing behavior (it should work identically after the refactor)
- Auth, routing, or DB schema
- Any other files

## Acceptance criteria to verify

1. On the lesson page, selecting "Add Student" opens the modal over the page (no navigation)
2. After adding a student, the modal closes and the page reloads with `?student={newId}`
3. Selecting "Add Group" opens the group modal over the page (no navigation)
4. Pressing Escape closes either modal
5. Clicking the overlay (outside the modal) closes it
6. The teacher dashboard page (`/teacher`) still works identically with the extracted components
7. No TypeScript errors — types are compatible between the two pages
