import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;
let warnedDisabled = false;

function ensureInit(): void {
  if (initialized) return;
  if (!POSTHOG_KEY) {
    if (!warnedDisabled && typeof window !== 'undefined') {
      console.info('[analytics] disabled — set NEXT_PUBLIC_POSTHOG_KEY to enable');
      warnedDisabled = true;
    }
    return;
  }
  if (typeof window === 'undefined') return;
  try {
    posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, capture_pageview: false });
    initialized = true;
  } catch (err) {
    console.warn('[analytics] init failed', err);
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  ensureInit();
  if (!initialized) return;
  try {
    posthog.capture(event, props);
  } catch (err) {
    console.warn('[analytics] track failed', err);
  }
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  ensureInit();
  if (!initialized) return;
  try {
    posthog.identify(userId, traits);
  } catch (err) {
    console.warn('[analytics] identify failed', err);
  }
}

export function reset(): void {
  if (!initialized) return;
  try {
    posthog.reset();
  } catch (err) {
    console.warn('[analytics] reset failed', err);
  }
}

export const ANALYTICS_EVENTS = {
  SIGNUP_COMPLETED: 'signup_completed',
  ROLE_SELECTED: 'role_selected',
  STUDENT_CREATED: 'student_created',
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  MAGIC_LINK_REQUESTED: 'magic_link_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
