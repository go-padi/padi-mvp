---
id: LR-18b-UAT
ticket: LR-18b
title: "UAT — Logged-out /teacher/curriculum chapter overview cards (re-test post eng_fix)"
status: pass
created: 2026-05-15
updated: 2026-05-15
attempt: 2
prior_verdicts:
  - file: LR-18b-uat.md.stale-attempt-1
    verdict: FAIL
verification_method: source-inspection + tsc + lint
notes: |
  Re-test after eng_fix patched lr-18b-bug-01-intro-old-vocab and
  lr-18b-bug-02-inline-notes-wrong-strings (both marked status: fixed).
  Page is 'use client' — runtime DOM verification is not possible
  without hydration. Source-inspection is the canonical method
  per the orchestrator's acceptance of source-verified evidence.
---

Verdict: PASS

## Scope

Re-run the full LR-18b AC suite against:
- `lib/copy/curriculumOverview.ts` (new)
- `app/teacher/curriculum/page.tsx` (logged-out branch, lines 176–246)

## AC results

| # | AC | Status | Evidence |
|---|---|---|---|
| 1 | Intro paragraph string exact match | PASS | `lib/copy/curriculumOverview.ts:16` matches required text verbatim, including ~, em-dashes, "Accelerating, Practicing, or Specialist Track", and closing clause "Padi shows you which, every lesson." |
| 2 | Seven chapter cards in correct order | PASS | `CURRICULUM_OVERVIEW` array order at lines 19, 56, 63, 70, 84, 91, 105: Phonological Awareness → Alphabet → Phonics → Reading → Handwriting → Spelling → Vocabulary, Comprehension and Fluency |
| 3 | Three chapters use `<details open>` with sections | PASS | Phonological Awareness has 5 sections (lines 24–54: Learning Sensorially, Rhyming, Words & Sentences, Syllables, Phonemic Awareness). Reading has 1 section "Reading Exercises" (line 77). Spelling has 1 section "Spelling Exercises" (line 98). Render branch at page.tsx:201–219 uses `<details open>` when `chapter.sections` truthy. |
| 4 | Four chapters use inline italic notes with exact strings | PASS | Alphabet line 61: "Roughly 20 lessons in this chapter." — Phonics line 68: "Roughly 30–40 lessons in this chapter." — Handwriting line 89: "Roughly 25–30 lessons in this chapter." — VCF line 110: "Roughly 15–25 lessons in this chapter." All four use en-dash (U+2013) where ranges apply. Render branch at page.tsx:221–223 renders `<p class="text-xs italic ...">{inlineNote}</p>`. |
| 5 | CTAs are `<button>` onClick dispatching `padi-open-signin` | PASS | page.tsx:177–181 defines `openSignIn` dispatching `new Event('padi-open-signin')`. Per-chapter CTA at line 225–231 is `<button type="button" onClick={openSignIn}>`. Global CTA at line 236–242 is `<button type="button" onClick={openSignIn}>`. No `<a href="/sign-in">` anywhere in logged-out branch (grep confirms only the event dispatch reference). |
| 6 | No module content leaks in logged-out branch | PASS | Logged-out branch (lines 176–246) contains zero `chapter.modules.map`, zero `supabaseClient(...)` calls, zero `rpc(...)` calls. Render iterates `CURRICULUM_OVERVIEW.map((chapter) => ...)` over static TS constant only. |
| 7 | Logged-in branch unchanged | PASS | useEffect at lines 92–174 still gated `if (!isHydrated || !isLoggedIn) return;` (line 94). Hierarchical browser render at lines 256–415 unchanged (TeachingModeToggle, renderChapter, renderGroup, renderModuleRow all intact). |
| 8 | LR-18a gating on dynamic route preserved | PASS | `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:230` retains `if (!isLoggedIn)` early return, line 248 retains sign-in CTA via `padi-open-signin` event. No edits to that file. |
| 9 | `pnpm lint` exit 0 | PASS | 0 errors. One pre-existing warning in `lib/copy/assessmentStatusCopy.ts` (unrelated unused eslint-disable directive — not introduced by this ticket). |
| 10 | `pnpm tsc --noEmit` exit 0 | PASS | Empty output → 0 errors. New `lib/copy/curriculumOverview.ts` types `ChapterSection`, `ChapterOverview` exhaustive. |

## Bug verification (re-test of eng_fix)

| Bug | Prior severity | Fix verified | Evidence |
|---|---|---|---|
| lr-18b-bug-01-intro-old-vocab | P0 | YES | `lib/copy/curriculumOverview.ts:16` `CURRICULUM_INTRO` matches the required post-LR-26 affirmative 3-signal vocab string verbatim. Status in bug file: `fixed`. |
| lr-18b-bug-02-inline-notes-wrong-strings | P0 | YES | All four inlineNote strings (lines 61, 68, 89, 110) match the four required strings character-for-character including en-dash ranges. Status in bug file: `fixed`. |

## Notes

- The page is a `'use client'` component; SSR renders only the
  "Loading curriculum..." stub. Hydrated DOM cannot be verified
  via plain HTTP fetch. Source-inspection of the typed copy module
  and the JSX render branch is the canonical verification method
  for this iteration (orchestrator-approved).
- Per-chapter and global CTAs are `<button>`s wired to the
  global sign-in modal event (`padi-open-signin`), not `<a>` tags
  to `/sign-in` — the refined ticket required exactly this
  pattern because `/sign-in` is not a real route in this app.
- No new dependencies, no new components in `components/`, no
  new routes, no Supabase schema changes.

## Run history

### 2026-05-15 — padi-uat-agent (attempt 2, post eng_fix)
- Verdict: PASS
- Scenarios: 10 / 10 PASS, 0 FAIL, 0 BUG, 0 BLOCKED
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|---|---|---|---|
  | UAT-01 | Intro paragraph string exact match | PASS | — | — |
  | UAT-02 | Seven chapter cards in correct order | PASS | — | — |
  | UAT-03 | Three chapters use `<details open>` | PASS | — | — |
  | UAT-04 | Four inline italic notes exact strings | PASS | — | — |
  | UAT-05 | CTAs are `<button>` dispatching `padi-open-signin` | PASS | — | — |
  | UAT-06 | No module content leaks in logged-out branch | PASS | — | — |
  | UAT-07 | Logged-in branch unchanged | PASS | — | — |
  | UAT-08 | LR-18a gating on dynamic route preserved | PASS | — | — |
  | UAT-09 | `pnpm lint` exit 0 | PASS | — | — |
  | UAT-10 | `pnpm tsc --noEmit` exit 0 | PASS | — | — |
- Notes for padi-eng: both prior P0 bugs are fully fixed. No further changes requested.
- Notes for padi-design: copy fidelity matches LR-26 affirmative 3-signal vocab and the authored chapter blurbs from LR-18. Native `<details open>` collapsibles work as specced; estimate-only chapters use inline italic notes as specced.
- Missing from ticket: none. AC is now exhaustively testable from source.

### 2026-05-15 — padi-uat-agent (attempt 1, archived)
- Verdict: FAIL (archived to LR-18b-uat.md.stale-attempt-1)
- Reason: intro paragraph used old vocab; inline italic notes used wrong strings on all 4 estimate-only chapters.
