'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
import {
  groupToChapterCode,
  previewChapters,
  previewGroups,
  previewModulesByGroup,
} from '@/lib/demo/demoCurriculum';
import { formatProgressLabel } from '@/lib/copy/progressCopy';
import {
  AssessmentStatus,
  assessmentStatusCaption,
  normalizeAssessmentStatus,
} from '@/lib/copy/assessmentStatusCopy';

function statusBadgeClass(status: AssessmentStatus): string {
  switch (status) {
    case 'Accelerating':
      return 'bg-green-50 text-green-700';
    case 'Practicing':
      return 'bg-amber-50 text-amber-700';
    case 'Specialist Track':
      return 'bg-red-50 text-red-700';
    case 'In progress':
      return 'bg-blue-50 text-blue-700';
    case 'Not started':
      return 'bg-gray-100 text-gray-600';
  }
}

type StudentRow = {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  focus_areas: string[] | null;
  progress_percent: number | null;
  progress_label: string | null;
  assessment_status: string | null;
};

type ModuleRow = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  is_locked: boolean | null;
  display_order: number | null;
  teaching_mode: 'individual' | 'group';
};

type GroupRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module_count: number | null;
  is_locked: boolean | null;
  teaching_mode: 'group' | 'individual';
};

type GroupWithModules = {
  code: string;
  title: string;
  description: string | null;
  modules: ModuleRow[];
  completedCount: number;
  totalCount: number;
};

type ChapterWithGroups = {
  code: string;
  title: string;
  description: string | null;
  groups: GroupWithModules[];
};

export default function StudentModulePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { isLoggedIn, isHydrated } = useAuth();
  const [student, setStudent] = useState<{
    id: string;
    name: string;
    focusAreas: string[];
    progressPercent: number;
    progressLabel: string | null;
    assessmentStatus: AssessmentStatus;
  } | null>(null);
  const [chapters, setChapters] = useState<ChapterWithGroups[]>([]);
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchCompletions = useCallback(async (sid: string) => {
    const sb = supabaseClient();
    const { data } = await sb
      .from('module_assessment')
      .select('module_id')
      .eq('student_id', sid);
    const ids = new Set((data || []).map((r: { module_id: string }) => r.module_id));
    setCompletedModuleIds(ids);
    return ids;
  }, []);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;

    const fetchData = async () => {
      const sb = supabaseClient();

      const { data: row } = await sb
        .from('students')
        .select(
          'id,name,first_name,last_name,focus_areas,progress_percent,progress_label,assessment_status',
        )
        .eq('id', studentId)
        .single();

      if (!row) {
        setLoading(false);
        return;
      }

      const studentRow = row as StudentRow;
      const fullName = [studentRow.first_name, studentRow.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      const s = {
        id: studentRow.id,
        name: fullName || studentRow.name || 'Student',
        focusAreas: Array.isArray(studentRow.focus_areas)
          ? studentRow.focus_areas
          : ['Learning Sensorially'],
        progressPercent: studentRow.progress_percent ?? 0,
        progressLabel: studentRow.progress_label ?? null,
        assessmentStatus: normalizeAssessmentStatus({
          assessmentStatus: studentRow.assessment_status,
          progressPercent: studentRow.progress_percent,
        }),
      };
      setStudent(s);

      const [groupsRes, completionIds] = await Promise.all([
        sb.rpc('content_get_groups', { p_teaching_mode: null }),
        fetchCompletions(studentId),
      ]);

      const groupRows = (groupsRes.data as GroupRow[] | null) || [];
      const resolvedGroups = groupRows.length
        ? groupRows
        : previewGroups.map((g) => ({ ...g, id: g.id } as GroupRow));

      // Fetch modules for all groups in parallel
      const groupModulesEntries = await Promise.all(
        resolvedGroups.map(async (g) => {
          if (groupRows.length) {
            const { data: mods } = await sb.rpc('content_get_modules', {
              p_group_code: g.code,
              p_teaching_mode: g.teaching_mode,
            });
            const moduleRows = (mods as ModuleRow[] | null) || [];
            return [g.code, moduleRows.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))] as const;
          }
          const fallback = (previewModulesByGroup[g.code] || []).map((m) => ({
            ...m,
            is_locked: m.is_locked ?? null,
            display_order: m.display_order ?? null,
          })) as ModuleRow[];
          return [g.code, fallback] as const;
        }),
      );
      const modulesByGroup = new Map(groupModulesEntries);

      // Build chapter structure
      const chapterGroupMap = new Map<string, GroupWithModules[]>();
      for (const g of resolvedGroups) {
        const chCode = groupToChapterCode[g.code];
        if (!chCode) continue;
        const mods = modulesByGroup.get(g.code) || [];
        const gwm: GroupWithModules = {
          code: g.code,
          title: g.title,
          description: g.description,
          modules: mods,
          completedCount: mods.filter((m) => completionIds.has(m.code)).length,
          totalCount: mods.length,
        };
        if (!chapterGroupMap.has(chCode)) chapterGroupMap.set(chCode, []);
        chapterGroupMap.get(chCode)!.push(gwm);
      }

      const builtChapters: ChapterWithGroups[] = previewChapters
        .filter((ch) => chapterGroupMap.has(ch.code))
        .map((ch) => ({
          code: ch.code,
          title: ch.title,
          description: ch.description,
          groups: chapterGroupMap.get(ch.code) || [],
        }));

      setChapters(builtChapters);

      // Default expand: first chapter with incomplete modules
      const firstIncomplete = builtChapters.find((ch) =>
        ch.groups.some((g) => g.completedCount < g.totalCount),
      );
      if (firstIncomplete) {
        setExpandedChapters(new Set([firstIncomplete.code]));
      }

      setLoading(false);
    };

    fetchData();
  }, [studentId, isHydrated, isLoggedIn, fetchCompletions]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    const mountedAt = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - mountedAt < 500) return;
      fetchCompletions(studentId);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isHydrated, isLoggedIn, studentId, fetchCompletions]);

  const avatarInitials = useMemo(() => {
    if (!student) return 'S';
    return (student.name || 'S')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [student]);

  const allModules = useMemo(
    () => chapters.flatMap((ch) => ch.groups.flatMap((g) => g.modules)),
    [chapters],
  );
  const completedCount = useMemo(
    () => allModules.filter((m) => completedModuleIds.has(m.code)).length,
    [allModules, completedModuleIds],
  );
  const totalCount = allModules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const chaptersStarted = useMemo(
    () => chapters.filter((ch) => ch.groups.some((g) => g.modules.some((m) => completedModuleIds.has(m.code)))).length,
    [chapters, completedModuleIds],
  );

  const toggleChapter = (code: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
        >
          &larr; Back to Start Teaching
        </Link>
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Sign in to view this student</h3>
          <p className="text-sm text-gray-700">
            Anonymous visitors can explore the curriculum, but individual student profiles
            require a sign-in to view progress and assessments.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('padi-open-signin'))}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Sign in
            </button>
            <Link
              href="/teacher/curriculum"
              className="inline-flex items-center text-sm text-blue-700 font-semibold hover:underline self-center"
            >
              Browse curriculum and modules →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Link
          href="/teacher"
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          &larr; Back to Start Teaching
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Student not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/teacher"
        className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
      >
        &larr; Back to Start Teaching
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold">
            {avatarInitials}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Teaching {student.name}
            </h2>
            <p className="text-sm text-gray-600">
              {chaptersStarted} of {chapters.length} chapters started
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
              statusBadgeClass(student.assessmentStatus),
            )}
          >
            {student.assessmentStatus}
          </span>
          <span className="text-sm text-gray-700">
            {assessmentStatusCaption(student.assessmentStatus)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {formatProgressLabel({ completedCount, totalCount }).label}
            </span>
            <span className="font-semibold text-gray-900">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {formatProgressLabel({ completedCount, totalCount }).intent === 'error' && (
            <p className="text-sm text-gray-500">
              Curriculum hasn&apos;t loaded yet &mdash; try refreshing the page.
            </p>
          )}
        </div>
      </div>

      {allComplete && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm text-sm text-green-800 font-semibold">
          All modules complete for {student.name}!
        </div>
      )}

      {/* Chapter accordion */}
      <div className="space-y-3">
        {chapters.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            No curriculum available yet.
          </div>
        )}
        {chapters.map((ch) => {
          const isExpanded = expandedChapters.has(ch.code);
          const chCompleted = ch.groups.reduce((s, g) => s + g.completedCount, 0);
          const chTotal = ch.groups.reduce((s, g) => s + g.totalCount, 0);
          const chAllDone = chCompleted === chTotal && chTotal > 0;
          const chProgress = formatProgressLabel({ completedCount: chCompleted, totalCount: chTotal });
          const chGroupSuffix = `across ${ch.groups.length} group${ch.groups.length !== 1 ? 's' : ''}`;
          const chLabel = chProgress.intent === 'error'
            ? chProgress.label
            : `${chProgress.label} ${chGroupSuffix}`;

          return (
            <div key={ch.code} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleChapter(ch.code)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {chAllDone ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      &#10003;
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                      {isExpanded ? '\u25BC' : '\u25B6'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ch.title}</p>
                    <p className="text-xs text-gray-600">
                      {chLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${chAllDone ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${chTotal > 0 ? Math.round((chCompleted / chTotal) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {chTotal > 0 ? Math.round((chCompleted / chTotal) * 100) : 0}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  {ch.groups.map((g) => {
                    const gAllDone = g.completedCount === g.totalCount && g.totalCount > 0;
                    const chapterCode = groupToChapterCode[g.code] || ch.code;
                    const gProgress = formatProgressLabel({ completedCount: g.completedCount, totalCount: g.totalCount });
                    const gAbbreviated = gProgress.intent === 'error'
                      ? '—'
                      : `${g.completedCount}/${g.totalCount}`;

                    return (
                      <div key={g.code} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">{g.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {gAbbreviated}
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${gAllDone ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${g.totalCount > 0 ? Math.round((g.completedCount / g.totalCount) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {g.modules.map((mod, idx) => {
                            const isCompleted = completedModuleIds.has(mod.code);
                            // Find the first incomplete module across the entire group
                            const firstIncompleteIdx = g.modules.findIndex((m) => !completedModuleIds.has(m.code));
                            const isCurrent = idx === firstIncompleteIdx;
                            const isUpcoming = !isCompleted && !isCurrent;
                            const lessonHref = `/teacher/curriculum/${chapterCode}/${g.code}/${mod.code}?student=${studentId}`;

                            return (
                              <div
                                key={mod.id}
                                className={`rounded-xl border p-3 ${
                                  isCurrent
                                    ? 'border-blue-300 bg-blue-50'
                                    : isCompleted
                                      ? 'border-green-200 bg-green-50/50'
                                      : 'border-gray-100 bg-white opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                                        isCompleted
                                          ? 'bg-green-100 text-green-700'
                                          : isCurrent
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      {isCompleted ? '\u2713' : idx + 1}
                                    </div>
                                    <div>
                                      <p
                                        className={`text-sm font-semibold ${
                                          isCompleted ? 'text-green-800' : isUpcoming ? 'text-gray-400' : 'text-gray-900'
                                        }`}
                                      >
                                        {mod.title}
                                      </p>
                                      {mod.summary && (
                                        <p className={`text-xs ${isUpcoming ? 'text-gray-300' : 'text-gray-600'}`}>
                                          {mod.summary}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isCompleted && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                        Completed
                                      </span>
                                    )}
                                    {isCurrent && (
                                      <Link
                                        href={lessonHref}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                      >
                                        {completedCount === 0 ? 'Start Teaching' : 'Continue Lesson'}
                                      </Link>
                                    )}
                                    {isUpcoming && (
                                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-400">
                                        Upcoming
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
