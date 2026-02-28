This doc includes:

* Base Codex Project Prompt
* A “Task Wrapper” you paste after
* Contributor instructions
* Notes on best practices

---

# **Codex Usage Guide for Padi MVP**

This document defines exactly how to use OpenAI’s Codex (or any code generation model) when contributing to the **go-padi/padi-mvp** repository.

It ensures all contributors:

* Work inside the existing architecture
* Avoid accidental rewrites
* Extend the codebase safely
* Follow project conventions
* Produce predictable, reviewable diffs

---

# **1. Base Codex Project Prompt**

Use this at the **top of every new Codex session**.

Codex does *not* remember previous sessions, so every interaction must include this setup.
Do **not** rely on Codex’s memory.

---

## **BASE CODEX PROJECT PROMPT**

You are working on the Padi app located at:
https://github.com/go-padi/padi-mvp

Use the existing code in the repo as the single source of truth.

Project stack:
Next.js App Router, React, TypeScript, Tailwind, Shadcn UI, Supabase, Zod, and Vercel deployment.

Guidelines when I ask for code:

* Do not generate new features unless I explicitly ask for them.
* Do not modify authentication, routing, database schemas, or global state unless I explicitly ask.
* When providing code, target the existing file structure in the repo.
* When unsure, ask me to clarify.
* Follow established patterns already in the repository.
* Write code that is incremental and safe to paste into the repo without breaking unrelated parts.
* Assume I am resuming work from wherever the repo currently is.
* Never rerun or reimplement previously completed tasks unless I explicitly ask.

Your job is to help me continue coding from the current state of the repository.

---

# **2. Codex Task Wrapper**

Paste this immediately *after* the Base Prompt when you start a new task.

---
Using the project context above, complete the following task.
Follow these rules:

* Only modify the specific files required
* Do not rewrite the whole repo
* Do not introduce new patterns unless necessary
* Follow existing coding style
* Use Supabase client from `lib/supabase.ts`
* Maintain strong TypeScript types
* Minimize surface area of changes
* Provide complete updated code for each file you change
* Provide diffs or full file replacements depending on clarity
* Include comments only where helpful

**Task:**
[Insert the task here]

---

# **3. Best Practices for Contributors**

* Start a **new Codex session** for every discrete task.
* Always paste the **Base Project Prompt** first.
* Then paste the **Task Wrapper** and your specific instructions.
* Attach screenshots or point Codex to repo files using:

  * “Open file: app/teacher/phases/page.tsx”
  * “Modify only this part”
* Keep tasks small when possible.
* Prefer surgical edits over large rewrites.
* After Codex responds, always:

  * review the diff
  * check formatting
  * run locally
  * apply lint and type checking
* Do not allow Codex to modify files outside the scope unless necessary.
* If Codex begins rewriting things unexpectedly, **restart the session** with the Base Prompt.

---

# **4. Recommended Repo Placement**

Save this file as:

### **`/docs/CODEX_GUIDE.md`**

And optionally link it from:

* `/README.md` under a “Development” section
* `/CONTRIBUTING.md`

This ensures:

* future maintainers can use Codex safely
* PR reviewers understand the expected workflow
* no one accidentally overwrites core logic

