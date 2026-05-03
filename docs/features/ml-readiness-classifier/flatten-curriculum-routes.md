---
id: KAN-66
title: "Part 2: Flatten routes — /teacher/curriculum/[group]/[module]"
type: task
status: done
priority: medium
feature: ml-readiness-classifier
epic: KAN-61
jira_ref: https://go-padi.atlassian.net/browse/KAN-66
created: 2026-03-06
updated: 2026-03-08
---

# KAN-66 — Part 2: Flatten routes — /teacher/curriculum/[group]/[module]

## Description

### Goal\\n\\nReplace the 4-level phase-based route tree with a flat 2-level curriculum nav so teachers go directly from lesson groups to modules.\\n\\n### Requirements\\n\\n1. **Delete** the entire `/teacher/phases/` route tree:\\n   - `app/teacher/phases/page.tsx`\\n   - `app/teacher/phases/[phase]/page.tsx`\\n   - `app/teacher/phases/[phase]/areas/[area]/page.tsx`\\n   - `app/teacher/phases/[phase]/areas/[area]/modules/[module]/page.tsx`\\n   - `app/assessments/[phase]/page.tsx`\\n2. **Create** new route tree:\\n   - `app/teacher/curriculum/page.tsx` — lists all lesson groups, split by Group/Individual via TeachingModeToggle. No phase tabs.\\n   - `app/teacher/curriculum/[group]/page.tsx` — lists modules within a group with progress indicators\\n   - `app/teacher/curriculum/[group]/[module]/page.tsx` — lesson detail view (port existing module page logic)\\n3. **Delete** `components/PhaseTabs.tsx`\\n4. **Update** all internal links:\\n   - `TopNav.tsx` — any links to `/teacher/phases` → `/teacher/curriculum`\\n   - `StartTeachingWizard.tsx` — phase references in onboarding flow\\n   - Any breadcrumb that says "Back to Phases" → "Back to Curriculum"\\n5. **Update demo data** (remove phase field):\\n   - `lib/demo/demoCurriculum.ts` — restructure to flat group list\\n   - `lib/demo/demoStudents.ts` — remove `phase` property\\n   - `lib/demo/demoGroups.ts` — remove `phase` property\\n   - `lib/demo/demoAssessments.ts` — remove `phase` property\\n6. **Update** `lib/startTeaching/useStartTeachingData.ts` — remove phase from student type and queries\\n\\n### Acceptance Criteria\\n\\nGiven I navigate to `/teacher/curriculum/`\\nWhen the page loads\\nThen I see all lesson groups with Group/Individual toggle, no phase selection\\n\\nGiven I click a group card (e.g., "Rhyming")\\nWhen the page loads at `/teacher/curriculum/K_RMG`\\nThen I see all modules in that group\\n\\nGiven I navigate to `/teacher/phases/K_P1` (old URL)\\nThen I get a 404 or redirect to `/teacher/curriculum/`\\n\\nGiven I am logged out\\nWhen I visit `/teacher/curriculum/`\\nThen I see preview/demo data with no phase references\\n\\n### Notes\\n\\n- Port the group card rendering logic from `phases/[phase]/page.tsx` — it's solid, just remove the phase wrapper\\n- The TeachingModeToggle component stays as-is\\n- 26 files reference 'phase' — grep the codebase to find all\\n- Depends on Part 1 (schema migration) being done first">

## Comments

_No comments in Jira at time of migration._
