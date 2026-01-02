'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-store';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { demoGroups, demoStudentsByGroup } from '@/lib/demo/demoGroups';
import { useTeachingMode } from '@/lib/teachingModeContext';

export default function GroupingPage() {
  const { isLoggedIn, isHydrated } = useAuth();
  const { mode } = useTeachingMode();
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const showGroupMode = mode === 'both' || mode === 'group';
  const showStudentMode = mode === 'both' || mode === 'individual';

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Grouping & Progress</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              {dataMode === 'demo'
                ? 'Preview how groups and student progress will look once you log in.'
                : 'Track live groupings and progress as you teach.'}
            </p>
            {dataMode === 'demo' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Demo data
              </span>
            )}
          </div>
        </div>
        <TeachingModeToggle />
      </div>

      {dataMode === 'demo' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Read-only preview: log in to manage real groups and progress notes.
        </div>
      )}

      {dataMode === 'demo' && showGroupMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Groups</h3>
              <p className="text-sm text-gray-700">Recommended groupings with focus areas and average progress.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {demoGroups.map(g => (
              <div key={g.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-600">{g.phase}</p>
                  </div>
                  <span
                    className={clsx(
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      g.status === 'Not started' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
                    )}
                  >
                    {g.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{g.focus}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{g.progressLabel}</span>
                  <span className="font-semibold text-gray-900">{g.progressPercent}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dataMode === 'demo' && showStudentMode && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Students</h3>
              <p className="text-sm text-gray-700">Students organized by their current group.</p>
            </div>
          </div>
          <div className="space-y-3">
            {demoGroups.map(g => (
              <div key={g.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-600">{g.focus}</p>
                  </div>
                  <span className="text-xs text-gray-600">{g.progressLabel}</span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {(demoStudentsByGroup[g.id] || []).map(student => (
                    <div key={student.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                        <span className="text-xs text-gray-600">{student.progressLabel}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.focusAreas.map(tag => (
                          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dataMode === 'live' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Live grouping coming soon</h3>
          <p className="text-sm text-gray-700">
            When you add students and capture assessments, grouping recommendations and progress views will appear here.
          </p>
          <Link href="/teacher/phases" className="text-sm font-semibold text-blue-700 hover:underline">
            Launch a lesson to begin tracking →
          </Link>
        </div>
      )}
    </div>
  );
}
