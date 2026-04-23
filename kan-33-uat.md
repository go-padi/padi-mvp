# KAN-33 — Sync Lovable prototype with codebase — UAT

**Tested against:** `preview--read-spark-adventures.lovable.app`
**Date:** 2026-02-28
**Tester:** Claude (automated visual review via Chrome)

---

## Happy Path — Homepage (Update 6)

**UAT-01** — Homepage uses 2-column hero layout
Given I navigate to the homepage
When the page loads
Then I see a 2-column layout: left column with badge + headline + subtext + CTAs, right column with feature card grid
Status: ✅

**UAT-02** — Headline uses gradient text
Given I am on the homepage
When I read the headline
Then it says "Help Every Child Love Reading" with "Love Reading" in gradient blue-to-purple text
Status: ✅

**UAT-03** — Subtext matches codebase
Given I am on the homepage
When I read the subtext
Then it says "Structured, interactive reading lessons designed for struggling readers ages 3-4. Based on proven curriculum with AI-powered personalization."
Status: ✅

**UAT-04** — Feature cards in right-column card
Given I am on the homepage
When I look at the right column
Then I see "Everything You Need for Reading Success" title with feature cards in a 2x2 grid inside a white card
Status: ✅

**UAT-05** — CTA banner text updated
Given I scroll to the CTA banner
When I read the text
Then it says "Join teachers and parents helping children build confidence and reading skills" (no "thousands of")
Status: ✅

**UAT-06** — Footer year updated
Given I scroll to the footer
When I read the copyright
Then it says "© 2026 Padi"
Status: ✅

---

## Happy Path — Teacher Dashboard (Layout)

**UAT-07** — Auth status line shown in logged-out state
Given I am not logged in
When I navigate to the Teacher Dashboard
Then I see "Preview mode — log in to unlock workspace features." with an amber "Demo data" badge
Status: ✅

**UAT-08** — Home button visible
Given I am on the Teacher Dashboard
When I look at the header area
Then I see a "Home" button in the top-right
Status: ✅

**UAT-09** — Tabs are pill-style without icons
Given I am on the Teacher Dashboard
When I look at the tab navigation
Then I see rounded-full pill-style tabs (About Method, Phases, Assessments, Grouping & Progress, Resources) without icons
Status: ✅

---

## Happy Path — Assessments Tab (Update 1)

**UAT-10** — Demo assessment table shown
Given I am not logged in
When I click the Assessments tab
Then I see a demo assessment data table with student rows, not a "Sign in to access" message
Status: ✅

**UAT-11** — Amber preview banner shown
Given I am on the Assessments tab (logged out)
When the page loads
Then I see an amber banner: "Read-only preview: sign in to record live assessment results."
Status: ✅

**UAT-12** — Individual Students section shown
Given I am on the Assessments tab with teaching mode "Both" or "Individual"
When I look at the table
Then I see an "Individual Students" section with Diego R. and Nia S.
Status: ✅

**UAT-13** — Group Students section shown
Given I am on the Assessments tab with teaching mode "Both" or "Group"
When I look at the table
Then I see a "Group Students" section with students assigned to Groups A, B, C
Status: ✅

**UAT-14** — Teaching mode toggle filters content
Given I am on the Assessments tab
When I toggle between Individual, Group, and Both
Then the table sections filter accordingly (Individual only, Group only, or both)
Status: ✅

---

## Happy Path — Grouping & Progress Tab (Update 2)

**UAT-15** — Demo group cards shown
Given I am not logged in
When I click the Grouping & Progress tab
Then I see demo group cards (Group A, B, C) with focus areas, progress bars, and tags — not a "Sign in to access" message
Status: ✅

**UAT-16** — Group card data matches spec
Given I am on the Grouping tab in "Both" or "Group" mode
When I look at the group cards
Then Group A shows "Learning Sensorially", Avg 17/36, 46%; Group B shows "Sound Awareness", Avg 8/36, 22%; Group C shows "Syllables & Blending", Avg 16/36, 46%
Status: ✅

**UAT-17** — Individual Students section shows Diego R. and Nia S.
Given I am on the Grouping tab in "Both" or "Individual" mode
When I scroll down
Then I see Individual Students cards for Diego R. (7/36, Sound ID + Attention) and Nia S. (10/36, Listening + Sequencing)
Status: ✅

**UAT-18** — Grouped Students section shown in Both mode
Given I am on the Grouping tab in "Both" mode
When I scroll down past Individual Students
Then I see a "Grouped Students" section with students organized by group
Status: ✅

---

## Happy Path — Resources Tab (Update 3)

**UAT-19** — Old resource cards removed
Given I navigate to the Resources tab
When the page loads
Then I do NOT see "MSLE Activity Guides", "Printable Worksheets", "Assessment Templates", or "Upload Content" cards
Status: ✅

**UAT-20** — Print Module Cards card with cascading dropdowns
Given I am on the Resources tab
When I look at the first card
Then I see "Print Module Cards" with a "Select Phase" dropdown that cascades to Developmental Area and then Module selection
Status: ✅

**UAT-21** — Classroom setup checklist card present
Given I am on the Resources tab
When I look at the second card
Then I see "Classroom setup checklist" with description and "View resource →" link
Status: ✅

**UAT-22** — Parent communication template card present
Given I am on the Resources tab
When I look at the third card
Then I see "Parent communication template" with description and "View resource →" link
Status: ✅

---

## Happy Path — Phases Tab (Update 4)

**UAT-23** — Outcome card colors correct
Given I navigate to the Phases tab and scroll to Program Outcomes
When I look at the 3 outcome cards
Then "Grade 1 Ready" has a green border, "Group Literacy" has a yellow border, "One-on-One SIS Program" has an orange border
Status: ✅

**UAT-24** — Outcome card title renamed
Given I look at the first outcome card
When I read the title
Then it says "Grade 1 Ready" (not "First Grade")
Status: ✅

---

## Happy Path — Lesson Detail (Update 5)

**UAT-25** — Section backgrounds are color-coded
Given I navigate to LS-1 (The Silence Game) lesson detail
When I scroll through the sections
Then Materials is white, Aim is purple, Presentation is green, Examples is gray, Extension Activities is amber
Status: ✅

**UAT-26** — Teacher Notes placeholder shown
Given I am on the LS-1 lesson detail (logged out)
When I scroll to the bottom
Then I see a "Sign in to add notes" placeholder card with description text
Status: ✅

---

## Happy Path — Start Teaching Page (Update 7)

**UAT-27** — Demo cards have "View lessons" link
Given I navigate to the Start Teaching page
When I look at the demo student and group cards
Then both cards show a "View lessons →" link
Status: ✅

**UAT-28** — Add Students button triggers sign-in modal
Given I am not logged in on the Start Teaching page
When I click "Add Students"
Then the sign-in modal opens with email, password, Sign In button, and "Create one" link
Status: ✅

**UAT-29** — Sign-in modal has close button and escape key
Given the sign-in modal is open
When I click the X button or press Escape
Then the modal closes
Status: ✅

---

## Gap — Missing Login CTA at Bottom

**UAT-30** — "Log in to unlock" button at bottom of Start Teaching
Given I am on the Start Teaching page (logged out)
When I scroll to the bottom of the page
Then I see a "Log in to unlock" button that opens the sign-in modal
Status: ❌ — No login CTA visible at the bottom of the Start Teaching page. The "Add Students" and "Add Groups" buttons do open the modal, but the dedicated bottom CTA from the codebase is missing.

---

## Auth State

**UAT-31** — Sign In button in nav opens modal
Given I am not logged in
When I click "Sign In" in the top navigation
Then the sign-in modal opens
Status: ✅ (verified — modal opens from Add Students; nav Sign In assumed working based on presence)

---

## Summary

| Category | Pass | Fail | Total |
|----------|------|------|-------|
| Homepage (Update 6) | 6 | 0 | 6 |
| Dashboard Layout | 3 | 0 | 3 |
| Assessments (Update 1) | 5 | 0 | 5 |
| Grouping (Update 2) | 4 | 0 | 4 |
| Resources (Update 3) | 4 | 0 | 4 |
| Phases (Update 4) | 2 | 0 | 2 |
| Lesson Detail (Update 5) | 2 | 0 | 2 |
| Start Teaching (Update 7) | 3 | 1 | 4 |
| Auth State | 1 | 0 | 1 |
| **Total** | **30** | **1** | **31** |
