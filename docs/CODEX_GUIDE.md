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

You are working in the go-padi/padi-mvp repository.

This is a Next.js 15 app router project written in TypeScript. Styling is handled with Tailwind and a few small custom utility classes in app/globals.css. Supabase is used for data storage and is already wired through a browser client.

Your job: implement product features described in the docs folder while preserving the existing structure and visual design.

Tech stack and conventions

Framework: Next.js 15 with the app router (files under `app/`).

Language: TypeScript. Prefer typed props, avoid any unless absolutely required.

Styling: Tailwind utility classes plus helpers like .container, .card, .btn that live in app/globals.css.

Data: Supabase client is created in lib/supabase.ts. Do not change the schema or RLS unless a doc explicitly asks for it.

Package manager: pnpm. Do not add dependencies unless needed. If you do, update package.json and pnpm-lock.yaml consistently.

When you create client components, remember to include "use client" at the top of the file.

Key locations

Use the README as the ground truth for routes and purpose of each section.

Top navigation: `components/TopNav.tsx`

Teacher layout and tabs: `app/teacher/layout.tsx`

Teacher pages:

```
app/teacher/about/page.tsx

app/teacher/phases/...
```

Other teacher routes under app/teacher

Library: `app/library/page.tsx and components/ModuleCard.tsx`

Students: `app/students/page.tsx`

Supabase:

`lib/supabase.ts`

schema and seeds live under `supabase/` and `scripts/`

Before making changes, skim the relevant doc in docs/ (for example docs/auth-and-signin.md) and the existing code for that area.

Auth and global app state

We are introducing a simple teacher auth system that drives the header state and prepares for a real backend backed sign up and login.

Implement a global auth store, for example lib/auth-store.ts, and wire it through an AuthProvider that wraps the app in app/layout.tsx.

Auth state:
```
type AuthUser = {
  email: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
```

Rules:

Default to isLoggedIn = false, user = null.

Implement a temporary local stub for login:

Accept any email.

Require password 1234!.

If the password matches, set isLoggedIn = true and user = { email }.

Otherwise throw an error so the UI can show a friendly inline message.

logout clears the state back to the defaults.

Write a small useAuth() hook to read auth state and call login and logout. Do not connect to Supabase auth yet. The code should be structured so in the future we can replace the stub with real API calls that create a user and tenant.

Top nav auth states

The marketing home uses a top navigation built from components/TopNav.tsx. Update it to reflect auth status using the useAuth() hook.

Logged out state

Top right navigation items:

Teacher Dashboard text link.

Start Teaching primary button.

Sign in secondary button.

Behavior:

Start Teaching is always accessible and does not require auth.

Clicking Sign in opens a sign in modal.

Clicking Teacher Dashboard while logged out also opens the sign in modal.

Remove any existing Log in, Log out, or duplicate auth buttons.

The layout should visually match the logged_out_state mock.

Logged in state

Once isLoggedIn is true:

Top right items become:

Teacher Dashboard text link.

Start Teaching primary button.

A label Logged in as {email}.

A simple Sign out text button next to the label.

Behavior:

Teacher Dashboard now navigates to the teacher dashboard route directly.

Hide the Sign in button.

Sign out calls logout() and returns the nav to the logged out state.

Match the visual layout of the loggedin_state_12_4 mock as closely as possible.

Sign in modal

Create a reusable sign in modal component, for example components/auth/SignInModal.tsx, and control it from the top nav with local state.

Design:

Darken the background and center the modal.

Title: Sign In

Subtitle: Sign in to access your teaching dashboard

Fields:

Email input.

Password input.

Primary button: Sign In

Text link: Don't have an account? Create one

Behavior:

When opened from Sign in or Teacher Dashboard while logged out, the modal appears on top of the current page (as in the sign_in_modal mock).

On submit:

Call login(email, password).

While in test mode, both Sign In and Create one can call the same login function.

If login succeeds, close the modal.

If login fails, show a small error message below the fields explaining that test mode expects password 1234!.

Allow closing the modal with the close icon, escape key, or clicking outside.

Views for logged in vs logged out users

Teacher features such as the dashboard and phases pages will gradually move from a read only preview to an editable workspace.

For now:

Logged out users may still be able to see static or preview content, but they should not see personalized or tenant specific data.

Logged in users will eventually see their own workspace and tenant scoped data. Structure the code with that in mind.

When implementing any view changes that depend on auth, check docs/auth-and-signin.md for more detailed requirements and follow that as the source of truth.

General guidelines

Respect existing design language from the current marketing page and teacher dashboard. Reuse button and card components instead of inventing new ones.

Keep components focused. Lift shared behavior into helpers or hooks where it makes sense.

Do not change Supabase schema, RLS, or seed scripts unless a doc explicitly requires it.

Always run the type checker mentally as you code. Prefer explicit props, small components, and clear naming.

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

