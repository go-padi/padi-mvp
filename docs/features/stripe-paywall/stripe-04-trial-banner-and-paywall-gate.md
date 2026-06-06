---
id: STRIPE-4
title: "[Dev] Trial banner + paywall gate (useSubscriptionGate)"
type: story
status: backlog
priority: high
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
blocked_by: [STRIPE-2, STRIPE-3]
---

### Goal

In-app UX for the trial → paywall journey. Trial state shows as a
soft banner with a countdown; expired state shows a hard modal
when the user tries any gated action.

### Files to touch

- `lib/hooks/useSubscription.ts` (new) — client hook that loads
  the current tenant's subscription and refreshes on mount + window
  focus.
- `lib/hooks/useSubscriptionGate.ts` (new) — returns
  `{ gated, reason, openPaywall }`. Wraps `useSubscription`.
- `components/TrialBanner.tsx` (new) — countdown chip + soft banner
  variants (day 0–6, day 7–12, day 13–14).
- `components/PaywallModal.tsx` (new) — hard modal shown on gated
  action. CTA → POST `/api/stripe/checkout` → redirect to Stripe.
- `app/teacher/layout.tsx` — mount TrialBanner + PaywallModal
  globally.
- `app/parent/layout.tsx` (if exists) — same. If not, file open
  question (parent layout may share teacher layout).
- Gated actions to wire (add `useSubscriptionGate` check before the
  existing handler):
  - "Start lesson" / "Mark Lesson Complete" / "Save & Continue Later"
    in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
  - "Add Student" in `components/AddStudentModal.tsx`
  - "Add Group" in `components/AddGroupModal.tsx`
  - Record audio in `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`
    (the recorder button)
  - Mom video play (when `metadata.teach_video_status === 'published'`)
    — wrap the `<video>` block from TEACH-VIDEO-2

### Requirements

1. **`useSubscription`** — fetches `lib/subscription.ts::getSubscription(tenantId)`
   once on mount, caches in a Zustand slice (`useSubStore`), refreshes
   on window focus. Avoid re-fetching on every render.
2. **`useSubscriptionGate(action: GatedAction)`:**
   ```ts
   type GatedAction =
     | 'start_lesson' | 'mark_complete' | 'save_notes'
     | 'add_student' | 'add_group'
     | 'record_audio' | 'play_teach_video';
   ```
   Returns:
   ```ts
   {
     gated: boolean;            // true if isGated(sub) AND action is gated
     reason: 'trial_expired' | 'past_due' | 'canceled' | null;
     openPaywall: (action) => void;  // opens PaywallModal
   }
   ```
   Demo tenants (`tenant.is_demo === true`) are never gated.
3. **TrialBanner states:**
   - Day 0–6: chip only in dashboard header — "Trial: 14 days left".
   - Day 7–12: dismissible banner across top of dashboard — "Halfway
     through. Pick a plan." → links to `/pricing`.
   - Day 13–14: persistent modal on first dashboard load per day
     — "Trial ends tomorrow. Pick a plan." Dismissible but reappears
     next day.
   - `past_due`: red banner — "Payment failed. Update your card."
     → links to `/account/billing`.
4. **PaywallModal:**
   - Triggered when `useSubscriptionGate(action).openPaywall()` is
     called.
   - Header: "Your trial has ended" / "Your subscription has lapsed"
     based on reason.
   - Body: short pitch + two CTAs: "Choose a plan" (→ Stripe
     Checkout via API) and "See pricing" (→ `/pricing`).
   - Plan defaulted by role: parent role → `parent_annual`; teacher
     role → `tutor_pro_annual`. Annual default = aligns with the
     pricing strategy (push annual).
   - On confirm: POST `/api/stripe/checkout` with the plan_id,
     redirect to the returned `url`.
5. **Wire gates at action sites.** Pattern:
   ```ts
   const gate = useSubscriptionGate('add_student');
   const handleAddStudent = () => {
     if (gate.gated) return gate.openPaywall('add_student');
     // ...existing logic
   };
   ```
   *Do not block read access.* Gated users can still see
   their dashboard, student list, and prior observations.
6. **Analytics** — fire on each gate hit and on paywall conversion:
   ```ts
   PAYWALL_SHOWN: 'paywall_shown',        // { action, reason }
   PAYWALL_CTA_TAPPED: 'paywall_cta_tapped',  // { plan_id }
   TRIAL_BANNER_DISMISSED: 'trial_banner_dismissed',  // { day }
   ```

### Acceptance Criteria

**Day-0 user**
Given a brand-new signup, trial day 0
When they view the teacher/parent dashboard
Then they see the "Trial: 14 days left" chip
And no banner, no modal

**Day-7 user**
Given trial day 7
When they view the dashboard
Then a soft banner appears with "Halfway through" copy
And dismissing it hides it for the rest of the session

**Day-14 user, gated action**
Given trial day 14 (trial_ends_at within last 1 second)
When they tap "Add Student"
Then PaywallModal opens with "Your trial has ended" copy
And their action is NOT executed
And they can still navigate to dashboard, student list, prior
completions

**Active user**
Given `status='active'`
When they perform any gated action
Then no gate triggers, action proceeds normally

**Demo tenant**
Given `tenant.is_demo = true`
Then no banner, no paywall, no countdown — ever

**Past-due user, day 1 of past-due**
Given `status='past_due'`, transitioned <72h ago
Then a red banner appears with "Payment failed" copy
But gated actions still proceed (grace window)

**Past-due user, day 4**
Given `status='past_due'`, transitioned >72h ago
Then gated actions trigger PaywallModal with "Update payment"
copy

**Paywall conversion**
Given the PaywallModal is open
When user picks a plan and confirms
Then POST /api/stripe/checkout fires with the plan_id
And the user is redirected to the Stripe-hosted URL

### Out of scope

- Email reminders at day 7 / day 13 (separate ticket; use Stripe's
  built-in trial-ending emails for v1).
- Granular role-based plan defaults beyond parent vs teacher.
- Sibling add-on UI (STRIPE-6).
- A/B test on banner copy.

### Notes

- Trial countdown uses `daysLeftInTrial(sub)` from STRIPE-2's
  `lib/subscription.ts`. Compute floor of (`trial_ends_at - now`)/day.
- All banner state (dismissed-for-session) lives in sessionStorage
  with keys `padi:trial-banner-day-<N>-dismissed`. Match the
  LR14D_LS_KEY pattern in the lesson page.
- Mobile: TrialBanner collapses to chip only at <768px. Don't eat
  vertical space on small screens.
- DO NOT change auth, routing, or schema. Surgical hook + components
  + wiring only.
