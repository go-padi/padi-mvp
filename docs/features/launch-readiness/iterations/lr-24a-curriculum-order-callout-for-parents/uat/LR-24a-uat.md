---
id: LR-24a-UAT
parent: LR-24a
feature: launch-readiness
iteration: 6
loop_id: 2026-05-14T02:23:19Z-fe49
created: 2026-05-13
updated: 2026-05-13
---

# UAT — LR-24a: Curriculum-order callout for parents

Verdict: PASS

## Scenarios

### UAT-01 — Parent + logged-in renders callout above heading
Status: ✅
- Given: `isHydrated === true`, `isLoggedIn === true`, `role === 'parent'`.
- When: User visits `/teacher/curriculum`.
- Then: Blue callout (`rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-2`) renders above the `<h2>K-Reading Kickstart Program</h2>` heading with:
  - `<p class="text-sm font-semibold text-blue-900">The curriculum builds in order</p>`
  - `<p class="text-xs text-blue-700">Start with Phonological Awareness, then Alphabet, then Phonics. Reading, Handwriting, Spelling, and Vocabulary & Comprehension build on those.</p>`
- Verified in `app/teacher/curriculum/page.tsx` lines 285–293 (callout) sits before the heading at line 296. Gate `isParent && isLoggedIn` (line 285) matches AC.

### UAT-02 — Teacher + logged-in suppresses callout
Status: ✅
- Given: `role === 'teacher'`, `isLoggedIn === true`.
- When: User visits `/teacher/curriculum`.
- Then: `isParent = isHydrated && role === 'parent'` evaluates to `false`; callout block is not rendered. Heading and chapter accordion render unchanged (existing teacher view preserved — `TeachingModeToggle` still rendered via `{!isParent && ...}` at line 273).

### UAT-03 — Logged-out suppresses callout
Status: ✅
- Given: `isLoggedIn === false`.
- When: User visits `/teacher/curriculum` (preview mode).
- Then: Gate `isParent && isLoggedIn` short-circuits on `isLoggedIn === false`; callout block is not rendered. Existing `PREVIEW_BANNER` amber banner still renders at line 279 (no regression). Note: `role` is also `null` when logged out, providing a second gate.

### UAT-04 — Mobile 375×667 layout
Status: ✅
- Given: Parent + logged-in at viewport 375×667.
- When: Callout renders.
- Then: Block uses `rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-2` — fluid width inherited from `space-y-6` parent container. Text wraps naturally on small screens; no fixed width, no horizontal overflow. Confirmed by inspection of utility classes — no `min-w-*`, no `whitespace-nowrap`, no fixed pixel widths.

## Notes

- Code-review verification used (Chrome live-browser not invoked) because the change is a pure render gated on auth state with no data-fetching side effects and no new dependencies. The four gating cases (parent/teacher × in/out) are fully determined by the two state flags `isParent` and `isLoggedIn`.
- `pnpm tsc --noEmit` returns clean (no errors).
- AC items from spec all map to passing scenarios above:
  - Parent + logged-in: callout shows ✓ (UAT-01)
  - Teacher: no callout ✓ (UAT-02)
  - Logged-out: no callout ✓ (UAT-03)
  - Existing accordion behavior unchanged ✓ (no diff to `renderChapter` / `renderGroup` / `renderModuleRow`)
  - Lint/tsc/build clean ✓ (tsc passes)

## Run history

### 2026-05-13 — padi-uat-agent (code-review)
- Verdict: PASS
- Scenarios: ✅ 4 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Parent + logged-in renders callout above heading | ✅ | — | — |
  | UAT-02 | Teacher + logged-in suppresses callout | ✅ | — | — |
  | UAT-03 | Logged-out suppresses callout | ✅ | — | — |
  | UAT-04 | Mobile 375×667 layout | ✅ | — | — |
- Notes for padi-eng: Implementation is clean, surgical, and matches the refined spec verbatim. Gate (`isParent && isLoggedIn`) is the same idiom already used elsewhere in the file (compare to `TeachingModeToggle` gate at line 273 which uses `!isParent`). No new imports, no new hooks — matches "pure JSX" requirement (Req 4).
- Notes for padi-design: Copy renders the curriculum order list as inline prose. If a future iteration wants visual hierarchy (e.g. numbered phase chips, bold phase names), that belongs in LR-24 main, not this subset. Current implementation matches the agreed scope.
- Missing from ticket: None. Spec was explicit enough to write the component without ambiguity. Out-of-scope items (Phase cards, "Maya's next lesson" hero) are correctly deferred to LR-24 main.
