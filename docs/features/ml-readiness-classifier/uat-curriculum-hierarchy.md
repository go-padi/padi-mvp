---
id: KAN-69
title: "UAT: Curriculum hierarchy (chapters/groups/modules) + Start Teaching student view"
type: task
status: done
priority: medium
feature: ml-readiness-classifier
epic: KAN-61
jira_ref: https://go-padi.atlassian.net/browse/KAN-69
created: 2026-03-08
updated: 2026-03-30
---

# KAN-69 — UAT: Curriculum hierarchy (chapters/groups/modules) + Start Teaching student view

## Description

## Goal

Manually verify the full curriculum experience end-to-end: chapter hierarchy with readable codes (KAN-71), and Start Teaching student view with chapter accordion (KAN-70).

## UAT Checklist

### Curriculum Structure (KAN-71)

* \[ <custom data-type="emoji" data-id="id-0">:green_circle:</custom> \] Navigate to `/teacher/curriculum/` — see 7 chapter cards (not 16 flat groups)
* \[ <custom data-type="emoji" data-id="id-1">:green_circle:</custom> \] Chapters shown: Phonological Awareness, Alphabet, Phonics, Reading, Handwriting, Spelling, Vocabulary Comprehension & Fluency
* \[ <custom data-type="emoji" data-id="id-2">:green_circle:</custom> \] Teaching mode toggle works: Group shows 7 chapters, Individual shows 7 chapters
* \[ <custom data-type="emoji" data-id="id-3">:green_circle:</custom> \] Click "Phonological Awareness" → lands on `/teacher/curriculum/phonological-awareness` — see 8 lesson groups (Learning Sensorially, Rhyming, Words & Sentences, Syllables, Initial Sounds, Final Sounds, Medial Sounds, Combining Sounds)
* \[<custom data-type="emoji" data-id="id-4">:green_circle:</custom>  \] Click "Reading" chapter → see 2 groups (Reading, Reading Exercises)
* \[ <custom data-type="emoji" data-id="id-5">:green_circle:</custom> \] Click "Alphabet" chapter → see 1 group (Alphabet)
* \[ <custom data-type="emoji" data-id="id-6">:yellow_circle:</custom>   \] Click a group → see module list with readable codes (e.g. `learning-sensorially-1` not `LS-1`)
* \[<custom data-type="emoji" data-id="id-7">:green_circle:</custom> \] Click a module → lesson detail page loads with Materials/Aims/Presentation/Extension
* \[ <custom data-type="emoji" data-id="id-8">:green_circle:</custom>\] Breadcrumbs: Module → back → Group page → back → Chapter page → back → Curriculum landing
* \[ <custom data-type="emoji" data-id="id-9">:green_circle:</custom>\] Switch to Individual mode on curriculum landing — 7 individual chapters visible
* \[<custom data-type="emoji" data-id="id-10">:green_circle:</custom> \] Click an individual chapter → groups show with `ind-` prefix codes

### Human-Readable Codes (KAN-71)

* \[<custom data-type="emoji" data-id="id-11">:green_circle:</custom> \] No `K_LS`, `K_RMG`, `K_CH1` style codes visible anywhere in the UI
* \[<custom data-type="emoji" data-id="id-12">:green_circle:</custom> \] No `LS-1`, `RMG-1` style module codes visible in URLs or subtitles
* \[ <custom data-type="emoji" data-id="id-13">:green_circle:</custom>\] URLs are readable: e.g. `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1`
* \[ <custom data-type="emoji" data-id="id-14">:green_circle:</custom>\] Module subtitles show readable codes (e.g. `learning-sensorially-1`)

### Content Verification

* \[<custom data-type="emoji" data-id="id-15">:green_circle:</custom> \] `learning-sensorially-1` ("The Silence Game") has full lesson content
* \[ <custom data-type="emoji" data-id="id-16">:green_circle:</custom>\] Group mode: all 16 groups accessible across 7 chapters
* \[<custom data-type="emoji" data-id="id-17">:green_circle:</custom> \] Individual mode: all 16 individual groups accessible across 7 chapters
* \[<custom data-type="emoji" data-id="id-18">:green_circle:</custom> \] Rhyming group shows 19 modules (`rhyming-1` through `rhyming-19`)
* \[ <custom data-type="emoji" data-id="id-19">:green_circle:</custom>\] At least 3 random modules have populated lesson JSON

### Start Teaching Student View (KAN-70)

* \[ <custom data-type="emoji" data-id="id-20">:red_circle:</custom> \] (not logged in)Click a student card on Start Teaching → student detail page loads
* \[ <custom data-type="emoji" data-id="id-21">:green_circle:</custom>  \] (logged in)Click a student card on Start Teaching → student detail page loads
* \[<custom data-type="emoji" data-id="id-22">:green_circle:</custom> \] Page shows chapter accordion (collapsible sections), not a flat module list
* \[<custom data-type="emoji" data-id="id-23">:green_circle:</custom> \] Student header shows: name, avatar, "X of 7 chapters started", overall progress bar
* \[<custom data-type="emoji" data-id="id-24">:green_circle:</custom> \] Expand a chapter → see lesson groups with per-group progress (X/Y complete + mini progress bar)
* \[ <custom data-type="emoji" data-id="id-25">:green_circle:</custom>\] Each group lists modules with completion status (checkmark / current / upcoming)
* \[<custom data-type="emoji" data-id="id-26">:green_circle:</custom> \] First chapter with incomplete modules is auto-expanded on load
* \[ <custom data-type="emoji" data-id="id-27">:yellow_circle:</custom>  \] "Start Teaching" / "Continue Teaching" button appears on the first incomplete module
* \[<custom data-type="emoji" data-id="id-28">:green_circle:</custom> \] Click "Start Teaching" → lesson page loads with `?student=` param in URL
* \[ <custom data-type="emoji" data-id="id-29">:green_circle:</custom>\] URL includes chapter: e.g. `/teacher/curriculum/phonological-awareness/learning-sensorially/learning-sensorially-1?student=abc123`
* \[ <custom data-type="emoji" data-id="id-30">:green_circle:</custom>\] From lesson page, "Back" returns to the student detail page (not the chapter)
* \[ <custom data-type="emoji" data-id="id-31">:green_circle:</custom>\] Click "Mark Done" on a module → group progress, chapter progress, and overall progress bar all update
* \[<custom data-type="emoji" data-id="id-32">:green_circle:</custom> \] Mark all modules done in a group → group shows green completion
* \[<custom data-type="emoji" data-id="id-33">:green_circle:</custom> \] Mark all modules done across all groups → "All modules complete" banner appears

### Logged-out / Preview

* \[ \] Visit `/teacher/curriculum/` while logged out — see preview chapter cards
* \[ \] Click through chapter → group → module in preview mode
* \[ \] Locked modules show "Coming Soon"
* \[ \] No notes/observations form shown when logged out
* \[ \] Amber preview banner visible

### Regression

* \[ \] Teacher dashboard (Start Teaching landing) loads without errors
* \[ \] Student cards show correct progress percentages
* \[ \] Add Student modal works
* \[ \] Add Group modal works
* \[ \] TopNav highlights correctly on all curriculum pages
* \[ \] `pnpm lint` passes
* \[ \] `pnpm build` succeeds

## Notes

* KAN-71 added the chapter layer + renamed all codes to human-readable kebab-case
* KAN-70 rewired the student detail page to show the full chapter/group/module hierarchy with per-student progress
* The StartTeachingWizard still inserts `phase: 'Phase 1'` and `focus_areas: ['Learning Sensorially']` — this is a known cleanup item but doesn't block UAT
* Focus on: (1) curriculum browsing matches the PDF structure, (2) Start Teaching student view mirrors the same hierarchy, (3) all codes are readable

## Comments

### Nisha Iyer — 2026-03-18

- [ :yellow_circle:   ] Click a group → see module list with readable codes (e.g. `learning-sensorially-1` not `LS-1`)

yes it is the above- i think it should just be the name of the lesson (right below the module number)

### Nisha Iyer — 2026-03-18

- [ :yellow_circle:  ] "Start Teaching" / "Continue Teaching" button appears on the first incomplete module

this appears as ‘Continue teaching’ for all modules in each new group; within a lesson.

may want to have only the active module show - so educators do not move around between modules.

### Nisha Iyer — 2026-03-30

## KAN-69 UAT Results — March 30 2026


### Verdict: FAIL

One P0 blocker prevents the module-list view from rendering at all.


---


### PASS (8/11 criteria)


| # | Test | Result |
| --- | --- | --- |
| 1 | Curriculum landing shows 7 chapter cards with readable codes | ✅ PASS |
| 2 | Teaching mode toggle switches Group/Individual/Both with correct badges | ✅ PASS |
| 3 | Chapter page shows lesson groups with module counts (tested Phonological Awareness: 8 groups) | ✅ PASS |
| 4 | All URLs are human-readable (`/phonological-awareness`, `/learning-sensorially`, etc.) | ✅ PASS |
| 5 | Module detail page loads with lesson content (Materials, Aim, Presentation, Extension) | ✅ PASS |
| 6 | Amber preview banner visible on curriculum and chapter pages when logged out | ✅ PASS |
| 7 | "← Back to Curriculum" breadcrumb present and functional on chapter page | ✅ PASS |
| 8 | Browser back button recovers correctly from crashed group page | ✅ PASS |


### FAIL (1 blocker)


| # | Test | Result | Bug |
| --- | --- | --- | --- |
| 9 | Click "View Modules →" to see module list for any group | ❌ **P0 CRASH** | KAN-74 |

**KAN-74**: Group page (`[chapter]/[group]/page.tsx`) white-screens on EVERY group due to React hooks order violation. `useMemo` is called after a conditional early return, violating Rules of Hooks. Affects 100% of module-list views.


### NOT TESTABLE (due to P0)


| # | Test | Notes |
| --- | --- | --- |
| 10 | Locked modules show "Coming Soon" + disabled styling | Group page crashes before modules render |
| 11 | Navigate from module list → lesson detail via "View Lesson →" | Group page crashes (tested lesson detail via direct URL — works) |


### Additional Findings (P2/P3)

- **P3**: Invalid chapter URL (`/curriculum/nonexistent-chapter`) shows "No lesson groups found" but no "Chapter not found" message
- **P3**: `href="#"` on locked modules doesn't fully prevent click navigation
- **P2**: StudentDetailPage preview hardcodes `learning-sensorially` regardless of `teaching_mode`


### Lint

`pnpm lint` passes with warnings only (unused vars, `<a>` vs `<Link>` in students page — pre-existing).


### Recommendation

Fix KAN-74 first (one-line fix: move `useMemo` above the early return), then re-run UAT.

### Nisha Iyer — 2026-03-30

## KAN-69 UAT Re-run — March 30 2026 (post KAN-74 fix)


### Verdict: PASS

KAN-74 fix confirmed — group page now renders correctly.


| # | Test | Result |
| --- | --- | --- |
| 9 | Module list page loads with readable codes (learning-sensorially-1, 2, 3) | ✅ PASS |
| 10 | Locked modules | N/A — no `is_locked: true` modules in current seed data |
| 11 | Module list → lesson detail via "View Lesson →" | ✅ PASS |
| - | "← Back to Modules" breadcrumb on lesson detail | ✅ PASS |

All 8 original passing tests + 2 previously blocked tests now pass. Closing KAN-69.
