---
id: KAN-141-UAT
parent: KAN-141
title: UAT — Fix Teacher dashboard label leak in app/not-found.tsx
created: 2026-05-12
updated: 2026-05-12
---

# KAN-141 UAT — Fix Teacher dashboard label leak in app/not-found.tsx

Verdict: PASS

## Scope

Trivial 1-line copy fix follow-up to LR-20: the second link on the global 404 page
(`app/not-found.tsx`, line 10) must render as "Dashboard" (not "Teacher dashboard"
/ "Teacher Dashboard"), while preserving the Home link, the page heading, and the
body copy.

## Scenarios

### UAT-01 — `/teacher` link label reads "Dashboard"
Status: ✅
- Given the dev server is running on http://localhost:3000
- When I request `GET /some-nonexistent-page` (which renders `app/not-found.tsx`)
- Then the rendered HTML contains exactly one anchor with `href="/teacher"` whose
  inner text is `Dashboard`, and the HTML contains zero occurrences of the strings
  "Teacher dashboard" or "Teacher Dashboard".
- Evidence: `grep -c "Teacher dashboard\|Teacher Dashboard" /tmp/kan141-notfound.html` → `0`;
  `grep -o 'href="/teacher"[^>]*>[^<]*<' /tmp/kan141-notfound.html` → `href="/teacher">Dashboard<`
  (the second match `Start Teaching` belongs to a separate teacher-CTA element elsewhere
  in the document, not to `app/not-found.tsx`).

### UAT-02 — Home link unchanged
Status: ✅
- Given the same 404 response
- When I inspect the first anchor in the not-found block
- Then it renders as `<Link href="/" className="btn btn-primary">Home</Link>`.
- Evidence: `grep -o 'href="/"[^>]*>[^<]*<' /tmp/kan141-notfound.html` → `href="/">Home<`.
  Source line `app/not-found.tsx:9` is `<Link href="/" className="btn btn-primary">Home</Link>` — unchanged.

### UAT-03 — Heading and body copy unchanged
Status: ✅
- Given the same 404 response
- When I inspect the heading and paragraph
- Then the `<h1>` reads `Page not found` and the `<p>` reads
  `We couldn't find the page you were looking for.`
- Evidence: `grep -o ">Page not found<" /tmp/kan141-notfound.html` matches;
  `We couldn't find the page you were looking for` present in the rendered HTML.
  Source lines `app/not-found.tsx:6-7` are byte-identical to spec — unchanged.

### UAT-04 — HTTP status is 404
Status: ✅
- Given a request for a non-existent route
- When I curl it
- Then the response status is `404`.
- Evidence: `curl -s -o /tmp/kan141-notfound.html -w "HTTP %{http_code}\n" http://localhost:3000/some-nonexistent-page` → `HTTP 404`.

## Run history

### 2026-05-12 — padi-uat-agent
- Verdict: PASS
- Scenarios: ✅ 4 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | `/teacher` link label reads "Dashboard" | ✅ | — | — |
  | UAT-02 | Home link unchanged | ✅ | — | — |
  | UAT-03 | Heading and body copy unchanged | ✅ | — | — |
  | UAT-04 | HTTP status is 404 | ✅ | — | — |
- Notes for padi-eng: Source `app/not-found.tsx:10` now reads
  `<Link href="/teacher" className="btn">Dashboard</Link>` exactly as specified.
  No further work required for this ticket.
- Notes for padi-design: None. Page heading, supporting copy, and button hierarchy
  (primary "Home", secondary "Dashboard") are unchanged from the prior approved state.
- Missing from ticket: Nothing. The spec was a single-line copy change with an
  exact target string, and the implementation matches byte-for-byte.
