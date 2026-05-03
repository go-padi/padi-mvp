---
id: KAN-62
title: "Replace module_assessments with richer module_assessment table + audio storage bucket"
type: story
status: done
priority: medium
feature: ml-readiness-classifier
epic: KAN-60
jira_ref: https://go-padi.atlassian.net/browse/KAN-62
created: 2026-03-06
updated: 2026-04-14
---

# KAN-62 — Replace module_assessments with richer module_assessment table + audio storage bucket

## Description

## Goal

Replace the existing lightweight `module_assessments` table with the full ML-ready `module_assessment` table that supports audio recordings, teacher notes, ML predictions, and teacher feedback. Also create the Supabase Storage bucket for audio recordings. All existing app code that reads/writes `module_assessments` must be updated to use the new table.

## Background

The current `module_assessments` table (from KAN-18/KAN-24) is minimal:

```sql
create table module_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id),
  module_id text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, student_id, subject_id, module_id)
);
```

It tracks completion (module_id + notes string). The readiness classifier needs a richer schema with audio, ML predictions, and teacher feedback. Rather than having two tables, we replace the existing one.

### Files that currently reference `module_assessments` (must be updated):

1. `app/teacher/start-teaching/students/[studentId]/page.tsx`

    * Line 88: `sb.from('module_assessments').select('module_id')` (fetchCompletions)
    * Line 249: `sb.from('module_assessments').upsert(...)` (handleMarkDone)
    
2. `lib/startTeaching/useStartTeachingData.ts`

    * Line 47: `sb.from('module_assessments').select('student_id,module_id')` (per-student completion counts)
    
3. `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`

    * Line 121: `sb.from('module_assessments').select('student_id').eq('module_id', module)` (check if student completed this module)
    

### Schema files to update:

4. `supabase/fresh-setup.sql` — lines 291-308: table definition, indexes, trigger
5. `supabase/fresh-setup.sql` — line 347: RLS enable, line 370: RLS policy
6. `supabase/rls/teacher_workspace_v1.sql` — lines 13, 95: RLS policy
7. `supabase/schema.sql` — if module_assessments is defined there
8. `supabase/migrations/20260112120000_teacher_workspace_v1.sql` — leave as-is, add new migration

## Requirements

### 1. New migration: Replace module_assessments with module_assessment

Create a new migration file that drops the old table and creates the new one:

```sql
DROP TABLE IF EXISTS public.module_assessments CASCADE;

CREATE TABLE public.module_assessment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  module_id TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  audio_url TEXT,
  audio_duration_sec FLOAT,
  audio_format TEXT,
  notes_source TEXT DEFAULT 'typed',
  notes_photo_url TEXT,
  model_prediction TEXT,
  model_confidence FLOAT,
  model_version TEXT,
  model_reasoning TEXT,
  readiness_label TEXT,
  labeled_by UUID REFERENCES public.profiles(id),
  labeled_at TIMESTAMPTZ,
  teacher_agrees BOOLEAN,
  teacher_correction TEXT,
  feedback_at TIMESTAMPTZ,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, student_id, subject_id, module_id)
);

CREATE INDEX idx_assessment_tenant ON public.module_assessment(tenant_id);
CREATE INDEX idx_assessment_student ON public.module_assessment(student_id, created_at DESC);
CREATE INDEX idx_assessment_module ON public.module_assessment(tenant_id, student_id, subject_id, module_id);
CREATE INDEX idx_assessment_label ON public.module_assessment(readiness_label) WHERE readiness_label IS NOT NULL;

ALTER TABLE public.module_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "module assessment tenant access" ON public.module_assessment
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP TRIGGER IF EXISTS module_assessment_set_updated_at ON public.module_assessment;
CREATE TRIGGER module_assessment_set_updated_at
  BEFORE UPDATE ON public.module_assessment
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.module_assessment
  ADD CONSTRAINT valid_readiness_label
  CHECK (readiness_label IS NULL OR readiness_label IN ('ready', 'intervention', 'sis_therapy'));

ALTER TABLE public.module_assessment
  ADD CONSTRAINT valid_notes_source
  CHECK (notes_source IS NULL OR notes_source IN ('typed', 'ocr', 'photo'));
```

### 2. Update fresh-setup.sql

Replace the `module_assessments` block (lines 290-308) with the new `module_assessment` table definition. Update RLS references (lines 347, 370).

### 3. Update schema.sql

Replace `module_assessments` with `module_assessment` definition.

### 4. Update RLS file

Update `supabase/rls/teacher_workspace_v1.sql` references from `module_assessments` to `module_assessment`.

### 5. Create Supabase Storage bucket

* Bucket name: `audio-recordings`
* Access: authenticated users only, tenant-scoped
* Allowed MIME types: `audio/wav`, `audio/mp4`, `audio/mpeg`, `audio/webm`, `audio/x-m4a`
* Max file size: 50MB
* File path convention: `{tenant_id}/{student_id}/{module_id}/{timestamp}.{ext}`

### 6. Update app code (4 files)

All references to `.from('module_assessments')` become `.from('module_assessment')`:

* `app/teacher/start-teaching/students/[studentId]/page.tsx` lines 88 and 249
* `lib/startTeaching/useStartTeachingData.ts` line 47
* `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` line 121

## Claude Code Prompt

```
Read the following files to understand the current state:
- supabase/fresh-setup.sql (lines 288-372 for module_assessments table, indexes, trigger, RLS)
- supabase/schema.sql (search for module_assessments)
- supabase/rls/teacher_workspace_v1.sql (lines 13, 93-98 for module_assessments RLS)
- supabase/migrations/20260112120000_teacher_workspace_v1.sql (lines 155-177 for original migration)
- app/teacher/start-teaching/students/[studentId]/page.tsx (lines 85-90 fetchCompletions, lines 245-255 handleMarkDone)
- lib/startTeaching/useStartTeachingData.ts (line 47)
- app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx (line 121)

Then execute these changes:

### Part 1: New migration file

Create supabase/migrations/20260330120000_replace_module_assessments.sql with:

1. DROP TABLE IF EXISTS public.module_assessments CASCADE;
2. CREATE TABLE public.module_assessment with all columns (see Requirements section 1 above)
3. Indexes, RLS, trigger, CHECK constraints

### Part 2: Update fresh-setup.sql

1. Replace the module_assessments table definition (lines ~291-308) with the new module_assessment table
2. Replace index names: ma_tenant_id_idx -> idx_assessment_tenant, ma_student_module_idx -> idx_assessment_module, plus add idx_assessment_student and idx_assessment_label
3. Replace trigger name: module_assessments_set_updated_at -> module_assessment_set_updated_at
4. Update RLS enable (line ~347): module_assessments -> module_assessment
5. Update RLS policy (line ~370): module_assessments -> module_assessment, update policy name

### Part 3: Update schema.sql

Replace module_assessments with module_assessment (same as fresh-setup table definition).

### Part 4: Update RLS file

In supabase/rls/teacher_workspace_v1.sql:
- Line 13: module_assessments -> module_assessment
- Lines 93-98: update policy to reference module_assessment

### Part 5: Update app code (find and replace table name)

In these 4 files, replace every occurrence of the string 'module_assessments' with 'module_assessment':

1. app/teacher/start-teaching/students/[studentId]/page.tsx (2 occurrences)
2. lib/startTeaching/useStartTeachingData.ts (1 occurrence)
3. app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx (1 occurrence)

The upsert fields stay the same — the existing columns (tenant_id, student_id, subject_id, module_id, notes) all exist on the new table. The new columns are all nullable so no code changes needed beyond the table name.

### Part 6: Storage bucket

Create a SQL migration or Supabase dashboard setup for the audio-recordings bucket:
- If using SQL in the migration, add:
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('audio-recordings', 'audio-recordings', false, 52428800, ARRAY['audio/wav', 'audio/mp4', 'audio/mpeg', 'audio/webm', 'audio/x-m4a']);

  -- Storage RLS: tenant-scoped access
  CREATE POLICY "audio tenant access" ON storage.objects
    FOR ALL USING (
      bucket_id = 'audio-recordings'
      AND (storage.foldername(name))[1] IN (
        SELECT tenant_id::text FROM public.profiles WHERE id = auth.uid()
      )
    );

Run `pnpm lint` and `pnpm build` to verify no errors.

Do NOT change:
- The original migration file (20260112120000_teacher_workspace_v1.sql)
- The upsert logic in handleMarkDone (just the table name)
- The fetchCompletions query structure (just the table name)
- Any curriculum or chapter routing
```

## Acceptance Criteria

* Given I run the new migration, when I query the database, then `module_assessments` no longer exists and `module_assessment` exists with all new columns
* Given I am a logged-in teacher, when I mark a module done on the student page, then a row is inserted into `module_assessment`
* Given I mark a module done, when I return to the student page, then the module still shows as completed
* Given I view the Start Teaching landing page, when student cards load, then progress counts are correct
* Given I view a lesson page with `?student=` param, when the page loads, then the completion check reads from the new table
* Given the `audio-recordings` bucket exists, when I upload an audio file, then the file is accessible via a signed URL
* Given I try to insert a `readiness_label` of `'invalid_value'`, then it fails with a CHECK constraint violation
* Given I am a teacher in Tenant A, when I query `module_assessment`, then I only see rows belonging to Tenant A
* Given `pnpm lint` and `pnpm build` run, then both pass with no errors

## Out of Scope

* Recording UI in the app (separate ticket)
* Classifier service endpoint (separate ticket)
* Teacher confirmation/feedback UI (separate ticket)
* OCR processing for handwritten notes (later)
* Data migration from old table (no production data exists yet)

## Notes

* New columns (audio_url, model_prediction, readiness_label, teacher_agrees, etc.) are all nullable — existing completion flow keeps working unchanged, just writing to the new table name
* `module_id` stays as TEXT (readable code string like `learning-sensorially-1`), not a UUID FK — matches how the entire app works today
* No production data exists in `module_assessments` so DROP + CREATE is safe
* The `subject_id` column and unique constraint are preserved for backwards compatibility
* The `notes` column is preserved (same name, same type) so `handleMarkDone` works without changes beyond the table name

## Comments

### Nisha Iyer — 2026-03-06

**Update:** KAN-61 now removes the phase layer entirely. When implementing this ticket, do NOT include `phase_id` in the `module_assessment` table. The module_detail_id foreign key is sufficient — no phase scoping needed since phases are being dropped from the data model.

### Nisha Iyer — 2026-04-05

## KAN-62 UAT Results — April 5 2026


### Verdict: FAIL

1 P0 blocker + 1 P1 spec deviation.


---


### Results


| # | Scenario | Result | Notes |
| --- | --- | --- | --- |
| UAT-01 | Migration file creates module_assessment | ⚠️ PARTIAL | Table created but missing ~20 columns from spec |
| UAT-02 | No `module_assessments` (plural) in app .from() calls | ✅ PASS | All 4 files updated. 1 stale comment in useStartTeachingData.ts line 65 |
| UAT-03 | fresh-setup.sql updated | ✅ PASS | New table definition, trigger, RLS all correct |
| UAT-04 | schema.sql updated | ❌ FAIL | Still has old schema, no `module_assessment` |
| UAT-05 | RLS file references module_assessment | ❌ FAIL | `supabase/rls/teacher_workspace_v1.sql` lines 13, 95 still say `module_assessments` (plural) |
| UAT-06 | All 4 app files use `.from('module_assessment')` | ✅ PASS | Verified all 4 references |
| UAT-07 | Storage bucket migration exists | ⚠️ PARTIAL | Bucket name `module-audio` (spec says `audio-recordings`), missing MIME types + storage RLS |
| UAT-08 | CHECK constraints (readiness_label, notes_source) | ❌ FAIL | Neither constraint exists — columns don't exist yet |
| UAT-09 | pnpm lint | ✅ PASS | Zero errors |
| UAT-10 | Regression: curriculum browse | BLOCKED | Chrome disconnected |
| UAT-11 | Regression: Start Teaching | BLOCKED | Chrome disconnected |
| UAT-12 | Console errors | BLOCKED | Chrome disconnected |


### Bugs Filed

**KAN-75 (P0):** Migration table missing `subject_id` and `notes` columns. `handleMarkDone` writes both — will fail at runtime for every logged-in teacher. The migration uses `teacher_notes` but app code writes to `notes`.

**KAN-76 (P1):** Migration only has ~10 columns vs ~30 in the ticket spec. Missing all ML-ready columns, all 4 indexes, both CHECK constraints. RLS file not updated. Storage bucket name mismatch and missing MIME restrictions.


### Recommendation

Fix KAN-75 first (P0 — the column name mismatches). Then decide whether KAN-76's missing ML columns should be added now or deferred to a separate migration before KAN-60.
