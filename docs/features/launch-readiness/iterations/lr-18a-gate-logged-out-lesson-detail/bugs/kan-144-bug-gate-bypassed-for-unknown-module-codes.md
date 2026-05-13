---
id: KAN-144
title: "Logged-out gate is bypassed for unknown/stale module codes (shows 'Lesson not found.' instead)"
type: bug
status: open
priority: low
severity: P3
feature: launch-readiness
parent: LR-18a
uat: LR-18a-UAT
created: 2026-05-12
updated: 2026-05-12
---

## Summary

When a logged-out visitor opens a `/teacher/curriculum/<chapter>/<group>/<module>` URL whose module slug is no longer in the database AND is not in the `previewModuleByCode` fallback (e.g. a stale bookmark, a typo, or a search-engine-cached URL from before a content rename), they see the full teaching-mode toggle nav and "Lesson not found." card — instead of the LR-18a sign-in gate.

This is an edge-case sibling of KAN-143: the same `!moduleRow` early return wins because `moduleRow` permanently stays null (no row in DB, no preview fallback). The AC for LR-18a calls out "bookmark, search result" as in-scope precondition language, so this is a real-world hit path even if narrow.

## Reproduce

1. Sign out (private window).
2. Navigate to `http://localhost:3000/teacher/curriculum/phonological-awareness/learning-sensorially/bogus-module-xyz` (or any unknown module slug under any chapter/group).
3. Page renders "Lesson not found." with the chapter teaching-mode toggle, indefinitely. Gate never appears.

## Expected

For ANY logged-out visitor at any lesson-detail URL — valid or not — the sign-in card should render. Whether or not the lesson exists is information we don't want to leak to anonymous users anyway.

## Suggested fix

Same fix as KAN-143: move the `if (isHydrated && !isLoggedIn) return <gate />` block to fire before the `!moduleRow` early return. Both bugs collapse into one diff.

## Evidence

- Screenshot: `docs/features/launch-readiness/iterations/lr-18a-gate-logged-out-lesson-detail/uat/evidence/bogus-module-loggedout.png`
- Probe result: `hasGate: false, hasNotFound: true, hasTeachingModeToggle: true` after 15s wait with cleared storage.

## Notes for padi-eng

Single fix resolves both KAN-143 and KAN-144. No new requirements. Re-run UAT after.
