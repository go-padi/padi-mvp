'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../layout';
import { PhaseTabs } from '@/components/PhaseTabs';

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
};

export default function PhaseDetail({ params }: { params: Promise<{ phase: string }> }){
  const { phase } = use(params);
  const [phaseRow, setPhaseRow] = useState<Phase | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const { adminMode } = useAdminMode();

  useEffect(() => {
    const fetchPhase = async () => {
      const sb = supabaseClient();
      const { data: phaseRow } = await sb
        .from('phase')
        .select('id,code,title,description,summary')
        .eq('code', phase)
        .maybeSingle();
      if (phaseRow) setPhaseRow(phaseRow as Phase);
      const { data: groupRows } = await sb
        .from('module_group')
        .select('id,code,title,description,module_count,is_locked')
        .eq('phase_id', phaseRow?.id)
        .order('display_order');
      if (groupRows) setGroups(groupRows as Group[]);
    };
    fetchPhase();
  }, [phase]);

  return (
    <div className="space-y-6">
      <PhaseTabs active={phase} />
      <Link href="/teacher/phases" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
        ← Back to Phases
      </Link>
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-gray-900">{phaseRow?.title || 'Phase'}</h2>
        {phaseRow?.summary && (
          <p className="text-sm text-gray-700">{phaseRow.summary}</p>
        )}
        {phaseRow?.description && (
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm text-sm text-gray-800 space-y-3 whitespace-pre-line">
            {phaseRow.description}
          </div>
        )}
        {!phaseRow?.summary && !phaseRow?.description && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            Content coming soon.
          </div>
        )}
      </div>
      {phase !== 'K_P1' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
          Content coming soon.
        </div>
      )}
      {phase === 'K_P1' && (
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">Developmental Areas</h3>
        <p className="text-sm text-gray-700">Select an area to view its modules and lessons</p>
        <div className="space-y-3">
          {groups.map(g => {
            const locked = g.is_locked && !adminMode;
            return (
              <div key={g.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {g.title}
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
                    {locked ? 'Coming Soon' : 'View Modules →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
