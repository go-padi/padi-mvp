# Review of `6ac6d58` — fixes before KAN-130

You committed KAN-128 + KAN-129 as `6ac6d58`. The core work is approved, but two things must change before you start KAN-130, and two nits should land with the KAN-130 work.

Do these in order. When all four are green, proceed to KAN-130.

## 0. Check these docs into the repo

Before touching any code, add both handoff docs to the repo so the review trail lives alongside the work.

**Do:**

```bash
mkdir -p docs
cp /Users/nishaiyer/Documents/Claude/Projects/Padi\ app/docs/role-split-cc-handoff.md docs/
cp /Users/nishaiyer/Documents/Claude/Projects/Padi\ app/docs/role-split-cc-review-6ac6d58.md docs/
git add docs/role-split-cc-handoff.md docs/role-split-cc-review-6ac6d58.md
git commit -m "docs: add role-split epic handoff and 6ac6d58 review notes"
```

These stay in the repo permanently as part of the KAN-127 paper trail.

**Verify:**

- `ls docs/` shows both files.
- `git log --oneline docs/` shows the new commit.

## 1. Add `role_set_at` to close the silent-teacher loophole

**Why this matters.** Your current `handle_new_user` trigger bootstraps new rows with `role='teacher'` to satisfy the NOT NULL constraint. If the route guard in KAN-130 checks "is `role` non-null" to decide whether to show the picker, any signup interrupted after auth but before the picker submit will silently become a teacher on resume — the user was never asked. That's a trust hole for the parent ICP and defeats the whole epic.

**Do:**

1. Add a new migration `supabase/migrations/<next-ts>_add_profile_role_set_at.sql`:

   ```sql
   -- KAN-130: track whether the role was explicitly chosen by the user.
   alter table public.profiles
     add column if not exists role_set_at timestamptz;
   ```

   No default, nullable. `null` means "role has not been explicitly set by the user — show the picker."

2. Update `supabase/fresh-setup.sql` to include the same column on the `profiles` table definition, so fresh envs match.

3. In KAN-130's picker submit handler, write both fields in one update:

   ```ts
   await sb.from('profiles')
     .update({ role: selected, role_set_at: new Date().toISOString() })
     .eq('id', user.id);
   ```

4. The picker route guard checks `role_set_at is null`, not `role is null`. If `role_set_at` is null, show the picker regardless of what `role` currently holds. If `role_set_at` is set, skip picker and route onward.

**Verify:**

- Sign up, close the tab before submitting the picker, reopen the app → picker shows again (does not auto-teacher).
- Sign up, submit picker as parent → `role='parent'`, `role_set_at` is a timestamp near now, no picker on next login.
- Sign up, submit picker as teacher → `role='teacher'`, `role_set_at` set, no picker on next login.

## 2. Regenerate `lib/database.types.ts`

**Why this matters.** You added the `gen:types` script to `package.json` but did not run it. `lib/auth-store.tsx` currently casts `(data as { role: string } | null)` to work around the missing type. Any new typed query on `profiles` in KAN-130 or KAN-131 will either repeat the cast or hit a type error.

**Do:**

1. Run `pnpm gen:types` against the linked Supabase project.
2. Commit the regenerated `lib/database.types.ts`.
3. Optionally remove the manual cast in `fetchRole` now that `role` is on the generated type — but the cast is harmless, so only do this if it's a clean diff.

**Verify:**

- `grep -n "role" lib/database.types.ts` returns a hit on the `profiles` table type.
- TypeScript compiles without errors.

## 3. Resolve the `default 'teacher'` mismatch

**Why this matters.** `supabase/fresh-setup.sql` declares the column as `role text not null default 'teacher' check (role in ('parent','teacher'))`. The migration has no column-level default — it relies on the trigger. Fresh environments and migrated environments diverge: a direct `insert into profiles (id, tenant_id, email)` succeeds on fresh (default fills in), fails on migrated (NOT NULL violation). This will eventually bite someone.

**Do:**

Drop the `default 'teacher'` from `supabase/fresh-setup.sql` so it matches the migration. The trigger provides the bootstrap value; the column itself should have no default. Resulting line:

```sql
role text not null check (role in ('parent','teacher')),
```

**Verify:**

- In a fresh-setup env, a raw `insert into profiles (id, tenant_id, email) values (...)` fails with a NOT NULL violation (same behavior as a migrated env).
- Signups via the auth trigger still succeed.

## 4. Expose `refreshRole()` on the auth store

**Why this matters.** The auth store refetches `role` on `SIGNED_IN` and `TOKEN_REFRESHED`. It does *not* refetch when the already-signed-in user writes to `profiles.role` — which is exactly what the picker does. Without a refresh helper, the picker will write to the DB and the in-memory store will still show the old value (or `null`) until the next session.

**Do:**

1. In `lib/auth-store.tsx`, add a `refreshRole` callback and expose it on `AuthState`:

   ```ts
   const refreshRole = useCallback(async () => {
     if (!user?.id) return;
     const r = await fetchRole(user.id);
     setRole(r);
   }, [user?.id]);
   ```

   Add `refreshRole: () => Promise<void>` to the `AuthState` type. Add it to the `useMemo` value and deps.

2. In KAN-130's picker submit handler, after a successful DB write:

   ```ts
   await refreshRole();
   router.push('/teacher/onboarding'); // or wherever the wizard lives
   ```

**Verify:**

- Pick a role in the picker → auth store's `role` matches the chosen value before any navigation.
- No hard reload required to see the new role.

## Order of operations

1. Fix #3 (fresh-setup default) — one-line SQL change.
2. Fix #2 (regen types) — runs the script, commits the generated file.
3. Start KAN-130 work.
4. Fix #1 (`role_set_at`) lands as part of KAN-130's migration + picker guard.
5. Fix #4 (`refreshRole`) lands as part of KAN-130's auth store additions.

All four should be in the same PR as KAN-130 — they are prerequisites for the picker to behave correctly.

## Commit message guidance

When you ship KAN-130, include in the commit body:

```
Addresses review feedback on 6ac6d58:
- Add role_set_at to profiles so picker guard checks explicit selection, not role non-nullness
- Regenerate database.types.ts to include role column
- Drop default 'teacher' from fresh-setup.sql to match migration
- Expose refreshRole() on auth store so picker can update in-memory role after DB write
```

Then resume with KAN-131 after KAN-130 merges.
