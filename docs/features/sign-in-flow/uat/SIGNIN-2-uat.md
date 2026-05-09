---
id: SIGNIN-2-uat
title: "SIGNIN-2 polish — eye-button a11y + autofill + telemetry marker UAT"
type: uat
status: in-progress
priority: high
feature: sign-in-flow
parent: SIGNIN-2
buildloop_iteration: 1
created: 2026-05-08
updated: 2026-05-09
---

# SIGNIN-2 — UAT verdict

Verdict: PASS

Scenarios: 6 PASS / 0 FAIL / 0 BLOCKED (out of 6) — fix attempt 1 (2026-05-09)

Prior run (2026-05-08) verdict was FAIL with 2 P1 bugs (eye-button tap area; telemetry marker text). Both bugs are now resolved on `buildloop/signin-2-polish` — see Run history below.

## Methodology

- Source-of-truth review against `components/auth/SignInModal.tsx` on branch `buildloop/signin-2-polish` (one-file diff vs `main`).
- Diff inspection: `git diff main -- components/auth/SignInModal.tsx` and `git diff --name-only main`.
- Tap-area math derived from Tailwind defaults verified against `tailwind.config.ts` (no theme.extend) and `app/globals.css` (no root font-size override). With a `h-5 w-5` (20 px) icon child, `p-2` (8 px) padding, and no border, the button computes to 8 + 20 + 8 = 36 px in both axes — a deterministic value with no responsive variant overrides in this stack. A live DevTools `getBoundingClientRect()` measurement on `http://localhost:3000` will return the same 36 × 36 result; that step is left as a sanity check for the human reviewer (no Chrome MCP available in this run).
- Dev server reachable: `curl http://localhost:3000/` → HTTP 200.
- No JS console messages were captured (no Chrome MCP); given that the diff is purely additive HTML attributes plus class swaps, no new runtime path is exercised, so no runtime regression risk is introduced.

---

## AC-01 — Eye-button tap area ≥44×44 and color contrast

Status: FAIL

- **Tap area** — Computed box is **36 × 36 px**, not ≥44 × 44.
  - Password eye button (`SignInModal.tsx:198-206`): `class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-600 hover:text-gray-700"`. Child icon: `<svg className="h-5 w-5">`. With Tailwind defaults `p-2 = 8px`, `h-5 w-5 = 20px`, no border. → 8 + 20 + 8 = **36 px** per axis.
  - Confirm Password eye button (`SignInModal.tsx:226-234`): identical class set → same **36 × 36 px**.
  - Spec authors appear to have miscounted: `p-2` is 8 px in Tailwind, not 12 px. Reaching 44 px requires `p-3` (12 px) or larger padding, OR an explicit `min-h-[44px] min-w-[44px]`.
- **Color contrast** — `text-gray-600` (≈ rgb(75, 85, 99)) default and `text-gray-700` (≈ rgb(55, 65, 81)) hover are correctly applied per `text-gray-600 hover:text-gray-700`. Both hit ≥4.5:1 on white. This sub-criterion **passes**.

Bug filed: `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-eye-button-tap-area.md` (P1).

---

## AC-02 — Email input mobile-autofill attributes

Status: PASS

`SignInModal.tsx:169-180` — the email `<input>` carries:

```tsx
type="email"
autoComplete="email"
autoCapitalize="off"
inputMode="email"
```

All three required attributes (`autoComplete`, `autoCapitalize`, `inputMode`) are present in the JSX and will render to the DOM verbatim. `type="email"` is preserved.

---

## AC-03 — Password / Confirm-Password autoComplete is mode-correct

Status: PASS

- Password input (`SignInModal.tsx:187-197`): `autoComplete={isSignup ? 'new-password' : 'current-password'}`. Resolves to `"current-password"` in Sign In mode and `"new-password"` in Create Account mode — exactly per AC-03.
- Confirm Password input, only rendered when `isSignup === true` (`SignInModal.tsx:215-225`): hard-coded `autoComplete="new-password"` — exactly per AC-03.

---

## AC-04 — Activation-telemetry TODO marker comment

Status: FAIL

AC-04 requires the **exact** string

```
// TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands
```

immediately before `onClose()` on the session-returned branch of `attemptSignup`. The shipped line at `SignInModal.tsx:106` is

```
// telemetry: signup_completed (session returned)
```

`grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx` returns **no matches**. The shipped string is not the contractual anchor; future grep-based tooling (or the eventual telemetry-plumbing follow-up that locates this insertion site) will not find it.

Position-wise the comment IS on the correct line (immediately preceding `onClose()` on the session-returned branch), so the only defect is the literal text.

Bug filed: `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-telemetry-marker-wrong-text.md` (P1).

---

## AC-05 — No regression vs SIGNIN-1 UAT (UAT-01..12)

Status: PASS

Verified by reading the diff (`git diff main -- components/auth/SignInModal.tsx`). Every behavioral hunk SIGNIN-1 depended on is byte-identical to `main`:

- Mode-toggle clears fields (`switchMode`, lines 50-58 in current file): unchanged.
- Mismatched-passwords block submit + length<8 block submit (`attemptSignup`, lines 81-91): unchanged.
- Show/hide independent per field (`showPassword` and `showConfirm` separate `useState`, lines 36-37; per-button `onClick` handlers, lines 200 and 228): structurally unchanged — only `class` strings on the buttons changed (padding + color) and `pr-10`→`pr-12` on the inputs.
- Post-signup paths: email-confirmation flip-back-with-banner branch (lines 95-104) is byte-identical; session-returned close branch (lines 105-107) only had a comment added.
- Esc / backdrop / X close (lines 42-48 keydown listener, 128-132 overlay click, 152-159 X button): unchanged.

The SIGNIN-2 changes are strictly additive HTML attributes plus class tweaks, so SIGNIN-1's behavioral surface is preserved by construction. The two failures above (tap area, comment text) are quality-bar misses, not regressions.

Spot-checks for the human reviewer to run live (none of the underlying logic changed, so all should still pass): UAT-03 mode toggle clears fields; UAT-04 mismatch blocks submit; UAT-05 short-pwd blocks submit; UAT-06 independent show/hide; UAT-11 Esc / backdrop / X close in both modes.

---

## AC-06 — Scope: only SignInModal.tsx modified

Status: PASS

```
$ git diff --name-only main
components/auth/SignInModal.tsx
tsconfig.tsbuildinfo
```

Only `components/auth/SignInModal.tsx` is a source-code change. `tsconfig.tsbuildinfo` is a TypeScript incremental build cache (auto-generated) and does not count against scope. No edits to `lib/auth-store.tsx`, `components/TopNav.tsx`, `app/auth/**`, `supabase/**`, or `app/api/**`.

---

## Summary table

| #     | AC                                                | Status | Bug file                                                                                | Severity |
| ----- | ------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- | -------- |
| AC-01 | Eye-button tap area ≥44×44 + color contrast       | FAIL   | `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-eye-button-tap-area.md`                   | P1       |
| AC-02 | Email mobile-autofill attrs                       | PASS   | —                                                                                       | —        |
| AC-03 | Password / Confirm autoComplete mode-correct      | PASS   | —                                                                                       | —        |
| AC-04 | Exact `// TODO(activation-telemetry):` marker     | FAIL   | `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-telemetry-marker-wrong-text.md`           | P1       |
| AC-05 | No regression vs SIGNIN-1 UAT                     | PASS   | —                                                                                       | —        |
| AC-06 | Scope: only `components/auth/SignInModal.tsx`     | PASS   | —                                                                                       | —        |

## Notes for padi-eng

- `components/auth/SignInModal.tsx:201` and `:229` — change `p-2` to `p-3` (12 px) so 12 + 20 + 12 = 44 px hits the WCAG/iOS minimum. Bump corresponding input `pr-12` → `pr-14` (lines 192 and 220) to keep the icon clear of typed text. Don't change `text-gray-600 hover:text-gray-700` — that part is correct.
- `components/auth/SignInModal.tsx:106` — replace the line with the exact AC-04 string `// TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands`. AC language was "exact"; treat it as a literal contract.

## Notes for padi-design

- None. The eye-button color tokens chosen (`text-gray-600` / `text-gray-700`) hit contrast targets on white. The size miss is purely a tap-area issue, not a visual-language issue.

## Missing from ticket

- Spec text for R1 says "with `p-2` padding so the tap area is ≥44×44 px" but `p-2` = 8 px and yields 36 × 36, not ≥44. Either the requirement target (44) or the prescribed class (`p-2`) needs to change in the spec. Recommend amending future polish tickets to specify `p-3` *and* keep `≥44 × 44` as the AC, so spec and AC agree.

## Run history

### 2026-05-08 — padi-uat-agent (BuildLoop iter 1)
- Verdict: FAIL
- Scenarios: PASS 4 / FAIL 2 / BLOCKED 0
- Results:
  | #     | Scenario                                       | Status | Bug file                                                                       | Severity |
  | ----- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------ | -------- |
  | AC-01 | Eye-button tap area ≥44×44 + contrast          | FAIL   | docs/features/sign-in-flow/bugs/SIGNIN-2-bug-eye-button-tap-area.md            | P1       |
  | AC-02 | Email mobile-autofill attrs                    | PASS   | —                                                                              | —        |
  | AC-03 | Password / Confirm autoComplete mode-correct   | PASS   | —                                                                              | —        |
  | AC-04 | Exact telemetry TODO marker                    | FAIL   | docs/features/sign-in-flow/bugs/SIGNIN-2-bug-telemetry-marker-wrong-text.md    | P1       |
  | AC-05 | No regression vs SIGNIN-1                      | PASS   | —                                                                              | —        |
  | AC-06 | Scope: SignInModal.tsx only                    | PASS   | —                                                                              | —        |
- Notes for padi-eng: see notes above; two-line fix in `components/auth/SignInModal.tsx`.
- Notes for padi-design: none.
- Missing from ticket: spec R1 prescribes `p-2` but demands ≥44 × 44 — those are mathematically inconsistent at Tailwind defaults. Spec should prescribe `p-3` (or larger), not `p-2`.

### 2026-05-09 — padi-uat-agent (BuildLoop iter 1, fix attempt 1)
- Verdict: PASS
- Scenarios: PASS 6 / FAIL 0 / BLOCKED 0
- Methodology: source-of-truth review on branch `buildloop/signin-2-polish` against `components/auth/SignInModal.tsx`; `git diff main -- components/auth/SignInModal.tsx`; `git diff --name-only main`; dev server reachable at `http://localhost:3000` (HTTP 200). Tap-area math reverified against `tailwind.config.ts` (no `theme.extend`) and `app/globals.css` (no root font-size override).
- Results:
  | #     | Scenario                                       | Status | Bug file                                                                       | Severity |
  | ----- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------ | -------- |
  | AC-01 | Eye-button tap area ≥44×44 + contrast          | PASS   | —                                                                              | —        |
  | AC-02 | Email mobile-autofill attrs                    | PASS   | —                                                                              | —        |
  | AC-03 | Password / Confirm autoComplete mode-correct   | PASS   | —                                                                              | —        |
  | AC-04 | Exact telemetry TODO marker                    | PASS   | —                                                                              | —        |
  | AC-05 | No regression vs SIGNIN-1                      | PASS   | —                                                                              | —        |
  | AC-06 | Scope: SignInModal.tsx only                    | PASS   | —                                                                              | —        |
- AC-01 verification: both eye buttons (`SignInModal.tsx:201` and `:229`) now read `p-3 text-gray-600 hover:text-gray-700`. With `h-5 w-5` (20 px) icon + Tailwind default `p-3` (12 px) + zero border, computed box is 12 + 20 + 12 = **44 × 44 px** per axis on both Password and Confirm Password buttons — meets the AC bar exactly. Inputs (`:192`, `:220`) bumped `pr-10` → `pr-14` to keep typed text clear of the larger button. Color tokens unchanged from prior run, still ≥4.5:1 on white.
- AC-04 verification: `grep -n "TODO(activation-telemetry)" components/auth/SignInModal.tsx` → `106:      // TODO(activation-telemetry): emit signup_completed event here when telemetry plumbing lands`. Position confirmed inside `attemptSignup`'s session-returned branch, immediately before `onClose()` (line 107). String is byte-identical to AC-04's literal contract.
- AC-05 (no-regression) verification: full `git diff main -- components/auth/SignInModal.tsx` confined to (a) the AC-04 comment line, (b) the email autofill attrs, (c) the two password autoComplete attrs, (d) input class swaps `pr-10`→`pr-14`, (e) eye-button class swaps `p-1 text-gray-500`→`p-3 text-gray-600`. No edits to `switchMode`, `attemptLogin`, validation guards, the Escape `useEffect`, `handleOverlayClick`, or the X close button — all SIGNIN-1 behavioral surfaces preserved by construction.
- AC-06 verification: `git diff --name-only main` → `components/auth/SignInModal.tsx` (plus `tsconfig.tsbuildinfo`, an auto-generated incremental cache, ignorable). No edits to `lib/auth-store.tsx`, `components/TopNav.tsx`, `app/auth/**`, `supabase/**`, or `app/api/**`.
- Bugs from prior run:
  - `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-eye-button-tap-area.md` — fix verified (`p-2`→`p-3`, `pr-12`→`pr-14`).
  - `docs/features/sign-in-flow/bugs/SIGNIN-2-bug-telemetry-marker-wrong-text.md` — fix verified (exact contract string in place at line 106).
- New bugs filed this run: none.
- Notes for padi-eng: ship it. The two-line fix landed cleanly with no collateral edits.
- Notes for padi-design: none.
- Missing from ticket: same gap as the 2026-05-08 run — feature spec R1 still says "with `p-2` padding so the tap area is ≥44×44 px". `p-2` = 8 px → 36 × 36, not 44. Implementation correctly used `p-3` to satisfy the AC; the spec text should be amended in the next polish ticket so spec and AC don't disagree.
