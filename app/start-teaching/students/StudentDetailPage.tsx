'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';
import { getStudentPreviewDetail } from '@/lib/startTeaching/preview/mapDemoToStartTeachingPreview';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { parseProgressLabel } from '@/lib/startTeaching/preview/mapDemoToStartTeachingPreview';

const computeCoursePercent = (student: { progressPercent: number; progressLabel?: string | null }) => {
  const parsed = parseProgressLabel(student.progressLabel || null);
  if (parsed) return Math.round((parsed.completed / parsed.total) * 100);
  return Math.round(student.progressPercent || 0);
};

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const { isHydrated, isLoggedIn } = useAuth();
  const { mode, students } = useStartTeachingData();
  const searchParams = useSearchParams();
  const backTo = searchParams?.get('back') || '/start-teaching';

  const liveStudent = students.find(s => s.id === studentId);
  const detail = mode === 'preview' ? getStudentPreviewDetail(demoTeacherData, studentId) : null;

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

  const coursePercent =
    mode === 'preview' ? detail?.courseProgressPercent ?? 0 : computeCoursePercent(liveStudent!);
  const avatarInitials =
    mode === 'preview'
      ? detail?.avatarInitials
      : (liveStudent?.name || 'S')
          .split(' ')
          .map(part => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        This is demo data. Sign in to manage your own students and groups.
      </div>

      <Link href={backTo} className="text-sm text-gray-700 hover:text-gray-900">
        ← Back
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold">
              {avatarInitials}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{mode === 'preview' ? detail?.name : liveStudent?.name}</p>
              <p className="text-xs text-gray-600">
                {mode === 'preview' ? detail?.currentPhase : liveStudent?.phase || 'Phase 1'} •{' '}
                {mode === 'preview' ? detail?.currentArea : liveStudent?.focusAreas?.[0] || 'Learning Sensorially'}
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

      {mode === 'preview' && detail && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Phase progress</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {detail.phases.map(phase => (
                <div key={phase.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{phase.name}</p>
                    <p className="text-xs text-gray-600">{phase.percent}%</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Completed: {phase.completed} · In progress: {phase.inProgress} · Not started: {phase.notStarted}
                  </p>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-2 bg-blue-600" style={{ width: `${phase.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Phase 1 sections</h3>
            <div className="space-y-3">
              {detail.sections.map(section => (
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
