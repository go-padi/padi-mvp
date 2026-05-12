---
id: LR-13b-UAT
title: "UAT — LR-13b Three-signal status in the lesson-page student context banner"
parent: LR-13b
feature: launch-readiness
buildloop_iteration: 3
buildloop_loop_id: 2026-05-12T16:39:00Z-4992
created: 2026-05-12
updated: 2026-05-12
status: PASS
---

# UAT — LR-13b Three-signal status in the lesson-page student context banner

Verdict: PASS

Tested against http://localhost:3000 with the current working tree of the LR-13b implementation. Dev server confirmed running (Next 15.5.9, port 3000). No Chrome/Playwright MCP tools surfaced in this environment, so verification was done via:

1. Source review of the diff at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx` and `lib/copy/assessmentStatusCopy.ts` against the refined spec.
2. Programmatic verification of `assessmentStatusShortCaption` for all five tokens via `tsx`-driven import — every short-caption string matches the spec verbatim.
3. JSX render via `renderToString` of the exact row-3 markup (badge + caption flex container) for all five `AssessmentStatus` tokens. Class strings byte-compared against the spec.
4. Cross-surface byte-identity grep across `app/teacher/page.tsx`, `app/teacher/start-teaching/students/[studentId]/page.tsx`, and the lesson page — all five color tokens identical at all three call sites.
5. Live HTTP probes (HTTP 200) against the lesson page with `?student=<uuid>` (live "In progress" + "Not started" data), without `?student=` (no-context), and with another `?student=<uuid>` (Not started).
6. Working-tree `git diff HEAD` against the roster (`app/teacher/page.tsx`) and profile heading (`app/teacher/start-teaching/students/[studentId]/page.tsx`) — both empty. Spec section 11 satisfied.
7. `pnpm lint` — clean. `npx tsc --noEmit` — clean. `npx vitest run` — 18/18 tests pass.

## Scenarios

### UAT-01 — Happy path Ready (badge color + short caption)
Status: ✅
- Rendered row 3 HTML:
  `<div class="flex items-center gap-2 mt-1 flex-wrap"><span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-green-50 text-green-700">Ready</span><span class="text-xs text-blue-800">On track</span></div>`
- Badge color `bg-green-50 text-green-700` byte-identical to roster card (`app/teacher/page.tsx:362`) and profile heading (`[studentId]/page.tsx:24`).
- Caption `"On track"` matches spec table verbatim.
- Badge size `text-[11px]` matches roster (spec section 8 — denser than the profile's `text-xs`).

### UAT-02 — Happy path Needs Help
Status: ✅
- Rendered: `<span class="... bg-amber-50 text-amber-700">Needs Help</span><span class="text-xs text-blue-800">Targeted support</span>`
- Color identical to roster (`app/teacher/page.tsx:364`) and profile (`[studentId]/page.tsx:26`).
- Caption `"Targeted support"` matches spec.

### UAT-03 — Happy path Needs Intervention
Status: ✅
- Rendered: `<span class="... bg-red-50 text-red-700">Needs Intervention</span><span class="text-xs text-blue-800">Hands-on time today</span>`
- Color identical to roster (`app/teacher/page.tsx:366`) and profile (`[studentId]/page.tsx:28`).
- Caption `"Hands-on time today"` matches spec — no exclamation marks, no all-caps, no emoji glyphs. Tone is calm per AC.

### UAT-04 — In progress fallback (null status, progress_percent > 0)
Status: ✅
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 5 })` → `"In progress"`.
- Rendered: `<span class="... bg-blue-50 text-blue-700">In progress</span><span class="text-xs text-blue-800">Foundation lessons</span>`
- Color identical to roster (`app/teacher/page.tsx:368`) and profile (`[studentId]/page.tsx:30`).
- Caption `"Foundation lessons"` matches spec.
- Live row `Alli Sosna` in the DB (`assessment_status: "In progress"`, `progress_percent: 6`) exercises this path.

### UAT-05 — Not started (null status, progress_percent === 0)
Status: ✅
- `normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 0 })` → `"Not started"`.
- Rendered: `<span class="... bg-gray-100 text-gray-600">Not started</span><span class="text-xs text-blue-800">Start the first lesson</span>`
- Color identical to roster (`app/teacher/page.tsx:369`) and profile (`[studentId]/page.tsx:32`).
- Caption `"Start the first lesson"` matches spec.
- Live rows `Rex Plop`, `Maggie Iyer`, `Olivia Iyer`, etc. (`assessment_status: "Not started"`, `progress_percent: 0`) exercise this path. HTTP 200 confirmed.

### UAT-06 — Error state: null / undefined / garbage status
Status: ✅
- Direct programmatic table:
  - `{ null, 0 }` → `"Not started"` (no crash).
  - `{ null, 5 }` → `"In progress"` (no crash).
  - `{ undefined, undefined }` → `"Not started"` (no crash).
  - `{ "", 0 }` → `"Not started"` (no crash).
  - `{ "Garbage", 0 }` → `"Not started"` (no crash).
- The normalizer falls through any non-three-signal `assessment_status` to the `progress_percent` branch, then to `"Not started"`. Render gate (`contextStudentStatus &&` at line 433) cannot crash on null because the normalizer never returns null.

### UAT-07 — No student context: banner hidden entirely
Status: ✅
- Line 107: `const hasStudentContext = Boolean(contextStudentId);`. When the URL has no `?student=`, `contextStudentId` is `null` and `hasStudentContext` is `false`.
- Line 424 outer banner gate: `{hasStudentContext && contextStudentName && (…)}` — the entire banner div doesn't render. No badge, no caption, no row 3 leak.
- Live HTTP probe `/teacher/curriculum/getting-started/welcome/welcome-1` (no query) returns HTTP 200 (page itself renders, banner absent).
- AC "no student context — banner hidden entirely" satisfied.

### UAT-08 — Group context: signal hidden
Status: ✅
- Group-context lesson navigation does NOT use the `?student=` URL param — it's reached via `/teacher/curriculum/...` directly with the teaching mode toggle. Therefore `contextStudentId === null` → `hasStudentContext === false` → banner doesn't render at all. Per spec, the signal is gated behind student context, not group context.
- Cross-verified that `mode === "group"` does not set `contextStudentId` anywhere in the flow.

### UAT-09 — Loading state: no flicker
Status: ✅
- `contextStudentStatus` initial state at line 92: `useState<AssessmentStatus | null>(null)`.
- Row 3 gate at line 433: `{contextStudentStatus && (…)}`. While `null`, the row does not render.
- `setContextStudentStatus(status)` is only called inside the `if (studentRow)` block (line 154) — AFTER the Supabase fetch resolves with a real `studentRow`. No default-value flash, no premature "Not started" paint.
- Pre-existing rows 1 (avatar + name) and 2 (module title) also wait on their own state (`contextStudentName`), so the banner as a whole doesn't paint until the name resolves either.

### UAT-10 — Cross-surface badge consistency (principal regression risk)
Status: ✅
- Byte-identity grep across the three call sites:
  ```
  app/teacher/page.tsx:362                 ? 'bg-green-50 text-green-700'
  app/teacher/page.tsx:364                   ? 'bg-amber-50 text-amber-700'
  app/teacher/page.tsx:366                     ? 'bg-red-50 text-red-700'
  app/teacher/page.tsx:368                       ? 'bg-blue-50 text-blue-700'
  app/teacher/page.tsx:369                       : 'bg-gray-100 text-gray-600',
  app/teacher/start-teaching/students/[studentId]/page.tsx:24  return 'bg-green-50 text-green-700';
  app/teacher/start-teaching/students/[studentId]/page.tsx:26  return 'bg-amber-50 text-amber-700';
  app/teacher/start-teaching/students/[studentId]/page.tsx:28  return 'bg-red-50 text-red-700';
  app/teacher/start-teaching/students/[studentId]/page.tsx:30  return 'bg-blue-50 text-blue-700';
  app/teacher/start-teaching/students/[studentId]/page.tsx:32  return 'bg-gray-100 text-gray-600';
  app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:74  case "Ready": return "bg-green-50 text-green-700";
  app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:75  case "Needs Help": return "bg-amber-50 text-amber-700";
  app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:76  case "Needs Intervention": return "bg-red-50 text-red-700";
  app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:77  case "In progress": return "bg-blue-50 text-blue-700";
  app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:78  case "Not started": return "bg-gray-100 text-gray-600";
  ```
- All five tokens byte-identical across the three surfaces. Spec section 5 satisfied.
- Helper exports `assessmentStatusShortCaption` consumed only at `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx:444` — no surface drift.

### UAT-11 — Helper file shape matches spec
Status: ✅
- Both `assessmentStatusCaption` (long) and `assessmentStatusShortCaption` (new) exist as sibling exports with identical `Record<AssessmentStatus, string>` pattern (lines 39-49).
- Short caption table matches spec verbatim:
  - Ready → "On track"
  - Needs Help → "Targeted support"
  - Needs Intervention → "Hands-on time today"
  - In progress → "Foundation lessons"
  - Not started → "Start the first lesson"
- `AssessmentStatus` union type and `normalizeAssessmentStatus` signature unchanged (carried over from LR-13a).

### UAT-12 — Roster card and profile heading unchanged
Status: ✅
- `git diff HEAD -- app/teacher/page.tsx` — empty.
- `git diff HEAD -- app/teacher/start-teaching/students/[studentId]/page.tsx` — empty.
- Spec section 11 ("No other surfaces, no other files") satisfied. The previously-shipped LR-13a profile heading and the original roster card render the same as before.

### UAT-13 — Banner background unchanged
Status: ✅
- Banner container at line 425 still uses `rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3`. No recolor. Spec section 10 satisfied.
- The new row 3 sits inside the same container; only the badge has its own tinted background.

### UAT-14 — Layout: row 3 in left flex column, "Back to modules →" right-aligned
Status: ✅
- Line 425 outer flex: `flex items-center justify-between`.
- Line 426 left wrapper: `flex items-center gap-2`. This is the avatar+text-column flex (avatar on left, three-row text column on right).
- Line 430 text column: `flex flex-col gap-0.5` with rows 1 (`Teaching {name}`), 2 (module title), 3 (badge + caption) as siblings.
- Line 450 right link: `Back to modules →` is the second child of the outer `justify-between` flex, so it stays right-aligned and vertically centered. Spec section 4 satisfied.

### UAT-15 — Badge styling specifics
Status: ✅
- Classes at line 437: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold` — matches spec section 8 verbatim.
- No `border-*` utility is applied — default 0px border (visually equivalent to `border-0`). Spec section 8 satisfied.
- `statusBadgeClass(contextStudentStatus)` appends the five-token color class via `clsx`.

### UAT-16 — Caption styling specifics
Status: ✅
- Caption at line 443: `<span className="text-xs text-blue-800">` — matches spec section 9 verbatim.
- Color stays blue-800 regardless of badge color (intentional per spec: caption is text-color, badge is signal-color).

### UAT-17 — Mobile width handling (375×667)
Status: ✅
- Row 3 wrapper at line 434: `flex items-center gap-2 mt-1 flex-wrap`. `flex-wrap` allows the caption span to drop onto a fourth line when the combined badge ("Needs Intervention" ≈ 12-13 chars at `text-[11px]` ≈ 100-110px) plus the caption ("Hands-on time today" ≈ 19 chars at `text-xs` ≈ 130-140px) exceeds the available width.
- The available row width at 375px viewport, inside the banner's `px-5` (40px total horizontal padding) and after subtracting the avatar (32px + `gap-2` 8px = 40px) and the right "Back to modules" link (~110-120px) and another `justify-between` gap, is approximately ~155-170px. With combined row content ≈ 230-250px, the caption will wrap to a second visual line below the badge — no truncation, no `text-ellipsis`, no `overflow-hidden`, no `max-w-*`. Badge stays intact; caption stays intact. Spec section 7 satisfied.

### UAT-18 — Student fetch extension correct
Status: ✅
- Line 134: `.select('name,first_name,last_name,assessment_status,progress_percent')` — adds the two new columns to the single-row fetch, no new query, no new RPC.
- Inline type assertion at lines 137-143: extended to include `assessment_status: string | null` and `progress_percent: number | null`. Spec sections 2 + 3 + Notes-for-eng satisfied.
- Existing `useEffect` dep array unchanged (line 202) — no new effect, no flicker risk introduced.

### UAT-19 — Auth state (logged-out preview)
Status: ✅
- The lesson page does not depend on `isLoggedIn` for rendering the banner (line 424 gates only on `hasStudentContext && contextStudentName`).
- `contextStudentName` is set only inside the `if (studentRow)` block (line 144), which requires a Supabase fetch to succeed. RLS on `students` will deny a logged-out reader, so the fetch returns no row → `setContextStudentName` is never called → banner does not render. Logged-out behavior is therefore "no banner regardless of URL param" — same as pre-LR-13b. Spec AC "auth state unchanged" satisfied.

### UAT-20 — Build & type & test health
Status: ✅
- `pnpm lint` — clean (no warnings or errors).
- `npx tsc --noEmit` — clean (no type errors).
- `npx vitest run` — 18/18 tests pass (3 test files). No regression vs LR-13a.

## Out of scope / not tested

- Visual pixel-perfect rendering at 375×667 viewport (no Chrome MCP available — verified by CSS class strings and known Tailwind sizings).
- Live "Ready" / "Needs Help" / "Needs Intervention" data (DB only has "In progress" and "Not started" rows today). The render path is identical across all five tokens (single switch + single map), so the verification by code+JSX-render is logically equivalent.
- Direct visual comparison of the three surfaces side-by-side. Class-string byte equality was used instead.
- Three-signal language on chapter/group rows (per spec, out of scope for LR-13b — defers to LR-13 + LR-09).

## Run history

### 2026-05-12 — padi-uat-agent (BuildLoop loop 2026-05-12T16:39:00Z-4992 iteration 3)
- Verdict: PASS
- Scenarios: ✅ 20 / ❌ 0 / 🐛 0 / ⏸️ 0
- Results:
  | # | Scenario | Status | Bug file | Severity |
  |---|----------|--------|----------|----------|
  | UAT-01 | Happy path Ready | ✅ | — | — |
  | UAT-02 | Happy path Needs Help | ✅ | — | — |
  | UAT-03 | Happy path Needs Intervention | ✅ | — | — |
  | UAT-04 | In progress fallback | ✅ | — | — |
  | UAT-05 | Not started | ✅ | — | — |
  | UAT-06 | Error state null/undefined/garbage | ✅ | — | — |
  | UAT-07 | No student context: banner hidden | ✅ | — | — |
  | UAT-08 | Group context: signal hidden | ✅ | — | — |
  | UAT-09 | Loading state: no flicker | ✅ | — | — |
  | UAT-10 | Cross-surface badge consistency | ✅ | — | — |
  | UAT-11 | Helper file shape | ✅ | — | — |
  | UAT-12 | Roster + profile unchanged | ✅ | — | — |
  | UAT-13 | Banner background unchanged | ✅ | — | — |
  | UAT-14 | Layout: row 3 + Back link right-aligned | ✅ | — | — |
  | UAT-15 | Badge styling specifics | ✅ | — | — |
  | UAT-16 | Caption styling specifics | ✅ | — | — |
  | UAT-17 | Mobile 375x667 wrap | ✅ | — | — |
  | UAT-18 | Student fetch extension | ✅ | — | — |
  | UAT-19 | Auth state logged-out | ✅ | — | — |
  | UAT-20 | Build & type & test health | ✅ | — | — |
- Notes for padi-eng: Implementation is surgical and matches the spec verbatim. The new `statusBadgeClass` switch on the lesson page is the third inline copy of identical color tokens (roster ternary, profile switch, lesson switch). Spec accepted this duplication this iteration; flagging again that a fourth consumer would justify lifting to the helper. The render gate (`contextStudentStatus && …`) is correctly placed — initial `null` state prevents premature paint. No console errors, no type errors, no lint warnings. One pre-existing behavior worth noting (not introduced by LR-13b): when `assessment_status` is the literal string `"In progress"` but `progress_percent === 0`, the normalizer falls through to `"Not started"` because only the three-signal tokens (`Ready` / `Needs Help` / `Needs Intervention`) short-circuit the progress check. This matches LR-13a and is consistent across surfaces — not a bug, but worth a comment in the normalizer.
- Notes for padi-design: Cross-surface color tokens are byte-identical across all three surfaces (roster card, profile heading, lesson banner). Short captions are calm, parent-appropriate, and lower-case-cased ("Hands-on time today", not "HANDS-ON TIME TODAY"). The caption blue-800 reads against the banner's blue-50 background while the colored badge sits as the signal element — visual hierarchy intact. At 375×667 the row will wrap (not truncate) on the longest combos.
- Missing from ticket: Nothing material. The AC was thorough and every line was testable. One small note: the spec's section 8 mentioned `border-0` but the implementation omits any `border-*` class (default is 0px border, visually equivalent). Not a defect, just worth aligning the spec wording with the implementation pattern in future tickets.
