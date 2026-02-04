import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing auth token.' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase environment variables are missing.' }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Invalid auth token.' }, { status: 401 });
  }

  const userId = userData.user.id;
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (profile?.tenant_id) {
    return NextResponse.json({ tenant_id: profile.tenant_id });
  }

  const tenantName = userData.user.email ? `Tenant for ${userData.user.email}` : 'New Tenant';
  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({ name: tenantName })
    .select('id')
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ error: tenantError?.message || 'Failed to create tenant.' }, { status: 500 });
  }

  const { error: updateError } = await admin.from('profiles').update({ tenant_id: tenant.id }).eq('id', userId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ tenant_id: tenant.id });
}
