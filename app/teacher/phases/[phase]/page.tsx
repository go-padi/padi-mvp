'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useAdminMode } from '../../layout';
import { PhaseTabs } from '@/components/PhaseTabs';

const fallbackPhase = {
  code: 'K_P1',
  title: 'Phase 1',
  summary: `Phonological Awareness is one of the key predictors and a vital prerequisite for learning to read and spell. It is the ability to identify and manipulate units of sound.

The basic phonological awareness ability is detecting rhyme. The students with competent phonological awareness will easily recognize that the rime part is the same and only the onset is changed in words like pat, sat, and mat. The students with language learning disability often do not have this ability. Early intervention with exposure to rhymes is vital.

Phonological awareness involves the understanding that sentences are made up of words, that words are created from syllables, and syllables from sounds. When counting words, students with language learning disability may think that "Atlantic" is three words, not being aware that the components are syllables that make up one word. This knowledge cannot be assumed but must be taught directly.

Once the students are aware of the syllable components, they can learn to manipulate them, by adding, deleting, and reversing them. Only after extensive practice with syllables are the students able to identify and manipulate sounds in syllables. The awareness of phonemes is the highest skill and requires daily practice. The students who can accurately detect and manipulate the sounds in syllables are well equipped for reading and spelling activities.`,
  description: 'Phonological Awareness Foundation',
};

const fallbackGroups: Group[] = [
  { id: 'fallback-ls', code: 'K_P1_LS', title: 'Learning Sensorially', description: 'Sharpen listening skills and auditory discrimination', module_count: 13, is_locked: false },
  { id: 'fallback-rhy', code: 'K_P1_RHY', title: 'Rhyming', description: 'Develop rhyming discrimination and production', module_count: 10, is_locked: true },
  { id: 'fallback-ws', code: 'K_P1_WS', title: 'Words and Sentences', description: 'Build word and sentence awareness', module_count: 10, is_locked: true },
  { id: 'fallback-syl', code: 'K_P1_SYL', title: 'Syllables', description: 'Clap, segment, and blend syllables', module_count: 10, is_locked: true },
  { id: 'fallback-pa', code: 'K_P1_PA', title: 'Phonemic Awareness', description: 'Work with individual sounds', module_count: 10, is_locked: true },
];

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
      if (phaseRow) {
        setPhaseRow(phaseRow as Phase);
        const { data: groupRows } = await sb
          .from('module_group')
          .select('id,code,title,description,module_count,is_locked')
          .eq('phase_id', phaseRow.id)
          .order('display_order');
        if (groupRows) setGroups(groupRows as Group[]);
      }
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
        <h2 className="text-3xl font-semibold text-gray-900">{phaseRow?.title || (phase === 'K_P1' ? fallbackPhase.title : 'Phase')}</h2>
        {phaseRow?.summary || (phase === 'K_P1' ? fallbackPhase.summary : null) ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{phaseRow?.summary || fallbackPhase.summary}</p>
        ) : null}
        {phaseRow?.description || (phase === 'K_P1' ? fallbackPhase.description : null) ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm text-sm text-gray-800 space-y-3 whitespace-pre-line">
            {phaseRow?.description || fallbackPhase.description}
          </div>
        ) : (
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
          {(groups.length ? groups : fallbackGroups).map(g => {
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
