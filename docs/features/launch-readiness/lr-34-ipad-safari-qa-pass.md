---
id: LR-34
title: "[Task] iPad Safari QA pass — verify core flows on the founder's-mom device"
type: task
status: ready
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
related: LR-14
handling: uat-then-cc
---

### Goal

Nisha's mom teaches lessons on an iPad. The core flows have to work
on iPad Safari specifically — not just work-in-theory. LR-14 shipped
with iPad Safari 14.5+ listed as a target but was verified only on
desktop. This ticket closes the gap.

Discover-then-fix. First run the UAT below on real hardware, file
any bugs found, then CC fixes them in a follow-up loop.

### Scenarios to run on iPad Safari

Use an actual iPad if available; iOS Simulator's Safari is a
usable fallback if not. Cover both portrait and landscape.

1. **Signup → consent → first sign-in.** New account creates
   cleanly, consent modal (LR-32) is tappable, keyboard doesn't
   obscure the submit button.

2. **Add student.** Modal opens, form fields are tappable, name
   entry works with iOS autocorrect not fighting the form.

3. **Lesson page — audio recording (LR-14).**
   - Tap Record → iOS mic permission prompt appears → Allow.
   - Recording state shows red dot + timer.
   - Tap Stop → "Saving recording…" → "✓ Recording saved".
   - Tap the audio player → recording plays back.
   - No layout shift, no button offscreen.

4. **Lesson page — notes textarea.** Long-press paste works.
   Textarea grows as expected without pushing the save button
   below the fold.

5. **Rating → Save & Mark Complete.** 3-signal buttons are
   tappable at expected touch-target size (>= 44×44pt). No
   accidental double-taps.

6. **Replay from student profile.** Tap Replay on a completed
   module → lesson page opens with prior completions surfaced
   (post-LR-10-bug-01 behavior).

7. **Progress score chips (LR-29).** Chips at lesson / module /
   group / chapter level are visible without horizontal scroll.
   Tap-to-see-definition works (no hover on mobile).

8. **Upgrade CTA modal (LR-30).** When free-tier limits fire, the
   upgrade modal is centered and tappable. "Continue to Stripe"
   button opens Stripe Checkout in the same tab.

9. **Sign out → sign in → password reset (LR-33).** All flows work
   without keyboard blocking essential UI.

### Known-suspect areas to spot-check

- `<audio controls>` on iOS Safari has non-standard styling; make
  sure the play/pause is tappable and doesn't overflow.
- Modal overlays on iOS need `body { position: fixed }` when open to
  prevent scroll-jump.
- Any `position: sticky` in the lesson page can misbehave when the
  iOS keyboard is open.
- File input for audio (fallback path in LR-14) opens the iOS media
  picker — verify.

### Deliverables

1. **UAT report** at
   `iterations/lr-34-ipad-safari-qa-pass/uat/LR-34-uat.md`
   documenting each scenario as pass / fail with screenshots for
   any failures.
2. **One bug ticket per failure** filed as
   `LR-34-bug-NN-<slug>.md` under
   `iterations/lr-34-ipad-safari-qa-pass/bugs/` with steps + fix
   suggestion.
3. **CC follow-up loop** fixes the highest-severity bugs in place;
   remaining bugs are separately triaged.

### Acceptance criteria

1. UAT report exists and covers all 9 scenarios.
2. All P0/P1 bugs fixed and re-verified on iPad Safari.
3. LR-14 status can be updated to "verified on iPad Safari".

### Notes for the implementer

- BuildLoop's UAT phase can drive this via the padi-uat-agent, but
  the audio recording scenario needs real hardware — computer-use
  can't grant iOS mic permission. Nisha runs #3 manually and
  reports; the rest can be automated.
- Do NOT introduce new UA-sniffing branches in code. If iOS needs
  a different behavior, use feature detection.
