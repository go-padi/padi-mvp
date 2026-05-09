---
id: SIGNIN-2-bug-telemetry-marker-wrong-text
title: "Telemetry marker comment text does not match AC-04 exact-string requirement"
type: bug
status: fixed
severity: P1
priority: high
feature: sign-in-flow
parent: SIGNIN-2
uat: SIGNIN-2-uat
ac: AC-04
file: components/auth/SignInModal.tsx
created: 2026-05-08
---

## Summary

AC-04 requires the **exact** comment string

```
// TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands
```

immediately before the `onClose()` call on the session-returned branch in `attemptSignup`. The implementation instead writes:

```
// telemetry: signup_completed (session returned)
```

The required string is a contractual marker that downstream tooling / future search will grep for (`TODO(activation-telemetry)`). The shipped string is missing the `TODO(...)`-form prefix, the verb `emit`, the trigger phrase `event here when telemetry plumbing lands`, and is therefore not a valid anchor.

## Steps to reproduce

1. Open `components/auth/SignInModal.tsx` on branch `buildloop/signin-2-polish`.
2. Inspect line 106 (the line preceding the `onClose()` call inside `attemptSignup`'s session-returned branch).
3. Run `grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx`.

## Expected

`grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx` returns line 106 with the exact AC-04 string.

## Actual

```
$ grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx
(no output)

$ grep -n "telemetry" components/auth/SignInModal.tsx
106:      // telemetry: signup_completed (session returned)
```

## Suggested fix

Replace the line at `components/auth/SignInModal.tsx:106` with the exact string:

```ts
      // TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands
```

(Indentation: 6 spaces, matching the surrounding block.)

## Evidence

- Source: `components/auth/SignInModal.tsx:106`.
- Diff vs main: `git diff main -- components/auth/SignInModal.tsx` shows the inserted line is the wrong text.

## Fix Notes

**Root cause:** The telemetry marker comment was paraphrased (`// telemetry: signup_completed (session returned)`) instead of the exact contractual string AC-04 requires. AC-04 specifies the marker is a grep anchor for downstream tooling and must match the `TODO(activation-telemetry)` form verbatim.

**Files changed:**
- `components/auth/SignInModal.tsx` — line 106 replaced with the exact AC-04 string `// TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands`, with 6-space indentation matching the surrounding session-returned branch in `attemptSignup`.

**Why this fix is correct:** The new comment text is character-for-character what AC-04 mandates, so `grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx` will now match. The comment remains immediately before the `onClose()` call on the session-returned branch (the original placement was already correct — only the text was wrong). No code paths or runtime behavior change.
