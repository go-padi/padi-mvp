'use client';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';

export default function GroupPreviewPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const { isHydrated } = useAuth();
  const { students, groups } = useStartTeachingData();

  const group = groups.find(g => g.id === groupId);
  const groupStudents = students.filter(s => group?.studentIds.includes(s.id));

  const openSignIn = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('padi-open-signin'));
    }
  };

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Group not found</p>
          <Link href="/start-teaching" className="text-sm font-semibold text-blue-700 hover:underline">
            Back to Start Teaching
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        {PREVIEW_BANNER}
      </div>

      <Link href="/start-teaching" className="text-sm text-gray-700 hover:text-gray-900">
        ← Back to Start Teaching
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">{group.name}</p>
            <p className="text-xs text-gray-600">{groupStudents.length} {groupStudents.length === 1 ? 'student' : 'students'}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Group</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Students</h3>
          <button
            onClick={openSignIn}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Add Student
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {groupStudents.map(student => (
            <Link
              key={student.id}
              href={`/start-teaching/students/${student.id}?back=/start-teaching/groups/${group.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-600">{student.focusAreas[0] || 'Focus area'}</p>
                </div>
                <span className="text-xs font-semibold text-gray-800">{student.progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-2 bg-blue-600" style={{ width: `${student.progressPercent}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
