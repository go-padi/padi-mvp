---
id: KAN-64
title: "[UX] Show group membership on the student profile (start-teaching/students/[id])"
type: task
status: backlog
priority: medium
feature: start-teaching-flow
launch_blocker: false
jira_ref: https://go-padi.atlassian.net/browse/KAN-64
updated: 2026-05-18
authored_acs_by: cc-author-pass-2026-05-18
might_require_migration: false
related: KAN-56 (Add buttons), LR-11a (next-up CTA shipped), LR-21c (Teach buttons shipped)
---

### Goal

When viewing a student's profile at
`/teacher/start-teaching/students/[studentId]`, show which **group**
(if any) the student is currently a member of. Today the profile
shows name, progress, current module, and 3-signal status — but
not group membership. A teacher who just added Maya to "Group A"
has no visual confirmation of that on Maya's profile.

### Background

The Supabase schema has a `student_group_memberships` table joining
students to groups (with an `active` boolean flag). The grouping
page (`/teacher/grouping`) already queries it. The student profile
page does NOT — it loads student, modules, completion data but not
membership.

This is a small data fetch + render. Pure UI / data-derivation;
no schema changes, no auth changes.

### Requirements

1. **Fetch active memberships** for the current student. In
   `app/teacher/start-teaching/students/[studentId]/page.tsx`,
   extend the existing student-data effect (around the
   `tenantId && studentId` block) with a query:

   ```ts
   const { data: membershipRows } = await sb
     .from('student_group_memberships')
     .select('group_id')
     .eq('tenant_id', tenantId)
     .eq('student_id', studentId)
     .eq('active', true);
   ```

   Then resolve the group names via a join or a follow-up fetch
   (whichever fits the existing pattern — `useGroupingProgressData`
   maps `group_id` to `group.name` via a separate `groups` fetch;
   reuse the same pattern).

2. **Render membership badge(s)** at the top of the student profile,
   near the existing name + status pill. Format:

   ```tsx
   {memberships.length > 0 && (
     <div className="flex flex-wrap gap-2">
       {memberships.map(m => (
         <span key={m.group_id} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
           Group: {m.group_name}
         </span>
       ))}
     </div>
   )}
   ```

   Positioning: right below the existing name heading, above the
   3-signal status pill / progress label. Use the existing
   `rounded-2xl card bg-white` container that holds the profile
   header.

3. **Hide when no memberships.** Don't render an empty "No group"
   placeholder by default. Students often genuinely don't belong to
   a group (individual track) — silence is fine.

4. **Multiple groups handling.** A student CAN be in multiple
   active memberships per schema (the `active` flag doesn't enforce
   uniqueness). Render all of them as separate badges.

5. **Loading state.** While the membership query is in flight, hide
   the badge area. Don't show a flicker of "Group: ..." then
   nothing. Use a state initialized to `null` (loading) → `[]`
   (resolved, no memberships) → `[{...}, ...]` (resolved with
   memberships).

6. **DO NOT touch:**
   - The `student_group_memberships` schema or RLS
   - LR-11a "Next up" CTA
   - LR-26b signal picker on the lesson page (different surface)
   - The `useGroupingProgressData` hook (only consume the same
     query pattern, don't refactor that hook)
   - Auth-store

### Acceptance Criteria

**Happy path — student is in a group**
- Given Maya is an active member of "Group A" (one row in
  `student_group_memberships` with `active: true`)
- When the teacher loads `/teacher/start-teaching/students/<maya-id>`
- Then a blue badge `Group: Group A` renders near the top of the
  profile
- And it sits below the student name + above the progress label

**Happy path — multiple groups**
- Given Maya has two active memberships
- When the profile renders
- Then both group badges render in order, separated by `gap-2`
- And they wrap to a new line on narrow viewports if needed

**Empty state — no group**
- Given a student with zero active memberships
- When the profile renders
- Then NO badge row renders (no "Not in a group" placeholder)
- And the rest of the profile renders identically to today

**Loading state**
- Before the membership query resolves, the badge area is hidden
  (no flash of empty content)

**Error state**
- Given the membership query fails (RLS denial, network error)
- When the profile renders
- Then the rest of the profile renders fine
- And the badge area is hidden (treat as no-memberships fallback)
- And `console.error` logs the error for diagnostics

**Auth state**
- Given a logged-out user lands on the profile URL directly
- Then existing logged-out gating handles them (no change)
- And the membership query never fires (gated by the existing
  `isLoggedIn` early-return in the effect)

**Mobile (375 × 667)**
- Badge wraps cleanly inside the profile header
- Multiple badges wrap to multiple lines if combined width exceeds
  viewport
- No horizontal scroll

**No regression**
- LR-11a "Next up" CTA still renders at the top of the profile
- LR-21c "Teach {firstName}" buttons on `/students` cards still
  work (different surface)
- Existing student name, status pill, progress label, chapter list
  all render unchanged
- LR-10a completion history on lesson pages unchanged

**Lint + typecheck**
- `pnpm lint` exit 0
- `pnpm tsc --noEmit` exit 0
- `pnpm build` exit 0

**No new console errors**

### Out of Scope

- Editing group membership from this surface (add/remove). Group
  assignment lives in `/teacher/grouping` (KAN-56 context).
- Showing INACTIVE memberships (the `active: false` rows). Out of
  scope — only active memberships render.
- A "members of <this student's group>" sub-list on the profile
- Clicking a group badge to navigate to the group's detail page
  (could be a follow-up — out of scope here)
- Schema changes
- Tests beyond build/lint/tsc

### Notes

- **Single file:** `app/teacher/start-teaching/students/[studentId]/page.tsx`
- **One additional Supabase query**, gated on the existing auth
  context. Reuses the existing `supabaseClient` instance.
- **Complexity S** — ~25 lines: new state, query, render block.
- **Group-name resolution:** the simplest path is a separate `sb
  .from('groups').select('id,name').in('id', groupIds)` after the
  membership query resolves. Or use a single nested query if
  Supabase + RLS allow. Build phase picks whichever is cleaner.
- Original Jira: https://go-padi.atlassian.net/browse/KAN-64
