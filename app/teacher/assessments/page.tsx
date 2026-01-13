'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-store';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { EmptyStateStartTeachingCTA } from '@/components/EmptyStateStartTeachingCTA';
import { demoAssessments } from '@/lib/demo/demoAssessments';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { supabaseClient } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';

type AssessmentRow = {
  id: string;
  studentName: string;
  groupId?: string | null;
  groupName?: string | null;
  phase?: string | null;
  status: string;
  focusAreas: string[];
  progressLabel?: string | null;
};

export default function AssessmentsPage() {
  const { isLoggedIn, isHydrated } = useAuth();
  const { mode: teachingMode } = useTeachingMode();
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const mode = isLoggedIn ? 'live' : 'preview';
  const showStartTeachingCta = mode === 'live' && rows.length === 0;

  useEffect(() => {
    const load = async () => {
      if (!isHydrated) return;
      if (mode === 'preview') {
        setRows(demoAssessments);
        return;
      }
      const sb = supabaseClient();
      const { data, error } = await sb.from('student').select('*').order('full_name');
      if (error || !data) {
        setRows([]);
        return;
      }
      setRows(
        data.map(row => ({
          id: row.id,
          studentName: row.full_name || 'Student',
          groupId: (row.group_id ?? row.groupId ?? null) as string | null,
          groupName: (row.group_name ?? row.groupName ?? null) as string | null,
          phase: (row.phase ?? row.phase_code ?? row.phaseCode ?? null) as string | null,
          status: (row.assessment_status ?? 'Not started') as string,
          focusAreas: Array.isArray(row.focus_areas) ? row.focus_areas : [],
          progressLabel: (row.progress_label ?? null) as string | null,
        }))
      );
    };
    load();
  }, [isHydrated, mode]);

  const individualRows = useMemo(() => rows.filter(r => !r.groupId), [rows]);
  const groupRows = useMemo(() => rows.filter(r => !!r.groupId), [rows]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Assessments</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              {mode === 'preview'
                ? 'Preview how assessment tracking will look once you log in.'
                : 'Capture assessment status for each student.'}
            </p>
            {mode === 'preview' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Demo data
              </span>
            )}
          </div>
        </div>
        <TeachingModeToggle />
      </div>

      {mode === 'preview' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Read-only preview: sign in to record live assessment results.
        </div>
      )}

      {renderTable('Individual Students', individualRows, teachingMode === 'individual' || teachingMode === 'both', false, showStartTeachingCta)}
      {renderTable('Group Students', groupRows, teachingMode === 'group' || teachingMode === 'both', true, showStartTeachingCta)}
    </div>
  );
}

function renderTable(
  title: string,
  rows: AssessmentRow[],
  shouldShow: boolean,
  showGroupName = false,
  showStartTeachingCta = false
) {
  if (!shouldShow) return null;
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-700">No assessments yet in this view.</p>
        {showStartTeachingCta && <EmptyStateStartTeachingCTA />}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Student</span>
          <span>{showGroupName ? 'Group' : 'Phase'}</span>
          <span>Focus areas</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map(row => (
            <div key={row.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{row.studentName}</p>
                <p className="text-xs text-gray-600">{row.phase || 'Phase 1'} • {row.progressLabel || 'Not started'}</p>
              </div>
              <div className="text-sm text-gray-800">{showGroupName ? (row.groupName || 'Unassigned') : (row.phase || 'Phase')}</div>
              <div className="flex flex-wrap gap-1">
                {row.focusAreas.map(tag => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                <span
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    row.status === 'Ready for review'
                      ? 'bg-green-100 text-green-800'
                      : row.status === 'Not started'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
