'use client';
import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../../../layout';
import { PhaseTabs } from '@/components/PhaseTabs';

type Phase = { id:string; code:string; title:string; summary:string|null };
type Group = { id:string; code:string; title:string; description:string|null; is_locked:boolean|null; module_count:number|null };
type ModuleRow = { id:string; code:string; title:string; subtitle:string|null; summary:string|null; is_locked:boolean|null; display_order:number|null };

export default function AreaPage({ params }:{ params: Promise<{ phase:string; area:string }> }){
  const { phase, area } = use(params);
  const [phaseRow,setPhaseRow]=useState<Phase|null>(null);
  const [groups,setGroups]=useState<Group[]>([]);
  const [modules,setModules]=useState<ModuleRow[]>([]);
  const { adminMode } = useAdminMode();

  useEffect(()=>{
    const fetchData=async()=>{
      const sb=supabaseClient();
      const { data: p } = await sb.from('phase').select('id,code,title,summary').eq('code', phase).maybeSingle();
      if(p) setPhaseRow(p as Phase);
      const { data: gs } = await sb.from('module_group').select('id,code,title,description,is_locked,module_count').eq('phase_id', p?.id).order('display_order');
      if(gs) setGroups(gs as Group[]);
      const { data: mods } = await sb.from('module_detail').select('id,code,title,subtitle,summary,is_locked,display_order').eq('group_id',
        (gs as any)?.find((g:Group)=>g.code===area)?.id || null).order('display_order');
      if(mods) setModules(mods as ModuleRow[]);
    };
    fetchData();
  },[phase, area]);

  const sortedModules = useMemo(()=>modules.slice().sort((a,b)=> (a.display_order||0)-(b.display_order||0)),[modules]);

  const currentGroup = groups.find(g=>g.code===area);

  return (
    <div className="space-y-6">
      <PhaseTabs active={phase} />
      <div className="flex items-center gap-3">
        <Link href={`/teacher/phases/${phase}`} className="text-sm text-gray-700 hover:text-gray-900">← Back to Phase</Link>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">{phaseRow?.title || 'Phase'}</h2>
        {phaseRow?.summary && (
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{phaseRow.summary}</p>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Developmental Areas</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map(g=>{
            const locked = g.is_locked && !adminMode;
            const active = g.code===area;
            return (
              <Link
                key={g.code}
                href={locked ? '#' : `/teacher/phases/${phase}/areas/${g.code}`}
                className={clsx(
                  'rounded-2xl border p-4 shadow-sm',
                  active ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200',
                  locked && 'opacity-60 cursor-not-allowed'
                )}
              >
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {g.title} {g.is_locked ? <span className="text-gray-400 text-xs">🔒</span> : null}
                </p>
                <p className="text-xs text-gray-600">{g.description || 'Coming soon'}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentGroup?.title || 'Modules'}</h3>
            <p className="text-sm text-gray-700">Select a module to view its complete lesson guide</p>
          </div>
        </div>
        <div className="grid gap-3">
          {sortedModules.map((mod, idx) => {
            const locked = mod.is_locked && !adminMode;
            return (
              <div key={mod.id} className={clsx('rounded-2xl border p-4 shadow-sm flex items-center justify-between',
                idx===0 ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white')}>
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {mod.subtitle || mod.title}
                    {mod.is_locked ? <span className="text-gray-400 text-xs">🔒</span> : null}
                  </p>
                  <p className="text-xs text-gray-600">{mod.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{mod.summary || (locked ? 'Coming soon' : '')}</p>
                </div>
                <Link
                  href={locked ? '#' : `/teacher/phases/${phase}/areas/${area}/modules/${mod.code}`}
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
          {sortedModules.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">Modules coming soon.</div>
          )}
        </div>
      </div>
    </div>
  );
}
