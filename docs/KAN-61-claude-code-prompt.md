# KAN-61: Remove Phase Layer, Flatten Curriculum Nav, Populate Full Content

## What You're Doing

Three things in sequence:
1. **Schema migration** — Drop the `phase` table and all `phase_id` columns
2. **Route restructure** — Replace `/teacher/phases/[phase]/areas/[area]/modules/[module]` with `/teacher/curriculum/[group]/[module]`
3. **Content population** — Extract all modules from two curriculum PDFs and rewrite the seed script

## Part 1: Schema Migration

### What to drop

Create a migration `supabase/migrations/YYYYMMDDHHMMSS_drop_phase_layer.sql` that:

1. Drops foreign key constraints referencing `phase`:
   - `module_detail_phase_id_fkey` on `content.module_detail`
   - `module_group_phase_id_fkey` on `content.module_group`
   - Same on `public.module_detail` and `public.module_group`
2. Drops `phase_id` column from:
   - `content.module_group`
   - `content.module_detail`
   - `public.module_group`
   - `public.module_detail`
   - `public.lesson_completions`
3. Drops index `lc_student_phase_idx` on `lesson_completions`
4. Drops tables `content.phase` and `public.phase`
5. Drops RLS policies on `phase` tables

### RPC Functions to Rewrite

In the same migration (or a follow-up):

**DELETE these functions:**
- `content_get_phases()`
- `content_get_phase(p_code text)`

**REWRITE this function:**
```sql
-- OLD: content_get_groups(p_phase_code text, p_teaching_mode text DEFAULT NULL)
-- NEW: content_get_groups(p_teaching_mode text DEFAULT NULL)
CREATE OR REPLACE FUNCTION public.content_get_groups(p_teaching_mode text DEFAULT NULL)
RETURNS SETOF json AS $$
  SELECT row_to_json(g) FROM content.module_group g
  WHERE (p_teaching_mode IS NULL OR g.teaching_mode::text = p_teaching_mode)
  ORDER BY g.display_order;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**UPDATE these functions** (just remove phase_id from the returned columns):
- `content_get_modules(p_group_code text)` — keep as-is, remove phase_id from SELECT
- `content_get_module(p_module_code text)` — keep as-is, remove phase_id from SELECT

Also update `supabase/fresh-setup.sql` to match.

## Part 2: Route Restructure

### Delete these files:
- `app/teacher/phases/page.tsx`
- `app/teacher/phases/[phase]/page.tsx`
- `app/teacher/phases/[phase]/areas/[area]/page.tsx`
- `app/teacher/phases/[phase]/areas/[area]/modules/[module]/page.tsx`
- `app/assessments/[phase]/page.tsx`
- `components/PhaseTabs.tsx`

### Create these new routes:

**`app/teacher/curriculum/page.tsx`**
- Lists all lesson groups (from `content_get_groups()` RPC)
- Uses `TeachingModeToggle` to filter Group vs Individual
- Port the group card rendering from `phases/[phase]/page.tsx` — it's good, just remove the phase wrapper
- Logged-out state: show demo/preview data

**`app/teacher/curriculum/[group]/page.tsx`**
- Lists modules within a group (from `content_get_modules(group_code)` RPC)
- Port from `phases/[phase]/areas/[area]/page.tsx`

**`app/teacher/curriculum/[group]/[module]/page.tsx`**
- Lesson detail view
- Port from `phases/[phase]/areas/[area]/modules/[module]/page.tsx`

### Update these files:

**`components/TopNav.tsx`** — change any `/teacher/phases` links to `/teacher/curriculum`

**`components/StartTeachingWizard.tsx`** — remove phase references

**Demo data files** — remove `phase` property:
- `lib/demo/demoCurriculum.ts` — restructure from phase-keyed to flat group list
- `lib/demo/demoStudents.ts` — remove `phase: 'Phase 1'`
- `lib/demo/demoGroups.ts` — remove `phase: 'Phase 1'`
- `lib/demo/demoAssessments.ts` — remove `phase` field

**`lib/startTeaching/useStartTeachingData.ts`** — remove `phase` from student type and queries

**`app/teacher/page.tsx`** — remove `phase` from `CardData` type and student/group mapping

### Grep check
Run `grep -r "phase" --include="*.ts" --include="*.tsx" --include="*.sql"` to find all remaining references after your changes.

## Part 3: Content Population

### Source PDFs

- `docs/curriculum/group.pdf` — 502 pages, Group Instruction (172 modules)
- `docs/curriculum/ind.pdf` — 550 pages, Individual Instruction (156 modules)

### Seed Script Structure

Rewrite `scripts/seed-curriculum.ts` with a flat structure — no phase wrapper:

```typescript
const groups = [
  {
    code: 'K_LS',
    title: 'Learning Sensorially',
    description: 'Sharpen listening skills and auditory discrimination',
    module_count: 11,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 1,
    modules: [
      {
        code: 'LS-1',
        title: 'The Silence Game',
        subtitle: 'LS1',
        summary: 'Sharpen listening skills with intentional silence and sound awareness.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: ['A quiet classroom'],
          aims: ['Sharpen listening skills', 'Develop good attention span', 'Build auditory discrimination'],
          presentation_steps: ['...'],
          examples: ['Clock ticks', 'Voices', '...'],
          extension: ['Play in a different room or outdoors.', '...'],
        },
      },
      // ... LS-2 through LS-11
    ],
  },
  // ... all other groups
];

const individualGroups = [
  {
    code: 'K_IND_LS',
    title: 'Learning Sensorially (Individual)',
    // ...same structure, different module counts
  },
  // ...
];
```

### Module Group Codes

| Group | Group Code | Individual Code |
|-------|-----------|----------------|
| Learning Sensorially | K_LS | K_IND_LS |
| Rhyming | K_RMG | K_IND_RMG |
| Words & Sentences | K_WS | K_IND_WS |
| Syllables | K_SYL | K_IND_SYL |
| Initial Sounds | K_IS | K_IND_IS |
| Final Sounds | K_FS | K_IND_FS |
| Medial Sounds | K_MS | K_IND_MS |
| Combining Sounds | K_CS | K_IND_CS |
| Alphabet | K_AL | K_IND_AL |
| Phonics | K_P | K_IND_P |
| Reading | K_R | K_IND_R |
| Reading Exercises | K_RE | K_IND_RE |
| Handwriting | K_HW | K_IND_HW |
| Spelling | K_S | K_IND_S |
| Spelling Exercises | K_SE | K_IND_SE |
| Vocab/Comp/Fluency | K_VCF | K_IND_VCF |

### Module Counts

**Group (172 total):**
LS: 11, RMG: 19, WS: 9, SYL: 17, IS: 17, FS: 7, MS: 2, CS: 6, AL: 22, P: 7, R: 8, RE: 9, HW: 11, S: 9, SE: 9, VCF: 9

**Individual (156 total):**
LS: 6, RMG: 19, WS: 7, SYL: 15, IS: 14, FS: 6, MS: 2, CS: 4, AL: 22, P: 7, R: 8, RE: 9, HW: 10, S: 9, SE: 9, VCF: 9

### How to Extract Module Data

Each module in the PDF is a table. For every module, extract:

```typescript
{
  code: 'LS-1',              // Exact code from PDF header
  title: 'The Silence Game',  // Title from PDF header
  subtitle: 'LS1',           // Code without dash
  summary: 'derived from Aim field — one sentence',
  is_locked: false,
  teaching_mode: 'group',     // or 'individual'
  display_order: 1,           // Sequential within group
  lesson: {
    materials: ['A quiet classroom'],
    aims: ['Sharpen listening skills', '...'],
    presentation_steps: ['Step 1...', '...'],
    examples: ['word1', 'word2'],
    extension: ['Activity 1...'],
  }
}
```

**Reference**: LS-1 (current seed script lines 42-77) is the gold standard format.

### Module codes — disambiguation

- Group modules: use PDF codes directly (LS-1, RMG-3, AL-22)
- Individual modules: prefix with `IND_` (IND_LS-1, IND_RMG-3, IND_AL-22)

### Seed script upsert logic

The upsert logic simplifies since there's no phase:

```typescript
async function run() {
  const content = supabase.schema('content');

  for (const g of [...groups, ...individualGroups]) {
    const { data: groupRow, error: groupErr } = await content
      .from('module_group')
      .upsert({
        code: g.code,
        title: g.title,
        description: g.description,
        module_count: g.module_count,
        is_locked: g.is_locked,
        teaching_mode: g.teaching_mode,
        display_order: g.display_order,
      }, { onConflict: 'code' })
      .select()
      .single();
    if (groupErr) throw groupErr;

    for (const m of g.modules) {
      const { error: moduleErr } = await content.from('module_detail').upsert({
        code: m.code,
        group_id: groupRow.id,
        title: m.title,
        subtitle: m.subtitle,
        summary: m.summary,
        is_locked: m.is_locked,
        teaching_mode: m.teaching_mode,
        display_order: m.display_order,
        lesson: m.lesson || null,
        metadata: {},
      }, { onConflict: 'code' });
      if (moduleErr) throw moduleErr;
    }
  }
  console.log('Seeded groups and modules');
}
```

### Approach: Two-Phase Extraction

Given the size (~328 modules across 1000+ PDF pages):

**Step A**: Write `scripts/extract-curriculum.ts` (or `.py`) that reads each PDF, finds modules by code pattern, extracts table fields, outputs JSON.

**Step B**: Take the extracted JSON and build the module arrays in the seed script.

## Important Notes

1. **Phonemic Awareness (section 1.5) has 4 sub-groups**: IS, FS, MS, CS. These are 4 separate `module_group` rows.
2. **The existing LS-1 data is correct** — don't overwrite it, use it as reference.
3. **Run `pnpm seed:curriculum` after** to verify.
4. **Skip appendix content** — Pictures, Phonogram Cards, Materials List, Lesson Planning.
5. **If PDF extraction is imperfect**, prioritize correct code/title/teaching_mode/display_order. Lesson JSON can be improved later.

## Execution Order

1. Part 1 first (schema migration) — everything else depends on it
2. Part 2 and Part 3 can happen in parallel after Part 1
3. Final verification: `pnpm seed:curriculum` && `pnpm dev` && manual click-through

## Acceptance Criteria

- [ ] No `phase` table or `phase_id` columns in the database
- [ ] `/teacher/curriculum/` shows all lesson groups with Group/Individual toggle
- [ ] `/teacher/curriculum/[group]` shows modules within a group
- [ ] `/teacher/curriculum/[group]/[module]` shows the lesson detail
- [ ] `/teacher/phases/` returns 404 or redirects
- [ ] `pnpm seed:curriculum` runs without errors
- [ ] 32 groups total (16 group-mode + 16 individual-mode)
- [ ] RMG group (Group mode) has 19 modules: RMG-1 through RMG-19
- [ ] Every module has `lesson` JSON with at minimum `materials` and `aims` arrays
- [ ] Grep for "phase" in .ts/.tsx/.sql files returns zero results (except this doc)
