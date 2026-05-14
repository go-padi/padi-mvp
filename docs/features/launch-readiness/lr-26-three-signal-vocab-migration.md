---
id: LR-26
title: "[Copy + Data] Migrate 3-signal vocabulary: Ready/Needs Help/Needs Intervention → Accelerating/Practicing/Specialist Track"
type: story
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-13
updated: 2026-05-13
created_by: founder-direction-2026-05-13
related: LR-25, LR-27, LR-18, LR-24
might_require_migration: false
schema_check: "Confirmed 2026-05-13: students.assessment_status has no CHECK constraint in supabase/schema.sql — no DB migration needed. Pure TypeScript + component edits."
---

### Goal

go-padi.com retired the clinical 3-signal vocabulary in favor of
affirmative, forward-looking labels. The app uses the OLD vocabulary
in code (canonical types), in UI copy, in demo data, and possibly in
the database. This ticket migrates the entire app.

**Vocabulary mapping:**

| Old | New | New subtitle |
|---|---|---|
| `Ready` | `Accelerating` | On track to read sooner |
| `Needs Help` | `Practicing` | Locking in foundational skills |
| `Needs Intervention` | `Specialist Track` | Recommended for closer review |

Tagline: `A clear signal for every student, every lesson.`

### Background

Founder updated go-padi.com on 2026-05-13. Fetched the live site and
captured the new vocabulary. App now drifts from marketing copy on a
core positioning element.

The old vocabulary appears in:

**Code (canonical):**
- `lib/copy/assessmentStatusCopy.ts` — type union, status copy maps, short labels
- `lib/demo/demoStudents.ts` — demo student assignments
- `app/teacher/page.tsx` — card.status conditional, body copy
- `app/teacher/about/page.tsx` — explanation of the 3 signals
- `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` — color logic
- `app/teacher/start-teaching/students/[studentId]/page.tsx` — switch case
- `app/page.tsx` — homepage subtitle (LR-25 handles this surface)

**Database (confirmed 2026-05-13):** `students.assessment_status` is a free-text column — NO CHECK constraint in `supabase/schema.sql`. **No database migration needed.** Existing rows can be backfilled with an optional `UPDATE` if desired (see Requirements step 5), but it's not blocking.

**Docs (agent-facing, lower priority — update for consistency but doesn't block users):**
- `.buildloop/product-brief.md` lines 45, 89
- `docs/features/assessments-grouping/` audit (historical — leave as is, it describes the journey)
- LR-18 + LR-24 ticket bodies (the authored card copy uses OLD vocab — update separately)
- The padi-design north-star skill SKILL.md (outside this repo — separate post-launch update)

### Requirements

1. **Check `supabase/schema.sql` for the `assessment_status` column constraint.** If it locks to old enum values, plan a migration. If it's a free-text column, no migration needed.

2. **Update `lib/copy/assessmentStatusCopy.ts`:**
   - Type union: `"Accelerating" | "Practicing" | "Specialist Track"` (preserve the order: green/yellow/red)
   - `STATUS_COPY` map: update label, description, color hints
   - `STATUS_SHORT` map: update short labels
   - Update the `parseStatus()` function to handle BOTH old and new strings for backward compatibility (read-side robustness in case any stale data lingers — write-side always uses new)

3. **Update all call sites** to use new strings (per the inventory above):
   - `app/teacher/page.tsx` (card.status conditional + body copy paragraph)
   - `app/teacher/about/page.tsx` (3-signal explanation)
   - `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` (color logic)
   - `app/teacher/start-teaching/students/[studentId]/page.tsx` (switch case)

4. **Update demo data:**
   - `lib/demo/demoStudents.ts` — change any `'Needs Help'` / `'Needs Intervention'` / `'Ready'` to new vocab

5. **Database migration (if needed):**
   - Add `'Accelerating'`, `'Practicing'`, `'Specialist Track'` to whatever constraint exists
   - Backfill existing rows: `UPDATE students SET assessment_status = CASE assessment_status WHEN 'Ready' THEN 'Accelerating' WHEN 'Needs Help' THEN 'Practicing' WHEN 'Needs Intervention' THEN 'Specialist Track' ELSE assessment_status END;`
   - Then drop the old values from the constraint (separate migration step)
   - **BuildLoop will pause on migration per the brief.** Founder runs the migration manually, then resumes.

6. **Tone-shift the copy that ACCOMPANIES the labels.** The old vocab was about deficit ("needs"); the new is about progress. Audit any sentence that previously used the labels:
   - "Padi tells you if your child is Ready, Needs Help, or Needs Intervention" → "Padi shows you whether your child is Accelerating, Practicing, or on the Specialist Track."
   - Avoid clinical framings like "diagnostic," "intervention required," "behind." Use "moving faster," "locking in foundational skills," "recommended for closer review."

7. **Update LR-18 and LR-24 ticket bodies** (the authored chapter card copy uses OLD vocab). This is a doc-only edit; not part of LR-26 build but worth doing as part of the ticket-cleanup pass.

### Acceptance Criteria

**Happy Path**
Given the migration ships
When any surface in the app renders a 3-signal status
Then it uses the new vocab (Accelerating / Practicing / Specialist Track)
And no surface displays "Needs Help" or "Needs Intervention"

**Database integrity**
Given any existing student record had `assessment_status: 'Needs Help'` before this ticket
When this ticket ships
Then that record now reads `'Practicing'`
And the constraint accepts only the 3 new values

**Backward read-compat**
Given some piece of code or test fixture still references the old strings
When `parseStatus()` is called on an old string
Then it returns the new equivalent (not null, not error)
And a console.warn fires noting the legacy value
(This is defensive — should not be exercised in practice, but prevents runtime errors during the migration window)

**Demo data**
Given a logged-out preview surface
When demo students render
Then their statuses use the new vocab

**Mobile**
375×667 — new labels fit in any UI pill or badge ("Specialist Track" is the longest at 16 characters; verify pill width)

### Out of Scope

- Restructuring the 3-signal data model (still a single enum-ish column)
- Adding new signals beyond the 3 (e.g. "Mastered," "New," etc.)
- Building a UI to MANUALLY set the status (still set by the existing flow)
- Translating the new vocab to other languages
- Updating `.buildloop/product-brief.md` (separate small task)
- Updating the padi-design north-star skill (lives outside this repo — separate)

### Notes

- This is the foundational vocab change. **LR-25 (homepage rewrite #2) depends on this** — the homepage pills section uses the new strings. Ship LR-26 first, OR ship them together.
- Database migration question is the biggest unknown. Founder should spot-check `supabase/schema.sql` for the `assessment_status` constraint before BuildLoop picks this up. If it's enum-constrained, this becomes a 2-iteration ticket (one to add new values + backfill, one to drop old values once everything is migrated).
- The new vocab is LONGER ("Specialist Track" = 16 chars vs "Ready" = 5 chars). Verify pill/badge widths don't break.
- Watch for hardcoded color logic that may use a label-string switch — `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:75-76` is one. The color mapping must update along with the labels.
- **Why this matters beyond copy:** the old vocab made Padi sound clinical ("intervention," "needs"). The new vocab makes it sound like a coach ("Accelerating," "Practicing"). This affects how parents emotionally relate to seeing the signal — the SAME data, framed as progress vs. deficit.
- Complexity: M (TypeScript types + ~6 component edits + demo data + possible DB migration).
