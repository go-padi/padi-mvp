---
id: LR-36
title: "[Infra] Wire Sentry for error monitoring on client + server"
type: story
status: ready
priority: high
feature: launch-readiness
launch_blocker: true
created: 2026-05-24
created_by: launch-readiness-audit-2026-05-24
handling: cc
---

### Goal

When something breaks in prod tomorrow, hear about it before your
users do. Sentry is the industry-standard error monitor for a
Next.js app on Vercel and its free tier (5k errors/mo, 10k
performance events) covers Padi comfortably at launch scale.

### Requirements

**1. Sentry account setup**

Nisha's manual step before this ticket ships. Create a Sentry
project at sentry.io:
- Platform: Next.js
- Project name: `padi-mvp`
- Grab the DSN.

Once created, add to Vercel env vars (prod + preview):
- `NEXT_PUBLIC_SENTRY_DSN` — the DSN from Sentry
- `SENTRY_ORG` — Sentry org slug
- `SENTRY_PROJECT` — `padi-mvp`
- `SENTRY_AUTH_TOKEN` — for source-map uploads at build time

**2. Install and wire the SDK**

```
pnpm add @sentry/nextjs
```

Then run:
```
npx @sentry/wizard@latest -i nextjs
```

The wizard creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Updates `next.config.js` with `withSentryConfig` wrapper.

Verify each. If wizard doesn't detect the DSN from env, wire it
manually to `process.env.NEXT_PUBLIC_SENTRY_DSN`.

**3. Sensible defaults for a launch product**

In `sentry.client.config.ts`:
- `tracesSampleRate: 0.1` (sample 10% of transactions; enough to
  spot slow pages without blowing the free tier quota).
- `replaysSessionSampleRate: 0` — no session replay at launch
  (adds bundle weight + privacy considerations for kids' data).
- `replaysOnErrorSampleRate: 0` — same reason.
- Ignore expected network errors:
  ```
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ]
  ```

In `sentry.server.config.ts`:
- Same `tracesSampleRate: 0.1`.
- No PII in default scope.

**4. Explicitly redact user data from breadcrumbs**

Kids' names, session notes, and audio-file URLs must NEVER leave
prod in a Sentry event. Add a `beforeSend` hook that strips these
by field name from breadcrumb payloads. Reference the schema:

- `students.first_name`
- `teaching_notes.notes`
- `lesson_recordings.storage_path`

**5. Test that errors reach Sentry**

Add a one-off test route `app/api/_sentry-test/route.ts` that
throws when hit. Deploy, hit the route once from prod, confirm the
error appears in Sentry, then delete the route in a follow-up
commit.

**6. Alerts**

In Sentry dashboard (Nisha's manual step):
- Set up an alert rule: "any new issue with > 3 events in 5 min"
  → email `hello@go-padi.com` (or Nisha's direct email).
- Set up daily digest email of top issues.

### Out of scope

- Custom performance monitoring beyond default.
- Uptime / synthetic monitoring (that's a different product;
  Vercel's built-in uptime is enough at launch).
- Session replay. Post-launch, only if we solve the kids-privacy
  angle.
- Sourcemap upload debugging beyond what the wizard configures.

### Acceptance criteria

1. `@sentry/nextjs` installed; three config files present with
   Padi-specific settings from #3.
2. Error thrown from `app/api/_sentry-test/route.ts` in prod
   appears in the Sentry dashboard within 60s.
3. Test route removed in a follow-up commit before merge.
4. `beforeSend` hook redacts fields listed in #4 — verify with
   a manual test that logs a breadcrumb containing a fake
   `first_name: 'TEST'`, confirms redaction.
5. Sentry alert rule configured (Nisha's step, not CC's).

### Notes for the implementer

- Vercel deploy will fail if `SENTRY_AUTH_TOKEN` isn't set and
  the wizard's default config tries to upload source maps. If
  auth token is unset in an env, gate the source-map upload
  behind the token's presence to avoid deploy failure. (Sentry's
  wizard usually does this already; verify.)
- Do NOT log the raw Supabase JWT or any Stripe object anywhere
  a Sentry breadcrumb would catch it.
- The DSN is safe to expose to the client (that's the point of
  `NEXT_PUBLIC_*`); the AUTH_TOKEN is server-side only.
