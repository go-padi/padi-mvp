'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
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
  const { mode } = useTeachingMode();
  const { isHydrated } = useAuth();

  useEffect(() => {
    const fetchPhase = async () => {
      if (!isHydrated) return;
      const sb = supabaseClient();
      const { data: phaseRows } = await sb.rpc('content_get_phase', { p_code: phase });
      const phaseRow = (phaseRows?.[0] as Phase | undefined) || null;
      const previewPhase = previewPhaseByCode[phase];
      const resolvedPhase = phaseRow
        ? ({
            ...(phaseRow as Phase),
            description: phaseRow.description || previewPhase?.description || null,
          } as Phase)
        : previewPhase
          ? { id: previewPhase.code, code: previewPhase.code, title: previewPhase.title, description: previewPhase.description, summary: previewPhase.summary || null }
          : null;
      setPhaseRow(resolvedPhase);

      const teachingModeParam = mode === 'both' ? null : mode;
      const { data: groupRows } = await sb.rpc('content_get_groups', {
        p_phase_code: phase,
        p_teaching_mode: teachingModeParam,
      });
      const liveGroups = (groupRows as Group[] | null) || [];

      const fallbackGroups = (previewGroupsByPhase[phase] || []).filter((g) =>
        mode === 'both' ? true : g.teaching_mode === mode
      );
      const resolvedGroups = liveGroups.length ? liveGroups : fallbackGroups;
      setGroupsByMode({
        group: resolvedGroups.filter(g => g.teaching_mode === 'group'),
        individual: resolvedGroups.filter(g => g.teaching_mode === 'individual'),
      });
    };
    fetchPhase();
  }, [phase, mode, isHydrated]);

  const renderGroupCard = (g: Group) => {
    const locked = !!g.is_locked;
    const ctaLabel = locked ? 'Coming Soon' : 'View Modules →';
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
