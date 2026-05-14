'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-store';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { demoGroups, demoStudentsByGroup } from '@/lib/demo/demoGroups';
import { demoStudents } from '@/lib/demo/demoStudents';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useGroupingProgressData } from '@/lib/hooks/useGroupingProgressData';
import { EmptyStateStartTeachingCTA } from '@/components/EmptyStateStartTeachingCTA';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';

export default function GroupingPage() {
  const { isLoggedIn, isHydrated } = useAuth();
  const { mode } = useTeachingMode();
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const showGroupMode = mode === 'both' || mode === 'group';
  const showStudentMode = mode === 'both' || mode === 'individual';
  const { data, isLoading, error, refetch } = useGroupingProgressData({
    enabled: dataMode === 'live' && isHydrated,
  });
  const liveGroups = data?.groups || [];
  const liveStudents = useMemo(() => data?.students || [], [data?.students]);
  const liveMemberships = useMemo(() => data?.memberships || [], [data?.memberships]);
  const studentsByGroupId = data?.studentsByGroupId || {};
  const groupStudentCounts = data?.groupStudentCounts || {};
  const showStartTeachingCta = dataMode === 'live' && !isLoading && !error && liveStudents.length === 0;
  const assignedStudentIds = useMemo(() => {
    return new Set(liveMemberships.filter(m => m.active !== false).map(m => m.studentId));
  }, [liveMemberships]);
  const individualStudents = useMemo(() => {
    return liveStudents.filter(student => !assignedStudentIds.has(student.id));
  }, [liveStudents, assignedStudentIds]);

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
          {PREVIEW_BANNER}
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
                    <p className="text-xs text-gray-600">{g.focus}</p>
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
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Individual Students</h3>
            <p className="text-sm text-gray-700">Students not currently assigned to a group.</p>
            <div className="grid gap-3 md:grid-cols-3">
              {demoStudents.filter(s => !s.groupId).map(student => (
                <div key={student.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">Individual</span>
                  </div>
                  <p className="text-xs text-gray-600">{student.progressLabel}</p>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Grouped Students</h3>
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
                      <div key={student.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{g.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{student.progressLabel}</p>
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
        </div>
      )}

      {dataMode === 'live' && (
        <div className="space-y-6">
          {isLoading && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
              Loading live grouping data...
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm text-sm text-red-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Unable to load grouping data.</p>
                <p className="text-xs text-red-700">{error.message}</p>
              </div>
              <button
                onClick={refetch}
                className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}
          {showStartTeachingCta && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <EmptyStateStartTeachingCTA />
            </div>
          )}
          {!isLoading && !error && showGroupMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Groups</h3>
                  <p className="text-sm text-gray-700">Live group rosters and student counts.</p>
                </div>
              </div>
              {liveGroups.length ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {liveGroups.map(group => {
                    const studentCount = groupStudentCounts[group.id] ?? 0;
                    const status = studentCount > 0 ? 'Active' : 'Empty';
                    return (
                      <div key={group.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                            <p className="text-xs text-gray-600">Group</p>
                          </div>
                          <span
                            className={clsx(
                              'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                              status === 'Empty' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
                            )}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">Progress data will appear once assessments are captured.</p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Students</span>
                          <span className="font-semibold text-gray-900">{studentCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
                  No groups yet. Add students to create your first group.
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && showStudentMode && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Individual Students</h3>
                <p className="text-sm text-gray-700">Students not currently assigned to a group.</p>
                {individualStudents.length ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {individualStudents.map(student => (
                      <Link
                        key={student.id}
                        href={`/start-teaching/students/${student.id}?back=/teacher/grouping`}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">Individual</span>
                        </div>
                        <p className="text-xs text-gray-600">Progress data coming soon.</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
                    No unassigned students yet.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Grouped Students</h3>
                    <p className="text-sm text-gray-700">Students organized by their current group.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {liveGroups.length ? (
                    liveGroups.map(group => {
                      const groupStudents = studentsByGroupId[group.id] || [];
                      const studentCount = groupStudentCounts[group.id] ?? 0;
                      return (
                        <div key={group.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                              <p className="text-xs text-gray-600">{studentCount} {studentCount === 1 ? 'student' : 'students'}</p>
                            </div>
                            <span className="text-xs text-gray-600">Active roster</span>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            {groupStudents.length ? (
                              groupStudents.map(student => (
                                <Link
                                  key={student.id}
                                  href={`/start-teaching/students/${student.id}?back=/teacher/grouping`}
                                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{group.name}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">Progress data coming soon.</p>
                                </Link>
                              ))
                            ) : (
                              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-sm text-gray-700">
                                No students assigned yet.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
                      No groups yet. Create a group to see students here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
