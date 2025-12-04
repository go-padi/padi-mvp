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

# 1. Auth and Global App State --> FNALIZING 12/4

### Goals

Create a clear distinction between:

- Logged out (anonymous) teacher  
- Logged in teacher with editable workspace  

This distinction must be visible and persistent across all pages within the session.

### Requirements

- Global auth store

- Introduce a global auth store, for example AuthContext or useAuthStore.
Auth state includes:

`isLoggedIn: boolean
userEmail?: string | null`

Later we can extend this to include tenant id and other profile fields

Auth actions:

`login(email: string, password: string)`

`logout()`

The AuthProvider wraps the app. Use a useAuth() hook to read isLoggedIn and userEmail, and to call login and logout.

For now, implement login with a local stub:

Accept any email

Require password 1234!

On success, set isLoggedIn = true and userEmail = email

On failure, surface a friendly inline error in the modal

Structure the code so it is easy to swap in real API calls later for sign up and sign in that will also create a new tenant space.

Auth indicator in the top navigation

The top right navigation acts as the AuthStatusIndicator.

Logged out state

Match the logged_out_state mock.

Top right items:

Teacher Dashboard text link

Start Teaching primary button

Sign in secondary button

Behavior:

Start Teaching is always available and does not require auth

Clicking Sign in opens the sign in modal

Clicking Teacher Dashboard while logged out also opens the sign in modal

Logged in state

Match the loggedin_state_12_4 mock.

Top right items:

Teacher Dashboard text link

Start Teaching primary button

Logged in as {userEmail} label

Sign out text button next to the label

Behavior:

Teacher Dashboard now navigates to the teacher dashboard route directly

Sign in button is hidden

Sign out clears auth state and returns the nav to the logged out layout

Sign in modal

Use the sign_in_modal mock.

Trigger:

Clicking Sign in in the nav

Clicking Teacher Dashboard while logged out

Content:

Title: Sign In

Subtitle: Sign in to access your teaching dashboard

Fields:

Email

Password

Primary button: Sign In

Text link: Don't have an account? Create one

Behavior:

While in test mode, both Sign In and Create one use the same local login stub

Modal closes on successful login

Modal can be closed by escape, outside click, or close icon

View behavior

Logged out users see read only or preview versions of the dashboard and tabs

Logged in users see the editable, data driven workspace views

# 2. Anonymous (Logged Out) Experience --> HERE 

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
