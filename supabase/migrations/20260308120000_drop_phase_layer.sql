-- KAN-61: Remove phase layer, flatten curriculum navigation
-- Drop all phase tables, columns, indexes, constraints, and RPC functions

-- ============================================================
-- 1. Drop foreign key constraints referencing phase
-- ============================================================
ALTER TABLE IF EXISTS content.module_detail DROP CONSTRAINT IF EXISTS module_detail_phase_id_fkey;
ALTER TABLE IF EXISTS content.module_group DROP CONSTRAINT IF EXISTS module_group_phase_id_fkey;
ALTER TABLE IF EXISTS public.module_detail DROP CONSTRAINT IF EXISTS module_detail_phase_id_fkey;
ALTER TABLE IF EXISTS public.module_group DROP CONSTRAINT IF EXISTS module_group_phase_id_fkey;

-- ============================================================
-- 2. Drop phase_id columns
-- ============================================================
ALTER TABLE IF EXISTS content.module_group DROP COLUMN IF EXISTS phase_id;
ALTER TABLE IF EXISTS content.module_detail DROP COLUMN IF EXISTS phase_id;
ALTER TABLE IF EXISTS public.module_group DROP COLUMN IF EXISTS phase_id;
ALTER TABLE IF EXISTS public.module_detail DROP COLUMN IF EXISTS phase_id;
ALTER TABLE IF EXISTS public.lesson_completions DROP COLUMN IF EXISTS phase_id;

-- ============================================================
-- 3. Drop phase-related indexes
-- ============================================================
DROP INDEX IF EXISTS public.lc_student_phase_idx;
DROP INDEX IF EXISTS content.content_phase_display_order_idx;
DROP INDEX IF EXISTS content.content_module_group_phase_idx;

-- ============================================================
-- 4. Drop RLS policies on phase tables
-- ============================================================
DROP POLICY IF EXISTS "public read phases" ON public.phase;

-- ============================================================
-- 5. Drop phase tables
-- ============================================================
DROP TABLE IF EXISTS content.phase CASCADE;
DROP TABLE IF EXISTS public.phase CASCADE;

-- ============================================================
-- 6. Delete phase-related RPC functions
-- ============================================================
DROP FUNCTION IF EXISTS public.content_get_phases();
DROP FUNCTION IF EXISTS public.content_get_phase(text);

-- ============================================================
-- 7. Rewrite content_get_groups — remove phase_code parameter
-- ============================================================
DROP FUNCTION IF EXISTS public.content_get_groups(text, public.teaching_mode);

CREATE OR REPLACE FUNCTION public.content_get_groups(
  p_teaching_mode public.teaching_mode DEFAULT NULL
)
RETURNS TABLE (
  id uuid, code text, title text, description text,
  module_count integer, is_locked boolean, display_order integer,
  teaching_mode public.teaching_mode
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, content
AS $$
  SELECT g.id, g.code, g.title, g.description,
         g.module_count, g.is_locked, g.display_order, g.teaching_mode
  FROM content.module_group g
  WHERE (p_teaching_mode IS NULL OR g.teaching_mode = p_teaching_mode)
  ORDER BY g.display_order ASC, g.code ASC;
$$;

GRANT EXECUTE ON FUNCTION public.content_get_groups(public.teaching_mode) TO anon, authenticated, service_role;

-- ============================================================
-- 8. Update content_get_modules — remove phase_id from SELECT
-- ============================================================
CREATE OR REPLACE FUNCTION public.content_get_modules(
  p_group_code text,
  p_teaching_mode public.teaching_mode DEFAULT NULL
)
RETURNS TABLE (
  id uuid, group_id uuid, code text, title text,
  subtitle text, summary text, is_locked boolean, display_order integer,
  lesson jsonb, metadata jsonb, teaching_mode public.teaching_mode
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, content
AS $$
  SELECT m.id, m.group_id, m.code, m.title, m.subtitle,
         m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  FROM content.module_detail m
  JOIN content.module_group g ON g.id = m.group_id
  WHERE g.code = p_group_code
    AND (p_teaching_mode IS NULL OR m.teaching_mode = p_teaching_mode)
  ORDER BY m.display_order ASC, m.code ASC;
$$;

-- ============================================================
-- 9. Update content_get_module — remove phase_id from SELECT
-- ============================================================
CREATE OR REPLACE FUNCTION public.content_get_module(
  p_module_code text,
  p_teaching_mode public.teaching_mode DEFAULT NULL
)
RETURNS TABLE (
  id uuid, group_id uuid, code text, title text,
  subtitle text, summary text, is_locked boolean, display_order integer,
  lesson jsonb, metadata jsonb, teaching_mode public.teaching_mode
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, content
AS $$
  SELECT m.id, m.group_id, m.code, m.title, m.subtitle,
         m.summary, m.is_locked, m.display_order, m.lesson, m.metadata, m.teaching_mode
  FROM content.module_detail m
  WHERE m.code = p_module_code
    AND (p_teaching_mode IS NULL OR m.teaching_mode = p_teaching_mode)
  LIMIT 1;
$$;

-- Create a new index for module_group without phase
CREATE INDEX IF NOT EXISTS content_module_group_display_order_idx ON content.module_group(display_order);
