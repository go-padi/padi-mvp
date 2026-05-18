---
id: LR-25g-UAT
parent: LR-25g
ticket: docs/features/launch-readiness/lr-25-homepage-rewrite-2.md
refined: .buildloop/iterations/001/feature-refined.md
file_under_test: app/page.tsx
url: http://localhost:3000/
run_date: 2026-05-18
run_by: padi-uat-agent
---

Verdict: PASS

# LR-25g — Homepage final CTA refresh — UAT

## Scope

Verified the final CTA section of `app/page.tsx` (the gradient
`from-blue-600 to-purple-600` section) was refreshed with the exact
copy from the refined ticket, with no regressions elsewhere on the
homepage, and that lint / typecheck / build all stay green.

Verification was done against BOTH:
- Source: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/app/page.tsx`
- Rendered HTML: `curl -s http://localhost:3000/` (HTTP 200, 26404 bytes)

## Scenarios

### UAT-01 — H2 reads exactly `Start accelerating today.`

Status: PASS

- Source `app/page.tsx:157`:
  `<h2 className="text-3xl font-semibold mb-3">Start accelerating today.</h2>`
- Rendered HTML: `grep -c "Start accelerating today." /tmp/lr25g-home.html` → 1
- Exact-match including period.

### UAT-02 — Body paragraph reads exactly `A free account, the next lesson for every child, ready to teach in minutes.`

Status: PASS

- Source `app/page.tsx:158-160`:
  ```
  <p className="text-lg text-blue-50">
    A free account, the next lesson for every child, ready to teach in minutes.
  </p>
  ```
- Rendered HTML: `grep -c "A free account, the next lesson for every child, ready to teach in minutes." /tmp/lr25g-home.html` → 1
- Exact-match, no paraphrase, no pluralization.

### UAT-03 — Button 1: text `Get Free Early Access` + href `/teacher`

Status: PASS

- Source `app/page.tsx:163-165`:
  ```
  <Link href="/teacher" className="rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow-sm hover:bg-blue-50">
    Get Free Early Access
  </Link>
  ```
- Rendered HTML: matched `href="/teacher">Get Free Early Access` exactly.
- Note: `Get Free Early Access` also appears in the hero (as a sign-in
  trigger button, not a Link); that is expected and not in scope for
  this section's forbidden-strings check.

### UAT-04 — Button 2: text `Browse curriculum` + href `/teacher/curriculum`

Status: PASS

- Source `app/page.tsx:166-168`:
  ```
  <Link href="/teacher/curriculum" className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white ring-1 ring-white/40 hover:bg-white/15">
    Browse curriculum
  </Link>
  ```
- Rendered HTML: matched `href="/teacher/curriculum">Browse curriculum` (2 occurrences — once in hero, once in final CTA, as expected).

### UAT-05 — Forbidden strings absent in rendered HTML

Status: PASS

`curl -s http://localhost:3000/ | grep -c -E "Ready to Transform Reading Time\?|Join teachers and parents helping children build confidence|Start Teaching Today|View Dashboard"` → 0

Individually verified absent:
- `Ready to Transform Reading Time?` — 0
- `Join teachers and parents helping children build confidence` — 0
- `Start Teaching Today` — 0
- `View Dashboard` — 0

### UAT-06 — No regression on other homepage sections

Status: PASS

Rendered-HTML grep counts:
- Hero H1 contains `Accelerate ... your child's reading.` (split by gradient `<span>`; both halves present, h1 intact) — 1 occurrence of `your child` in the H1
- `Everything an early childhood teacher needs` — 1
- `Most reading programs teach every child the same way.` — 1
- `Simple for you. Powerful for your students.` — 1
- `Built by a teacher, for teachers.` — 1

### UAT-07 — Gradient + button styles preserved

Status: PASS

Rendered HTML contains the exact className strings:
- Final section: `rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600` — 1
- Button 1 className: `rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow-sm hover:bg-blue-50` — 1
- Button 2 className: `rounded-xl bg-white/10 px-4 py-2 font-semibold text-white ring-1 ring-white/40 hover:bg-white/15` — 1

### UAT-08 — `pnpm lint` exit 0

Status: PASS

Exit code 0. Single warning surfaced (unused eslint-disable directive
in `lib/copy/assessmentStatusCopy.ts:30`) — pre-existing, unrelated to
this file, 0 errors.

### UAT-09 — `pnpm tsc --noEmit` exit 0

Status: PASS

Exit code 0. No output (clean).

### UAT-10 — `pnpm build` exit 0

Status: PASS

Exit code 0. Build completed; route table emitted as expected. `/` is
prerendered static; no errors.

## Results

| #      | Scenario                                                       | Status | Bug file | Severity |
|--------|----------------------------------------------------------------|--------|----------|----------|
| UAT-01 | H2 verbatim                                                    | PASS   | —        | —        |
| UAT-02 | Body paragraph verbatim                                        | PASS   | —        | —        |
| UAT-03 | Button 1 text + href                                           | PASS   | —        | —        |
| UAT-04 | Button 2 text + href                                           | PASS   | —        | —        |
| UAT-05 | Forbidden strings absent                                       | PASS   | —        | —        |
| UAT-06 | No regression on other homepage sections                       | PASS   | —        | —        |
| UAT-07 | Gradient + button classNames preserved                         | PASS   | —        | —        |
| UAT-08 | `pnpm lint` exit 0                                             | PASS   | —        | —        |
| UAT-09 | `pnpm tsc --noEmit` exit 0                                     | PASS   | —        | —        |
| UAT-10 | `pnpm build` exit 0                                            | PASS   | —        | —        |

## Run history

### 2026-05-18 — padi-uat-agent
- Verdict: PASS
- Scenarios: PASS 10 / FAIL 0 / BUG 0 / BLOCKED 0
- Notes for padi-eng: None. Single-file copy change landed cleanly with
  no paraphrasing — LR-25d regression risk avoided. The eslint warning
  in `lib/copy/assessmentStatusCopy.ts:30` (unused eslint-disable
  directive) is pre-existing and out of scope for LR-25g, but worth
  cleaning up in a future sweep.
- Notes for padi-design: None — gradient, button shapes, and copy
  hierarchy all match the refined spec exactly.
- Missing from ticket: None.
