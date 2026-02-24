'use client';
import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../../../layout';
import { PhaseTabs } from '@/components/PhaseTabs';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useAuth } from '@/lib/auth-store';
import { previewGroupsByPhase, previewModulesByGroup, previewPhaseByCode } from '@/lib/demo/demoCurriculum';

type Phase = { id:string; code:string; title:string; summary:string|null };
type Group = { id:string; code:string; title:string; description:string|null; is_locked:boolean|null; module_count:number|null; teaching_mode: 'group' | 'individual' };
type ModuleRow = { id:string; code:string; title:string; subtitle:string|null; summary:string|null; is_locked:boolean|null; display_order:number|null; teaching_mode: 'group' | 'individual' };

export default function AreaPage({ params }:{ params: Promise<{ phase:string; area:string }> }){
  const { phase, area } = use(params);
  const [phaseRow,setPhaseRow]=useState<Phase|null>(null);
  const [groups,setGroups]=useState<Group[]>([]);
  const [modules,setModules]=useState<ModuleRow[]>([]);
  const { adminMode } = useAdminMode();
  const { mode } = useTeachingMode();
  const { isHydrated } = useAuth();

  useEffect(()=>{
    const fetchData=async()=>{
      if (!isHydrated) return;
      const sb=supabaseClient();
      const { data: phaseRows } = await sb.rpc('content_get_phase', { p_code: phase });
      const p = (phaseRows?.[0] as Phase | undefined) || null;
      const previewPhase = previewPhaseByCode[phase];
      if (p) {
        setPhaseRow(p as Phase);
      } else if (previewPhase) {
        setPhaseRow({ id: previewPhase.code, code: previewPhase.code, title: previewPhase.title, summary: previewPhase.summary || null });
      } else {
        setPhaseRow(null);
      }

      const teachingModeParam = mode === 'both' ? null : mode;
      const { data: gs } = await sb.rpc('content_get_groups', {
        p_phase_code: phase,
        p_teaching_mode: teachingModeParam,
      });
      const liveGroups = (gs as Group[] | null) || [];
      const fallbackGroups = (previewGroupsByPhase[phase] || []).filter(g => (mode === 'both' ? true : g.teaching_mode === mode));
      const resolvedGroups = liveGroups.length ? liveGroups : fallbackGroups;
      setGroups(resolvedGroups);

      const activeGroup = resolvedGroups.find((g:Group)=>g.code===area);
      if(!activeGroup){
        setModules(((previewModulesByGroup[area] || []).filter(m => (mode === 'both' ? true : m.teaching_mode === mode))) as ModuleRow[]);
        return;
      }

      const moduleModeParam = mode === 'both' ? activeGroup.teaching_mode : mode;
      const { data: mods } = await sb.rpc('content_get_modules', {
        p_group_code: activeGroup.code,
        p_teaching_mode: moduleModeParam,
      });
      const liveModules = (mods as ModuleRow[] | null) || [];
      const fallbackModules = (previewModulesByGroup[activeGroup.code] || []).filter(m => (mode === 'both' ? m.teaching_mode === activeGroup.teaching_mode : m.teaching_mode === mode));
      setModules((liveModules.length ? liveModules : fallbackModules) as ModuleRow[]);
    };
    fetchData();
  },[phase, area, mode, isHydrated]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  const sortedModules = useMemo(()=>modules.slice().sort((a,b)=> (a.display_order||0)-(b.display_order||0)),[modules]);
  const filteredGroups = useMemo(() => (mode === 'both' ? groups : groups.filter(g => g.teaching_mode === mode)), [groups, mode]);
  const currentGroup = filteredGroups.find(g=>g.code===area);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PhaseTabs active={phase} />
        <TeachingModeToggle />
      </div>
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
        {filteredGroups.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">Curriculum coming soon.</div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
        {filteredGroups.map(g=>{
            const locked = !!g.is_locked && !adminMode;
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
                  {mode === 'both' && (
                    <span className={clsx(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                      g.teaching_mode === 'individual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    )}>
                      {g.teaching_mode === 'individual' ? 'Individual' : 'Group'}
                    </span>
                  )}
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
            const locked = !!mod.is_locked && !adminMode;
            return (
              <div key={mod.id} className={clsx('rounded-2xl border p-4 shadow-sm flex items-center justify-between',
                idx===0 ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white')}>
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {mod.subtitle || mod.title}
                  {mod.is_locked ? <span className="text-gray-400 text-xs">🔒</span> : null}
                  {mode === 'both' && (
                    <span className={clsx(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                      mod.teaching_mode === 'individual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    )}>
                      {mod.teaching_mode === 'individual' ? 'Individual' : 'Group'}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600">{mod.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {mod.summary || (locked ? 'Coming soon' : '')}
                </p>
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
