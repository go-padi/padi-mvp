# Daily Tasks — Running List

**How this works**

Claude refreshes this file at the end of each day with a new entry for tomorrow. Newest day is at the top. Completed days stay below as a running log — strike them through or mark `[x]` but don't delete. Ask Claude to "update daily tasks" at end of day to add the next morning's list.

Format per day:
- **Top priorities** — 1-3 must-move-the-needle items
- **Checklist** — everything else on deck
- **Notes / blockers** — context you'll want when you open this in the morning

---

## Sun 2026-05-03

### Top priorities
1. **Finish whatever Saturday's KAN-127 prod sanity check left open** — If Sat confirmed the role-split chain is live, close the loop by marking `docs/features/role-split/epic.md` "shipped". If Sat surfaced a regression or KAN-127 didn't actually land Thu/Fri, capture the state in the epic doc so Monday opens with full context — do NOT attempt a weekend merge or deploy.
2. **Finish the bugs-folder next-sprint call** — Quiet Sunday window to write the one-line "ride-along / backlog / close" call into each `docs/features/bugs/` folder (KAN-58, 59, 63, 72, signup-modal-closes-on-text-selection) so Monday's first decision is already made.
3. **Pre-stage Monday's next epic** — Skim `docs/features/before-go-live/epic.md` (KAN-123 staging env) plus `docs/features/_orphaned/` and write a one-line "this is next" note so Monday's first move is unambiguous.

### Checklist

- [ ] If Sat's prod smoke is complete and clean: mark `docs/features/role-split/epic.md` as "shipped" with the deploy date
- [ ] If Sat's prod smoke surfaced a regression: write the failure mode + reproduction steps at the top of `docs/features/role-split/epic.md` and queue (do NOT ship) a fix prompt for Monday
- [ ] If Sat didn't get to the prod smoke at all: do a 10-minute spot check on `padi-mvp.vercel.app` — parent signup → role pick → parent home (no Group toggle/Add Group/group cards on `/teacher`) and teacher signup → teacher home pixel-identical to pre-epic baseline
- [ ] Spot-check prod analytics events fired since the role-split deploy (role-pick, parent-redirect, landing-gating) — note any gaps in the epic doc
- [ ] Walk each folder under `docs/features/bugs/` and write the one-line next-sprint call (ride-along / backlog / close) inline at the top of each
- [ ] Read `docs/features/before-go-live/epic.md` (KAN-123) and write a one-line "next epic priority?" call into the doc
- [ ] (Optional) Triage `docs/features/_orphaned/` — archive, group, or promote one or two items to clear the noise
- [ ] End of day: update this file with Mon 2026-05-04 tasks

### Notes / blockers

- Weekend day — keep it light. Sunday is for closing the loop on KAN-127 ship status and clearing decisions off Monday's plate, not for new CC work.
- Hard rule: NO merges or prod deploys over the weekend. If Sat surfaced a bug, queue the fix as a CC prompt under `docs/features/role-split/` and ship Monday after Codex review.
- KAN-127 chain still ships as one release — even a hotfix to it should not go solo.
- CC prompt docs live under `docs/features/<feature>/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Sat 2026-05-02

### Top priorities
1. **Post-ship sanity check on KAN-127 in prod** — Quiet weekend window to confirm the role-split epic actually landed Thu/Fri as planned and that both parent + teacher flows are behaving on `padi-mvp.vercel.app`. Catching a regression Saturday is much cheaper than catching it Monday morning.
2. **Decide what rides into next sprint from `docs/features/bugs/`** — Now that role-split is (hopefully) out, write a one-line "next sprint?" call into each bug folder (KAN-58, 59, 63, 72, signup-modal-closes-on-text-selection) so Monday isn't a fresh decision.
3. **Light prep for Monday's next epic** — Skim `docs/features/before-go-live/epic.md` (KAN-123 staging env) and `docs/features/_orphaned/` to figure out what the next biggest unblocker is post-role-split.

### Checklist

- [ ] Confirm KAN-127 chain is live on prod — smoke parent signup → role pick → parent home (no Group toggle/Add Group/group cards on `/teacher`) and teacher signup → teacher home pixel-identical to pre-epic baseline
- [ ] Spot-check prod analytics: are role-pick / parent-redirect / landing-gating events firing as expected?
- [ ] Confirm `docs/features/role-split/epic.md` is marked "shipped" (do it now if Thursday didn't)
- [ ] If KAN-127 did NOT ship Friday: write a single note at the top of `docs/features/role-split/epic.md` capturing what blocked it so Monday opens with full context — do NOT attempt to merge or deploy over the weekend
- [ ] Read each folder under `docs/features/bugs/` and write a one-line next-sprint call into each (ride-along candidate vs. backlog vs. close)
- [ ] (Optional) Glance at `docs/features/before-go-live/epic.md` KAN-123 — is staging env now the highest-priority unblocker for the next release?
- [ ] (Optional) Triage `docs/features/_orphaned/` — archive, group, or promote into next epic
- [ ] End of day: update this file with Sun 2026-05-03 tasks

### Notes / blockers

- Weekend day — keep it light. Saturday is for confirming Thu/Fri's role-split ship stuck and clearing the deck for next week, not for new CC work.
- If KAN-127 did NOT ship Friday, do NOT merge or deploy over the weekend. Wait until Monday so Codex review + a clean staging dry-run on KAN-123 are still in play. KAN-127 chain still ships as one release.
- CC prompt docs live under `docs/features/<feature>/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Thu 2026-04-30

### Top priorities
1. **Ship KAN-127 role-split epic to prod** — If KAN-133 analytics + both KAN-135 follow-ups landed Wednesday, this is the day the whole chain (KAN-128→133 + bug-role-save-400 + landing-gating + parent-redirect) flips to prod as one release. Don't let it slip another day if it's green.
2. **Full staging dry-run of the role-split chain** — Before flipping, walk both flows on staging (KAN-123): parent signup → role pick → parent home (no Group toggle / Add Group / group cards anywhere on `/teacher`); teacher signup → teacher home pixel-identical to `main`; analytics events fire for role pick + redirects + landing gating.
3. **Bugs triage call: ship with role-split or hold?** — Final decision on `docs/features/bugs/` (KAN-58, 59, 63, 72, signup-modal-closes-on-text-selection) — anything that should piggyback the release vs. wait for a follow-up.

### Checklist

- [ ] Confirm KAN-133 analytics merged + Codex-clean; verify events fire on role pick, parent `/teacher/curriculum` redirect, and parent landing-gating in dev
- [ ] Confirm both KAN-135 follow-ups (parent-redirect, teacher-landing-gating) are resolved — either Option A guard-narrowing shipped or Option B UAT acceptance criteria updated and KAN-131/135 UAT closed
- [ ] Run the full KAN-127 feature branch through Codex one more time end-to-end before merging to main
- [ ] Verify staging env (KAN-123) is up and the role-split feature branch is deployed there; if staging isn't stood up, that becomes today's blocker — queue the CC prompt immediately
- [ ] End-to-end smoke on staging: parent signup → role picker → parent home (no Group toggle/Add Group/group cards on `/teacher`); teacher signup → teacher home pixel-identical to main; deep-link to `/teacher/curriculum` as parent behaves per chosen option
- [ ] If green: merge KAN-127 chain to main as one release; tag, deploy to prod, and post-deploy smoke both flows
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72, signup-modal-closes-on-text-selection) — final call on which (if any) ride along with role-split vs. queue for next sprint
- [ ] Update `docs/features/role-split/epic.md` to "shipped" once prod deploy is confirmed
- [ ] End of day: update this file with Fri 2026-05-01 tasks

### Notes / blockers

- KAN-127 status entering Thursday (best case): KAN-128/129/130/131/132 + `bug-role-save-400` merged on feature branch; KAN-133 analytics + both KAN-135 follow-ups (parent-redirect, teacher-landing-gating) expected merged Wednesday. If any of those slipped, that's Thursday's first move before staging dry-run.
- Do not flip the role-split branch to prod without a successful staging dry-run on KAN-123. If staging still isn't stood up, that's the actual blocker — get it up today.
- KAN-127 chain ships as one release — do not merge child tickets to prod individually under any circumstances.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Wed 2026-04-29

### Top priorities
1. **Land KAN-133 analytics** — Last remaining KAN-127 slice; once it merges + Codex-clean, the role-split epic is shippable as one release.
2. **Close out parent-redirect + teacher-landing-gating follow-ups** — Both KAN-135 follow-ups must be resolved (Option A shipped or UAT updated to match Option B) before the epic can ship; without this, KAN-131/135 UAT stays open.
3. **Pre-stage release: KAN-123 staging env + final Codex sweep** — Verify staging is up and the full KAN-127 chain holds together end-to-end on the feature branch so flipping to prod is a one-step move.

### Checklist

- [ ] Confirm Tuesday's KAN-132 copy pass + any landing-gating work merged on the role-split feature branch and passed Codex
- [ ] Hand the KAN-133 CC prompt to Claude Code (or finish drafting `docs/features/role-split/cc-prompt-kan-133.md` if Tuesday left it incomplete) and verify analytics events fire for role pick, parent redirect, and landing gating
- [ ] Resolve parent-redirect bug: if Option A, verify the `/teacher/curriculum` guard-narrowing CC prompt landed + tests assert teachers still pass through; if Option B, confirm `followup-kan-135-parent-redirect.md` UAT acceptance criteria are updated and KAN-131/135 UAT can close
- [ ] Run every new CC diff through Codex before merge — KAN-127 chain still ships as one release on its feature branch, no solo merges to prod
- [ ] Check `docs/features/before-go-live/epic.md` KAN-123 — is staging env stood up? If not, queue the CC prompt today so it's ready when KAN-133 lands
- [ ] End-to-end smoke on the role-split feature branch: parent signup → role picker → parent home (no Group toggle/Add Group/group cards on `/teacher`); teacher signup → teacher home (pixel-identical to main); deep-link to `/teacher/curriculum` as parent behaves per Option A/B decision
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — final hotfix call; anything that needs to ship alongside or before role-split?
- [ ] End of day: update this file with Thu 2026-04-30 tasks

### Notes / blockers

- KAN-127 status entering Wednesday: KAN-128/129/130/131 merged + `bug-role-save-400` fixed; KAN-132 expected merged Tuesday. Remaining: KAN-133 analytics + the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating). Once those land, epic is shippable as one release.
- Confirm KAN-123 staging env status before pushing KAN-133 — don't want analytics + role-split landing on prod with no staging dry-run.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Tue 2026-04-28

### Top priorities
1. **Close out KAN-132 (copy role-neutral pass)** — With landing-gating expected merged Monday, KAN-132 is the last user-visible slice of KAN-127; once it's in, only KAN-133 analytics blocks the one-release ship.
2. **Resolve parent deep-link redirect bug** — If Option A vs B was decided Monday, queue the CC prompt today so KAN-131/135 UAT can finally close.
3. **Stand up KAN-133 analytics + pre-stage release checklist** — Draft KAN-133 prompt and start lining up staging env (KAN-123) + final Codex sweep so the role-split epic can ship as one release this week.

### Checklist

- [ ] Confirm Monday's teacher-landing-gating + KAN-132 CC work fully merged + Codex-clean; finish anything still pending first thing
- [ ] If KAN-132 still in flight, hand the CC prompt to Claude Code and verify role-neutral copy across teacher + parent surfaces
- [ ] Draft CC prompt at `docs/features/role-split/cc-prompt-kan-133.md` for analytics — decide whether parent-redirect + landing-gating events fold in
- [ ] If Option A on parent-redirect bug: ship the `/teacher/curriculum` guard-narrowing prompt to CC. If Option B: update KAN-131/135 UAT acceptance criteria in `followup-kan-135-parent-redirect.md`
- [ ] Run every new CC diff through Codex before merge — no solo merges to prod; KAN-127 chain still ships as one release on its feature branch
- [ ] Check `docs/features/before-go-live/epic.md` KAN-123 — does staging env need to stand up this week to unblock the role-split release?
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — final hotfix call before role-split ships
- [ ] End of day: update this file with Wed 2026-04-29 tasks

### Notes / blockers

- KAN-127 status entering Tuesday: KAN-128/129/130/131 merged + `bug-role-save-400` fixed. KAN-132, KAN-133, and the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating) are the remaining slices — landing-gating expected merged Monday, parent-redirect direction expected picked Monday.
- Once KAN-132 + KAN-133 land, epic is shippable as one release — verify staging env (KAN-123) is ready before flipping to prod.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Sun 2026-04-26

### Top priorities
1. **Light prep for Monday's role-split push** — Skim Friday's CC + Codex output so Monday opens with a clear yes/no on whether teacher-landing-gating actually landed.
2. **Decide Option A vs B on parent-redirect bug** — Quiet weekend window to read `followup-kan-135-parent-redirect.md` and pick a direction so Monday's CC prompt isn't blocked on a decision.
3. **Pre-draft KAN-132 CC prompt (optional)** — If energy allows, get `cc-prompt-kan-132.md` to a rough first pass so Monday is just a polish + handoff.

### Checklist

- [ ] Pull latest on the role-split feature branch; eyeball Friday's `cc-prompt-followup-teacher-landing-gating.md` merge state + any Codex notes
- [ ] Read `docs/features/role-split/followup-kan-135-parent-redirect.md` and write the Option A vs B call into the doc
- [ ] (Optional) Rough-draft `docs/features/role-split/cc-prompt-kan-132.md` reusing the KAN-131 `effectiveMode` pattern
- [ ] (Optional) Glance at `docs/features/before-go-live/epic.md` KAN-123 to gauge whether staging-env work needs to start in parallel next week
- [ ] End of day: update this file with Mon 2026-04-27 tasks (note: Mon entry already exists — only refresh if Sunday surfaced new context)

### Notes / blockers

- Weekend day — keep it light. Monday already has a fully drafted entry below; Sunday is just for catching up on Friday's CC/Codex output and unblocking Monday's first move.
- KAN-127 status entering the weekend: KAN-128/129/130/131 merged + `bug-role-save-400` fixed. KAN-132, KAN-133, and the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating) still block the one-release ship.
- Do NOT merge anything to prod over the weekend — KAN-127 chain ships as one release on its feature branch.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.

---

## Mon 2026-04-27

### Top priorities
1. **Close out teacher-landing-gating** — Confirm Friday's CC prompt landed + passed Codex; this is the last user-visible parent-UX leak on `/teacher` and gates the KAN-127 one-release ship.
2. **Land KAN-132 copy role-neutral pass** — Final user-visible slice of KAN-127; once this and landing-gating are in, only KAN-133 analytics is left before the epic can ship.
3. **Resolve parent deep-link redirect bug** — Pick Option A vs B on `followup-kan-135-parent-redirect.md` and queue the CC prompt so KAN-131/135 UAT can finally close.

### Checklist

- [ ] Pull latest on the role-split feature branch, confirm Friday's `cc-prompt-followup-teacher-landing-gating.md` actually merged + Codex-reviewed
- [ ] Verify teacher-landing-gating tests assert parent hides toggle + "Add Group" + group-labeled cards, and teacher view is pixel-identical to `main`
- [ ] If KAN-132 CC prompt didn't get drafted Friday, write `docs/features/role-split/cc-prompt-kan-132.md` and hand to CC
- [ ] Decide Option A vs B on parent-redirect bug; if A, draft CC prompt to narrow the `/teacher/curriculum` guard to `role === null` only
- [ ] Review KAN-133 analytics spec — decide whether parent-redirect + landing-gating events fold in here
- [ ] Run every new CC diff through Codex before merge; keep the KAN-127 chain on its feature branch — nothing ships to prod solo
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — any hotfix candidates before role-split ships?
- [ ] Check `docs/features/before-go-live/epic.md` KAN-123 — does staging env need to stand up before role-split release?
- [ ] End of day: update this file with Tue 2026-04-28 tasks

### Notes / blockers

- KAN-127 status entering Monday: KAN-128/129/130/131 merged + `bug-role-save-400` fixed. KAN-132, KAN-133, and the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating) still block the one-release ship.
- Monday morning: check whether anything moved over the weekend before queuing new CC work — Codex review may have flagged things on Friday's diffs.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

---

## Fri 2026-04-24

### Top priorities
1. **Ship teacher-landing-gating CC prompt** — Still the biggest parent-UX leak on `/teacher` (Group toggle, "Add Group", "iyers" GROUP card); blocks KAN-127's "one release" ship.
2. **Resolve parent deep-link redirect bug** — Pick Option A vs B on `followup-kan-135-parent-redirect.md` so KAN-131/135 UAT isn't stuck in limbo.
3. **KAN-132 copy role-neutral pass** — Last user-visible slice of KAN-127; queue the CC prompt so the epic can actually close.

### Checklist

- [ ] Confirm Thursday's CC prompt at `docs/features/role-split/cc-prompt-followup-teacher-landing-gating.md` landed + passed Codex; if not, finish writing it (reuse KAN-131 `effectiveMode` pattern, do NOT mutate `useTeachingMode()`)
- [ ] Verify teacher-landing-gating tests assert parent hides toggle + "Add Group" + group-labeled cards, and teacher view is pixel-identical to `main`
- [ ] Decide Option A vs B on parent-redirect bug; if A, draft CC prompt to narrow the `/teacher/curriculum` guard to `role === null` only
- [ ] Draft CC prompt for KAN-132 at `docs/features/role-split/cc-prompt-kan-132.md`
- [ ] Review KAN-133 analytics spec — decide whether parent-redirect + landing-gating events fold in here
- [ ] Run every new CC diff through Codex before merge; keep the KAN-127 chain on its feature branch — nothing ships to prod solo
- [ ] Triage `docs/features/bugs/` (KAN-58, 59, 63, 72) — hotfix candidates before role-split ships?
- [ ] Check `docs/features/before-go-live/epic.md` KAN-123 — does staging env need to stand up before role-split release?
- [ ] End of day: update this file with Mon 2026-04-27 tasks

### Notes / blockers

- KAN-127 status carryover from Thu: KAN-128/129/130/131 merged + `bug-role-save-400` fixed. KAN-132, KAN-133, and the two KAN-135 follow-ups (parent-redirect, teacher-landing-gating) still block the one-release ship.
- Tomorrow is Friday — weigh whether to merge anything new into the role-split feature branch right before the weekend, or hold until Monday.
- CC prompt docs live under `docs/features/role-split/` as untracked `.md` files, never at `docs/` root.
- Codex reviews every CC diff before merge. Lovable is dead — CC-only for frontend.

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
