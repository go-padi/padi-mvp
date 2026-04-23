# Daily Tasks — Running List

**How this works**

Claude refreshes this file at the end of each day with a new entry for tomorrow. Newest day is at the top. Completed days stay below as a running log — strike them through or mark `[x]` but don't delete. Ask Claude to "update daily tasks" at end of day to add the next morning's list.

Format per day:
- **Top priorities** — 1-3 must-move-the-needle items
- **Checklist** — everything else on deck
- **Notes / blockers** — context you'll want when you open this in the morning

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
