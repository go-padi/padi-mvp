---
id: LR-24b-UAT
parent: LR-24b
feature: launch-readiness
type: uat
status: complete
created: 2026-05-13
updated: 2026-05-13
buildloop_iteration: 7
buildloop_loop_id: 2026-05-14T02:23:19Z-fe49
verification: code-review (no Chrome MCP available in environment)
---

# UAT — LR-24b Start-here badge on first curriculum chapter for parents

Verdict: PASS

## Scope

Verify that `renderChapter(ch, idx)` in `app/teacher/curriculum/page.tsx` renders a blue "Start here" badge alongside the chapter title only when `isParent && isLoggedIn && idx === 0`. All other states (other chapters, teachers, logged-out) must render no badge. Mobile 375×667 must not overflow.

## Scenarios

### UAT-01 — Parent + logged-in: badge on first chapter only
Status: ✅
- Source verified at `app/teacher/curriculum/page.tsx:254-258`. Badge JSX `<span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">Start here</span>` is gated by `isParent && isLoggedIn && idx === 0`.
- `chapters.map(renderChapter)` at line 328 passes `idx` automatically, so only `idx === 0` (first chapter rendered, which for parents will be "Phonological Awareness" since the parent path uses `effectiveMode='individual'` and the chapter list is sorted by `display_order`) gets the badge. Chapters 2–7 evaluate `idx === 0` to false and render no badge.

### UAT-02 — Teacher + logged-in: no badge anywhere
Status: ✅
- `isParent` is `isHydrated && role === 'parent'` (line 65). For teachers, `role === 'teacher'`, so `isParent === false` and the badge JSX never renders for any `idx`.
- Teachers may also hit the `effectiveMode === 'both'` branch (line 311) where the two `groupChapters.map(renderChapter)` / `individualChapters.map(renderChapter)` calls likewise pass `idx`, but `isParent` is still false so no badge appears.

### UAT-03 — Logged-out: no badge
Status: ✅
- `isLoggedIn` is false until auth resolves with a session. The badge condition `isParent && isLoggedIn && idx === 0` short-circuits on `isLoggedIn === false`. No badge regardless of any stale `role` value.
- Additionally, the parent-only "curriculum builds in order" callout at line 290 is also gated by `isParent && isLoggedIn`, so logged-out visitors see neither the callout (LR-24a) nor the badge (LR-24b). Consistent.

### UAT-04 — Mobile 375×667: badge fits without wrap
Status: ✅
- Badge sits inside `<p className="text-sm font-semibold text-gray-900 flex items-center gap-2">` (line 254). The flex container allows wrapping by default (no `flex-nowrap`); `items-center` keeps any wrapped line vertically aligned. Badge classes (`px-2 py-0.5 text-[11px] rounded-full`) produce a compact pill ~70px wide.
- The only chapter that ever shows the badge is the first one. For parents, the first chapter is "Phonological Awareness" (22 chars, ~155px at `text-sm font-semibold`). Title + gap-2 + badge ≈ 235px, well within the available ~290px content area at 375px viewport (375 viewport − 20px page padding − 20px card padding − 28px chevron − 12px gap-3 ≈ 295px). No overflow.
- Even if a future rename pushed the first chapter title longer, the flex container would wrap the badge to a new line rather than cause horizontal overflow. No horizontal-scroll risk.

## Code-review fallback notes

- **Why code review and not Chrome.** No Chrome / browser MCP tools were available in this sandbox. UAT protocol's code-review fallback applies. All four scenarios are pure render-time conditionals on `isParent`, `isLoggedIn`, and `idx`, which are deterministic from source — they do not depend on data state, Supabase responses, or runtime side effects that would require live verification.
- `pnpm lint`: clean (no warnings or errors).
- `pnpm tsc --noEmit`: clean.
- `pnpm build`: succeeded, `/teacher/curriculum` listed as static route (3.5 kB).

## Run history

### 2026-05-13 — padi-uat-agent (BuildLoop iter 7)
- Verdict: PASS
- Scenarios: ✅ 4 / ❌ 0 / 🐛 0 / ⏸️ 0
- Verification mode: code review + lint + tsc + build (no browser tools available)
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Parent + logged-in: badge on first chapter only | ✅ | — | — |
  | UAT-02 | Teacher + logged-in: no badge anywhere | ✅ | — | — |
  | UAT-03 | Logged-out: no badge | ✅ | — | — |
  | UAT-04 | Mobile 375×667: badge fits without wrap | ✅ | — | — |
- Notes for padi-eng: implementation at `app/teacher/curriculum/page.tsx:238-274` matches the refined spec exactly. The `idx` param is consumed from `chapters.map(renderChapter)` (line 328) and from both branches under `effectiveMode === 'both'` (lines 316, 322). Badge condition correctly composes with the existing `isParent && isLoggedIn` callout above. No new imports, no schema changes, no auth changes. Surgical diff as required.
- Notes for padi-design: visual continuity preserved with LR-24a — same `bg-blue-100` / `text-blue-800` palette as the order callout. Badge is sized (`text-[11px]`, `py-0.5`) to read as a secondary affordance, not compete with the chapter title.
- Missing from ticket: none. AC is fully testable from source; no scenarios were untestable or ambiguous. Browser-level visual regression (e.g., a snapshot of the actual rendered badge) was not possible in this environment but the CSS classes are standard Tailwind utilities with no custom variants, so render fidelity is high-confidence.
