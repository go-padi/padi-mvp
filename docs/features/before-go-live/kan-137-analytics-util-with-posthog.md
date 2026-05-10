---
id: KAN-137
title: "[Analytics] Add lib/analytics.ts util with PostHog so BuildLoop features can ship instrumented"
type: story
status: backlog
priority: highest
feature: before-go-live
launch_blocker: true
created: 2026-05-09
updated: 2026-05-10
created_by: human-scoped-via-buildloop
---

### Goal

Stand up a single `lib/analytics.ts` module with a typed `track(event, props)` function so every feature BuildLoop ships from now on instruments its user actions out of the box. Without this, the `// TODO(analytics):` markers BuildLoop's eng-scope phase is now configured to leave will pile up unwired.

### Background

Padi has no analytics today. Zero events captured. That's fine pre-launch but it means we have **no funnel data on the activation north star** ("user signs up → picks role → adds student → starts lesson → completes lesson"). Every BuildLoop iteration from this point forward is configured (per `phase-prompts.md` § eng_scope and § build) to enumerate analytics events for each new user action and either call them or leave `// TODO(analytics):` markers for them. We need the call-target to exist.

**Provider choice: PostHog.** Reasoning:
- Free Cloud tier covers ~1M events/month — orders of magnitude above pre-launch Padi volume
- Funnels and cohort-by-event tools out of the box, which directly map to the activation north-star
- Session replay (free tier 5k recordings/month) is invaluable for finding teacher onboarding friction
- Single SDK install (`posthog-js`) plays well with Next.js App Router
- Self-host path exists if we ever need it; no lock-in

Alternatives explicitly considered: Amplitude (more enterprise-y, weaker session replay), Vercel Analytics (no custom events), Mixpanel (classic but smaller free tier), Segment (overkill for one destination).

### Requirements

1. **Add dependency.** `npm install posthog-js`. Pin to a specific minor version.
2. **Add `lib/analytics.ts`** exporting:
   - `track(event: string, props?: Record<string, unknown>): void` — fires a PostHog `capture` call. Safe to call before init; queues until ready.
   - `identify(userId: string, traits?: Record<string, unknown>): void` — for post-signup
   - `reset(): void` — for logout
   - The module must be a no-op (not throw) when `NEXT_PUBLIC_POSTHOG_KEY` is unset, so local dev without an env var doesn't break.
3. **Add an `<AnalyticsProvider>` client component** at `app/providers/analytics-provider.tsx`:
   - Initializes PostHog on mount with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (default `https://us.i.posthog.com`)
   - Tracks pageviews on route change (use Next.js `usePathname`)
   - Wrap `children` and pass through unchanged
4. **Mount the provider** in `app/layout.tsx` inside the existing layout tree, after AuthProvider so `identify` works.
5. **Define an event taxonomy** in a typed enum or const in `lib/analytics.ts` for the activation funnel events:
   - `signup_completed` (after auth account creation)
   - `role_selected` (after the role picker)
   - `student_created` (first student creation)
   - `lesson_started` (lesson page entered with student context)
   - `lesson_completed` (assessment notes submitted)
   - Plus a free-form escape hatch for one-off events
6. **Wire identify** in the auth flow: when a session resolves, call `identify(userId, { role })`. When the user logs out, call `reset()`.
7. **Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example`** (commit) — actual key goes in Vercel env vars, not committed.
8. **Wire the 5 funnel events from req 5.** Find their existing call sites in the code (signup mutation, role-picker submit handler, student-create mutation, lesson page useEffect, assessment-notes submit) and call `track()` at each. For SIGNIN-2's `// TODO(analytics)` from the recent BuildLoop iteration, replace it with a real `track` call.

### Acceptance Criteria

**Happy Path**
Given `NEXT_PUBLIC_POSTHOG_KEY` is set in the environment
When a user signs up, picks a role, adds a student, starts a lesson, and completes it
Then 5 events appear in PostHog in order: `signup_completed`, `role_selected`, `student_created`, `lesson_started`, `lesson_completed`
And each event's user is associated with the user's id via `identify`
And the funnel can be assembled in PostHog UI (event ordering visible, drop-offs measurable)

**Empty State (no env var)**
Given `NEXT_PUBLIC_POSTHOG_KEY` is unset (e.g. local dev)
When any code path calls `track()`, `identify()`, or `reset()`
Then no error is thrown, no network request is made, the call is a silent no-op
And dev console gets a single info-level log on first call: `[analytics] disabled — set NEXT_PUBLIC_POSTHOG_KEY to enable`

**Error State**
Given the PostHog SDK throws (network failure, bad key, etc.)
When `track()` is called
Then the error is swallowed (caught and logged to `console.warn`), never bubbled to the UI
And the calling code path completes normally

**Auth State**
Given a user logs out
When `reset()` runs
Then subsequent events are not associated with the previous user's id (verified by checking PostHog distinct_id changes)

### Out of Scope

- Self-hosting PostHog (use Cloud)
- Server-side event tracking (this ticket is browser-side only)
- Feature flags via PostHog (separate ticket if wanted)
- Replacing all existing `console.log` instrumentation
- A full event-naming RFC — start with the 5 funnel events, name future events as we go
- Wiring analytics into `lib/demo/` content (demo data shouldn't generate real events)

### Notes

- BuildLoop's eng_scope prompt now requires every new feature to enumerate analytics events. After this ticket lands, those events become real `track(...)` calls instead of `// TODO(analytics):` comments.
- The activation north-star metric definition (`docs/features/.buildloop/north-star.md`) maps directly to the 5 funnel events above. Once shipped, the north-star can be queried from PostHog instead of estimated.
- PostHog has a Next.js setup guide that's mostly copy-paste; their `posthog-js` + a custom `<AnalyticsProvider>` pattern is the standard.
- File the PostHog project key request as a separate one-line task for the user — they need to create a free PostHog Cloud account and paste the key into Vercel env vars before this is functional in prod. The code can ship without that key (no-op behavior) and become live once the key lands in Vercel.
