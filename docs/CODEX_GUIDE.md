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

You are working inside the existing GitHub repository:
**[https://github.com/go-padi/padi-mvp](https://github.com/go-padi/padi-mvp)**

Do not start from scratch.
Do not scaffold a new project.
Do not rewrite or delete unrelated files.
Only modify the specific files required to complete the task I give you next.

### **Project Overview**

This is the MVP of **Padi**, a teacher-facing early literacy app built with:

* Next.js 15 (App Router)
* TypeScript
* React Server Components + Client Components
* TailwindCSS
* Supabase
* Supabase schema in `/supabase/schema.sql`
* Seed scripts in `/scripts/seed-curriculum.ts`

The app currently includes:

* Public landing page
* Teacher Dashboard at `/teacher`
* Tabs: About the Method, Phases, Assessments, Grouping & Progress, Resources
* Curriculum flow: Phase → Developmental Areas → Modules → Lesson
* Curriculum currently supports **Group mode only**
* Students page with basic structure
* Navigation in `components/TopNav.tsx`
* Teacher pages in `app/teacher/**`

### **Critical Constraints**

You must:

1. Work with the existing codebase and architecture.
2. Follow current folder structure and conventions.
3. Use the existing Supabase client in `lib/supabase.ts`.
4. Keep work production safe, typed, and scalable.
5. If modifying schema:

   * Add changes in `supabase/schema.sql`
   * Add placeholder seeds in `scripts/seed-curriculum.ts`
6. Only modify the files relevant to the task.
7. If creating files, place them in the correct folder:

   * `components/`
   * `lib/` or `contexts/`
   * or the appropriate `app/teacher/...` route
8. Keep UI aligned with existing Tailwind-based styles.
9. The app must still build and run after changes.

### **Supabase Rules**

* Extend schema only when necessary.
* Always add DEFAULT values for new columns.
* Always seed minimally so the UI does not break after migration.
* Do not remove columns or break production compatibility.

### **Behavior Requirements**

After your changes, the app must:

* Compile with no errors
* Render all existing pages unless intentionally updated
* Maintain all current teacher flows

### **What I will provide next**

After this base prompt, I will give you a specific task such as:

* Add Individual vs Group curriculum
* Add or modify context
* Update Phase detail
* Extend Supabase
* Refactor specific components
* Implement new screens from Lovable

Your job will be to:

* Open and modify only the correct files
* Provide clean, production ready code
* Preserve existing behavior except where explicitly changed

---

# **END BASE PROMPT**

---

# **2. Codex Task Wrapper**

Paste this immediately *after* the Base Prompt when you start a new task.

---

## **CODEX TASK WRAPPER**

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

