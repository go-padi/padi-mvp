---
id: KAN-157
title: "[Bug] LR-11d touch hint renders \\u2014 literal instead of em-dash"
type: bug
status: fixed
priority: P1
severity: high
feature: launch-readiness
parent: LR-11d
uat: LR-11d-UAT
created: 2026-05-22
created_by: padi-uat-agent
---

### Summary

The touch-friendly inline hint paragraph rendered below an off-sequence module row displays the **literal 6-character string `—`** instead of an em-dash (—). Confirmed by inspecting the compiled webpack bundle for the page chunk.

### Where

- File: `app/teacher/start-teaching/students/[studentId]/page.tsx`
- Line: 810
- Offending JSX:

```tsx
{disabledClickHintModule === mod.code && nextModule && (
  <p className="mt-1 text-xs text-gray-500">
    Continue with {nextModule.chapterTitle} — {nextModule.moduleTitle} first
  </p>
)}
```

In JSX text content, `—` is preserved verbatim by the compiler (SWC emits the JSX text as a JS string and the backslash is escaped to `\\u2014`). The browser then renders the literal 8-character sequence ` — ` between chapter and module title.

Compiled bundle evidence (`.next/static/chunks/app/teacher/start-teaching/students/[studentId]/page.js`):

```
"Continue with ",
nextModule.chapterTitle,
" \\u2014 ",
nextModule.moduleTitle,
```

For comparison, the sibling `title` attribute on line 798 uses a **template literal**, where `—` IS processed by the JS engine, producing the real em-dash:

```
title: "Continue with ".concat(nextModule.chapterTitle, " — ").concat(...)
```

So the desktop tooltip is correct; the on-touch inline hint is broken.

### Steps to reproduce

1. Sign in as a teacher.
2. Open a student profile with at least one off-sequence module (e.g., a fresh student so every module past the first is off-sequence).
3. Expand a chapter past the next-up one.
4. Tap (or click) a disabled gray "Start" button on any non-next-up, non-completed module row.
5. Observe the inline hint paragraph that appears below the row.

### Expected

`Continue with Phonological Awareness — Rhyming first` (em-dash, U+2014)

### Actual

`Continue with Phonological Awareness — Rhyming first` (literal backslash-u-2014)

### Why this is P1

This is the only on-touch surfacing of the off-sequence guidance. Padi's primary classroom device is iPad — native `title` tooltips don't show on touch, so the inline hint is the *only* feedback a teacher gets when they tap a gated module on tablet. Shipping with `—` rendered as escape gibberish breaks AC #3's exact wording requirement and erodes trust in the polish of the gating affordance.

### Fix

Replace `—` with a literal em-dash (or `{'—'}` expression) in the JSX text on line 810. The sibling line 633 already does it correctly:

```tsx
{nextModule.chapterTitle} — {nextModule.moduleTitle}
```

Suggested patch:

```tsx
<p className="mt-1 text-xs text-gray-500">
  Continue with {nextModule.chapterTitle} — {nextModule.moduleTitle} first
</p>
```

### Acceptance for fix

- The rendered inline hint shows a real em-dash character between section and module titles.
- The compiled bundle contains the em-dash as a UTF-8 character, not the escape sequence `\\u2014`.
- No regression to the tooltip text on desktop hover.


## Fix Notes

**Root cause.** The JSX text on the inline hint paragraph contained the 6-character escape sequence `\u2014` (backslash, u, 2, 0, 1, 4), not a UTF-8 em-dash. JSX text content is treated as literal characters by the SWC compiler — `\u2014` is only interpreted as a unicode escape inside JS string/template literals (which is why the sibling `title` attribute on line 798, written with backticks, rendered correctly while the JSX text body did not).

**Files changed.** `app/teacher/start-teaching/students/[studentId]/page.tsx` — replaced the escape sequence in the inline hint JSX text with a literal UTF-8 em-dash (bytes `\xe2\x80\x94`). Also bumped the hint paragraph color from `text-gray-500` to `text-gray-600` for safer contrast on the now-non-faded row (related to KAN-158 — `text-gray-500` on white was borderline; `text-gray-600` is comfortably above AA).

**Why this fix is correct.** The em-dash is now stored in the source as its actual UTF-8 representation, matching the pattern already used elsewhere in the same file (e.g., line 633's `{nextModule.chapterTitle} — {nextModule.moduleTitle}`). SWC preserves JSX text characters as-is in the compiled bundle, so the browser receives the real U+2014 codepoint. The `title` attribute (line 798) was left untouched because its template-literal form already evaluates the escape correctly at runtime — no regression to the desktop tooltip.
