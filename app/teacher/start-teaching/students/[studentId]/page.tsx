'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';

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
  const { isLoggedIn, isHydrated } = useAuth();
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
  const [loading, setLoading] = useState(true);

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
      const phaseCode = pc;

      const { data: groups } = await sb.rpc('content_get_groups', {
        p_phase_code: phaseCode,
        p_teaching_mode: null,
      });

      const groupRows = (groups as GroupRow[] | null) || [];
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
  }, [studentId, isHydrated, isLoggedIn]);

  const avatarInitials = useMemo(() => {
    if (!student) return 'S';
    return (student.name || 'S')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [student]);

  const completedCount = 0; // Real tracking comes in KAN-50/52
  const totalCount = modules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          ← Back to Start Teaching
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
        ← Back to Start Teaching
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
              {student.phase} — {groupTitle || student.focusAreas[0]}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {completedCount} of {totalCount} lessons complete
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

      {/* Lesson list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
        {modules.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
            No lessons available for this module yet.
          </div>
        )}
        <div className="space-y-2">
          {modules.map((mod, idx) => (
            <Link
              key={mod.id}
              href={`/teacher/phases/${phaseCode}/areas/${groupCode}/modules/${mod.code}`}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center justify-between hover:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {mod.title}
                  </p>
                  {mod.summary && (
                    <p className="text-xs text-gray-600">{mod.summary}</p>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                Not started
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
