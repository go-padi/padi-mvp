# CC Prompt — KAN-118: Fix individual curriculum demo data & clean up bad module titles

## Context

The curriculum browser and teacher dashboard both rely on demo fallback data in `lib/demo/demoCurriculum.ts` when there's no live Supabase data. The individual mode is broken because only 2 of 16 individual groups exist in the fallback. Additionally, `ind-rhyming-6` has a garbage title/summary in both the seed data and Supabase — the entire book list was dumped into those fields.

Two files need changes:
1. `lib/demo/demoCurriculum.ts` — add 14 missing individual groups + their modules
2. `scripts/seed-curriculum.ts` — fix ind-rhyming-6 title/summary

## What to do

### Step 1: Fix ind-rhyming-6 in seed-curriculum.ts

Find the module with `code: 'ind-rhyming-6'` (around line 4736). Its title and summary currently contain a massive book list. Replace them:

```typescript
// BEFORE (broken):
code: 'ind-rhyming-6',
title: 'Books with Rhymes (RMG-6) One ish, two ish, red ish, blue ish by Dr. Seuss Fox in socks...',  // ~500 chars
subtitle: 'ind-rhyming-6',
summary: 'Practice and develop skills through Books with Rhymes (RMG-6) One ish, two ish...',  // ~500 chars

// AFTER (fixed):
code: 'ind-rhyming-6',
title: 'Books with Rhymes',
subtitle: 'ind-rhyming-6',
summary: 'Read aloud books with rhyming patterns to build phonological awareness.',
```

Also fix the `aims` array in the same module's `lesson` object — replace the book-list aim with:
```typescript
aims: [
  'Develop phonological awareness through exposure to rhyming books.',
],
```

Leave the `materials` and `presentation_steps` as they are (they're fine).

### Step 2: Add 14 missing individual groups to previewGroups

In `lib/demo/demoCurriculum.ts`, find the `previewGroups` array (line 71). It currently ends at line 90 with only 2 individual groups (`ind-learning-sensorially` and `ind-rhyming`). Add the following 14 entries after `ind-rhyming` (before the closing `];`):

```typescript
  { id: 'fallback-ind-ws', code: 'ind-words-and-sentences', title: 'Words & Sentences (Individual)', description: 'Build word and sentence awareness', module_count: 7, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-syl', code: 'ind-syllables', title: 'Syllables (Individual)', description: 'Clap, segment, and blend syllables', module_count: 15, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-is', code: 'ind-initial-sounds', title: 'Initial Sounds (Individual)', description: 'Identify and manipulate initial sounds in words', module_count: 14, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-fs', code: 'ind-final-sounds', title: 'Final Sounds (Individual)', description: 'Identify and manipulate final sounds in words', module_count: 6, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-ms', code: 'ind-medial-sounds', title: 'Medial Sounds (Individual)', description: 'Identify and manipulate medial sounds in words', module_count: 2, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-cs', code: 'ind-combining-sounds', title: 'Combining Sounds (Individual)', description: 'Blend and segment sounds to form words', module_count: 4, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-al', code: 'ind-alphabet', title: 'Alphabet (Individual)', description: 'Learn letter names, sounds, and formation', module_count: 22, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-p', code: 'ind-phonics', title: 'Phonics (Individual)', description: 'Connect letters to sounds for reading and spelling', module_count: 7, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-r', code: 'ind-reading', title: 'Reading (Individual)', description: 'Develop decoding and reading skills', module_count: 8, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-re', code: 'ind-reading-exercises', title: 'Reading Exercises (Individual)', description: 'Practice reading with guided exercises', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-hw', code: 'ind-handwriting', title: 'Handwriting (Individual)', description: 'Develop proper letter formation and handwriting skills', module_count: 10, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-s', code: 'ind-spelling', title: 'Spelling (Individual)', description: 'Learn spelling patterns and rules', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-se', code: 'ind-spelling-exercises', title: 'Spelling Exercises (Individual)', description: 'Practice spelling with guided exercises', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-vcf', code: 'ind-vocab-comprehension-fluency', title: 'Vocab/Comprehension/Fluency (Individual)', description: 'Build vocabulary, comprehension, and reading fluency', module_count: 9, is_locked: false, teaching_mode: 'individual' },
```

### Step 3: Update previewGroupsByChapter individual entries

The `previewGroupsByChapter` mappings (lines 100-106) already reference these codes but filter from `previewGroups` — so once the groups are added in Step 2, the filters will start matching automatically. However, the `ind-phonological-awareness` entry (line 100) currently only includes `ind-learning-sensorially` and `ind-rhyming`. Update it to include ALL 8 individual phonological awareness groups:

```typescript
'ind-phonological-awareness': previewGroups.filter(g => g.teaching_mode === 'individual' && ['ind-learning-sensorially', 'ind-rhyming', 'ind-words-and-sentences', 'ind-syllables', 'ind-initial-sounds', 'ind-final-sounds', 'ind-medial-sounds', 'ind-combining-sounds'].includes(g.code)),
```

### Step 4: Add module entries for each new individual group in previewModulesByGroup

Add a representative first module for each of the 14 new groups. This ensures the accordion shows at least one row per group in demo mode. Add these entries to the `previewModulesByGroup` object (after the existing `ind-rhyming` entry):

```typescript
'ind-words-and-sentences': [
  { id: 'fallback-ind-ws-1', code: 'ind-words-and-sentences-1', title: 'Long and Short Words', subtitle: 'ind-words-and-sentences-1', summary: 'Recognize long/short words auditorily.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-syllables': [
  { id: 'fallback-ind-syl-1', code: 'ind-syllables-1', title: 'Clapping Syllables', subtitle: 'ind-syllables-1', summary: 'Clap and count syllables in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-initial-sounds': [
  { id: 'fallback-ind-is-1', code: 'ind-initial-sounds-1', title: 'What Sound Does It Start With?', subtitle: 'ind-initial-sounds-1', summary: 'Identify and isolate initial sounds in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-final-sounds': [
  { id: 'fallback-ind-fs-1', code: 'ind-final-sounds-1', title: 'Ending Sound Match', subtitle: 'ind-final-sounds-1', summary: 'Identify and isolate final sounds in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-medial-sounds': [
  { id: 'fallback-ind-ms-1', code: 'ind-medial-sounds-1', title: 'Middle Sound Detective', subtitle: 'ind-medial-sounds-1', summary: 'Identify medial vowel sounds in CVC words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-combining-sounds': [
  { id: 'fallback-ind-cs-1', code: 'ind-combining-sounds-1', title: 'Blend It Together', subtitle: 'ind-combining-sounds-1', summary: 'Blend individual sounds to form words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-alphabet': [
  { id: 'fallback-ind-al-1', code: 'ind-alphabet-1', title: 'Letter Names A-E', subtitle: 'ind-alphabet-1', summary: 'Learn letter names and recognition for A through E.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-phonics': [
  { id: 'fallback-ind-p-1', code: 'ind-phonics-1', title: 'Letter Sounds: m, t, a, s', subtitle: 'ind-phonics-1', summary: 'Connect letters to their sounds.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-reading': [
  { id: 'fallback-ind-r-1', code: 'ind-reading-1', title: 'Decoding CVC Words', subtitle: 'ind-reading-1', summary: 'Apply phonics skills to decode simple CVC words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-reading-exercises': [
  { id: 'fallback-ind-re-1', code: 'ind-reading-exercises-1', title: 'Reading Exercise 1', subtitle: 'ind-reading-exercises-1', summary: 'Guided reading practice.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-handwriting': [
  { id: 'fallback-ind-hw-1', code: 'ind-handwriting-1', title: 'Pencil Grip and Posture', subtitle: 'ind-handwriting-1', summary: 'Develop proper pencil grip and writing posture.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-spelling': [
  { id: 'fallback-ind-s-1', code: 'ind-spelling-1', title: 'Spelling CVC Words', subtitle: 'ind-spelling-1', summary: 'Encode simple CVC words using sound-letter knowledge.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-spelling-exercises': [
  { id: 'fallback-ind-se-1', code: 'ind-spelling-exercises-1', title: 'Spelling Exercise 1', subtitle: 'ind-spelling-exercises-1', summary: 'Guided spelling practice.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
'ind-vocab-comprehension-fluency': [
  { id: 'fallback-ind-vcf-1', code: 'ind-vocab-comprehension-fluency-1', title: 'Building Vocabulary', subtitle: 'ind-vocab-comprehension-fluency-1', summary: 'Build vocabulary through read-alouds and discussion.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
],
```

### Step 5: Fix ind-rhyming-6 in the Supabase database

After making the code changes, run this SQL to fix the live data too:

```sql
UPDATE modules
SET
  title = 'Books with Rhymes',
  summary = 'Read aloud books with rhyming patterns to build phonological awareness.'
WHERE code = 'ind-rhyming-6';
```

This can be run via the Supabase dashboard or `supabase` CLI.

## Do NOT change

- Any files other than `lib/demo/demoCurriculum.ts` and `scripts/seed-curriculum.ts`
- The group teaching_mode values or chapter structure
- Any existing group or module entries (only ADD new ones and fix ind-rhyming-6)
- Auth, routing, or DB schema

## Expected result after fix

### Individual mode (logged out — demo fallback)
- **Phonological Awareness**: 8 groups (Learning Sensorially, Rhyming, Words & Sentences, Syllables, Initial Sounds, Final Sounds, Medial Sounds, Combining Sounds)
- **Alphabet**: 1 group (22 modules)
- **Phonics**: 1 group (7 modules)
- **Reading**: 2 groups (Reading + Reading Exercises)
- **Handwriting**: 1 group (10 modules)
- **Spelling**: 2 groups (Spelling + Spelling Exercises)
- **Vocab/Comprehension/Fluency**: 1 group (9 modules)

### Individual mode (logged in — Supabase)
- Same structure, plus ind-rhyming-6 should show "Books with Rhymes" instead of a massive book list

### Group mode
- No changes — already complete

## Acceptance criteria

1. Toggle to "Individual" on `/teacher/curriculum` — all 7 chapters appear with correct group counts
2. Expand "Phonological Awareness" — all 8 groups visible with at least 1 module each
3. ind-rhyming-6 shows clean title "Books with Rhymes" (not the book list)
4. Toggle to "Both" — group and individual sections both render correctly
5. Toggle to "Group" — no change from current behavior
6. No TypeScript errors
7. Existing group curriculum still works exactly as before
