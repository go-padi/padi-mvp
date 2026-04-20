# Lovable Prototype Brief: Phase-Less Curriculum Navigation

## What We're Prototyping

A flattened curriculum navigation that removes the "Phase" layer entirely. Teachers go directly from a list of lesson groups to modules to the lesson detail — no intermediate phase selection. This reduces navigation from 4 levels to 2 levels (group → module), with a curriculum landing page as the entry point.

We're also prototyping how Start Teaching connects to this flat curriculum after onboarding.

## Why

The curriculum PDFs organize content into 16 concurrent lesson groups (Learning Sensorially, Rhyming, Words & Sentences, etc.) — NOT sequential phases. The current app invented a phase layer that doesn't exist in the source material. Removing it simplifies the teacher journey and matches how the curriculum actually works.

---

## Screens to Build

### Screen 1: Curriculum Landing — `/teacher/curriculum/`

**What it shows:** A flat list of all 16 lesson groups, with a Group/Individual toggle at the top.

**Layout:**
- Top bar: "K-Reading Kickstart Curriculum" heading + TeachingModeToggle (pill-shaped toggle with three options: Individual 👤, Group 👥, Both ▦)
- Below heading: Brief description text — "Select a lesson group to explore its modules and lesson guides"
- Main content: Vertical stack of group cards

**TeachingModeToggle behavior:**
- "Group" selected → show only Group-mode groups (16 groups)
- "Individual" selected → show only Individual-mode groups (16 groups)
- "Both" selected → show both sections with subheadings "Group Curriculum" and "Individual Curriculum"

**Group Card design (port from existing):**
Each card is a rounded-2xl white card with border-gray-100, containing:
- Left side:
  - Group title (text-sm font-semibold, e.g. "Learning Sensorially")
  - Teaching mode badge: blue pill "Group" or purple pill "Individual" (only show in "Both" mode)
  - Lock icon 🔒 if `is_locked: true`
  - Description line (text-xs text-gray-600, e.g. "Sharpen listening skills and auditory discrimination")
  - Module count (text-xs, e.g. "11 modules available")
- Right side:
  - CTA button: "View Modules →" (rounded-xl border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white)
  - If locked: "Coming Soon" (border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50)

**Logged-out state:**
- Show an amber banner at top: "Preview mode: log in to unlock editable lessons and saved progress."
- Show all groups but mark most as locked (only LS group unlocked for preview)

**Sample data for prototype (Group mode, first 5 groups):**

| Group Title | Code | Module Count | Locked? |
|-------------|------|-------------|---------|
| Learning Sensorially | K_LS | 11 | No |
| Rhyming | K_RMG | 19 | No |
| Words & Sentences | K_WS | 9 | No |
| Syllables | K_SYL | 17 | No |
| Initial Sounds | K_IS | 17 | No |
| Final Sounds | K_FS | 7 | No |
| Medial Sounds | K_MS | 2 | No |
| Combining Sounds | K_CS | 6 | No |
| Alphabet | K_AL | 22 | No |
| Phonics | K_P | 7 | No |
| Reading | K_R | 8 | No |
| Reading Exercises | K_RE | 9 | No |
| Handwriting | K_HW | 11 | No |
| Spelling | K_S | 9 | No |
| Spelling Exercises | K_SE | 9 | No |
| Vocab/Comp/Fluency | K_VCF | 9 | No |

**Group descriptions (use these in the prototype):**
- Learning Sensorially — "Sharpen listening skills and auditory discrimination"
- Rhyming — "Develop rhyming discrimination and production"
- Words & Sentences — "Build word and sentence awareness"
- Syllables — "Clap, segment, and blend syllables"
- Initial Sounds — "Identify and isolate beginning sounds in words"
- Final Sounds — "Identify and isolate ending sounds in words"
- Medial Sounds — "Identify and isolate middle sounds in words"
- Combining Sounds — "Blend individual sounds into words"
- Alphabet — "Learn letter names, shapes, and formations"
- Phonics — "Connect letters to their sounds"
- Reading — "Apply decoding skills to connected text"
- Reading Exercises — "Practice reading with guided exercises"
- Handwriting — "Develop letter formation and writing skills"
- Spelling — "Encode words using sound-letter knowledge"
- Spelling Exercises — "Practice spelling with guided exercises"
- Vocab/Comp/Fluency — "Build vocabulary, comprehension, and reading fluency"

---

### Screen 2: Group Detail (Module List) — `/teacher/curriculum/[group]/`

**What it shows:** All modules within a selected lesson group, sorted by display_order.

**Layout:**
- Breadcrumb: "← Back to Curriculum" link (goes to /teacher/curriculum)
- Group header card (rounded-2xl border-blue-100 bg-white p-5):
  - Group title (text-2xl font-semibold)
  - Group description text
- "Modules" subheading with text: "Select a module to view its complete lesson guide"
- Vertical stack of module cards

**Module Card design (port from existing area page):**
Each card is rounded-2xl border p-4, containing:
- Left side:
  - Module code as title (text-sm font-semibold, e.g. "LS1" or "Module LS-1")
  - Full title below (text-xs text-gray-600, e.g. "The Silence Game")
  - Summary line (text-xs text-gray-600, e.g. "Sharpen listening skills with intentional silence and sound awareness.")
  - Teaching mode badge (only in "Both" mode)
  - Lock icon if locked
- Right side:
  - "View Lesson →" button (same style as group cards)
  - If locked: "Coming Soon"
- First module in list gets a highlight: border-blue-300 bg-blue-50

**Sample data (Learning Sensorially group, first 5 of 11 modules):**

| Code | Title | Summary |
|------|-------|---------|
| LS-1 | The Silence Game | Sharpen listening skills with intentional silence and sound awareness. |
| LS-2 | Sound Identification | Identify and name common environmental sounds. |
| LS-3 | Sound Location | Determine where sounds come from in the environment. |
| LS-4 | Sound Matching | Match identical sounds from different sources. |
| LS-5 | Sound Discrimination | Distinguish between similar and different sounds. |

(For the prototype, generate plausible titles/summaries for all 11 LS modules.)

---

### Screen 3: Lesson Detail — `/teacher/curriculum/[group]/[module]`

**What it shows:** The full lesson guide for a single module, plus teacher notes/observation form.

**Layout (port from existing module page):**

**Nav bar** (rounded-2xl border-gray-100 bg-white p-4):
- Left: Home icon 🏠 (links to /teacher) + "← Back to Modules" (links to group page)
- Right: TeachingModeToggle (disabled) + module code badge (text-xs text-gray-500)

**Module header:**
- Title: "Module LS1" (text-3xl font-semibold) + teaching mode badge
- Summary line below

**Lesson content sections** (each in its own colored card):

1. **Materials** (border-gray-100 bg-white) — bulleted list
2. **Aim** (border-purple-100 bg-purple-50) — bulleted list of learning objectives
3. **Presentation** (border-green-100 bg-green-50) — numbered steps
   - Within this: **Examples** sub-card (bg-white/80 border-green-100) — two-column list
4. **Extension Activities** (border-amber-100 bg-amber-50) — bulleted list

**Teacher Notes section** (border-gray-100 bg-white, only when logged in):
- "Teacher Notes & Observations" heading
- Student dropdown (select from enrolled students)
- Textarea for session notes
- Audio upload input (optional)
- "Save Notes & Continue" button (gradient blue-to-purple)

**Logged-out state:**
- Show lesson content (read-only)
- Instead of notes form, show: "Workspace preview — This is a read-only preview of the lesson. Sign in to record notes, attach audio, and personalize lessons for your students and groups."
- Link: "Return to curriculum →" (not "Return to phases")

**Use this real lesson data for LS-1:**
- Materials: "A quiet classroom"
- Aims: "Sharpen the students' listening skills", "Develop good attention span", "Build auditory discrimination"
- Presentation steps:
  1. "Tell the students that they are going to play a game called Silence Game."
  2. "Ask each of them to close their eyes and listen to the sounds in the room, outside the room, and within themselves."
  3. "Set a timer for 2 minutes."
  4. "After 2 minutes of listening quietly, ask them to share what they heard."
- Examples: "Clock ticks", "Voices", "Footsteps", "Animals", "Coughing", "Faucet", "Flush", "Cars", "Breathing", "Air conditioner"
- Extension: "Play the game in a different room or outdoors.", "Use recordings of birds or other animals and ask students to guess the animal."

---

### Screen 4: Start Teaching Integration

**Current flow:** Start Teaching wizard (Add Students → Create Groups) → redirects to... phases page (broken with this change).

**New flow:** Start Teaching wizard (Add Students → Create Groups) → redirects to `/teacher/curriculum/`

**What changes in the wizard:**
- Remove `phase: 'Phase 1'` from the student insert (no phase field needed)
- The "Done — Start Teaching →" button at the end of Step 2 should navigate to `/teacher/curriculum/`
- The wizard itself doesn't change visually — it's still 2 steps (Add Students, Create Groups)

**For the prototype:**
- Build the wizard as-is (2 steps: add students with first/last name, create groups with student checkboxes)
- After completion, navigate to the curriculum landing page
- On the curriculum landing page, show a success banner: "Classroom set up! Start by selecting a lesson group below."

---

## Global Components

### TopNav
- Logo "P Padi" on left
- "Teacher Dashboard" button
- "Start Teaching" gradient button (blue-to-purple)
- "Sign In" button (when logged out) / "Logged in as email" + "Sign out" (when logged in)

### TeachingModeToggle
- Pill-shaped toggle with 3 options: Individual 👤 | Group 👥 | Both ▦
- Active state: bg-gray-900 text-white with shadow
- Inactive: text-gray-700
- Appears on curriculum landing and group detail pages

---

## Design Constraints

- **Mobile-first**: Teachers are primarily on phones. All cards should stack vertically, full-width on mobile.
- **Color palette**: White cards, gray-100 borders, blue-600 for primary actions, purple for individual mode, amber for extensions, green for presentation steps.
- **Typography**: text-3xl for page titles, text-2xl for section titles, text-lg for card headings, text-sm for body, text-xs for metadata.
- **Border radius**: rounded-2xl for cards, rounded-xl for buttons, rounded-full for pills/badges.
- **No phase references anywhere** — the word "phase" should not appear in any UI copy.

## States to Show

For each screen, prototype these states:
1. **Logged in, data loaded** (primary)
2. **Logged out / preview mode** (amber banner, locked modules, no notes form)
3. **Empty state** (e.g. "Curriculum coming soon" if no groups load)

---

## What We're NOT Building

- Assessment flow (separate ticket KAN-62)
- Student detail / progress tracking pages
- Actual Supabase integration (this is a visual prototype)
- PDF content extraction
- Parent-facing views

## Success Criteria

After reviewing the prototype, we should be able to answer:
1. Does the flat group list feel navigable without phases?
2. Is 16 groups too many to show at once, or is the toggle sufficient?
3. Does the wizard → curriculum flow feel natural?
4. Is the lesson detail page clear enough for a teacher to teach from on a phone?
