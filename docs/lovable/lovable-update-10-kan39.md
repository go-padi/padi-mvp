# Lovable Update 10 — KAN-39: Student-Centric Teaching Flow

**Ticket:** KAN-39 (Start Teaching: Design student-centric teaching flow)
**Epic:** KAN-35 (Start Teaching Flow)
**Priority:** P0 — this is the bridge between "has students" and "actively teaching"
**Depends on:** Nothing (this is the foundation)
**Blocks:** KAN-40 (lesson locking), KAN-41 (context banner)
**Includes:** KAN-48 (student context on lesson page)

---

## Prompt for Lovable

> **Goal:** When a logged-in teacher clicks a student card on Start Teaching, take them directly into that student's current module — not a generic lesson list. The teacher should always know which student they're teaching.

> ### Changes to Start Teaching page (logged-in, has students)
>
> 1. **Student card redesign.** Each student card should show:
>    - Student name (e.g., "Maggie Sosna")
>    - Current phase (e.g., "Phase 1")
>    - Current module name (e.g., "Learning Sensorially")
>    - Progress indicator (e.g., "Lesson 2 of 6" or a small progress bar)
>    - Assessment status: "Not started", "In progress", or a completion badge
>    - **Primary CTA button changes based on state:**
>      - No lessons started → "Start Teaching" (blue/primary)
>      - Lesson in progress → "Continue Teaching" (blue/primary)
>      - All lessons complete → "View Progress" (outline/secondary)
>
> 2. **Clicking the card or CTA** navigates to that student's current module page. The URL should feel student-scoped — something like `/start-teaching/students/[student-id]` which shows the module list for that specific student.
>
> 3. **Student module page** (new page, replaces the generic "View lessons" destination):
>    - Header: "Teaching [Student Name]" with a back arrow to Start Teaching
>    - Subtitle: "[Phase Name] — [Module Name]"
>    - The module's lesson list, showing each lesson with its title and status
>    - The current/next lesson is visually prominent
>    - A "Back to Start Teaching" link that returns to the card grid
>
> 4. **Student context on lesson pages (KAN-48).** This is the critical missing piece. When a teacher clicks into a lesson from the student module page:
>    - Show a **persistent banner** at the top of the lesson page: "Teaching [Student Name] — [Phase] • [Module Name]" with a back arrow
>    - The Teacher Notes section at the bottom of the lesson page should be clearly labeled: "Notes for [Student Name]"
>    - The teacher should never lose sight of which student they're working with — the student name should be visible on every page from Start Teaching → student modules → lesson detail
>    - When the teacher clicks back, they return to that student's module page (not Start Teaching)
>
> 5. **Group cards (Individual vs Group mode):**
>    - In **Individual mode**: only show student cards (current behavior)
>    - In **Group mode**: show group cards. When a teacher clicks a group card, show a **group detail page** that lists the group's students, each with their own progress. The teacher picks a student from the group to start teaching, OR can "Teach Group Lesson" which opens the module page in group context.
>    - In **Both mode**: show student cards and group cards together
>
> ### What NOT to change
>
> - Logged-out / demo state — leave as-is
> - The onboarding wizard — leave as-is
> - The lesson detail page content — don't change lesson steps, aims, materials
> - Assessment recording — that's a different epic
>
> ### Design notes
>
> - The student module page should feel like a natural continuation of Start Teaching, not a separate section. Keep the same layout, header style, and color scheme.
> - "View lessons →" should be replaced with the context-aware CTA described above.
> - Every page in this flow should make it clear WHICH student the teacher is working with. Student name should be visible at all times.
> - When navigating back to Start Teaching, the student cards should reflect any progress made (e.g., if a lesson was marked complete).

---

## PM Decision Needed

**Group card click behavior:** The ticket has an open question. Two options prototyped above:
- **Option A (recommended for MVP):** Group card → group detail page showing students → teacher picks a student → enters that student's module. Simpler, reuses the student-centric flow.
- **Option B (future):** Group card → "Teach Group Lesson" mode where notes are logged for all students simultaneously. More complex, needs new data model.

The prompt above assumes Option A for now. If you prefer Option B, let me know and I'll revise.

---

## Sequencing Note

KAN-48 (student context on lesson page) is now included in this prompt — the teacher sees who they're teaching all the way through to the lesson detail page. This pulls the core of KAN-41's context banner forward into KAN-39.

After this is prototyped and reviewed in Lovable:
1. **KAN-40** (one-lesson-in-progress constraint) adds visual locking to the module list — locked lessons, active lesson highlight, completed indicators.
2. **KAN-41** (context banner) — the basic banner is now covered by KAN-48 above. KAN-41 can focus on the remaining polish: group context banner, switch-student action, and progress summary in the banner.

Ship one at a time in Lovable, review, then move to the next.
