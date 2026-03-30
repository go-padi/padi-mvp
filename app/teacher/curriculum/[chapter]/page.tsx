'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { previewChapters, previewGroupsByChapter } from '@/lib/demo/demoCurriculum';

type Group = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module_count: number | null;
  is_locked: boolean | null;
  teaching_mode: 'group' | 'individual';
};

export default function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = use(params);
  const [groups, setGroups] = useState<Group[]>([]);
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!isHydrated) return;
      const sb = supabaseClient();
      const teachingModeParam = mode === 'both' ? null : mode;
      const { data: groupRows } = await sb.rpc('content_get_groups', {
        p_teaching_mode: teachingModeParam,
        p_chapter_code: chapter,
      });
      const liveGroups = (groupRows as Group[] | null) || [];
      const fallbackGroups = (previewGroupsByChapter[chapter] || []).filter(g =>
        mode === 'both' ? true : g.teaching_mode === mode
      );
      setGroups(liveGroups.length ? liveGroups : fallbackGroups);
    };
    fetchGroups();
  }, [chapter, mode, isHydrated]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  const chapterInfo = previewChapters.find(c => c.code === chapter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeachingModeToggle />
      </div>
      <Link href="/teacher/curriculum" className="text-sm text-gray-700 hover:text-gray-900">← Back to Curriculum</Link>

      {chapterInfo && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">{chapterInfo.title}</h2>
          <p className="text-sm text-gray-600">{chapterInfo.description}</p>
        </div>
      )}

      {!isLoggedIn && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Preview mode: log in to unlock editable lessons and saved progress.
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Lesson Groups</h3>
        {groups.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
            No lesson groups found.
          </div>
        )}
        <div className="space-y-3">
          {groups.map(g => (
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
                  </p>
                  <p className="text-xs text-gray-600">{g.description || ''}</p>
                  <p className="text-xs text-gray-600 mt-1">{g.module_count ? `${g.module_count} modules available` : ''}</p>
                </div>
                <Link
                  href={`/teacher/curriculum/${chapter}/${g.code}`}
                  className="rounded-xl border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  View Modules →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
