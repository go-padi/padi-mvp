# KAN-62: Add module_assessment schema + audio recording storage infrastructure

## Claude Code Prompt

```
Implement KAN-62: Add module_assessment schema + audio recording storage infrastructure for the Padi readiness classifier.

## Context
- See `ml-eng/ml-plan-readiness-classifier.md` for the full ML plan
- See `supabase/fresh-setup.sql` for the current schema
- The curriculum hierarchy is: Chapter → Group → Module (no phase layer — KAN-61 removed it)
- There is an existing simple `module_assessments` table (lines 291-308 in fresh-setup.sql) that needs to be replaced with the full ML-ready version
- Follow the migration pattern from KAN-18 (workspace schema epic): create a new migration file in `supabase/migrations/`
- The table must be tenant-scoped with RLS, matching the pattern used by `students`, `groups`, and `lesson_completions`

## What to do

### 1. Create migration file `supabase/migrations/20260309120000_add_module_assessment_ml.sql`

**Drop the old simple table and create the full ML-ready one:**

```sql
-- Drop the old simple module_assessments table
DROP TABLE IF EXISTS public.module_assessments;

-- Create the full ML-ready module_assessment table
CREATE TABLE public.module_assessment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_detail_id UUID NOT NULL REFERENCES module_detail(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),

  -- Audio input
  audio_url TEXT,
  audio_duration_sec FLOAT,
  audio_format TEXT,

  -- Text input
  parent_notes TEXT,
  notes_source TEXT DEFAULT 'typed',
  notes_photo_url TEXT,

  -- ML prediction (written by classifier service)
  model_prediction TEXT,
  model_confidence FLOAT,
  model_version TEXT,
  model_reasoning TEXT,

  -- Teacher feedback (written by teacher confirmation UI)
  readiness_label TEXT,
  labeled_by UUID REFERENCES profiles(id),
  labeled_at TIMESTAMPTZ,
  teacher_agrees BOOLEAN,
  teacher_correction TEXT,
  feedback_at TIMESTAMPTZ,

  -- Metadata
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Add indexes:**
```sql
CREATE INDEX idx_assessment_student ON module_assessment(student_id, created_at);
CREATE INDEX idx_assessment_module ON module_assessment(module_detail_id, created_at);
CREATE INDEX idx_assessment_label ON module_assessment(readiness_label) WHERE readiness_label IS NOT NULL;
CREATE INDEX idx_assessment_tenant ON module_assessment(tenant_id);
```

**Add CHECK constraints:**
```sql
ALTER TABLE module_assessment
  ADD CONSTRAINT valid_readiness_label
  CHECK (readiness_label IN ('ready', 'intervention', 'sis_therapy'));

ALTER TABLE module_assessment
  ADD CONSTRAINT valid_notes_source
  CHECK (notes_source IN ('typed', 'ocr', 'photo'));
```

**Add updated_at trigger** (reuse the existing `set_updated_at()` function):
```sql
CREATE TRIGGER module_assessment_set_updated_at
BEFORE UPDATE ON module_assessment
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

**Enable RLS** (tenant-scoped, same pattern as other workspace tables):
```sql
ALTER TABLE module_assessment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_assessment tenant access" ON module_assessment
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

**Grant permissions:**
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON module_assessment TO authenticated;
GRANT ALL ON module_assessment TO service_role;
```

### 2. Update `supabase/fresh-setup.sql`

Replace the existing simple `module_assessments` block (the CREATE TABLE, indexes, trigger, RLS policy, and grants around lines 291-371) with the new full `module_assessment` table definition from above. Keep it in the same location (Teacher Workspace Tables section). Make sure to also update:
- The `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` line for the old table name
- The RLS policy name from `"module assessments tenant access"` to match the new table name
- Remove the old `module_assessments` references throughout the file

### 3. Create Supabase Storage bucket configuration

Create a file `supabase/storage/audio-recordings-bucket.sql` with:

```sql
-- Audio recordings storage bucket
-- Run in Supabase SQL editor or via Management API

-- Bucket: audio-recordings
-- Access: authenticated users only, tenant-scoped
-- Allowed MIME types: audio/wav, audio/mp4, audio/mpeg, audio/webm, audio/x-m4a
-- Max file size: 50MB
-- File path convention: {tenant_id}/{student_id}/{module_detail_id}/{timestamp}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-recordings',
  'audio-recordings',
  false,
  52428800, -- 50MB
  ARRAY['audio/wav', 'audio/mp4', 'audio/mpeg', 'audio/webm', 'audio/x-m4a']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: authenticated users can upload to their tenant's folder
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Storage RLS: users can read audio from their tenant
CREATE POLICY "Authenticated users can read own tenant audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text FROM profiles WHERE id = auth.uid()
  )
);
```

### 4. Add TypeScript types

Create a types file at `lib/types/module-assessment.ts` (or co-locate with the feature if a dedicated directory exists) with:

```typescript
export interface ModuleAssessment {
  id: string;
  tenant_id: string;
  student_id: string;
  module_detail_id: string;
  teacher_id: string | null;

  // Audio input
  audio_url: string | null;
  audio_duration_sec: number | null;
  audio_format: string | null;

  // Text input
  parent_notes: string | null;
  notes_source: 'typed' | 'ocr' | 'photo';
  notes_photo_url: string | null;

  // ML prediction
  model_prediction: ReadinessLabel | null;
  model_confidence: number | null;
  model_version: string | null;
  model_reasoning: string | null;

  // Teacher feedback
  readiness_label: ReadinessLabel | null;
  labeled_by: string | null;
  labeled_at: string | null;
  teacher_agrees: boolean | null;
  teacher_correction: string | null;
  feedback_at: string | null;

  // Metadata
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ReadinessLabel = 'ready' | 'intervention' | 'sis_therapy';

export type NotesSource = 'typed' | 'ocr' | 'photo';
```

## Important constraints
- Do NOT include a `phase_id` column — phases were removed in KAN-61
- The `module_detail_id` FK references `public.module_detail(id)` (not `content.module_detail`)
- Follow existing patterns in `fresh-setup.sql` for RLS, triggers, and grants
- The existing `set_updated_at()` function already exists — just reuse it
- Keep the migration idempotent where possible (use IF NOT EXISTS, ON CONFLICT)

## Out of scope (do NOT implement)
- Recording UI in the app (separate ticket)
- Classifier service endpoint (separate ticket)
- Teacher confirmation/feedback UI (separate ticket)
- OCR processing for handwritten notes (later)

## Verification
After implementation:
1. Run `pnpm lint` to ensure no TypeScript errors
2. Verify the migration SQL is syntactically valid
3. Confirm the fresh-setup.sql is internally consistent (no dangling references to old `module_assessments`)
4. Check that the TypeScript types match the SQL schema exactly
```
