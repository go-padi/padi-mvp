---
id: KAN-61
title: "Remove phase layer, flatten curriculum nav, and populate full content from PDFs"
type: story
status: in-progress
priority: medium
feature: ml-readiness-classifier
epic: KAN-60
jira_ref: https://go-padi.atlassian.net/browse/KAN-61
created: 2026-03-06
updated: 2026-03-06
---

# KAN-61 — Remove phase layer, flatten curriculum nav, and populate full content from PDFs

## Description

### Goal

Simplify the curriculum architecture by removing the "phase" abstraction layer and populating all real content from the Group and Individual curriculum PDFs. Teachers land directly on lesson groups instead of choosing a phase first.

### Background

The curriculum PDFs (group.pdf — 502 pages, ind.pdf — 550 pages) organize content into 7 concurrent chapters, NOT sequential phases. The current Phase 1/2/3 concept was an app-level invention that adds a navigation step without pedagogical value. This ticket removes the phase table, flattens routes, and populates all 328 modules.

Related: KAN-60 (ML Build epic), KAN-62 (module_assessment schema — will need phase_id removal too)

### Requirements

**Part 1: Schema Migration — Drop Phase**

1. Create a Supabase migration that drops the `phase` table and removes `phase_id` columns from `module_group` and `module_detail`
2. Update or replace the 5 content RPC functions (`content_get_phases`, `content_get_phase`, `content_get_groups`, `content_get_modules`, `content_get_module`) — remove phase parameters, query groups directly
3. Remove `phase_id` from `lesson_completions` table
4. Update `fresh-setup.sql` to match

**Part 2: Route Restructure**

1. Delete `/teacher/phases/` route tree entirely
2. Create new routes:

    * `/teacher/curriculum/` — lists all lesson groups (Group and Individual, split by teaching_mode toggle)
    * `/teacher/curriculum/[group]/` — lists modules within a group
    * `/teacher/curriculum/[group]/[module]` — individual module/lesson view
    
3. Remove `PhaseTabs` component
4. Update `TopNav`, `StartTeachingWizard`, and any component that links to `/teacher/phases/`
5. Update demo data (`demoCurriculum.ts`, `demoStudents.ts`, `demoGroups.ts`, `demoAssessments.ts`) — remove phase field
6. Update `useStartTeachingData.ts` — remove phase references from student data

**Part 3: Populate Full Content from PDFs**

1. Rewrite `scripts/seed-curriculum.ts` to remove phase hierarchy
2. Extract all modules from both PDFs:

    * Group: 172 modules across 16 lesson groups
    * Individual: 156 modules across 16 lesson groups
    
3. Each module needs: code, title, teaching_mode, display_order, and lesson JSON (materials, aims, presentation_steps, examples, extension)
4. See `docs/KAN-61-claude-code-prompt.md` for detailed extraction guide (update this doc to remove phase references)

### Acceptance Criteria

**Schema**
Given the migration runs  
When I query the database  
Then there is no `phase` table, no `phase_id` column on `module_group`, `module_detail`, or `lesson_completions`

**Routes**
Given I am on the teacher dashboard  
When I click "Start Teaching" or navigate to curriculum  
Then I see lesson groups directly at `/teacher/curriculum/` — no phase selection step

Given I click a lesson group  
When the group page loads at `/teacher/curriculum/[group]`
Then I see all modules in that group with their teaching mode badge

Given I navigate to `/teacher/phases/` (old URL)  
When the page loads  
Then I get a 404 or redirect to `/teacher/curriculum/`

**Content**
Given `pnpm seed:curriculum` runs  
When I check the database  
Then all 16 group-mode lesson groups exist with correct module counts  
And all 16 individual-mode lesson groups exist with correct module counts  
And Rhyming (Group) has 19 modules: RMG-1 through RMG-19  
And every module has `lesson` JSON with at minimum `materials` and `aims`

**Demo / Logged-out**
Given I am logged out  
When I view the curriculum  
Then I see preview data with no phase references

### Out of Scope

* Assessment flow changes (KAN-36 will adapt separately)
* ML model schema (KAN-62 will update phase_id removal independently)
* Appendix content from PDFs (Pictures, Phonogram Cards, Materials List)

### Notes

* The detailed extraction guide is at `docs/KAN-61-claude-code-prompt.md` — update it to remove phase references before handing to Claude Code
* LS-1 in the current seed script has the correct `lesson` JSON format — use as template
* Module group codes: `K_LS`, `K_RMG`, `K_WS`, etc. for group; `K_IND_LS`, `K_IND_RMG`, etc. for individual (drop the P1 prefix since phases are gone)
* Module codes: use PDF codes directly for group (LS-1, RMG-3); prefix IND\_ for individual (IND_LS-1, IND_RMG-3)
* File paths to update: see blast radius analysis — 26 files reference 'phase'

## Comments

_No comments in Jira at time of migration._
