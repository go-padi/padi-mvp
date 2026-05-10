# Launch-Readiness Audit — 2026-05-10

Applied PM + Design + Instructional Design lenses across the whole app.
Output: prioritized ticket list and the reasoning behind each.

## Method

1. **Surface map.** Enumerated all routes, components, lib modules, env
   vars, demo-data files, and existing tickets.
2. **PM lens.** Asked: does each surface serve the activation north star
   (signup → role → student → lesson start → lesson complete)? What's
   missing? What's redundant?
3. **Design lens.** Spot-read primary surfaces (`/`, `/welcome/role`,
   `/teacher`, `/teacher/curriculum`, TopNav, teacher layout). Asked:
   are states present (loading/empty/error/auth)? Is copy correct?
   Mobile-first? Auth-gating sensible?
4. **Instructional Design lens.** Reused the 2026-05-09 audit
   (`assessments-grouping/instructional-redundancy-audit.md`) and asked
   the same standing questions for the curriculum browser and
   observation capture surfaces.
5. **Cross-checked** existing tickets to avoid duplicating work the
   board already knows about.

## Findings, by severity

### LAUNCH BLOCKER — must ship before public launch

**1. Marketing copy mismatch with target audience.** `app/page.tsx`
   says "ages 3-4" in the hero subtitle. The brief says K-2 (ages 5-7).
   The actual curriculum (`docs/curriculum/ind.pdf`) is K-Reading
   Kickstart, designed for K through grade-2. **Two mismatched age
   ranges in two sentences of marketing copy is a credibility-killer.**
   → LR-01

**2. False/unsupported "AI-Enhanced" / "AI-powered" marketing claim.**
   Same hero on `app/page.tsx`: "AI-Enhanced Reading Support",
   "AI-powered personalization." There is no AI in the app today.
   This is false advertising at launch. Either ship the AI or strip
   the claim. → LR-01

**3. No legal pages.** No privacy policy, no terms of service, no
   cookie consent UI, no 404 page, no error boundary page. For an app
   that will collect parent/teacher email addresses and create
   accounts, this is a launch-stop. → LR-02

**4. `/teacher/assessments` is audit-known-redundant** with the
   curriculum's embedded assessment moments. Per
   `assessments-grouping/instructional-redundancy-audit.md`, this
   route should be retired before launch so users don't encounter the
   broken metaphor on first contact. → LR-03

**5. Orphan / placeholder routes shipping to production:**
   - `/classes/[id]/today` — a hardcoded "coming soon" placeholder
   - `/classes/[id]/plan` — same family
   - `/start-teaching/page.tsx` is a re-export of `/teacher/page` and
     duplicates the same surface under a different URL
   - `/teacher/dashboard` redirects to `/teacher/curriculum` but the
     TopNav button labeled "Teacher Dashboard" goes here, then jumps
     to curriculum — disorienting
   None of these have user-facing value. They confuse Google's index
   and break user trust. → LR-04

### HIGH PRIORITY — should ship before launch

**6. `/library` vs `/teacher/curriculum` redundancy.** Both surfaces
   show curriculum modules; `/library` has filters, `/teacher/curriculum`
   has the chapter→group→module hierarchy. Two sources of truth for
   the same content with different shapes. Per the standing
   instructional-design question on "is the curriculum browser the
   right shape," this is open — but at minimum we shouldn't ship two
   browsers. Pick one (recommend `/teacher/curriculum`, since it
   matches the curriculum's actual structure), retire the other.
   → LR-05

**7. Role split is implemented at the data layer but invisible in
   the experience.** Profiles have a `role` column, `/welcome/role`
   sets it, copy in some surfaces uses `roleCopy.ts`, but the TopNav
   shows the same nav for parent and teacher (`Teacher Dashboard`,
   `Start Teaching` — both teacher-flavored even for parent users).
   The brief calls out parent as a primary user; the experience
   doesn't yet. Either fork the entry experience properly, or
   walk back the brief. → LR-06

**8. `/teacher/resources` has broken links.** All three resources have
   `href="#"`. Either wire them up or hide the page entirely. → LR-07

**9. Demo-data exposure when logged out.** Every authenticated surface
   shows demo data with a "Demo data" badge when the user isn't
   signed in. That's a deliberate design (preview mode), but at
   launch it means every parent who lands on `/teacher` sees fake
   children's names and fake assessment statuses. Audit each surface
   for whether demo data is the right preview, or whether logged-out
   should bounce to `/`. → LR-08

### MEDIUM — could defer to immediate post-launch

**10. No analytics, no error reporting, no telemetry.** KAN-137 is on
    the board (priority: medium, launch_blocker: true) for analytics.
    No equivalent ticket for error reporting (Sentry or similar).
    Recommend: bump KAN-137 to high in the same launch sprint, plus
    file LR-09 (not yet) for error reporting. Decision deferred — the
    launch can happen without these for the first cohort, with the
    understanding that we won't have funnel data on activation drop-off.

**11. Per-student observation log** (recommendation #3 from the
    instructional-redundancy audit) — strong launch enhancement but
    not a launch-stopper. Defer to v1.1 unless first-cohort feedback
    surfaces it as urgent.

### NOTE — context, not action items

- `/teacher/about` is a static method-explanation page. Could be
  marketing-quality but it's tucked behind a tab that requires
  logging in to reach (sort of — it's open but nav-gated). Worth
  reviewing for whether this content should live on the marketing
  site instead.
- `/teacher/resources` has placeholder resources (printables,
  classroom checklist, parent communication template) — see LR-07.
- 39 backlog tickets exist on the board. Many are stale Jira ports
  (per yesterday's audit on KAN-80/82/48). Bulk-fixing those isn't
  in this audit's scope but should happen before BuildLoop runs
  through them.

## Prioritized ticket list

| # | ID | Title | Severity | Complexity | Audit-clean? |
|---|---|---|---|---|---|
| 1 | LR-01 | Fix marketing copy — age range + AI claim | BLOCKER | XS | yes |
| 2 | LR-02 | Add legal pages (privacy, terms, 404, error) | BLOCKER | M | yes |
| 3 | LR-03 | Retire `/teacher/assessments` route | BLOCKER | S | yes (per prior audit) |
| 4 | LR-04 | Delete orphan / placeholder routes | BLOCKER | XS | yes |
| 5 | LR-05 | Resolve `/library` vs `/teacher/curriculum` redundancy | HIGH | M | partial (open IX question) |
| 6 | LR-06 | Role-aware navigation (parent vs teacher entry) | HIGH | M | yes |
| 7 | LR-07 | Wire `/teacher/resources` links or hide page | HIGH | XS | yes |
| 8 | LR-08 | Demo-data exposure review | HIGH | M | yes |

Recommended ship order: LR-01, LR-04, LR-03, LR-07, LR-02, LR-08, LR-06,
LR-05. (Do the cheap wins first to clear noise, then the bigger ones.)

## What this audit explicitly does NOT cover

- **Group track instructional review** (still open per the
  assessments audit). Should happen before LR-05 and LR-08 ship,
  since those decisions interact with whether a roster surface is
  needed for group lessons.
- **Per-route detailed UX review** (states, mobile, keyboard
  accessibility). Each ticket below assumes the implementation will
  do the obvious thing for states — but if you want a per-route
  state matrix, that's a separate, larger pass.
- **Performance / bundle size / lighthouse score.** Not evaluated.
- **Accessibility / WCAG compliance.** Not evaluated. Worth a
  dedicated audit pre-launch.
- **Database migrations / Supabase RLS policies.** Out of scope for
  product audit; assume eng has handled this in the role-split epic.

## How to use this audit going forward

The findings above are baked into BuildLoop's PM phase via
`docs/features/**/*audit*.md` glob. PM will read them when picking
the next iteration's feature and will auto-disqualify candidates
that thicken audit-killed surfaces (e.g. KAN-83 for assessments).

If you want BuildLoop to chew through LR-01 through LR-08 in order,
flip them all to `priority: highest` and `/buildloop-start 8`. The
auto-chain will iterate through them.
