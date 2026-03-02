# Lovable Ahead-of-Prod Flows — Design Review & Ticket Map

**Date:** 2026-02-28
**Reviewer:** Claude (design-review + north-star skills)
**Prototype:** `preview--read-spark-adventures.lovable.app`
**Compared against:** local codebase (`padi-app-starter`)

---

## Summary

5 differences found between Lovable (logged-in state) and the current codebase. 3 are ahead-of-prod features that Lovable prototyped but the codebase hasn't built yet. 2 are bugs where Lovable fails to differentiate logged-in from logged-out state.

| # | Flow | Type | Verdict | Epic |
|---|------|------|---------|------|
| 1 | Onboarding wizard (Start Teaching) | Ahead of prod | **Keep — build it** | KAN-35 |
| 2 | Add Student modal extra fields | Ahead of prod | **Deprecate in Lovable** | KAN-35 |
| 3 | Teacher Notes & Observations form | Ahead of prod | **Keep — future epic** | New epic needed |
| 4 | Assessments tab shows demo data when logged in | Bug | **Fix in Lovable** | KAN-42 |
| 5 | Grouping & Progress shows demo data when logged in | Bug | **Fix in Lovable** | KAN-42 |

---

## Flow 1 — Onboarding Wizard on Start Teaching (Logged-In)

### What Lovable shows
When a logged-in teacher navigates to Start Teaching for the first time, Lovable shows a "Welcome to Padi!" onboarding wizard with:
- Step 1: Add Students (name, optional student ID, optional notes)
- Step 2: Create Groups (Optional)
- "I'll do this later" skip button

### What the codebase shows
The codebase's Start Teaching page (logged-in) goes straight to the student/group card list with an "Add Students" button. No onboarding wizard exists.

### Design Review

**First impression (5s test):** Clear. The wizard immediately tells the teacher what to do first. Purpose is unambiguous.

**North star audit:** Directly serves teacher activation (padi-pm's north star). Getting a teacher from "curious" to "actively teaching real students" is exactly what an onboarding wizard does. This is the highest-leverage screen in the app for activation — without it, a new teacher lands on an empty page with no guidance.

**User journey check:** This fills a critical gap. Today a teacher who signs up lands on Start Teaching with no students and must figure out the "Add Students" button themselves. The wizard bridges the gap between account creation and first use.

**Friction audit:** Low friction — 2 steps, skip option available. Good.

**Verdict: Keep — build it.** This is high-priority for teacher activation. Recommend creating a ticket under KAN-35 (Start Teaching Flow).

**Recommended ticket:**
- Title: `Onboarding wizard for first-time Start Teaching`
- Epic: KAN-35 (Start Teaching Flow)
- Priority: P1
- Acceptance criteria: On first login (no students yet), show Welcome wizard with Step 1: Add Students, Step 2: Create Groups (optional), and skip option. After wizard or skip, show the normal Start Teaching card view.

---

## Flow 2 — Add Student Modal Extra Fields

### What Lovable shows
The Add Student modal in the onboarding wizard has:
- Student Name (single field)
- Student ID (Optional)
- Notes (Optional)

### What the codebase shows
The codebase's AddStudentModal has:
- First Name (required)
- Last Name (required)

No Student ID or Notes fields. The DB schema (`students` table) has `first_name` and `last_name` columns but no `student_id` or `notes` columns.

### Design Review

**North star audit:** Student ID and Notes don't move the teacher closer to the 3-signal output (Ready / Needs Help / Needs Intervention). They're administrative metadata, not assessment data.

**Friction audit:** Extra fields add friction to the critical "add your first student" moment. Every optional field is a decision point that slows the teacher down during onboarding.

**Specific feedback:**
1. **Single "Student Name" field vs First/Last:** The codebase's First Name + Last Name split is better for data quality and sorting. Don't collapse to a single field.
2. **Student ID:** Nice-to-have for schools with ID systems, but not needed for MVP. Adds a DB migration.
3. **Notes:** Vague. What goes here? If it's for teacher observations, that belongs in the lesson-level Teacher Notes, not the student record.

**Verdict: Deprecate in Lovable.** Revert the Lovable modal to match the codebase (First Name + Last Name only). Student ID and Notes can be revisited post-MVP if teachers request them.

**Recommended action:**
- Add to next Lovable update prompt: "Change Add Student modal to use First Name and Last Name (both required) instead of single Student Name field. Remove Student ID and Notes fields."
- No Jira ticket needed — this is a Lovable-only correction.

---

## Flow 3 — Teacher Notes & Observations Form (Lesson Detail, Logged-In)

### What Lovable shows
When a logged-in teacher views a lesson detail (e.g., LS-1: The Silence Game), the bottom of the page shows a full form:
- Teacher ID input
- Session Notes textarea ("Record observations about student behavior, engagement, and any challenges noticed during this activity...")
- Upload Audio Recording (Optional) with file upload button
- "No students flagged for additional practice yet" placeholder
- "Save Notes & Continue" button

### What the codebase shows
The codebase shows a "Sign in to add notes" placeholder card in logged-out state. In logged-in state, the codebase has no Teacher Notes form implemented yet — it's a placeholder.

### Design Review

**First impression (5s test):** Clear purpose. Teacher immediately knows they can record observations after teaching a lesson.

**North star audit:** This directly serves the assessment outcome north star. Teacher notes feed into the signal chain: observations → assessment data → Ready / Needs Help / Needs Intervention. Without notes, the teacher's qualitative observations are lost.

**User journey check:** Good placement — after the teacher reads the lesson guide and teaches it, they record what happened. Natural position in the flow.

**Friction audit:**
1. **"Teacher ID" field is unnecessary.** The teacher is already logged in — we know who they are. This adds friction and confusion. Remove it.
2. **Audio upload is ambitious for MVP.** File storage, playback, and Supabase storage buckets are all new infrastructure. High effort, uncertain value.
3. **"Students flagged for additional practice" is forward-looking.** It references assessment data that doesn't exist yet in the system. Good placeholder text but this section needs the assessment pipeline to work.

**Specific feedback:**
1. **Remove Teacher ID** — redundant with auth. The system should auto-populate from the session.
2. **Keep Session Notes** — this is the core value. Simple textarea, saves to a new `teacher_notes` table.
3. **Defer Audio Upload** — move to post-MVP. Too much infrastructure for launch.
4. **"Save Notes & Continue" CTA is good** — clear action, implies forward momentum.

**Verdict: Keep the concept — but scope it down for MVP.** The Session Notes textarea + Save button is the MVP version. Audio upload and student flagging are future scope.

**Recommended ticket:**
- Title: `Teacher Notes — save session notes on lesson detail`
- Epic: New epic recommended (or add to KAN-37 Curriculum Content Pipeline)
- Priority: P2 (after Start Teaching and Assessments are working)
- MVP scope: Session Notes textarea + Save button. No audio upload. No student flagging.
- Requires: New `teacher_notes` table in Supabase (lesson_id, teacher_id, tenant_id, notes, created_at)

**Lovable update:** Remove Teacher ID field. Add "(Coming soon)" label to Audio Upload. Keep the rest as-is for design reference.

---

## Flow 4 — Assessments Tab Shows Demo Data When Logged In (BUG)

### What Lovable shows
When logged in, the Assessments tab still shows:
- Amber banner: "Read-only preview: sign in to record live assessment results."
- Demo data table with Diego R., Nia S., and group students

### What should happen
Per the north star key product rule: "Demo data is never shown to logged-in users." A logged-in teacher should see either their real assessment data or an empty state ("No assessments recorded yet. Start teaching to begin tracking progress.").

### Verdict: Fix in Lovable.

**Recommended Lovable update:**
- When logged in with no real data, show empty state: "No assessments recorded yet. Start teaching to begin tracking student progress."
- Remove the amber "sign in" banner for authenticated users.
- Show green "Workspace tools enabled" status line instead.

**Recommended Jira ticket:**
- Title: `Assessments tab — logged-in empty state`
- Epic: KAN-36 (Assessments & Grouping — Logged-in Teacher Workspace)
- Priority: P1

---

## Flow 5 — Grouping & Progress Shows Demo Data When Logged In (BUG)

### What Lovable shows
When logged in, the Grouping & Progress tab still shows:
- Demo group cards (Group A, B, C) with hardcoded data
- No indication that this is demo vs real data

### What should happen
Same rule: "Demo data is never shown to logged-in users." Logged-in teachers should see their real groups or an empty state.

### Verdict: Fix in Lovable.

**Recommended Lovable update:**
- When logged in with no groups, show empty state: "No groups created yet. Add students and create groups from the Start Teaching page."
- Remove all demo data for authenticated users.

**Recommended Jira ticket:**
- Title: `Grouping & Progress — logged-in empty state`
- Epic: KAN-36 (Assessments & Grouping — Logged-in Teacher Workspace)
- Priority: P1

---

## Ticket Summary for Jira

| Ticket | Key | Epic | Priority | Type |
|--------|-----|------|----------|------|
| Onboarding wizard for first-time Start Teaching | KAN-44 | KAN-35 | P1 | Story |
| Assessments tab — logged-in empty state | KAN-45 | KAN-36 | P1 | Story |
| Grouping & Progress — logged-in empty state | KAN-46 | KAN-36 | P1 | Story |
| Teacher Notes — save session notes on lesson detail | KAN-47 | KAN-37 | P2 | Story |

**Lovable-only fixes (no Jira ticket):**
- Revert Add Student modal to First Name + Last Name (remove Student ID, Notes)
- Remove Teacher ID field from Teacher Notes form
- Add "(Coming soon)" to Audio Upload in Teacher Notes

---

## Logged-Out State — No Ahead-of-Prod Gaps

The logged-out audit (covered in KAN-33 UAT) found only 1 gap: missing "Log in to unlock" bottom CTA on Start Teaching. This was already captured in Lovable Update 8. All other logged-out screens match the codebase.
