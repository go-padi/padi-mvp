'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
import { useDefaultSubject } from '@/lib/startTeaching/useDefaultSubject';

type StudentRow = {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  phase: string | null;
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

const PHASE_CODE_MAP: Record<string, string> = {
  'Phase 1': 'K_P1',
  'Phase 2': 'K_P2',
  'Phase 3': 'K_P3',
};

export default function StudentModulePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const { ensureSubject } = useDefaultSubject();
  const [student, setStudent] = useState<{
    id: string;
    name: string;
    phase: string;
    focusAreas: string[];
    progressPercent: number;
    progressLabel: string | null;
    assessmentStatus: string;
  } | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [phaseCode, setPhaseCode] = useState('');
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompletions = useCallback(async (sid: string) => {
    const sb = supabaseClient();
    const { data } = await sb
      .from('module_assessments')
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
          'id,name,first_name,last_name,phase,focus_areas,progress_percent,progress_label,assessment_status',
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
        phase: studentRow.phase || 'Phase 1',
        focusAreas: Array.isArray(studentRow.focus_areas)
          ? studentRow.focus_areas
          : ['Learning Sensorially'],
        progressPercent: studentRow.progress_percent ?? 0,
        progressLabel: studentRow.progress_label ?? null,
        assessmentStatus: studentRow.assessment_status ?? 'Not started',
      };
      setStudent(s);

      const pc = PHASE_CODE_MAP[s.phase] || 'K_P1';
      setPhaseCode(pc);

      const [groupsRes] = await Promise.all([
        sb.rpc('content_get_groups', {
          p_phase_code: pc,
          p_teaching_mode: null,
        }),
        fetchCompletions(studentId),
      ]);

      const groupRows = (groupsRes.data as GroupRow[] | null) || [];
      const matchingGroup =
        groupRows.find((g) => g.title === s.focusAreas[0]) || groupRows[0];

      if (matchingGroup) {
        setGroupTitle(matchingGroup.title);
        setGroupCode(matchingGroup.code);

        const { data: mods } = await sb.rpc('content_get_modules', {
          p_group_code: matchingGroup.code,
          p_teaching_mode: matchingGroup.teaching_mode,
        });

        const moduleRows = (mods as ModuleRow[] | null) || [];
        setModules(
          moduleRows.sort(
            (a, b) => (a.display_order || 0) - (b.display_order || 0),
          ),
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [studentId, isHydrated, isLoggedIn, fetchCompletions]);

  const avatarInitials = useMemo(() => {
    if (!student) return 'S';
    return (student.name || 'S')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [student]);

  const currentModuleIdx = useMemo(() => {
    return modules.findIndex((m) => !completedModuleIds.has(m.code));
  }, [modules, completedModuleIds]);

  const completedCount = useMemo(
    () => modules.filter((m) => completedModuleIds.has(m.code)).length,
    [modules, completedModuleIds],
  );
  const totalCount = modules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleMarkDone = async (moduleCode: string) => {
    if (!tenantId || marking) return;
    setMarking(true);
    try {
      const subjectId = await ensureSubject(tenantId);
      if (!subjectId) return;
      const sb = supabaseClient();
      await sb.from('module_assessments').upsert(
        {
          tenant_id: tenantId,
          student_id: studentId,
          subject_id: subjectId,
          module_id: moduleCode,
          notes: 'Completed',
        },
        { onConflict: 'tenant_id,student_id,subject_id,module_id' },
      );
      await fetchCompletions(studentId);
    } finally {
      setMarking(false);
    }
  };

  if (!isHydrated || loading) {
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

  const allComplete = completedCount === totalCount && totalCount > 0;

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
              {student.phase} &mdash; {groupTitle || student.focusAreas[0]}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {completedCount} of {totalCount} modules complete
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
        </div>
      </div>

      {allComplete && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm text-sm text-green-800 font-semibold">
          All modules complete for {student.name}!
        </div>
      )}

      {/* Module list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
        {modules.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            No modules available yet.
          </div>
        )}
        <div className="space-y-2">
          {modules.map((mod, idx) => {
            const isCompleted = completedModuleIds.has(mod.code);
            const isCurrent = idx === currentModuleIdx;
            const isUpcoming = !isCompleted && !isCurrent;
            const lessonHref = `/teacher/phases/${phaseCode}/areas/${groupCode}/modules/${mod.code}`;

            return (
              <div
                key={mod.id}
                className={`rounded-xl border p-4 shadow-sm ${
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
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
                      <>
                        <Link
                          href={lessonHref}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {completedCount === 0 ? 'Start Teaching' : 'Continue Teaching'}
                        </Link>
                        <button
                          onClick={() => handleMarkDone(mod.code)}
                          disabled={marking}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {marking ? 'Saving...' : 'Mark Done'}
                        </button>
                      </>
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
    </div>
  );
}
