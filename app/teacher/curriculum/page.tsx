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
import { stripIndividualSuffix } from '@/lib/curriculum/formatting';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';
import { CURRICULUM_INTRO, CURRICULUM_OVERVIEW } from '@/lib/copy/curriculumOverview';

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

function chapterPhase(code: string): 1 | 2 | 3 {
  const c = code.replace(/^ind-/, '');
  if (c === 'phonological-awareness' || c === 'alphabet') return 1;
  if (c === 'phonics' || c === 'reading' || c === 'handwriting') return 2;
  return 3;
}

export default function CurriculumPage() {
  const [chapters, setChapters] = useState<ChapterWithGroups[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated, role } = useAuth();

  // Parent gating (KAN-131): role comes from useAuth after hydration.
  // effectiveMode forces 'individual' for parents without mutating context.
  // An unknown role falls through to teacher view with a single warn.
  const isParent = isHydrated && role === 'parent';
  const effectiveMode = isParent ? 'individual' : mode;

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    if (role !== 'parent' && role !== 'teacher') {
      console.warn(`Unknown role: ${role} — defaulting to teacher view`);
    }
  }, [isHydrated, isLoggedIn, role]);

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
      if (!isHydrated || !isLoggedIn) return;
      setLoading(true);

      const sb = supabaseClient();
      const teachingModeParam = effectiveMode === 'both' ? null : effectiveMode;

      const { data: groupRows } = await sb.rpc('content_get_groups', {
        p_teaching_mode: teachingModeParam,
      });

      const liveGroups = (groupRows as GroupRow[] | null) || [];
      const usingLive = liveGroups.length > 0;
      const resolvedGroups: GroupRow[] = usingLive
        ? liveGroups
        : (previewGroups.filter(g =>
            effectiveMode === 'both' ? true : g.teaching_mode === effectiveMode
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
            .filter(m => effectiveMode === 'both' ? true : m.teaching_mode === effectiveMode)
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

      // Defensive: guarantee groups within each chapter follow the canonical
      // previewGroups order, regardless of the order the RPC returns rows in.
      const previewGroupOrder = new Map(previewGroups.map((g, i) => [g.code, i]));
      for (const groups of chapterGroupMap.values()) {
        groups.sort((a, b) => {
          const ai = previewGroupOrder.get(a.code) ?? Number.MAX_SAFE_INTEGER;
          const bi = previewGroupOrder.get(b.code) ?? Number.MAX_SAFE_INTEGER;
          return ai - bi;
        });
      }

      const filteredPreviewChapters = previewChapters.filter(ch =>
        effectiveMode === 'both' ? true : ch.teaching_mode === effectiveMode
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
  }, [effectiveMode, isHydrated, isLoggedIn]);

  if (isHydrated && !isLoggedIn) {
    const openSignIn = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('padi-open-signin'));
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">K-Reading Kickstart Program</h2>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-gray-700">{CURRICULUM_INTRO}</p>
        </section>

        {CURRICULUM_OVERVIEW.map((chapter) => (
          <section
            key={chapter.code}
            className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
            <p className="text-sm text-gray-700">{chapter.blurb}</p>

            {chapter.sections && (
              <details open className="space-y-2">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sections
                </summary>
                <ul className="mt-2 space-y-2">
                  {chapter.sections.map((section) => (
                    <li
                      key={section.title}
                      className="rounded-xl border border-gray-100 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                      <p className="text-xs text-gray-700">{section.description}</p>
                      <p className="mt-1 text-xs italic text-gray-500">{section.estimate}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {chapter.inlineNote && (
              <p className="text-xs italic text-gray-600">{chapter.inlineNote}</p>
            )}

            <button
              type="button"
              onClick={openSignIn}
              className="w-full rounded-xl border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Sign in to begin
            </button>
          </section>
        ))}

        <section className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
          <button
            type="button"
            onClick={openSignIn}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Sign in to access full lessons and progress tracking
          </button>
        </section>
      </div>
    );
  }

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
          <p className="text-sm font-semibold text-gray-800">{isParent ? stripIndividualSuffix(g.title) : g.title}</p>
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

  const renderChapter = (ch: ChapterWithGroups, idx: number) => {
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
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {isParent ? stripIndividualSuffix(ch.title) : ch.title}
                {isParent && isLoggedIn && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    Phase {chapterPhase(ch.code)}
                  </span>
                )}
                {isParent && isLoggedIn && idx === 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">Start here</span>
                )}
              </p>
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
      {!isParent && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TeachingModeToggle />
        </div>
      )}

      {!isLoggedIn && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {PREVIEW_BANNER}
        </div>
      )}

      {isParent && isLoggedIn && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-2">
          <p className="text-sm font-semibold text-blue-900">The curriculum builds in order</p>
          <p className="text-xs text-blue-700">
            Start with Phonological Awareness, then Alphabet, then Phonics. Reading,
            Handwriting, Spelling, and Vocabulary &amp; Comprehension build on those.
          </p>
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

      {effectiveMode === 'both' ? (
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
