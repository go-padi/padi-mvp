'use client';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
type Student = { id:string; full_name:string };

export default function StudentsPage(){
  const sb = supabaseClient();
  const [classId,setClassId]=useState('demo-class');
  const [students,setStudents]=useState<Student[]>([]);
  const [name,setName]=useState('');

  const load = async()=>{
    const { data } = await sb.from('student').select('id,full_name').eq('class_id', classId).order('full_name');
    setStudents(data||[]);
  };
  useEffect(()=>{ load(); },[classId]);

  const add = async()=>{
    if(!name) return;
    await sb.from('student').insert({ class_id: classId, full_name: name });
    setName('');
    load();
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
}
