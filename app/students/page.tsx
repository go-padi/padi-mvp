'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
type Student = { id: string; name: string | null; first_name: string | null; last_name: string | null };

export default function StudentsPage(){
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const sb = supabaseClient();
  const [students,setStudents]=useState<Student[]>([]);
  const [name,setName]=useState('');

  const load = async()=>{
    if (!tenantId) return;
    const { data } = await sb
      .from('students')
      .select('id,name,first_name,last_name')
      .eq('tenant_id', tenantId)
      .order('name');
    setStudents(data||[]);
  };

  useEffect(() => {
    if (!isLoggedIn) { setStudents([]); return; }
    if (!isHydrated || !tenantId) return;
    load();
  }, [isLoggedIn, isHydrated, tenantId]);

  const add = async()=>{
    if(!name || !tenantId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const [first, ...rest] = trimmed.split(/\s+/);
    const last = rest.join(' ') || null;
    await sb
      .from('students')
      .insert({ tenant_id: tenantId, name: trimmed, first_name: first || null, last_name: last });
    setName('');
    load();
  };

  return (
    <div className="space-y-4">
      {!isLoggedIn ? (
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Student workspace is locked</h3>
          <p className="text-sm text-gray-700">
            Sign in to add students, capture assessments, and view grouping recommendations. Anonymous visitors can still
            explore the curriculum and sample lessons from the Teacher Dashboard.
          </p>
          <div className="text-sm">
            <Link href="/teacher/curriculum" className="text-blue-700 font-semibold hover:underline">
              Browse curriculum and modules →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {isHydrated && !tenantId && (
            <div className="card border-amber-200 bg-amber-50 text-amber-800">
              Tenant not connected. Add a tenant to your profile to create students.
            </div>
          )}
          <div className="card flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-600">Tenant ID</label>
              <input className="border rounded-lg px-3 py-2" value={tenantId || ''} readOnly />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600">Student name</label>
              <input className="border rounded-lg px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Maya Patel" disabled={!tenantId} />
            </div>
            <button onClick={add} className="btn btn-primary" disabled={!tenantId}>Add</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {students.map(s => {
              const fullName = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
              return <div key={s.id} className="card">{fullName || s.name}</div>;
            })}
          </div>
        </>
      )}
    </div>
  );
}
