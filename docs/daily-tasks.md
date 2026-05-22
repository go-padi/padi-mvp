# Daily Tasks — Running List

**How this works**

Claude refreshes this file at the end of each day with a new entry for tomorrow. Newest day is at the top. Completed days stay below as a running log — strike them through or mark `[x]` but don't delete. Ask Claude to "update daily tasks" at end of day to add the next morning's list.

Format per day:
- **Top priorities** — 1-3 must-move-the-needle items
- **Checklist** — everything else on deck
- **Notes / blockers** — context you'll want when you open this in the morning

---

## Fri 2026-05-22

### Top priorities

**Single-ticket BuildLoop run for LR-14 (in-browser audio recording):**

```
/buildloop:buildloop-start 1
```

PM will pick `LR-14` (the only `priority: highest` + `status: ready` ticket
in launch-readiness right now). This is the last UX gap before mom can run
real lessons end-to-end on the platform — record audio in-browser, rate
with 3-signal picker, save.

Why this is launch-blocking: nothing else gates first real-student
sessions. Schema is done, 3-signal vocab is done, rating UI is done,
`lesson-attachments` bucket exists. Only the MediaRecorder UI is missing.

Spec lives at `docs/features/launch-readiness/lr-14-in-browser-audio-recording.md`.
Scope is intentionally narrow (UI-only, new
`components/AudioRecorder.tsx`, no schema/backend changes).

After it ships, run a real mom-test on iPad Safari before declaring v1
launch-ready.

### Notes

- The "easy way to record from the platform" the user asked for IS
  MediaRecorder API; LR-14 spec calls out the MIME-type fallback
  (`audio/webm;codecs=opus` on Chrome, `audio/mp4` on Safari).
- Nisha is working the model side separately — this ticket is purely
  the data-collection front-end she needs.

### Outstanding manual work

- LR-23 — Wire `eslint-plugin-react-hooks` (still pending, 10-15 min
  manual PR).
- BuildLoop tech-debt cluster (BLDTD-*) — see
  `docs/features/buildloop-tech-debt/` if a tooling fix is wanted
  before the next loop.

---

## Wed 2026-05-13

### Top priorities

**Run BuildLoop NEXT (copy-coherence cluster):**

```
/buildloop:buildloop-start 3
```

Only three tickets at `priority: highest` — PM will pick exactly these in this order:

1. **LR-26** — 3-signal vocab migration: Ready/Needs Help/Needs Intervention → Accelerating/Practicing/Specialist Track. **No DB migration needed** — confirmed `students.assessment_status` has no CHECK constraint in `supabase/schema.sql`. Pure TypeScript + component edits. M complexity.
2. **LR-25** — Homepage rewrite #2 (Accelerate framing, 6-card features grid, 3-step How-It-Works, About Mona, final CTA, page metadata). Depends on LR-26's strings. M complexity.
3. **LR-27** — `/teacher/about` refresh (Why Padi paragraph + Mona credibility section + new 3-signal vocab). S complexity.

Estimated run time: ~25 min hands-off. After it completes, eyeball padi-mvp.vercel.app to confirm the cluster looks consistent (homepage + about + signal pills all in the new voice).

### Manual work (outside BuildLoop)

Reserved for founder/manual PR — too fragile or too small for BuildLoop to handle well:

- **BLDTD-01, 02, 03, 04** — BuildLoop tooling fixes. Demoted to `priority: medium` so BuildLoop won't bite them. Fix as a single manual tooling PR (~45 min including the 4-copy propagation pattern). After landing, do a 1-iter BuildLoop test on a trivial ticket to verify all four fixes hold.
- **LR-23** — Wire `eslint-plugin-react-hooks` (10-15 min, manual PR — not worth a BuildLoop iteration).

### After the cluster ships — next batch options

These are all `priority: high` and ready when you decide what's next:

- **LR-18 remainder** — full curriculum gating (LR-18a covered lesson detail only; chapter overview cards remain)
- **LR-09 remainder** / **LR-10** / **LR-11** / **LR-13 remainder** — migration-touching tickets. Decide migration strategy first (pre-run vs `allow_migration_this_iteration: true`).
- **LR-19** / **LR-21 remainder** — sign-in identity clarity + parent onboarding remainder
- **LR-08** — full demo-data exposure audit (narrow slice already shipped)

### Notes / blockers

- **Symlink check before running BuildLoop:** `ls -la ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0` should show `→ /Users/nishaiyer/Desktop/padi-app/padi-app-starter/.plugins/buildloop`. If not, recreate per `docs/buildloop-handoff.md` "Known gotcha — CC reads a stripped slash command" section.
- **Don't edit files mid-run** — BLDTD-01 (deploy_prod git add -A sweep) still bites. Anything uncommitted gets bundled into the next iteration commit.
- **Last loop shipped 8 features** (LR-20, LR-17, LR-18a, KAN-143, LR-19a, KAN-141, LR-21a, LR-22). All slices. PM continues to split big tickets — healthy pattern.
- **17 LR shipped, 3 next-up, 9 backlog after that.** Roughly 1/3 of original launch-readiness work remains.
- **Branch cleanup overdue:** `git branch -d buildloop/lr-{20,17,18a}-* buildloop/kan-{143,141}-* buildloop/lr-{19a,21a,22}-*` after confirming each merged to main via ff.

---

## Tue 2026-05-12

### Top priorities
1. **LR-20 — Role-aware copy pass #2** (BLOCKER, XS-S, fastest win). Sweep all hard-coded "Teacher Dashboard" strings across `app/page.tsx`, `app/teacher/layout.tsx`, `app/teacher/page.tsx`, `app/students/page.tsx`. Use the `rolePhrase()` helper from `lib/copy/roleCopy.ts`. This is the NEXT BuildLoop pick — flip to `priority: highest` (already is) and demote everything else to clear the field.
2. **LR-18 — Gate logged-out curriculum content** (BLOCKER, M, highest commercial-risk item). Replace logged-out curriculum browser with chapter/section overview cards; gate full lesson content behind login. Needs chapter/section description copy authored first (~30 min source from `docs/curriculum/ind.pdf` + `group.pdf`); after that the build is straightforward. Pairs with LR-17.
3. **LR-17 — Fix logged-out students preview hang** (BLOCKER, S). Ships in same batch as LR-18 since both reshape the logged-out experience.

### Checklist

- [ ] Confirm BuildLoop iter-4+ from yesterday's run completed (was paused on pm_generate when last checked). If still paused, `/buildloop:buildloop-step --all` to finish. Otherwise verify what LR tickets shipped past LR-13b.
- [ ] **Author chapter/section overview copy for LR-18** from the curriculum PDFs. ~30 min. Drop into LR-18 ticket as a "## Authored copy" section before BuildLoop picks it.
- [ ] Demote everything except LR-20, LR-18, LR-17 to `priority: high` (or lower). Keep only those three at `highest` so PM picks the right batch.
- [ ] `/buildloop:buildloop-start 3` — should ship LR-20 + LR-18 + LR-17 in one run. With yesterday's auto-chain pseudocode + mid-loop /compact patches, this should run hands-off all the way through.
- [ ] If BuildLoop ships those, then `/buildloop:buildloop-start 3` again for LR-11 + LR-21 (parent-onboarding pair) + LR-10.
- [ ] Eyeball padi-mvp.vercel.app after each ship to verify Vercel deployed (no token = "assumed READY"; eyeball is the verification).
- [ ] **Update the padi-pm skill** when next editing it: retire the "Content is always visible regardless of auth state" Key Product Rule. New rule: "Content overview (chapter/section descriptions, lesson counts, time estimates) is always visible. Full lesson content is gated behind login." LR-18 implements this; the skill rule needs to match. Meta-task, not blocking the ticket.

### Notes / blockers

- **Parent walkthrough audited 2026-05-11.** 5 new tickets filed (LR-17 through LR-21) + 1 confirmed (LR-10) + 3 superseded (KAN-58, KAN-59, KAN-72 deleted from bugs/). See `docs/walkthroughs/walkthrough-2026-05-11-parent.md` for full findings + sequencing rationale.
- **15 launch-readiness tickets shipped total** as of 2026-05-12 noon (LR-01..08 from 5/10 run, LR-12+15+16 from 5/11 run, LR-09a+13a+13b from 5/12 in-flight run).
- **10 LR tickets still backlog:** LR-09 remainder, LR-10, LR-11, LR-13 remainder, LR-14, LR-17, LR-18, LR-19, LR-20, LR-21.
- **BuildLoop tooling all patched** (acceptEdits flag, bugs glob, no-op detection, _scratch_dir routing, auto-chain pseudocode + /compact). Loop should now survive N≥3 runs hands-off. If it drops out, that's a real bug worth filing.
- **Key product rule changed:** Padi now intentionally GATES full curriculum content for logged-out visitors. LR-18 ships this. The earlier "content always visible" rule was retired by founder direction on 2026-05-11. Make sure design / PM / marketing all align before launch — the marketing site at go-padi.com may need a corresponding "log in to see lessons" framing if it's currently advertising open-access content.

---

## Mon 2026-05-11

### Top priorities
1. **LR-15 — Replace homepage copy with go-padi.com source-of-truth** (blocker, supersedes part of LR-01). The placeholder marketing copy that landed in LR-01 is technically correct but not Padi's brand voice. Pull the canonical copy from https://go-padi.com/ and replace `app/page.tsx` strings only. ~30 min once copy is captured. File: `docs/features/launch-readiness/lr-15-match-go-padi-marketing-copy.md`.
2. **LR-09 — Fix progress-number data integrity** (blocker). The teacher walkthrough exposed broken `"13 of 197"` numerators, section duplicates, and inconsistent denominators. This is bigger than the X-of-Y framing fix; the underlying data math is wrong. File: `docs/features/launch-readiness/lr-09-fix-progress-data-integrity.md`.
3. **Decide which of LR-11 / LR-13 / LR-10 ships in the next BuildLoop batch.** All three came out of the walkthrough audit. LR-11 (next-module obvious) probably matters most for activation; LR-13 (student progress view) replaces what assessments did; LR-10 (lesson re-entry) is curriculum-fidelity. Pick 2-3 to flip to `priority: highest` and run `/buildloop:buildloop-start 3` (or more).

### Checklist

- [ ] Capture canonical hero / subtitle / eyebrow / feature copy from https://go-padi.com/ (just visit the site, screenshot or copy the text)
- [ ] Flip LR-15 frontmatter to `priority: highest` (already there) and `launch_blocker: true` (already there). Same for LR-09.
- [ ] Decide ship order for the next batch (LR-15 + LR-09 + one walkthrough finding) and flip them to `priority: highest`
- [ ] In the repo root: `claude` → `/buildloop:buildloop-start 3` (auto-chain handles everything; no per-step approvals)
- [ ] Verify the symlink before kicking off: `ls -la ~/.claude/plugins/cache/padi-plugins/buildloop/0.1.0` should show an arrow to `.plugins/buildloop`
- [ ] Once running, leave the dashboard artifact open (`padi-app-dashboard`) — refresh button after each ship to see what changed
- [ ] **Parent walkthrough** — record the parent-mode Loom (same flow as teacher walkthrough). Drop the transcript into the chat and ask for an audit. Will likely surface 2-4 more LR tickets.
- [ ] If credits/time allow: bulk-flip stale frontmatter on backlog tickets in `docs/features/start-teaching-flow/` (KAN-51, 54, 55, 56, 64, 73) — decide keep / supersede / delete for each. Optional, ~10 min.
- [ ] Transfer Google Workspace billing from Squarespace reseller to direct billing (admin task — was at `_orphaned/kan-95-*`, now retired since `_orphaned/` was deleted; tracking here)
- [ ] End of day: update this file with Tue 2026-05-12 tasks

### Notes / blockers

- **BuildLoop tooling patches are now persisted** (2026-05-10 late). `claude_cli.py` has `--permission-mode acceptEdits` and `phases.py` has the broader bugs glob + no-op build detection across all four plugin file copies. See `docs/buildloop-handoff.md` "Plugin file divergence" section for the four-copy architecture and recommended post-launch consolidation.
- **`docs/features/` was cleaned up** 2026-05-10/11:
  - `assessments-grouping/` reduced to audit + one done ticket (`epic.md` marks it superseded by LR-13)
  - `teacher-resources/` reduced to epic only (LR-07 hid the route; v1.1 work)
  - `_orphaned/` deleted entirely (12 files — all superseded by LR work or historical)
  - 8 top-level `lr-*/` iteration-scratch folders moved under `launch-readiness/iterations/`
  - Duplicate `lr-15-match-homepage-copy-to-go-padi-com.md` deleted (kept `lr-15-match-go-padi-marketing-copy.md`)
  - KAN-50, KAN-53, KAN-63 marked superseded with pointers to their LR successor
- **15 launch-readiness tickets total** filed. 8 shipped, 7 backlog (LR-09 through LR-15).
- KAN-137 (PostHog analytics util) stays at `priority: medium` — user explicitly wants the app shippable first, analytics second. Bump pre-launch when ready to wire events.
- The role-split epic (KAN-127) is now marked `shipped` — six children landed plus LR-06 added the role-aware nav layer.
- LR-08 only shipped a narrow slice (names + banner). Full demo-data surface audit still owed pre-launch.
- Marketing copy direction: source-of-truth is **https://go-padi.com/**. If it's wrong or stale, escalate to the marketing-site side before patching the app.

---

## Thu 2026-04-23

### Top priorities
1. **Teacher-landing-gating follow-up** — `/teacher` still leaks Group mode UI (toggle, "Add Group", "iyers" GROUP card) to parents; biggest remaining parent-UX gap and blocks the epic's "one release" ship.
2. **KAN-132 copy role-neutral pass** — Last backlog slice inside KAN-127 that's user-visible; pairs naturally with the landing-gating work since both touch parent copy.
3. **Parent deep-link redirect bug (`followup-kan-135-parent-redirect.md`)** — Confirm intended behavior with Nisha, then either narrow the guard or update KAN-131/135 UAT to match.

### Checklist

- [ ] Write CC prompt at `docs/features/role-split/cc-prompt-followup-teacher-landing-gating.md` — reuse the KAN-131 `effectiveMode` pattern, do NOT mutate `useTeachingMode()`
- [ ] Confirm teacher-landing-gating tests assert parent hides toggle + "Add Group" + group-labeled cards, and teacher view is pixel-identical to `main`
- [ ] Decide Option A vs B on the parent-redirect bug; if A, draft CC prompt to narrow the `/teacher/curriculum` guard to `role === null` only
- [ ] Draft CC prompt for KAN-132 (copy role-neutral pass) at `docs/features/role-split/cc-prompt-kan-132.md`
- [ ] Review KAN-133 analytics spec — decide whether parent-redirect + landing-gating events fold in here
- [ ] Run every new CC diff through Codex before merge; keep the whole KAN-127 chain on its feature branch — don't let anything ship to prod solo
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — still pre-role-split release? Any hotfix candidates?
- [ ] Glance at `docs/features/before-go-live/epic.md` KAN-123 — does staging env need to be stood up before the role-split ships?
- [ ] End of day: update this file with Fri 2026-04-24 tasks

### Notes / blockers

- As of today: KAN-128/129/130/131 merged + `bug-role-save-400` fixed. KAN-127 epic still held as one release — KAN-132, KAN-133, and the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating) still need to land before shipping.
- KAN-135 UAT (2026-04-21) flagged the two follow-ups — curriculum gating is correct in-app but breaks on deep link; landing page still shows group controls to parents.
- CC prompt docs go under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Tue 2026-04-21

### Top priorities
1. **KAN-129 (expose role in store)** — Assuming KAN-128 migration landed Monday, this unblocks 130/131 and is the next link in the role-split chain.
2. **KAN-130 onboarding role picker** — Prep the CC prompt doc so it's ready to hand off the moment 129 is in; this is the first user-visible piece of the epic.
3. **Board sweep follow-up** — Close the loop on anything flagged in Monday's `/board-review` (orphaned tickets, bugs jumping the queue, KAN-123 staging status).

### Checklist

- [ ] Verify KAN-128 actually landed on dev Supabase — check `lib/database.types.ts` was regenerated and `profiles.role` exists
- [ ] Write CC prompt for KAN-129 at `docs/features/role-split/cc-prompt-kan-129.md` — reuse pattern from KAN-128 handoff
- [ ] Review KAN-130 ticket + UAT and draft the CC prompt so it's queued behind 129
- [ ] Run KAN-128 and KAN-129 diffs through Codex before merging (remember: do not merge role-split children to prod individually)
- [ ] Revisit `docs/features/before-go-live/epic.md` KAN-123 — decide if staging env work needs to happen in parallel or blocks the role-split release
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — does any of this need a hotfix before role-split lands?
- [ ] Clean up `docs/features/_orphaned/` — archive, group, or promote each item
- [ ] End of day: update this file with Wed 2026-04-22 tasks

### Notes / blockers

- KAN-127 epic still ships as one release — 128→129→130→131→132→133 all go together, held on a feature branch or flag.
- KAN-128 is a two-step migration (nullable add → backfill teacher → NOT NULL + CHECK). Confirm the NOT NULL step was actually applied before moving on to 129.
- CC prompt docs go under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Mon 2026-04-20

### Top priorities
1. **KAN-128** — Land the `role` column migration on `profiles` (foundation for the whole role-split epic; KAN-129 and KAN-130 are blocked on this).
2. **Sequence the rest of KAN-127** — Confirm the order KAN-128 → 129 → 130 → 131 → 132 → 133 still reflects what ships together as one release, and decide which of these CC picks up after 128 merges.
3. **Board sweep** — Pass over `docs/features/` to surface anything stale before the week kicks off.

### Checklist

- [ ] **First thing:** Restart Claude.app (⌘Q — don't just close the window) and run the verification list in `INSTALL.md`
- [ ] Read current state of `role-split-cc-handoff.md` and confirm KAN-128 requirements still match what you want
- [ ] Hand KAN-128 to Claude Code — write the prompt doc as `docs/cc-prompt-kan-128.md` referencing the Jira ticket
- [ ] Verify migration ran cleanly on dev Supabase after CC pushes (check `lib/database.types.ts` regenerated)
- [ ] Run `/board-review` to get a status snapshot across all feature folders
- [ ] Triage `docs/features/_orphaned/` — anything in there that should be grouped or archived?
- [ ] Check `docs/features/bugs/` for anything that should jump ahead of role-split work
- [ ] Glance at `docs/features/before-go-live/epic.md` (KAN-123 staging env) — is that blocking role-split shipping?
- [ ] End of day: update this file with Tue 2026-04-21 tasks

### Notes / blockers

- KAN-127 ships as one release — don't merge child tickets to prod individually. Stage them behind a feature branch or flag until all six are green.
- KAN-128 is a two-step migration (nullable add → backfill teacher → NOT NULL + CHECK). If CC tries to do it in one step, push back.
- Lovable was cancelled 2026-04-19 — all new frontend work goes through CC now. Don't send any new prompts to Lovable.
- Codex is still the code reviewer. Run any CC diff through Codex before merging.

---

<!-- Older days accumulate below this line -->
