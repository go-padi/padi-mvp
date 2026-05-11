---
id: LR-01-uat-2
parent: LR-01
title: "UAT — LR-01 Fix homepage marketing copy (re-run after eng_fix attempt 1)"
type: uat
status: pass
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-10
ran_by: padi-uat-agent
target: http://localhost:3000
buildloop_iteration: 1
prior_uat: docs/features/lr-01-fix-marketing-copy/uat/LR-01-uat-1-fail.md
---

## Scope

Re-validate every refined AC for LR-01 after eng_fix attempt 1, which:
- Removed `Audio pronunciation guides` entirely from the Interactive Lessons card.
- Reframed `Printable PDF worksheets` as `Printable worksheets (coming soon)` in the Teacher Tools card.

Both prior bugs (`lr-01-bug-01` printable-PDFs P1, `lr-01-bug-02` audio-pronunciation P2) are marked `status: fixed`. The "coming soon" framing IS allowed by the refined ticket as a permitted-but-not-preferred path.

## Method

Tooling used this run (richer than UAT-1 because Chrome headless via CDP was reachable):
- `curl` for raw HTML and visible-text extraction.
- Headless Chrome (`/Applications/Google Chrome.app/...`) driven via CDP over a Python `websockets` client at a true mobile viewport (`width: 375, height: 667, deviceScaleFactor: 2, mobile: true`) — gives real mobile layout, not a 375px-wide-desktop crop.
- CDP `Page.captureScreenshot` for the 375×667 evidence screenshot.
- CDP `Runtime.consoleAPICalled`, `Runtime.exceptionThrown`, `Log.entryAdded`, `Network.responseReceived` for console + network error capture.
- `grep -rEn` across `app/`, `components/`, `lib/` for AI-claim and broader-claim regression.
- Source-code review for auth-state, redirect behavior, and feature-existence verification.

Evidence: `docs/features/lr-01-fix-marketing-copy/uat/evidence/uat2-home-mobile-375x667.png`

## Results by AC

### AC1 — Happy path, logged out: no AI claims in rendered DOM
- Status: PASS
- Evidence: visible-text extract of `http://localhost:3000/` contains zero matches (case-insensitive) for any of `AI-`, `AI Enhanced`, `AI-powered`, `AI powered`, `artificial intelligence`. Total visible-text length 881 chars; no AI-banned tokens present.
- Visible hero copy: `📚 Structured Multisensory Reading` (eyebrow chip), `Help Every Child Love Reading` (H1), `Structured, multisensory reading lessons for K-2 readers (ages 5-7), built on the ASDEC Kickstart curriculum.` (subtitle).

### AC1b — Happy path, logged out: K-2 / ages 5-7 audience stated
- Status: PASS
- Evidence: rendered DOM contains `K-2` (5 hits, includes RSC payload duplication) and `ages 5-7` (5 hits) across the hero subtitle and the Targeted Support card (`K-2 (ages 5-7) focus`). Zero hits for `ages? 3-4|age 3-4`.

### AC1c — Happy path, logged out: every named feature is true today (or framed coming-soon)
- Status: PASS
- Per-bullet truthfulness verified against codebase:
  - `Phonics-focused instruction` — true; ASDEC Kickstart curriculum is phonics-based; module pages render `Examples of sounds students might identify` (`app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:458`).
  - `Visual word matching` — defensible; `scripts/modules.json` and `scripts/curriculum-data.json` contain a `Matching Game` module with `picture/word cards` materials and a `Demonstrate matching` step. Matching is a curriculum-level activity in lesson plans even if no in-app drag-drop UI exists yet — the bullet describes a curriculum capability, not an app interaction, and the curriculum carries it.
  - `Progress tracking` — true; `app/teacher/start-teaching/students/[studentId]/page.tsx` computes `completedCount`, `totalCount`, `progressPercent`, per-chapter and per-group counts.
  - `Ready-to-use lesson plans` — true; module pages render `Materials`, `Aim`, `Presentation` (numbered steps), `Examples`, and `Extension Activities` directly.
  - `Printable worksheets (coming soon)` — explicitly framed coming-soon; allowed by refined ticket. Not a present-tense claim.
  - `Student progress reports` — true; per-student per-module completion is rendered with progress bars and chapter/group counts on the student page (same code path as `Progress tracking`).
  - `Curriculum alignment` — true; the curriculum is structured as Chapter → Group → Module routes (`app/teacher/curriculum/[chapter]/[group]/[module]/`) sourced from the ASDEC Kickstart `curriculum-data.json` seed. Lessons are aligned to specific curriculum modules by `module.code`.
  - `K-2 (ages 5-7) focus` — true; matches the curriculum audience and the hero subtitle.
  - `Systematic phonics approach` — true; the curriculum's chapter/group/module structure IS the systematic approach.
  - `Multi-sensory learning` — true; matches the subtitle and the curriculum's stated multisensory pedagogy.
  - `Confidence building` — soft but defensible; matches the bottom CTA copy `helping children build confidence and reading skills`.
- Prior bugs `Audio pronunciation guides` and `Printable PDF worksheets` are GONE from the rendered DOM (verified via visible-text extract; zero hits for `pronunciation` or `Printable PDF`).

### AC2 — Auth-state, logged in: same copy, no role-aware variation, no redirect change
- Status: PASS (code review)
- Evidence: `grep -nE "user|session|redirect|useRouter|getUser|cookies|Suspense|auth"` in `app/page.tsx` returns zero hits. No `middleware.ts` exists at the repo root or in `src/`. No `redirect('/')` calls anywhere in `app/` or `components/`. The page renders identical markup regardless of auth state and applies no redirect.

### AC3 — Mobile 375×667: chip on single line
- Status: PASS
- Evidence: CDP geometry probe at `width: 375, height: 667, mobile: true, deviceScaleFactor: 2`:
  - Chip width: `234.33px` (well under viewport's effective content width)
  - Chip height: `26px` (single line at 12px font, default line-height ≈ 16-18px → ~26px including padding)
  - `whiteSpace: normal` but content fits without wrap due to `inline-flex` content sizing
  - `text: "📚 Structured Multisensory Reading"`
- Visual confirmation in `evidence/uat2-home-mobile-375x667.png`.

### AC4 — Mobile 375×667: subtitle wraps cleanly, no horizontal scroll, no card overflow
- Status: PASS
- Evidence: CDP geometry probe:
  - `htmlScrollWidth: 375`, `htmlClientWidth: 375` — `hasHorizontalScroll: false`.
  - `bodyScrollWidth: 375`, `bodyClientWidth: 375`.
  - One element with `right > innerWidth`: a decorative `<div class="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl">` background blob. Its parent `<section>` has `overflow-hidden`, which clips it. Not a real overflow — visual gradient effect, intentionally placed at `-right-20`.
  - All feature cards stack vertically (the inner `grid sm:grid-cols-2` collapses to single-column at 375px since `sm:` is the 640px breakpoint). No fixed-width content. Subtitle uses `max-w-2xl` which is irrelevant at 375px.
- Visual confirmation: full-page screenshot at `evidence/uat2-home-mobile-375x667.png` shows clean wraps on hero, subtitle, all three feature cards, and the bottom CTA section. Top-nav buttons (`Teacher Dashboard`, `Start Teaching`, `Sign In`) wrap to two lines but stay within the viewport.

### AC5 — Repo-wide claim regression grep
- Status: PASS
- `grep -rEn "AI-|AI Enhanced|AI-powered|AI powered|artificial intelligence" app components lib` → zero matches.
- `grep -rEni "ages? 3-4|age 3-4" app components lib` → zero matches.
- Broader vocabulary `grep -rEn "real-time|realtime|analytics|automatic|intelligent|smart|predictive" app components lib` → one hit, in a code comment in `lib/startTeaching/useDefaultSubject.ts:6` (`handles that automatically`). Not user-visible, not a marketing claim — passes.
- Visible-DOM scan on `/` for any of the broader vocabulary words → zero hits.

### AC6 — Empty/error state
- N/A per ticket (static marketing surface, no data dependencies).

## Console / network observations (informational, out of LR-01 scope)
- One 404 captured: `GET http://localhost:3000/favicon.ico` returns 404. Pre-existing infra concern unrelated to marketing copy. Not introduced by this fix and not within LR-01's scope. Recording here for visibility; not filing as a bug under LR-01.
- Zero JavaScript console errors. Zero exceptions thrown. Zero warnings.

## Run history

### 2026-05-10 — padi-uat-agent (re-run, attempt 2)
- Verdict: PASS
- Scenarios: PASS 7 / FAIL 0 / BUG 0 / BLOCKED 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | No AI claims in rendered DOM | PASS | — | — |
  | UAT-02 | K-2 / ages 5-7 audience stated | PASS | — | — |
  | UAT-03 | Every named feature true today (or coming-soon framed) | PASS | — | — |
  | UAT-04 | Logged-in: same copy, no redirect | PASS (code review) | — | — |
  | UAT-05 | 375×667 chip single-line | PASS (CDP geometry + visual) | — | — |
  | UAT-06 | 375×667 subtitle/cards no overflow | PASS (CDP geometry + visual) | — | — |
  | UAT-07 | Repo-wide AI/age regression grep | PASS | — | — |
- Notes for padi-eng:
  - Eng_fix attempt 1 cleanly addressed both bugs from UAT-1. Audio pronunciation bullet is gone. PDF claim is reframed as `Printable worksheets (coming soon)`. Both bug files correctly carry `status: fixed`.
  - Pre-existing: `GET /favicon.ico` returns 404 in dev. Out of LR-01 scope; consider folding into a launch-readiness infra ticket.
- Notes for padi-design:
  - The Interactive Lessons card now has 3 bullets (Phonics-focused instruction, Visual word matching, Progress tracking) while the other two cards have 4. Visually fine — vertical alignment still reads cleanly in the mobile screenshot — but if symmetry matters to design, propose a real fourth bullet that reflects something the app actually does.
  - On the mobile render, the bullet `Printable worksheets (coming soon)` wraps the `(coming soon)` parenthetical to a second line. Still legible and still explicitly framed. If you want it on one line you could shorten to `Worksheets (coming soon)` or move the coming-soon flag to a small badge — both are stylistic choices, not blockers.
- Missing from ticket: nothing. The refined ticket fully covered the claim-audit category and eng followed through this iteration.

Verdict: PASS
