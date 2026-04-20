# CC Prompt — KAN-112: Readiness signal step on lesson completion

## Context

This is the most important ticket in the Start Teaching flow. When a teacher marks a lesson complete, they should classify the student's readiness using warm, teacher-friendly language. This is the moment the north star's three-signal output gets generated.

Currently "Mark Lesson Complete" (line 486) calls `markComplete()` which immediately upserts to `module_assessment` with `status: 'completed'` and no readiness signal. The `module_assessment` table already has a `teacher_feedback text` column ready to store the signal.

**ICP**: A teacher with low tech confidence. The signal step must feel natural, not clinical. Every option must look safe to pick.

## Key file

`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — this is the ONLY file to modify.

## What to do

### Step 1: Add new state variables

Near line 53 (after the existing useState declarations), add:

```typescript
const [showSignalStep, setShowSignalStep] = useState(false);
const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
const [completionMessage, setCompletionMessage] = useState<string | null>(null);
```

### Step 2: Define the signal options as a constant

After the state declarations (around line 56), add:

```typescript
const SIGNAL_OPTIONS = [
  {
    value: 'ready',
    label: 'On Track',
    description: 'Progressing well, ready to move on',
    color: 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
    selectedColor: 'border-green-500 bg-green-100 text-green-900 ring-2 ring-green-500',
    icon: '🟢',
    confirmation: (name: string) => `Great progress! Next lesson is ready for ${name}.`,
  },
  {
    value: 'needs_help',
    label: 'Needs Practice',
    description: 'Getting there, could use more time',
    color: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
    selectedColor: 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-500',
    icon: '🟡',
    confirmation: (name: string) => `Notes saved. Consider revisiting this lesson or trying the extension activities with ${name}.`,
  },
  {
    value: 'needs_intervention',
    label: 'Needs Extra Support',
    description: 'Struggling, may need a different approach',
    color: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
    selectedColor: 'border-red-400 bg-red-100 text-red-900 ring-2 ring-red-400',
    icon: '🔴',
    confirmation: (name: string) => `Notes saved. You may want to discuss ${name}'s progress with their parent or a reading specialist.`,
  },
];
```

### Step 3: Modify `markComplete` to accept and store the signal

Replace the entire `markComplete` function (lines 270-305) with:

```typescript
const markComplete = async (signal: string) => {
  if (!tenantId || !studentId || !moduleRow) return;
  setSaving(true);
  setStatus(null);
  try {
    // Save notes first if there are any
    if (notes.trim()) {
      await saveNotes(true);
    }
    const subjectId = await ensureSubject(tenantId);
    if (!subjectId) {
      setStatus('Could not resolve subject.');
      return;
    }
    const sb = supabaseClient();
    const { error } = await sb.from('module_assessment').upsert(
      {
        tenant_id: tenantId,
        student_id: studentId,
        subject_id: subjectId,
        module_id: moduleRow.code,
        notes: notes.trim() || 'Completed',
        status: 'completed',
        teacher_feedback: signal,
      },
      { onConflict: 'tenant_id,student_id,subject_id,module_id' },
    );
    if (error) {
      console.error(error);
      setStatus('Failed to mark complete.');
    } else {
      // Show contextual confirmation message before navigating
      const option = SIGNAL_OPTIONS.find(o => o.value === signal);
      const studentName = contextStudentName || 'this student';
      const message = option?.confirmation(studentName) || 'Lesson complete!';
      setCompletionMessage(message);
      setShowSignalStep(false);
      setTimeout(() => router.push(backHref), 2500);
    }
  } finally {
    setSaving(false);
  }
};
```

### Step 4: Change the "Mark Lesson Complete" button to open the signal step

Find the Mark Lesson Complete button (lines 485-491). Replace:

```tsx
<button
  onClick={markComplete}
  disabled={saving || (!hasStudentContext && !studentId) || (!notes.trim() && !audioFile && !loadedAttachmentUrl)}
  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
>
  {saving ? 'Saving...' : 'Mark Lesson Complete'}
</button>
```

With:

```tsx
<button
  onClick={() => setShowSignalStep(true)}
  disabled={saving || showSignalStep || (!hasStudentContext && !studentId) || (!notes.trim() && !audioFile && !loadedAttachmentUrl)}
  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
>
  {saving ? 'Saving...' : 'Mark Lesson Complete'}
</button>
```

The only changes: `onClick` opens signal step instead of directly completing, and `showSignalStep` is added to the disabled condition so you can't double-click.

### Step 5: Add the inline signal card and completion message

Right after the button row's closing `</div>` (after line 492) and before the `{status && ...}` line (line 493), add the signal step UI and completion message:

```tsx
{/* Readiness signal step */}
{showSignalStep && !completionMessage && (
  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="space-y-1">
      <h4 className="text-base font-semibold text-gray-900">
        How is {contextStudentName || 'this student'} doing with this lesson?
      </h4>
      <p className="text-xs text-gray-600">
        This helps you track progress and plan next steps. There are no wrong answers.
      </p>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SIGNAL_OPTIONS.map(option => (
        <button
          key={option.value}
          onClick={() => setSelectedSignal(option.value)}
          className={clsx(
            'rounded-xl border-2 p-4 text-left transition-all',
            selectedSignal === option.value ? option.selectedColor : option.color,
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{option.icon}</span>
            <span className="text-sm font-semibold">{option.label}</span>
          </div>
          <p className="mt-1 text-xs opacity-80">{option.description}</p>
        </button>
      ))}
    </div>
    {selectedSignal === 'needs_intervention' && (
      <p className="text-xs text-gray-600 italic">
        It's okay to select this — it helps you plan the right next steps for {contextStudentName || 'this student'}.
      </p>
    )}
    <div className="flex items-center gap-3">
      <button
        onClick={() => selectedSignal && markComplete(selectedSignal)}
        disabled={!selectedSignal || saving}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
      >
        {saving ? 'Completing...' : 'Complete Lesson'}
      </button>
      <button
        onClick={() => {
          setShowSignalStep(false);
          setSelectedSignal(null);
        }}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{/* Post-completion confirmation */}
{completionMessage && (
  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-lg">✅</span>
      <h4 className="text-base font-semibold text-green-900">Lesson complete!</h4>
    </div>
    <p className="text-sm text-green-800">{completionMessage}</p>
    <p className="text-xs text-green-600">Redirecting...</p>
  </div>
)}
```

### Step 6: Hide the button row when completion message is showing

Wrap the existing button row `<div className="flex gap-3">` in a condition so it hides after completion:

```tsx
{!completionMessage && (
  <div className="flex gap-3">
    {/* ... existing Save & Continue Later + Mark Lesson Complete buttons ... */}
  </div>
)}
```

Also hide the amber helper text when completionMessage is showing — wrap the existing `{(hasStudentContext || studentId) && ...}` helper text block (line 474) the same way:

```tsx
{!completionMessage && (hasStudentContext || studentId) && !notes.trim() && !audioFile && !loadedAttachmentUrl && (
  <p className="text-xs text-amber-600">Add observations before completing this lesson</p>
)}
```

## Animation note

The `animate-in fade-in slide-in-from-top-2 duration-200` classes are Tailwind CSS animation utilities. If they don't work in this project (they require `tailwindcss-animate` plugin), just remove them. The signal card will appear instantly, which is fine.

## Do NOT change

- The `saveNotes` function (already correct from KAN-52/KAN-113)
- The `Save & Continue Later` button (already correct from KAN-113)
- The student selector, preview mode, or modals (already correct from KAN-93/KAN-114/KAN-115)
- Auth, routing, or DB schema
- Any other files
- The `module_assessment` table — `teacher_feedback` column already exists

## Acceptance criteria to verify

1. Clicking "Mark Lesson Complete" reveals an inline signal card (no modal, no page change)
2. Three signal options are visible: On Track (green), Needs Practice (amber), Needs Extra Support (red)
3. Each option has an icon + label + description and is a large tap target
4. Selecting an option highlights it with a ring/border
5. "Complete Lesson" confirm button is disabled until a signal is selected
6. Selecting "Needs Extra Support" shows reassuring helper text
7. On confirm: `module_assessment.teacher_feedback` is set to the signal value (`ready`, `needs_help`, or `needs_intervention`)
8. After completion: a contextual confirmation message shows for ~2.5 seconds, then navigates back
9. "Cancel" collapses the signal card and resets selection
10. The signal step only appears when a student is selected (disabled conditions unchanged)
11. Logged-out users never see the signal step
