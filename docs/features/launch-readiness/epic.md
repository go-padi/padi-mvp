---
id: LAUNCH
title: "Launch Readiness"
type: epic
status: in-progress
priority: highest
feature: launch-readiness
created: 2026-05-10
updated: 2026-05-11
created_by: launch-readiness-audit
---

# Launch Readiness

Pre-launch hygiene epic. Findings come from:
- `launch-readiness-audit-2026-05-10.md` (PM + Design + Instructional Design lenses across the whole app)
- `../../walkthroughs/walkthrough-2026-05-10-teacher.md` (teacher Loom walkthrough — generated LR-09 through LR-14)
- `../../walkthroughs/walkthrough-2026-05-11-parent.md` (parent + logged-out Loom walkthrough — generated LR-17 through LR-21)
- The instructional-redundancy audit in `../assessments-grouping/`

## Children

**Shipped via BuildLoop run 2026-05-10 (8 iterations, all to prod):**

1. ✅ LR-01 — Fix marketing copy: target audience age + AI claim
2. ✅ LR-02 — Add legal pages (privacy, terms, 404, error)
3. ✅ LR-03 — Retire `/teacher/assessments` route
4. ✅ LR-04 — Delete orphan / placeholder routes
5. ✅ LR-05 — Resolve `/library` vs `/teacher/curriculum` redundancy
6. ✅ LR-06 — Role-aware navigation (NAV-ONLY scope — see LR-20 for in-page sweep)
7. ✅ LR-07 — Wire `/teacher/resources` links or hide the page
8. ⚠️ LR-08 — Demo-data exposure review (NARROW SLICE — names + banner only; full surface audit deferred)

**Shipped via BuildLoop run 2026-05-11 (3 iterations):**

9. ✅ LR-15 — Match homepage copy to go-padi.com (supersedes part of LR-01)
10. ✅ LR-12 — Disambiguate "Continue Teaching" CTA
11. ✅ LR-16 — Homepage feature cards brand voice (PM auto-filed as LR-15 follow-up)

**Shipped via BuildLoop run 2026-05-12 (in-flight; 3 shipped):**

12. ✅ LR-09a — Fix progress-number data integrity (first slice)
13. ✅ LR-13a — Student progress view (first slice)
14. ✅ LR-13b — Student progress view (second slice)

**Backlog — next prioritization batch (post parent walkthrough 2026-05-11):**

Recommended ship order (per pm-sparring sequencing):

| Ship # | ID | Why this order |
|---|---|---|
| 1 | LR-20 | XS-S complexity, fastest blocker to retire (pure copy sweep) |
| 2 | LR-18 | M, biggest commercial-risk item (curriculum IP exposure) |
| 3 | LR-17 | S, ships same batch as LR-18 (logged-out experience pair) |
| 4 | LR-11 + LR-21 | Both M, "what's next" UX; ship together |
| 5 | LR-10 | High priority but lower than the above; curriculum-fidelity |
| 6 | LR-14 | Medium priority; audio recording per module |
| 7 | LR-19 | CONCERN-grade; can slip to v1.1 |
| 8 | LR-09 (remainder) | Continue iterating on data-integrity slices |

**All backlog tickets:**

- LR-09 — Fix progress-number data integrity (some shipped as LR-09a; remainder backlog)
- LR-10 — Allow re-entry to completed lessons (supersedes KAN-50; reconfirmed by parent walkthrough)
- LR-11 — Surface curriculum sequencing — make 'next module' obvious (pairs with LR-21)
- LR-13 — Student progress view (some shipped as LR-13a/13b; remainder backlog)
- LR-14 — Audio recording at module level
- **LR-17** — Fix logged-out students preview hang (supersedes KAN-58, KAN-72)
- **LR-18** — Replace logged-out curriculum browser with overview cards (gate full content)
- **LR-19** — Make signed-in identity unambiguous in sign-up + sign-in flows
- **LR-20** — Role-aware copy pass #2 — sweep all "Teacher Dashboard" strings (follow-up to LR-06)
- **LR-21** — Post-add-child clear next-action (parent onboarding; pairs with LR-11)

**Pending:** none — both walkthroughs (teacher + parent) audited.

## Folders

- `iterations/lr-01-*` through `iterations/lr-08-*` — BuildLoop run
  artifacts (UAT verdicts, bug files) from the 2026-05-10 ship.
  Pipeline scratch, kept for audit trail.

## Status

- 8 shipped, 7 in backlog. LR-15 + LR-09 are the next blockers; LR-11
  + LR-13 + LR-10 are the walkthrough findings that move the activation
  needle.
- This epic gates v1 launch.
