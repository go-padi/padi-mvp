'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { previewChapters } from '@/lib/demo/demoCurriculum';

type Chapter = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  display_order: number;
  teaching_mode: 'group' | 'individual';
  group_count: number;
};

export default function CurriculumPage() {
  const [chaptersByMode, setChaptersByMode] = useState<{ group: Chapter[]; individual: Chapter[] }>({ group: [], individual: [] });
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated } = useAuth();

  useEffect(() => {
    const fetchChapters = async () => {
      if (!isHydrated) return;
      const sb = supabaseClient();
      const teachingModeParam = mode === 'both' ? null : mode;
      const { data: chapterRows } = await sb.rpc('content_get_chapters', {
        p_teaching_mode: teachingModeParam,
      });
      const liveChapters = (chapterRows as Chapter[] | null) || [];
      const fallbackChapters = previewChapters.filter((c) =>
        mode === 'both' ? true : c.teaching_mode === mode
      );
      const resolved = liveChapters.length ? liveChapters : fallbackChapters;
      setChaptersByMode({
        group: resolved.filter(c => c.teaching_mode === 'group'),
        individual: resolved.filter(c => c.teaching_mode === 'individual'),
      });
    };
    fetchChapters();
  }, [mode, isHydrated]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  const renderChapterCard = (c: Chapter) => (
    <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {c.title}
            <span className={clsx(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              c.teaching_mode === 'individual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
            )}>
              {c.teaching_mode === 'individual' ? 'Individual' : 'Group'}
            </span>
          </p>
          <p className="text-xs text-gray-600">{c.description || ''}</p>
          <p className="text-xs text-gray-600 mt-1">{c.group_count ? `${c.group_count} lesson groups` : ''}</p>
        </div>
        <Link
          href={`/teacher/curriculum/${c.code}`}
          className="rounded-xl border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
        >
          View Lesson Groups →
        </Link>
      </div>
    </div>
  );

  const singleModeChapters = mode === 'individual' ? chaptersByMode.individual : chaptersByMode.group;
  const hasChapters =
    mode === 'both'
      ? chaptersByMode.group.length + chaptersByMode.individual.length > 0
      : singleModeChapters.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeachingModeToggle />
      </div>
      {!isLoggedIn && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Preview mode: log in to unlock editable lessons and saved progress.
        </div>
      )}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">K-Reading Kickstart Program</h2>
        <p className="text-xs text-gray-600">Teaching mode: {mode === 'both' ? 'Individual + Group' : mode === 'group' ? 'Group' : 'Individual'}</p>
        <p className="text-sm text-gray-700">Select a chapter to view its lesson groups</p>
        {!hasChapters && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            Curriculum coming soon.
          </div>
        )}
        {hasChapters && mode === 'both' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Group Curriculum</div>
              <div className="space-y-3">
                {chaptersByMode.group.map(renderChapterCard)}
                {!chaptersByMode.group.length && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
                    Group curriculum coming soon.
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Individual Curriculum</div>
              <div className="space-y-3">
                {chaptersByMode.individual.map(renderChapterCard)}
                {!chaptersByMode.individual.length && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
                    Individual curriculum coming soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {hasChapters && mode !== 'both' && (
          <div className="space-y-3">
            {singleModeChapters.map(renderChapterCard)}
          </div>
        )}
      </div>
    </div>
  );
}
