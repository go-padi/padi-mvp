'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import {
  previewChapters,
  previewGroups,
  previewModulesByGroup,
  groupToChapterCode,
} from '@/lib/demo/demoCurriculum';

type GroupRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module_count: number | null;
  is_locked: boolean | null;
  teaching_mode: 'group' | 'individual';
};

type ModuleRow = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  is_locked: boolean | null;
  display_order: number | null;
  teaching_mode: 'group' | 'individual';
};

type GroupWithModules = {
  code: string;
  title: string;
  description: string | null;
  teachingMode: 'group' | 'individual';
  modules: ModuleRow[];
};

type ChapterWithGroups = {
  code: string;
  title: string;
  description: string | null;
  teachingMode: 'group' | 'individual';
  groups: GroupWithModules[];
};

export default function CurriculumPage() {
  const [chapters, setChapters] = useState<ChapterWithGroups[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated } = useAuth();

  const toggleChapter = (code: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (!isHydrated) return;
      setLoading(true);

      const sb = supabaseClient();
      const teachingModeParam = mode === 'both' ? null : mode;

      const { data: groupRows } = await sb.rpc('content_get_groups', {
        p_teaching_mode: teachingModeParam,
      });

      const liveGroups = (groupRows as GroupRow[] | null) || [];
      const usingLive = liveGroups.length > 0;
      const resolvedGroups: GroupRow[] = usingLive
        ? liveGroups
        : (previewGroups.filter(g =>
            mode === 'both' ? true : g.teaching_mode === mode
          ) as GroupRow[]);

      const groupModulesEntries = await Promise.all(
        resolvedGroups.map(async (g) => {
          if (usingLive) {
            const { data: mods } = await sb.rpc('content_get_modules', {
              p_group_code: g.code,
              p_teaching_mode: g.teaching_mode,
            });
            const moduleRows = (mods as ModuleRow[] | null) || [];
            return [g.code, moduleRows.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0))] as const;
          }
          const fallback = (previewModulesByGroup[g.code] || [])
            .filter(m => mode === 'both' ? true : m.teaching_mode === mode)
            .map(m => ({
              ...m,
              is_locked: m.is_locked ?? null,
              display_order: m.display_order ?? null,
            })) as ModuleRow[];
          return [g.code, fallback] as const;
        }),
      );
      const modulesByGroup = new Map(groupModulesEntries);

      const chapterGroupMap = new Map<string, GroupWithModules[]>();
      for (const g of resolvedGroups) {
        const chCode = groupToChapterCode[g.code];
        if (!chCode) continue;
        const mods = modulesByGroup.get(g.code) || [];
        const gwm: GroupWithModules = {
          code: g.code,
          title: g.title,
          description: g.description,
          teachingMode: g.teaching_mode,
          modules: mods,
        };
        if (!chapterGroupMap.has(chCode)) chapterGroupMap.set(chCode, []);
        chapterGroupMap.get(chCode)!.push(gwm);
      }

      const filteredPreviewChapters = previewChapters.filter(ch =>
        mode === 'both' ? true : ch.teaching_mode === mode
      );

      const builtChapters: ChapterWithGroups[] = filteredPreviewChapters
        .filter(ch => chapterGroupMap.has(ch.code))
        .map(ch => ({
          code: ch.code,
          title: ch.title,
          description: ch.description,
          teachingMode: ch.teaching_mode,
          groups: chapterGroupMap.get(ch.code) || [],
        }));

      setChapters(builtChapters);

      if (builtChapters.length > 0) {
        setExpandedChapters(new Set([builtChapters[0].code]));
      }

      setLoading(false);
    };

    fetchAll();
  }, [mode, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
        Loading curriculum...
      </div>
    );
  }

  const groupChapters = chapters.filter(ch => ch.teachingMode === 'group');
  const individualChapters = chapters.filter(ch => ch.teachingMode === 'individual');

  const renderModuleRow = (mod: ModuleRow, chapterCode: string, groupCode: string, idx: number) => {
    const locked = !!mod.is_locked;
    return (
      <div
        key={mod.id}
        className={clsx(
          'rounded-xl border p-3 flex items-center justify-between',
          idx === 0 && !locked ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white',
          locked && 'opacity-60',
        )}
      >
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
            locked ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700',
          )}>
            {locked ? '🔒' : idx + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{mod.subtitle || mod.title}</p>
            <p className="text-xs text-gray-600">{mod.summary || (locked ? 'Coming soon' : '')}</p>
          </div>
        </div>
        {locked ? (
          <span className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-50 cursor-not-allowed">
            Coming Soon
          </span>
        ) : (
          <Link
            href={`/teacher/curriculum/${chapterCode}/${groupCode}/${mod.code}`}
            className="rounded-xl border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
          >
            View Lesson →
          </Link>
        )}
      </div>
    );
  };

  const renderGroup = (g: GroupWithModules, chapterCode: string) => (
    <div key={g.code} className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{g.title}</p>
          {g.description && <p className="text-xs text-gray-600">{g.description}</p>}
        </div>
        <span className="text-xs text-gray-500">{g.modules.length} module{g.modules.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-1.5">
        {g.modules.map((mod, idx) => renderModuleRow(mod, chapterCode, g.code, idx))}
        {g.modules.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-500">
            Modules coming soon.
          </div>
        )}
      </div>
    </div>
  );

  const renderChapter = (ch: ChapterWithGroups) => {
    const isExpanded = expandedChapters.has(ch.code);
    const totalModules = ch.groups.reduce((sum, g) => sum + g.modules.length, 0);

    return (
      <div key={ch.code} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleChapter(ch.code)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
              {isExpanded ? '▼' : '▶'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{ch.title}</p>
              <p className="text-xs text-gray-600">
                {totalModules} module{totalModules !== 1 ? 's' : ''} across {ch.groups.length} group{ch.groups.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 space-y-4">
            {ch.groups.map(g => renderGroup(g, ch.code))}
          </div>
        )}
      </div>
    );
  };

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

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">K-Reading Kickstart Program</h2>
        <p className="text-sm text-gray-700">Tap a chapter to explore its lessons</p>
      </div>

      {chapters.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
          Curriculum coming soon.
        </div>
      )}

      {mode === 'both' ? (
        <div className="space-y-6">
          {groupChapters.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Group Curriculum</h3>
              {groupChapters.map(renderChapter)}
            </div>
          )}
          {individualChapters.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Individual Curriculum</h3>
              {individualChapters.map(renderChapter)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map(renderChapter)}
        </div>
      )}
    </div>
  );
}
