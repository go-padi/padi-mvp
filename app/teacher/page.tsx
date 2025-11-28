'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';

type Overview = {
  title: string;
  objective: string;
  steps: { step_id: string; payload?: { headline?: string; sentences?: { text: string }[] } }[];
  summary_hint?: string;
};

const tabs = [
  { id: 'about', label: 'About Method' },
  { id: 'lessons', label: 'Daily Lessons' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'grouping', label: 'Grouping & Progress' },
  { id: 'resources', label: 'Resources' },
];

const coreConcepts = [
  {
    title: 'Phonological Awareness',
    bullets: [
      'Understanding sounds in spoken language before reading begins.',
      'Recognizing words, syllables, rhymes, and individual sounds.',
      'Oral activities come before written work.',
      'Foundation for connecting sounds to letters.',
    ],
  },
  {
    title: 'Multisensory Learning (VAKT)',
    bullets: [
      'Use Visual, Auditory, Kinesthetic, and Tactile pathways.',
      'Trace sandpaper letters while saying sounds.',
      'Listen for and identify sounds in words.',
      'Use movement and gestures to anchor concepts.',
    ],
  },
  {
    title: 'MSLE Principles',
    bullets: [
      'Systematic and explicit instruction.',
      'Sequential skill building with cumulative review.',
      'Diagnostic teaching that responds to each child.',
    ],
  },
  {
    title: 'Montessori Alignment',
    bullets: [
      'Tactile, concrete exploration flows into phonics and decoding.',
      'Self-paced progress with hands-on materials.',
      'Concrete-to-abstract transitions for confident readers.',
    ],
  },
];

export default function TeacherPage(){
  const [activeTab, setActiveTab] = useState('about');
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      const sb = supabaseClient();
      const { data } = await sb
        .from('module')
        .select('title,objective,steps,summary_hint')
        .eq('code', 'K_P1_OVERVIEW')
        .limit(1)
        .maybeSingle();
      if (data) setOverview(data as unknown as Overview);
    };
    fetchOverview();
  }, []);

  const overviewSteps = useMemo(() => {
    if (overview?.steps && Array.isArray(overview.steps)) {
      return overview.steps;
    }
    return [];
  }, [overview]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">About the Padi Method</h3>
              <p className="mt-2 text-sm text-gray-700">
                Padi helps young learners build strong reading, writing, and comprehension skills using a proven multisensory method.
                It blends phonological awareness, phonics, vocabulary building, reading fluency, and comprehension strategies so every child moves at the right pace.
              </p>
              {overview?.summary_hint && (
                <p className="mt-3 text-sm text-blue-800">{overview.summary_hint}</p>
              )}
            </div>
            {overviewSteps.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Phase 1 Overview</p>
                    <h4 className="text-lg font-semibold text-gray-900">{overview?.title || 'Phonological Awareness'}</h4>
                    <p className="text-sm text-gray-700 mt-1">{overview?.objective}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {overviewSteps.map(step => (
                    <div key={step.step_id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <h5 className="text-sm font-semibold text-gray-900">
                        {step.payload?.headline || 'Overview'}
                      </h5>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                        {(step.payload?.sentences || []).map((s, idx) => (
                          <li key={idx}>{s.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900">Core Concepts</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {coreConcepts.map(concept => (
                  <div key={concept.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-900">{concept.title}</h5>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                      {concept.bullets.map(b => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-700 shadow-sm">
            Content coming soon. We’ll add structured lessons and tools here next.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Teacher</p>
          <h1 className="text-3xl font-semibold text-gray-900">Teacher Dashboard</h1>
          <p className="text-sm text-gray-700">
            Guide students through the Padi multisensory reading method with confidence.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/library" className="btn">Upload Content</Link>
          <Link href="/" className="btn">Home</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'rounded-full border px-4 py-2 text-sm',
              activeTab === tab.id
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}
