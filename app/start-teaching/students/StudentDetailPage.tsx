'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';
import { getStudentPreviewDetail } from '@/lib/startTeaching/preview/mapDemoToStartTeachingPreview';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { parseProgressLabel } from '@/lib/startTeaching/preview/mapDemoToStartTeachingPreview';
import type { SectionProgress, ProgressSummary, StudentPreviewDetail } from '@/lib/startTeaching/preview/types';
import type { StartTeachingStudent } from '@/lib/startTeaching/useStartTeachingData';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';

const computeCoursePercent = (student: { progressPercent: number; progressLabel?: string | null }) => {
  const parsed = parseProgressLabel(student.progressLabel || null);
  if (parsed) return Math.round((parsed.completed / parsed.total) * 100);
  return Math.round(student.progressPercent || 0);
};

const buildProgressSummaries = (progressPercent: number, progressLabel?: string | null): ProgressSummary[] => {
  const parsed = parseProgressLabel(progressLabel || null);
  const total = parsed?.total ?? 36;
  const completed = parsed?.completed ?? Math.round((progressPercent / 100) * total);
  const inProgress = completed > 0 && completed < total ? 1 : 0;
  const notStarted = total - completed - inProgress;
  return [
    {
      id: 'curriculum',
      name: 'Curriculum',
      completed,
      inProgress: Math.max(inProgress, 0),
      notStarted: Math.max(notStarted, 0),
      percent: total ? Math.round((completed / total) * 100) : 0,
    },
  ];
};

const buildSectionProgress = (focusAreas: string[], coursePercent: number): SectionProgress[] => {
  const sections = focusAreas.length ? focusAreas : ['Learning Sensorially'];
  return sections.map((name, idx) => {
    const status: SectionProgress['status'] =
      coursePercent >= 100 ? 'complete' : coursePercent > 0 ? 'in_progress' : 'not_started';
    return {
      id: `section-${idx}-${name}`,
      name,
      percent: status === 'complete' ? 100 : coursePercent,
      status,
      modules: [],
    };
  });
};

const buildLiveDetail = (student: StartTeachingStudent): StudentPreviewDetail => {
  const focusAreas = student.focusAreas?.length ? student.focusAreas : ['Learning Sensorially'];
  const coursePercent = computeCoursePercent({
    progressPercent: student.progressPercent,
    progressLabel: student.progressLabel,
  });
  return {
    id: student.id,
    name: student.name,
    avatarInitials: (student.name || 'S')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    currentStage: 'Curriculum',
    currentArea: focusAreas[0] || 'Learning Sensorially',
    progressPercent: student.progressPercent,
    courseProgressPercent: coursePercent,
    lessons: [],
    progressSummaries: buildProgressSummaries(student.progressPercent, student.progressLabel),
    sections: buildSectionProgress(focusAreas, coursePercent),
  };
};

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const { isHydrated } = useAuth();
  const { mode, students } = useStartTeachingData();
  const searchParams = useSearchParams();
  const backTo = searchParams?.get('back') || '/start-teaching';

  const liveStudent = students.find(s => s.id === studentId);
  const detail = mode === 'preview' ? getStudentPreviewDetail(demoTeacherData, studentId) : null;
  const liveDetail = mode === 'live' && liveStudent ? buildLiveDetail(liveStudent) : null;
  const detailModel = mode === 'preview' ? detail : liveDetail;

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  if (mode === 'live' && !liveStudent) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Student not found</p>
          <Link href={backTo} className="text-sm font-semibold text-blue-700 hover:underline">
            Back
          </Link>
        </div>
      </div>
    );
  }

  const coursePercent = detailModel?.courseProgressPercent ?? 0;
  const avatarInitials =
    detailModel?.avatarInitials ||
    (liveStudent?.name || 'S')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {mode === 'preview' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {PREVIEW_BANNER}
        </div>
      )}

      <Link href={backTo} className="text-sm text-gray-700 hover:text-gray-900">
        &larr; Back
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold">
              {avatarInitials}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{detailModel?.name || liveStudent?.name}</p>
              <p className="text-xs text-gray-600">
                {detailModel?.currentArea || liveStudent?.focusAreas?.[0] || 'Learning Sensorially'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Progress</p>
            <p className="text-sm font-semibold text-gray-900">{coursePercent}%</p>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-2 bg-blue-600" style={{ width: `${coursePercent}%` }} />
        </div>
      </div>

      {detailModel && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Overall progress</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {detailModel.progressSummaries.map(summary => (
                <div key={summary.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{summary.name}</p>
                    <p className="text-xs text-gray-600">{summary.percent}%</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Completed: {summary.completed} &middot; In progress: {summary.inProgress} &middot; Not started: {summary.notStarted}
                  </p>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-2 bg-blue-600" style={{ width: `${summary.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Curriculum sections</h3>
            <div className="space-y-3">
              {detailModel.sections.map(section => (
                <div key={section.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{section.name}</p>
                    <p className="text-xs text-gray-600">{section.percent}%</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-2 bg-blue-600" style={{ width: `${section.percent}%` }} />
                  </div>
                  {section.modules.length > 0 && (
                    <div className="space-y-2">
                      {section.modules.map(mod => (
                        <div
                          key={mod.id}
                          className="rounded-lg border border-gray-100 bg-white px-3 py-2 flex items-center justify-between"
                        >
                          <p className="text-sm font-semibold text-gray-900">{mod.title}</p>
                          <span className="text-xs text-gray-700 capitalize">{mod.status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
