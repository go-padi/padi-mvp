'use client';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import ModuleCard from '@/components/ModuleCard';

type Module = { id:string; code:string; domain:string; section:string; title:string; objective:string };

export default function LibraryPage(){
  const [rows,setRows]=useState<Module[]>([]);
  const [domain,setDomain]=useState('');
  const [section,setSection]=useState('');
  const [q,setQ]=useState('');

  useEffect(()=>{
    const fetchRows=async()=>{
      const sb=supabaseClient();
      let query = sb.from('module').select('id,code,domain,section,title,objective').order('code');
      if(domain) query = query.eq('domain',domain);
      if(section) query = query.eq('section',section);
      if(q) query = query.ilike('title', `%${q}%`);
      const { data, error } = await query;
      if(!error && data) setRows(data as any);
    };
    fetchRows();
  },[domain,section,q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600">Domain</label>
          <select value={domain} onChange={e=>setDomain(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">All</option>
            <option>Phonological Awareness</option>
            <option>Alphabet</option>
            <option>Handwriting</option>
            <option>Comprehension</option>
            <option>Reading/Vocab</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Section</label>
          <select value={section} onChange={e=>setSection(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">All</option>
            <option>SYL</option>
            <option>LS</option>
            <option>WS</option>
            <option>IS</option>
            <option>VCF</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600">Search</label>
          <input value={q} onChange={e=>setQ(e.target.value)} className="border rounded-lg px-3 py-2 w-full" placeholder="Title contains..." />
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(m => <ModuleCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}
