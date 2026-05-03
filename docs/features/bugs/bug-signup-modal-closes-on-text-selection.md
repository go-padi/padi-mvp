---
id: BUG-signup-modal-text-selection
title: "Sign-up modal closes when highlighting text"
type: bug
feature: bugs
severity: low
priority: low
status: backlog
related: SIGNIN-1
reported_by: nisha
reported_on: 2026-04-23
updated: 2026-04-23
---

### Summary
On the sign-in / create-account modal (`components/auth/SignInModal.tsx`), attempting to highlight text inside the modal — for example dragging across an email in the input or across label copy — causes the modal to dismiss if the mouseup lands outside the modal's bounds. The user loses whatever they were typing and has to re-open the modal.

### Reproduction
1. Open padi-mvp.vercel.app and click **Sign In / Create account**.
2. In either mode, click-and-drag inside the modal to select text (e.g. inside the email field, or across the heading copy) and release the mouse *outside* the modal panel.
3. Modal closes immediately. Form state is lost.

### Likely cause
The outside-click-to-close handler fires on any `mousedown`/`mouseup` whose target is outside the modal's root element. A text-selection gesture that starts inside and ends outside is treated as an outside click.

### Suggested fix (when picked up)
Gate the close handler on a drag-vs-click check:

- Track where `mousedown` occurred. Only close the modal if **both** `mousedown` and `mouseup` targets are outside the modal root.
- Equivalently, ignore `mouseup` outside if the originating `mousedown` was inside the modal.

This is the standard Radix/Headless UI pattern — see `onPointerDownOutside` vs. `onInteractOutside` handling.

### Acceptance criteria
- [ ] Click-drag selections that start inside the modal and release outside do NOT close the modal.
- [ ] Genuine outside clicks (mousedown + mouseup both outside) still dismiss the modal.
- [ ] Escape key and X close button still work in both `signin` and `signup` modes.
- [ ] No regression in SIGNIN-1 behavior (mode toggle, password show/hide, etc.).

### Notes
- Not urgent — filed for visibility. Worth bundling with SIGNIN-1 work on the modal if that ticket is picked up soon.
