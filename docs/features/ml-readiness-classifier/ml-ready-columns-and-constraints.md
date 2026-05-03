---
id: KAN-76
title: "Pre-KAN-60: Add ML-ready columns, indexes, CHECK constraints to module_assessment"
type: bug
status: backlog
priority: medium
feature: ml-readiness-classifier
epic: KAN-60
jira_ref: https://go-padi.atlassian.net/browse/KAN-76
created: 2026-04-05
updated: 2026-04-16
---

# KAN-76 — Pre-KAN-60: Add ML-ready columns, indexes, CHECK constraints to module_assessment

## Description

## Summary

The KAN-62 ticket spec defined a full ML-ready schema with \~30 columns but the migration only implemented \~10 basic columns. Missing items:

### Missing Columns

* `teacher_id` UUID references profiles(id)
* `audio_duration_sec` FLOAT
* `audio_format` TEXT
* `notes_source` TEXT (with CHECK constraint)
* `notes_photo_url` TEXT
* `model_prediction` TEXT
* `model_confidence` FLOAT
* `model_version` TEXT
* `model_reasoning` TEXT
* `readiness_label` TEXT (with CHECK constraint)
* `labeled_by` UUID references profiles(id)
* `labeled_at` TIMESTAMPTZ
* `teacher_agrees` BOOLEAN
* `teacher_correction` TEXT
* `feedback_at` TIMESTAMPTZ
* `context` JSONB

### Missing Indexes

Ticket spec called for 4 indexes:

* `idx_assessment_tenant`
* `idx_assessment_student`
* `idx_assessment_module`
* `idx_assessment_label`

None exist in the migration.

### Missing CHECK Constraints

* `valid_readiness_label` CHECK (readiness_label IN ('ready', 'intervention', 'sis_therapy'))
* `valid_notes_source` CHECK (notes_source IN ('typed', 'ocr', 'photo'))

### RLS File Not Updated

`supabase/rls/teacher_workspace_v1.sql` lines 13 and 93-98 still reference `module_assessments` (plural). Should be `module_assessment` (singular).

### Storage Bucket

Migration uses `module-audio` but ticket spec says `audio-recordings`. Also missing: MIME type restrictions, file size limit, and storage RLS policy.

### Stale Comment

`lib/startTeaching/useStartTeachingData.ts` line 65: comment still says "module_assessments"

## Severity

**P1** — Not immediately breaking but deviates significantly from the spec. The ML columns are needed for KAN-60 (ML Build) and the missing indexes will cause performance issues at scale.

## Found During

KAN-62 UAT

## Comments

_No comments in Jira at time of migration._
