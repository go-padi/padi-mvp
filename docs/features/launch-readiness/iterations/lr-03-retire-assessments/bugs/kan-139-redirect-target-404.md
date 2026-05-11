---
id: KAN-139
type: bug
status: fixed
severity: P1
parent: LR-03
uat: LR-03-uat-1
created: 2026-05-10
---

# Redirect from /teacher/assessments lands on a 404

## Summary
`/teacher/assessments` correctly returns 308 with `Location: /teacher/start-teaching`, but the redirect target `/teacher/start-teaching` does not exist as a route and itself returns **HTTP 404 Not Found**. Anyone following the redirect from a bookmark, old email link, or back-button history ends up on the global Next.js 404 page. The retirement is therefore visible to users as a broken link, not as a clean migration.

## Steps to reproduce
1. With the dev server running on http://localhost:3000, request the legacy URL:
   ```
   curl -sI http://localhost:3000/teacher/assessments
   ```
   Response: `HTTP/1.1 308 Permanent Redirect`, `Location: /teacher/start-teaching`. (Correct so far.)
2. Follow the redirect:
   ```
   curl -sL -o /dev/null -w "Final URL: %{url_effective}\nHTTP code: %{http_code}\n" http://localhost:3000/teacher/assessments
   ```
   Output:
   ```
   Final URL: http://localhost:3000/teacher/start-teaching
   HTTP code: 404
   ```
3. Confirm directly:
   ```
   curl -sI http://localhost:3000/teacher/start-teaching
   ```
   Returns `HTTP/1.1 404 Not Found`.

## Expected
Following the redirect lands on a real, rendering page (200). Per LR-03 AC2: "following the redirect lands on `/teacher/start-teaching` and the page renders … just no crash." A 404 page is a crash from the user's perspective — they hit a dead end.

## Actual
Final URL is `http://localhost:3000/teacher/start-teaching` with HTTP 404. Next.js renders the default not-found page.

## Root cause (code-level)
- `app/teacher/assessments/page.tsx` line 4: `permanentRedirect("/teacher/start-teaching");`
- There is no `app/teacher/start-teaching/page.tsx`. The folder `app/teacher/start-teaching/` exists but contains only a `students/` subfolder (dynamic detail routes), so the segment itself has no route.
- The real Start Teaching page lives at the top-level route: `app/start-teaching/page.tsx` (verified: `curl -sI http://localhost:3000/start-teaching` returns 200).
- The two paths are not equivalent — `TopNav.tsx` line 27 explicitly distinguishes them: `pathname === '/start-teaching' || isMatch('/teacher/start-teaching') || isMatch('/start-teaching')`.

## Fix options
1. **Change the redirect target** (smallest diff): in `app/teacher/assessments/page.tsx`, change `permanentRedirect("/teacher/start-teaching")` to `permanentRedirect("/teacher")`. The `/teacher` route exists, renders for both logged-in and logged-out states, and matches what `TopNav.tsx` already uses for the "Start Teaching" CTA (line 61: `<Link href="/teacher">`). Confirmed 200 on `curl -sI http://localhost:3000/teacher`.
2. Alternatively redirect to `/start-teaching` (top-level), but verify that's the intended dashboard entry for teachers — the codebase has both `/teacher` and `/start-teaching` and they are different surfaces.
3. **Do NOT** "fix" this by creating a new `app/teacher/start-teaching/page.tsx` — that contradicts the LR-03 spirit of retiring routes, not adding them.

## Severity rationale
P1, not P0. The legacy URL still returns 308 (so search engines / browsers update bookmarks correctly long-term), and the destination is a stable 404 (not a crash with a JS error). But a user clicking a stale `/teacher/assessments` link today sees a 404 page — that is a visible regression versus pre-LR-03 behaviour where the page rendered. Blocks shipping LR-03.

## Evidence
- `curl -sI http://localhost:3000/teacher/assessments` → 308 + `Location: /teacher/start-teaching`
- `curl -sI http://localhost:3000/teacher/start-teaching` → 404
- `curl -sI http://localhost:3000/start-teaching` → 200
- `curl -sI http://localhost:3000/teacher` → 200
- `find /Users/nishaiyer/Desktop/padi-app/padi-app-starter/app -type d -name "start-teaching"` returns two dirs; only the top-level one has a `page.tsx`.

## Fix Notes

**Root cause:** The LR-03 spec named `/teacher/start-teaching` as the redirect target, but that segment has no `page.tsx` — only a `students/` subfolder of dynamic routes — so Next.js resolves it to a 404. The spec was internally inconsistent: `TopNav.tsx`'s "Start Teaching" CTA already points at `/teacher`, which is the actual activation surface.

**Files changed:**
- `app/teacher/assessments/page.tsx` — changed `permanentRedirect("/teacher/start-teaching")` to `permanentRedirect("/teacher")`.

**Why this fix is correct:** `/teacher` is the real activation surface (renders for both logged-in and logged-out users, returns 200) and is exactly where the in-app "Start Teaching" CTA navigates (`TopNav.tsx:61`). Redirecting there preserves AC2's intent — "following the redirect lands on the start-teaching surface and the page renders" — while honoring the LR-03 spirit of retiring routes rather than adding new ones. Smallest possible diff: one path string. No other behaviour changes.

## UAT-2 fix verification (2026-05-10)

- `curl -sI http://localhost:3000/teacher/assessments` → `HTTP/1.1 308 Permanent Redirect`, `location: /teacher`. ✅
- `curl -sL -o /dev/null -w "%{url_effective} %{http_code}\n" http://localhost:3000/teacher/assessments` → `http://localhost:3000/teacher 200`. ✅
- `/teacher` body renders real activation surface content (`<h2>Start teaching</h2>`, `<h3>Students (preview)</h3>`, "Demo data" badge). No 404 UI. ✅
- Source confirmed: `app/teacher/assessments/page.tsx:4` → `permanentRedirect("/teacher");`.

Fix holds. Bug closed.
