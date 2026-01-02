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

type Phase = { id:string; code:string; title:string; summary:string|null };
type Group = { id:string; code:string; title:string; description:string|null; is_locked:boolean|null; module_count:number|null; teaching_mode: 'group' | 'individual' };
type ModuleRow = { id:string; code:string; title:string; subtitle:string|null; summary:string|null; is_locked:boolean|null; display_order:number|null; teaching_mode: 'group' | 'individual' };

const fallbackPhase: Phase = {
  id: 'phase-1-preview',
  code: 'K_P1',
  title: 'Phase 1: Foundations & Phonological Awareness',
  summary:
    'Preview of Phase 1 for anonymous visitors. Log in to unlock the full lesson sequence, progress tracking, and saved notes.',
};

const fallbackGroups: Group[] = [
  { id: 'fallback-ls', code: 'K_P1_LS', title: 'Learning Sensorially', description: 'Sharpen listening skills and auditory discrimination', is_locked: false, module_count: 13, teaching_mode: 'group' },
  { id: 'fallback-rhy', code: 'K_P1_RHY', title: 'Rhyming', description: 'Develop rhyming discrimination and production', is_locked: true, module_count: 10, teaching_mode: 'group' },
  { id: 'fallback-ws', code: 'K_P1_WS', title: 'Words and Sentences', description: 'Build word and sentence awareness', is_locked: true, module_count: 10, teaching_mode: 'group' },
  { id: 'fallback-syl', code: 'K_P1_SYL', title: 'Syllables', description: 'Clap, segment, and blend syllables', is_locked: true, module_count: 10, teaching_mode: 'group' },
  { id: 'fallback-pa', code: 'K_P1_PA', title: 'Phonemic Awareness', description: 'Work with individual sounds', is_locked: true, module_count: 10, teaching_mode: 'group' },
];

const fallbackIndividualGroups: Group[] = [
  { id: 'fallback-ind-sa', code: 'K_P1_IND_SA', title: 'Sound Awareness (Individual)', description: 'One-on-one listening and sound identification activities', is_locked: false, module_count: 10, teaching_mode: 'individual' },
  { id: 'fallback-ind-rhy', code: 'K_P1_IND_RHY', title: 'Individual Rhyme Practice', description: 'Personalized rhyme detection and creation', is_locked: true, module_count: 6, teaching_mode: 'individual' },
];

const fallbackModulesByGroup: Record<string, ModuleRow[]> = {
  K_P1_LS: [
    {
      id: 'fallback-ls-1',
      code: 'LS-1',
      title: 'The Silence Game',
      subtitle: 'LS1',
      summary: 'Sharpen listening skills with intentional silence and sound awareness.',
      is_locked: false,
      display_order: 1,
      teaching_mode: 'group',
    },
    ...Array.from({ length: 3 }).map((_, idx) => {
      const n = idx + 2;
      return {
        id: `fallback-ls-${n}`,
        code: `LS-${n}`,
        title: `Module ${n}`,
        subtitle: `LS${n}`,
        summary: 'Content coming soon',
        is_locked: true,
        display_order: n,
        teaching_mode: 'group' as const,
      };
    }),
  ],
  K_P1_IND_SA: [
    {
      id: 'fallback-ind-sa-1',
      code: 'K_P1_IND_SA_1',
      title: 'Lesson 1 (Individual placeholder)',
      subtitle: 'Ind 1',
      summary: 'Foundational sound awareness practice for individual sessions.',
      is_locked: false,
      display_order: 1,
      teaching_mode: 'individual',
    },
    {
      id: 'fallback-ind-sa-2',
      code: 'K_P1_IND_SA_2',
      title: 'Lesson 2 (Individual placeholder)',
      subtitle: 'Ind 2',
      summary: 'Follow-up listening task for one-on-one work.',
      is_locked: true,
      display_order: 2,
      teaching_mode: 'individual',
    },
  ],
};

export default function AreaPage({ params }:{ params: Promise<{ phase:string; area:string }> }){
  const { phase, area } = use(params);
  const [phaseRow,setPhaseRow]=useState<Phase|null>(null);
  const [groups,setGroups]=useState<Group[]>([]);
  const [modules,setModules]=useState<ModuleRow[]>([]);
  const { adminMode } = useAdminMode();
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated } = useAuth();
  const dataMode = isLoggedIn ? 'live' : 'demo';

  useEffect(()=>{
    const fetchData=async()=>{
      if (!isHydrated) return;
      const usePreviewData = () => {
        const previewGroups = [...fallbackGroups, ...fallbackIndividualGroups];
        setPhaseRow(fallbackPhase);
        setGroups(previewGroups);
        setModules(fallbackModulesByGroup[area] || []);
      };

      if (dataMode === 'demo') {
        usePreviewData();
        return;
      }

      const sb=supabaseClient();
      const { data: p } = await sb.from('phase').select('id,code,title,summary').eq('code', phase).maybeSingle();
      if(p) setPhaseRow(p as Phase);

      let groupQuery = sb.from('module_group')
        .select('id,code,title,description,is_locked,module_count,teaching_mode')
        .eq('phase_id', p?.id || null);
      groupQuery = mode === 'both' ? groupQuery.in('teaching_mode', ['group', 'individual']) : groupQuery.eq('teaching_mode', mode);
      const { data: gs } = await groupQuery.order('display_order');
      setGroups(gs as Group[] || []);

      const activeGroup = (gs as Group[] | null | undefined)?.find((g:Group)=>g.code===area);
      if(!activeGroup){
        setModules([]);
        return;
      }

      let moduleQuery = sb
        .from('module_detail')
        .select('id,code,title,subtitle,summary,is_locked,display_order,teaching_mode')
        .eq('group_id', activeGroup.id);
      moduleQuery = mode === 'both' ? moduleQuery.eq('teaching_mode', activeGroup.teaching_mode) : moduleQuery.eq('teaching_mode', mode);
      const { data: mods } = await moduleQuery.order('display_order');
      setModules(mods as ModuleRow[] || []);
    };
    fetchData();
  },[phase, area, mode, dataMode, isHydrated]);

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
            const locked = mod.is_locked && !adminMode;
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
                  {locked && !isLoggedIn
                    ? 'Log in to unlock full lesson sequence'
                    : mod.summary || (locked ? 'Coming soon' : '')}
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
