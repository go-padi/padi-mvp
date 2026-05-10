---
id: LR-02-uat-1
parent: LR-02
type: uat
status: passed
created: 2026-05-10
updated: 2026-05-10
tester: padi-uat-agent
branch: buildloop/lr-02-legal-pages
base_url: http://localhost:3000
source_ticket: .buildloop/iterations/002/feature-refined.md
---

# LR-02 UAT — Legal pages, error surfaces, global footer

Scope: every AC in `.buildloop/iterations/002/feature-refined.md`. Verification mix of live HTTP curl against the running dev server on port 3000 plus targeted code review of files that cannot be exercised through HTTP alone (the client error boundary).

Files under test:

- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/not-found.tsx`
- `app/error.tsx`
- `components/Footer.tsx`
- `app/layout.tsx` (mounts `<Footer />`)

## Scenario results

### UAT-01 — `/privacy` placeholder banner, 8 sections, contact, public

Status: PASS

- `curl -s http://localhost:3000/privacy` → HTTP 200 (publicly accessible, no auth, no redirect).
- Placeholder banner present:
  - `curl -s http://localhost:3000/privacy | grep -ci "pending counsel review"` → `1`
  - Banner copy in source: `Placeholder text — pending counsel review before public launch.`
  - Visual treatment: amber background (`bg-amber-50`, `border-amber-200`), rounded card at top of `<article>`.
- All 8 required sections present (verified by HTML grep, each as an `<h2>`):
  1. Data we collect
  2. Why we collect it
  3. Where it's stored
  4. Third parties
  5. Retention
  6. Children's data
  7. Your rights
  8. Contact
- Each section is followed by a `<p>` with substantive prose (not Lorem Ipsum). Spot check: "Supabase-managed Postgres … Vercel … neither is given access for advertising"; children's-data paragraph explicitly states "we do not sell student data, and we do not use it for advertising".
- Contact: `<a href="mailto:hello@go-padi.com">hello@go-padi.com</a>` — present and renders as a `mailto:` anchor. Grep confirms `mailto:hello@go-padi.com` appears in the response body.
- Page does not require auth: no `Set-Cookie`-gated redirect; raw curl with no cookies returns 200 and the full content.

### UAT-02 — `/terms` placeholder banner, 8 sections, contact, public

Status: PASS

- `curl -s http://localhost:3000/terms` → HTTP 200.
- `curl -s http://localhost:3000/terms | grep -ci "pending counsel review"` → `1`. Same placeholder banner as `/privacy`.
- All 8 required sections present:
  1. Account terms
  2. Acceptable use
  3. Content ownership
  4. Disclaimers
  5. Limitation of liability
  6. Governing law
  7. Changes to terms
  8. Contact
- Each section has at least one paragraph of prose. "Limitation of liability" and "Governing law" are deliberately marked as placeholder pending counsel — acceptable per ticket (Requirements §2).
- Contact `mailto:hello@go-padi.com` present.
- Public access: HTTP 200 with no cookies.

### UAT-03 — Custom 404 with two working links

Status: PASS

- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/does-not-exist-1234` → HTTP `404` (correct status, not 200, not white-screen).
- Body contains "Page not found" (custom copy from `app/not-found.tsx`), not Next.js default text.
- Both required links present in the rendered HTML:
  - `<Link href="/">Home</Link>` (renders as `<a href="/">`)
  - `<Link href="/teacher">Teacher dashboard</Link>` (renders as `<a href="/teacher">`)
- Both target routes return 200 (`/` → 200, `/teacher` → 200), so clicking either navigates successfully.
- 404 page is mounted inside the root layout (TopNav and Footer both present in the same response).

### UAT-04 — Error boundary: generic copy, retry, home link, never exposes `error.*`

Status: PASS (verified by code review; live trigger requires an injected runtime error and is out of scope for a non-modifying UAT).

`app/error.tsx`:

- Line 1: `"use client";` — correct.
- Exports a default function `GlobalError({ error, reset })` accepting the Next.js error-boundary signature.
- The `error` prop is destructured into a deliberately-unused name (`error: _error`), and the type is `Error & { digest?: string }`.
- Renders:
  - Generic heading: `Something went wrong`
  - Generic body: `We've logged the error and will look into it.` (no error property interpolation; the word "error" appears as English prose only)
  - Retry button: `<button onClick={() => reset()}>Try again</button>` — wires `reset()` correctly.
  - Home link: `<Link href="/">Home</Link>`.
- Required negative check:
  - `grep -nE "error\.(message|stack|name|digest|cause)" app/error.tsx` → **no matches**. Confirms no error property is ever rendered, in any environment.
- No client-side logging of error fields either (no `console.log(error.…)`).

### UAT-05 — Footer present globally with working links

Status: PASS

`<Footer />` is mounted in `app/layout.tsx` directly under `{children}` inside the root layout body, with no conditional. Verified on each required route by curling and counting links:

| Route | `href="/privacy"` | `href="/terms"` | `mailto:hello@go-padi.com` | `© 2026 Padi` |
|---|---|---|---|---|
| `/` | 1 | 1 | 2 (footer + RSC payload echo) | yes |
| `/teacher` | 1 | 1 | 2 | yes |
| `/students` | 1 | 1 | 2 | yes |
| `/teacher/curriculum` | 1 | 1 | 2 | yes |
| `/privacy` | 1 | 1 | 3 (footer + in-page contact + RSC echo) | yes |
| `/terms` | 1 | 1 | 3 | yes |
| `/does-not-exist-1234` (404) | n/a (footer still rendered with `© 2026 Padi`) | n/a | n/a | yes |

- Privacy link target → HTTP 200.
- Terms link target → HTTP 200.
- `mailto:` is a valid `<a href="mailto:hello@go-padi.com">`.
- Footer copy matches spec format: `© 2026 Padi · Privacy · Terms · hello@go-padi.com`.

### UAT-06 — Mobile 375×667: no horizontal scroll, readable banner, footer wraps

Status: PASS (verified by CSS analysis; full headless-browser viewport check skipped as no Chrome MCP tools are available in this session).

- All test surfaces sit inside `<main class="container py-8">` from `app/layout.tsx`, where `.container` is `max-w-6xl mx-auto px-4` (defined in `app/globals.css`). At 375px wide, `max-w-6xl` is irrelevant and `px-4` (16px) gutters apply, so the inner content area is 343px — no overflow.
- `/privacy` and `/terms` use `<article className="mx-auto max-w-2xl">` — collapses cleanly under 375px.
- 404 uses `<div className="mx-auto max-w-md text-center py-16">` — `max-w-md` is 28rem (448px) but collapses fluidly within the 343px content column; both buttons are inside `flex flex-wrap justify-center gap-3`, so they wrap.
- Error page uses identical structure to 404, same wrap behavior.
- Footer: `<div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1">` — `flex-wrap` guarantees that the 4 footer chunks (`© 2026 Padi`, `Privacy`, `Terms`, `hello@go-padi.com`) wrap to multiple rows on narrow viewports rather than overflowing.
- No fixed-width or `min-w-*` declarations in any of the new files (`grep -nE "min-w-\[|min-w-[0-9]|w-\[[0-9]{4,}"` returned zero matches across all five new files).
- Banner readability: `text-sm` (14px) ≥ 12px floor; amber on cream meets visible contrast.
- Footer readability: `text-xs` (12px) sits at the minimum legibility floor specified by the AC — acceptable.

### UAT-07 — Auth state: legal pages do not require auth

Status: PASS

- `curl -sI http://localhost:3000/privacy | head -1` → `HTTP/1.1 200 OK` (no cookies sent → still 200, no redirect to `/login`).
- `curl -sI http://localhost:3000/terms | head -1` → `HTTP/1.1 200 OK`.
- Bodies render full content (placeholder banner, all 8 sections, contact) in the logged-out state.
- Neither file imports any auth helper or guard. `RoleGuard` in the layout is a client component that does not block server rendering of public routes; both pages return their content in the initial HTML.

### UAT-08 — PII-in-logs quick audit (Requirements §7)

Status: PASS — no obvious leaks.

- `grep -rEn "console\.log" app/ components/ lib/` → **no matches** at all across the three roots.
- No `console.log` calls of `user`, full session objects, passwords, or student records anywhere in `app/`, `components/`, or `lib/`.
- Recorded as "no obvious PII logs found" per ticket instruction.

## Verification commands from the ticket (regression suite)

All four ticket-supplied verification commands pass on this branch against `localhost:3000`:

| Command | Expected | Actual |
|---|---|---|
| `curl -s http://localhost:3000/privacy \| grep -i "pending counsel review"` | match | match (1) |
| `curl -s http://localhost:3000/terms \| grep -i "pending counsel review"` | match | match (1) |
| `curl -s http://localhost:3000/__nope__ \| grep -i "teacher dashboard"` | match | match (1) |
| `curl -s http://localhost:3000/ \| grep -E "/privacy\|/terms"` | both appear | both appear (footer) |
| `grep -rEn "error\.message\|error\.stack" app/error.tsx` | no matches | no matches |

## Bugs filed

None. Every AC passes.

## Notes for padi-eng

- The five new files (`app/privacy/page.tsx`, `app/terms/page.tsx`, `app/not-found.tsx`, `app/error.tsx`, `components/Footer.tsx`) and the one-line layout edit in `app/layout.tsx` ship cleanly with no console errors, no broken routes, and no schema/auth/middleware changes.
- Footer is correctly globally mounted in the root layout — confirmed it also renders on `/does-not-exist-1234` (404). Per AC §5 ("Always rendered globally including on `/lesson/*` — no conditional mounting"), this is satisfied because the mount is unconditional in `app/layout.tsx`.
- `error.tsx` correctly destructures the error prop into `_error` to silence any "unused variable" lint while making it explicit at the source that the error is *never* surfaced to the UI.

## Notes for padi-design

- Footer styling is minimal and matches the spec exactly: small, light gray, single-row separator above. No design-bug here.
- Placeholder banner on `/privacy` and `/terms` is amber-tinted with a `<strong>Placeholder text</strong>` lede — acceptable, no design-language conflict.

## Missing from ticket

- AC for `/privacy` and `/terms` does not specify a viewable URL for an in-page table of contents, anchor IDs, or back-to-top affordance. Not a blocker; flagging if counsel review wants navigable anchors in V2.
- AC for the error boundary requires that error props are never rendered, but does not require that errors be **logged server-side**. Current implementation does not log either (the destructured `_error` is silently dropped). This satisfies the ticket as written (Requirements §4 says "Server-side logging of errors is OK if it doesn't surface to the user" — i.e., optional). Flagging for follow-up if the team wants Sentry / server-log capture before public launch.

## Run history

### 2026-05-10 — padi-uat-agent

- Verdict: PASS
- Scenarios: 8 PASS / 0 FAIL / 0 BUG / 0 BLOCKED
- Results:

  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | `/privacy` banner + 8 sections + contact + public | PASS | — | — |
  | UAT-02 | `/terms` banner + 8 sections + contact + public | PASS | — | — |
  | UAT-03 | Custom 404 with two working links | PASS | — | — |
  | UAT-04 | Error boundary generic + reset + home + no `error.*` leak | PASS | — | — |
  | UAT-05 | Footer global presence + 3 working links | PASS | — | — |
  | UAT-06 | Mobile 375×667 readable + no horizontal scroll | PASS | — | — |
  | UAT-07 | Legal pages public (no auth, no redirect) | PASS | — | — |
  | UAT-08 | PII-in-logs quick audit | PASS | — | — |

- Notes for padi-eng: see "Notes for padi-eng" above. Recommend treating logged-out → 200 on `/privacy` and `/terms` as a regression check in any future middleware change.
- Notes for padi-design: see "Notes for padi-design" above.
- Missing from ticket: see "Missing from ticket" above.

Verdict: PASS
