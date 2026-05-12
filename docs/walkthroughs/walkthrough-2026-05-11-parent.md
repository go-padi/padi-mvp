# Parent Walkthrough — 2026-05-11

Source: Nisha walking through parent flow + logged-out experience on
padi-mvp.vercel.app. Loom transcript captured verbatim below.

Companion to `walkthrough-2026-05-10-teacher.md` (which surfaced LR-09
through LR-14). Three lenses applied: padi-pm (board), padi-design
pm-sparring (sequencing), padi-design design-review (UI grounding +
3-signal north star).

## Method

- Live walkthrough on prod (padi-mvp.vercel.app), 2026-05-11
- Two roles tested: **logged-out visitor** and **parent**
- Founder narrates friction; Claude transcribes and groups
- Each finding tagged: severity (BLOCKER / CONCERN / NOTE), surface,
  recommended LR ticket, lens that flagged it
- Final state: 5 new tickets (LR-17 through LR-21) + 1 confirmed
  (LR-10) + 3 superseded (KAN-58, 59, 72) + 1 PM rule retired
  ("content always visible regardless of auth state")

---

## Findings

### Finding 1 — Logged-out students preview hangs on loading

**Quote (0:00–0:21):**
> "Students preview, this doesn't work, it just keeps loading,
> unclear what happens there, so I can't really look at what's
> happening with the student, it just hangs on loading."

**Severity:** BLOCKER
**Surface:** `app/students/page.tsx` (or whichever route is "Students
preview" in logged-out preview mode)
**Lens(es):** design-review (5-second test FAIL — purpose unclear,
hang is a dead-end), pm-sparring (friction test FAIL — visitor bails)
**Ticket:** **LR-17** (new)
**Supersedes:** KAN-58 (logged out, can't click Individual Student
cards) — same surface, same broken state, but reframes from "fix the
broken click" to "decide what logged-out students preview SHOULD do"

**3-signal impact:** Visitor never reaches signup because the preview
they're using to evaluate Padi is broken. Direct activation kill.

---

### Finding 2 — Logged-out curriculum exposes all lesson content

**Quote (0:21–1:04):**
> "If I go to Curriculum, I see every single one of the lessons,
> this is bad, this should not be what happens when I'm not logged
> in, I can just then take the content, right, I should just see
> what's available, and maybe when it drops down, it just tells me
> what happens in the each of these areas, so what does phonological
> awareness have, what does individual alphabet, and how much time
> does it take, I think those are the key things, pull that from,
> we can pull that from the, the, uhm, curriculum, in the PDFs
> that we have, but it should not expose all the content."

**Severity:** BLOCKER (commercial IP exposure)
**Surface:** `app/teacher/curriculum/page.tsx` + nested
`[chapter]/[group]/[module]/page.tsx`. Auth-gating logic exists
(`isLoggedIn`, `role`) but the actual lesson body is rendered
regardless of auth state.
**Lens(es):** design-review (the "what does this teach me" question
isn't answered — instead the full content is dumped, defeating both
trust-building AND IP protection), pm-sparring (north-star test:
exposing all content does NOT make the 3 signals more trustworthy)
**Ticket:** **LR-18** (new)
**Recommended fix:** Replace logged-out curriculum browser with
**chapter/section overview cards**. Each card shows: chapter name,
1-2 sentence description (sourced from `docs/curriculum/ind.pdf` +
`group.pdf`), lesson count, estimated time per chapter. Click into a
chapter shows the same overview for sections — never the full module
body. Sign-in CTA at every dead-end.

**Retires PM rule:** padi-pm's `Key Product Rules` currently says
"Content is always visible regardless of auth state." Founder
explicitly overrode this in walkthrough. Update the skill rule (out
of scope for this ticket but flag in `references/`).

**3-signal impact:** Visitor needs enough to TRUST that Padi knows
what it's doing — chapter descriptions + time estimates do that.
Visitor does not need the lesson content to make a signup decision;
giving it away costs commercially without buying anything.

---

### Finding 3 — Sign-up flow has confusing identity state

**Quote (1:04–2:00):**
> "Let's sign in, I'm going to do a new sign in, hello, gobuddy.com,
> is that person signed in, let me see. So, it is Nisha, hello, oh,
> no Nisha, not putty, great, so, I'm actually going to sign in as
> this user. Let's do another account. Check my email. Confirm your
> mail. Okay, okay, now I can sign in."

**Severity:** CONCERN
**Surface:** Sign-up modal / post-signup confirmation flow
**Lens(es):** design-review (friction audit — multiple confusing
steps), pm-sparring (user evidence test — this is the founder
herself getting lost; that's a real signal)
**Ticket:** **LR-19** (new)
**Recommended fix:** Make signed-in state unambiguous at every
moment. After sign-up: clear "you are now signed in as <email>"
confirmation. Stale-session detection (if someone is already signed
in when the sign-up modal opens, surface that explicitly rather than
silently sharing the session).

**Note:** This is downstream of `sign-in-flow` epic (SIGNIN-1
shipped). Doesn't supersede that epic — adds the confused-identity
edge case it didn't cover.

---

### Finding 4 — Parent sees "Teacher Dashboard" everywhere (LR-06 gap)

**Quote (2:15–2:29):**
> "I'm a parent. I'm going to do a parent flow. So I go in. Add
> child. Let's do Maya. Maya. I hear Do I need to see the full
> curriculum? Go to Teacher Dashboard. Great, I see the full
> curriculum."

**Severity:** BLOCKER
**Surface:** Multiple — LR-06 only fixed `components/TopNav.tsx`.
The label "Teacher Dashboard" still appears at:
- `app/page.tsx:28` (homepage hero heading)
- `app/page.tsx:100` ("View Teacher Dashboard" button)
- `app/teacher/layout.tsx:30` (`<h1>Teacher Dashboard</h1>` — on
  every authenticated `/teacher/*` page)
- `app/teacher/page.tsx:432` ("Browse every developmental area in
  the teacher dashboard")
- `app/teacher/page.tsx:435` ("Go to Teacher Dashboard" — the exact
  button the parent clicked in the walkthrough)
- `app/students/page.tsx:50` ("explore... from the Teacher
  Dashboard")

LR-06 scope was nav-bar only. The in-page h1, hero, and CTAs were
out of scope. So this is a GAP, not a regression.

**Lens(es):** design-review (every screen tells a parent "you're a
teacher" — undermines trust), pm-sparring (north-star test FAIL —
parent activation is half the brief; the experience contradicts the
brief everywhere)
**Ticket:** **LR-20** (new)
**Recommended fix:** Second pass on role-aware copy across all hard-
coded "Teacher Dashboard" strings. Use the `rolePhrase()` helper
from `lib/copy/roleCopy.ts` (KAN-132 pattern). For parents, use "My
Dashboard" or "Home" — match what TopNav uses.

**Relates to:** LR-06 (shipped, scope was narrow), KAN-132 (role-
neutral copy pass — same direction, more aggressive)

---

### Finding 5 — Curriculum browser overwhelming for new parent

**Quote (2:29–2:50):**
> "Great, I see the full curriculum. I don't know what the hell to
> do with it. This is overwhelming. Like, I don't know what to do
> with it. I need a better solution of how to show this both for,
> uhm, individual and group, in teachers... Okay, great. What else
> am I doing? Like, what else happens here? I don't know. Home.
> Start a lesson, that's really helpful. Start teaching."

**Severity:** BLOCKER
**Surface:** `app/teacher/curriculum/page.tsx` post-signup, AND
post-add-child flow generally
**Lens(es):** design-review (5-second test FAIL — page purpose
unclear right after adding a child), pm-sparring (sequencing test
FAIL — the activation north star is "from curious to teaching" but
the post-signup state strands the parent at "I don't know what to
do"; friction test FAIL — parent had to wander back to Home to find
the CTA)
**Ticket:** **LR-21** (new)
**Recommended fix:** Post-add-child landing → ONE clear next-action
("Start Maya's first lesson") that drops the parent into the
recommended starting module. The curriculum browser stays
accessible but isn't the default destination. This pairs with LR-11
(next-module obvious) — same intent, different entry point. Could
be folded into LR-11's scope OR shipped separately. Recommend
separate (LR-21 is parent-onboarding; LR-11 is general
sequencing).

**3-signal impact:** Parent who can't find first lesson never
generates the data that produces the Ready/Needs Help/Needs
Intervention signal. North-star direct hit.

---

### Finding 6 — Can't re-enter completed lesson (CONFIRMED LR-10)

**Quote (3:04–3:10):**
> "Mark lesson is complete. She's on track. She stayed silent for
> the silent game. Great progress. Okay, can I click? I still
> can't click back in. Remember, we need to be able to click back
> in. This might be already a feature, but let's just record that."

**Severity:** BLOCKER (curriculum requires repetition for
automaticity — Montessori principle + ASDEC mastery model)
**Surface:** Lesson detail page after "Mark complete"
**Lens(es):** pm-sparring (north-star test — repetition is HOW the
3-signal becomes trustworthy; one-shot lessons can't ground a
Needs Help/Intervention judgment)
**Ticket:** **LR-10** (already filed 2026-05-10) — confirmed
applicable to parent flow too. No new ticket.

---

## Recommended new tickets

| ID | Title | Severity | Complexity | Priority |
|---|---|---|---|---|
| LR-17 | Fix logged-out students preview hang | BLOCKER | S | highest |
| LR-18 | Replace logged-out curriculum browser with overview cards (gate full content) | BLOCKER | M | highest |
| LR-19 | Make signed-in identity unambiguous in sign-up flow | CONCERN | S | high |
| LR-20 | Role-aware copy pass #2 — sweep all "Teacher Dashboard" strings | BLOCKER | S | highest |
| LR-21 | Post-add-child clear next-action (parent onboarding) | BLOCKER | M | highest |

## Sequencing recommendation (pm-sparring lens)

Apply the 5-test framework. Ship order:

1. **LR-20** first (XS-S complexity, blocker, no design unknowns — pure copy sweep). Closes the parent-sees-teacher gap immediately.
2. **LR-18** next (M complexity, blocker, design needs the chapter/section description copy from `ind.pdf`/`group.pdf` — there's a content-authoring step before the build). This is the biggest commercial-risk item.
3. **LR-17** in parallel with LR-18 (S complexity, blocker — surgical fix to logged-out students page; can ship same batch).
4. **LR-21** + **LR-11** as a pair (both M, both about "what does the user do next"; LR-21 is parent-onboarding-specific, LR-11 is general sequencing; ship in same BuildLoop iteration to keep the UX consistent).
5. **LR-19** as a tail (CONCERN not BLOCKER; can slip to v1.1 if needed).

LR-15 + LR-09a/13a/13b already shipped. **LR-20 is the next thing to send through BuildLoop** — fastest blocker to retire.

## What's working

To balance the critique: three things that didn't trip the parent.

- **Sign-in → email confirmation** — confusing identity aside, the verification flow worked.
- **"Start teaching" CTA** — the parent found it eventually ("Start a lesson, that's really helpful").
- **Silence Game lesson** — completed without confusion, marked complete, "great progress" celebration landed.

## PM rule to retire

`padi-pm:padi-pm` skill currently lists this Key Product Rule:

> Content is always visible regardless of auth state.

Founder explicitly overrode this in the walkthrough ("it should not
expose all the content"). LR-18 is the first feature that violates
the rule. Recommend updating the skill's SKILL.md to:

> Content overview (chapter/section descriptions, lesson counts,
> time estimates) is always visible. Full lesson content is gated
> behind login.

This is a meta-task — flag for post-launch when the skill is next
edited. Not blocking.

## Open design questions

1. **LR-18 — do we describe each section, or each module?** Chapter-level only might be too coarse. Module-level (197 modules) might be too granular. Section-level seems right (~7 sections per chapter). Confirm with curriculum author before scoping.
2. **LR-21 — what's the "recommended first module" for a brand-new student?** Probably the first module of `Phonological Awareness > Listening Skills`, but verify against the `ind.pdf` sequencing.
3. **LR-20 — should "Teacher Dashboard" become "My Dashboard" or "Home" for parents?** Pick one and use consistently (TopNav already does, per LR-06).
4. **LR-19 — is the confused-identity an actual session-state bug, or just unclear copy?** Reproduce before scoping; might be smaller than it looks.

## Notes

- Parent walkthrough surfaced 5 BLOCKERs + 1 CONCERN vs teacher walkthrough's
  6 LR tickets. Both walkthroughs together = 13 launch tickets generated by
  founder-narrated friction. Strong signal that founder walkthroughs are the
  highest-leverage way to find launch blockers.
- The "expose all content" finding (LR-18) is the highest-stakes
  discovery — it's not just UX, it's commercial. Worth a same-day fix
  rather than waiting for a BuildLoop slot.
- KAN-58 (logged out can't click), KAN-59 (logged out should look the same
  with demo data), KAN-72 (student card issue) are all from the
  pre-walkthrough Jira import. Their scope is contradicted by LR-17/LR-18
  (the new direction is "intentionally gated preview," not "fix the broken
  demo"). All three marked superseded as part of this audit.
