---
id: BUG-role-save-400
title: "Role selection on /welcome/role fails with Supabase 400"
type: bug
feature: role-split
parent: KAN-131
related: KAN-135
severity: high
status: done
discovered_during: UAT KAN-135
fixed_in: 1462588
updated: 2026-04-22
---

# Fix: Role selection fails to save (Supabase 400 on profiles PATCH)

## Summary
On the `/welcome/role` page, selecting either "I'm a parent teaching my own child" or "I'm a teacher in a school or tutoring center" and clicking **Continue** surfaces the error toast **"Could not save your choice. Please try again."** Every attempt results in an HTTP 400 from Supabase against the `profiles` table, so the user cannot set a role and is stuck in a redirect loop between `/teacher/curriculum` → `/welcome/role`. This blocks the entire role-gating feature (KAN-131) and makes UATs 01, 02, 03, 05 (authed), and 06 of KAN-135 untestable.

## Reproduction
1. Sign in as any account whose `profiles.role` column is `null` (reproduced on dev account `nriyer25@gmail.com`, user id `dc978973-c699-49f1-b113-f7b559b7784c`).
2. Navigate to `https://padi-mvp.vercel.app/welcome/role` (or hit `/teacher/curriculum` and let the app redirect you).
3. Click either role card, then click **Continue**.
4. Observe the red error banner: *"Could not save your choice. Please try again."*
5. Retrying the click reproduces the same 400 every time.

## Observed evidence
- **Network:** `PATCH https://<project>.supabase.co/rest/v1/profiles?id=eq.<user-id>` returns `400` on every click. Three consecutive attempts all failed identically.
- **Console:** On `/teacher/curriculum` load, the client logs:
```
  [WARNING] Unknown role: null — defaulting to teacher view
```
  confirming `profiles.role` is `null` for the authed user.
- **Client code (minified, `app/welcome/role/page-*.js`):**
  Uses `supabase.from('profiles').update({ role, role_set_at }).eq('id', userId)` — an UPDATE (not an UPSERT), which fails silently / 400s when no matching row exists or when RLS rejects the write.
- **Redirect loop:** Because the role never persists, `/teacher/curriculum` keeps redirecting back to `/welcome/role`, and the user cannot reach the gated UI at all.

## Likely root causes (investigate and confirm)
Check in order — any one of these could be the culprit, or a combination:

1. **No `profiles` row is ever created for new users.** The app's Supabase `auth.users → public.profiles` trigger (`handle_new_user` or similar) may be missing, broken, or may not run for users created before it was added. An UPDATE against a non-existent row matches zero rows; combined with a `.select().single()` chain or a PostgREST `Prefer: return=representation` header this returns 400 ("JSON object requested, multiple (or no) rows returned").
2. **RLS policy on `public.profiles` does not allow the authenticated user to update their own `role` / `role_set_at` columns.** Expected policy: `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)` for `UPDATE`.
3. **Column or enum mismatch.** Verify `profiles.role` is a text column or has an enum type that accepts the exact string values `'parent'` and `'teacher'`. Check for a `CHECK` constraint that rejects the payload.
4. **Client sends an unexpected field.** Inspect the actual PATCH body — confirm it's `{ role: 'parent' | 'teacher', role_set_at: <ISO timestamp> }` and nothing else.

## Scope of fix
1. **Guarantee a `profiles` row exists for every authenticated user.**
   - Add / verify a Supabase SQL trigger `on auth.users insert` that inserts a `profiles` row with `id = NEW.id`, `role = NULL`, `role_set_at = NULL`.
   - Backfill migration: `INSERT INTO public.profiles (id) SELECT id FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles) ON CONFLICT DO NOTHING;`
2. **Make the client write idempotent.** In the `/welcome/role` page component (see `app/welcome/role/page.tsx` or equivalent), change the save call from `.update(...)` to `.upsert({ id: userId, role, role_set_at }, { onConflict: 'id' })`. This protects against missing rows in prod even if the trigger hiccups.
3. **Verify / fix RLS policies on `public.profiles`:**
```sql
   alter table public.profiles enable row level security;

   create policy "profiles_select_own"
     on public.profiles for select
     using (auth.uid() = id);

   create policy "profiles_upsert_own"
     on public.profiles for insert
     with check (auth.uid() = id);

   create policy "profiles_update_own"
     on public.profiles for update
     using (auth.uid() = id)
     with check (auth.uid() = id);
```
4. **Surface a useful error to the user** when the save fails (log the Supabase error `code`/`message` to the console at minimum; bubble up a distinguishable toast for RLS vs. network vs. validation failures).
5. **Harden the redirect logic in `app/teacher/layout.tsx` (or wherever `/teacher/*` checks role):** if the role-fetch itself errors (as opposed to returning `role: null`), do **not** redirect to `/welcome/role` — instead show an inline error so we don't create infinite redirect loops on future regressions.

## Files likely involved
- `app/welcome/role/page.tsx` — role-selection UI and save handler
- `app/teacher/layout.tsx` (or middleware) — role-based redirect
- `lib/supabase/*` — client setup and any profile helpers (look for `getOrCreateProfile`, `fetchRole`)
- `supabase/migrations/*` — schema for `profiles`, triggers, RLS policies
- `supabase/seed.sql` if present

## Acceptance criteria
- [ ] Logging in as a fresh user automatically creates a `profiles` row (verified via SQL: `select count(*) from public.profiles where id = '<new-user-id>'` returns 1).
- [ ] On `/welcome/role`, selecting a card + Continue persists the choice (PATCH/UPSERT returns 2xx) and redirects into `/teacher/curriculum`.
- [ ] `profiles.role` reflects `'parent'` or `'teacher'` and `profiles.role_set_at` is set to a recent timestamp.
- [ ] Changing role again (back to `/welcome/role` and picking the other card) also succeeds — no uniqueness/trigger conflict.
- [ ] `/teacher/curriculum` no longer logs `Unknown role: null — defaulting to teacher view` for a user who has selected a role.
- [ ] All six KAN-135 UATs can be executed end-to-end (this bug unblocks them; the UATs themselves will be re-verified separately).
- [ ] No regression for the logged-out preview at `/teacher/curriculum` — it must still render the full teacher view (toggle + all chapter types) as it does today (UAT-04 must remain ✅).

## Test plan
1. **Unit / integration (preferred):**
   - Add a test for the save handler that mocks the Supabase client and asserts an `upsert` call with the right payload.
   - Add a migration test (or a post-deploy SQL check) that verifies the `handle_new_user` trigger creates a `profiles` row.
2. **Manual happy path:**
   - Create a new test account → log in → confirm redirect to `/welcome/role` → pick "parent" → land on `/teacher/curriculum` → verify the toggle is hidden and only Individual chapters render (UAT-01, UAT-02).
   - Go back to `/welcome/role` → pick "teacher" → verify toggle renders and all chapters visible (UAT-03).
   - Log out → visit `/teacher/curriculum` → confirm logged-out preview is unchanged (UAT-04).
3. **Error path:**
   - Temporarily break the Supabase URL in `.env.local` → confirm the error toast is informative and does NOT cause an infinite redirect.

## Out of scope
- Changing the copy of the role-selection cards.
- Adding a self-serve "change role later" settings page (tracked separately if desired).
- Any UI redesign of `/teacher/curriculum`.

## Notes for the implementer
- Use `upsert` rather than `update` even after the trigger is fixed — belt-and-suspenders for future envs.
- Double-check that `role_set_at` is written as a Postgres `timestamptz` (ISO string from the client is fine).
- If the project uses a server action or route handler instead of calling Supabase directly from the client for this write, apply the same upsert + error-surfacing changes there.
- Keep the fix minimal and well-scoped — this bug blocks the feature shipped in KAN-131 and we want a clean diff for review.