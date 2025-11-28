'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../../layout';

type Group = { id:string; code:string; title:string; description:string|null; is_locked:boolean|null; phase_id:string };
type ModuleRow = { id:string; code:string; title:string; subtitle:string|null; summary:string|null; is_locked:boolean|null; display_order:number|null };

export default function GroupModulesPage({ params }:{ params: Promise<{ code:string; group:string }> }){
  const { code, group: groupCode } = use(params);
  const [group,setGroup]=useState<Group|null>(null);
  const [modules,setModules]=useState<ModuleRow[]>([]);
  const { adminMode } = useAdminMode();

  useEffect(()=>{
    const fetchGroup=async()=>{
      const sb=supabaseClient();
      const { data: g } = await sb.from('module_group').select('id,code,title,description,is_locked,phase_id').eq('code', groupCode).maybeSingle();
      if(g) setGroup(g as Group);
      const { data: mods } = await sb
        .from('module_detail')
        .select('id,code,title,subtitle,summary,is_locked,display_order')
        .eq('group_id', g?.id)
        .order('display_order');
      if(mods) setModules(mods as ModuleRow[]);
    };
    fetchGroup();
  },[groupCode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/teacher/phases/${code}`} className="text-sm text-gray-700 hover:text-gray-900">← Back to Phase</Link>
      </div>
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">{group?.title || 'Modules'}</h2>
        <p className="text-sm text-gray-700">Select a module to view its complete lesson guide</p>
      </div>
      <div className="space-y-3">
        {modules.map(mod => {
          const locked = mod.is_locked && !adminMode;
          return (
            <div key={mod.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {mod.subtitle || mod.title}
                  {mod.is_locked ? <span className="text-gray-400 text-xs">🔒</span> : null}
                </p>
                <p className="text-xs text-gray-600">{mod.title}</p>
                <p className="text-xs text-gray-600 mt-1">{mod.summary || (locked ? 'Coming soon' : '')}</p>
              </div>
              <Link
                href={locked ? '#' : `/teacher/modules/${mod.code}`}
                className={clsx(
                  'rounded-xl border px-4 py-2 text-sm font-semibold',
                  locked ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                )}
                aria-disabled={locked}
              >
                {locked ? 'Coming Soon' : 'View Lesson →'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
