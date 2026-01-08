'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../layout';
import { PhaseTabs } from '@/components/PhaseTabs';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { previewGroupsByPhase, previewPhaseByCode } from '@/lib/demo/demoCurriculum';

type Phase = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  summary: string | null;
};

type Group = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module_count: number | null;
  is_locked: boolean | null;
  teaching_mode: 'group' | 'individual';
};

export default function PhaseDetail({ params }: { params: Promise<{ phase: string }> }){
  const { phase } = use(params);
  const [phaseRow, setPhaseRow] = useState<Phase | null>(null);
  const [groupsByMode, setGroupsByMode] = useState<{ group: Group[]; individual: Group[] }>({ group: [], individual: [] });
  const { adminMode } = useAdminMode();
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated } = useAuth();
  const dataMode = isLoggedIn ? 'live' : 'preview';

  useEffect(() => {
    const fetchPhase = async () => {
      if (!isHydrated) return;
      if (dataMode === 'preview') {
        const previewPhase = previewPhaseByCode[phase];
        setPhaseRow(previewPhase ? { id: previewPhase.code, code: previewPhase.code, title: previewPhase.title, description: previewPhase.description, summary: null } : null);
        const previewGroups = previewGroupsByPhase[phase] || [];
        const grouped = {
          group: previewGroups.filter(g => g.teaching_mode === 'group'),
          individual: previewGroups.filter(g => g.teaching_mode === 'individual'),
        };
        const filtered =
          mode === 'both'
            ? grouped
            : {
                group: mode === 'group' ? grouped.group : [],
                individual: mode === 'individual' ? grouped.individual : [],
              };
        setGroupsByMode(filtered);
        return;
      }
      const sb = supabaseClient();
      const { data: phaseRow } = await sb
        .from('phase')
        .select('id,code,title,description,summary')
        .eq('code', phase)
        .maybeSingle();
      if (phaseRow) {
        setPhaseRow(phaseRow as Phase);
        let groupQuery = sb
          .from('module_group')
          .select('id,code,title,description,module_count,is_locked,teaching_mode')
          .eq('phase_id', phaseRow.id)
          .order('display_order');
        groupQuery =
          mode === 'both'
            ? groupQuery.in('teaching_mode', ['group', 'individual'])
            : groupQuery.eq('teaching_mode', mode);
        const { data: groupRows } = await groupQuery;
        if (groupRows && groupRows.length) {
          setGroupsByMode({
            group: (groupRows as Group[]).filter(g => g.teaching_mode === 'group'),
            individual: (groupRows as Group[]).filter(g => g.teaching_mode === 'individual'),
          });
        } else {
          setGroupsByMode({ group: [], individual: [] });
        }
      }
    };
    fetchPhase();
  }, [phase, mode, isLoggedIn, isHydrated, dataMode]);

  const renderGroupCard = (g: Group) => {
    const previewLocked = dataMode === 'preview' && g.is_locked;
    const locked = dataMode === 'live' ? g.is_locked && !adminMode : false;
    const ctaLabel = previewLocked ? 'Preview structure' : locked ? 'Coming Soon' : 'View Modules →';
    return (
      <div key={g.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              {g.title}
              <span className={clsx(
                'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                g.teaching_mode === 'individual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
              )}>
                {g.teaching_mode === 'individual' ? 'Individual' : 'Group'}
              </span>
              {g.is_locked ? <span className="text-gray-400 text-xs">🔒</span> : null}
            </p>
            <p className="text-xs text-gray-600">{g.description || 'Coming soon'}</p>
            <p className="text-xs text-gray-600 mt-1">{g.module_count ? `${g.module_count} modules available` : ''}</p>
          </div>
          <Link
            href={locked ? '#' : `/teacher/phases/${phase}/areas/${g.code}`}
            className={clsx(
              'rounded-xl border px-4 py-2 text-sm font-semibold',
              locked ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
            )}
            aria-disabled={locked}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    );
  };

  const singleModeGroups = mode === 'individual' ? groupsByMode.individual : groupsByMode.group;
  const hasGroups =
    mode === 'both'
      ? groupsByMode.group.length + groupsByMode.individual.length > 0
      : singleModeGroups.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PhaseTabs active={phase} />
        <TeachingModeToggle />
      </div>
      <Link href="/teacher/phases" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
        ← Back to Phases
      </Link>
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-gray-900">{phaseRow?.title || previewPhaseByCode[phase]?.title || 'Phase'}</h2>
        {phaseRow?.summary ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{phaseRow.summary}</p>
        ) : null}
        {phaseRow?.description || previewPhaseByCode[phase]?.description ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm text-sm text-gray-800 space-y-3 whitespace-pre-line">
            {phaseRow?.description || previewPhaseByCode[phase]?.description}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            Content coming soon.
          </div>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">Developmental Areas</h3>
        <p className="text-sm text-gray-700">Select an area to view its modules and lessons</p>
        {!hasGroups && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            Curriculum coming soon.
          </div>
        )}
        {hasGroups && mode === 'both' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Group Curriculum</div>
              <div className="space-y-3">
                {groupsByMode.group.map(renderGroupCard)}
                {!groupsByMode.group.length && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
                    Group curriculum coming soon.
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Individual Curriculum</div>
              <div className="space-y-3">
                {groupsByMode.individual.map(renderGroupCard)}
                {!groupsByMode.individual.length && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
                    Individual curriculum coming soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {hasGroups && mode !== 'both' && (
          <div className="space-y-3">
            {singleModeGroups.map(renderGroupCard)}
          </div>
        )}
      </div>
    </div>
  );
}
