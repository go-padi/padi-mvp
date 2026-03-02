# Lovable Updates — Paste Each One Separately

Paste these into Lovable one at a time, in order. Wait for each to complete before pasting the next.

---

## Update 1 of 7: Assessments Tab — Add Demo Data Table

Replace the current Assessments tab content. Right now it shows "Student Assessments — Sign in to access your assessment workspace" with a bullet list. Replace ALL of that with a demo assessment data table.

Here is the exact content to show:

**Header area:**
- Title: "Assessments"
- Subtitle: "Preview how assessment tracking will look once you log in."
- Next to subtitle, show an amber badge: "Demo data" (background: amber-100, text: amber-800, rounded-full, text size 11px, font-semibold)
- Include the existing Teaching Mode Toggle (Individual / Group / Both) on the right side of the header

**Below header, add an amber banner:**
- Rounded-xl, border border-amber-200, bg-amber-50, px-4 py-3, text-xs text-amber-800
- Text: "Read-only preview: sign in to record live assessment results."

**Then show an "Individual Students" section** with a table. Table has 4 columns: Student, Phase, Focus Areas, Status. Column widths: 1.4fr 1fr 1fr 1fr. Header row has uppercase text-xs font-semibold tracking-wide text-gray-500.

Individual students (students with no group — these are Diego R. and Nia S.):

| Student | Phase | Focus Areas | Status |
|---------|-------|-------------|--------|
| Diego R. (subtitle: "Phase 1 • 7/36 lessons") | Phase 1 | Sound ID, Attention (as gray rounded-full tags) | In progress (blue-100 bg, blue-800 text badge) |
| Nia S. (subtitle: "Phase 1 • 10/36 lessons") | Phase 1 | Listening, Sequencing (as gray rounded-full tags) | Screening (blue-100 bg, blue-800 text badge) |

**Then show a "Group Students" section** with the same table layout but the second column shows Group name instead of Phase:

| Student | Group | Focus Areas | Status |
|---------|-------|-------------|--------|
| Maya P. (subtitle: "Phase 1 • 12/36 lessons") | Group A | Listening, Rhyming | In progress (blue badge) |
| Ava C. (subtitle: "Phase 1 • 16/36 lessons") | Group A | Rhyming, Blending | In progress (blue badge) |
| Eli J. (subtitle: "Phase 1 • 22/36 lessons") | Group A | Blending, Memory | Ready for review (green-100 bg, green-800 text badge) |
| Sam T. (subtitle: "Phase 1 • 8/36 lessons") | Group B | Sound ID, Attention | In progress (blue badge) |
| Leo M. (subtitle: "Phase 1 • 19/36 lessons") | Group C | Syllables, Focus | In progress (blue badge) |
| Priya K. (subtitle: "Phase 1 • 14/36 lessons") | Group C | Rhyming, Listening | In progress (blue badge) |
| Jonah L. (subtitle: "Phase 1 • 17/36 lessons") | Group C | Syllables, Memory | In progress (blue badge) |

**Status badge styling:**
- "In progress": bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold
- "Ready for review": bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold
- "Screening": bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold
- "Not started": bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold

**Focus area tags:** bg-gray-100 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700

**Teaching mode behavior:**
- When "Individual" is selected: only show the Individual Students section
- When "Group" is selected: only show the Group Students section
- When "Both" is selected: show both sections

The table container should be: overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm. Each row is separated by divide-y divide-gray-100.

---

## Update 2 of 7: Grouping Tab — Add Demo Data Cards

Replace the current Grouping & Progress tab content. Right now it shows "Grouping & Progress Tracking — Sign in to access your grouping workspace" with a bullet list. Replace ALL of that with demo group and student cards.

**Header area:**
- Title: "Grouping & Progress"
- Subtitle: "Preview how groups and student progress will look once you log in."
- Amber "Demo data" badge next to subtitle (same styling as Assessments tab: bg-amber-100 text-amber-800 rounded-full text-[11px] font-semibold)
- Teaching Mode Toggle on the right

**Amber banner below header:**
- Text: "Read-only preview: sign in to see live grouping and progress"
- Same styling as Assessments: rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800

**When "Group" or "Both" mode, show "Groups" section:**

Title: "Groups" with subtitle: "Recommended groupings with focus areas and average progress."

Show 3 group cards in a 3-column grid (md:grid-cols-3). Each card is rounded-2xl border border-gray-100 bg-white p-5 shadow-sm:

**Group A:**
- Name: "Group A" | Phase 1
- Status badge: "In progress" (bg-blue-50 text-blue-700)
- Focus: "Learning Sensorially"
- Progress: "Avg 17/36 lessons" | 46%
- Tags: "Listening", "Rhyming" (gray rounded-full tags)

**Group B:**
- Name: "Group B" | Phase 1
- Status: "In progress" (bg-blue-50 text-blue-700)
- Focus: "Sound Awareness"
- Progress: "Avg 8/36 lessons" | 22%
- Tags: "Sound ID", "Attention"

**Group C:**
- Name: "Group C" | Phase 1
- Status: "In progress" (bg-blue-50 text-blue-700)
- Focus: "Syllables & Blending"
- Progress: "Avg 16/36 lessons" | 46%
- Tags: "Syllables", "Fluency"

**When "Individual" or "Both" mode, show "Individual Students" section:**

Title: "Individual Students" with subtitle: "Students not currently assigned to a group."

Show 2 student cards in a grid. Each card is rounded-xl border border-gray-100 bg-white p-4 shadow-sm:

**Diego R.:**
- Name: "Diego R." with "Individual" badge (bg-purple-50 text-purple-700 rounded-full)
- Progress: "7/36 lessons"
- Tags: "Sound ID", "Attention"

**Nia S.:**
- Name: "Nia S." with "Individual" badge
- Progress: "10/36 lessons"
- Tags: "Listening", "Sequencing"

**When "Both" mode, also show "Grouped Students" section:**

Title: "Grouped Students" with subtitle: "Students organized by their current group."

For each group, show a card containing the group name and its students nested inside:

**Group A** (3 students: Maya P., Ava C., Eli J.) — each student card shows name, group badge (bg-blue-50 text-blue-700), progress label, and focus area tags.

**Group B** (1 student: Sam T.)

**Group C** (3 students: Leo M., Priya K., Jonah L.)

---

## Update 3 of 7: Resources Tab — Replace with Useful Resource Cards

Replace the current Resources tab content entirely. Remove the 4-card grid with "MSLE Activity Guides", "Printable Worksheets", "Assessment Templates", and "Upload Content" with their download buttons.

Replace with:

**Header:**
- Title: "Teaching Resources"
- Subtitle: "Access materials to support the Padi multisensory method."

**3 cards in a 2-column grid** (md:grid-cols-2). Each card: rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3.

---

**Card 1: "Print Module Cards"**
- Icon: printer icon (top left, in a rounded-xl bg-blue-50 icon container)
- Title: "Print Module Cards" (text-lg font-semibold text-gray-900)
- Description: "Print step-by-step lesson cards for any module. Select a phase, developmental area, and module to generate a printable card." (text-sm text-gray-700)

Below the description, add a **cascading dropdown picker** with 3 levels:

**Dropdown 1 — "Select Phase":**
Options:
- Phase 1: Phonological Awareness (Months 1-3)
- Phase 2: Coming Soon (disabled/grayed out)
- Phase 3: Coming Soon (disabled/grayed out)

**Dropdown 2 — "Select Developmental Area"** (appears after Phase is selected):
When Phase 1 is selected, show these options:
- Learning Sensorially (13 modules) — Group
- Rhyming (10 modules) — Group — Coming Soon (disabled)
- Words and Sentences (10 modules) — Group — Coming Soon (disabled)
- Syllables (10 modules) — Group — Coming Soon (disabled)
- Phonemic Awareness (10 modules) — Group — Coming Soon (disabled)
- Sound Awareness (10 modules) — Individual
- Individual Rhyme Practice (6 modules) — Individual — Coming Soon (disabled)

**Dropdown 3 — "Select Module"** (appears after Developmental Area is selected):
When "Learning Sensorially" is selected, show:
- LS-1: The Silence Game (available — clickable)
- LS-2: Module 2 (Coming Soon — disabled)
- LS-3: Module 3 (Coming Soon — disabled)
- LS-4: Module 4 (Coming Soon — disabled)
- LS-5: Module 5 (Coming Soon — disabled)
- LS-6: Module 6 (Coming Soon — disabled)
- LS-7: Module 7 (Coming Soon — disabled)
- LS-8: Module 8 (Coming Soon — disabled)
- LS-9: Module 9 (Coming Soon — disabled)
- LS-10: Module 10 (Coming Soon — disabled)
- LS-11: Module 11 (Coming Soon — disabled)
- LS-12: Module 12 (Coming Soon — disabled)
- LS-13: Module 13 (Coming Soon — disabled)

When "Sound Awareness" (Individual) is selected, show:
- SA-1: Lesson 1 (available — clickable)
- SA-2: Lesson 2 (Coming Soon — disabled)
- (through SA-10)

**After selecting a module**, show a "Print Module Card" button (rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700, full width). For now this button doesn't need to actually print — just show it as the action. If the module is "Coming Soon," show the button as disabled with text "Not yet available."

Dropdown styling: Each dropdown should be rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm. Disabled options should be text-gray-400 with "Coming Soon" label.

---

**Card 2: "Classroom Setup Checklist"**
- Icon: clipboard/checklist icon (top left, in rounded-xl bg-green-50 icon container)
- Title: "Classroom setup checklist" (text-lg font-semibold text-gray-900)
- Description: "Prepare your space for multisensory lessons." (text-sm text-gray-700)
- Link: "View resource →" (text-sm font-semibold text-blue-700, links to # for now)

---

**Card 3: "Parent Communication Template"**
- Icon: mail/letter icon (top left, in rounded-xl bg-purple-50 icon container)
- Title: "Parent communication template" (text-lg font-semibold text-gray-900)
- Description: "Share progress updates with families." (text-sm text-gray-700)
- Link: "View resource →" (text-sm font-semibold text-blue-700, links to # for now)

---

No "Upload Content" card. No "Assessment Templates" card. No "MSLE Activity Guides" card. Remove all existing download buttons. The Print Module Cards picker is the primary interactive element on this tab.

---

## Update 4 of 7: Fix Outcome Card Colors on Phases Tab

In the Phases tab, under "Program Outcomes" section, there are 3 cards showing what happens after completing all three phases. Fix the border/accent colors:

**"First Grade" card** (currently yellow border) → Change to **green** border/accent. This is the best outcome — "Students ready for mainstream Grade 1 curriculum."

**"Group Literacy" card** (currently green border) → Change to **yellow** border/accent. This means "Students needing continued small-group support."

**"One-on-One SIS Program" card** (currently orange border, this is correct) → Keep **orange**. This means "Students requiring individualized intervention."

The color logic: green = on track, yellow = needs support, orange = needs intervention. This aligns with the assessment signal framework.

Also rename "First Grade" to "Grade 1 ready" to match the codebase.

---

## Update 5 of 7: Add Colored Section Backgrounds to Lesson Detail

On the Module LS-1 lesson detail page ("The Silence Game"), the sections (Materials, Aim, Presentation, Examples, Extension Activities) are all in the same blue-tinted cards. Change each section to have a distinct background color:

**Materials section:** Keep default white/light background. No change needed.

**Aim section:** Change background to `bg-purple-50` (light purple). Section title color: text-purple-800 font-semibold.

**Presentation section:** Change background to `bg-green-50` (light green). Section title color: text-green-800 font-semibold. Keep the numbered steps as-is.

**Examples section** ("Examples of sounds students might identify"): Change background to `bg-gray-100`. Keep the 2-column layout of sounds.

**Extension Activities section:** Change background to `bg-amber-50` (light amber/yellow). Section title color: text-amber-800 font-semibold.

Each section card should keep its rounded corners and padding. The different colors help teachers quickly scan and find the section they need during a live lesson.

**Also add a placeholder at the bottom of the lesson page:**
Add a new card below Extension Activities with:
- Title: "Teacher Notes & Observations"
- Text: "Sign in to add lesson notes, record audio observations, and track student progress for this module." (text-sm text-gray-600, italic)
- A disabled/grayed-out button: "Sign in to add notes" (rounded-xl border border-gray-200 bg-gray-50 text-gray-400 px-4 py-2 text-sm, cursor not allowed)

---

## Update 6 of 7: Update Homepage Headline and Layout

Change the homepage hero section from single-column centered layout to a **2-column layout**.

**Left column** (slightly wider, about 55% width):
- Keep the "AI-Enhanced Reading Support" badge at the top
- Change headline from "Teach reading with Padi, one student or group at a time" to: **"Help Every Child Love Reading"** — where "Love Reading" is styled with a gradient text effect (bg-gradient-to-r from-blue-600 to-purple-600, bg-clip-text, text-transparent)
- Change subtitle from "Diagnose, plan, and run evidence-based lessons without taking a separate training course." to: **"Structured, interactive reading lessons designed for struggling readers ages 3-5. Based on proven curriculum with AI-powered personalization."**
- Keep the two CTA buttons: "Start Teaching" (purple/primary) and "Teacher Dashboard" (outline)
- Change "Start Teaching" button to link to `/teacher` instead of `/start-teaching`
- Change "Teacher Dashboard" button to link to `/teacher/phases` instead of `/teacher`

**Right column** (about 45% width):
- Add a white card with subtle shadow (bg-white/80 rounded-2xl p-6 shadow-lg ring-1 ring-blue-100)
- Card title: "Everything You Need for Reading Success" (text-lg font-semibold)
- Card subtitle: "Comprehensive tools and resources designed specifically for early reading intervention." (text-sm text-gray-600)
- Inside the card, show the 3 feature cards (Interactive Lessons, Teacher Tools, Targeted Support) in a **2-column grid** (not the current 3-column full-width row)
- Each feature card: rounded-2xl border border-gray-100 bg-white p-4 shadow-sm

Move the "Everything You Need for Reading Success" section out of the separate full-width area and into this right-column card.

**CTA banner at the bottom:**
- Change text from "Join thousands of teachers helping children build confidence and reading skills" to: **"Join teachers and parents helping children build confidence and reading skills"** (remove "thousands of")

**Footer:**
- Update copyright from "© 2024 Padi" to "© 2026 Padi"

---

## Update 7 of 7: Fix Login Button on Start Teaching Page

On the Start Teaching page, at the bottom there is a section that prompts users to log in. The "Log in" or login-related button/link needs to actually trigger the sign-in modal or navigate to the sign-in flow.

Currently (per bug KAN-26), the login button at the bottom of Start Teaching does not actually direct the user to log in. Fix this so that:

1. The "Log in to unlock" button (or equivalent CTA at the bottom of Start Teaching) opens the sign-in modal
2. The "Add Students" and "Add Groups" buttons, when clicked in logged-out state, should also trigger the sign-in modal (since you need to be logged in to add students)

If the sign-in modal doesn't exist yet in Lovable, create a simple one:
- Modal overlay (fixed inset-0 bg-black/40)
- White card centered (max-w-md rounded-2xl bg-white shadow-2xl p-6)
- Title: "Sign in to Padi"
- Email field (text input)
- Password field (password input)
- "Sign In" button (primary, full width)
- "Sign Up" tab/toggle at the top to switch between sign in and sign up modes
- Close button (X) in top right corner
- Escape key closes the modal

This doesn't need to connect to a real auth backend — just the UI flow so we can test the experience.
