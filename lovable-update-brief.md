# Lovable Update Brief — Sync with Current Padi Codebase

**Date:** February 26, 2026
**Purpose:** Update the Lovable prototype at `preview--read-spark-adventures.lovable.app` to match the current Next.js codebase.

---

## Summary of Differences

The Lovable prototype is broadly aligned on structure (nav, teacher dashboard tabs, phases flow, start teaching), but has notable divergences in content, layout, routing, and feature completeness compared to the shipped codebase. Below is a page-by-page breakdown.

---

## 1. Homepage (`/`)

### Layout Difference
- **Codebase:** Two-column hero — left side has badge + headline + subtext + CTA buttons; right side has a white card with "Everything You Need for Reading Success" containing a 2x2 grid of feature cards (Interactive Lessons, Teacher Tools, Targeted Support). Below is a full-width gradient CTA banner.
- **Lovable:** Single-column centered hero with badge, headline, subtext, CTAs. Feature cards are in a separate full-width section below as 3 standalone cards. CTA banner is a separate dark section at the bottom.

### Content Differences
| Element | Codebase | Lovable |
|---------|----------|---------|
| Headline | "Help Every Child **Love Reading**" | "Teach reading with Padi, **one student or group at a time**" |
| Subtext | "Structured, interactive reading lessons designed for struggling readers ages 3-5. Based on proven curriculum with AI-powered personalization." | "Diagnose, plan, and run evidence-based lessons without taking a separate training course." |
| CTA buttons | "Start Teaching" → `/teacher`, "Teacher Dashboard" → `/teacher/phases` | "Start Teaching" → `/start-teaching`, "Teacher Dashboard" → `/teacher` |
| Feature cards | 2x2 grid inside a white card on the right column | 3 standalone cards in separate row |
| CTA banner text | "Join teachers and parents helping children build confidence and reading skills" | "Join thousands of teachers helping children build confidence and reading skills" |
| Footer | None (handled by layout) | Dark footer with Padi logo + "© 2024 Padi" |

### Changes Needed
1. Change headline to: **"Help Every Child Love Reading"** with "Love Reading" in gradient text (blue-600 to purple-600)
2. Change subtext to: "Structured, interactive reading lessons designed for struggling readers ages 3-5. Based on proven curriculum with AI-powered personalization."
3. Restructure hero into **2-column layout** (md breakpoint): left column = badge + headline + subtext + CTAs; right column = white card containing feature grid
4. Move feature cards into the right-column card as a **2x2 grid** (not 3 separate full-width cards)
5. Update "Start Teaching" button to link to `/teacher` (not `/start-teaching`)
6. Update "Teacher Dashboard" button to link to `/teacher/phases`
7. Update CTA banner text to remove "thousands of" — just "Join teachers and parents..."
8. Update footer year from 2024 to 2026

---

## 2. Teacher Dashboard Layout (`/teacher/*`)

### Routing Difference (CRITICAL)
- **Codebase:** Tabs are **separate routes** — `/teacher/about`, `/teacher/phases`, `/teacher/assessments`, `/teacher/grouping`, `/teacher/resources`. Each is a real Next.js page.
- **Lovable:** Tabs are **client-side in-page tabs** that switch content within `/teacher`. No separate URLs.

**This is a structural decision that can stay as-is in Lovable** (in-page tabs are fine for a prototype), but note the Lovable tab navigation does NOT include icons — codebase tabs are plain text pills without icons too, so Lovable's icons are an addition.

### Header Differences
| Element | Codebase | Lovable |
|---------|----------|---------|
| "Teacher" label | Shows as blue uppercase label above title | Shows as blue badge next to "Padi" in nav |
| Auth status line | Shows "Preview mode — log in to unlock workspace features." with amber "Demo data" badge when logged out. Shows "Workspace tools enabled for this session." in green when logged in. | Not shown |
| Home button | Shows a "Home" button top-right of header | Not shown |

### Tab Style Differences
- **Codebase:** Plain text pills — `rounded-full border px-4 py-2 text-sm`. Active: blue-600 border, blue-50 bg, blue-700 text. No icons.
- **Lovable:** Tabs with icons (book icon for About Method, layers icon for Phases, etc.) and underline-style active indicator.

### Changes Needed
1. Add auth status line below subtitle: "Preview mode — log in to unlock workspace features." with amber "Demo data" badge (logged-out state)
2. Add "Home" link button in top-right of dashboard header
3. Remove icons from tab labels (codebase uses plain text only)
4. Change tab style to pill-style buttons: rounded-full, border, same active/inactive styling as codebase

---

## 3. About Method Tab (`/teacher/about`)

### Content Comparison
Both versions have the same core structure: overview paragraph, Core Concepts (Phonological Awareness, VAKT, MSLE, Montessori Alignment), Program Structure, and Outcomes. **Content is closely aligned.**

### Style Differences
- **Codebase:** Cards use `rounded-2xl border border-blue-100 bg-blue-50/30` styling. Has a "Daily Use Checklist" section at the bottom. Has outcome badges at the end.
- **Lovable:** Cards use similar blue-tinted styling. Missing the Daily Use Checklist.

### Changes Needed
1. Add **Daily Use Checklist** section at the bottom of About Method (from codebase: items include "Preview today's lesson", "Run the activity with students", "Record observations in notes", "Review and adjust grouping as needed")
2. Add **outcome badges** at very bottom showing the three program outcomes

---

## 4. Phases Tab

### Differences
- **Codebase:** Shows Phase 1, 2, 3 as **clickable cards** with title, month range, lesson range, and description. Includes a Teaching Mode Toggle (Individual/Group/Both) and Phase Tabs (Phase 1/2/3 as separate sub-tabs). Has "Program Outcomes" section below with 3 color-coded cards (green/yellow/orange).
- **Lovable:** Very similar — has Teaching Mode Toggle, Phase 1/2/3 tabs, Explore Phase card with "View Developmental Areas" button. Has Program Outcomes section. **Mostly aligned.**

### Content Differences
| Element | Codebase | Lovable |
|---------|----------|---------|
| Phase card | Shows title, description, months, lesson range | Shows "Explore Phase One" with "Months 1-3 \| Lessons 1-60" |
| Outcome cards | "Grade 1 ready" (green), "Group Literacy" (yellow), "1-on-1 SIS Program" (orange) with descriptions | "First Grade" (yellow), "Group Literacy" (green), "One-on-One SIS Program" (orange) |

### Changes Needed
1. Update outcome card titles: "First Grade" → "Grade 1 ready", keep "Group Literacy", "One-on-One SIS Program" stays
2. Update outcome card colors: Grade 1 ready = green, Group Literacy = yellow, SIS = orange (Lovable has these swapped)
3. Ensure Phase 2 and Phase 3 tabs show "Coming soon" placeholder content

---

## 5. Phase Detail → Developmental Areas

### Differences
- **Codebase:** Shows phase title, long description paragraph, then lists developmental areas as cards (Learning Sensorially, Rhyming, Words and Sentences, Syllables and Phonemes) with descriptions and module counts. Each has a link to view modules.
- **Lovable:** Shows "Phase 1: Phonological Awareness" title, long description, then developmental area cards. **Closely aligned.**

### Changes Needed
- Minor: Ensure the area descriptions match exactly with codebase content
- Ensure "Coming Soon" badges appear on Rhyming, Words and Sentences, Syllables and Phonemes

---

## 6. Module List (Learning Sensorially)

### Differences
- **Codebase:** Shows modules LS-1 through LS-13. LS-1 has "The Silence Game" as title and is clickable. LS-2 through LS-13 show as locked with lock icon and "Coming soon" text. Has Individual/Group badges on modules. Has phase context breadcrumb at top.
- **Lovable:** Very similar — LS-1 has "View Lesson" button, LS-2+ show "Coming Soon". **Closely aligned.**

### Changes Needed
1. Add **Individual/Group mode badges** to module cards (purple badge for Individual, blue badge for Group)
2. Ensure module titles match codebase (LS-2 through LS-13 should show "Module 2" through "Module 13" as subtitles)

---

## 7. Lesson Detail (LS-1: The Silence Game)

### Differences
- **Codebase:** Has colored section backgrounds — Materials (white), Aim (purple-50), Presentation (green-50 with numbered steps), Examples (gray-100 with 2-column layout), Extension Activities (amber-50). Also has a **Teacher Notes & Observations** form (only visible when logged in) with teacher ID, student selector, notes textarea, audio upload, and save button.
- **Lovable:** Has Materials, Aim, Presentation, Examples, Extension Activities all in blue-tinted cards. **Missing the Teacher Notes form entirely.** Missing colored section differentiation.

### Content — Both Match
Materials: "A quiet classroom"
Aim: "Sharpen listening skills", "Build attention span"
Presentation: 4 steps about the Silence Game
Examples: Sound list (Clock ticks, Footsteps, etc.) in 2 columns
Extension Activities: "Play in a different room or outdoors", "Use recordings..."

### Changes Needed
1. **Add colored section backgrounds** to differentiate lesson sections:
   - Materials: white/default
   - Aim: `bg-purple-50` with purple-800 text header
   - Presentation: `bg-green-50` with green-800 text header
   - Examples: `bg-gray-100`
   - Extension Activities: `bg-amber-50` with amber-800 text header
2. **Add Teacher Notes & Observations section** (below lesson content):
   - Show only when logged in (or show "Sign in to add notes" placeholder when logged out)
   - Fields: Teacher ID input, Student selector dropdown, Session notes textarea, Audio file upload button, Save button with gradient styling
3. Add "Back to Modules" breadcrumb navigation above lesson title

---

## 8. Assessments Tab

### Major Difference
- **Codebase:** Shows a **data table** with demo assessment data (when logged out). Columns: Student, Phase/Group, Focus Areas, Status. Has Teaching Mode Toggle. Shows "Individual Students" and "Group Students" sections. Demo data includes students like Maya, Aiden, Sofia with various statuses (Ready for review, In progress, Not started) and focus area tags.
- **Lovable:** Shows a **"Sign in to access"** message with description of what the feature does. No demo data shown.

### Changes Needed
1. **Add demo assessment table** for logged-out state (preview mode):
   - Show amber banner: "Read-only preview: sign in to record live assessment results."
   - Add Teaching Mode Toggle
   - Show "Individual Students" section with table rows:
     - Maya | Phase 1 | Learning Sensorially, Rhyming | Ready for review (green badge)
     - Aiden | Phase 1 | Learning Sensorially | In progress (blue badge)
     - Sofia | Phase 1 | Rhyming | Not started (gray badge)
   - Show "Group Students" section with rows:
     - Liam | Morning Readers | Rhyming | In progress (blue badge)
     - Zara | Morning Readers | Learning Sensorially | Ready for review (green badge)
   - Table grid: `grid-cols-[1.4fr_1fr_1fr_1fr]`
2. Keep the "Sign in to access" content as the logged-in empty state (when no students added yet)

---

## 9. Grouping & Progress Tab

### Major Difference
- **Codebase:** Shows **demo group and student cards** when logged out. Shows "Example Group (Morning Readers)" with student count, phase, focus area, progress bar. Shows individual student cards with similar data. Has Teaching Mode Toggle.
- **Lovable:** Shows a **"Sign in to access"** message similar to Assessments. No demo data.

### Changes Needed
1. **Add demo grouping view** for logged-out state:
   - Show Teaching Mode Toggle
   - Show demo group card: "Morning Readers" — Phase 1, 5 students, Rhyming focus, progress bar
   - Show demo individual student cards when in Individual mode
   - Show amber "Demo data" indicator
2. Keep sign-in prompt as the logged-in empty state

---

## 10. Resources Tab

### Significant Difference
- **Codebase:** Shows 3 simple resource cards in a row: "Printable Silence Game instructions", "Classroom setup checklist", "Parent communication template". Each has a description and "View resource →" link. All link to `#` (coming soon).
- **Lovable:** Shows 4 resource cards in a 2x2 grid: "MSLE Activity Guides", "Printable Worksheets", "Assessment Templates", "Upload Content". Each has a prominent download/action button.

### Changes Needed
1. **Replace Lovable resources** with codebase versions:
   - Card 1: "Printable Silence Game instructions" — "Quick one-pager to run LS1 offline." — "View resource →"
   - Card 2: "Classroom setup checklist" — "Prepare your space for multisensory lessons." — "View resource →"
   - Card 3: "Parent communication template" — "Share progress updates with families." — "View resource →"
2. Change layout from 2x2 grid to **3-column row** (`md:grid-cols-3`)
3. Remove download buttons — replace with simple text links
4. Remove "Upload Content" card entirely (not in codebase)

---

## 11. Start Teaching Page (`/start-teaching` or `/teacher`)

### Routing
- **Codebase:** Start Teaching lives at `/teacher` (the root teacher page). `/start-teaching` redirects to `/teacher`.
- **Lovable:** Start Teaching lives at `/start-teaching`.

### Content Comparison
Both show Teaching Mode Toggle (Individual/Group/Both), "Add Students" and "Add Groups" buttons, and demo data cards. **Closely aligned.**

### Differences
| Element | Codebase | Lovable |
|---------|----------|---------|
| Title | "Start Teaching" | "Start Teaching" |
| Subtitle | "Explore example cards below, or sign in to manage your own students" | "Explore example cards below, or sign in to manage your own students" |
| Demo student | "Example Student (Maya)" with Demo + Student badges, Phase 1, Learning Sensorially focus, progress bar | Same |
| Demo group | "Example Group (Morning Readers)" with Demo + Group badges, Phase 1, 5 students, Rhyming focus | Same |
| "View lessons" button | Shows on demo cards | Not visible on demo cards |

### Changes Needed
1. Add **"View lessons →"** button to demo student and group cards
2. Ensure clicking demo cards navigates to the lesson flow (Phases → Learning Sensorially → LS-1)

---

## 12. Navigation Bar (TopNav)

### Differences
- **Codebase:** Padi logo (blue book icon + "Padi" text), "Teacher Dashboard" button (with highlight ring when on teacher pages), "Start Teaching" gradient button, "Sign In" button. When logged in: shows "Logged in as [email]" + "Sign out" link.
- **Lovable:** Same structure. Shows "Teacher" badge next to Padi when on teacher pages.

### Changes Needed
1. Remove "Teacher" badge from nav — the codebase doesn't show this badge in the TopNav (it shows it in the dashboard header area instead)
2. Ensure "Teacher Dashboard" button gets a highlight ring (`ring-2 ring-blue-200`) when on `/teacher/*` pages

---

## 13. Sign-In Modal

### Differences
- **Codebase:** Modal with email/password fields, Sign In button, Sign Up tab, error handling. Uses Supabase auth.
- **Lovable:** Unknown (didn't test sign-in flow).

### Changes Needed
- Ensure sign-in modal exists with email + password fields and both Sign In / Sign Up modes

---

## 14. Missing Routes in Lovable

These routes exist in the codebase but return 404 in Lovable:
- `/library` — Module library page with search and domain/section filters
- `/teacher/phases` (as a direct URL) — works as in-page tab but not as a route
- `/students` — Legacy student management page

**Recommendation:** The `/library` page is a secondary feature. Don't add it now unless needed. Focus on the teacher dashboard and start teaching flows.

---

## Priority Order for Updates

### P0 — Must Fix (core experience mismatches)
1. **Assessments tab:** Add demo data table instead of "sign in" message
2. **Grouping tab:** Add demo data cards instead of "sign in" message
3. **Resources tab:** Replace with codebase's 3 simple resource cards
4. **Lesson detail colors:** Add colored section backgrounds (purple/green/amber)

### P1 — Should Fix (content accuracy)
5. **Homepage:** Update headline, subtext, and layout to 2-column
6. **Teacher Notes form:** Add to lesson detail page
7. **Outcome card colors:** Fix the green/yellow/orange assignment
8. **Dashboard auth status line:** Add preview mode indicator

### P2 — Nice to Have (polish)
9. Tab styling: Remove icons, switch to pill-style buttons
10. Navigation: Remove "Teacher" badge from TopNav
11. Footer: Update copyright year
12. Demo card "View lessons" button on Start Teaching

---

## Styling Reference (from codebase)

```
Background: bg-gray-50
Cards: bg-white rounded-2xl shadow-sm border border-gray-100 p-4
Buttons: rounded-xl border px-4 py-2 text-sm
Primary button: bg-blue-600 text-white hover:bg-blue-700
Tab pills: rounded-full border px-4 py-2 text-sm
Active tab: border-blue-600 bg-blue-50 text-blue-700 font-semibold
Gradient: bg-gradient-to-r from-blue-600 to-purple-600
Status badges: rounded-full px-3 py-1 text-xs font-semibold
  - Green: bg-green-100 text-green-800
  - Blue: bg-blue-100 text-blue-800
  - Gray: bg-gray-100 text-gray-700
  - Amber: bg-amber-100 text-amber-800
Demo indicator: rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800
```
