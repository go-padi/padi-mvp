---
id: LR-02
title: "[Legal] Add privacy policy, terms, 404, and error pages"
type: story
status: backlog
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
---

### Goal

Add the legal and error-handling surfaces that any public web app
needs before launch: a privacy policy, terms of service, a 404 page,
and a global error boundary page. Wire them into the layout so
they're discoverable.

### Background

Padi will collect parent and teacher email addresses, create accounts,
store student data, and use Supabase auth. None of that is legal to
do publicly without:
- A privacy policy (data collection, storage, third-party processors,
  user rights)
- Terms of service (account terms, content ownership, liability)
- A 404 / not-found page (currently any unknown URL probably crashes
  or shows Next's default white page)
- A global error boundary (server-side or client-side errors today
  produce Next's default error page)

Privacy is especially important because the app stores student data
that may include children's names. COPPA (US) / GDPR (EU) implications
apply. The team should consult counsel on the actual policy text;
this ticket is about the SHIPPING SURFACES, not the legal review of
the content.

### Requirements

1. Create `app/privacy/page.tsx` rendering the privacy policy.
   Content placeholder is acceptable for v1 with a clear note that
   it must be reviewed by counsel before public launch. Suggested
   sections: data we collect, why, how we store, third parties
   (Supabase, Vercel), retention, children's data, user rights,
   contact email.
2. Create `app/terms/page.tsx` rendering terms of service. Same
   placeholder-with-counsel-review caveat. Suggested sections:
   account terms, acceptable use, content ownership, disclaimers,
   limitation of liability, governing law, changes to terms,
   contact email.
3. Create `app/not-found.tsx` (Next.js convention) with a friendly
   404 page that includes a link back to `/`.
4. Create `app/error.tsx` (Next.js convention, client-side error
   boundary) with a "something went wrong" page, an option to
   retry, and a link back to `/`.
5. Add footer links to privacy + terms in `app/layout.tsx` (or a
   new shared `<Footer>` component) so users can find them from
   any page.
6. Verify no PII is logged to console in production builds (a quick
   grep on `console.log` in the codebase to spot anything obvious).

### Acceptance Criteria

**Happy Path**
Given a user navigates to `/privacy` or `/terms`
When the page loads
Then they see the policy/terms text with proper headings, body, and a
contact link

**Empty State**
N/A — these are content pages.

**Error State (404)**
Given a user navigates to a URL that doesn't exist (e.g. `/nonexistent`)
When the route resolves
Then they see the 404 page with a link back to `/`
And no Next.js default 404 page is shown

**Error State (server/client error)**
Given a runtime error occurs in any page
When the error boundary catches it
Then the user sees a friendly error page with a retry button and a link to `/`
And the error is not logged in a way that exposes PII

**Auth State**
Given a logged-out user navigates to `/privacy` or `/terms`
When the page loads
Then it renders without auth requirement (these must be public)

**Mobile**
All four pages should be readable at 375×667 with no layout breaks.

### Out of Scope

- Counsel-reviewed final policy text. This ticket is the surface; the
  copy is placeholder pending legal review.
- Cookie consent UI (separate ticket if needed; depends on whether
  Padi uses cookies that require GDPR consent banner).
- DPA / data processing agreement with Supabase / Vercel (these are
  procurement-side, not in-app).

### Notes

- Files to create:
  - `app/privacy/page.tsx`
  - `app/terms/page.tsx`
  - `app/not-found.tsx`
  - `app/error.tsx`
  - Optionally `components/Footer.tsx` and update `app/layout.tsx`
- Use the existing card / typography utilities (Tailwind) so these
  pages match the rest of the app visually.
- For the 404, consider using Next's `notFound()` helper from
  `next/navigation` so unrecognized dynamic routes can also trigger
  the page.
- For the error boundary, follow Next.js docs on `error.tsx` —
  it must be a client component and accept `error` + `reset` props.
- This is medium effort but mostly mechanical. ~2 hours including
  reasonable placeholder copy.
