---
id: KAN-132-bug-add-student-modal-subheading
title: "AddStudentModal sub-heading not role-aware (still says 'student' for parents)"
type: bug
status: fixed
severity: P2
parent: KAN-132-uat
related: KAN-132
feature: role-split
created: 2026-05-10
fixed_at: 2026-05-10
created_by: padi-uat-agent (BuildLoop iter 2)
---

### Summary

`components/AddStudentModal.tsx:117` renders the static string `"Create a new student to start tracking progress."` immediately under the role-aware heading. For a signed-in parent, the modal reads:

```
Add child
Create a new student to start tracking progress.
```

The sub-heading uses "student" while the heading uses "child" — a voice/role inconsistency the parent will immediately notice, and a clear miss vs the KAN-132 goal of "make every user-visible string on shared `/teacher/*` surfaces role-aware so a parent reads 'your child' / 'add your child' instead of 'your students'."

### Why this didn't FAIL the UAT

KAN-132's strict acceptance criterion gates on the forbidden-word list `your students | your class | classroom | roster | cohort`. The string "Create a new student to start tracking progress." contains the word "student" (singular) but none of the forbidden phrases, so it passes the strict AC by the letter. It still violates the spirit of the role-neutral copy pass.

It is also NOT listed in `build-summary.md`'s "Intentionally skipped (per scope)" section, which means it appears to have been overlooked rather than deliberately deferred.

### Steps to reproduce

1. Sign in as a user with `profiles.role = 'parent'`.
2. Navigate to `/teacher` (parent activation surface).
3. Click the "Add Child" button.
4. Inspect the modal that opens.

### Expected

Modal sub-heading reads "Create a new child to start tracking progress." (or a parent-natural equivalent like "Add your child to start tracking progress.").

### Actual

Modal sub-heading reads "Create a new student to start tracking progress." regardless of role.

### Evidence

- File: `components/AddStudentModal.tsx`
- Line: 117
- Substituted siblings: line 24 (heading), line 25 (button label), line 26 (close aria-label) — all use `rolePhrase()`. Line 117 was missed.

### Fix sketch

```tsx
const subheading = rolePhrase(
  role,
  'Create a new student to start tracking progress.',
  'Add your child to start tracking progress.',
);
// ...
<p className="text-sm text-gray-600">{subheading}</p>
```

### Severity rationale

P2 — visible inconsistency in parent activation flow, but not a blocker:
- Functional flow works (form submits, child is added).
- Strict AC (forbidden-word list) is not violated.
- Issue is contained to one sentence inside one modal.
- Easy follow-up fix; same `rolePhrase` pattern already established in this file.

P1 if surfaced in user testing as confusing; P3 if deemed cosmetic-only.

## Fix Notes

**Root cause:** `components/AddStudentModal.tsx:117` was outside the eng-brief's enumerated line list (the brief listed 67/103/109/146 only). The `<p>` sub-heading paired with the `<h2>` heading was overlooked during scope, then again during the build's self-audit.

**Files changed:** `components/AddStudentModal.tsx` (added `subheading` constant via `rolePhrase`, swapped the static string).

**Test added:** `components/__tests__/role-copy.test.tsx` now asserts both teacher and parent variants of the sub-heading on AddStudentModal.

**Why the fix is correct:** uses the same `rolePhrase` pattern already in the file; teacher copy is verbatim-preserved; parent variant ("Add your child to start tracking progress.") matches the wizard's parent voice (which also says "Add your child to start their lessons.").

Validate re-ran clean: tsc + next build + 18/18 vitest + lint all pass (`.buildloop/iterations/002/validate-3.log`).
