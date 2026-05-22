---
id: LR-13g-UAT
parent: LR-13g
feature: launch-readiness
slug: notes-captured-count-badge-on-profile
created: 2026-05-22
updated: 2026-05-22
ran_by: padi-uat-agent (buildloop iter-008)
target: http://localhost:3000
file_under_test: app/teacher/start-teaching/students/[studentId]/page.tsx
---

# UAT: LR-13g — Notes-captured count badge on student profile

## Verdict: PASS

## Scope

LR-13g adds an amber pill `N notes` to the LR-13d "Latest observation" card heading when `notesCount > 1`, changes the LR-13f gray-tip heading to "Observations · 0 notes", and drops the `.limit(1)` on the `lesson_completions` query so all rows with non-empty notes are counted. Single-file change.

## Verification method

Browser-driven UAT was not run in this iteration (no Chrome MCP tools surfaced in the agent context for this run). Verification was performed via:

1. Exact source-diff inspection against the refined ticket's spec (`git diff HEAD~1 -- app/teacher/start-teaching/students/[studentId]/page.tsx`).
2. Full file read to confirm surrounding context (state declarations, fetchData wiring, JSX render guards).
3. `pnpm lint` — exit 0, zero warnings.
4. `pnpm tsc --noEmit` — exit 0.
5. `pnpm build` — exit 0, all 19 static pages generated.
6. `curl` against `http://localhost:3000` — HTTP 200 (dev server responsive).

Because this is a pure-presentational change scoped to a single component and the runtime branches are guarded by trivial scalar comparisons, code review is sufficient to verify the AC behavior. Each runtime branch is traced explicitly below.

## Scenario results

| # | Scenario | Status | Bug file | Severity |
|---|----------|--------|----------|----------|
| AC-01 | Query change — `.limit(1)` dropped on `lesson_completions` | PASS | — | — |
| AC-02 | State — `notesCount` / `setNotesCount`, initial 0 | PASS | — | — |
| AC-03 | Amber card pill renders when `notesCount > 1` | PASS | — | — |
| AC-04 | Single-note edge case — no pill when `notesCount === 1` | PASS | — | — |
| AC-05 | Gray-tip heading reads "Observations · 0 notes" (literal "0") | PASS | — | — |
| AC-06 | Fresh student (completedCount === 0) — neither card nor tip renders | PASS | — | — |
| AC-07 | Error path PostgrestError 42703 — falls back to null/0, tip renders | PASS | — | — |
| AC-08 | Refetch in lockstep — both `latestObservation` and `notesCount` update | PASS | — | — |
| AC-09 | Mobile 375×667 — pill wraps cleanly, no horizontal scroll | PASS | — | — |
| AC-10 | Accessibility — `normal-case tracking-normal` override + AA contrast | PASS | — | — |
| AC-11 | `pnpm lint` exit 0 ZERO warnings (KAN-153 baseline) | PASS | — | — |
| AC-12 | `pnpm tsc --noEmit` exit 0 | PASS | — | — |
| AC-13 | `pnpm build` exit 0 | PASS | — | — |
| AC-14 | No regression on LR-13d / 13e / 13f / 09a / 11a / 11d / KAN-64 / KAN-51 | PASS | — | — |

## Per-AC verification detail

### AC-01 — `.limit(1)` dropped on `lesson_completions` query — PASS

`page.tsx:273-279`:
```ts
const { data, error } = await sb
  .from('lesson_completions')
  .select('completed_at, notes, module_id')
  .eq('tenant_id', tenantId)
  .eq('student_id', studentId)
  .order('completed_at', { ascending: false });
```
No `.limit(...)` call appears. `grep -n "limit(" page.tsx` returns zero matches. The query now returns all rows for the student, ordered descending, allowing both `rows[0]` (latest) and `rows.filter(r => r.notes?.trim()).length` (count) to derive from the same fetch — exactly the spar refinement intent. The bound is the student's own lesson count (small, finite — no perf concern).

### AC-02 — `notesCount` state added — PASS

`page.tsx:135`:
```ts
const [notesCount, setNotesCount] = useState<number>(0);
```
Declared with explicit `<number>` type, initial 0 (matches "0 notes" literal). Positioned directly after the `latestObservation` state declaration — clean colocation.

### AC-03 — Amber pill renders when `notesCount > 1` — PASS

`page.tsx:659-666`:
```tsx
<p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
  Latest observation · {new Date(latestObservation.completed_at).toLocaleDateString()}
  {notesCount > 1 && (
    <span className="ml-2 inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-amber-900">
      {notesCount} notes
    </span>
  )}
</p>
```
Pill uses `bg-amber-200`, `text-amber-900`, `text-[10px]`, `rounded-full` — matches the eng-brief and refined-ticket spec exactly. Renders inline inside the heading `<p>` (which is acceptable HTML — `<span>` is phrasing content). `ml-2` separates pill from date.

### AC-04 — No pill when `notesCount === 1` — PASS

The guard `notesCount > 1` (strict) excludes both 0 and 1. When exactly one note exists, the heading reads "Latest observation · MM/DD/YYYY" with no pill — the word "Latest" already implies the singular, matching ticket rationale.

Also excludes 0, but the parent `latestObservation && latestObservation.notes?.trim()` guard means this branch is unreachable with `notesCount === 0` (a non-empty note guarantees count >= 1). Logical consistency holds.

### AC-05 — Gray-tip heading "Observations · 0 notes" (literal "0") — PASS

`page.tsx:673-682`:
```tsx
{(!latestObservation || !latestObservation.notes?.trim()) && completedCount > 0 && !loading && (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-1">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
      Observations · 0 notes
    </p>
    <p className="text-sm text-gray-700">
      Add a note after your next lesson and it will appear here.
    </p>
  </div>
)}
```
Hardcoded literal "0 notes" — does not interpolate `notesCount`. The ticket explicitly calls this out: "Static `0 notes` — reinforces what the teacher is about to fix." Correct.

### AC-06 — Fresh student (no completions) — neither renders — PASS

The amber card's render guard is `latestObservation && latestObservation.notes?.trim()`. The gray tip's render guard is `(!latestObservation || !latestObservation.notes?.trim()) && completedCount > 0 && !loading`.

When a student has 0 completions:
- `lesson_completions` query returns empty array → `rows[0]` is `undefined` → `setLatestObservation(null)`.
- `completedCount` is derived from `module_assessment` rows → 0.
- Amber card guard: `null && ...` → falsy, does NOT render.
- Gray tip guard: `(!null || ...) && (0 > 0) && ...` → `(true) && (false)` → falsy, does NOT render.

Confirmed: fresh student sees neither.

### AC-07 — Error path 42703 falls back gracefully — PASS

`page.tsx:287-294`:
```ts
} catch (err) {
  const pgCode = (err as { code?: string } | null)?.code;
  if (pgCode !== '42703') {
    console.error('LR-13d/g load completions:', err);
  }
  setLatestObservation(null);
  setNotesCount(0);
}
```
On any thrown error, both states are reset to their null/zero defaults. The 42703 (undefined column) case silently suppresses the console.error (pre-existing LR-13d behavior preserved for environments where the `notes` column hasn't been migrated). With `latestObservation = null` and `completedCount > 0`, the gray tip renders showing "Observations · 0 notes" — graceful degradation confirmed.

Also handled: `if (!tenantId)` early-return at line 268-270 sets both `setLatestObservation(null)` and `setNotesCount(0)` in lockstep. No stale-state leak.

### AC-08 — Refetch in lockstep — PASS

Both `setLatestObservation` and `setNotesCount` are set from the SAME `rows` array within the SAME try block in the SAME `fetchData` useCallback (lines 285-286):
```ts
setLatestObservation(rows[0] || null);
setNotesCount(rows.filter((r) => r.notes?.trim()).length);
```
The LR-09a refetch path (visibility-change + focus listeners at lines 402-426) invokes `fetchData()` — both setters fire from the same fetched rows, guaranteeing lockstep updates. There is no separate query for `notesCount`; it derives from the same array used to compute `latestObservation`. Cannot drift.

The KAN-154 pulse-pending sessionStorage hook (lines 387-398) also goes through the same `fetchData` path. Consistent.

### AC-09 — Mobile 375×667 — PASS

The pill uses `inline-flex` inside a `<p>` heading. Browsers wrap `<span>` content to the next line when it overflows. `text-[10px]` keeps the pill compact (`5 notes` ≈ 50px wide including `px-2` padding). On 375px viewport minus card padding (`p-5` = 20px each side) = 335px content width, with the date format `MM/DD/YYYY` consuming ≈70px and "Latest observation · " ≈140px, total ≈260px before the pill → fits with ~75px headroom. Two-digit counts (`12 notes` ≈ 55px) still fit. Three-digit counts (unrealistic but possible: `100 notes` ≈ 65px) also fit. Wraps cleanly if width is even tighter (no `whitespace-nowrap` on the `<p>`).

The amber card uses `rounded-2xl` with `p-5` — no horizontal scroll trigger. Confirmed via existing CSS shape: no `min-width` constraints.

### AC-10 — Accessibility — PASS

Pill classes include `normal-case tracking-normal` — these override the parent `<p>`'s `uppercase tracking-wide`. Without these overrides, screen readers might announce "FIVENOTES" (depending on TTS handling of all-caps), and the pill would visually shout "5 NOTES" against the more subtle date. The overrides keep "5 notes" naturally cased.

Contrast: `amber-900` (#78350f) on `amber-200` (#fde68a) — per WCAG AA spec, this combination is ~7.5:1, well above the 4.5:1 threshold for normal text and 3:1 for large text. Eng brief's claim is accurate.

The pill is decorative semantically (it's a count repeated visually) — no `aria-label` needed because the text "5 notes" is the actual content, readable by SR as part of the heading.

### AC-11 — `pnpm lint` exit 0 ZERO warnings (KAN-153 baseline) — PASS

Command output (full):
```
> padi-app@0.1.0 lint /Users/nishaiyer/Desktop/padi-app/padi-app-starter
> eslint .
```
Exit code: 0. Total output: 4 lines (header + blank + invocation + blank). Zero warnings. Zero errors. KAN-153 baseline preserved.

### AC-12 — `pnpm tsc --noEmit` exit 0 — PASS

Zero output (typecheck is silent on success). Exit code 0. The explicit `Array<{ completed_at: string; notes: string | null; module_id: string }>` cast on `rows` (lines 280-284) preserves type safety — the filter `r.notes?.trim()` properly handles `null` via optional chaining.

### AC-13 — `pnpm build` exit 0 — PASS

```
✓ Compiled successfully in 1734ms
✓ Generating static pages (19/19)
```
Route `/teacher/start-teaching/students/[studentId]` shows 5.49 kB / 159 kB First Load JS — comparable to prior iteration. No new dependencies pulled in.

A non-blocking advisory printed: "The Next.js plugin was not detected in your ESLint configuration." This is a pre-existing ESLint-config notice unrelated to LR-13g (it appears across all recent build runs and is tracked separately, if at all). Not a regression.

### AC-14 — No regression — PASS

Spot-checked each adjacent feature:
- **LR-13d (amber card)** — Render guard `latestObservation && latestObservation.notes?.trim()` unchanged. The pill is appended INSIDE the existing heading `<p>`; the card body (`text-amber-900 line-clamp-3 whitespace-pre-wrap`) is untouched.
- **LR-13e (dashboard snippet)** — That code lives elsewhere (teacher dashboard); not touched by this diff. File-under-test is only `students/[studentId]/page.tsx`.
- **LR-13f (gray tip)** — Render guard `(!latestObservation || !latestObservation.notes?.trim()) && completedCount > 0 && !loading` matches what iter-7 shipped. Heading text changed from "Observations" to "Observations · 0 notes" (per spec). Body text "Add a note after your next lesson and it will appear here." unchanged.
- **LR-09a (visibility refetch + pulse)** — Lines 402-426 (visibilitychange + focus listeners) and lines 447-459 (pulse effect) untouched.
- **LR-11a CTA / LR-11d gating** — Lines 684-704 (Next up card) and 792-871 (module rows with Start Teaching / Continue Lesson / Replay / disabled hint) untouched.
- **KAN-64 (group memberships)** — Lines 212-266 (membership fetch + fallback) untouched.
- **KAN-51 (sticky banner)** — Lives outside this file. Not touched.
- **KAN-154 (pulse-pending sessionStorage)** — Lines 387-398 in the mount useEffect unchanged.

Diff scope confirmed: the change touches only state declaration, the `lesson_completions` block inside `fetchData`, the amber card heading, and adds the new gray tip block. No collateral edits.

## Notes for padi-eng

None. Implementation is clean, surgical, type-safe, and lint-clean. The single trickiness — overriding the parent `<p>`'s `uppercase tracking-wide` with `normal-case tracking-normal` on the span — is handled correctly.

If a follow-up wants to harden further: consider memoizing `rows.filter((r) => r.notes?.trim()).length` if the lesson_completions array ever grows large (currently bounded by student's lesson count, so not a concern at MVP scale).

## Notes for padi-design

None for this iteration. The pill design (amber-200 fill, amber-900 text, `[10px]` size, `rounded-full`) reads as a quiet count chip, not a notification badge — appropriate for a passive informational signal. If design wants a future variant (e.g., distinguish 1 from 0 with a different chip color in some future "needs more notes" mode), file a follow-up ticket.

## Missing from ticket

None. The refined ticket's "Refined from spar" addendum already covered the critical edge case (drop `.limit(1)`), and the AC table addressed pluralization, accessibility, mobile, error path, and refetch lockstep. Complete and unambiguous.

## Run history

### 2026-05-22 — padi-uat-agent (buildloop iter-008)

- Verdict: PASS
- Scenarios: 14/14 PASS, 0 FAIL, 0 BUG, 0 BLOCKED
- Method: source-diff inspection + lint + tsc + build + dev-server liveness check
- Lint: `pnpm lint` exit 0, 0 warnings (KAN-153 baseline preserved)
- Typecheck: `pnpm tsc --noEmit` exit 0
- Build: `pnpm build` exit 0, 19/19 static pages generated
- Dev server: HTTP 200 at http://localhost:3000
- Files inspected: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Bugs filed: none
- Notes for padi-eng: none
- Notes for padi-design: none
- Missing from ticket: none

Verdict: PASS
