'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function dedupByTitle<T extends { title: string; code?: string }>(
  items: T[],
  kind: 'chapter' | 'group' | 'module',
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[LR-09b] dropped duplicate ${kind} '${item.title}' (code '${item.code ?? '<no code>'}')`,
        );
      }
      continue;
    }
    seen.add(key);
    out.push(item);
  }
  return out;
}

export default function StudentModulePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const pathname = usePathname();
  const lastFetchAtRef = useRef(0);
  const mountedRef = useRef(false);
  const prevCompletedCountRef = useRef(0);
  const [countJustChanged, setCountJustChanged] = useState(false);
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
  const [latestObservation, setLatestObservation] = useState<{
    completed_at: string;
    notes: string | null;
    module_id: string;
  } | null>(null);
  const [memberships, setMemberships] = useState<
    { group_id: string; group_name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [disabledClickHintModule, setDisabledClickHintModule] = useState<string | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHint = useCallback((moduleCode: string) => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setDisabledClickHintModule(moduleCode);
    hintTimeoutRef.current = setTimeout(() => {
      setDisabledClickHintModule(null);
      hintTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

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

  const fetchData = useCallback(async () => {
    if (!isHydrated || !isLoggedIn) return;
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

    // KAN-64: fetch active group memberships + group names
    if (!tenantId) {
      setMemberships([]);
    } else {
      try {
        const { data: embedded, error: embedErr } = await sb
          .from('student_group_memberships')
          .select('group_id, groups(name)')
          .eq('tenant_id', tenantId)
          .eq('student_id', studentId)
          .eq('active', true);
        if (embedErr) throw embedErr;
        const rows = (embedded || []) as {
          group_id: string;
          groups: { name: string | null } | { name: string | null }[] | null;
        }[];
        const hasNames = rows.some((r) => {
          const g = Array.isArray(r.groups) ? r.groups[0] : r.groups;
          return !!g?.name;
        });
        if (rows.length === 0 || hasNames) {
          setMemberships(
            rows.map((r) => {
              const g = Array.isArray(r.groups) ? r.groups[0] : r.groups;
              return {
                group_id: r.group_id,
                group_name: g?.name || 'Unknown group',
              };
            }),
          );
        } else {
          // FK not wired — fall back to a 2-query lookup
          const groupIds = rows.map((r) => r.group_id);
          const { data: groupsData, error: groupsErr } = await sb
            .from('groups')
            .select('id,name')
            .eq('tenant_id', tenantId)
            .in('id', groupIds);
          if (groupsErr) throw groupsErr;
          const nameById = new Map<string, string | null>(
            ((groupsData || []) as { id: string; name: string | null }[]).map(
              (g) => [g.id, g.name],
            ),
          );
          setMemberships(
            groupIds.map((id) => ({
              group_id: id,
              group_name: nameById.get(id) || 'Unknown group',
            })),
          );
        }
      } catch (err) {
        console.error('KAN-64 load memberships:', err);
        setMemberships([]);
      }
    }

    if (!tenantId) {
      setLatestObservation(null);
    } else {
      try {
        const { data, error } = await sb
          .from('lesson_completions')
          .select('completed_at, notes, module_id')
          .eq('tenant_id', tenantId)
          .eq('student_id', studentId)
          .order('completed_at', { ascending: false })
          .limit(1);
        if (error) throw error;
        const row = (data || [])[0] as
          | { completed_at: string; notes: string | null; module_id: string }
          | undefined;
        setLatestObservation(row || null);
      } catch (err) {
        const pgCode = (err as { code?: string } | null)?.code;
        if (pgCode !== '42703') {
          console.error('LR-13d load latestObservation:', err);
        }
        setLatestObservation(null);
      }
    }

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

    const builtChapters: ChapterWithGroups[] = dedupByTitle(
      previewChapters
        .filter((ch) => chapterGroupMap.has(ch.code))
        .map((ch) => {
          const rawGroups = chapterGroupMap.get(ch.code) || [];
          const dedupedGroups = dedupByTitle(rawGroups, 'group').map((g) => ({
            ...g,
            modules: dedupByTitle(g.modules, 'module'),
          }));
          const groupsWithRecomputedCounts = dedupedGroups.map((g) => ({
            ...g,
            completedCount: g.modules.filter((m) => completionIds.has(m.code)).length,
            totalCount: g.modules.length,
          }));
          return {
            code: ch.code,
            title: ch.title,
            description: ch.description,
            groups: groupsWithRecomputedCounts,
          };
        }),
      'chapter',
    );

    setChapters(builtChapters);

    // Default expand: first chapter with incomplete modules
    const firstIncomplete = builtChapters.find((ch) =>
      ch.groups.some((g) => g.completedCount < g.totalCount),
    );
    if (firstIncomplete) {
      setExpandedChapters(new Set([firstIncomplete.code]));
    }

    setLoading(false);
  }, [studentId, isHydrated, isLoggedIn, tenantId, fetchCompletions]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    lastFetchAtRef.current = Date.now();
    fetchData().finally(() => {
      mountedRef.current = true;
      // KAN-154: the lesson page sets this flag in markComplete right before
      // router.push back here. Because that nav is a fresh mount, the pulse
      // effect's mountedRef gate would suppress the emerald flash without an
      // explicit signal. Consume the flag, fire the pulse once, and clear it.
      try {
        if (typeof window !== 'undefined') {
          const key = `padi:pulse-pending:${studentId}`;
          if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            setCountJustChanged(true);
            setTimeout(() => setCountJustChanged(false), 220);
          }
        }
      } catch {
        // sessionStorage may be unavailable (private mode, SSR edge); ignore.
      }
    });
  }, [fetchData, isHydrated, isLoggedIn, pathname, studentId]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;

    const maybeRefetch = () => {
      if (!mountedRef.current) return;
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchAtRef.current < 1000) return;
      lastFetchAtRef.current = Date.now();
      fetchData();
    };

    const onFocus = () => {
      if (!mountedRef.current) return;
      if (Date.now() - lastFetchAtRef.current < 1000) return;
      lastFetchAtRef.current = Date.now();
      fetchData();
    };

    document.addEventListener('visibilitychange', maybeRefetch);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', maybeRefetch);
      window.removeEventListener('focus', onFocus);
    };
  }, [isHydrated, isLoggedIn, fetchData]);

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

  useEffect(() => {
    if (!mountedRef.current) {
      prevCompletedCountRef.current = completedCount;
      return;
    }
    if (completedCount > prevCompletedCountRef.current) {
      setCountJustChanged(true);
      const t = setTimeout(() => setCountJustChanged(false), 220);
      prevCompletedCountRef.current = completedCount;
      return () => clearTimeout(t);
    }
    prevCompletedCountRef.current = completedCount;
  }, [completedCount]);

  const totalCount = allModules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const chaptersStarted = useMemo(
    () => chapters.filter((ch) => ch.groups.some((g) => g.modules.some((m) => completedModuleIds.has(m.code)))).length,
    [chapters, completedModuleIds],
  );

  const nextModule = useMemo(() => {
    for (const ch of chapters) {
      for (const g of ch.groups) {
        for (const mod of g.modules) {
          if (!completedModuleIds.has(mod.code)) {
            return {
              chapterCode: groupToChapterCode[g.code] || ch.code,
              chapterTitle: ch.title,
              groupCode: g.code,
              moduleCode: mod.code,
              moduleTitle: mod.title,
              moduleSubtitle: mod.subtitle,
            };
          }
        }
      }
    }
    return null;
  }, [chapters, completedModuleIds]);

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
              <span
                className={clsx(
                  'inline-block rounded px-1 transition-colors duration-200',
                  countJustChanged && 'bg-emerald-100',
                )}
              >
                {formatProgressLabel({ completedCount, totalCount }).label}
              </span>
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

      {memberships.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memberships.map((m) => (
            <span
              key={m.group_id}
              className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
            >
              Group: {m.group_name}
            </span>
          ))}
        </div>
      )}

      {latestObservation && latestObservation.notes?.trim() && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Latest observation · {new Date(latestObservation.completed_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-amber-900 line-clamp-3 whitespace-pre-wrap">
            {latestObservation.notes}
          </p>
        </div>
      )}

      {(!latestObservation || !latestObservation.notes?.trim()) && completedCount > 0 && !loading && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Observations
          </p>
          <p className="text-sm text-gray-700">
            Add a note after your next lesson and it will appear here.
          </p>
        </div>
      )}

      {nextModule && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Next up
            </p>
            <p className="text-base font-semibold text-gray-900">
              {nextModule.chapterTitle} — {nextModule.moduleTitle}
            </p>
            {nextModule.moduleSubtitle && (
              <p className="text-sm text-gray-700">{nextModule.moduleSubtitle}</p>
            )}
          </div>
          <Link
            href={`/teacher/curriculum/${nextModule.chapterCode}/${nextModule.groupCode}/${nextModule.moduleCode}?student=${studentId}`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start lesson
          </Link>
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
                            const isNextUp = nextModule !== null && mod.code === nextModule.moduleCode;
                            const isOffSequence = !isCompleted && !isNextUp;
                            const lessonHref = `/teacher/curriculum/${chapterCode}/${g.code}/${mod.code}?student=${studentId}`;

                            return (
                              <div key={mod.id} className="space-y-1">
                                <div
                                  className={`rounded-xl border p-3 ${
                                    isNextUp
                                      ? 'border-blue-300 bg-blue-50'
                                      : isCompleted
                                        ? 'border-green-200 bg-green-50/50'
                                        : 'border-gray-100 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                                          isCompleted
                                            ? 'bg-green-100 text-green-700'
                                            : isNextUp
                                              ? 'bg-blue-100 text-blue-700'
                                              : 'bg-gray-100 text-gray-400'
                                        }`}
                                      >
                                        {isCompleted ? '\u2713' : idx + 1}
                                      </div>
                                      <div>
                                        <p
                                          className={`text-sm font-semibold ${
                                            isCompleted ? 'text-green-800' : isOffSequence ? 'text-gray-400' : 'text-gray-900'
                                          }`}
                                        >
                                          {mod.title}
                                        </p>
                                        {mod.summary && (
                                          <p className={`text-xs ${isOffSequence ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {mod.summary}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isCompleted && (
                                        <Link
                                          href={lessonHref}
                                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                                        >
                                          Replay
                                        </Link>
                                      )}
                                      {isNextUp && (
                                        <Link
                                          href={lessonHref}
                                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                          {completedCount === 0 ? 'Start Teaching' : 'Continue Lesson'}
                                        </Link>
                                      )}
                                      {isOffSequence && nextModule && (
                                        <button
                                          type="button"
                                          aria-disabled="true"
                                          title={`Continue with ${nextModule.chapterTitle} \u2014 ${nextModule.moduleTitle} first`}
                                          onClick={() => triggerHint(mod.code)}
                                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-not-allowed"
                                        >
                                          Start
                                        </button>
                                      )}
                                      {isOffSequence && !nextModule && !allComplete && (
                                        <Link
                                          href={lessonHref}
                                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                          Start Teaching
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {disabledClickHintModule === mod.code && nextModule && (
                                  <p className="mt-1 text-xs text-gray-600">
                                    Continue with {nextModule.chapterTitle} — {nextModule.moduleTitle} first
                                  </p>
                                )}
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
