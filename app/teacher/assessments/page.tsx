'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-store';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { demoAssessments } from '@/lib/demo/demoAssessments';

export default function AssessmentsPage() {
  const { isLoggedIn, isHydrated } = useAuth();
  const mode = isLoggedIn ? 'live' : 'preview';
  const rows = mode === 'preview' ? demoAssessments : [];

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

      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Student</span>
            <span>Group</span>
            <span>Focus areas</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-gray-100">
            {rows.map(row => (
              <div key={row.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{row.studentName}</p>
                  <p className="text-xs text-gray-600">{row.phase} • {row.progressLabel}</p>
                </div>
                <div className="text-sm text-gray-800">{row.groupName}</div>
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
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">No assessments yet</h3>
          <p className="text-sm text-gray-700">
            Once you log in and start teaching, capture assessment status for each student to unlock grouping and progress recommendations.
          </p>
          <Link href="/teacher/phases" className="text-sm font-semibold text-blue-700 hover:underline">
            Browse lessons to get started →
          </Link>
        </div>
      )}
    </div>
  );
}
