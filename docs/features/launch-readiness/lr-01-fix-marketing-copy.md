---
id: LR-01
title: "[Marketing] Fix homepage copy — target age range + remove AI claims"
type: story
status: done
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-10
created_by: launch-readiness-audit-2026-05-10
---

### Goal

Fix two false/misleading claims on the homepage hero (`app/page.tsx`)
that would harm credibility on first contact: the wrong target age
range, and an unsupported "AI-Enhanced" / "AI-powered" pitch.

### Background

Current homepage hero copy says:
- *"Help Every Child Love Reading"* (fine)
- ✨ AI-Enhanced Reading Support (NOT TRUE — there is no AI in the app)
- *"Structured, interactive reading lessons designed for struggling readers ages 3-4"* (WRONG — should be K-2, ages 5-7)
- *"Based on proven curriculum with AI-powered personalization"* (NOT TRUE — no AI personalization exists)

The brief and the actual ASDEC K-Reading Kickstart curriculum
(`docs/curriculum/ind.pdf`) target K-2 (kindergarten through 2nd grade,
ages 5-7). "Ages 3-4" is preschool — wrong audience and wrong
developmental stage. Phonological awareness work in the curriculum
assumes K-readiness, not preschool.

The "AI-Enhanced" / "AI-powered" language is currently false advertising.
Either ship AI before launch (very large scope; not in this ticket) or
remove the claim.

### Requirements

1. In `app/page.tsx`, replace the `✨ AI-Enhanced Reading Support`
   eyebrow chip with something true. Suggested replacement:
   `📚 Structured Multisensory Reading` (matches the curriculum's
   actual approach: multisensory structured language education).
2. Replace `Structured, interactive reading lessons designed for
   struggling readers ages 3-4.` with `Structured, multisensory
   reading lessons for K-2 readers (ages 5-7), built on the
   ASDEC Kickstart curriculum.` (Or whatever copy aligns with how
   you describe the program publicly.)
3. Remove the `with AI-powered personalization` clause from the
   second sentence.
4. Search the rest of the codebase for any other `AI-` /
   `AI Enhanced` / `AI-powered` / `artificial intelligence` strings
   and remove them OR replace with claims that are true today.
5. Ensure no marketing copy claims features that don't exist
   (e.g. if there's no "progress tracking" yet, scrub that too —
   audit the feature card bullets in the hero).

### Acceptance Criteria

**Happy Path**
Given a logged-out user lands on `/`
When they read the hero
Then they see no claim of AI capabilities the app doesn't actually have
And the target age range matches the curriculum's actual audience (K-2 / ages 5-7)
And every feature claimed exists in the app today

**Auth State**
Given the homepage is purely marketing
When a logged-in user lands on `/`
Then the hero copy is the same — no role-aware variations needed in this ticket

**Mobile**
Given the user is on a 375×667 viewport
When they view the hero
Then the new shorter chip text and updated subtitle do not break layout

### Out of Scope

- Reworking the hero design / layout
- Adding new sections to the homepage
- Marketing copy on other pages (covered by other LR tickets if needed)
- Building actual AI features

### Notes

- File to edit: `app/page.tsx`
- Search for other AI references: `grep -r "AI-\|AI Enhanced\|AI-powered\|artificial intelligence" app components lib`
- If the team wants to keep AI as a "coming soon" promise, frame it that way explicitly: *"AI-powered insights coming soon"* — not as a present-tense capability.
- This is the cheapest launch-blocker fix on the board. Should ship in 15 minutes including review.
