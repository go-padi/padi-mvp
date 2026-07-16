import { createClient } from '@supabase/supabase-js';

export type Subscription = {
  id: string;
  tenant_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete';
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  student_count_at_billing: number | null;
  created_at: string;
  updated_at: string;
};

function serviceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getSubscription(tenantId: string): Promise<Subscription | null> {
  const { data, error } = await serviceRoleClient()
    .from('subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error) throw error;
  return data as Subscription | null;
}

export function isInTrial(s: Subscription): boolean {
  return s.status === 'trialing' && !!s.trial_ends_at && new Date(s.trial_ends_at) > new Date();
}

export function isActive(s: Subscription): boolean {
  if (s.status === 'trialing') return true;
  if (s.status === 'active') return true;
  if (s.cancel_at_period_end && s.current_period_end && new Date(s.current_period_end) > new Date()) return true;
  return false;
}

export function isGated(s: Subscription): boolean {
  if (s.status === 'expired') return true;
  if (s.status === 'trialing') {
    return !s.trial_ends_at || new Date(s.trial_ends_at) <= new Date();
  }
  if (s.status === 'active') return false;
  if (s.status === 'past_due') {
    // 72-hour grace period; updated_at proxies when status became past_due
    const hoursSince = (Date.now() - new Date(s.updated_at).getTime()) / (1000 * 60 * 60);
    return hoursSince > 72;
  }
  if (s.status === 'canceled') {
    if (!s.current_period_end) return true;
    return new Date(s.current_period_end) <= new Date();
  }
  return false;
}

export function daysLeftInTrial(s: Subscription): number {
  if (!s.trial_ends_at) return 0;
  const ms = new Date(s.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
