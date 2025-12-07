'use client';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
type Student = { id:string; full_name:string };

export default function StudentsPage(){
  const { isLoggedIn } = useAuth();
  const sb = supabaseClient();
  const [classId,setClassId]=useState('demo-class');
  const [students,setStudents]=useState<Student[]>([]);
  const [name,setName]=useState('');

  const load = async()=>{
    const { data } = await sb.from('student').select('id,full_name').eq('class_id', classId).order('full_name');
    setStudents(data||[]);
  };
  useEffect(()=>{
    if (!isLoggedIn) {
      setStudents([]);
      return;
    }
    load();
  },[classId, isLoggedIn]);

  const add = async()=>{
    if(!name) return;
    await sb.from('student').insert({ class_id: classId, full_name: name });
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
            <a href="/teacher/phases" className="text-blue-700 font-semibold hover:underline">
              Browse phases and modules →
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="card flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-600">Class ID</label>
              <input className="border rounded-lg px-3 py-2" value={classId} onChange={e=>setClassId(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600">Student name</label>
              <input className="border rounded-lg px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Maya Patel" />
            </div>
            <button onClick={add} className="btn btn-primary">Add</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {students.map(s => <div key={s.id} className="card">{s.full_name}</div>)}
          </div>
        </>
      )}
    </div>
  );
}
