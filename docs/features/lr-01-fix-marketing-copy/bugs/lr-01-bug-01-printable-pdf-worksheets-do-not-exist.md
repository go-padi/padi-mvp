---
id: LR-01-BUG-01
title: "[LR-01] Homepage feature card claims 'Printable PDF worksheets' — no PDFs exist anywhere in the app"
type: bug
status: fixed
parent: LR-01
uat: LR-01-uat-1
severity: P1
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
discovered_by: padi-uat-agent
---

## Summary

The homepage hero feature card "Teacher Tools" lists `Printable PDF worksheets` as a present-tense capability bullet. The app ships zero downloadable PDF worksheets. This is the exact class of false marketing claim LR-01 was opened to scrub. The AI claims were removed, but this aspirational capability slipped through the feature-card audit.

## Steps to reproduce

1. `curl -s http://localhost:3000/` (or load the homepage in a browser).
2. Read the second feature card in the hero ("Teacher Tools").
3. Observe the bullet list contains the literal string `Printable PDF worksheets`.

## Expected

Per LR-01 refined AC #5 ("Every named feature exists in the app today (or is explicitly framed 'coming soon')"), this bullet must either:
  - point at an actual downloadable PDF asset, or
  - be reframed as `Printable worksheets (coming soon)`, or
  - be removed.

## Actual

- `app/page.tsx:52` literally renders `"Printable PDF worksheets"` as a present-tense bullet.
- The repo has **no `public/` directory** (verified via `ls /Users/nishaiyer/Desktop/padi-app/padi-app-starter/public` → `No such file or directory`).
- No PDF library is installed (`grep -rEn '\.pdf|pdfkit|jsPDF|react-pdf'` across `app components lib public` → zero matches).
- The only "printable" surface is `app/teacher/resources/page.tsx`, where all three resource cards have `href: '#'` stubs and no actual file is served. None of them is a PDF worksheet — they are a Silence Game one-pager, a classroom checklist, and a parent-comms template, all stubbed.

## Evidence

- Source: `app/page.tsx:52` — `"Printable PDF worksheets",`
- Source: `app/teacher/resources/page.tsx:4-8` — all `href: '#'` stubs, no PDF assets.
- Filesystem: `/Users/nishaiyer/Desktop/padi-app/padi-app-starter/public` does not exist.
- Rendered DOM: visible-text extract from `http://localhost:3000/` confirms the string is shown to logged-out users.

## Suggested fix

Either:
1. Remove the bullet entirely, or
2. Reframe as `Printable worksheets (coming soon)`, matching the LR-01 "coming soon" framing rule from Notes.

## Files to touch

- `app/page.tsx` (line 52, the `bullet` array under `Teacher Tools`).

## Fix Notes

**Root cause:** The "Teacher Tools" hero feature card on the homepage advertised `Printable PDF worksheets` as a present-tense capability, but no PDF asset, no `public/` directory, and no PDF generation library exist in the repo. The LR-01 AI-claims pass missed this aspirational bullet.

**Files changed:**
- `app/page.tsx` — bullet text changed from `"Printable PDF worksheets"` to `"Printable worksheets (coming soon)"` in the `Teacher Tools` card's `bullet` array.

**Why this fix is correct:** Reframing as "(coming soon)" satisfies LR-01 refined AC #5 ("Every named feature exists in the app today, or is explicitly framed 'coming soon'") without removing the line item, which preserves the card's visual balance and signals the intended future capability. Dropping the word `PDF` also removes the implicit promise of a specific file format we don't yet ship — a generic "printable worksheet" is a less specific, more honest commitment for a future deliverable.
