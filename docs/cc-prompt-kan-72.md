# CC Prompt — KAN-72: Student card freezes on load when not logged in

## Bug

When a logged-out user clicks a demo student card on the Start Teaching page, the student detail page (`app/teacher/start-teaching/students/[studentId]/page.tsx`) shows "Loading..." forever.

## Root Cause

The main `useEffect` (line 93) has an early return for logged-out users:

```tsx
if (!isHydrated || !isLoggedIn) return;
```

This means `loading` stays `true` and `setStudent` / `setChapters` are never called. The render guard at line 239 shows "Loading..." indefinitely:

```tsx
if (!isHydrated || loading) {
  return <div>Loading...</div>;
}
```

## Context

The teacher index page (`app/teacher/page.tsx`) renders demo student cards in its logged-out preview with links to `/teacher/start-teaching/students/${student.id}` (line 185). These use demo IDs like `stu-1` through `stu-9` from `lib/demo/demoStudents.ts`.

The student detail page already has demo curriculum fallback logic — when Supabase returns no groups, it falls back to `previewGroups` / `previewModulesByGroup` from `lib/demo/demoCurriculum.ts` (lines 135-156). So the curriculum accordion already works without a DB. The only missing piece is populating the `student` state from demo data.

## Fix

Add a logged-out fallback path that uses demo student data and demo curriculum. The curriculum fallback already exists — you just need to wire up the student lookup.

### Step 1: Import demoStudents

At the top of `app/teacher/start-teaching/students/[studentId]/page.tsx`, add:

```tsx
import { demoStudents } from '@/lib/demo/demoStudents';
```

### Step 2: Add a logged-out branch in the useEffect

Replace the current useEffect (starting at line 93) with logic that handles both cases:

```tsx
useEffect(() => {
  if (!isHydrated) return;

  const fetchData = async () => {
    if (!isLoggedIn) {
      // Demo fallback: look up from demo data
      const demoStudent = demoStudents.find(s => s.id === studentId);
      if (demoStudent) {
        setStudent({
          id: demoStudent.id,
          name: demoStudent.name,
          focusAreas: demoStudent.focusAreas,
          progressPercent: demoStudent.progressPercent,
          progressLabel: demoStudent.progressLabel,
          assessmentStatus: demoStudent.assessmentStatus,
        });
      }

      // Build chapters from demo curriculum (same fallback as logged-in path)
      const resolvedGroups = previewGroups.map((g) => ({ ...g, id: g.id } as GroupRow));

      const groupModulesEntries = resolvedGroups.map((g) => {
        const fallback = (previewModulesByGroup[g.code] || []).map((m) => ({
          ...m,
          is_locked: m.is_locked ?? null,
          display_order: m.display_order ?? null,
        })) as ModuleRow[];
        return [g.code, fallback] as const;
      });
      const modulesByGroup = new Map(groupModulesEntries);

      const chapterGroupMap = new Map<string, GroupWithModules[]>();
      for (const g of resolvedGroups) {
        const chCode = groupToChapterCode[g.code];
        if (!chCode) continue;
        const mods = modulesByGroup.get(g.code) || [];
        const gwm: GroupWithModules = {
          code: g.code,
          title: g.title,
          description: g.description,
          modules: mods,
          completedCount: 0,  // no completion data in demo mode
          totalCount: mods.length,
        };
        if (!chapterGroupMap.has(chCode)) chapterGroupMap.set(chCode, []);
        chapterGroupMap.get(chCode)!.push(gwm);
      }

      const builtChapters: ChapterWithGroups[] = previewChapters
        .filter((ch) => chapterGroupMap.has(ch.code))
        .map((ch) => ({
          code: ch.code,
          title: ch.title,
          description: ch.description,
          groups: chapterGroupMap.get(ch.code) || [],
        }));

      setChapters(builtChapters);
      if (builtChapters.length > 0) {
        setExpandedChapters(new Set([builtChapters[0].code]));
      }
      setLoading(false);
      return;
    }

    // --- Existing logged-in fetch logic (unchanged from line 96 onwards) ---
    const sb = supabaseClient();
    // ... rest of existing code ...
```

**Important:** keep all the existing logged-in logic exactly as-is. Just wrap it inside the `if (!isLoggedIn)` / else branch and add `isLoggedIn` to the dependency array if not already there.

### Step 3: Add a preview banner for logged-out users

Below the student header card (around line 307), add a preview banner similar to the one on the teacher page:

```tsx
{!isLoggedIn && (
  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    Preview mode: sign in to track progress and complete lessons for this student.
  </div>
)}
```

### Step 4: Disable completion actions in demo mode

The lesson links from the student detail page include `?student=${studentId}`. When the student ID is a demo ID (like `stu-1`), the lesson page won't be able to save notes or mark complete (which is correct — those require auth). No code change needed here, it already guards with `isLoggedIn`.

However, the "Start Teaching" / "Continue Teaching" button text should change to "View Lesson" in demo mode. In the module row rendering (around line 448), update:

```tsx
{isCurrent && (
  <Link
    href={lessonHref}
    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
  >
    {isLoggedIn
      ? (completedCount === 0 ? 'Start Teaching' : 'Continue Teaching')
      : 'View Lesson'}
  </Link>
)}
```

Also make "upcoming" modules clickable in demo mode (they're currently greyed out and non-interactive). Since there's no real sequential enforcement in demo mode, logged-out teachers should be able to browse any lesson:

```tsx
{isUpcoming && (
  isLoggedIn ? (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-400">
      Upcoming
    </span>
  ) : (
    <Link
      href={lessonHref}
      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-200"
    >
      Preview →
    </Link>
  )
)}
```

## Verification

1. `npx tsc --noEmit` — should pass clean
2. `npx next lint` — should pass clean
3. Test logged out: go to Start Teaching → click any demo student card → page should load with student name, demo curriculum accordion, preview banner, and "View Lesson" buttons
4. Test logged in: behavior should be unchanged — real student data, real progress, "Start Teaching" / "Continue Teaching" buttons

## Files to change

| File | Change |
|------|--------|
| `app/teacher/start-teaching/students/[studentId]/page.tsx` | Add demo fallback in useEffect, preview banner, button text changes |

No new files. No DB changes. Single file edit.
