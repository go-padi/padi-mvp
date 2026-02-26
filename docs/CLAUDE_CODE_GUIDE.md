# Claude Code Usage Guide for PADI MVP

This guide mirrors `docs/CODEX_GUIDE.md`, but is formatted for Claude Code sessions.

## 1. Base Claude Prompt

Use this at the top of a new Claude Code session:

```text
You are working in the PADI MVP repository.
Use existing repo code as the single source of truth.

Stack: Next.js App Router, React, TypeScript, Tailwind, Supabase, Zod, Vercel.

Rules:
- Do not generate new features unless explicitly asked.
- Do not change authentication, routing, database schemas, or global state unless explicitly asked.
- Follow existing code style and file structure.
- Make minimal, safe, incremental edits.
- Reuse `lib/supabase.ts` for Supabase access.
- Keep strong TypeScript types.
- Do not redo previously completed tasks unless requested.
```

## 2. Task Wrapper

Paste this immediately after the base prompt:

```text
Using the project context above, complete this task:
[Insert task]

Constraints:
- Modify only files required by the task.
- Avoid broad rewrites.
- Preserve existing architecture and patterns.
- Keep changes reviewable and low-risk.
- Include concise rationale for key tradeoffs.
- Call out any assumptions and blockers.
```

## 3. Repo-Specific Expectations

- Read `docs/STATUS.md` before starting a new feature to understand current work state.
- Teacher flows are the current priority; Phase 1 is partially wired and LS2-13 are placeholders.
- Assume Supabase RLS/storage rules may be active; avoid bypass patterns.
- Prefer phased delivery over large refactors.

## 4. Recommended Session Loop

1. Paste base prompt + wrapper.
2. Point Claude to exact files to edit.
3. Ask for minimal diffs, not full rewrites.
4. Run local checks after changes (`pnpm lint`, run app flows).
5. If output drifts from scope, reset and re-run with narrower instructions.

## 5. Optional: Keep Claude in Sync

- Keep `CLAUDE.md` at repo root current as architecture or priorities change.
- Update `docs/STATUS.md` at the end of each work session.
