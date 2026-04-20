# CC Prompt — KAN-79: Fix inconsistent group card routing

## Context

Two routing bugs on the teacher dashboard (`app/teacher/page.tsx`). Both involve group cards linking to wrong or nonexistent pages. This is a trust-breaker for a teacher with low tech confidence — clicking a card and landing on the wrong page feels like "I did something wrong."

**ICP**: A teacher who may not know how to navigate back. Every link must go somewhere real and useful.

## Key file

`app/teacher/page.tsx` — this is the ONLY file to modify.

## Bug 1: Demo preview group cards have broken href (line 211)

### Current (broken):

```tsx
<Link key={group.id} href={`/start-teaching/groups/${group.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
```

The route `/start-teaching/groups/${group.id}` is missing the `/teacher` prefix **and** the route doesn't exist at all. There is no `app/teacher/start-teaching/groups/[groupId]/page.tsx`.

### Fix:

Link demo group preview cards to the curriculum browser instead, matching the pattern used for logged-in group cards. Demo mode is read-only, so curriculum browsing is the appropriate destination:

```tsx
<Link key={group.id} href="/teacher/curriculum" className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
```

## Bug 2: Logged-in group cards link to generic curriculum (line 310-313)

### Current (broken):

```tsx
const cardHref =
  card.type === 'student'
    ? `/teacher/start-teaching/students/${card.id}`
    : `/teacher/curriculum`;
```

When a teacher clicks a specific group card (e.g., "Group A — Learning Sensorially"), they land on the full curriculum index. There's no indication of which group they clicked, and no filtering. The teacher thinks "where did my group go?"

### Fix:

There is no group-specific page yet, but we can do better than the generic curriculum index. The group's `focus` field maps to a curriculum chapter topic. However, since we don't have a reliable mapping from group ID → chapter code, the safest improvement is to keep the curriculum link but **add context via a query parameter** that a future iteration can use:

```tsx
const cardHref =
  card.type === 'student'
    ? `/teacher/start-teaching/students/${card.id}`
    : `/teacher/curriculum?group=${card.id}`;
```

Then on the curriculum page, **show a banner** when the `group` query param is present so the teacher knows they're browsing for a specific group:

**In `app/teacher/curriculum/page.tsx`**, add awareness of the group param.

Actually — this is getting complex for a bug fix. Let's keep it simpler. The real fix is just to make the link not be broken. Since groups don't have a dedicated page, link to `/teacher/curriculum` (which is what it already does), but add a visual cue on the card itself that explains what will happen:

### Simpler fix — keep the href, add clarity to the card:

Replace lines 310-313:

```tsx
const cardHref =
  card.type === 'student'
    ? `/teacher/start-teaching/students/${card.id}`
    : `/teacher/curriculum`;
```

With:

```tsx
const cardHref =
  card.type === 'student'
    ? `/teacher/start-teaching/students/${card.id}`
    : '/teacher/curriculum';
```

No href change needed — it's already `/teacher/curriculum`. The real problem is **expectation mismatch**: the card looks clickable like a student card but goes to a generic page.

Add a subtle label inside the group card to set expectations. Find the card rendering block (inside the `cards.map` at line 295). After the CTA label section, add a group-specific hint.

Find this block (around line 340-345):

```tsx
<p className="text-xs text-gray-600">
  {card.focus}
```

After the card's CTA button area (around line 355-365), find the existing CTA rendering. For group cards, change the CTA label to be more descriptive:

Replace the `ctaLabel` logic (lines 303-307):

```tsx
const ctaLabel = allComplete
  ? 'View Progress'
  : noneStarted
    ? 'Start Teaching'
    : 'Continue Teaching';
```

With:

```tsx
const ctaLabel = card.type === 'group'
  ? 'Browse Lessons'
  : allComplete
    ? 'View Progress'
    : noneStarted
      ? 'Start Teaching'
      : 'Continue Teaching';
```

This makes group cards say "Browse Lessons" instead of "Start Teaching" — which honestly describes what clicking the card does (takes you to the curriculum browser). It sets the right expectation.

## Summary of changes

| Location | Before | After |
|---|---|---|
| Line 211 (demo group href) | `/start-teaching/groups/${group.id}` (404) | `/teacher/curriculum` |
| Lines 303-307 (group card CTA) | "Start Teaching" / "Continue Teaching" | "Browse Lessons" (for group cards only) |

## Do NOT change

- Student card routing (already correct)
- The `cards` useMemo or card data construction
- Auth, routing structure, or DB schema
- Any other files
- The curriculum page itself

## Acceptance criteria to verify

1. Demo mode: clicking a group preview card navigates to `/teacher/curriculum` (not a 404)
2. Logged-in: clicking a group card navigates to `/teacher/curriculum` (unchanged, but was already working)
3. Group cards show "Browse Lessons" as their CTA instead of "Start Teaching"
4. Student cards are completely unchanged (still link to `/teacher/start-teaching/students/{id}`)
5. No console errors on any card click
