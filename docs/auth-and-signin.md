# Auth and Sign In: Feature Specification  
**Padi Teacher App**  
**Release:** Auth and Sign In

This document describes the feature additions needed to introduce a clear anonymous vs logged in teacher experience, along with foundational setup flows for students and groups.

The goal is to implement this inside the actual app codebase so it can run locally and then be deployed to the cloud in the same state.

---

## Overview

This release adds:

1. A simple auth stub to simulate logged out vs logged in states  
2. Anonymous browsing experience for teachers exploring Padi  
3. Logged in teacher workspace  
4. Setup flows for adding students and groups  
5. Connected behavior across Start Teaching, Phases, Assessments, and Grouping

Real backend auth can be added later. For now, state can be local (for example React context, Zustand, Redux).

---

# 1. Auth and Global App State

### Goals

Create a clear distinction between:

- Logged out (anonymous) teacher  
- Logged in teacher with editable workspace  

This distinction must be visible and persistent across all pages within the session.

### Requirements

- Introduce a global auth store, for example `AuthContext` or `useAuthStore`
- Auth state includes:
  - `isLoggedIn: boolean`
  - Optional `teacherName: string | null`
- Add an `AuthStatusIndicator` in the header or navigation that shows:
  - "Logged out" with a "Log in" button
  - "Logged in as [Teacher]" with a "Log out" button
- Actions:
  - `login()`
  - `logout()`
- Logged out users see read only or preview versions of dashboard and tabs  
- Logged in users see setup or data driven workspace views

### Suggested structure (React example)

- `AuthProvider` that wraps the app
- `AuthStatusIndicator` component used in the top navigation
- `useAuth()` hook for reading `isLoggedIn` and calling `login` / `logout`

---

# 2. Anonymous (Logged Out) Experience

Anonymous users should be able to explore:

- The method and pedagogy  
- Phases and sample modules  
- A single sample lesson  
- A preview of Start Teaching

They must never see real or fake student or group data.

## 2.1 Home and Dashboard

### Logged out behavior

When the teacher clicks:

- `Teacher Dashboard`  
  - Show a static, informational version of the Teacher Dashboard  
- `Start Teaching`  
  - Show a gated preview with sample cards and a Log In call to action

### Components (suggested)

- `TeacherDashboardLoggedOut`  
- `StartTeachingPreview`  
- `AssessmentsInfoPanel`  
- `GroupingInfoPanel`  

The routing for `TeacherDashboard` and `StartTeaching` should check `isLoggedIn` and render the appropriate variant.

---

## 2.2 Tabs When Logged Out

All tabs should use existing layouts, but switch into preview mode using a prop such as `isLoggedIn={false}` or `mode="preview"`.

### About Method

- Fully visible
- Purely informational

### Phases

Logged out behavior:

- Show Phase cards for Phase 1, Phase 2, Phase 3  
- Phase 1:
  - Allow drill in to:
    - Developmental areas
    - Modules
    - One sample lesson (for example "LS1 Silence game")
  - Other lessons appear as locked items with a message:
    - "Log in to unlock full lesson sequence"
- Phases 2 and 3:
  - Show basic structure and preview copy
  - Indicate that full content is locked until login

Components to reuse or add:

- `PhasesTab`  
- `PhaseList`  
- `PhaseDetail`  
- `ModuleList`  
- `LessonList`  
- `LockedLessonCard`

The existing Individual or Group toggle should still work, but only for preview content.

### Assessments

- Do not render a table or rows, even with placeholder students
- Show an informational panel with copy such as:
  - "Once you add students, you will see each student and their assessment status here."

Component:

- `AssessmentsInfoPanel`

### Grouping and Progress

- Do not render any student or group lists
- Show explanatory copy such as:
  - "Once you add students and capture assessments, recommended groups will appear here."

Component:

- `GroupingInfoPanel`

### Resources

- Visible in both states
- Contains static content that does not depend on student data

---

## 2.3 Start Teaching (Logged Out)

Anonymous users see:

- Short explanation of what Start Teaching does when logged in  
- The existing Individual / Group / Both toggle  
- One or two `SampleStudentCard` and `SampleGroupCard` components clearly labeled as examples  
- Primary call to action: "
