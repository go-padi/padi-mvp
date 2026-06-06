---
id: STRIPE-6
title: "[Dev] Sibling add-on (v1.1)"
type: story
status: backlog
priority: low
feature: stripe-paywall
epic: STRIPE-EPIC
created: 2026-06-06
owner: claude-code
blocked_by: [STRIPE-3]
launch_blocker: false
---

### Goal

When a parent on a paid plan adds a second (or third, …) student,
they're prompted that this triggers a $4.99/mo sibling add-on.
Quantity on the Stripe subscription updates to match the active
student count, prorated per Stripe defaults.

Deferred to v1.1 — not a launch blocker. v1 ships with parents
paying flat $14.99/mo regardless of student count. We add this
once we see multi-child households actually convert.

### Files to touch

- `components/AddStudentModal.tsx` — when the parent already has
  ≥1 student and `subscription.status='active'`, show a
  "Add-on: +$4.99/mo for this sibling" confirmation step before
  insert.
- `app/api/stripe/sync-sibling-quantity/route.ts` (new) — server
  route that:
  1. Reads current student count from Supabase for the tenant.
  2. Resolves the Stripe subscription's sibling add-on line item.
  3. Updates quantity to `max(0, student_count - 1)`. First child
     is included in the base plan; sibling add-on counts the rest.
- `app/api/stripe/webhook/route.ts` — on `invoice.upcoming`, no-op
  for v1.1 unless we want to recompute quantity defensively.

### Requirements

1. **Quantity model.** Base plan covers 1 student. Each additional
   student = +1 unit of `STRIPE_PRICE_SIBLING_ADDON_MONTHLY`. So
   for 3 students total: base + 2 add-on units.
2. **Confirmation UX.** Before inserting a 2nd+ student, show a
   step in `AddStudentModal`: "Adding <name> adds $4.99/mo to
   your subscription, prorated." With CTA "Add and update billing"
   and "Cancel." If subscription is trialing, no charge yet —
   copy says "Adding <name> adds $4.99/mo after your trial."
3. **Server call.** On confirm, POST to
   `/api/stripe/sync-sibling-quantity`. Wait for 200 before
   committing the student insert.
4. **Failure handling.** If Stripe sync fails, do NOT insert the
   student. Show error and let user retry.
5. **Removal.** When a student is removed (existing flow), trigger
   the same sync route to decrement quantity.
6. **Tutor Pro accounts.** No sibling add-on — they're per-seat in
   their own scheme. Skip the modal if plan is `tutor_pro_*`.

### Acceptance Criteria

**Active parent adds 2nd student**
Given a parent with `status='active'`, plan='parent_monthly', 1
existing student
When they open Add Student modal and submit
Then they see the "+$4.99/mo" confirmation step
And confirming triggers the sync route
And the new student row is created only after Stripe returns 200

**Trialing parent adds 2nd student**
Given `status='trialing'`, 1 existing student
When they add a 2nd
Then confirmation copy says "$4.99/mo after your trial"
And quantity is set on Stripe sub (will apply at trial end)

**Removing a student decrements quantity**
Given a parent with 3 students (base + 2 add-on)
When they remove 1 student
Then quantity drops to 1 add-on
And the next invoice reflects proration

**Tutor Pro accounts**
Given `plan='tutor_pro_monthly'`
When they add a student
Then no sibling modal
And no sync call

### Out of scope

- Family-flat pricing (e.g. $24.99 for unlimited siblings) — test
  in pricing strategy first.
- Annual sibling pricing — defer.
- Bulk-add students.

### Notes

- Stripe handles proration automatically when quantity changes
  mid-period.
- For v1, ship the parent plan as flat — STRIPE-6 only ships if
  the early conversion data shows multi-child households being a
  meaningful % of customers.
- This ticket file exists now so v1.1 has a ready spec.
