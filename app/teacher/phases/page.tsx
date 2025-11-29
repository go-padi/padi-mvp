'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../layout';
import { PhaseTabs } from '@/components/PhaseTabs';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';

type PhaseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  months: string | null;
  lesson_range: string | null;
  is_locked: boolean | null;
};

type Outcome = { label: string; description: string; tone?: string };

export default function PhasesPage(){
  const [phases, setPhases] = useState<PhaseRow[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const { adminMode } = useAdminMode();
  const { mode } = useTeachingMode();

  useEffect(() => {
    const fetchPhases = async () => {
      const sb = supabaseClient();
      const { data } = await sb.from('phase').select('id,code,title,description,months,lesson_range,is_locked,outcomes').order('display_order');
      if (data) {
        setPhases(data as PhaseRow[]);
        const o = (data.find(p => p.outcomes)?.outcomes || []) as Outcome[];
        setOutcomes(o);
      }
    };
    fetchPhases();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PhaseTabs active="K_P1" />
        <TeachingModeToggle />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">K-Reading Kickstart Program</h2>
        <p className="text-xs text-gray-600">Teaching mode: {mode === 'both' ? 'Individual + Group' : mode === 'group' ? 'Group' : 'Individual'}</p>
        <p className="text-sm text-gray-700">Click on any phase to explore its content</p>
        <div className="grid gap-4 md:grid-cols-3 items-stretch">
          {phases.map(phase => {
            const locked = phase.is_locked && !adminMode;
            return (
              <div key={phase.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-600">{phase.months || ''} {phase.lesson_range ? `| ${phase.lesson_range}` : ''}</p>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {phase.title}
                      {phase.is_locked ? <span className="text-gray-400 text-sm">🔒</span> : null}
                    </h3>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-700 min-h-[48px]">{phase.description || 'Coming soon'}</p>
                <div className="mt-4">
                  <Link
                    href={locked ? '#' : `/teacher/phases/${phase.code}`}
                    className={clsx(
                      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold',
                      locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                    )}
                    aria-disabled={locked}
                  >
                    {locked ? 'Locked' : `Explore ${phase.title}`}
                    {!locked && <span className="ml-2">→</span>}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">Program Outcomes</h3>
        <p className="text-sm text-gray-700">After completing all three phases, students will be placed into one of three groups:</p>
        <div className="grid gap-4 md:grid-cols-3">
          {(outcomes.length ? outcomes : [
            { label: 'First Grade', description: 'Students ready for mainstream Grade 1 curriculum', tone: 'bg-green-50 text-green-800 border-green-100' },
            { label: 'Group Literacy', description: 'Students needing continued small-group support', tone: 'bg-yellow-50 text-yellow-900 border-yellow-100' },
            { label: 'One-on-One SIS Program', description: 'Students requiring individualized intervention', tone: 'bg-orange-50 text-orange-900 border-orange-100' },
          ]).map(o => (
            <div key={o.label} className={clsx('rounded-2xl border p-4', o.tone || 'bg-gray-50 border-gray-100')}>
              <p className="text-sm font-semibold">{o.label}</p>
              <p className="mt-1 text-sm">{o.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
