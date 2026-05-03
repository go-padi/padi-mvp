---
id: KAN-112
title: "Readiness signal step on lesson completion — inline teacher assessment"
type: story
status: done
priority: high
feature: assessments-grouping
epic: KAN-36
jira_ref: https://go-padi.atlassian.net/browse/KAN-112
created: 2026-04-17
updated: 2026-04-17
---

# KAN-112 — Readiness signal step on lesson completion — inline teacher assessment

## Description

### Goal

When a teacher completes a lesson, ask them to classify the student's readiness using warm, teacher-friendly language. This is the moment the north star's three-signal output gets generated — and it must feel natural, not clinical. Addresses design review findings #1 and #5.

### Background

Currently "Mark Lesson Complete" writes `status: 'completed'` to `module_assessment` with no readiness signal. The schema already has `teacher_feedback` (text) and `prediction_json` (jsonb) columns ready to store this data. The ICP is a teacher with limited app navigation experience — every interaction must be obvious and anxiety-free.

Related: KAN-52 (lesson completion flow, Done), KAN-93 (student selector fix, Done).

### Requirements

1. **Replace immediate completion with a two-step inline flow:**

    * Teacher clicks "Mark Lesson Complete"
    * Instead of immediately saving, an inline card expands below the button (no modal, no page change)
    * Card header: "How is \[student name\] doing with this lesson?"
    * Three large, colorful tap targets in a row:
    
        * 🟢 **On Track** — "Progressing well, ready to move on" (maps to `ready` internally)
        * 🟡 **Needs Practice** — "Getting there, could use more time" (maps to `needs_help` internally)
        * 🔴 **Needs Extra Support** — "Struggling, may need different approach" (maps to `needs_intervention` internally)
        
    * Optional one-line text input: "Anything specific to note?" (pre-filled from existing notes if any)
    * "Complete Lesson" confirm button (uses the gradient style)
    * "Cancel" link to collapse the card
    
2. **Store the signal:**

    * Write the selected signal to `module_assessment.teacher_feedback` as the signal value (`ready`, `needs_help`, `needs_intervention`)
    * Keep the existing `notes` and `status: 'completed'` writes unchanged
    
3. **Post-completion confirmation (brief, inline):**

    * After confirming, show a brief success card (2-3 seconds, or tap to dismiss) before navigating back:
    
        * 🟢 On Track: "Great progress! Next lesson is ready for \[student\]."
        * 🟡 Needs Practice: "Notes saved. Consider revisiting this lesson or trying the extension activities with \[student\]."
        * 🔴 Needs Extra Support: "Notes saved. You may want to discuss \[student\]'s progress with their parent or a reading specialist."
        
    * Then navigate to `backHref` (student module page)
    
4. **Design for low-tech-confidence teachers:**

    * Tap targets must be large (min 48px height, ideally 56px+)
    * Use color + icon + label (never color alone)
    * The three options must look like equal choices — no option should look "wrong" to select
    * "Needs Extra Support" must feel safe to select, not alarming. The copy should reassure: "It's okay — this helps you plan the right next steps"
    

### Acceptance criteria

**Happy Path**
Given a teacher has notes and clicks "Mark Lesson Complete"  
When the inline signal card expands  
Then three signal options are visible with teacher-friendly labels and the teacher can select one and confirm

Given a teacher selects "Needs Practice" and clicks "Complete Lesson"  
When the completion saves  
Then `module_assessment.teacher_feedback` = `needs_help`, status = `completed`, and a contextual confirmation message shows before navigating back

**Empty State**
Given a teacher clicks "Mark Lesson Complete" but hasn't selected a signal  
When they try to click "Complete Lesson"  
Then the confirm button is disabled until a signal is selected

**Error State**
Given the save fails after signal selection  
When the error occurs  
Then the signal card stays open with an error message, no data is lost

**Auth State (logged out)**
Given a user is not logged in  
When they view the lesson page  
Then the signal step and completion button are not visible (existing read-only preview behavior)

### Out of scope

* ML prediction (KAN-60 epic) — this is teacher-only signal for now
* Aggregate signal across multiple modules — that's a future dashboard feature
* Changing the `module_assessment` schema — use existing `teacher_feedback` column

### Notes

* Key file: `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
* `module_assessment` schema: `teacher_feedback text` column already exists
* Signal values stored: `ready`, `needs_help`, `needs_intervention`
* The inline expansion pattern keeps the teacher in context — they see their notes, the lesson content, and the signal choice all on one screen
* This is the bridge between the teaching flow (KAN-35) and the assessment outcome (KAN-36/KAN-60)

## Comments

_No comments in Jira at time of migration._
