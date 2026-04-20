# CC Prompt — KAN-120: Cannot complete lesson when logged in

## Bug

When a logged-in teacher clicks "Complete Lesson" on the lesson detail page, an error message appears and the `module_assessment` record is not saved. The root cause is an **RLS policy mismatch** on the `module_assessment` table.

## Root Cause

The `module_assessment` table uses a **JWT-based** RLS policy that checks `auth.jwt() ->> 'tenant_id'`. This does NOT work because Supabase JWTs don't include a top-level `tenant_id` claim — the tenant ID is stored in the `profiles` table, not the JWT.

Every other tenant-scoped table (`students`, `groups`, `subjects`, `teaching_notes`, `student_group_memberships`, `lesson_completions`) uses the **profiles-based** pattern:

```sql
tenant_id in (select tenant_id from public.profiles where id = auth.uid())
```

But `module_assessment` uses the broken pattern (in both the migration AND fresh-setup.sql):

```sql
(auth.jwt() ->> 'tenant_id') = tenant_id::text
```

## Fix — 3 steps

### Step 1: Create a new migration to fix the RLS policy

Create `supabase/migrations/20260419_fix_module_assessment_rls.sql`:

```sql
-- KAN-120: Fix module_assessment RLS to use profiles-based pattern
-- The JWT-based policy doesn't work because tenant_id is not in the JWT

drop policy if exists "module assessment tenant access" on public.module_assessment;

create policy "module assessment tenant access"
on public.module_assessment
for all
using (
  tenant_id in (
    select tenant_id
    from public.profiles
    where id = auth.uid()
  )
);
```

### Step 2: Update fresh-setup.sql to match

In `supabase/fresh-setup.sql`, find lines 372-374:

```sql
create policy "module assessment tenant access" on public.module_assessment
  for all using ((auth.jwt() ->> 'tenant_id') = tenant_id::text)
  with check ((auth.jwt() ->> 'tenant_id') = tenant_id::text);
```

Replace with:

```sql
create policy "module assessment tenant access" on public.module_assessment
  for all using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));
```

### Step 3: Fix the markComplete / saveNotes state conflict in the lesson page

In `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`, the `markComplete` function calls `await saveNotes(true)` at line ~309. This has a subtle issue: `saveNotes` calls `setSaving(false)` when it finishes, but `markComplete` is still running and expects `saving` to remain true.

Fix: extract the save-notes-for-completion logic so it doesn't manipulate `saving` state. In `markComplete`, replace lines 308-311:

```tsx
// Before (broken):
if (notes.trim()) {
  await saveNotes(true);
}
```

With a direct insert that doesn't touch the saving state:

```tsx
if (notes.trim() && tenantId && studentId) {
  const sb = supabaseClient();
  let attachment_url: string | null = null;
  let attachment_name: string | null = null;
  let attachment_type: string | null = null;
  if (audioFile) {
    try {
      const { data: userData } = await sb.auth.getUser();
      const user = userData?.user;
      if (user) {
        const path = `${user.id}/${moduleRow?.code || 'module'}/${Date.now()}_${audioFile.name}`;
        const { error: uploadErr } = await sb.storage.from('lesson-attachments').upload(path, audioFile, { cacheControl: '3600', upsert: false });
        if (!uploadErr) {
          const { data: signed } = await sb.storage.from('lesson-attachments').createSignedUrl(path, 60 * 60 * 24 * 7);
          attachment_url = signed?.signedUrl || null;
          attachment_name = audioFile.name;
          attachment_type = audioFile.type;
        }
      }
    } catch (err) {
      console.error('Audio upload during completion:', err);
    }
  }
  await sb.from('teaching_notes').insert({
    tenant_id: tenantId,
    student_id: studentId,
    module_code: moduleRow?.code || module,
    notes,
    attachment_url,
    attachment_name,
    attachment_type,
  });
}
```

## Apply the migration to live Supabase

After creating the migration file, run it against the live database. The Supabase project ID is `rcrjfweguedbtfngeovp`.

You can apply via the Supabase MCP `execute_sql` tool or the dashboard SQL editor.

## Verification

1. `npx tsc --noEmit` — should pass clean
2. `npx next lint` — should pass clean
3. Test: log in → navigate to a student → open a lesson → add notes → click "Mark Lesson Complete" → select a signal → click "Complete Lesson" → should succeed and redirect back

## Files to change

| File | Change |
|------|--------|
| `supabase/migrations/20260419_fix_module_assessment_rls.sql` | **NEW** — migration to fix RLS policy |
| `supabase/fresh-setup.sql` line 372-374 | Replace JWT policy with profiles-based pattern |
| `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` lines 308-311 | Fix saveNotes state conflict in markComplete |
