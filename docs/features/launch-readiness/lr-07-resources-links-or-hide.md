---
id: LR-07
title: "[Resources] Wire `/teacher/resources` links or hide the page"
type: task
status: done
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
---

### Goal

The Resources page currently shows three resource cards with broken
links (`href="#"`). Either ship real resources or hide the page until
they exist. Don't ship broken links to the public.

### Background

`app/teacher/resources/page.tsx` lists:
- "Printable Silence Game instructions" (`href="#"`)
- "Classroom setup checklist" (`href="#"`)
- "Parent communication template" (`href="#"`)

All three links are placeholders. Clicking them does nothing (the
page reloads to top). For a launch surface, three dead clicks in
a row is a credibility hit.

Two paths:
- **A: Ship the resources.** Create the three documents (PDFs or
  markdown), host them somewhere (could be a public bucket on
  Supabase or just `/public/resources/*.pdf`), wire the links.
- **B: Hide the page.** Remove the "Resources" tab from the teacher
  layout. Delete or redirect the route.

Recommendation: **B for v1**, A for v1.1. Resources pages are
nice-to-have, not core to activation. Don't block launch on
producing three real PDFs.

### Requirements

If choosing path B (recommended):

1. Remove "Resources" tab from `app/teacher/layout.tsx`'s `tabs` array.
2. Remove the `isMatch('/teacher/resources')` matcher from `TopNav.tsx`'s
   `isDashboardActive` and from teacher layout's `isDashboardView`.
3. Delete `app/teacher/resources/page.tsx`. Or redirect it to
   `/teacher/curriculum` so existing bookmarks don't 404.
4. Note in the PR description that this ticket has a follow-up
   (LR-07b or future LR-N) to ship real resources post-launch.

If choosing path A:

1. Identify what each resource actually is (consult the curriculum
   PDFs — `ind.pdf` mentions printables and worksheets in
   appendices).
2. Create the documents (likely needs PDF generation or pre-made
   PDFs from the curriculum author).
3. Host them — recommend `/public/resources/<filename>.pdf` for
   simplicity; static serving from Next.js.
4. Update the `resources` array in
   `app/teacher/resources/page.tsx` with real `href` values.
5. Add a Download icon, file-size hint, and (for accessibility) an
   `aria-label` describing what each resource is.
6. Confirm the links open the PDF (target="_blank" for download).

### Acceptance Criteria (path B)

**Happy Path**
Given a user navigates to `/teacher/resources`
When the route resolves
Then they redirect to `/teacher/curriculum` OR see the 404 page
And no "Resources" tab appears in teacher layout

**Auth State / Mobile**
Same as other deletions.

### Acceptance Criteria (path A)

**Happy Path**
Given a teacher on `/teacher/resources`
When they click any of the three cards
Then a real PDF (or other resource) opens (in a new tab if PDF)
And no `href="#"` links exist

**Error State**
Given a resource file fails to load
When the user clicks
Then the browser's standard "file not found" handles it
And the page itself doesn't break

### Out of Scope

- Sourcing / authoring the actual PDF resources (path A only —
  treat as content work, separate from this code ticket if
  pursued).
- Building an authenticated upload UI for teachers to add their
  own resources.
- Per-language localization of resource files.

### Notes

- File to delete (path B): `app/teacher/resources/page.tsx`
- Files to edit: `app/teacher/layout.tsx`, `components/TopNav.tsx`
- Should ship in <30 minutes (path B).
- If path A becomes the call: budget a half-day plus content
  creation time.
