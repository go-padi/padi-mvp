---
id: KAN-65
title: "Part 1: Schema migration — drop phase table and phase_id columns"
type: task
status: done
priority: medium
feature: ml-readiness-classifier
epic: KAN-61
jira_ref: https://go-padi.atlassian.net/browse/KAN-65
created: 2026-03-06
updated: 2026-03-08
---

# KAN-65 — Part 1: Schema migration — drop phase table and phase_id columns

## Description

### Goal\\n\\nRemove the phase abstraction from the database schema so the curriculum is a flat list of lesson groups → modules.\\n\\n### Requirements\\n\\n1. Create a Supabase migration that:\\n   - Drops the `content.phase` and `public.phase` tables\\n   - Removes `phase_id` column from `content.module_group` and `content.module_detail`\\n   - Removes `phase_id` column from `public.module_group` and `public.module_detail`\\n   - Removes `phase_id` from `public.lesson_completions`\\n   - Drops indexes that reference `phase_id` (e.g., `lc_student_phase_idx`)\\n2. Rewrite the 5 content RPC functions:\\n   - `content_get_phases()` → DELETE (no replacement needed)\\n   - `content_get_phase(p_code)` → DELETE\\n   - `content_get_groups(p_phase_code, p_teaching_mode)` → `content_get_groups(p_teaching_mode)` — returns all groups, optionally filtered by teaching_mode\\n   - `content_get_modules(p_group_code)` → keep as-is (already group-scoped, just remove phase_id from result)\\n   - `content_get_module(p_module_code)` → keep as-is (remove phase_id from result)\\n3. Update `fresh-setup.sql` to match the new schema\\n\\n### Acceptance Criteria\\n\\nGiven the migration runs successfully\\nWhen I query `information_schema.tables`\\nThen no `phase` table exists\\n\\nGiven I call `content_get_groups()`\\nWhen no teaching_mode filter is passed\\nThen all lesson groups are returned ordered by display_order\\n\\nGiven I call `content_get_groups('group')`\\nThen only group-mode lesson groups are returned\\n\\n### Notes\\n\\n- Migration file: `supabase/migrations/YYYYMMDDHHMMSS_drop_phase_layer.sql`\\n- The migration in `20260221110000_create_content_schema_and_read_rpcs.sql` defines the current RPCs\\n- The migration in `20260112120000_teacher_workspace_v1.sql` has `phase_id` on `lesson_completions`\\n- Run `supabase db reset` after to verify clean setup">

## Comments

_No comments in Jira at time of migration._
